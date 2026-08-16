# AnvilWiki 产品需求文档（PRD）

> **版本**：v1.0
> **日期**：2026-08-12
> **状态**：已发布（demo 站 anvilwiki.pages.dev 上线，Lighthouse 全 100，CI 全绿）
> **维护者**：AnvilWiki 开源项目
> **协议**：MIT

---

## 目录

- [第 1 章 项目背景](#第-1-章-项目背景)
- [第 2 章 目标与非目标](#第-2-章-目标与非目标)
- [第 3 章 技术选型](#第-3-章-技术选型)
- [第 4 章 整体架构](#第-4-章-整体架构)
- [第 5 章 目录结构](#第-5-章-目录结构)
- [第 6 章 数据模型](#第-6-章-数据模型)
- [第 7 章 核心模块设计](#第-7-章-核心模块设计)
- [第 8 章 SEO 工程化](#第-8-章-seo-工程化)
- [第 9 章 多语言（i18n）](#第-9-章-多语言i18n)
- [第 10 章 广告系统](#第-10-章-广告系统)
- [第 11 章 套用模板指南](#第-11-章-套用模板指南)
- [第 12 章 部署方案](#第-12-章-部署方案)
- [第 13 章 测试与质量保障](#第-13-章-测试与质量保障)
- [第 14 章 开发路线图](#第-14-章-开发路线图)
- [第 15 章 开源运营](#第-15-章-开源运营)
- [附录 A 环境变量清单](#附录-a-环境变量清单)
- [附录 B 上线前检查清单](#附录-b-上线前检查清单)
- [附录 C 术语表](#附录-c-术语表)

---

## 第 1 章 项目背景

### 1.1 问题陈述

游戏 wiki 站点（game wiki site）是一种以搜索引擎为主要流量来源的内容站：围绕某款游戏（尤其是 Roblox、Steam 新游）的攻略、兑换码、tier list 等关键词，批量生产结构化文章，通过 SEO 获取自然流量，再通过广告（如 Google AdSense）变现。

这类站点的技术特征非常明确：

- **纯内容站**——无登录、无数据库、无实时数据，本质是 MDX/Markdown 文章 + 静态页面。
- **SEO 是生命线**——title / description / JSON-LD / sitemap / hreflang / 内链结构必须工程化自动生成。
- **多语言**——英文为主（SEO 最优），按热度补日/俄/葡/西等语言，缺失内容要能 fallback 英文不报错。
- **批量套用**——同一套框架服务几十上百个不同游戏，换游戏只改配置和内容，不动框架代码。
- **免费部署 + 高带宽**——单个站流量周期 2-3 个月，流量峰值可能很高，需要免费且不限带宽的部署方案。

### 1.2 设计目标

AnvilWiki 围绕游戏 wiki 站点的技术特征，确立以下设计目标：

- **免费部署**：选择 Cloudflare Pages 作为默认部署平台，享受无限带宽 + 全球 CDN + 免费 SSL，单站流量再大也不产生费用。
- **高性能**：静态优先架构，零 JS by default，目标 Lighthouse Performance ≥ 95，Core Web Vitals 全绿。
- **SEO 工程化**：sitemap / JSON-LD / hreflang / robots / 内链结构全部由代码自动生成，填内容即生效。
- **多语言**：as-needed 前缀策略（英文无前缀），文章单篇 fallback 英文不 404，列表不 fallback。
- **批量套用**：同一套框架服务几十上百个不同游戏，换游戏只改配置和内容，不动框架代码。
- **新手友好**：连 GitHub 仓库自动部署，无需理解适配器/middleware，30 分钟内完成 fork → 套用模板 → 部署上线全流程。

> AnvilWiki 选择纯静态输出，部署到 Cloudflare Pages 无需适配器，直接托管 `dist/` 静态文件即可。

### 1.3 AnvilWiki 的定位

**AnvilWiki 是一个开源（MIT）的游戏 wiki 站点模板**，用 Astro + Cloudflare Pages 技术栈，让新手零成本免费部署上线。模板只负责消费标准 YAML frontmatter 的 MDX 文章，不绑定特定内容生成工具链。

> **命名由来**：Anvil（铁砧）——锻造装备的基础工具，寓意这是「锻造游戏 wiki 站的基础模板」。

---

## 第 2 章 目标与非目标

### 2.1 核心目标

| # | 目标 | 验收标准 |
|---|---|---|
| G1 | **Cloudflare 原生部署** | 纯静态输出，零适配器，部署到 Cloudflare Pages 无需任何额外配置。 |
| G2 | **免费无限带宽** | 利用 Cloudflare Pages 静态站无限带宽，单站流量再大也不产生费用。 |
| G3 | **高性能** | Lighthouse Performance ≥ 95，Core Web Vitals（LCP/FID/CLS）全绿。 |
| G4 | **新手友好** | 新手照 README 30 分钟内完成 fork → 套用模板 → 部署上线全流程。 |
| G5 | **SEO 工程化** | sitemap / JSON-LD / hreflang / robots / 内链全部由代码自动生成，填内容即生效。 |
| G6 | **多语言开箱即用** | as-needed 前缀策略（英文无前缀），文章单篇 fallback 英文不 404，列表不 fallback。 |
| G7 | **模板套用工程化** | 结构化套用流程（见 docs/apply-template.md），改配置不改框架代码。 |
| G8 | **广告就绪** | 内置 Google AdSense 广告系统，环境变量驱动，新手填 key 即生效。 |
| G9 | **开源** | MIT 协议，中英双语 README，完整文档，欢迎社区贡献。 |

### 2.2 非目标（明确不做）

| # | 非目标 | 原因 |
|---|---|---|
| N1 | **不做服务端动态能力** | 无登录、无数据库、无实时数据。需要这些的场景请用 Next.js / SvelteKit。 |
| N2 | **不做可视化后台/CMS** | 内容靠 MDX 文件 + Git，文件系统即数据库。需要 CMS 的用户自行接 Astro DB / Decap CMS。 |
| N3 | **不做自动化内容生成** | 内容生成是独立工具链，AnvilWiki 只负责消费标准 MDX 文章。提供 frontmatter 格式说明，不绑定特定生成工具。 |
| N4 | **不做 React/Vue/Svelte 全栈** | 交互组件用纯 Astro 原生 + 极少 vanilla JS。不为单一组件引入整个 framework runtime。 |
| N5 | **广告默认接 Google AdSense** | 广告系统基于 Google AdSense（`<ins class="adsbygoogle">`），3 个广告位（Sticky / Sidebar / InContent）各一个 slot，环境变量驱动。不内置其他广告网络的隔离方案。 |
| N6 | **不做内容运营教学** | AnvilWiki 是模板，不是教程。文档聚焦「怎么用模板」，不教选词/SEO 策略/外链建设。 |

### 2.3 目标用户画像

| 画像 | 特征 | AnvilWiki 如何服务 |
|---|---|---|
| **P1：有建站经验的开发者** | 有游戏 wiki 建站经验，会用 Cursor/Claude Code，想搭一套自己的站。 | 标准的 MDX + YAML frontmatter 格式，兼容任何内容生成工具链，fork 即用。 |
| **P2：独立开发者** | 有前端基础，想快速做内容站变现。 | 提供完整文档 + 示例 demo，fork 即用。 |
| **P3：完全新手** | 无代码基础，只会按教程操作。 | README 写到截图级，Cloudflare Pages 零配置部署，5 分钟上线。 |

---

## 第 3 章 技术选型

### 3.1 技术选型概览

AnvilWiki 面向「游戏 wiki 站点」这一特定场景，在框架、部署、内容、SEO 等关键维度上做了如下选型：

| 维度 | AnvilWiki 选型 | 选型理由 |
|---|---|---|
| 定位 | 游戏 wiki 模板 | 专为游戏 wiki 内容站设计，覆盖攻略/兑换码/tier list 等典型内容形态。 |
| 框架 | Astro（轻量） | 静态优先、零 JS by default、岛屿架构（只在交互处 hydrate），Cloudflare 原生友好。 |
| 部署 | Cloudflare Pages（无限带宽） | 免费无限带宽 + 全球 CDN + 免费 SSL + Git 自动部署，匹配游戏站 2-3 个月高流量周期。 |
| Cloudflare 兼容 | 原生（纯静态，零适配器） | 纯静态输出，直接托管 `dist/`，无需任何 adapter。 |
| 内容管理 | Content Collections | 类型安全 + Zod schema 校验，构建时发现字段错误。 |
| 多语言 | Astro i18n as-needed | `prefixDefaultLocale: false` 实现默认语言（英文）无前缀。 |
| 首页模块 | JSON 驱动（v0.2：6 区块 / 4 explore 模块） | 文案与组件解耦，换游戏只改 JSON，组件零改动。 |
| SEO 工程化 | 完整（sitemap/JSON-LD/hreflang/robots） | sitemap / JSON-LD（Organization/WebSite/Article/BreadcrumbList/ItemList/FAQPage）/ hreflang / robots 全部代码自动生成。 |
| 广告系统 | Google AdSense | 3 个广告位（Sticky / Sidebar / InContent）各一个 AdSense slot，环境变量驱动，新手填 key 即生效。 |
| 套用模板流程 | 配置参考手册 | 换游戏只改配置层 + 替换内容层，代码层不动。 |
| 游戏站适配 | 专为游戏站设计 | 内置游戏站特定的 SEO（ItemList/Breadcrumb）+ 兑换码/tier list 专用 displayType。 |

### 3.2 技术栈选型

| 层 | 选型 | 版本 | 理由 |
|---|---|---|---|
| **框架** | Astro | 5.x（最新稳定） | 静态优先，岛屿架构（只在交互处 hydrate），零 JS by default，Cloudflare 原生友好。 |
| **输出模式** | `output: 'static'` | — | 纯静态 HTML，无需 adapter，直接部署 Cloudflare Pages。 |
| **内容** | Content Layer API + `glob()` loader | 内置 | 类型安全，Zod schema 校验，构建时发现字段错误。配合 YAML frontmatter，替代 `export const metadata = {}` 方案。 |
| **MDX** | `@astrojs/mdx` | latest | 支持 MDX 组件 + YAML frontmatter，兼容标准 MDX 内容。 |
| **样式** | Tailwind CSS | 4.x | 原子化 CSS，零运行时，主题色与组件样式解耦。 |
| **主题色** | CSS 变量 `--brand` + `--brand-light` | — | 改主题色只需 4 行（`:root` 2 行 + `.dark` 2 行），其他变量通过 `var()` 自动跟随。 |
| **图标** | lucide（通过 `astro-icon` 或 inline SVG） | latest | 兼容「禁止 emoji」规则。 |
| **UI 组件** | **纯 Astro 原生组件**（`.astro`） | — | 不引入 React/Vue runtime。FAQ 用原生 `<details>`，移动端菜单用 `<details>` 或极少 JS。 |
| **i18n** | Astro 内置 i18n + 自建 fallback 封装 | — | `routing.prefixDefaultLocale: false` 实现 as-needed 前缀。 |
| **sitemap** | `@astrojs/sitemap` | latest | 自动生成 sitemap.xml，支持 i18n alternate。 |
| **SEO** | 自建 JSON-LD 组件 + meta 工具函数 | — | Organization/WebSite/Article/BreadcrumbList/ItemList。 |
| **包管理** | pnpm | 9.x | 快、省磁盘、Cloudflare Pages 原生支持。 |
| **Node** | Node 20 LTS | — | Cloudflare Pages 默认支持，稳定。 |
| **部署** | Cloudflare Pages | — | 无限带宽 + 全球 CDN + 免费 SSL + Git 自动部署。 |
| **协议** | MIT | — | 最宽松，允许商用。 |

### 3.3 关键技术决策记录（ADR）

#### ADR-001：为什么选 Astro

AnvilWiki 选择 Astro 作为底层框架，基于以下优势：

- **静态优先**：默认输出纯静态 HTML，无需 adapter，直接部署 Cloudflare Pages。
- **零 JS by default**：页面默认不携带 framework runtime，只在交互处按需 hydrate（岛屿架构），客户端体积小。
- **Cloudflare 原生友好**：纯静态输出与 Cloudflare Pages 静态托管天然契合。
- **Content Collections**：内置类型安全的内容管理机制，配合 Zod schema 实现构建时字段校验。
- **框架 agnostic**：支持按需引入 React/Vue/Svelte island，未来扩展交互组件时不会被单一框架锁定。
- **i18n 内置**：原生支持 `prefixDefaultLocale: false`（as-needed 前缀策略），符合多语言 URL 规划。

#### ADR-002：为什么用纯 Astro 原生组件而不是 React islands

游戏 wiki 99% 的页面是静态展示（首页模块、文章页、列表页），只有极少数交互（FAQ 折叠、移动端菜单、广告关闭按钮）。纯 Astro 原生组件足够覆盖这些场景，无需引入 framework runtime。

**决策**：交互组件用纯 Astro 原生方案——
- FAQ 手风琴 → 原生 `<details>` + `<summary>`（零 JS）
- 移动端菜单 → `<details>` 或 5 行 vanilla JS
- 广告关闭按钮 → 3 行 vanilla JS（localStorage 记忆）
- 主题切换 → 5 行 vanilla JS（toggle `.dark` class）

**例外**：如果用户想要更复杂的交互（如搜索、评论），文档提供「如何接入 React island」的指南，但默认不带。

#### ADR-003：Cloudflare Pages vs Cloudflare Workers

Cloudflare 同时提供 Pages（静态托管）和 Workers（边缘计算）两种方案。AnvilWiki 是纯静态站点（无 SSR、无 API、无按需渲染），选择 **Pages** 的理由：

| 维度 | AnvilWiki 需求 | Pages 是否满足 |
|---|---|---|
| 托管 `dist/` 静态文件 | ✅ 需要 | ✅ 原生（`dist/` 直接托管） |
| 连 GitHub 自动构建部署 | ✅ 需要（新手零配置） | ✅ 原生（连 GitHub 自动构建） |
| UI 一键部署 | ✅ 需要（新手友好） | ✅ 原生 |
| 无限带宽 + 全球 CDN | ✅ 需要 | ✅ |
| 未来迁移到 Workers（若需要 SSR/API） | 可选 | ✅ 可平滑迁移 |

**决策**：默认 Pages（新手友好、静态站原生适配），文档补充 Workers 部署方式（进阶用户、需要 SSR/API 时）。

---

## 第 4 章 整体架构

### 4.1 分层架构

AnvilWiki 采用**分层设计**的架构设计：

```
┌─────────────────────────────────────────────────┐
│  代码层（固定，跨项目复用，fork 后不动）              │
│  ├── Astro 路由结构（src/pages/）                  │
│  ├── Content Collections 内容引擎                  │
│  ├── i18n 系统（as-needed 前缀 + fallback）        │
│  ├── SEO 组件（sitemap、JSON-LD、hreflang、robots）│
│  ├── 首页模块渲染器（4 种 displayType）             │
│  ├── 广告组件（Google AdSense）                     │
│  └── 主题色 CSS 变量体系                            │
├─────────────────────────────────────────────────┤
│  配置层（每个游戏改一次）                            │
│  ├── src/config/site.ts      — 站点信息（名称/域名/社交） │
│  ├── src/config/navigation.ts — 内容类型定义        │
│  ├── src/i18n/routing.ts     — 支持语言列表         │
│  ├── src/styles/globals.css  — 主题色 CSS 变量      │
│  └── public/                 — favicon / hero / manifest │
├─────────────────────────────────────────────────┤
│  内容层（每次新站完全替换）                          │
│  ├── src/content/    — MDX 文章（按 locale/type 组织）│
│  └── src/locales/*.json — UI 文案 + 首页 home 命名空间 │
└─────────────────────────────────────────────────┘
```

**核心原则**：
- 内容和配置的修改不需要触及代码层。
- 换游戏 = 改配置层（~5 个文件） + 替换内容层（content/ 和 locales/）。
- 代码层 fork 后永不改动（除非升级 AnvilWiki 版本）。

### 4.2 数据流

```
开发者写 MDX 文章（带 frontmatter）
         │
         ▼
Astro 构建时（pnpm build）
  ├── Content Collections glob loader 扫描 src/content/**/*.mdx
  ├── Zod schema 校验 frontmatter（字段缺失立即报错，构建失败）
  ├── 为每篇文章生成类型安全的 entry（{ id, data, body, render() }）
  ├── 多语言 fallback 封装：getEntryWithFallback(type, slug, locale)
  ├── 动态路由 src/pages/[locale]/[...slug].astro 预生成所有静态 HTML
  ├── @astrojs/sitemap 集成自动扫描所有页面生成 sitemap
  ├── JSON-LD 组件为每页注入结构化数据
  └── 输出到 dist/
         │
         ▼
Cloudflare Pages（连 GitHub 自动部署）
  ├── 全球 CDN 分发 dist/ 静态文件
  ├── 无限带宽
  └── 自动 SSL
         │
         ▼
用户访问 / 搜索引擎爬取
```

### 4.3 渲染策略

| 页面类型 | 渲染方式 | 说明 |
|---|---|---|
| 首页 `/` | **静态（build-time）** | 构建时从 locales/en.json 读 home 命名空间渲染。 |
| 列表页 `/bosses` | **静态** | 构建时从 Content Collection 查询该分类所有文章。 |
| 文章页 `/bosses/emberfang` | **静态** | 构建时从 Content Collection 取该文章 + fallback 逻辑。 |
| 法律页 `/about` 等 | **静态** | 硬编码英文正文（不翻译），复用 [locale] layout。 |
| sitemap.xml | **静态 endpoint** | 构建时生成。 |
| robots.txt | **静态 endpoint** | 构建时生成。 |

**全部静态**——这是性能和 Cloudflare 兼容性的根本保证。没有任何按需渲染（on-demand rendering），因此**不需要任何 adapter**。

---

## 第 5 章 目录结构

```
anvilwiki/
├── astro.config.mjs              # ⭐ Astro 配置（output/i18n/integrations/site URL）
├── content.config.ts             # ⭐ Content Collections schema 定义（Zod）
├── tailwind.config.mjs           # Tailwind 配置（扫描路径 + 主题色映射）
├── tsconfig.json                 # TypeScript 严格模式
├── package.json
├── pnpm-lock.yaml
├── wrangler.toml                 # Cloudflare Pages 配置（可选，用于 wrangler 本地预览）
├── .env.example                  # 环境变量模板（广告 key 等）
├── .gitignore
├── .nvmrc                        # Node 20 LTS
├── README.md                     # ⭐ 项目门面（中英双语，新手指南）
├── LICENSE                       # MIT
├── CONTRIBUTING.md               # 贡献指南
├── CHANGELOG.md                  # 版本变更
├── docs/
│   ├── PRD.md                    # ⭐ 本文档
│   ├── deployment.md             # Cloudflare Pages 部署详细指南
│   ├── apply-template.md          # 配置参考手册（按文件组织）
│   ├── content-format.md         # MDX 文章格式规范
│   ├── seo.md                    # SEO 工程化说明
│   └── migration-from-nextjs.md  # 从传统 Next.js 模板迁移指南
├── public/
│   ├── images/
│   │   └── hero.webp             # Hero 图（WebP，og:image 绝对路径引用）
│   ├── favicon.ico
│   ├── favicon-16x16.png
│   ├── favicon-32x32.png
│   ├── apple-touch-icon.png
│   ├── android-chrome-192x192.png
│   ├── android-chrome-512x512.png
│   ├── manifest.json             # PWA manifest
│   ├── ads.txt                   # 广告授权（Google AdSense 等）
│   └── robots.txt                # （构建时由 endpoint 生成，此文件可不存在）
├── src/
│   ├── content/                  # ⭐ 内容层：MDX 文章
│   │   ├── en/
│   │   │   ├── bosses/
│   │   │   │   └── emberfang.mdx     # → /bosses/emberfang
│   │   │   └── guides/
│   │   │       └── beginner.mdx  # → /guides/beginner
│   │   └── ja/                   # 日文版（可选）
│   │       └── bosses/
│   │           └── emberfang.mdx     # → /ja/bosses/emberfang
│   ├── pages/                    # ⭐ 代码层：路由
│   │   ├── index.astro           # 根路径 → redirect 到默认语言首页
│   │   ├── [locale]/             # 语言前缀路由（英文无前缀由 prefixDefaultLocale:false 实现）
│   │   │   ├── index.astro       # 首页（JSON 驱动，v0.2：6 区块 / 4 explore 模块）
│   │   │   ├── [...slug].astro   # ⭐ 统一路由：slug.length=1→列表页，>1→详情页
│   │   │   ├── faq.astro         # 独立 FAQ 页（v0.2 从首页移出）
│   │   │   ├── privacy-policy.astro
│   │   │   ├── terms-of-service.astro
│   │   │   ├── copyright.astro
│   │   │   ├── about.astro
│   │   │   └── 404.astro
│   │   ├── robots.txt.ts         # 动态 robots（sitemap 由 @astrojs/sitemap 集成自动生成）
│   │   └── robots.txt.ts         # 动态 robots
│   ├── components/               # ⭐ 代码层：纯 Astro 组件
│   │   ├── layout/
│   │   │   ├── BaseLayout.astro  # <html>/<head>/global meta/Organization JSON-LD
│   │   │   └── LocaleLayout.astro # [locale] 公共外壳（Header + Footer + 主内容）
│   │   ├── header/
│   │   │   ├── SiteHeader.astro  # 导航栏 + Logo + 主题切换 + 语言切换
│   │   │   ├── LanguageSwitcher.astro
│   │   │   └── ThemeToggle.astro # 5 行 JS 的暗色切换
│   │   ├── footer/
│   │   │   └── SiteFooter.astro  # 社交链接 + 法律链接
│   │   ├── sidebar/
│   │   │   └── WikiSidebar.astro # ⭐ 动态导航（getDynamicNavigation 等价物）
│   │   ├── home/                 # 首页组件（v0.2：6 区块）
│   │   │   ├── HomePage.astro        # ⭐ 首页主体（逐 section 渲染 home JSON）
│   │   │   ├── VideoSection.astro    # YouTube 嵌入（仅 hero.videoId 非空时）
│   │   │   ├── QuickStart.astro      # ⭐ v0.2 新增：4 个大图标快速入口卡片
│   │   │   ├── TrendingNow.astro     # 横向滚动热门（v0.2 起首页不再调用，保留备用）
│   │   │   ├── ExploreModules.astro  # ⭐ 4 模块容器，整卡可点击，按 displayType 分发
│   │   │   ├── FaqSection.astro      # 原生 <details> 手风琴（v0.2 起由 /faq 独立页调用）
│   │   │   └── modules/
│   │   │       ├── CodeCards.astro   # displayType: badge-list
│   │   │       ├── StepByStep.astro  # displayType: steps
│   │   │       ├── TierGrid.astro    # displayType: ranked-grid
│   │   │       └── CardList.astro    # displayType: labeled-cards
│   │   ├── article/
│   │   │   ├── ArticlePage.astro  # 详情页主体（H1 + MDX body + 面包屑 + 相关文章）
│   │   │   └── ListPage.astro     # 列表页主体（分类标题 + 文章卡片列表）
│   │   ├── seo/
│   │   │   └── JsonLd.astro       # ⭐ 通用 JSON-LD 注入组件
│   │   └── ads/
│   │       ├── AdSenseSlot.astro  # ⭐ AdSense <ins> 广告单元（position prop → slot env）
│   │       ├── StickyBanner.astro # Sticky 粘顶横幅 + 关闭按钮
│   │       ├── SidebarAd.astro    # 桌面端 fixed 侧边栏
│   │       └── InContentAd.astro  # 文章内广告位
│   ├── config/                   # ⭐ 配置层
│   │   ├── site.ts               # 站点信息（name/domain/social/gameMeta）
│   │   └── navigation.ts         # ⭐ NAVIGATION_CONFIG 单一真相源
│   ├── i18n/                     # ⭐ 代码层 + 配置层
│   │   ├── routing.ts            # ⭐ 语言列表唯一源（locales/defaultLocale）
│   │   ├── ui.ts                 # UI 文案加载器（deepMerge fallback）
│   │   └── content.ts            # ⭐ 文章加载封装（getEntryWithFallback 等）
│   ├── locales/                  # ⭐ 内容层：UI 文案
│   │   ├── en.json               # home.* / nav / footer / 分类 overview*
│   │   └── ja.json               # （deepMerge en，缺 key 自动回退）
│   ├── styles/
│   │   └── globals.css           # ⭐ --brand / --brand-light（4 行改主题色）
│   └── lib/
│       ├── content.ts            # Content Collections 查询封装
│       ├── navigation.ts         # getDynamicNavigation()（扫描 content 生成分组）
│       ├── seo.ts                # JSON-LD 构造函数（Organization/Article/Breadcrumb/ItemList）
│       └── url.ts                # URL 构造（locale 前缀、slug 转换、绝对路径）
├── scripts/
│   ├── new-post.ts               # 脚手架：生成新文章 MDX 模板
│   ├── check-sitemap.ts          # 检查 sitemap 所有 URL 返回 200

└── .github/
    ├── workflows/
    │   └── ci.yml                # PR 检查（lint + typecheck + build）
    ├── ISSUE_TEMPLATE/
    │   ├── bug-report.md
    │   └── feature-request.md
    └── PULL_REQUEST_TEMPLATE.md
```

### 5.1 目录设计要点

1. **`src/content/` 而非根目录 `content/`**：Astro 5 的 Content Layer API 用 `glob({ base: './src/content' })` 显式指定，内容统一收敛在 `src/` 下，不污染项目根目录。
2. **`content.config.ts` 在根目录**：Astro 5 的约定（取代老的 `src/content/config.ts`）。
3. **配置文件集中在 `src/config/`**：新手套用模板时只关注这一个目录 + `globals.css` + `locales/`。
4. **`scripts/` 提供脚手架**：降低新手写 MDX 的门槛。
5. **`docs/` 完整文档**：每个关注点一个文件，README 只做导航。

---

## 第 6 章 数据模型

### 6.1 MDX 文章 frontmatter schema

定义在 `content.config.ts`：

```typescript
// content.config.ts
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const wiki = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content' }),
  schema: z.object({
    // 必填
    title: z.string().max(70),              // SEO title，建议 50-60 字符
    description: z.string().min(50).max(160), // meta description，155 字符最佳
    category: z.string(),                   // 内容类型 slug，如 'bosses'/'guides'（须在 navigation.ts 定义）
    date: z.coerce.date(),                  // 发布日期
    // 可选
    lastModified: z.coerce.date().optional(), // 最后修改日期（影响 Article JSON-LD dateModified）
    image: z.string().optional(),           // 封面图（相对 /public 或绝对 URL），缺省用 hero.webp
    tags: z.array(z.string()).optional(),   // 标签（用于相关文章推荐）
    noindex: z.boolean().default(false),    // 是否禁止索引
  }),
});

export const collections = { wiki };
```

**Content Collections 的优势**：
- YAML frontmatter + Zod schema，**构建时校验**，字段缺失/类型错误立即 fail build。
- 类型安全的 entry（`{ id, data, body, render() }`），组件 props 自动推断，无需手动 cast。
- frontmatter 与正文分离，MDX 作者只关心内容，字段规范由 schema 强约束。

### 6.2 文章示例

```mdx
---
title: "Emberfang Boss Guide - Complete Strategy"
description: "Complete strategy guide for defeating Emberfang, including attack patterns, weaknesses, and recommended loadouts."
category: "bosses"
date: 2026-08-11
lastModified: 2026-08-12
image: "/images/emberfang-cover.jpg"
tags: ["boss", "ice", "early-game"]
---

正文从 H2 开始（不写 H1，ArticlePage 自动用 title 渲染 H1）。

## Attack Patterns
...
```

### 6.3 站点配置 schema（`src/config/site.ts`）

```typescript
export interface SiteConfig {
  name: string;              // "Anvil Quest Wiki"（全站 title 后缀、JSON-LD name）
  shortName: string;         // "AQ Wiki"（PWA short_name、Logo 缩写）
  description: string;       // 站点描述（Organization JSON-LD、og:site_name）
  domain: string;            // "anvilquestwiki.wiki"（sitemap/robots 绝对 URL 拼接）
  tagline: string;           // 首页副标题
  legalNotice: string;       // 法律声明
  social: {
    official: string;        // 游戏官网
    discord?: string;
    youtube?: string;
    twitter?: string;
    reddit?: string;
  };
  game: {
    name: string;            // 游戏全名
    platform: string;        // "Roblox" / "Steam" / "Epic Games"
    developer: string;
    genre: string;
    releaseDate?: string;
  };
}

export const site: SiteConfig = {
  name: "Anvil Quest Wiki",
  shortName: "AQ Wiki",
  // ...用户套用模板时改这里
};
```

### 6.4 导航配置 schema（`src/config/navigation.ts`）

```typescript
import type { LucideIcon } from 'lucide-astro';  // 或 astro-icon
import { Swords, BookOpen, Package, Gift } from 'lucide-astro';

export interface NavigationItem {
  key: string;              // 分类 slug（= content/ 子目录名 = URL 路径段）
  path: string;             // '/bosses'（= '/' + key）
  icon: LucideIcon;
  isContentType: true;      // 是否有 MDX 内容
}

export const NAVIGATION_CONFIG: NavigationItem[] = [
  { key: 'bosses',  path: '/bosses',  icon: Swords,   isContentType: true },
  { key: 'guides',  path: '/guides',  icon: BookOpen, isContentType: true },
  { key: 'items',   path: '/items',   icon: Package,  isContentType: true },
  { key: 'codes',   path: '/codes',   icon: Gift,     isContentType: true },
];

// 自动派生
export const CONTENT_TYPES = NAVIGATION_CONFIG.map(n => n.key);
```

**关键约束**：
- `key` 必须与 `src/content/<locale>/<key>/` 子目录名一一对应。
- `key` 必须与 `locales/en.json` 的 `nav.<key>` 翻译键对应。
- 改这一个文件 → 导航菜单 / 路由 / sitemap / 内容加载全部自动跟随。

### 6.5 首页 JSON schema（`src/locales/en.json` 的 `home` 命名空间）

**首页 JSON 结构**（v0.2 重构后，覆盖 hero / updates / start / popular / explore / closingCta 六大区块；FAQ 保留在 JSON 但由 `/faq` 独立页渲染）：

```json
{
  "site": {
    "name": "Anvil Quest Wiki",
    "shortName": "AQ Wiki",
    "description": "...",
    "tagline": "...",
    "legalNotice": "..."
  },
  "nav": {
    "home": "Home",
    "bosses": "Bosses",
    "guides": "Guides",
    "items": "Items",
    "codes": "Codes",
    "toggleTheme": "Toggle theme",
    "menu": "Menu"
  },
  "home": {
    "meta": { "title": "...", "description": "..." },
    "hero": {
      "badge": "...",
      "title": "Anvil Quest Wiki",
      "description": "...",
      "ctaPrimary": "...",
      "ctaSecondary": "...",
      "videoId": ""
    },
    "updates": { "title": "...", "browse": "..." },
    "start": {
      "badge": "Start Here",
      "title": "Your Anvil Quest Journey",
      "cards": [
        { "number": "1", "title": "...", "description": "...", "icon": "lucide:book-open", "href": "/guides/beginner-guide" }
      ]
    },
    "popular": {
      "badge": "Trending Now",
      "title": "Most Read This Week",
      "quickLinks": [{ "label": "...", "href": "/bosses/emberfang" }]
    },
    "explore": {
      "title": "...",
      "description": "...",
      "modules": [
        {
          "order": 1,
          "name": "Anvil Quest Codes",
          "description": "...",
          "href": "/codes",
          "displayType": "badge-list",
          "highlights": [{ "label": "WELCOME", "detail": "...", "badge": "Active" }]
        }
      ]
    },
    "faq": {
      "title": "Frequently Asked Questions",
      "description": "...",
      "items": [{ "question": "What is Anvil Quest?", "answer": "..." }]
    },
    "closingCta": { "title": "...", "description": "...", "primary": "...", "secondary": "..." }
  },
  "footer": {
    "playGame": "Play Anvil Quest",
    "officialDiscord": "Official Discord",
    "officialYoutube": "Official YouTube",
    "about": "About",
    "faq": "FAQ",
    "copyright": "© 2026 Anvil Quest Wiki. Fan-made, not affiliated with..."
  },
  "overview": {
    "bosses": { "overviewTitle": "All Bosses", "overviewDescription": "..." },
    "guides": { "overviewTitle": "All Guides", "overviewDescription": "..." }
  },
  "shared": {
    "readMore": "Read more",
    "lastUpdated": "Last updated",
    "noArticles": "No articles yet",
    "relatedArticles": "Related Articles"
  }
}
```

**v0.2 schema 变化**：
- `hero.stats`、`hero.ctaTertiary` 已删除（首屏做减法）。
- `start.cards[]` 新增 `icon`（lucide 图标名）和 `href`（链接）字段，支撑 QuickStart 大卡片。
- `gameInfo` 已删除（v0.2 重构时移除，游戏介绍放 `/about` 页）。
- `explore.modules` 建议固定 4 项（Codes / Bosses / Progression / Tier List）。
- `footer` 新增 `faq` 键。
- `faq` 数据保留在 `home.faq`，但由独立 `/faq` 页渲染（`FaqSection.astro`）。

**6 种 displayType**（首页 explore 模块的渲染类型）：
- `badge-list`：兑换码卡片（label + detail + badge）
- `steps`：步骤指引（label 是数字 1-6）
- `ranked-grid`：分级网格（label 是 S/A/B/C）
- `labeled-cards`：链接列表（label 是短文字，**去 emoji 化**）
- `timeline`：垂直时间轴（label 是版本号/日期，detail 是事件，可选 badge）—— 字段语义详见 `src/components/home/modules/Timeline.astro` JSDoc
- `video-grid`：视频缩略图网格（title + youtubeId + 可选 duration，首页不 embed，点击跳文章页）—— 字段语义详见 `src/components/home/modules/VideoGrid.astro` JSDoc

> **字段真相源**：每种 displayType 的字段语义以对应组件的 JSDoc 为准（单一真相源，避免文档与代码失同步）。`src/locales/en.json` 的 demo 数据是最强学习样本。

### 6.6 i18n 路由配置（`src/i18n/routing.ts`）

```typescript
export const locales = ['en', 'ja', 'ru'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';
```

**三处必须同步**（新增/删除语言时务必同时改动）：
1. `src/i18n/routing.ts` 的 `locales` 数组
2. `src/locales/` 下实际存在的 JSON 文件
3. `src/content/<locale>/` 下实际存在的目录（无内容也要建空目录）

---

## 第 7 章 核心模块设计

### 7.1 首页（HomePage）

**数据源**：`src/locales/<locale>.json` 的 `home` 命名空间。
**渲染**：`src/pages/[locale]/index.astro` 读 JSON，逐 section 渲染。
**交互**：移动端菜单用原生 `<details>`。FAQ 已移至独立 `/faq` 页（见 §7.4）。

**首页结构（从上到下，v0.2 重构后）**：
```
1. SiteHeader（导航栏）
2. Hero（满屏视觉锚点：超大标题 + 1 行描述 + 2 CTA）
   └─ 背景水印（游戏名，纯 CSS）；stats 卡片已移除（避免抢首屏焦点）
3. VideoSection（YouTube 嵌入；仅当 hero.videoId 非空时渲染）
4. QuickStart（4 个大图标卡片：新手指南 / 最新 Codes / Boss 攻略 / Tier List）
   └─ 紧跟 Hero，对标竞品"quick actions"模式
5. RecentUpdates + Trending（两栏：左 2/3 最近更新卡片网格 + 右 1/3 热门链接列表）
6. ExploreModules（4 个核心模块，2×2 网格，整卡可点击）
7. ClosingCta（底部 CTA）
8. SiteFooter（含 FAQ 链接）
```

**v0.2 重构说明**（相比 v0.1）：
- 首页从 8 区块压缩到 5 区块，页面长度从 ~7 屏压到 ~4 屏。
- **删除** GameInfo（stats 与 Hero 信息重复；文案移至 `/about` 页）。
- **删除** 首页 FAQ（移至独立 `/faq` 页，FAQPage JSON-LD 随之迁移）。
- **合并** TrendingNow 独立 section → RecentUpdates 右栏（节省 1 屏）。
- **砍减** Explore 模块 8→4（Codes / Bosses / Progression / Tier List；其余在导航已有入口）。
- **强化** Hero：H1 升至 `text-7xl font-black`，加渐变描边；占满 80vh 建立视觉锚点。
- **新增** QuickStart section：4 个图标卡片，对标成功游戏 wiki 的"快速入口"模式。

**关键决策**：
- 所有文案来自 JSON，组件不含游戏特定字符串。
- 模块级标题含主题名（SEO），子项不强制。
- `home.explore.modules` 数组建议 4 项（核心高频入口），超出可放列表页。

### 7.2 列表页（ListPage）

**路由**：`/[locale]/[contentType]`（如 `/bosses`、`/ja/bosses`）。
**数据源**：
- 标题/描述：`locales/<locale>.json` 的 `overview.<contentType>.overviewTitle/Description`。
- 文章列表：`lib/content.ts` 的 `getEntriesByCategory(contentType, locale)`。
**渲染**：文章卡片网格（封面 + 标题 + 描述 + 日期 + 阅读链接）。
**空状态**：无文章时显示 `shared.noArticles` 文案。
**SEO**：ItemList JSON-LD（每篇文章一个条目，含序号/URL/标题）。

**关键约束**：
- **列表不 fallback 英文**——该语言没翻译的文章不出现，列表为空就显示空状态。
- 防止「列表显示 28 篇但只有 1 篇有 MDX」导致 sitemap 产生 27 个 404。

### 7.3 详情页（ArticlePage）

**路由**：`/[locale]/[contentType]/[slug]`（如 `/bosses/emberfang`）。
**数据源**：`lib/content.ts` 的 `getEntryWithFallback(contentType, slug, locale)`。
**渲染**：
- H1 = `entry.data.title`（MDX 正文不写 H1）。
- MDX body 通过 `entry.render()` 渲染。
- 面包屑：首页 → 分类 → 本篇。
- 元信息：发布日期、最后修改、阅读时间。
- 相关文章：按 `tags` 匹配，最多 3 篇。
**SEO**：Article + BreadcrumbList JSON-LD。

**关键约束**：
- **单篇文章 fallback 英文**——访问 `/ja/bosses/emberfang` 若无日文版，显示英文版（metadata 也是英文），**不 404**。
- 这与列表页的「不 fallback」看似矛盾，实则合理：列表保证准确性（不展示没有的内容），详情保证可达性（直接 URL 访问不 404）。

### 7.4 侧边栏（WikiSidebar）

**数据源**：`lib/navigation.ts` 的 `getDynamicNavigation(locale)`。
**逻辑**：
1. 遍历 `NAVIGATION_CONFIG` 的所有 contentType。
2. 对每个 contentType，查询 `getEntriesByCategory(contentType, locale)`。
3. 按子目录分组（支持 `content/en/bosses/early-game/*.mdx` 嵌套）。
4. 渲染为可折叠的分组列表（原生 `<details>`）。
**多语言分组标题**：`locales/<locale>.json` 的 `overview.<contentType>.groupTitles` 映射（如日文 `bosses` → `ボス`）。

### 7.5 广告组件（详见第 10 章）

### 7.6 主题切换（ThemeToggle）

**零依赖方案**：
```astro
---
<!-- ThemeToggle.astro -->
---
<button id="theme-toggle" aria-label="Toggle theme" class="...">
  <!-- sun/moon icon -->
</button>
<script>
  const toggle = document.getElementById('theme-toggle');
  const html = document.documentElement;
  const saved = localStorage.getItem('theme');
  if (saved === 'dark' || (!saved && matchMedia('(prefers-color-scheme: dark)').matches)) {
    html.classList.add('dark');
  }
  toggle?.addEventListener('click', () => {
    html.classList.toggle('dark');
    localStorage.setItem('theme', html.classList.contains('dark') ? 'dark' : 'light');
  });
</script>
```

**关键**：script 放在 `<head>` 内联（避免 FOUC 闪烁），或在 BaseLayout 顶部加一个 blocking 的 theme-init script。

---

## 第 8 章 SEO 工程化

### 8.1 SEO 组件清单

| 组件/文件 | 作用 | 触发位置 |
|---|---|---|
| `BaseLayout.astro` | 全局 `<head>`：title 模板、description、og:*、twitter:*、Organization JSON-LD | 所有页面 |
| `JsonLd.astro` | 通用 JSON-LD 注入（接受 data prop） | 按需 |
| `lib/seo.ts` | JSON-LD 对象构造函数 | 各页面调用 |
| `@astrojs/sitemap` 集成 | 自动生成 sitemap（含 i18n hreflang） | `/sitemap-index.xml` |
| `robots.txt.ts` | 动态 robots（含 sitemap 链接） | `/robots.txt` |

### 8.2 各页面 SEO 产出

#### 首页
- **title**：`home.meta.title`（独立配置，如 "Anvil Quest Wiki - Complete Guide"）。
- **JSON-LD**：
  - `Organization`（在 BaseLayout，全站都有）：name/url/logo/image。
  - `WebSite`（首页注入）：name + url + potentialAction（搜索 action，可选）。

> v0.2 变化：`FAQPage` JSON-LD 已从首页移至 `/faq` 独立页（与 FAQ 内容一起迁移）。

#### FAQ 页（`/faq`，v0.2 新增）
- **title**：`home.faq.title`。
- **JSON-LD**：`FAQPage`（从 `home.faq.items` 构造）。
  > ⚠️ **2026-05-07 起 Google 已废弃 FAQ 富媒体结果**（SERP 折叠不再产生）。但 `FAQPage` schema 仍建议保留——AI Overviews 与其他 AI 爬虫会解析它来理解问答结构。详见 [§8.6 Schema 状态](#86-结构化数据-schema-状态2026)。

#### 列表页
- **title**：`${overviewTitle} — ${site.name}` 或 fallback `${ContentType 大写} — ${site.name}`。
- **JSON-LD**：`ItemList`（每篇文章一个 ListItem，含 position/url/name）。

#### 文章页
- **title**：`${entry.title} — ${site.name}`。
- **description**：`entry.data.description`。
- **og:type**：`article`。
- **twitter:card**：`summary_large_image`。
- **og:image / twitter:image**：`entry.data.image`（缺省用 `/images/hero.webp`），**必须绝对路径**。
- **alternates.languages**：所有语言版本的 hreflang（`x-default` 指向英文）。
- **JSON-LD**：
  - `Article`：headline/description/image/datePublished/dateModified/author/publisher。
  - `BreadcrumbList`：首页 → 分类 → 本篇。

### 8.3 sitemap 生成规则（关键！）

**核心原则**：sitemap 必须只包含**实际存在的 MDX 文件**对应的 URL，**禁止**从硬编码数组生成。

```typescript
// 原理示意（实际用 @astrojs/sitemap 集成，无需手写此文件）
import { getCollection } from 'astro:content';
import { SITE_URL } from 'astro:env';
import { locales, defaultLocale } from '~/i18n/routing';
import { CONTENT_TYPES } from '~/config/navigation';

export async function GET() {
  // 1. 扫描所有实际存在的 entry
  const entries = await getCollection('wiki');
  
  // 2. 为每个 entry × 每个语言生成 URL（含 hreflang alternate）
  const urls = entries.flatMap(entry => {
    // entry.id 格式：'en/bosses/emberfang' 或 'ja/bosses/emberfang'
    const [locale, contentType, ...slugParts] = entry.id.split('/');
    const slug = slugParts.join('/');
    return locales.map(loc => ({
      url: `${SITE_URL}${loc === defaultLocale ? '' : '/' + loc}/${contentType}/${slug}`,
      alternates: Object.fromEntries(locales.map(l => [l, /* ... */])),
    }));
  });
  
  // 3. 加上首页、列表页、法律页
  const staticUrls = [];
  for (const loc of locales) {
    const prefix = loc === defaultLocale ? '' : '/' + loc;
    staticUrls.push({ url: `${SITE_URL}${prefix}/` });                    // 首页
    for (const ct of CONTENT_TYPES) {
      staticUrls.push({ url: `${SITE_URL}${prefix}/${ct}` });             // 列表页
    }
    staticUrls.push({ url: `${SITE_URL}${prefix}/about` });               // 法律页
    // ...
  }
  
  // 4. 输出 XML
  return new Response(buildSitemapXml([...urls, ...staticUrls]), {
    headers: { 'Content-Type': 'application/xml' }
  });
}
```

> **实现细节**：实际推荐用 `@astrojs/sitemap` 集成（自动处理 alternate/i18n），以上是原理示意。集成配置见 `astro.config.mjs`。

### 8.4 hreflang 多语言链接

每页 `<head>` 注入：
```html
<link rel="alternate" hreflang="en" href="https://domain.com/bosses/emberfang" />
<link rel="alternate" hreflang="ja" href="https://domain.com/ja/bosses/emberfang" />
<link rel="alternate" hreflang="x-default" href="https://domain.com/bosses/emberfang" />
```

由 `lib/url.ts` 的 `languageAlternates(contentType, slug)` 生成，遍历 `routing.locales`。

### 8.5 og:image 绝对路径（强制）

社交平台抓 OG 图要求**绝对路径**。所有 og:image / twitter:image 必须形如 `https://domain.com/images/hero.webp`。

由 `SITE_URL` 环境变量拼接，**禁止硬编码域名**。

### 8.6 结构化数据 Schema 状态（2026）

> Schema 类型有效性随 Google 政策变化。本节记录 2026 年各 Schema 的 SERP 富媒体结果状态，以及 AnvilWiki 的实施优先级。

| Schema 类型 | 2026 SERP 富媒体状态 | AnvilWiki 是否实施 | 说明 |
|---|---|---|---|
| `Article` | ✅ 有效 | ✅ 文章页 | 强化专业度信号；AI Overviews 会解析 |
| `BreadcrumbList` | ✅ 有效 | ✅ 文章页 | 传达站点层级结构给搜索引擎与 AI |
| `Organization` | ✅ 有效 | ✅ 全站（BaseLayout） | 品牌实体识别、知识面板 |
| `WebSite` + `SearchAction` | ✅ 有效 | ✅ 首页 | 站内搜索框功能 |
| `ItemList` | ✅ 有效 | ✅ 列表页 | 分类下文章的结构化列表 |
| `FAQPage` | ⚠️ 富媒体**已废弃**（2026-05-07） | ✅ `/faq` 保留 | SERP 折叠不再产生，但 AI 爬虫仍解析；保留对 AI Overviews 有价值 |
| `HowTo` | ⚠️ 基本失效 | ❌ 不实施 | 多数场景不再产生富媒体结果 |

**实施优先级**（按 ROI 排序）：
1. `Article` — 每篇攻略/词条页必备
2. `BreadcrumbList` — 站点层级（首页 → 分类 → 词条）
3. `Organization` + `WebSite` — 品牌实体与站内搜索
4. `ItemList` — 列表页结构化
5. `FAQPage` — 保留但 SEO 期望降级（不依赖它获取搜索外观）

**参考来源**：
- [Google Search 文档更新日志](https://developers.google.com/search/updates)
- [FAQ Rich Results 废弃说明（2026-05）](https://www.getpassionfruit.com/blog/what-changed-with-google-drops-faq-rich-results-and-what-to-do-now)

---

## 第 9 章 多语言（i18n）

### 9.1 策略：as-needed 前缀

**英文（默认）无前缀**：`/bosses/emberfang`
**其他语言带前缀**：`/ja/bosses/emberfang`、`/ru/bosses/emberfang`

**Astro 配置**：
```javascript
// astro.config.mjs
export default defineConfig({
  i18n: {
    locales: ['en', 'ja', 'ru'],
    defaultLocale: 'en',
    routing: {
      prefixDefaultLocale: false,  // ⭐ 英文无前缀
    },
  },
});
```

> **验证状态**：已确认 Astro 5 原生支持 `prefixDefaultLocale: false`（即 as-needed 前缀策略，默认语言无前缀）。原「待验证清单」第 1 条 ✅ 通过。

### 9.2 路由实现

`src/pages/[locale]/[...slug].astro` 统一处理：
- 校验 `locale` ∈ `routing.locales`，否则 404。
- `slug.length === 0` → 首页。
- `slug.length === 1` → 列表页（`slug[0]` 是 contentType）。
- `slug.length > 1` → 详情页（`slug[0]` 是 contentType，`slug.slice(1).join('/')` 是文章 slug）。

**英文无前缀的处理**：
- Astro 的 `prefixDefaultLocale: false` 会自动让 `/bosses/emberfang`（无 `/en`）也能匹配到 `[locale]` 路由（locale 被解析为 `en`）。
- 若某些版本不自动处理，fallback 方案：`src/pages/[...slug].astro`（顶层）+ `src/pages/[locale]/[...slug].astro`（带前缀）双路由，或用 middleware 重写。详见 deployment.md 的「i18n 路由陷阱」章节。

### 9.3 文章 fallback 机制

```typescript
// src/lib/content.ts
import { getEntry } from 'astro:content';

export async function getEntryWithFallback(
  contentType: string,
  slug: string,
  locale: Locale,
) {
  // 1. 尝试当前语言
  const entry = await getEntry('wiki', `${locale}/${contentType}/${slug}`);
  if (entry) return { entry, locale: locale, isFallback: false };
  
  // 2. fallback 英文
  const fallback = await getEntry('wiki', `en/${contentType}/${slug}`);
  if (fallback) return { entry: fallback, locale: 'en', isFallback: true };
  
  // 3. 都没有 → null（路由层返回 404）
  return null;
}
```

**列表页不 fallback**：
```typescript
export async function getEntriesByCategory(contentType: string, locale: Locale) {
  const all = await getCollection('wiki');
  return all.filter(e => 
    e.id.startsWith(`${locale}/${contentType}/`)
  );
  // 注意：这里只过滤当前语言，不 fallback 英文
}
```

### 9.4 UI 文案 fallback

```typescript
// src/i18n/ui.ts
import en from '~/locales/en.json';
import ja from '~/locales/ja.json';

const messages = { en, ja };

export function getUi(locale: Locale) {
  // deepMerge：以 en 为底，用 locale 覆盖（缺 key 自动回退英文）
  return deepMerge(en, messages[locale] ?? {});
}
```

### 9.5 新增语言的三步

1. `src/i18n/routing.ts` 的 `locales` 数组加新 locale。
2. `src/locales/` 下创建 `<locale>.json`（可先空 `{}`，deepMerge 自动回退英文）。
3. `src/content/<locale>/` 下创建目录（可先空，文章慢慢补）。

> **侧边栏分组标题本地化**：若要让侧边栏分组名本地化（如日文 `bosses` → `ボス`），在 `locales/<locale>.json` 的 `overview.<contentType>.groupTitles` 加映射。不加则显示英文。

---

## 第 10 章 广告系统

### 10.1 设计原则

**核心**：Google AdSense 集成——3 个广告位各一个 AdSense slot，环境变量驱动，key 为空时组件 `return null` 不渲染（保 Lighthouse 4×100 开箱契约）。

- AdSense loader 脚本由 `BaseLayout.astro` 在 `<head>` 注入，仅当 `PUBLIC_ADSENSE_CLIENT` 有值时加载。
- 每个广告位是一个 `<AdSenseSlot position="...">` 组件，根据 position 读取对应的 slot ID 环境变量。
- 尺寸由 AdSense 自动决定（responsive），不需要为每个位置指定固定尺寸。

### 10.2 广告位清单

| 位置 | 组件 | 挂载点 | Slot 环境变量 |
|---|---|---|---|
| Sticky（粘顶横幅） | `StickyBanner.astro` | `LocaleLayout`（全局） | `PUBLIC_ADSENSE_SLOT_STICKY` |
| Sidebar（桌面端侧边栏） | `SidebarAd.astro` | `WikiSidebar`（桌面端） | `PUBLIC_ADSENSE_SLOT_SIDEBAR` |
| InContent（文章内） | `InContentAd.astro` | `ArticlePage`（相关文章前） | `PUBLIC_ADSENSE_SLOT_INCONTENT` |

> 在 AdSense 后台为每个位置创建一个广告单元，拿到 slot ID 填到对应环境变量。AdSense 会根据访客设备自动选择最合适的尺寸。

### 10.3 AdSenseSlot 组件

底层组件 `AdSenseSlot.astro` 渲染一个 `<ins class="adsbygoogle">` 标签并 push 到 `adsbygoogle` 队列：

```astro
---
// src/components/ads/AdSenseSlot.astro
interface Props {
  position: 'sticky' | 'sidebar' | 'incontent';
  format?: 'auto' | 'fluid';
  responsive?: boolean;
}
const { position, format = 'auto', responsive = true } = Astro.props;
const client = import.meta.env.PUBLIC_ADSENSE_CLIENT;
const slot = import.meta.env[`PUBLIC_ADSENSE_SLOT_${position.toUpperCase()}`];
// client 或 slot 任一为空 → return null（不渲染）
---
{client && slot && (
  <>
    <ins class="adsbygoogle" style="display:block"
      data-ad-client={client} data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive={responsive ? 'true' : 'false'} />
    <script is:inline>
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    </script>
  </>
)}
```

3 个位置组件（`StickyBanner` / `SidebarAd` / `InContentAd`）都是对 `AdSenseSlot` 的薄封装，负责定位（sticky / fixed / inline）和门控逻辑。

### 10.4 Sticky 粘顶横幅 + 关闭逻辑

`StickyBanner.astro` 在粘顶位置渲染广告，带关闭按钮（localStorage 记忆）：

```astro
---
// src/components/ads/StickyBanner.astro
const client = import.meta.env.PUBLIC_ADSENSE_CLIENT;
const slot = import.meta.env.PUBLIC_ADSENSE_SLOT_STICKY;
const show = !!(client && slot);
---
{show && (
  <div id="sticky-banner" class="sticky top-14 z-30 ...">
    <div class="relative mx-auto max-w-4xl px-4">
      <AdSenseSlot position="sticky" />
      <button id="dismiss-sticky" aria-label="Close ad" ...>
        <Icon name="lucide:x" />
      </button>
    </div>
  </div>
)}
<script is:inline>
  // 关闭按钮 + localStorage 记忆
  (() => {
    const banner = document.getElementById('sticky-banner');
    const btn = document.getElementById('dismiss-sticky');
    if (!banner || !btn) return;
    if (localStorage.getItem('sticky-dismissed') === '1') { banner.remove(); return; }
    btn.addEventListener('click', () => {
      localStorage.setItem('sticky-dismissed', '1');
      banner.remove();
    });
  })();
</script>
```

### 10.5 环境变量驱动

广告配置全部走环境变量，**4 个变量全填才显示广告，任一为空对应位置不渲染**。新手部署时广告位是空的，不报错；接入广告时填 env 即生效。

| 变量 | 说明 |
|---|---|
| `PUBLIC_ADSENSE_CLIENT` | AdSense Publisher ID（`ca-pub-XXXXXXXXXXXXXXXX`），门控 loader 注入 |
| `PUBLIC_ADSENSE_SLOT_STICKY` | Sticky 位置的 slot ID |
| `PUBLIC_ADSENSE_SLOT_SIDEBAR` | Sidebar 位置的 slot ID |
| `PUBLIC_ADSENSE_SLOT_INCONTENT` | InContent 位置的 slot ID |

完整清单见 [附录 A](#附录-a-环境变量清单)。

### 10.6 广告部署流程

1. 在 [Google AdSense](https://adsense.google.com/) 注册并提交你的站点审核。
2. 审核通过后，拿到 Publisher ID（格式 `ca-pub-XXXXXXXXXXXXXXXX`）。
3. 在 AdSense 后台创建 3 个广告单元（建议选 Responsive），分别拿到 3 个 slot ID。
4. 在 Cloudflare Pages 项目 Settings → Environment variables（或 `wrangler.toml` 的 `[vars]`）填入 4 个变量：`PUBLIC_ADSENSE_CLIENT` + 3 个 slot ID。
5. 重新部署，广告自动出现。

> AdSense 审核通常需要数天到数周，期间站点正常运行（广告位为空）。详见 [AdSense 帮助中心](https://support.google.com/adsense/)。

---

## 第 11 章 套用模板指南

### 11.1 概述

**套用模板** = 把通用 AnvilWiki 模板变成特定游戏的站点。只改配置层和内容层，代码层不动。

完整的配置参考见 [`docs/apply-template.md`](./apply-template.md)——按文件组织，你要改什么就查对应章节。也可用 `pnpm apply-template` CLI 自动完成基础配置。

### 11.2 改动对象与 AnvilWiki 路径对照

下表列出套用模板时需要改动的对象及其在 AnvilWiki 中的位置（`docs/migration-from-nextjs.md` 提供 Next.js 结构的迁移映射，供从 Next.js 项目迁移过来的用户参考）：

| 改动对象 | AnvilWiki 路径（Astro） |
|---|---|
| 主题色 | `src/styles/globals.css` |
| 站点信息 | `src/config/site.ts` + `locales/en.json` |
| 导航配置 | `src/config/navigation.ts` |
| 语言列表 | `src/i18n/routing.ts` |
| UI 文案 | `src/i18n/ui.ts` + `src/locales/*.json` |
| 首页文案 | `src/locales/en.json` 的 `home` 命名空间 |
| 文章目录 | `src/content/<locale>/<type>/*.mdx` |
| 文章元数据 | YAML frontmatter `---\n...---` |
| sitemap | `@astrojs/sitemap` 集成（自动生成，无需手写） |
| robots | `src/pages/robots.txt.ts` |
| 法律页 | `src/pages/[locale]/*.astro` |
| 首页路由 | `src/pages/[locale]/index.astro` + `components/home/` |
| 列表/详情路由 | `src/pages/[locale]/[...slug].astro` |
| YouTube video ID | `src/config/site.ts` 或 `locales/en.json` 的 `home.hero.videoId` |

### 11.3 关键约束

| 约束 | 说明 |
|---|---|
| **主题色只改 4 行** | `--brand` + `--brand-light`（`:root` 2 行 + `.dark` 2 行），其他变量通过 `var()` 自动跟随。 |
| **分类 key 三处同步** | `navigation.ts` 的 key = `locales/en.json` 的 `nav.<key>` = `src/content/<locale>/<key>/` 目录名。 |
| **sitemap 禁止硬编码** | 必须扫描实际 MDX，禁止从 `NAVIGATION_CONFIG` 或手写列表生成 URL。 |
| **og:image 绝对路径** | 必须 `${SITE_URL}/images/hero.webp`，相对路径社交平台抓不到。 |
| **hero.webp 不能是空文件** | 模板自带的可能是 0 字节占位，必须下载真实图覆盖。 |
| **删 MDX 不删目录** | `src/content/` 目录必须保留（空目录也行），删了会导致 Content Collection 构建失败。 |
| **article 从 H2 开始** | 不写 H1，ArticlePage 自动用 title 渲染 H1，避免双 H1。 |
| **labeled-cards label 去 emoji 化** | `labeled-cards` 的 `highlights.label` 必须是英文短词，不是 emoji（违反「禁止 emoji」规则）。 |
| **域名不硬编码** | 所有 URL 走 `SITE_URL` 环境变量，禁止在代码里写死 `xxx.wiki`。 |

### 11.4 从其他格式迁移文章

如果你的文章用的是 JS 元数据写法（`export const metadata = { ... }`，常见于 Next.js / MDX 项目），需要手动改成 AnvilWiki 使用的 YAML frontmatter 格式。

迁移方法见 [`docs/content-format.md`](./content-format.md#从其他格式迁移文章)——frontmatter 字段少、格式简单，手动或 AI 辅助转换即可。从 Next.js 项目迁移的完整对照表见 [`docs/migration-from-nextjs.md`](./migration-from-nextjs.md)。

---

## 第 12 章 部署方案

### 12.1 部署目标

- **零配置**：连 GitHub 仓库 → 自动识别 Astro → 自动构建 → 自动部署。
- **免费**：Cloudflare Pages 免费版（无限带宽、无限请求、500 次/月构建）。
- **新手友好**：UI 操作，无需 CLI（可选 Wrangler 进阶）。

### 12.2 部署架构

```
开发者 push 到 GitHub
         │
         ▼
Cloudflare Pages（连接 GitHub 仓库）
  ├── 自动检测框架（Astro）
  ├── 自动执行构建命令：pnpm install && pnpm build
  ├── 输出 dist/ 目录
  ├── 部署到全球 CDN（300+ 边缘节点）
  └── 分配 *.pages.dev 子域名
         │
         ▼
用户绑定自定义域名（可选）
  ├── 在域名商配 CNAME → <project>.pages.dev
  ├── Cloudflare 自动签发 SSL（Let's Encrypt）
  └── DNS 生效后 HTTPS 可用
```

### 12.3 Cloudflare Pages 配置

**框架预设**：Astro（自动识别）。
**构建命令**：`pnpm build`
**输出目录**：`dist`
**环境变量**：见 [附录 A](#附录-a-环境变量清单)。
**Node 版本**：`NODE_VERSION = 20`（Cloudflare Pages 默认支持）。

**`wrangler.toml`（可选，用于本地预览）**：
```toml
name = "anvilwiki"
compatibility_date = "2026-08-11"
pages_build_output_dir = "dist"
```

### 12.4 新手部署流程（5 步）

```
1. Fork AnvilWiki 仓库到自己的 GitHub
2. 改配置层（site.ts / navigation.ts / globals.css）+ 替换内容层（src/content/ / locales/）
3. cloudflare.com → Pages → Create a project → Connect to Git → 选仓库
4. 确认构建配置（自动识别 Astro）→ Save and Deploy
5. 等 2-3 分钟构建完成 → 访问 <project>.pages.dev 看到 site
```

绑定自定义域名：
```
6. Pages 项目 → Custom domains → Set up a custom domain → 输入域名
7. 按提示在域名商加 CNAME 记录 → 等 DNS 生效（几分钟~几小时）
8. SSL 自动签发，HTTPS 可用
```

### 12.5 备选部署方案

| 方案 | 适用场景 | 说明 |
|---|---|---|
| **Cloudflare Workers** | 进阶用户、需要 SSR/API | 2026 官方推荐新项目方案，文档补充指南。 |
| **Netlify** | 备选 | AnvilWiki 是纯静态，可零配置部署到任何静态托管。 |
| **Vercel** | 备选 | 同上。 |
| **GitHub Pages** | 备选（需 `base` 配置） | 免费，但有 100GB/月带宽限制。 |
| **自建 VPS** | 完全控制 | `pnpm build` → `scp -r dist/ user@vps:/var/www/` → nginx + certbot。 |

### 12.6 环境变量管理

所有环境变量在 Cloudflare Pages 项目 Settings → Environment variables 配置。支持 Production / Preview 两套。

**关键**：`SITE_URL` 必须在 production 配为最终域名（如 `https://anvilquestwiki.wiki`），影响 sitemap / og:image / robots 的绝对路径生成。

---

## 第 13 章 测试与质量保障

### 13.1 测试策略

| 层级 | 工具 | 覆盖范围 | CI 集成 |
|---|---|---|---|
| **类型检查** | `astro check` + TypeScript strict | Content Collection schema、组件 props、工具函数 | ✅ 每个 PR |
| **Lint** | ESLint + Prettier + `eslint-plugin-astro` | 代码风格、常见错误 | ✅ 每个 PR |
| **构建检查** | `pnpm build` | 构建是否成功（含 Content schema 校验） | ✅ 每个 PR |
| **单元测试** | Vitest | `lib/` 工具函数（URL 构造、JSON-LD 生成、deepMerge、fallback 逻辑） | ✅ 每个 PR |
| **端到端** | Playwright（可选） | 关键用户路径（首页/列表/详情/语言切换/404） | ⚠️ 可选，nightly |
| **链接检查** | `scripts/check-sitemap.ts` | sitemap 所有 URL 返回 200 | ✅ 部署后 |
| **SEO 检查** | Lighthouse CI | Performance/SEO/Accessibility/A11y 分数 | ✅ 部署后 |
| **结构化数据** | Google Rich Results Test（手动） | JSON-LD 有效性 | 上线前手动 |

### 13.2 CI 工作流（`.github/workflows/ci.yml`）

```yaml
name: CI
on: [pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm typecheck       # astro check
      - run: pnpm test             # vitest
      - run: pnpm build            # 含 Content schema 校验
```

### 13.3 关键测试用例

#### 13.3.1 Content Collection schema 校验
```typescript
// tests/content.test.ts
describe('Content Collections', () => {
  it('应该拒绝缺 title 的文章', () => {
    // 构建时 Zod 会报错，build 失败
  });
  it('应该拒绝 description > 160 字符', () => { /* ... */ });
  it('应该接受合法 frontmatter', () => { /* ... */ });
});
```

#### 13.3.2 多语言 fallback
```typescript
// tests/i18n.test.ts
describe('i18n fallback', () => {
  it('单篇文章缺失时 fallback 英文不 404', async () => {
    const result = await getEntryWithFallback('bosses', 'emberfang', 'ja');
    expect(result).not.toBeNull();
    expect(result.isFallback).toBe(true);  // 日文无，回退英文
  });
  it('列表页不 fallback，缺失语言显示空', async () => {
    const list = await getEntriesByCategory('bosses', 'ja');
    expect(list).toEqual([]);  // 日文无 bosses 内容，返回空
  });
});
```

#### 13.3.3 sitemap 完整性
```typescript
// tests/sitemap.test.ts
describe('sitemap', () => {
  it('只包含实际存在的 MDX', () => {
    // 对比 sitemap URL 数 vs Content Collection entry 数
  });
  it('包含所有语言的 alternate', () => { /* ... */ });
  it('x-default 指向英文版', () => { /* ... */ });
});
```

### 13.4 性能基准

> ✅ **实测完成（2026-08-12）**：demo 站 `anvilwiki.pages.dev` Lighthouse 全 100。

| 指标 | 目标 | 实测 | 测量工具 |
|---|---|---|---|
| Lighthouse Performance | ≥ 95 | **100** ✅ | Lighthouse CI |
| Lighthouse Accessibility | ≥ 90 | **100** ✅ | Lighthouse CI |
| Lighthouse Best Practices | ≥ 90 | **100** ✅ | Lighthouse CI |
| Lighthouse SEO | ≥ 90 | **100** ✅ | Lighthouse CI |
| LCP（Largest Contentful Paint） | < 2.5s | 满分范围内 | Lighthouse |
| CLS（Cumulative Layout Shift） | < 0.1 | 0 | Lighthouse |
| INP（Interaction to Next Paint） | ≤ 200ms | 满分范围内 | Lighthouse |
| 首屏 JS 体积（gzipped） | < 30KB | ~3KB | Astro bundle stats |
| 构建时间（5 篇文章） | < 60s | ~1.5s | 本地 |

**性能目标**：✅ 全部达成并超额完成。

---

## 第 14 章 开发路线图

### 14.1 里程碑

| 里程碑 | 交付物 | 验收标准 | 预计工时 |
|---|---|---|---|
| **MVP-0**：骨架 | Astro 项目初始化 + Content Collection 配置 + 单篇示例 MDX + 首页/列表页/详情页三页跑通 + Cloudflare Pages 部署成功 | 访问 `*.pages.dev` 能看到三页，Lighthouse Performance ≥ 95 | 1-2 天 |
| **MVP-1**：多语言 | as-needed 前缀（`prefixDefaultLocale: false`）+ 文章 fallback + 语言切换器 + UI 文案 deepMerge | 加 `ja` 语言，访问 `/ja/bosses/emberfang`（无 ja 版）回退英文 | 1 天 |
| **MVP-2**：首页模块 | JSON 驱动 + 4 种 displayType（badge-list/steps/ranked-grid/labeled-cards）+ Hero/QuickStart/Explore/CTA/Footer/Video/RecentUpdates+Trending（v0.2 结构） | 换 en.json 数据，首页无组件改动即生效 | 1-2 天 |
| **MVP-3**：SEO | sitemap 动态 + JSON-LD 全套（Organization/WebSite/Article/Breadcrumb/ItemList/FAQPage）+ hreflang + robots | Google Rich Results Test 全通过 | 1 天 |
| **MVP-4**：主题换肤 | CSS 变量双变量（`--brand` + `--brand-light`）+ 暗色模式 + 主题切换器 | 改 globals.css 4 行整站变色 | 0.5 天 |
| **MVP-5**：广告系统 | Google AdSense（3 个广告位：Sticky / Sidebar / InContent）+ Sticky 关闭按钮 + 环境变量驱动 | 移动端 + 桌面端广告正常显示 | 1 天 |
| **MVP-6**：套用模板文档 | 配置参考手册（按文件组织）+ 新手 README + docs/ 全套 | 新手照 README 30 分钟内部署上线 | 1-2 天 |
| **v1.0**：基准实测与发布 | ✅ 已完成 — demo 站 `anvilwiki.pages.dev` 已上线，Lighthouse 全 100（Performance / Accessibility / Best Practices / SEO） | 性能目标全部达成，demo 站可访问 | 1 天 |

**总计**：约 **7-10 天**可交付 v1.0。

### 14.2 v1.0 后的迭代方向

| 版本 | 功能 | 优先级 | 状态 |
|---|---|---|---|
| ~~v1.1~~ | ~~frontmatter 格式迁移指南~~ | ~~高~~ | ✅ 已实现（`docs/content-format.md` 提供从 JS metadata 到 YAML frontmatter 的迁移说明） |
| v1.2 | 搜索功能（Pagefind 离线搜索，零运行时） | 中 | ✅ 已实现（`postbuild` 钩子 + `SearchButton.astro` `<dialog>` 模态，懒加载 pagefind-ui，Ctrl/Cmd+K 唤起，`data-pagefind-body` 精确索引文章正文） |
| v1.3 | 更多 displayType（video-grid/timeline/comparison-table） | 中 | ✅ 已实现 timeline + video-grid（缩略图跳转,首页不 embed YouTube,保 Lighthouse 4×100）;comparison-table 待验证（见下） |
| v1.4 | 评论系统（Giscus，默认关闭，env 驱动） | 低 | ✅ 已实现（`Comments.astro` env 门控 + 官方 `<script data-loading="lazy">` + 双 MutationObserver 暗色同步；详见 `docs/comments.md`） |
| v1.5 | 图片优化（Astro Image，自动 WebP/AVIF + 响应式 srcset） | 中 | ✅ 已实现（content schema `image()` loader + `ArticleCover.astro` + `image.responsiveStyles`，封面图自动 WebP/srcset，`content.config.ts` 迁至 `src/`） |
| v2.0 | 套用模板 CLI（`pnpm apply-template` 引导式配置） | 高 | ✅ 已实现（`scripts/apply-template.ts` 步骤 1 自动化：hex→HSL 主题色、site/navigation/routing/ui/locales/manifest 重写，`--dry-run` / `--no-clear-content` flag） |
| v1.5 | 内链 + 时效性 + 表达力（详见 `docs/ROADMAP-v1.5-v1.6.md`） | 高 | ✅ 已实现（标签落地页 `/tags` + 可点击 tag / gameVersion 徽章 / `/recent` / Callout / Accordion / draft（dev 可见 build 排除）/ VideoObject JSON-LD / 404 增强（搜索+分类入口）/ SponsorCard env 门控 + FUNDING.yml / README wrangler 警告） |
| v1.6 | 创作者维护工具 + 部署自动化（check-i18n / setup workflow / 内容层 CLI / 死链对账等） | 中 | ✅ 已实现（`pnpm check-i18n` 翻译覆盖率 + `pnpm check-links` dist 内链审计（均入 CI）/ Initialize workflow 一键初始化 / CF Web Analytics 门控 / staying-up-to-date 文档 / apply-template 内容骨架 / README 对比表+showcase 征集） |
| v1.7 | 内容表达力二期 + E-E-A-T（画廊/作者体系/联盟链接/内容 lint） | 中 | ✅ 已实现（`gallery` frontmatter + 原生 dialog lightbox + ImageObject JSON-LD / `authors.ts` 注册表 + Person JSON-LD / `<AffiliateLink>` sponsored nofollow 组件 / `pnpm check-content` 内容 lint；og:image 自动生成与 PWA 留待 v1.8 按用户反馈排期） |
| v1.8 | AI 原生内容生产 + 新鲜度管道（第一性原理路线②③①④） | 高 | ✅ 已实现（`.agent/skills/` 3 技能 + AGENTS.md 对话式产页章节 / `codes` frontmatter + CodesTable 自动分区 + FAQPage JSON-LD / `pnpm refresh-audit` 确定性审计 + content-pipeline.yml 每周定时开 issue（绝不自动改内容）/ docs/game-selection.md 选品漏斗 + 首日 10 页） |

**v1.3 范围说明**：
- `timeline`：✅ 实现 —— 版本日志/活动时序，零副作用，商业价值正（老玩家点进 patch notes 文章页）。
- `video-grid`：✅ 实现（缩略图 + 跳转，不 embed）—— 保住 Lighthouse 100，流量留站内变现（embed 会让用户看视频时广告曝光归 YouTube）。
- `comparison-table`：⏸ 推迟 —— 广告变现模型下，对比表把信息完整呈现后用户无点击动力（信息已满足），ROI 为负。等真实用户反馈「我首页需要对比表」再做，做时需重新设计「如何驱动用户点进文章页」。

(设计推演过程见 git 历史中该时期的 commit 记录。)

### 14.3 「待验证清单」回填计划

以下 9 项关键技术假设，在 MVP 阶段逐条验证：

| # | 待验证项 | 验证里程碑 | 状态 |
|---|---|---|---|
| 1 | i18n as-needed 路由策略 | MVP-1 | ✅ 已确认（`prefixDefaultLocale: false`） |
| 2 | 文章语言 fallback | MVP-1 | ✅ 已验证（`/ja/bosses/stormcaller` 无日文版时回退英文，构建实测通过） |
| 3 | 从 JS metadata 格式迁移文章 | v0.1 | ✅ 已实现（`docs/content-format.md` 提供 `export const metadata` → YAML frontmatter 迁移指南） |
| 4 | shadcn/ui 在 Astro 下的体验 | — | ❌ 决策不用（采用纯 Astro 原生组件，见 ADR-002） |
| 5 | 多语言 sitemap/hreflang 自动生成 | MVP-3 | ✅ 已验证（`@astrojs/sitemap` 自动生成 26 URL + en/ja hreflang alternate） |
| 6 | 侧边栏动态导航 | MVP-2 | ✅ 已实现（`WikiSidebar` 组件 + `getDynamicNavigation()` 扫描 MDX 生成分组） |
| 7 | 主题色方案落地 | MVP-4 | ✅ 已验证（`--brand` / `--brand-light` 4 行改主题色 + 暗色模式 + 主题切换器） |
| 8 | 性能基准实测 | v1.0 | ✅ 已实测（`anvilwiki.pages.dev` Lighthouse 全 100：Performance / Accessibility / Best Practices / SEO） |
| 9 | 迁移成本核算 | v1.0 | ✅ 已总结（fork → `pnpm apply-template` → 部署，全流程 30 分钟内） |

---

## 第 15 章 开源运营

### 15.1 仓库策略

- **仓库地址**：`github.com/PNGTRID/AnvilWiki`
- **协议**：MIT（最宽松，允许商用）
- **主分支**：`main`（受保护，PR 合并）
- **发版**：Semantic Versioning（v1.0.0 / v1.1.0 / v1.1.1）
- **Release notes**：中英双语

### 15.2 文档策略

| 文档 | 受众 | 位置 |
|---|---|---|
| README.md（中英双语） | 所有用户，新手入门 | 仓库根目录 |
| docs/PRD.md | 贡献者、想深入了解设计的人 | 本文档 |
| docs/deployment.md | 新手，部署指南 | docs/ |
| docs/apply-template.md | 套用模板用户，配置参考 | docs/ |
| docs/content-format.md | 内容创作者，MDX 格式 | docs/ |
| docs/seo.md | 进阶用户，SEO 调优 | docs/ |
| docs/migration-from-nextjs.md | 传统 Next.js 模板用户，迁移指南 | docs/ |

### 15.3 Demo 站策略

- **官方 demo**：`anvilwiki.pages.dev`，用虚构游戏 "Anvil Quest" 做一个完整 demo 站。
- **源码**：`examples/anvil-quest/` 子目录（或独立分支）。
- **目的**：让用户直观看到 AnvilWiki 长什么样、性能如何。
- **dogfooding**：AnvilWiki 的文档站（`docs.anvilwiki.dev`）也用 AnvilWiki 自身构建，验证模板能力。

### 15.4 社区运营

| 渠道 | 用途 |
|---|---|
| GitHub Issues | bug 报告、功能建议 |
| GitHub Discussions | 问答、模板套用案例分享、showcase |
| CONTRIBUTING.md | 贡献指南（开发环境、PR 规范、代码风格） |
| CHANGELOG.md | 版本变更记录 |
| （可选）Discord | 实时交流（社区长大后开） |

### 15.5 推广策略

1. **开发者社区**：在游戏 wiki / SEO 站相关的开发者社群分享，定位为「Cloudflare 原生方案」。
2. **技术社区**：Astro 官方 Discord / Reddit r/Astro / V2EX / 掘金 / Twitter，分享「Astro + Cloudflare 做游戏 wiki」教程。
3. **GitHub Topic**：打标签 `astro` / `cloudflare-pages` / `wiki-template` / `game-wiki` / `seo` / `open-source`。
4. **SEO 自证**：AnvilWiki demo 站本身做到 Google 首页（搜 "anvil quest wiki"），证明模板的 SEO 能力。

---

## 附录 A 环境变量清单

### A.1 站点配置

| 变量名 | 用途 | 示例 | 必填 |
|---|---|---|---|
| `SITE_URL` | 站点绝对 URL（sitemap/og:image/robots 拼接用） | `https://anvilquestwiki.wiki` | ✅ |

### A.2 广告（Google AdSense）

| 变量名 | 用途 |
|---|---|
| `PUBLIC_ADSENSE_CLIENT` | AdSense Publisher ID（`ca-pub-XXXXXXXXXXXXXXXX`），门控 loader 注入 |
| `PUBLIC_ADSENSE_SLOT_STICKY` | Sticky 粘顶横幅 slot ID |
| `PUBLIC_ADSENSE_SLOT_SIDEBAR` | Sidebar 桌面端侧边栏 slot ID |
| `PUBLIC_ADSENSE_SLOT_INCONTENT` | InContent 文章内 slot ID |

> 所有广告变量为空时，对应广告组件 `return null` 不渲染。新手部署时不填也能正常上线。

### A.3 其他（可选）

| 变量名 | 用途 |
|---|---|
| `PUBLIC_GA_ID` | Google Analytics ID（如 `G-XXXXXXXX`） |
| `PUBLIC_GSC_VERIFICATION` | Google Search Console 验证 token |

### A.4 环境变量示例文件

仓库提供 `.env.example`：
```bash
# 站点配置
SITE_URL=https://your-domain.wiki

# 广告（可选，留空则不显示）
PUBLIC_ADSENSE_CLIENT=
PUBLIC_ADSENSE_SLOT_STICKY=
PUBLIC_ADSENSE_SLOT_SIDEBAR=
PUBLIC_ADSENSE_SLOT_INCONTENT=

# 分析（可选）
PUBLIC_GA_ID=
```

---

## 附录 B 上线前检查清单

### B.1 基础配置

```
□ site.ts 已填正确游戏名/域名/社交链接
□ navigation.ts 的 key 与 content/ 子目录一一对应
□ routing.ts 的 locales 与 src/locales/*.json 文件同步
□ globals.css 主题色已改（4 行）
□ favicon 全套已替换
□ public/images/hero.webp 是真实图片（非 0 字节占位）
□ manifest.json 已填游戏名
```

### B.2 内容

```
□ src/content/ 下有至少 1 篇 MDX（或保持 homepage-only 模式）
□ 所有 MDX frontmatter 通过 Zod schema 校验
□ 文章正文从 H2 开始（不写 H1）
□ labeled-cards 的 highlights.label 已去 emoji
```

### B.3 SEO

```
□ SITE_URL 环境变量已配为最终域名
□ sitemap.xml 可访问，URL 数 = 实际页面数
□ robots.txt 可访问，含 sitemap 链接
□ 首页有 Organization + WebSite JSON-LD
□ 列表页有 ItemList JSON-LD
□ 文章页有 Article + BreadcrumbList JSON-LD
□ 所有页面 og:image 是绝对路径
□ hreflang alternate 覆盖所有语言，x-default 指向英文
□ Google Rich Results Test 全通过
```

### B.4 性能

```
□ Lighthouse Performance ≥ 95
□ LCP < 2.5s
□ CLS < 0.1
□ 首屏 JS（gzipped）< 30KB
```

### B.5 部署

```
□ Cloudflare Pages 项目已创建，连 GitHub 仓库
□ 构建命令 pnpm build，输出目录 dist
□ NODE_VERSION = 20 已配
□ 环境变量已填（至少 SITE_URL）
□ 自定义域名已绑定，SSL 已生效
□ 部署成功，访问域名看到正确内容
```

### B.6 验证

```
□ sitemap 所有 URL 返回 200（跑 scripts/check-sitemap.ts）
□ 移动端 + 桌面端分别访问正常
□ 语言切换器工作正常
□ 暗色/亮色切换正常
□ 无旧 demo 游戏（Anvil Quest）残留（grep "Anvil Quest" 应为 0，除非故意保留 demo）
□ Google Search Console 已添加资源，提交 sitemap
```

### B.7 广告（上线 2-3 天后）

```
□ Google AdSense 账号已注册，网站已审核通过
□ 4 个广告变量已配到 Cloudflare 环境变量（CLIENT + 3 个 slot ID）
□ 移动端 + 桌面端广告正常显示不破版
□ Sticky 粘顶横幅正常，有关闭按钮
□ 桌面端侧边栏广告 fixed 正常
□ 无自动弹窗 / 跳转（有则检查 AdSense 设置）
□ AdSense 后台 impression 数在涨
```

---

## 附录 C 术语表

| 术语 | 含义 |
|---|---|
| **wiki 站** | 围绕某游戏/主题的攻略内容站，靠 SEO 获取流量 |
| **套用模板** | 把通用模板变成特定游戏站点的过程 |
| **MDX** | Markdown + JSX，支持在 Markdown 中使用组件 |
| **Content Collections** | Astro 的内容管理机制，类型安全 + schema 校验 |
| **Content Layer API** | Astro 5 引入的内容层 API，支持 glob/file/API loader |
| **as-needed 前缀** | 多语言 URL 策略：默认语言无前缀，其他语言带前缀 |
| **fallback** | 某语言内容缺失时自动回退到默认语言（英文） |
| **displayType** | 首页模块的渲染类型（badge-list/steps/ranked-grid/labeled-cards） |
| **JSON-LD** | 结构化数据格式，告诉搜索引擎页面内容类型 |
| **hreflang** | 多语言页面 alternate 链接，告诉搜索引擎各语言版本位置 |
| **Sticky 广告** | 粘在屏幕固定位置的广告，曝光时长更长，CPM 更高 |
| **AdSense slot** | Google AdSense 广告单元 ID，一个 slot 对应一个广告位 |
| **分层架构** | 代码层 / 配置层 / 内容层 分离，套用模板只改后两层 |
| **homepage-only 模式** | 只上线首页，无文章内容，后续慢慢补 |
| **dogfooding** | 自己用自己的产品（AnvilWiki 文档站用 AnvilWiki 构建） |

---

## 更新记录

| 日期 | 版本 | 说明 |
|---|---|---|
| 2026-08-11 | v0.1 | PRD 初稿；技术事实已通过 Astro 官方文档核实 |
| 2026-08-12 | v0.2 | MVP 全部实现（MVP-0 至 MVP-5 + P0-P3）；更新待验证清单状态 |
| 2026-08-12 | v0.3 | SEO 章节更新：Schema 状态（§8.6）、FAQ rich results 废弃说明、INP 阈值修正为 ≤ 200ms |
| 2026-08-12 | v1.0 | demo 站 `anvilwiki.pages.dev` 上线；Lighthouse 全 100；v1.2 Pagefind 搜索 + v1.5 Astro Image + v2.0 套用模板 CLI 全部实现；完整日语翻译；SEO 修复（hreflang / og:image / prefetch / breadcrumb / security headers） |

---

> **✅ v1.0 已交付**：demo 站 [anvilwiki.pages.dev](https://anvilwiki.pages.dev/) 已上线，Lighthouse 全 100。后续按 [§14.2 迭代方向](#142-v10-后的迭代方向) 推进 v1.3+ 功能。
