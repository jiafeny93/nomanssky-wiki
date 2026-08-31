/**
 * Site configuration — the single source of truth for game-specific metadata.
 *
 * 👉 APPLY TEMPLATE: Change every field here when building a new game wiki.
 * This is part of the CONFIG LAYER — framework code reads from here, never the reverse.
 */

export interface SiteConfig {
  /** Full site name, used in <title> suffix and Organization JSON-LD. e.g. "Anvil Quest Wiki" */
  name: string;
  /** Short name for PWA manifest and mobile logo. e.g. "AQ Wiki" */
  shortName: string;
  /** Site description for Organization JSON-LD and og:site_name. */
  description: string;
  /** Domain without protocol or trailing slash. e.g. "anvilquestwiki.wiki" */
  domain: string;
  /** Hero tagline shown under the site title. */
  tagline: string;
  /** Copyright / legal disclaimer line shown in footer. */
  legalNotice: string;
  social: {
    /** Official game website URL (the game itself, not the wiki). */
    official: string;
    discord?: string;
    youtube?: string;
    twitter?: string;
    reddit?: string;
  };
  /**
   * Canonical URLs about the GAME (Steam page, official site, Wikipedia entry…).
   * Emitted as Organization JSON-LD `sameAs` — helps Google / AI engines link
   * this wiki to the game's knowledge-graph entity.
   */
  sameAs?: string[];
  game: {
    /** Full game name. */
    name: string;
    /** Platform: "Roblox" | "Steam" | "Epic Games" | "Mobile" | ... */
    platform: string;
    /** Developer / studio name. */
    developer: string;
    /** Genre description. */
    genre: string;
    /** ISO release date (optional). */
    releaseDate?: string;
    /**
     * Current game version number + update name (e.g. "6.50" / "Cosmos").
     * Articles whose frontmatter `gameVersion` matches either value render a
     * "verified for the current version" chip — a freshness signal that
     * outranks competitors whose reference pages carry stale version banners.
     */
    currentVersion?: string;
    currentUpdateName?: string;
  };
  /**
   * Dimensions of the default OG/Twitter share image (public/images/hero.webp).
   * Emitted as og:image:width / og:image:height so social crawlers can render
   * the share card without downloading the image first.
   */
  ogImageWidth: number;
  ogImageHeight: number;
  /** Default author name for articles without an explicit `author` in frontmatter (E-E-A-T signal). */
  defaultAuthor?: string;
}

export const site: SiteConfig = {
  name: "No Man's Sky Wiki",
  shortName: 'NMS Wiki',
  description: 'No Man\'s Sky guides and wiki on nomanssky.wiki: Cosmos update coverage, expedition walkthroughs, starship and multitool guides, base building, and farming tips.',
  domain: 'nomanssky.wiki',
  tagline: 'Guides for every update, expedition, and starship',
  legalNotice: 'No Man\'s Sky Wiki is a fan-made community site. Not affiliated with or endorsed by the game developer.',
  social: {
    official: 'https://www.nomanssky.com/',
    twitter: 'https://x.com/NoMansSky',
    youtube: 'https://www.youtube.com/@nomanssky',
    reddit: 'https://www.reddit.com/r/NoMansSkyTheGame/',
  },
  game: {
    name: "No Man's Sky",
    platform: 'PC (Steam, PS5, Xbox, Switch, Mac)',
    developer: 'Hello Games',
    genre: 'Action-adventure, survival, space exploration',
    releaseDate: '2016-08-09',
    currentVersion: '6.50',
    currentUpdateName: 'Cosmos',
  },
  ogImageWidth: 1200,
  ogImageHeight: 630,
  // Editorial byline for articles without an explicit `author` in frontmatter.
  // Linked to /about via the authors registry (E-E-A-T signal).
  defaultAuthor: 'NMS Wiki Team',
};

/** Absolute site URL (no trailing slash). Falls back to the Astro `site` config. */
export const siteUrl: string = (process.env.SITE_URL || `https://${site.domain}`).replace(
  /\/$/,
  '',
);
