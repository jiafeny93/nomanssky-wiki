# AGENTS.md

Workspace instructions for ZCode agents working on AnvilWiki.

## Repository Purpose

AnvilWiki is an **open-source (MIT) game wiki site template** built with **Astro 5 + Cloudflare Pages**. It is a static-first Astro setup that deploys to Cloudflare with zero adapters and enjoys free unlimited bandwidth.

Goal: let beginners deploy a game wiki site to Cloudflare Pages for free (unlimited bandwidth) in ~30 minutes, with strong SEO, i18n, and ad-monetization built in.

**Status (as of 2026-08-15)**: v1.8.0 released — full template + AI content skills (`.agent/skills/`) + 9 scripts + 3 CI workflows. Live demo: anvilwiki.pages.dev (Lighthouse 4×100).

## Read These First

- **`docs/PRD.md`** — the single source of truth for architecture, data models, module design, and roadmap. **Read before any code change.** 15 chapters + 3 appendices.
- `README.md` — project pitch + quick start (Chinese + English).

## Intended Tech Stack (verified, as of 2026-08-11)

| Layer       | Choice                                          | Notes                                                                                                                                                                                               |
| ----------- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework   | Astro 5 (`output: 'static'`)                    | Pure static, **no adapter** (unlike Next.js)                                                                                                                                                        |
| Content     | Content Layer API + `glob()` loader, Zod schema | Defined in `src/content.config.ts`. Base dir is `./src/content/wiki` (subdirectory required to avoid Astro's legacy auto-collection of `src/content/<locale>/` folders).                           |
| MDX         | `@astrojs/mdx` ^4.3.x                           | **mdx 3.x fails with Astro 5.18** (`./jsx/renderer.js` not in exports). mdx 4.x pairs with astro 5.x; mdx 7.x needs astro 7.x.                                                                      |
| Styles      | Tailwind CSS 3 + `@astrojs/tailwind`            | Theme via CSS variables mapped in `tailwind.config.mjs` (shadcn-style tokens).                                                                                                                      |
| Icons       | `astro-icon` + `@iconify-json/lucide`           | Use `lucide:` prefix on every icon name. `reddit` does NOT exist in lucide (use `globe`).                                                                                                           |
| UI          | **Pure Astro native components (`.astro`)**     | Do NOT introduce React/Vue/Svelte runtime. Use `<details>`/`<dialog>` + minimal vanilla JS for interactivity.                                                                                       |
| i18n        | Astro built-in (`prefixDefaultLocale: false`)   | English has no `/en` prefix, others prefixed. Spread `[...locales]` into config — Astro's `Locales` type rejects readonly tuples.                                                                   |
| Sitemap     | `@astrojs/sitemap`                              | Auto-generates hreflang alternates from the i18n config.                                                                                                                                            |
| Deploy      | Cloudflare Pages                                | `pnpm build` → `dist/`                                                                                                                                                                              |
| Pkg manager | pnpm 11                                         | **`allowBuilds:` in `pnpm-workspace.yaml`** (NOT `onlyBuiltDependencies` — that's pnpm 10, dead in v11). esbuild + sharp need build approval or `astro build` fails during its pre-build dep check. |
| Node        | 22 LTS (pnpm 11 requires ≥22.13)                |                                                                                                                                                                                                     |

## Architecture: Code/Config/Content Separation (critical)

This is the core design principle of AnvilWiki. **Respect it in every edit:**

```
Code layer   (src/pages, src/components, src/lib)          — fork-once, never edit per-game
Config layer (src/config, src/i18n/routing.ts, globals.css, public/) — edit once per game
Content layer (src/content, src/locales)                   — fully replace per game
```

- Changing content must not touch framework code.
- Changing config must not rewrite framework.
- Framework layer should have **zero** game-specific strings.

## Engineering Constraints

1. **UI 文案全部走 JSON** (`src/locales/<locale>.json`),组件里不硬编码文字。
2. **主题色只管 `--brand` / `--brand-light`**(`:root` 2 行 + `.dark` 2 行,共 4 行),组件里所有颜色引用 `var(--brand)`,禁止硬编码 hex/rgba。
3. **sitemap 扫描实际 MDX 文件**——不从配置数组生成 URL,因为列表页展示的条目可能还没有对应文章。
4. **分类 key 在 3 个位置保持一致**:`navigation.ts` 的 `NAVIGATION_CONFIG[].key` = `en.json` 的 `nav.<key>` = `src/content/<locale>/<key>/` 目录名。
5. **语言列表在 3 个位置保持一致**:`routing.ts` 的 `locales` = `src/locales/*.json` 文件 = `src/content/<locale>/` 目录。
6. **文章正文从 H2 起**——不写 H1,`ArticlePage` 用 frontmatter 的 `title` 渲染 H1。
7. **og:image / twitter:image 用绝对路径**——`${SITE_URL}/...`,不用相对路径。
8. **广告 key 走 env 变量**——key 为空时组件不渲染,不硬编码。
9. **域名走 `SITE_URL` 环境变量**——不在代码里写死域名。`SITE_URL` 必须含 `https://` 协议(Astro 的 `site:` 配置会校验 URL 格式,裸域名构建报错)。
10. **UI 不用 emoji**——图标用 lucide(`astro-icon` 或 inline SVG)。
11. **评论组件 env 空值 = 不渲染** — `Comments.astro` 在 `PUBLIC_GISCUS_REPO` / `PUBLIC_GISCUS_REPO_ID` / `PUBLIC_GISCUS_CATEGORY` / `PUBLIC_GISCUS_CATEGORY_ID` 任一为空时 `return null`。与广告组件同模式,默认关闭是模板的开箱契约(保 Lighthouse 4×100)。不要给这些 env 加默认值或硬编码 demo 配置。
12. **`wrangler.toml` 接管 Cloudflare Pages env** — 当 `wrangler.toml` 存在时,它是 Pages 项目 env 的唯一真相源,dashboard 的 Environment variables UI 被完全忽略([官方文档](https://developers.cloudflare.com/pages/functions/wrangler-configuration/))。所有构建时 env 变量必须在 `wrangler.toml` 的 `[vars]` 段声明。fork 用户须知:要么改 `[vars]` 值,要么删 `wrangler.toml` 让 dashboard 接管。详见 `docs/deployment.md`。

## i18n Fallback Rules

- **文章详情页**:请求的语言版本不存在时,回退到英文(不返回 404)。frontmatter 也回退。
- **列表页**:不回退——该语言没有文章就显示空状态(`shared.noArticles`)。
- 这个不对称是有意的:列表追求准确(不展示不存在的内容),详情追求可达(直接 URL 永远能打开)。

## Ads: Google AdSense, 3 Positions

广告系统基于 Google AdSense,3 个广告位(Sticky / Sidebar / InContent)各一个 `<AdSenseSlot position="...">` 组件。`AdSenseSlot` 根据 `position` 读对应的 `PUBLIC_ADSENSE_SLOT_*` 环境变量,渲染 `<ins class="adsbygoogle">` 标签。`PUBLIC_ADSENSE_CLIENT` 或对应 slot ID 为空时组件 `return null` 不渲染(保 Lighthouse 4×100 开箱契约)。AdSense loader 由 `BaseLayout.astro` 在 `<head>` 注入,仅当 `PUBLIC_ADSENSE_CLIENT` 有值时加载。详见 PRD §10。

## Conversational Content Authoring (AI-native page generation)

Fork users drive this template from AI coding agents (ZCode / Claude Code / Codex / Cursor). They should be able to say "write a boss guide from these notes" and get a build-passing MDX page — no scripts required for authoring. Rules for any agent creating content:

1. **Read before writing**: `docs/content-format.md` (field table + body rules), `src/content.config.ts` (Zod schema is the hard gate — invalid frontmatter fails `pnpm build`), `src/config/navigation.ts` (`category` must be a `CONTENT_TYPES` key), and one existing article of the same type for structure.
2. **Hard frontmatter rules**: `description` 40–165 chars; `title` ≤ 80 chars; H1 never in the body (first heading is H2, question-shaped); `summary` is a 40–60 word direct answer (Quick Answer card + AI Overviews candidate); `tags` reuse existing tag vocabulary (grep `tags:` under `src/content/wiki/`); unverified drafts get `draft: true`; fast-patching games get `gameVersion`.
3. **Component vocabulary** (import from `~/components/...`): `CodeBlock` (codes), `Callout` (info/tip/warn/danger), `Accordion` (collapsible detail), `Video` (inline YouTube, register IDs in frontmatter `videos` for JSON-LD), `AffiliateLink` (sponsored, auto `rel`), plus frontmatter-driven `boss` stat card / `codes` (Active+Expired auto-split) / `videos` / `gallery`.
4. **Verify, don't trust yourself**: after writing, run `pnpm check-content && pnpm build`. Both green = done. Never fabricate game facts (codes, stats) — ask the user for data; a single fake code destroys site trust.
5. **Slash-command skills** live in `.agent/skills/` (Agent Skills open standard): `anvil-new-article` (generate a page from any source material), `anvil-update-codes` (apply new/expired codes), `anvil-refresh` (freshness audit). Agents supporting the standard auto-discover them; this section is the zero-install fallback.

## Commands

```bash
pnpm install
pnpm dev              # dev server, http://localhost:4321
pnpm build            # includes Content schema validation — fails on bad frontmatter
pnpm typecheck        # astro check (0 errors expected)
pnpm lint             # ESLint (eslint-plugin-astro)
pnpm test             # Vitest (url + seo + tags + i18n-smoke)
pnpm check-config     # scripts/check-config.ts — nav/locale 3-place consistency
pnpm new-locale       # scripts/new-locale.ts — scaffold a new language
pnpm check-sitemap    # scripts/check-sitemap.ts — verify all sitemap URLs return 200
pnpm check-links      # scripts/check-links.ts — audit dist/ internal links (run after build)
pnpm check-i18n       # scripts/check-i18n.ts — translation coverage report (--strict to gate)
pnpm check-content    # scripts/check-content.ts — content lint (no H1, alt text, link slashes)
pnpm refresh-audit    # scripts/refresh-audit.ts — deterministic freshness report (codes pages >7d, stale categories >90d)
pnpm apply-template   # interactive template-apply CLI (hex→HSL theme, rewrite config/locales)
pnpm new-post         # interactive MDX article scaffold
```

## Decisions to Confirm with User Before Deviating

- Adding any JS framework runtime (React/Vue/Svelte islands) — PRD ADR-002 says no.
- Switching Cloudflare Pages → Workers — PRD ADR-003 says Pages default.
- Changing license from MIT.
- Changing the demo game from the fictional "Anvil Quest".

## Astro 5 Content Layer Gotchas (verified by debugging)

These behaviors are NOT obvious from the docs and cost significant debugging time. They are all real, verified against astro@5.18.2:

1. **`entry.id` includes `.mdx`, but `getEntry()` does NOT want it.** `getCollection()` returns ids like `en/bosses/emberfang.mdx`; `getEntry('wiki', 'en/bosses/emberfang.mdx')` returns `null`; `getEntry('wiki', 'en/bosses/emberfang')` returns the entry. `src/i18n/content.ts` strips the extension in `parseEntryId` and queries without it in `getEntryWithFallback`.

2. **`entry.render()` does NOT exist in Content Layer API.** Use the standalone `render` function: `import { render } from 'astro:content'; const { Content } = await render(entry);`. The old method-based API is gone.

3. **`getStaticPaths()` is compiled to its own module — top-level `const` in the `.astro` file are NOT visible inside it.** Inline all data (arrays, lookup tables) inside the function body. This is why `[locale]/[legal].astro` inlines `legalPages` inside `getStaticPaths` even though an identical const exists outside.

4. **`Astro.params.slug` (not `Astro.props.slug`) is how you read rest params.** `getStaticPaths` returns `{ params: { slug } }`, which surfaces as `Astro.params.slug`. `Astro.props` is for data passed via the `props` field of `getStaticPaths` return.

5. **`src/content/<locale>/` triggers legacy auto-collection.** If MDX files sit directly under `src/content/<locale>/`, Astro 5 auto-generates a collection named after the locale and prints a deprecation warning. The fix: put content under a named collection dir like `src/content/wiki/<locale>/`, with `glob({ base: './src/content/wiki' })`.

6. **`prefixDefaultLocale: false` means `/` is the English homepage.** Do NOT redirect `/` to `/en/`. The English homepage lives at `src/pages/index.astro`; non-default locales live at `src/pages/[locale]/index.astro`. Similarly, English content routes are at `src/pages/[...slug].astro` (no locale segment), other locales at `src/pages/[locale]/[...slug].astro`.
