import puppeteer from 'puppeteer';
import {
  PDFDocument,
  PDFContentStream,
  PDFOperator,
  PDFOperatorNames as Ops,
  PDFNumber,
  PDFName,
  PDFHexString,
  PDFRef,
} from 'pdf-lib';
import * as fs from 'fs';
import * as path from 'path';
import { measureChapterPages, buildTocHtml, TocEntry } from './toc';
import { buildHtml } from './template';
import type { Chapter } from './chapters';

function pdfUtf16Hex(text: string): PDFHexString {
  let hex = 'FEFF';
  for (let i = 0; i < text.length; i++) {
    hex += text.charCodeAt(i).toString(16).padStart(4, '0');
  }
  return PDFHexString.of(hex);
}

const PAGE_W = '6in';
const PAGE_H = '9in';
const MARGIN_V = '0.75in';

const MARGINS = {
  top: MARGIN_V,
  right: '0',
  bottom: MARGIN_V,
  left: '0',
};

const HEADER_TEMPLATE = '<div></div>';

const FOOTER_TEMPLATE = `
  <div style="
    width: 100%;
    text-align: center;
    font-family: 'Courier New', monospace;
    font-size: 9pt;
    color: #00aaaa;
  ">
    <span class="pageNumber"></span>
  </div>
`;

function paintBlueBackground(doc: PDFDocument): void {
  const ctx = doc.context;

  for (const page of doc.getPages()) {
    const { width, height } = page.getSize();

    const bgOps = [
      PDFOperator.of(Ops.PushGraphicsState),
      PDFOperator.of(Ops.NonStrokingColorRgb, [
        PDFNumber.of(0),
        PDFNumber.of(0),
        PDFNumber.of(0x80 / 255),
      ]),
      PDFOperator.of(Ops.AppendRectangle, [
        PDFNumber.of(0),
        PDFNumber.of(0),
        PDFNumber.of(width),
        PDFNumber.of(height),
      ]),
      PDFOperator.of(Ops.FillNonZero),
      PDFOperator.of(Ops.PopGraphicsState),
    ];

    const bgStream = PDFContentStream.of(ctx.obj({}), bgOps);
    const bgRef = ctx.register(bgStream);

    const endStream = PDFContentStream.of(ctx.obj({}), []);
    const endRef = ctx.register(endStream);

    page.node.normalize();
    page.node.wrapContentStreams(bgRef, endRef);
  }
}

function addBookmarks(
  doc: PDFDocument,
  tocEntries: TocEntry[],
  pageOffset: number
): void {
  const ctx = doc.context;
  const pages = doc.getPages();

  const outlineRef = ctx.nextRef();
  const itemRefs: PDFRef[] = tocEntries.map(() => ctx.nextRef());

  for (let i = 0; i < tocEntries.length; i++) {
    const { title, page: pageNum } = tocEntries[i];
    const pageIndex = Math.min(pageNum - 1 + pageOffset, pages.length - 1);
    const pageRef = pages[pageIndex].ref;

    const item = ctx.obj({
      Type: 'Outlines',
      Title: pdfUtf16Hex(title),
      Parent: outlineRef,
      Dest: [pageRef, 'Fit'],
    });

    if (i > 0) item.set(PDFName.of('Prev'), itemRefs[i - 1]);
    if (i < tocEntries.length - 1) item.set(PDFName.of('Next'), itemRefs[i + 1]);

    ctx.assign(itemRefs[i], item);
  }

  const outlineDict = ctx.obj({
    Type: 'Outlines',
    First: itemRefs[0],
    Last: itemRefs[itemRefs.length - 1],
    Count: PDFNumber.of(tocEntries.length),
  });
  ctx.assign(outlineRef, outlineDict);

  doc.catalog.set(PDFName.of('Outlines'), outlineRef);
}

async function renderHtmlToPdfBytes(
  page: Awaited<ReturnType<Awaited<ReturnType<typeof puppeteer.launch>>['newPage']>>,
  html: string,
  options: Parameters<typeof page.pdf>[0]
): Promise<Buffer> {
  await page.setContent(html, { waitUntil: 'load' });
  return page.pdf(options) as Promise<Buffer>;
}

export async function generatePdf(
  chapters: Chapter[],
  coverImagePath: string | undefined,
  outputPath: string
): Promise<void> {
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const browser = await puppeteer.launch({ headless: true });

  try {
    const tab = await browser.newPage();

    const baseHtml = buildHtml(chapters);
    const tocEntries = await measureChapterPages(tab, baseHtml);
    const tocHtml = buildTocHtml(tocEntries);

    const contentHtml = buildHtml(chapters, tocHtml);

    const contentBytes = await renderHtmlToPdfBytes(tab, contentHtml, {
      width: PAGE_W,
      height: PAGE_H,
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: HEADER_TEMPLATE,
      footerTemplate: FOOTER_TEMPLATE,
      margin: MARGINS,
    });

    if (!coverImagePath || !fs.existsSync(coverImagePath)) {
      const doc = await PDFDocument.load(contentBytes);
      paintBlueBackground(doc);
      if (tocEntries.length > 0) addBookmarks(doc, tocEntries, 0);
      fs.writeFileSync(outputPath, await doc.save());
      return;
    }

    const base64 = fs.readFileSync(coverImagePath).toString('base64');
    const coverHtml = `<!DOCTYPE html>
<html><head><style>
  * { margin: 0; padding: 0; }
  html, body { width: 6in; height: 9in; overflow: hidden; }
  img { display: block; width: 6in; height: 9in; object-fit: fill; }
</style></head>
<body><img src="data:image/jpeg;base64,${base64}"/></body>
</html>`;

    const coverBytes = await renderHtmlToPdfBytes(tab, coverHtml, {
      width: PAGE_W,
      height: PAGE_H,
      printBackground: true,
      displayHeaderFooter: false,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    });

    const contentDoc = await PDFDocument.load(contentBytes);
    paintBlueBackground(contentDoc);

    const merged = await PDFDocument.create();

    const coverDoc = await PDFDocument.load(coverBytes);
    const [coverPage] = await merged.copyPages(coverDoc, [0]);
    merged.addPage(coverPage);

    const contentPages = await merged.copyPages(
      contentDoc,
      Array.from({ length: contentDoc.getPageCount() }, (_, i) => i)
    );
    contentPages.forEach((p) => merged.addPage(p));

    if (tocEntries.length > 0) addBookmarks(merged, tocEntries, 1);
    fs.writeFileSync(outputPath, await merged.save());
  } finally {
    await browser.close();
  }
}
