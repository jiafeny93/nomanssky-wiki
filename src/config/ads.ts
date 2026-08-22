/**
 * Ad unit configuration — the single source of truth for ad network keys.
 *
 * 👉 APPLY TEMPLATE: Replace these keys with your own ad unit keys, or leave
 * a position undefined to disable that slot (the site renders fine with no ads).
 *
 * This file holds Adsterra banner keys. Keys are public identifiers — they
 * appear in the served HTML — so unlike secrets they can live in source.
 *
 * Positions:
 *   - sticky     → 320×50, site-wide sticky banner under the header (desktop)
 *   - incontent  → 300×250, inside article pages before related articles
 *   - sidebar    → 160×600, desktop sidebar on article pages
 *   - leaderboard→ 728×90, article pages between TOC and body (desktop)
 */

export interface AdUnit {
  /** Ad network unit key (Adsterra 'key' from the embed snippet). */
  key: string;
  /** Banner width in px. */
  width: number;
  /** Banner height in px. */
  height: number;
}

export type AdPosition = 'sticky' | 'incontent' | 'sidebar' | 'leaderboard';

export const AD_UNITS: Partial<Record<AdPosition, AdUnit>> = {
  // ✅ RE-ENABLED 2026-08-22 — Adsterra site review approved (dashboard shows
  // nomanssky.wiki as Active). Slots load inside the sandboxed slot.html
  // iframe (lazy), so main-page rendering is unaffected.
  sticky: { key: 'a47ed3ef99530ee68295b268d3509729', width: 320, height: 50 },
  incontent: { key: 'cc6eb9b1a88952fb32fe7e68a45c5222', width: 300, height: 250 },
  sidebar: { key: '87b58c6d154186b93752ebcfb4f5148f', width: 160, height: 600 },
  leaderboard: { key: '0a62cd0f0120163d088663c1fcaaba23', width: 728, height: 90 },
};

/** Loader host for Adsterra banner units (matches the current dashboard snippet — Adsterra rotates these domains). */
export const AD_SCRIPT_HOST = 'https://www.highrevenueformat.com';
