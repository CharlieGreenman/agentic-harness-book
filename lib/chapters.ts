import * as fs from 'fs';
import * as path from 'path';
import { marked } from 'marked';

export interface Chapter {
  filename: string;
  order: number;
  html: string;
}

export function loadChapters(srcDir: string): Chapter[] {
  const files = fs.readdirSync(srcDir)
    .filter((f) => f.endsWith('.md'))
    .sort((a, b) => {
      if (a === 'introduction.md') return -1;
      if (b === 'introduction.md') return 1;
      return a.localeCompare(b);
    });

  return files.map((filename) => {
    const order = parseInt(filename.split('-')[0], 10);
    const raw = fs.readFileSync(path.join(srcDir, filename), 'utf-8');
    const html = marked.parse(raw) as string;
    return { filename, order, html };
  });
}
