import puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';

const COVER_HTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=IBM+Plex+Mono:wght@400;700&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body {
    width: 1600px;
    height: 2560px;
    overflow: hidden;
  }
  body {
    background: #000080;
    font-family: 'IBM Plex Mono', 'Share Tech Mono', monospace;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  body::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 120% 80% at 50% 40%, #0000aa 0%, #000080 40%, #00004a 100%);
  }

  body::after {
    content: '';
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      to bottom,
      transparent 0px,
      transparent 3px,
      rgba(0,0,0,0.08) 3px,
      rgba(0,0,0,0.08) 4px
    );
    pointer-events: none;
  }

  .cover {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 120px;
    width: 100%;
    height: 100%;
  }

  .border-outer {
    position: absolute;
    inset: 40px;
    border: 4px solid #00aaaa;
    pointer-events: none;
  }
  .border-inner {
    position: absolute;
    inset: 56px;
    border: 2px solid #005555;
    pointer-events: none;
  }

  .title-bar {
    position: absolute;
    top: 40px;
    left: 40px;
    right: 40px;
    height: 64px;
    background: #00aaaa;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .title-bar-text {
    font-size: 28px;
    font-weight: 700;
    color: #000080;
    letter-spacing: 0.15em;
    text-transform: uppercase;
  }

  .corner-tl, .corner-tr, .corner-bl, .corner-br {
    position: absolute;
    width: 20px;
    height: 20px;
    border: 2px solid #00aaaa;
  }
  .corner-tl { top: 112px; left: 56px; }
  .corner-tr { top: 112px; right: 56px; }
  .corner-bl { bottom: 56px; left: 56px; }
  .corner-br { bottom: 56px; right: 56px; }

  .ornament {
    width: 400px;
    height: 2px;
    background: #00aaaa;
    margin: 0 auto 60px;
    box-shadow: 0 0 12px rgba(0, 170, 170, 0.4);
  }

  .ascii-art {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 24px;
    line-height: 1.25;
    color: #00aaaa;
    white-space: pre;
    margin-bottom: 60px;
    text-shadow: 0 0 10px rgba(0, 170, 170, 0.35);
  }

  .title {
    font-size: 120px;
    font-weight: 700;
    color: #ffffff;
    letter-spacing: 0.06em;
    line-height: 1.12;
    margin-bottom: 48px;
    text-shadow:
      0 0 30px rgba(255,255,255,0.3),
      0 4px 0 #000050;
  }

  .subtitle {
    font-size: 34px;
    font-weight: 400;
    color: #ffff55;
    line-height: 1.6;
    max-width: 1100px;
    margin-bottom: 80px;
    letter-spacing: 0.04em;
    text-shadow: 0 0 20px rgba(255,255,85,0.25);
  }

  .rule {
    width: 200px;
    height: 2px;
    background: #00aaaa;
    margin: 0 auto 60px;
    box-shadow: 0 0 12px rgba(0, 170, 170, 0.4);
  }

  .author {
    font-size: 36px;
    font-weight: 700;
    color: #00ffff;
    letter-spacing: 0.28em;
    text-transform: uppercase;
    text-shadow: 0 0 16px rgba(0, 255, 255, 0.3);
  }

  .cursor {
    display: inline-block;
    width: 24px;
    height: 40px;
    background: #00ffff;
    margin-left: 12px;
    vertical-align: middle;
    opacity: 0.8;
  }

  .status-bar {
    position: absolute;
    bottom: 40px;
    left: 40px;
    right: 40px;
    height: 52px;
    background: #00aaaa;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
  }
  .status-text {
    font-size: 22px;
    font-weight: 700;
    color: #000080;
    letter-spacing: 0.08em;
  }
</style>
</head>
<body>
  <div class="cover">
    <div class="border-outer"></div>
    <div class="border-inner"></div>
    <div class="title-bar">
      <span class="title-bar-text">[ The Agentic Harness ]</span>
    </div>
    <div class="corner-tl"></div>
    <div class="corner-tr"></div>
    <div class="corner-bl"></div>
    <div class="corner-br"></div>
    <div class="ornament"></div>
    <div class="ascii-art">╔══════════════════════════════════════════╗
║  $ agent --loop --tools=* --verbose      ║
║                                          ║
║  [LOOP]    ████████████████████  RUNNING ║
║  [TOOLS]   read write bash edit  LOADED  ║
║  [CONTEXT] ██████████░░░░░░░░░░  54%     ║
║                                          ║
║  > The model is only half the story.     ║
║  > The harness is the other half.        ║
╚══════════════════════════════════════════╝</div>
    <div class="title">The Agentic<br>Harness</div>
    <div class="subtitle">What It Takes to Put a Language Model<br>to Work in the Real World</div>
    <div class="rule"></div>
    <div class="author">Charlie Greenman<span class="cursor"></span></div>
    <div class="status-bar">
      <span class="status-text">F1-Help</span>
      <span class="status-text">2026</span>
      <span class="status-text">F10-Menu</span>
    </div>
  </div>
</body>
</html>`;

export async function generateCover(outputPath: string): Promise<void> {
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const browser = await puppeteer.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1600, height: 2560, deviceScaleFactor: 1 });
    await page.setContent(COVER_HTML, { waitUntil: 'networkidle0' });
    await page.screenshot({
      path: outputPath as `${string}.jpg`,
      type: 'jpeg',
      quality: 95,
      clip: { x: 0, y: 0, width: 1600, height: 2560 },
    });
  } finally {
    await browser.close();
  }
}
