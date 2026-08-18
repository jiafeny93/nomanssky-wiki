/**
 * generate-covers.ts — deterministic og:image cover generator.
 *
 * Generates one original deep-space cover per article (SVG composed with
 * seeded geometry, rasterized to 1200x630 webp via sharp) and injects the
 * `image:` frontmatter line into each MDX file. The CategoryArt component
 * covers the on-page look; these files exist so og:image / social share
 * cards (Discord, Facebook, X) show a per-article cover instead of the
 * site-wide default hero.webp — CSS art cannot be an og:image.
 *
 * Deterministic: the same category+slug ALWAYS produces a byte-identical
 * SVG (FNV-1a seed → mulberry32 PRNG, no Math.random / Date.now), so
 * re-running is idempotent and diff-friendly.
 *
 * Hues and the PRNG mirror src/lib/categoryTheme.ts (kept in sync
 * manually — scripts don't import app modules, see new-post.ts).
 *
 * Output: src/assets/covers/<category>/<slug>.webp (committed to git —
 * these are source assets, not build artifacts).
 *
 * Usage:
 *   pnpm covers           generate missing covers + inject frontmatter
 *   pnpm covers -- --dry  list the plan without writing
 *   pnpm covers -- --force  regenerate even if the file exists
 */
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

// ── Mirror of src/lib/categoryTheme.ts ─────────────────────────────────
const CATEGORY_HUES: Record<string, number> = {
  'cosmos-update': 265,
  expeditions: 38,
  starships: 190,
  multitools: 150,
  'base-building': 22,
  guides: 220,
};
const DEFAULT_CATEGORY_HUE = 15;

function hashString(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function seededRandom(seed: string): () => number {
  let a = hashString(seed);
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── Cover geometry ─────────────────────────────────────────────────────
export const COVER_WIDTH = 1200;
export const COVER_HEIGHT = 630;

/** Subject silhouettes sit inside this band so 16:9 card crops (which trim
 *  the sides of a 1.91:1 og image) and social previews never clip them. */
const SAFE = { x1: 300, x2: 900, y1: 150, y2: 480 };

type Pt = [number, number];

function starfield(rnd: () => number, count: number): string {
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    const x = (rnd() * COVER_WIDTH).toFixed(1);
    const y = (rnd() * COVER_HEIGHT).toFixed(1);
    const r = (0.5 + rnd() * 1.3).toFixed(2);
    const o = (0.25 + rnd() * 0.75).toFixed(2);
    out.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" opacity="${o}"/>`);
  }
  return out.join('');
}

/** Four-pointed star glint — a slim diamond cross. */
function glint(cx: number, cy: number, len: number, w: number): string {
  return (
    `<path d="M ${cx} ${cy - len} L ${cx + w} ${cy - w} L ${cx + len} ${cy} ` +
    `L ${cx + w} ${cy + w} L ${cx} ${cy + len} L ${cx - w} ${cy + w} ` +
    `L ${cx - len} ${cy} L ${cx - w} ${cy - w} Z" fill="#fff" opacity="0.9"/>`
  );
}

/** Ringed planet silhouette (also the default subject). */
function planet(hue: number, cx: number, cy: number, r: number): string {
  const ring = `transform="rotate(-18 ${cx} ${cy})"`;
  return `
  <g>
    <ellipse cx="${cx}" cy="${cy}" rx="${r * 1.75}" ry="${r * 0.44}" fill="none"
      stroke="hsl(${hue} 60% 65% / 0.35)" stroke-width="5" ${ring}/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="hsl(${hue} 55% 16%)"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#planetFill)"/>
    <ellipse cx="${cx}" cy="${cy}" rx="${r * 1.75}" ry="${r * 0.44}" fill="none"
      stroke="hsl(${hue} 70% 72% / 0.55)" stroke-width="5"
      transform="rotate(-18 ${cx} ${cy}) translate(0 ${r * 0.28})" opacity="0.9"/>
    <circle cx="${cx - r * 1.9}" cy="${cy + r * 0.9}" r="${r * 0.14}" fill="hsl(${hue} 40% 60% / 0.8)"/>
  </g>`;
}

/** Starship side silhouette — arrow nose, swept wings, twin engine glow. */
function starship(hue: number, cx: number, cy: number, s: number): string {
  const nose: Pt = [cx + s * 1.1, cy];
  const body: Pt[] = [
    [cx + s * 0.2, cy - s * 0.16],
    [cx - s * 0.9, cy - s * 0.22],
    [cx - s * 1.05, cy + s * 0.1],
    [cx - s * 0.5, cy + s * 0.2],
    [cx + s * 0.25, cy + s * 0.16],
  ];
  const wing: Pt[] = [
    [cx - s * 0.25, cy - s * 0.1],
    [cx - s * 0.95, cy - s * 0.85],
    [cx - s * 1.1, cy - s * 0.75],
    [cx - s * 0.55, cy - s * 0.05],
  ];
  const wing2 = wing.map(([x, y]: Pt) => [x, cy + (cy - y)] as Pt);
  return `
  <g>
    <polygon points="${[nose, ...body].map((p) => p.join(',')).join(' ')}"
      fill="hsl(${hue} 45% 12%)"/>
    <polygon points="${wing.map((p) => p.join(',')).join(' ')}" fill="hsl(${hue} 45% 10%)"/>
    <polygon points="${wing2.map((p) => p.join(',')).join(' ')}" fill="hsl(${hue} 45% 10%)"/>
    <ellipse cx="${cx + s * 0.45}" cy="${cy - s * 0.03}" rx="${s * 0.3}" ry="${s * 0.08}"
      fill="hsl(${hue} 90% 75% / 0.85)"/>
    <circle cx="${cx - s * 1.02}" cy="${cy - s * 0.06}" r="${s * 0.11}" fill="hsl(${hue} 95% 70%)"/>
    <circle cx="${cx - s * 1.02}" cy="${cy + s * 0.08}" r="${s * 0.11}" fill="hsl(${hue} 95% 70%)"/>
    <circle cx="${cx - s * 1.02}" cy="${cy}" r="${s * 0.3}" fill="hsl(${hue} 95% 70% / 0.25)"/>
  </g>`;
}

/** Portal — 12 trapezoid segments ringing a warm inner glow. */
function portal(hue: number, cx: number, cy: number, r: number): string {
  const segs: string[] = [];
  const N = 12;
  for (let i = 0; i < N; i++) {
    const a0 = (i / N) * Math.PI * 2;
    const a1 = ((i + 0.72) / N) * Math.PI * 2;
    const ri = r * 0.74;
    const ro = r;
    const pts: Pt[] = [
      [cx + Math.cos(a0) * ri, cy + Math.sin(a0) * ri],
      [cx + Math.cos(a0) * ro, cy + Math.sin(a0) * ro],
      [cx + Math.cos(a1) * ro, cy + Math.sin(a1) * ro],
      [cx + Math.cos(a1) * ri, cy + Math.sin(a1) * ri],
    ];
    segs.push(
      `<polygon points="${pts.map((p) => p.map((n) => n.toFixed(1)).join(',')).join(' ')}" ` +
        `fill="hsl(${hue} 45% 38% / 0.92)"/>`,
    );
  }
  return `
  <g>
    ${segs.join('')}
    <ellipse cx="${cx}" cy="${cy}" rx="${r * 0.7}" ry="${r * 0.7}"
      fill="hsl(${hue} 90% 60% / 0.3)"/>
    <ellipse cx="${cx}" cy="${cy}" rx="${r * 0.52}" ry="${r * 0.52}"
      fill="hsl(${hue} 95% 70% / 0.5)"/>
    <ellipse cx="${cx}" cy="${cy}" rx="${r * 0.3}" ry="${r * 0.3}"
      fill="hsl(${hue} 100% 88% / 0.75)"/>
  </g>`;
}

/** Constellation chart — seeded star dots joined by a dashed polyline. */
function constellation(rnd: () => number, hue: number): string {
  const n = 5 + Math.floor(rnd() * 3);
  const cx = (SAFE.x1 + SAFE.x2) / 2;
  const cy = (SAFE.y1 + SAFE.y2) / 2;
  const pts: Pt[] = [];
  for (let i = 0; i < n; i++) {
    pts.push([
      cx - 220 + (i / (n - 1)) * 440 + (rnd() - 0.5) * 90,
      cy - 110 + rnd() * 220,
    ]);
  }
  const dots = pts
    .map(
      ([x, y]) =>
        `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="7" fill="hsl(${hue} 90% 80%)"/>` +
        `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="13" fill="none" stroke="hsl(${hue} 80% 70% / 0.4)" stroke-width="2"/>`,
    )
    .join('');
  const line = pts.map((p) => p.map((v) => v.toFixed(0)).join(',')).join(' ');
  return `
  <g>
    <circle cx="${cx}" cy="${cy}" r="235" fill="none" stroke="hsl(${hue} 60% 60% / 0.25)" stroke-width="2"/>
    <circle cx="${cx}" cy="${cy}" r="262" fill="none" stroke="hsl(${hue} 60% 60% / 0.12)" stroke-width="2" stroke-dasharray="4 10"/>
    <polyline points="${line}" fill="none" stroke="hsl(${hue} 80% 70% / 0.55)" stroke-width="2.5" stroke-dasharray="6 8"/>
    ${dots}
  </g>`;
}

/**
 * Build the full cover SVG for one article. Deterministic per
 * (category, slug). No <text>, no external refs — librsvg text rendering
 * depends on system fonts (irreproducible) and titles belong to HTML.
 */
export function buildCoverSvg(category: string, slug: string): string {
  const hue = CATEGORY_HUES[category] ?? DEFAULT_CATEGORY_HUE;
  const rnd = seededRandom(`${category}/${slug}`);

  // Sky: vertical gradient, hue nudged ±8° per article so siblings differ.
  const h0 = (hue + Math.floor(rnd() * 16) - 8 + 360) % 360;
  const h1 = (h0 + 25) % 360;

  // Nebula washes: big soft ellipses in the category family.
  const nebulae = [0, 1, 2]
    .map(() => {
      const ex = (rnd() * COVER_WIDTH).toFixed(0);
      const ey = (rnd() * COVER_HEIGHT).toFixed(0);
      const rx = (180 + rnd() * 240).toFixed(0);
      const ry = (90 + rnd() * 140).toFixed(0);
      const nh = (hue + Math.floor(rnd() * 80) - 40 + 360) % 360;
      const o = (0.08 + rnd() * 0.1).toFixed(2);
      return `<ellipse cx="${ex}" cy="${ey}" rx="${rx}" ry="${ry}" fill="hsl(${nh} 70% 55% / ${o})" filter="url(#soft)"/>`;
    })
    .join('');

  // Bright glints + a few larger stars with glow.
  const bright = [0, 1, 2]
    .map(() => {
      const x = 80 + rnd() * (COVER_WIDTH - 160);
      const y = 40 + rnd() * (COVER_HEIGHT - 80);
      return glint(+x.toFixed(0), +y.toFixed(0), 10 + rnd() * 8, 2.2);
    })
    .join('');
  const bigStars = [0, 1, 2, 3]
    .map(() => {
      const x = (rnd() * COVER_WIDTH).toFixed(0);
      const y = (rnd() * COVER_HEIGHT).toFixed(0);
      return `<circle cx="${x}" cy="${y}" r="2.6" fill="#fff" opacity="0.95"/><circle cx="${x}" cy="${y}" r="6" fill="#fff" opacity="0.18"/>`;
    })
    .join('');

  // Subject — category-specific silhouette, centered in the safe band.
  const cx = (SAFE.x1 + SAFE.x2) / 2;
  const cy = (SAFE.y1 + SAFE.y2) / 2;
  let subject: string;
  switch (category) {
    case 'starships':
      subject = starship(hue, cx, cy, 120 + Math.floor(rnd() * 30));
      break;
    case 'expeditions':
      subject = portal(hue, cx, cy, 150 + Math.floor(rnd() * 25));
      break;
    case 'guides':
      subject = constellation(rnd, hue);
      break;
    default:
      subject = planet(hue, cx, cy, 105 + Math.floor(rnd() * 30));
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${COVER_WIDTH}" height="${COVER_HEIGHT}" viewBox="0 0 ${COVER_WIDTH} ${COVER_HEIGHT}">
<defs>
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="hsl(${h0} 55% 7%)"/>
    <stop offset="0.55" stop-color="hsl(${h0} 50% 12%)"/>
    <stop offset="1" stop-color="hsl(${h1} 45% 18%)"/>
  </linearGradient>
  <radialGradient id="planetFill" cx="0.35" cy="0.3" r="0.9">
    <stop offset="0" stop-color="hsl(${hue} 65% 62%)"/>
    <stop offset="0.55" stop-color="hsl(${hue} 55% 34%)"/>
    <stop offset="1" stop-color="hsl(${hue} 50% 12%)"/>
  </radialGradient>
  <radialGradient id="vig" cx="0.5" cy="0.5" r="0.72">
    <stop offset="0.62" stop-color="#000" stop-opacity="0"/>
    <stop offset="1" stop-color="#000" stop-opacity="0.32"/>
  </radialGradient>
  <filter id="soft" x="-40%" y="-40%" width="180%" height="180%">
    <feGaussianBlur stdDeviation="42"/>
  </filter>
</defs>
<rect width="${COVER_WIDTH}" height="${COVER_HEIGHT}" fill="url(#sky)"/>
${nebulae}
${starfield(rnd, 150)}
${bigStars}
${bright}
${subject}
<rect width="${COVER_WIDTH}" height="${COVER_HEIGHT}" fill="url(#vig)"/>
</svg>`;
}

// ── CLI ────────────────────────────────────────────────────────────────
const ROOT = path.resolve(import.meta.dirname, '..');
const CONTENT_DIR = path.join(ROOT, 'src/content/wiki/en');
const COVERS_DIR = path.join(ROOT, 'src/assets/covers');
/** Relative path from an MDX at src/content/wiki/en/<cat>/<slug>.mdx to
 *  src/assets/ — FOUR levels up (the 3-level example in content.config.ts
 *  comments predates the per-locale layout). */
const REL_PREFIX = '../../../../assets/covers';

async function* walkMdxCat(dir: string): AsyncGenerator<{ category: string; file: string }> {
  for (const ent of await readdir(dir, { withFileTypes: true })) {
    if (ent.isDirectory()) {
      for (const f of await readdir(path.join(dir, ent.name))) {
        if (f.endsWith('.mdx')) yield { category: ent.name, file: path.join(dir, ent.name, f) };
      }
    }
  }
}

async function main() {
  const dry = process.argv.includes('--dry');
  const force = process.argv.includes('--force');
  let generated = 0;
  let skipped = 0;

  for await (const { category, file } of walkMdxCat(CONTENT_DIR)) {
    const slug = path.basename(file, '.mdx');
    const outPath = path.join(COVERS_DIR, category, `${slug}.webp`);
    const src = await readFile(file, 'utf8');

    let svg = buildCoverSvg(category, slug);
    if (!force && src.includes('\nimage:')) {
      skipped++;
      continue; // already has a cover wired
    }

    if (!dry) {
      await mkdir(path.dirname(outPath), { recursive: true });
      await sharp(Buffer.from(svg)).webp({ quality: 85, effort: 4 }).toFile(outPath);
    }

    // Inject `image:` after the category line (idempotent: skip when present).
    if (!src.includes('\nimage:')) {
      const rel = `${REL_PREFIX}/${category}/${slug}.webp`;
      const patched = src.replace(/(^category:.*$)/m, `$1\nimage: '${rel}'`);
      if (patched === src) throw new Error(`no category line found in ${file}`);
      if (!dry) await writeFile(file, patched);
    }
    generated++;
    console.log(`${dry ? '[dry] ' : ''}${category}/${slug}.webp`);
    svg = '';
  }
  console.log(`\n${generated} generated, ${skipped} skipped (already wired)`);
}

// Run only when executed directly (imports from tests skip main()).
if (process.argv[1]?.includes('generate-covers')) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
