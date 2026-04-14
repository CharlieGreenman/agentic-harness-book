import type { Page } from 'puppeteer';

export interface TocEntry {
  title: string;
  page: number;
}

const CONTENT_H_PX = 684;
const COVER_PAGES = 1;
const TOC_PAGES = 1;

export async function measureChapterPages(
  page: Page,
  html: string
): Promise<TocEntry[]> {
  await page.setViewport({ width: 420, height: 864 });
  await page.setContent(html, { waitUntil: 'load' });

  const raw = await page.evaluate(() =>
    Array.from(document.querySelectorAll('.chapter')).map((el) => ({
      title: el.querySelector('h1')?.textContent?.trim() ?? 'Untitled',
      top: (el as HTMLElement).offsetTop,
    }))
  );

  return raw.map(({ title, top }) => ({
    title,
    page: Math.floor(top / CONTENT_H_PX) + 1 + COVER_PAGES + TOC_PAGES,
  }));
}

export function buildTocHtml(entries: TocEntry[]): string {
  const rows = entries
    .map(
      ({ title, page }) => `
    <div class="toc-entry">
      <span class="toc-title">${title}</span>
      <span class="toc-leader"></span>
      <span class="toc-num">${page}</span>
    </div>`
    )
    .join('');

  return `<div class="toc-page">
  <h2 class="toc-heading">Contents</h2>
  ${rows}
</div>`;
}
