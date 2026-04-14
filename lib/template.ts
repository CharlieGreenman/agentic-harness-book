import { Chapter } from './chapters';

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,400;0,700;1,400&family=IBM+Plex+Sans:wght@400;600&display=swap');

:root {
  --page-w: 6in;
  --page-h: 9in;
  --content-pad-h: 0.875in;
}

* {
  box-sizing: border-box;
}

@page {
  size: var(--page-w) var(--page-h);
}

html, body {
  margin: 0;
  padding: 0;
  background: #000080;
}

body {
  font-family: 'IBM Plex Mono', 'Courier New', monospace;
  font-size: 10.5pt;
  line-height: 1.7;
  color: #ffffff;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.content-wrapper {
  padding: 0 var(--content-pad-h);
}

/* ── Table of contents ──────────────────────────────────── */
.toc-page {
  page-break-after: always;
  padding-top: 0.5in;
  border: 2px solid #00aaaa;
  padding: 0.6in 0.5in;
  position: relative;
}

.toc-page::before {
  content: '[ CONTENTS ]';
  position: absolute;
  top: -1px;
  left: 0;
  right: 0;
  background: #00aaaa;
  color: #000080;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10pt;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-align: center;
  padding: 4px 0;
}

.toc-heading {
  font-size: 14pt;
  font-weight: 700;
  font-variant: normal;
  letter-spacing: 0.15em;
  text-align: center;
  margin-bottom: 1.75rem;
  margin-top: 1rem;
  color: #00ffff;
}

.toc-entry {
  display: flex;
  align-items: baseline;
  margin-bottom: 0.45rem;
  font-size: 9.5pt;
  line-height: 1.4;
  color: #ffffff;
}

.toc-title {
  flex-shrink: 0;
  max-width: 78%;
  color: #ffff55;
}

.toc-leader {
  flex-grow: 1;
  margin: 0 0.3rem;
  border-bottom: 1px dotted #005555;
  position: relative;
  top: -0.2em;
  min-width: 1rem;
}

.toc-num {
  flex-shrink: 0;
  font-size: 9pt;
  color: #00aaaa;
}

/* ── Title page ─────────────────────────────────────────── */
section.title-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
  page-break-after: always;
}

.title-page .book-title {
  font-size: 32pt;
  font-weight: 700;
  letter-spacing: 0.06em;
  margin-bottom: 1.25rem;
  color: #ffffff;
  text-shadow: 0 2px 0 #000050;
}

.title-page .book-subtitle {
  font-size: 12pt;
  font-style: normal;
  color: #ffff55;
  margin-bottom: 3rem;
  max-width: 4in;
  line-height: 1.45;
}

.title-page .book-author {
  font-size: 12pt;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #00ffff;
}

/* ── Chapter container ──────────────────────────────────── */
.chapter {
  page-break-before: always;
}

.chapter:first-of-type {
  page-break-before: auto;
}

.chapter h1 {
  font-size: 17pt;
  font-weight: 700;
  text-align: center;
  letter-spacing: 0.04em;
  padding-top: 0.3in;
  margin-bottom: 0.6rem;
  color: #00ffff;
  border-bottom: 2px solid #00aaaa;
  padding-bottom: 0.5rem;
}

.chapter h3 {
  font-size: 9.5pt;
  font-weight: normal;
  text-align: center;
  color: #ffff55;
  line-height: 1.5;
  margin-bottom: 2rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid #005555;
}

.chapter h3 em {
  font-style: italic;
}

.chapter h2 {
  font-size: 11pt;
  font-weight: 700;
  font-variant: normal;
  letter-spacing: 0.08em;
  text-align: left;
  margin-top: 2rem;
  margin-bottom: 0.6rem;
  color: #ffff55;
}

.chapter p {
  text-indent: 1.5em;
  margin: 0;
  text-align: justify;
  hyphens: auto;
  color: #ffffff;
}

.chapter h1 + p,
.chapter h2 + p,
.chapter h3 + p,
.chapter hr + p,
.chapter blockquote + p,
.chapter .chapter-art + p {
  text-indent: 0;
}

.chapter strong {
  font-weight: bold;
  color: #ffffff;
}

.chapter em {
  font-style: italic;
  color: #ffffff;
}

.chapter hr {
  border: none;
  text-align: center;
  margin: 1.75rem 0;
}

.chapter hr::after {
  content: '═══════';
  font-size: 9.5pt;
  color: #00aaaa;
  letter-spacing: 0.1em;
}

.chapter-art {
  text-align: center;
  color: #00aaaa;
  font-size: 8.5pt;
  line-height: 1.3;
  margin: 1rem auto 1.5rem;
  white-space: pre;
}

.chapter blockquote {
  margin: 1rem 1.5rem;
  padding-left: 1rem;
  border-left: 2px solid #00aaaa;
  font-style: italic;
  color: #ffffff;
}

.chapter blockquote p {
  text-indent: 0;
  color: #ffffff;
}

/* ── Code blocks ────────────────────────────────────────── */
.chapter pre:not(.chapter-art) {
  background: #000050;
  border: 1px solid #00aaaa;
  padding: 0.6rem 0.8rem;
  margin: 1rem 0;
  font-size: 9pt;
  line-height: 1.4;
  color: #00ffff;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.chapter code {
  font-family: 'IBM Plex Mono', 'Courier New', monospace;
  color: #00ffff;
  background: #000050;
  padding: 0 0.2em;
}

.chapter pre code {
  background: none;
  padding: 0;
}
`;

export function buildHtml(chapters: Chapter[], tocHtml = ''): string {
  const chaptersHtml = chapters
    .map((ch) => `<div class="chapter">${ch.html}</div>`)
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>${CSS}</style>
</head>
<body>
  <div class="content-wrapper">
    ${tocHtml}
    ${chaptersHtml}
  </div>
</body>
</html>`;
}
