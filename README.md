# AnvilWiki ⚒️

> 带 AI 内容工作流的游戏 wiki 模板——广告收入 100% 归你。
> 开源、Cloudflare Pages 原生优化、零成本免费部署上线。
>
> The game wiki template with an AI-native content workflow — 100% of your ad revenue.
> Open source, natively optimized for Cloudflare Pages, free to deploy.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Astro](https://img.shields.io/badge/Astro-5.x-FF5D01?logo=astro&logoColor=white)](https://astro.build)
[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare-Pages-F38020?logo=cloudflare&logoColor=white)](https://pages.cloudflare.com)
[![Release](https://img.shields.io/github/v/release/PNGTRID/AnvilWiki?label=Release&color=brightgreen)](https://github.com/PNGTRID/AnvilWiki/releases)
[![Live Demo](https://img.shields.io/badge/Demo-anvilwiki.pages.dev-brightgreen)](https://anvilwiki.pages.dev/)
[![Project page](https://img.shields.io/badge/Project_page-/landing-8b5cf6)](https://anvilwiki.pages.dev/landing)

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/PNGTRID/AnvilWiki)

> ⚠️ **Fork 部署前必读 / Before deploying a fork**:仓库里的 `wrangler.toml` 存在时,它是 Cloudflare Pages env 的**唯一真相源**,dashboard 的 Environment variables UI 会被完全忽略。fork 后要么跑 `pnpm apply-template`(自动把 `[vars]` 重置为你的域名并清空 demo 值),要么手动改 `[vars]` 或删除该文件。详见 [`docs/deployment.md`](docs/deployment.md)。
>
> ⚠️ The shipped `wrangler.toml`, when present, is the **sole source of truth** for your Cloudflare Pages env — the dashboard's Environment variables UI is ignored. Run `pnpm apply-template` after forking (it resets `[vars]` to your domain and clears demo values), or edit/delete the file yourself. See [`docs/deployment.md`](docs/deployment.md) for details.

> Lighthouse 4×100 — 实测于 [anvilwiki.pages.dev](https://anvilwiki.pages.dev/)（2026-08-12）
<table>
  <tr>
    <td align="center" width="25%">
      <img src="https://img.shields.io/badge/Performance-100-058627?style=for-the-badge&logo=lighthouse&logoColor=white" alt="Performance" />
    </td>
    <td align="center" width="25%">
      <img src="https://img.shields.io/badge/Accessibility-100-058627?style=for-the-badge&logo=lighthouse&logoColor=white" alt="Accessibility" />
    </td>
    <td align="center" width="25%">
      <img src="https://img.shields.io/badge/Best_Practices-100-058627?style=for-the-badge&logo=lighthouse&logoColor=white" alt="Best Practices" />
    </td>
    <td align="center" width="25%">
      <img src="https://img.shields.io/badge/SEO-100-058627?style=for-the-badge&logo=lighthouse&logoColor=white" alt="SEO" />
    </td>
  </tr>
</table>

---

## 📖 中文文档

### 这是什么？

AnvilWiki 是一个**游戏 SEO 内容站模板**——用来快速搭建围绕某款游戏（Roblox、Steam 新游等）的攻略内容站，通过 SEO 获取流量，通过广告变现。**广告收入 100% 归你**：无平台抽成、无收入分成（对比 Fandom 等托管 wiki 的平台分成模式）。

技术栈是 **Astro + Cloudflare Pages**：纯静态输出、零适配器、免费无限带宽、全球 CDN、零 JS 优先（首屏极快）。

### 核心特性

- 💰 **广告收入 100% 归你**：内置 Google AdSense 广告位（3 个位置，env 驱动，默认关闭）——无平台抽成，和托管 wiki 农场完全不同
- 🔍 **SEO 工程化**：sitemap（含 lastmod）/ JSON-LD（含 VideoGame）/ hreflang / robots / 文章 TOC / Quick Answer 摘要块 / llms.txt（AI 搜索），全部代码自动生成
- ⚡ **极快**：Astro 零 JS 优先，Lighthouse 全 100（Performance / Accessibility / Best Practices / SEO）
- 🌐 **Cloudflare 原生**：纯静态输出，零适配器，免费无限带宽
- 🌍 **多语言开箱即用**：英文无前缀（SEO 最优），其他语言带前缀，缺失内容自动 fallback 英文
- 🎮 **wiki 级内容呈现**：Boss 数据卡（frontmatter 驱动）、代码一键复制、TOC 滚动高亮、移动端表格横滑
- 📡 **内容分发**：RSS feed + 分享按钮 + llms.txt，多渠道触达
- 💬 **评论就绪**：内置 Giscus 评论（GitHub Discussions），默认关闭，填 env 即启用，见 [docs/comments.md](docs/comments.md)
- 🔄 **套用模板**：按文件组织的配置参考手册 + 交互式 CLI（`pnpm apply-template`）+ `pnpm new-locale` 语言脚手架
- 🛡️ **隐私合规**：Cookie consent 真门控（同意后才加载 GA/AdSense）
- 🆓 **完全免费**：MIT 协议，Cloudflare Pages 免费部署
- 📝 **类型安全**：Content Collections + Zod schema，构建时发现字段错误 + `pnpm check-config` 三处一致性校验

### 5 分钟快速开始

```bash
# 1. Fork 本仓库到你的 GitHub

# 2. 本地克隆 & 安装
git clone https://github.com/PNGTRID/AnvilWiki.git
cd anvilwiki
pnpm install

# 3. 启动开发服务器
pnpm dev
# 访问 http://localhost:4321

# 4. 改配置层（site.ts / navigation.ts / globals.css）+ 替换内容层（src/content/ / locales/）
#    或用交互式 CLI 自动化基础配置：
pnpm apply-template

# 5. 部署到 Cloudflare Pages
#    cloudflare.com → Pages → Create a project → Connect to Git → 选仓库
#    自动识别 Astro，构建命令 pnpm build，输出目录 dist
```

详细部署指南见 [`docs/deployment.md`](docs/deployment.md)。

### 用 AI 直接生成内容(无需脚本)

fork 后用 ZCode / Claude Code / Codex / Cursor 打开仓库,直接对话即可产页——"帮我写一篇 Emberfang 攻略,以下是打法要点:…"。Agent 会从 `AGENTS.md` 和 `.agent/skills/` 自动加载内容规范(frontmatter 硬规则、组件词汇表、验证命令),生成后自动跑 `pnpm check-content && pnpm build` 自检。

内置 3 个技能(`.agent/skills/`,Agent Skills 开放标准,兼容工具自动发现):

| 技能 | 用途 |
|---|---|
| `anvil-new-article` | 任意素材(口述/视频内容/原始数据)→ 合规 MDX 文章 |
| `anvil-update-codes` | 新兑换码/过期码 → 更新 codes 页并同步多语言 |
| `anvil-refresh` | 新鲜度巡检 → 输出"该更新什么"优先级清单 |

也可以直接 `/anvil-new-article` 斜杠命令调用。`pnpm new-post` 等脚本保留,作为无 AI 环境的兜底。

### 文档导航

完整的文档索引与按角色的阅读路径见 **[docs/README.md](docs/README.md)**(建站赚钱 / 内容作者 / AI Agent / 贡献者四条路径 + 一页决策地图)。

最常用的几份:

| 文档                                                           | 内容                                                        |
| -------------------------------------------------------------- | ----------------------------------------------------------- |
| [docs/game-selection.md](docs/game-selection.md)               | 🎯 从这里开始:选品漏斗 + 首日 10 页工作流                   |
| [docs/apply-template.md](docs/apply-template.md)               | 配置参考手册（按文件组织）                                  |
| [docs/content-format.md](docs/content-format.md)               | MDX 文章格式规范                                            |
| [docs/deployment.md](docs/deployment.md)                       | Cloudflare Pages 部署详细指南                               |
| [docs/development.md](docs/development.md)                     | 🔧 给模板写代码:架构、扩展模式、验证清单、发版流程         |
| [docs/PRD.md](docs/PRD.md)                                     | ⭐ 完整产品设计文档（架构、数据模型、模块设计、路线图）     |

### 为什么不用 Fandom / 自建 Next.js?

| | AnvilWiki | Fandom 类平台 | 自建 Next.js |
| --- | --- | --- | --- |
| 广告收入 | **100% 归你**(自带 AdSense 位) | 平台抽成 | 归你,但要自己接 |
| 每月成本 | **¥0**(Cloudflare Pages 免费无限带宽) | 免费(代价是失去控制权) | Vercel 免费额度有限 |
| Lighthouse | **4×100 开箱即得** | 平台决定 | 自己调优数周 |
| SEO | JSON-LD/hreflang/sitemap 内置 | 平台域名权重高 | 自己实现 |
| 数据所有权 | **你的 Git 仓库,纯文件** | 平台所有 | 你的 |
| 评论/分析 | Giscus / GA / CF Analytics(env 门控) | 平台内置 | 自己选型 |

> 建议的 GitHub 仓库 topics(提升 GitHub 搜索发现率):`game-wiki` `astro-template` `astro` `cloudflare-pages` `seo` `adsense` `wiki` `static-site` `open-source`

### 用 AnvilWiki 建了站?欢迎提交 Showcase

如果你用这个模板上线了自己的 wiki,**欢迎提 PR 把你的站加进官网 Showcase**(修改 `src/config/landing.ts` 的 showcase 数据即可)——真实案例是这个模板最有力的证明。

Built a site with AnvilWiki? **Open a PR to add it to the landing Showcase** (`src/config/landing.ts`) — real user sites are the best proof of this template.

### 交流群

微信扫码添加主理人好友,拉你进群交流讨论(部署问题、功能建议、游戏内容站经验都欢迎):

<p align="center">
  <img src="public/images/wechat-qr.jpg" width="200" alt="微信二维码——扫码添加好友进群交流" />
</p>

### 技术栈

| 技术                                                                           | 用途                |
| ------------------------------------------------------------------------------ | ------------------- |
| [Astro 5](https://astro.build)                                                 | 静态优先框架        |
| [Content Collections](https://docs.astro.build/en/guides/content-collections/) | 类型安全的内容管理  |
| [Tailwind CSS 3](https://tailwindcss.com)                                      | 原子化样式          |
| [Cloudflare Pages](https://pages.cloudflare.com)                               | 免费部署 + 无限带宽 |
| [pnpm](https://pnpm.io)                                                        | 包管理              |

---

## 📖 English Documentation

### What is this?

AnvilWiki is an **open-source game wiki site template** designed for building content sites around specific games (Roblox, Steam new releases, etc.), driving traffic via SEO, and monetizing with ads.

Built on **Astro + Cloudflare Pages**: pure static output, zero adapters, free unlimited bandwidth, global CDN, and zero-JS by default for blazing-fast first paint.

### Key Features

- 💰 **100% your ad revenue**: Built-in Google AdSense slots (3 positions, env-driven, off by default) — no platform cut, unlike hosted wiki farms
- 🔍 **SEO engineering**: sitemap (with lastmod) / JSON-LD (incl. VideoGame) / hreflang / robots / article TOC / Quick Answer blocks / llms.txt (AI search) — all auto-generated
- ⚡ **Blazing fast**: Astro zero-JS by default, Lighthouse 4×100 (Performance / Accessibility / Best Practices / SEO)
- 🌐 **Cloudflare native**: Pure static output, zero adapters, free unlimited bandwidth
- 🌍 **i18n out of the box**: Default locale (English) has no prefix (SEO optimal), others prefixed, missing content falls back to English
- 🎮 **Wiki-grade content**: boss stat cards (frontmatter-driven), one-tap code copy, TOC scrollspy, mobile-friendly tables
- 📡 **Content distribution**: RSS feed + share buttons + llms.txt
- 💬 **Comments ready**: Built-in Giscus comments (GitHub Discussions), off by default, enable via env — see [docs/comments.md](docs/comments.md)
- 🔄 **Apply template**: File-organized config reference + interactive CLI (`pnpm apply-template`) + `pnpm new-locale` scaffolding
- 🛡️ **Privacy-compliant**: cookie consent that actually gates GA/AdSense loading
- 🆓 **Completely free**: MIT license, free Cloudflare Pages deployment
- 📝 **Type-safe**: Content Collections + Zod schema + `pnpm check-config` consistency checks

### Quick Start (5 min)

```bash
# 1. Fork this repo to your GitHub

# 2. Clone & install locally
git clone https://github.com/PNGTRID/AnvilWiki.git
cd anvilwiki
pnpm install

# 3. Start dev server
pnpm dev
# Visit http://localhost:4321

# 4. Edit config layer (site.ts / navigation.ts / globals.css) + replace content layer (src/content/ / locales/)
#    Or run the interactive CLI to automate base config:
pnpm apply-template

# 5. Deploy to Cloudflare Pages
#    cloudflare.com → Pages → Create a project → Connect to Git → select repo
#    Auto-detects Astro, build command pnpm build, output dir dist
```

See [`docs/deployment.md`](docs/deployment.md) for detailed guide.

### Community & Maintainer

Questions, ideas, or want to chat about game content sites? Scan the WeChat QR code to join the discussion group.

<p align="center">
  <img src="public/images/wechat-qr.jpg" width="200" alt="WeChat QR code — scan to join the discussion group" />
</p>

AnvilWiki is open-sourced by **袁锐钦 (Yuan Ruiqin)**, lead of the **PNGTRIBE** team — [GitHub @PNGTRID](https://github.com/PNGTRID).

### License

[MIT](LICENSE) — free for commercial use.

---

> **Status**: ✅ Live demo at **[anvilwiki.pages.dev](https://anvilwiki.pages.dev/)** — Lighthouse 4×100, CI green, fully deployed.
>
> **Features shipped**: Pagefind offline search · Astro Image (WebP/srcset) · Apply-template CLI · Full i18n (en/ja) · SEO (hreflang, JSON-LD incl. VideoGame/VideoObject/ImageObject, sitemap, article TOC, Quick Answer) · Tag aggregation pages (`/tags`) · `/recent` updates page · gameVersion badges · Draft workflow · Callout/Accordion/AffiliateLink MDX components · Image gallery + lightbox · Author system (Person JSON-LD) · Google AdSense ads · Sponsor card (opt-in) · Security headers · Giscus comments (opt-in) · Contact page
>
> 状态：✅ **[anvilwiki.pages.dev](https://anvilwiki.pages.dev/)** 已上线 — Lighthouse 全 100，CI 全绿。
>
> 本项目由 **PNG 部落团队**主理人 **袁锐钦** 开源([GitHub @PNGTRID](https://github.com/PNGTRID))。

---

## Design Notes

AnvilWiki's information architecture follows the industry-standard game wiki layout (Hero → QuickStart → Explore → CTA; article page with content + sticky aside), consistent with public sites and UI libraries. Visual design, code implementation, and all UI text are original. Built with Astro, Tailwind CSS, and Content Collections — no third-party framework runtime.

AnvilWiki 的信息架构遵循游戏 wiki 站的行业通行布局（首页 Hero → 快速入口 → 内容模块 → CTA；文章页正文 + 侧边栏）。视觉设计、代码实现和全部 UI 文案均为原创。基于 Astro、Tailwind CSS 和 Content Collections 构建，无第三方框架运行时。
