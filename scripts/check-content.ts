/**
 * check-content.ts
 *
 * Content lint — the rules that live in docs/content-format.md but were only
 * enforced by discipline. Pure fs scan over src/content/wiki/**\/*.mdx.
 *
 * Rules:
 *   1. No H1 in the body (`# ...`) — H1 is rendered from frontmatter title.
 *   2. Headings must not skip levels (H2 → H4 without an H3 in between).
 *   3. Images need alt text (`![alt](src)`, empty `![](src)` fails).
 *   4. Internal MD links must not end with "/" (site is trailingSlash:'never').
 *
 * Style: warnings don't fail the build; errors exit 1 (can gate CI).
 *
 * Usage: pnpm check-content
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

const ROOT = process.cwd();
const BASE = path.resolve(ROOT, 'src/content/wiki');

const files: string[] = [];
(function walk(dir: string) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (entry.name.endsWith('.mdx')) files.push(p);
  }
})(BASE);

let errorCount = 0;
const error = (file: string, line: number, msg: string) => {
  console.log(`   ❌ ${path.relative(ROOT, file)}:${line + 1}  ${msg}`);
  errorCount++;
};
const warn = (file: string, line: number, msg: string) => {
  console.log(`   ⚠️  ${path.relative(ROOT, file)}:${line + 1}  ${msg}`);
};

console.log(`\n📝 Content lint — ${files.length} MDX files\n`);

for (const file of files) {
  const src = fs.readFileSync(file, 'utf8');
  // Strip frontmatter (between the first two `---` lines).
  const lines = src.split('\n');
  const secondFm = lines.indexOf('---', 1);
  const bodyStart = secondFm === -1 ? 0 : secondFm + 1;
  const body = lines.slice(bodyStart);

  let prevLevel = 1; // H1 "level" from the frontmatter title.
  body.forEach((line, i) => {
    const ln = i + bodyStart;

    // 1. H1 in body.
    const h1 = line.match(/^#\s+/);
    if (h1) error(file, ln, 'H1 in body — the title H1 is rendered from frontmatter');

    // 2. Heading level skips.
    const h = line.match(/^(#{2,6})\s+/);
    if (h) {
      const level = h[1].length;
      if (level - prevLevel > 1) {
        warn(file, ln, `heading jumps H${prevLevel} → H${level}`);
      }
      prevLevel = level;
    }

    // 3. Images without alt text (MD image syntax).
    const img = line.match(/!\[([^\]]*)\]\(([^)]+)\)/g) ?? [];
    for (const m of img) {
      const alt = m.match(/!\[([^\]]*)\]/)?.[1] ?? '';
      if (!alt.trim()) error(file, ln, `image without alt text: ${m.slice(0, 60)}`);
    }

    // 4. Trailing-slash internal links (trailingSlash: 'never').
    const links = line.match(/\]\((\/[^)#\s]*\/)\)/g) ?? [];
    for (const m of links) {
      error(file, ln, `internal link ends with "/" (trailingSlash never): ${m.slice(0, 60)}`);
    }
  });
}

console.log(
  errorCount === 0
    ? `\n✅ Content lint clean.`
    : `\n❌ ${errorCount} content error${errorCount === 1 ? '' : 's'}.`,
);
process.exit(errorCount === 0 ? 0 : 1);
