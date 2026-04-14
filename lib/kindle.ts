import JSZip from 'jszip';
import * as fs from 'fs';
import * as path from 'path';
import { Chapter } from './chapters';

const EPUB_CSS = `
body {
  font-family: 'Courier New', 'Courier', monospace;
  font-size: 1em;
  line-height: 1.7;
  color: #d0d0d0;
  background: #000080;
  margin: 0 4%;
}

h1 {
  font-size: 1.5em;
  font-weight: bold;
  text-align: center;
  letter-spacing: 0.04em;
  margin: 1.5em 0 0.4em;
  color: #00ffff;
  border-bottom: 2px solid #00aaaa;
  padding-bottom: 0.4em;
}

h3 {
  font-size: 0.88em;
  font-weight: normal;
  font-style: normal;
  text-align: center;
  color: #ffff55;
  margin: 0 0 1.5em;
  padding-bottom: 1em;
  border-bottom: 1px solid #005555;
}

h2 {
  font-size: 1em;
  font-weight: bold;
  font-variant: normal;
  letter-spacing: 0.08em;
  margin: 1.75em 0 0.5em;
  color: #ffff55;
}

p {
  text-indent: 1.5em;
  margin: 0;
  text-align: justify;
  color: #d0d0d0;
}

h1 + p, h2 + p, h3 + p, hr + p {
  text-indent: 0;
}

hr {
  border: none;
  text-align: center;
  margin: 1.5em 0;
}

hr::after {
  content: '═══════';
  color: #00aaaa;
  letter-spacing: 0.1em;
  font-size: 0.85em;
}

strong { font-weight: bold; color: #ffffff; }
em { font-style: italic; color: #aaaaff; }

blockquote {
  margin: 1em 1.5em;
  padding-left: 0.75em;
  border-left: 2px solid #00aaaa;
  font-style: italic;
  color: #aaaaaa;
}

blockquote p { text-indent: 0; color: #aaaaaa; }

pre {
  background: #000050;
  border: 1px solid #00aaaa;
  padding: 0.6em 0.8em;
  margin: 1em 0;
  font-size: 0.85em;
  line-height: 1.4;
  color: #00ffff;
  white-space: pre-wrap;
  word-wrap: break-word;
}

code {
  font-family: 'Courier New', monospace;
  color: #00ffff;
  background: #000050;
  padding: 0 0.2em;
}

pre code { background: none; padding: 0; }
`;

function extractTitle(html: string): string {
  const match = html.match(/<h1[^>]*>(.*?)<\/h1>/is);
  return match ? match[1].replace(/<[^>]+>/g, '').trim() : 'Untitled';
}

function chapterXhtml(html: string, cssPath: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en">
<head>
  <meta charset="UTF-8"/>
  <link rel="stylesheet" type="text/css" href="${cssPath}"/>
</head>
<body>
  ${html}
</body>
</html>`;
}

export async function generateEpub(
  chapters: Chapter[],
  coverPath: string,
  outputPath: string
): Promise<void> {
  const zip = new JSZip();

  zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });

  zip.folder('META-INF')!.file('container.xml', `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`);

  const oebps = zip.folder('OEBPS')!;

  oebps.folder('styles')!.file('ebook.css', EPUB_CSS);

  const coverData = fs.readFileSync(coverPath);
  oebps.folder('images')!.file('cover.jpg', coverData);

  const chapterFolder = oebps.folder('chapters')!;
  const chapterIds: string[] = [];
  const chapterTitles: string[] = [];

  chapters.forEach((ch, i) => {
    const id = `ch${String(i).padStart(2, '0')}`;
    const title = extractTitle(ch.html);
    chapterIds.push(id);
    chapterTitles.push(title);
    chapterFolder.file(
      `${id}.xhtml`,
      chapterXhtml(ch.html, '../styles/ebook.css')
    );
  });

  const manifestItems = [
    `<item id="cover-image" href="images/cover.jpg" media-type="image/jpeg" properties="cover-image"/>`,
    `<item id="stylesheet" href="styles/ebook.css" media-type="text/css"/>`,
    `<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>`,
    ...chapterIds.map(
      (id) => `<item id="${id}" href="chapters/${id}.xhtml" media-type="application/xhtml+xml"/>`
    ),
  ].join('\n    ');

  const spineItems = chapterIds
    .map((id) => `<itemref idref="${id}"/>`)
    .join('\n    ');

  oebps.file('content.opf', `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="uid">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="uid">agentic-harness-2026</dc:identifier>
    <dc:title>The Agentic Harness</dc:title>
    <dc:creator>Charlie Greenman</dc:creator>
    <dc:language>en</dc:language>
    <dc:rights>Copyright 2026 Charlie Greenman. CC BY-NC-ND 4.0.</dc:rights>
    <meta property="dcterms:modified">${new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')}</meta>
  </metadata>
  <manifest>
    ${manifestItems}
  </manifest>
  <spine>
    ${spineItems}
  </spine>
</package>`);

  const navItems = chapterIds
    .map((id, i) => `      <li><a href="chapters/${id}.xhtml">${chapterTitles[i]}</a></li>`)
    .join('\n');

  oebps.file('nav.xhtml', `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head><meta charset="UTF-8"/><title>Table of Contents</title></head>
<body>
  <nav epub:type="toc">
    <h1>Contents</h1>
    <ol>
${navItems}
    </ol>
  </nav>
</body>
</html>`);

  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const buffer = await zip.generateAsync({
    type: 'nodebuffer',
    mimeType: 'application/epub+zip',
  });

  fs.writeFileSync(outputPath, buffer);
}
