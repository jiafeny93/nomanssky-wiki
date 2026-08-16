# Changelog

All notable changes to AnvilWiki are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.8.2] — 2026-08-15

### Fixed
- **Lighthouse a11y 100 restored** (regression introduced by v1.5–v1.8 components, caught by a full re-test): small brand-orange text on tinted backgrounds (gameVersion badge, Quick Answer label, BossStatCard labels, codes table headers, article tag chips) now uses foreground color while keeping brand icons/borders; CodeBlock copy button's accessible name no longer mismatches its visible text.
- **`pnpm check-config` deployment domain gate**: errors when the effective SITE_URL host (env > wrangler.toml) ≠ `site.ts` domain — the wrangler.toml trap that caught the first real fork user is now machine-blocked.
- LandingLayout unused-catch lint warning cleared (lint fully clean).

### Fixed (v1.8.1)
- **Inline video placement** (from real-project dogfooding): new `<Video id title>` MDX component renders a YouTube player wherever the author places it in the body; the frontmatter `videos` array becomes the structured-data registry (VideoObject JSON-LD) + bottom fallback, with inline IDs auto-deduped from the fallback. Player core extracted to a shared `LazyYouTube` (event-delegation script — no more per-instance duplication; keyboard accessible; broken-thumbnail fallback to a plain link where i.ytimg.com is unreachable, e.g. mainland China).
- Article layout: bottom video section moved up to right after the body; Comments moved to the very end (body → videos → gallery → tags → related → prev/next → feedback → comments → sponsor).
- i18n: "On this page" (TOC) and "Quick Answer" hardcoded English now read from locale JSON (en/ja).

## [1.8.0] — 2026-08-15

**AnvilWiki v1.8 — AI 原生内容生产 + 新鲜度管道:第一性原理路线落地(技能分发、codes 数据结构、定时审计、选品工作流)。**

### Added
- **`.agent/skills/` ships with the template** (Agent Skills open standard — Claude Code / ZCode / Codex / Cursor auto-discover): `anvil-new-article` (any source material → build-passing MDX), `anvil-update-codes` (apply new/expired codes incl. multilingual sync), `anvil-refresh` (freshness audit report). Plus a "Conversational Content Authoring" section in AGENTS.md as the zero-install fallback — fork users generate pages by just talking to their AI tool, scripts become the verification backend (`check-content` + `build`).
- **Structured `codes` frontmatter**: `{code, reward, status, expiryDate, source}` array → auto-rendered CodesTable (Active section with one-click-copy CodeBlocks + freshness labels; Expired table kept for long-tail "is X still working" queries) + localized 4-question FAQPage JSON-LD. Demo codes articles (en/ja) migrated.
- **`pnpm refresh-audit`**: deterministic freshness engine (codes pages unverified >7d = P0, stale categories >90d = P1) — markdown report, no LLM, no mutations.
- **`content-pipeline.yml`**: weekly cron workflow that runs the audit and files a tracking issue. Never mutates content — fixing stays human/AI-gated.
- **`docs/game-selection.md`**: the fork-user funnel the template was missing — game selection (4-layer scoring incl. Trends demand validation + SERP gap check + two-source rule), then "first-day 10 pages" (codes → beginner guide → bosses → tier list) to compress the 2-8 week golden window.

## [1.7.0] — 2026-08-15

**AnvilWiki v1.7 — 内容表达力二期 + E-E-A-T:画廊、作者体系、联盟链接与内容 lint。**

### Added
- **Image gallery + lightbox**: `gallery` frontmatter (image/caption/alt) renders a thumbnail grid below the article body with a native `<dialog>` lightbox (prev/next/ESC/backdrop close). Each image emits ImageObject JSON-LD (Google Images eligibility). Thumbnails via Astro Image (WebP/srcset).
- **Author system**: `src/config/authors.ts` registry — registered authors link out from the article byline and upgrade Article JSON-LD author from Organization to **Person** (with `sameAs` knowledge-graph signal). Bare `author:` names keep working unchanged.
- **`<AffiliateLink>` MDX component**: affiliate/outbound CTA card with `rel="sponsored nofollow noopener"` baked in — an SEO-compliant second monetization channel (Steam links, game passes). Zero JS, no env gating (it's content, not infrastructure).
- **`pnpm check-content`**: content lint — no H1 in body, heading level skips, images without alt text, internal links with trailing slashes. Exits 1, CI-ready.

### Changed
- Demo: Stormcaller article now carries a gallery + named author; beginner guide demonstrates `<AffiliateLink>`; fixed a duplicate "What to Do Next" link.

## [1.6.0] — 2026-08-15

**AnvilWiki v1.6 — 创作者维护工具 + 部署自动化:翻译覆盖率、内链审计、一键初始化 workflow。**

### Added
- **`pnpm check-i18n`**: translation coverage report — missing articles & UI keys per locale vs English (`--strict` to gate CI). Wired into CI as a report step.
- **`pnpm check-links`**: internal-link audit over the built `dist/` — catches renamed-slug body links, homepage JSON links to unwritten articles, and locale links to pages that don't exist. Exits 1 on any broken link; wired into CI.
- **"Initialize AnvilWiki" workflow** (`.github/workflows/setup.yml`): fork → Actions → Run once with your domain — resets `wrangler.toml [vars]`, removes the project landing page, opens a review PR.
- **Cloudflare Web Analytics** env gating (`PUBLIC_CF_BEACON_TOKEN`): cookieless beacon, injected directly (no consent gate), empty = zero JS.
- **`docs/staying-up-to-date.md`**: how to merge upstream after forking (three-layer merge matrix), SemVer compatibility promises, post-sync checklist.
- **apply-template content scaffolding**: after clearing demo content, one schema-valid starter article is generated per chosen category.
- **README growth pack**: AnvilWiki vs Fandom vs DIY comparison table, suggested repo topics, and a "built a site? add it to the Showcase" PR invitation.

### Fixed
- Article tag links on English-fallback pages now point at the served locale's tag pages (was: requested locale → 404).
- Tag pages: hreflang alternates and the language switcher only offer locales where the tag actually exists (tag pages don't fall back).
- Demo content dead links: `/guides/fastest-leveling`, `/updates`, `/guides/video-walkthroughs` (caught by the new check-links on its first run).

## [1.5.0] — 2026-08-15

**AnvilWiki v1.5 — 内链 + 时效性 + 表达力:标签系统、版本号、最近更新页、MDX 组件与草稿流。**

### Added
- **Tag system landing pages**: `/tags` (per-locale cloud) + `/tags/<tag>` aggregation pages; article-page tags are now clickable links; tag pages carry ItemList + Breadcrumb JSON-LD and land in the sitemap with hreflang. No English fallback (list accuracy rule).
- **`gameVersion` frontmatter**: optional badge on the article header ("applies to v2.5") — freshness / E-E-A-T signal for fast-patching games. Demo articles tagged.
- **`/recent` page** (all locales): full recently-updated listing, feeding "patch notes"-style queries; pairs with sitemap lastmod.
- **`Callout` MDX component** (`~/components/mdx/Callout.astro`): info/tip/warn/danger callout boxes, zero JS.
- **`Accordion` MDX component** (`~/components/mdx/Accordion.astro`): native `<details>` collapsible panels, zero JS.
- **Draft mechanism**: `draft: true` frontmatter — visible in `pnpm dev`, fully excluded from production build (pages, lists, recent, related, hreflang, sitemap). `pnpm new-post` asks.
- **VideoObject JSON-LD**: one per `videos` frontmatter entry — Google Video search eligibility.
- **404 page recovery**: Pagefind search trigger + category entry points instead of a bare "back home".
- **Sponsor card (env-gated)**: `PUBLIC_SPONSOR_URL` / `PUBLIC_SPONSOR_IMAGE_URL` — empty = renders nothing (same contract as AdSense/Giscus). Plus `.github/FUNDING.yml`.
- **README fork warning**: wrangler.toml sole-source-of-truth warning surfaced next to the deploy button; `apply-template` also resets the new sponsor vars.

## [1.4.0] — 2026-08-15

**AnvilWiki v1.4 — 官网国际化版:中文官网 + 微信交流群 + demo 双向入口。**

### Added
- **Chinese landing page (`/zh/landing`)**: full bilingual landing — every section localized (hero, features, comparison table, showcase, docs, CTA), EN ↔ 中文 toggle, hreflang alternates (x-default → English). The landing speaks for the PROJECT, so it ships its own en/zh pair independent of the demo game's en/ja content locales.
- **Locale auto-detection**: visiting `/landing` with a Chinese browser language auto-redirects to `/zh/landing` (client-side, pre-render, zero runtime cost). Manual toggles are remembered in localStorage and always win.
- **WeChat community group**: QR-code card on both landing pages + README (Chinese & English sections) — "scan to add the maintainer and join the discussion group". Image optimized 952×1374 PNG → 480×693 JPG (44 KB).
- **Demo → landing entry**: hammer icon in the demo site header (desktop) + "AnvilWiki Template" link in the mobile menu, gated by `landingLinkEnabled` in `src/config/project.ts` — `apply-template` flips the flag when it removes the landing pages, so the entry never dead-links.
- **Maintainer attribution**: footer on both landing pages and README — 由 PNG 部落团队主理人 袁锐钦 开源 / "Open-sourced by 袁锐钦 (Yuan Ruiqin), lead of the PNGTRIBE team".

### Changed
- Landing announcement bar is now driven by a `PROJECT_VERSION` constant (kept in sync with package.json) — no more stale hand-written version strings.

## [1.3.0] — 2026-08-15

**AnvilWiki v1.3 — 审计清零版:未完成清单全部落地(codes 范式 + 阅读体验全家桶 + fork 工具链)。**

The final batch of the 2026-08 expert-audit backlog: a complete codes-content paradigm (the #1 traffic entry for game wikis), a full reading-experience suite, and fork-user tooling (locale scaffolding, homepage presets, schema validation).

### Added
- **Codes content paradigm**: `CodeBlock.astro` one-tap copy component + a complete demo codes article (en/ja) — 5 copyable codes, expiry table, "how to redeem" question-style H2s. Codes pages are the highest-traffic wiki entry; the template now ships a reference implementation.
- **Stale-content notice**: articles in time-sensitive categories (bosses / tier-list) older than 90 days automatically show a "possibly outdated" banner (pure `isPossiblyOutdated()` function).
- **Reading-experience suite on articles**: prev/next navigation within a category, reading-time estimate (CJK-adapted), top-edge reading progress bar, Quick Answer copy button, "was this helpful?" feedback, related lazy-loaded videos (`videos` frontmatter, YouTube IDs), print stylesheet (`@media print` strips chrome/ads), and drop-rate `StatBar` visualization component (used in the demo boss guide).
- **AMOLED black theme**: theme toggle now cycles light → dark → pure-black (`html.dark.black`, battery-saving surfaces for OLED phones), persisted + no-FOUC.
- **`pnpm new-locale`**: scaffolds a new language end-to-end (routing.ts + ui.ts + locale JSON clone + content dir) — the 4-place sync that was error-prone by hand.
- **Homepage presets in `apply-template`**: codes-focused / guides-focused / keep-demo skeletons generated from your game name and categories, instead of hand-editing a 270-line demo JSON.
- **`docs/home.schema.json`**: JSON Schema for the locale `home` namespace (displayType enum enforced); `$schema` refs wired into en/ja JSON for VS Code validation.
- **Landing page**: real demo screenshots (desktop home, boss article, mobile) replace skeleton placeholders; announcement bar; "Deploy to Cloudflare" button and `/landing` badge in README.
- **Mobile search entry**: prominent Search item at the top of the mobile menu (readers don't know Cmd+K).
- **i18n smoke tests**: 6 regression tests guarding against hardcoded-locale arrays in routes (the v1.1.0 bug class).

### Changed
- **README repositioned**: tagline and feature list now lead with "100% ad revenue yours"; feature list rebuilt to cover all shipped capabilities.
- **`apply-template` theme rewrite is line-based**: replaces only the 6 `--brand*` variable lines (tolerates custom vars/indentation in globals.css — the old whole-block regex silently broke on user edits).
- **`apply-template` resets `wrangler.toml [vars]`**: forks no longer risk shipping the demo site's Giscus config (SITE_URL set to their domain, Giscus values blanked).
- `new-post` scaffold now guides AI-Overview-friendly writing (question-shaped H2s, 40–60-word direct answers, summary field).
- `organizationJsonLd` emits `sameAs` (configurable in site.ts) for knowledge-graph entity association.
- docs/seo.md gains an "AI search era" chapter (what's built-in + 5 writing rules); content-format.md documents all frontmatter fields and the MDX components (`CodeBlock` / `StatBar`) + patch-notes paradigm.

### Fixed
- `migration-from-nextjs.md` now carries an honesty disclaimer (estimates not battle-tested).

## [1.2.0] — 2026-08-15

**AnvilWiki v1.2 — 专家团审计落地版:项目官网 + 阅读体验 + AI 搜索卡位 + 隐私合规。**

This release lands the findings of a 4-expert audit (SEO/growth · developer experience · reader UX · competitive analysis): a project landing page, wiki-grade reading infrastructure (scrollspy, boss data cards, mobile fixes), AI-search visibility (llms.txt, RSS), and consent-gated analytics.

### Added
- **Project landing page (`/landing`)**: 7-section marketing page introducing the AnvilWiki template itself (Hero with "100% ad revenue" positioning · Lighthouse proof bar · feature grid · comparison table vs Fandom/Starlight/DIY · showcase · docs entry · final CTA). Self-contained in `src/components/landing/` + `src/config/landing.ts`. `apply-template` CLI removes it automatically for fork users (`--keep-landing` to keep).
- **RSS feed (`/rss.xml`)**: default-locale articles, newest first, capped at 50, excludes `noindex`. `<link rel="alternate">` auto-discovery in `BaseLayout`. Uses the already-installed `@astrojs/rss`.
- **llms.txt (`/llms.txt`)**: Markdown site index for AI crawlers (ChatGPT/Perplexity/Claude), generated at build time from the content collection.
- **TOC scrollspy**: the in-view section's TOC link is highlighted while scrolling (pure IntersectionObserver, zero framework runtime).
- **Share button on articles**: native `navigator.share` sheet with clipboard fallback; labels via locale JSON (en/ja).
- **Back-to-top button**: appears after 600px of scroll on article pages.
- **Boss stat card**: optional structured `boss` frontmatter object (hp / weakness / resistant / location / recommendedLevel) rendered as a scannable data card above the article body (`BossStatCard.astro`). Demo boss guides filled in (en + ja).
- **`pnpm check-config`**: cross-validates nav-key / locale / displayType three-place consistency (AGENTS.md rules #4–#5) that `pnpm build` does not enforce.
- **Cookie consent (consent-gated tracking)**: GA / AdSense are no longer injected statically — they load only after the visitor accepts. Choice persists in localStorage; declining means trackers never load. Banner only renders when tracking env vars are set (zero-JS contract unchanged).
- Related-articles cards now show the description (line-clamp-2).

### Changed
- **Ads system rebuilt as Google AdSense-only**. Removed the iframe isolation ad setup (`public/ads/*.html`, `AdBanner.astro`, 7 `PUBLIC_AD_*` env vars) in favor of a streamlined AdSense integration. Ads now use 3 positions (Sticky / Sidebar / InContent), each an `<AdSenseSlot position="...">` component gated on `PUBLIC_ADSENSE_CLIENT` + one slot ID env var. The Sticky banner keeps its dismiss button + localStorage logic. Empty env = no ads rendered (Lighthouse 4×100 contract preserved). See PRD §10 for details.
- **Sticky banner is desktop-only by default** (`hidden md:block`): a 320×50 strip under the header permanently eats ~16% of a phone's first screen — a proven bounce driver. Remove the class to re-enable mobile.
- **sitemap `<lastmod>` injection**: article/list URLs now carry `lastModified ?? date` from frontmatter (the only sitemap field Google trusts for crawl scheduling).
- **Static asset caching**: `/_astro/*` served with `Cache-Control: public, max-age=31536000, immutable`.
- Mobile menu now includes the language switcher (was navigation-only — non-English readers couldn't switch on phones).

### Fixed
- **Third-locale forks fully 404**: five `getStaticPaths` implementations hardcoded `['ja']` while the CLI accepts any locale list — adding a 3rd language killed every route. All now derive from the `locales` array in `routing.ts`.
- **SearchAction pointed at a nonexistent `/search` route** (Pagefind is a client-side modal) — removed from `websiteJsonLd()`.
- **`noindex` frontmatter was never wired up** — now emits `<meta name="robots" content="noindex, nofollow">` via `BaseLayout`.
- **Cover-image docs contradicted the schema**: docs said "path under `/public`", but the Zod `image()` helper expects a path relative to the MDX (Astro Image pipeline). Docs unified.
- **Node version docs said 20** — pnpm 11 requires ≥22.13. CONTRIBUTING.md / deployment.md now say 22.
- **RSS links 404'd**: `@astrojs/rss` appends a trailing slash to relative links, but this site uses `trailingSlash: 'never'` — now passed absolute URLs.
- **GFM tables overflowed on mobile**: `.prose table` is now a scrollable block site-wide.

### Removed
- `public/ads/` directory (6 standalone ad HTML files) and `src/components/ads/AdBanner.astro` (iframe wrapper component).
- 7 `PUBLIC_AD_*` env vars (`PUBLIC_AD_MOBILE_320X50`, `PUBLIC_AD_SIDEBAR_160X300/600`, `PUBLIC_AD_BANNER_300X250/728X90/468X60`, `PUBLIC_AD_NATIVE_BANNER`).

## [1.1.0] — 2026-08-14

**AnvilWiki v1.1 — SEO & E-E-A-T 增强版。**

This release adds AI-Overview-oriented SEO features (TOC, Quick Answer, author byline, VideoGame JSON-LD) and broadens ad support (Google AdSense alongside the iframe ad isolation). Includes a round of naming normalization to keep config/locales schema generic (no demo-game-specific terms).

### Added
- **Article TOC**: Auto-generated table of contents from H2/H3 headings. Sticky on desktop, collapsible `<details>` on mobile (`TableOfContents.astro`).
- **Quick Answer summary block**: Optional `summary` frontmatter field rendered as a callout above the article body — optimized for AI Overviews and featured snippets.
- **Article author byline**: Optional `author` frontmatter field (falls back to `site.defaultAuthor`). E-E-A-T signal.
- **VideoGame JSON-LD**: Injected on the homepage for game entity recognition (`videoGameJsonLd()` in `seo.ts`).
- **Contact page**: New legal page at `/contact` with community links. E-E-A-T trust signal.
- **Google AdSense support**: `AdSenseSlot.astro` component + `PUBLIC_ADSENSE_CLIENT` env var. Coexists with the iframe ad isolation setup.

### Changed
- Homepage `displayType` enum renamed to generic names (`code-cards`→`badge-list`, etc.).
- CSS theme variable renamed: `--nav-theme` → `--brand`.
- Homepage JSON field names renamed (`eyebrow`→`badge`, `primaryCta`→`ctaPrimary`, etc.).
- Demo boss renamed: `gelum`→`emberfang`, `pyra`→`stormcaller`.
- `skinning.md` → `apply-template.md` (restructured as file-organized config reference).
- Ad HTML templates: ad network domain changed to placeholder.
- SEO docs: all knowledge claims cite public authoritative sources.

## [1.0.0] — 2026-08-13

**AnvilWiki v1.0 — 正式发布 / First stable release.**

This release covers everything since v0.2.0: the full PRD roadmap (v1.1–v2.0) is now ✅, the demo site ships Lighthouse 4×100, and optional features (search, ads, comments, image optimization, apply-template CLI) are all production-ready.

### Added
- **Comments system (Giscus, opt-in)**: `Comments.astro` component, env-gated (default off = zero JS, preserves Lighthouse 4×100). Official `<script async data-loading="lazy">` + dual MutationObserver dark-mode sync via postMessage. pathname mapping → different locales get independent threads. `data-lang` follows page locale. See `docs/comments.md`.
- Image `decoding="async"` + explicit `width`/`height` to prevent CLS (ListPage covers, VideoSection thumbnails)
- FAQ accessibility: `aria-expanded` sync on toggle + `data-faq-group` container
- WikiSidebar now visible on tablet (md breakpoint, was lg-only)
- Migration cost breakdown in `docs/migration-from-nextjs.md` (2-hour estimate per site)

### Changed
- PRD status updated: "设计中 · 待 review" → "已实现"
- PRD §14.2: v1.1 (frontmatter migration guide) marked as done
- PRD §14.2: v1.4 (Giscus comments) marked as done — `Comments.astro` env-gated, default off
- AGENTS.md: Hard Rule 9 now requires `SITE_URL` to include `https://` protocol (bare domain fails Astro build with `Invalid url`)
- AGENTS.md: added Hard Rule 11 (comments env-empty = null render contract)
- AGENTS.md: added Hard Rule 12 (`wrangler.toml` 接管 Cloudflare Pages env — dashboard env vars ignored when this file exists)
- Demo `home.hero.videoId` cleared (was placeholder)

### Fixed
- **Cloudflare Pages env injection**: `wrangler.toml` was missing the `[vars]` section, so the build process received ZERO env vars (including `SITE_URL` and all `PUBLIC_GISCUS_*`). Root cause: when `wrangler.toml` exists for a Pages project, it becomes the sole source of truth and the dashboard's "Environment variables" UI is ignored ([Cloudflare docs](https://developers.cloudflare.com/pages/functions/wrangler-configuration/)). Fix: declare all build-time env vars in `[vars]`. This bug was previously masked because `process.env.SITE_URL || 'https://...'` fallback in `astro.config.ts` covered for the missing env.
- **`SITE_URL` protocol requirement**: now enforced — bare domain `anvilwiki.pages.dev` fails Astro build with `Invalid url`. `.env.example` was already correct (`https://...`), but the Cloudflare dashboard config had a bare domain. Documented in AGENTS.md Hard Rule 9 + `docs/deployment.md`.

## [0.2.0] — 2026-08-12

### Added
- `scripts/check-sitemap.ts` — verifies every sitemap URL returns 200
- `scripts/new-post.ts` — interactive MDX article scaffold
- `docs/content-format.md` — frontmatter format spec + migration guide from JS metadata format
- ESLint flat config (`eslint.config.js`) + Prettier config (`.prettierrc` + `.prettierignore`)
- `VideoSection` component — lazy-loaded YouTube embed (zero JS until click)
- `WikiSidebar` component — dynamic article navigation (auto-generated from MDX files)
- `TrendingNow` component — horizontal scroll-snap card row
- `InContentAd` component — page-internal ad slot
- Ad integration: `StickyBanner` in LocaleLayout, `SidebarAd` in WikiSidebar, `InContentAd` in ArticlePage
- Google Analytics + Search Console verification injection (env-var gated)
- CI workflow (`.github/workflows/ci.yml`) — lint + typecheck + build on every PR
- Issue templates (bug report + feature request) and PR template
- `CONTRIBUTING.md`
- `wrangler.toml` for local Cloudflare preview

## [0.1.0] — 2026-08-11

### Added
- Initial public release
- Astro 5 static site (`output: 'static'`, zero adapter, Cloudflare Pages native)
- Content Layer API + Zod schema for type-safe MDX articles
- i18n: as-needed prefix (English no prefix, others prefixed) with single-article English fallback
- Homepage: 8 JSON-driven modules with 4 displayTypes (badge-list / steps / ranked-grid / labeled-cards)
- SEO: Organization / WebSite / Article / BreadcrumbList / ItemList / FAQPage JSON-LD, hreflang, dynamic sitemap, robots.txt
- Theme: CSS variable theming (4 lines to re-theme) + dark mode with no-FOUC
- Ads: 广告 iframe isolation (6 slots), Sticky 320×50 with dismiss button, env-var gated
- Legal pages: about / privacy-policy / terms-of-service / copyright
- Demo content: fictional "Anvil Quest" game (5 MDX articles, en + ja)
- Docs: PRD (1600+ lines), deployment, apply-template (4-step guide), content-format, seo, ads, migration-from-nextjs
- Build: 27 pages, typecheck 0 errors

[Unreleased]: https://github.com/PNGTRID/AnvilWiki/compare/v1.8.0...HEAD
[1.8.0]: https://github.com/PNGTRID/AnvilWiki/compare/v1.7.0...v1.8.0
[1.7.0]: https://github.com/PNGTRID/AnvilWiki/compare/v1.6.0...v1.7.0
[1.6.0]: https://github.com/PNGTRID/AnvilWiki/compare/v1.5.0...v1.6.0
[1.5.0]: https://github.com/PNGTRID/AnvilWiki/compare/v1.4.0...v1.5.0
[1.4.0]: https://github.com/PNGTRID/AnvilWiki/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/PNGTRID/AnvilWiki/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/PNGTRID/AnvilWiki/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/PNGTRID/AnvilWiki/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/PNGTRID/AnvilWiki/compare/v0.2.0...v1.0.0
[0.2.0]: https://github.com/PNGTRID/AnvilWiki/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/PNGTRID/AnvilWiki/releases/tag/v0.1.0
