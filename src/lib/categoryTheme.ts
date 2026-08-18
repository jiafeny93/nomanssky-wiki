/**
 * Category visual theme — per-category accent hue for cover art, chips, and
 * banners, plus the seeded generators the art is built from.
 *
 * All of this runs at BUILD time and is inlined as CSS — zero runtime JS,
 * zero image assets (and therefore zero copyright concerns: every scene is
 * original geometry generated from a seed).
 *
 * Hues are picked to stay distinguishable at a glance and legible as chip
 * text on both light and dark surfaces:
 *   cosmos-update 265 (violet)    expeditions 38 (amber)
 *   starships 190 (cyan)          multitools 150 (green)
 *   base-building 22 (warm clay)  guides 220 (blue)
 */
export const CATEGORY_HUES: Record<string, number> = {
  'cosmos-update': 265,
  expeditions: 38,
  starships: 190,
  multitools: 150,
  'base-building': 22,
  guides: 220,
};

/** Fallback hue — the brand orange. */
export const DEFAULT_CATEGORY_HUE = 15;

export function categoryHue(category: string): number {
  return CATEGORY_HUES[category] ?? DEFAULT_CATEGORY_HUE;
}

/** FNV-1a 32-bit string hash — seeds the PRNG so a given slug always
 *  renders the identical scene across builds (stable HTML output). */
function hashString(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Mulberry32 seeded PRNG — tiny, fast, plenty random for decorative art. */
export function seededRandom(seed: string): () => number {
  let a = hashString(seed);
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface StarLayer {
  /** CSS background-image value — many tiny radial-gradient stars. */
  image: string;
  /** Suggested twinkle duration for this layer (varies per seed). */
  duration: string;
}

/**
 * Star field as stacked radial gradients. Deterministic per seed; ~26 stars
 * in three size tiers so the sky reads as having depth.
 */
export function starField(seed: string, count = 26): StarLayer {
  const rnd = seededRandom(seed);
  const gradients: string[] = [];
  for (let i = 0; i < count; i++) {
    const x = (rnd() * 100).toFixed(1);
    const y = (rnd() * 100).toFixed(1);
    const size = rnd() < 0.16 ? 2.2 : rnd() < 0.5 ? 1.5 : 1;
    const alpha = (0.35 + rnd() * 0.6).toFixed(2);
    gradients.push(
      `radial-gradient(${size}px ${size}px at ${x}% ${y}%, rgba(255,255,255,${alpha}) 50%, transparent 51%)`,
    );
  }
  return {
    image: gradients.join(', '),
    duration: `${(3.5 + rnd() * 3).toFixed(1)}s`,
  };
}
