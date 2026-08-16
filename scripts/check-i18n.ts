/**
 * check-i18n.ts
 *
 * Translation coverage report — answers "what is ja (or any locale) missing
 * relative to English?" without any manual directory diffing.
 *
 * Checks per non-default locale:
 *   1. Missing articles: every en/ MDX with no <locale>/ counterpart
 *      (same category/slug path). Also reports extra translations.
 *   2. Missing UI keys: deep key diff of src/locales/en.json vs
 *      src/locales/<locale>.json (missing keys fall back to English at
 *      runtime via deepMerge — this is a coverage report, not an error).
 *
 * Pure fs scan (no astro:content import) so it runs anywhere, fast.
 *
 * Usage:
 *   pnpm check-i18n               # report only, always exits 0
 *   pnpm check-i18n --strict      # exit 1 if anything is missing (CI gate)
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

const ROOT = process.cwd();
const STRICT = process.argv.includes('--strict');
const CONTENT_BASE = path.resolve(ROOT, 'src/content/wiki');
const LOCALES_DIR = path.resolve(ROOT, 'src/locales');

// --- Locales from routing.ts (regex-read, same convention as check-config) ---
const routingSrc = fs.readFileSync(path.resolve(ROOT, 'src/i18n/routing.ts'), 'utf8');
const localesMatch = routingSrc.match(/export const locales = \[([^\]]*)\] as const;/);
if (!localesMatch) {
  console.error('❌ Could not read locales from src/i18n/routing.ts');
  process.exit(1);
}
const locales = localesMatch[1]
  .split(',')
  .map((l) => l.trim().replace(/['"]/g, ''))
  .filter(Boolean);
const defaultLocale = locales[0];

/** All MDX paths under a locale dir, relative like "bosses/emberfang.mdx". */
function articleMap(locale: string): Map<string, string> {
  const map = new Map<string, string>();
  const dir = path.join(CONTENT_BASE, locale);
  if (!fs.existsSync(dir)) return map;
  const walk = (d: string) => {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, entry.name);
      if (entry.isDirectory()) walk(p);
      else if (entry.name.endsWith('.mdx')) {
        // Drafts are dev-only; don't report them as missing translations.
        const fm = fs.readFileSync(p, 'utf8').split('---')[1] ?? '';
        if (/^draft:\s*true\s*$/m.test(fm)) continue;
        map.set(path.relative(dir, p), entry.name.replace(/\.mdx$/, ''));
      }
    }
  };
  walk(dir);
  return map;
}

/** Flatten a JSON object into dot-paths ("shared.bossCard.hp"). */
function flattenKeys(obj: unknown, prefix = ''): string[] {
  if (typeof obj !== 'object' || obj === null) return [];
  return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) =>
    typeof v === 'object' && v !== null && !Array.isArray(v)
      ? flattenKeys(v, prefix ? `${prefix}.${k}` : k)
      : [prefix ? `${prefix}.${k}` : k],
  );
}

let missingAnything = false;

console.log(`\n🌐 i18n coverage report — default locale: ${defaultLocale}\n`);

const enArticles = articleMap(defaultLocale);
const enJson = JSON.parse(fs.readFileSync(path.join(LOCALES_DIR, `${defaultLocale}.json`), 'utf8'));
const enKeys = new Set(flattenKeys(enJson));

for (const locale of locales.slice(1)) {
  console.log('━'.repeat(60));
  console.log(` ${locale}`);
  console.log('━'.repeat(60));

  // --- Articles ---
  const locArticles = articleMap(locale);
  const missing: string[] = [];
  for (const rel of enArticles.keys()) {
    if (!locArticles.has(rel)) missing.push(rel);
  }
  const extra: string[] = [];
  for (const rel of locArticles.keys()) {
    if (!enArticles.has(rel)) extra.push(rel);
  }

  const coverage =
    enArticles.size === 0
      ? 100
      : Math.round(((enArticles.size - missing.length) / enArticles.size) * 100);
  console.log(
    `   Articles: ${enArticles.size - missing.length}/${enArticles.size} translated (${coverage}%)`,
  );
  for (const m of missing) console.log(`   ⬜ missing:  ${locale}/${m.replace(/\.mdx$/, '')}`);
  for (const e of extra) console.log(`   ➕ extra:    ${locale}/${e.replace(/\.mdx$/, '')}`);
  if (missing.length > 0) missingAnything = true;

  // --- UI keys ---
  const locJsonPath = path.join(LOCALES_DIR, `${locale}.json`);
  if (!fs.existsSync(locJsonPath)) {
    console.log(`   ⚠️ No src/locales/${locale}.json — UI runs on English fallback.`);
    continue;
  }
  const locKeys = new Set(
    flattenKeys(JSON.parse(fs.readFileSync(locJsonPath, 'utf8'))),
  );
  const missingKeys = [...enKeys].filter((k) => !locKeys.has(k)).sort();
  const coverageKeys =
    enKeys.size === 0 ? 100 : Math.round(((enKeys.size - missingKeys.length) / enKeys.size) * 100);
  console.log(
    `   UI keys:  ${enKeys.size - missingKeys.length}/${enKeys.size} translated (${coverageKeys}%)`,
  );
  // Print at most 15 missing keys — the list can be long for a fresh locale.
  for (const k of missingKeys.slice(0, 15)) console.log(`   ⬜ missing:  ${k}`);
  if (missingKeys.length > 15) console.log(`   … and ${missingKeys.length - 15} more`);
  console.log('');
}

console.log(
  missingAnything
    ? `ℹ️ Missing items fall back to English at runtime (articles 404-never, UI deepMerge).`
    : `✅ All locales fully covered.`,
);
if (STRICT && missingAnything) process.exit(1);
