# 配置参考手册

> 把 AnvilWiki 从 demo 站（虚构游戏 "Anvil Quest"）换成你的目标游戏站点。
>
> 本文档按**文件**组织——你要改什么，就查对应文件的章节。不规定操作顺序，你想先改哪个都行。
>
> 核心原则：**只改配置层和内容层，代码层（src/pages/、src/components/、src/lib/）不动。**

---

## 文件索引

| 要改什么 | 去哪个文件 |
|---|---|
| 站点名称、域名、社交链接、游戏信息 | [src/config/site.ts](#1-site配置) |
| 导航分类（bosses / guides / codes...） | [src/config/navigation.ts](#2-navigation配置) |
| 主题色 | [src/styles/globals.css](#3-主题色) |
| 支持的语言 | [src/i18n/routing.ts](#4-语言列表) + [src/i18n/ui.ts](#4-语言列表) |
| 所有 UI 文案（首页、导航、页脚） | [src/locales/en.json](#5-ui文案) |
| favicon / Hero 图 / PWA | [public/](#6-静态资源) |
| 文章内容 | [src/content/wiki/](#7-mdx-文章) |
| 广告 key | Cloudflare 环境变量 `PUBLIC_ADSENSE_*`（参考 [Google AdSense](https://adsense.google.com/)） |

> 想自动化基础配置？运行 `pnpm apply-template`，它会交互式引导你完成 site.ts / navigation.ts / globals.css / routing.ts / locales 的修改。

---

## 1. site 配置

**文件**：`src/config/site.ts`

这是站点信息的唯一来源。所有页面都从这里读站点名、域名、社交链接。

```ts
export const site = {
  name: 'Anvil Quest Wiki',          // → 改成 "{你的游戏名} Wiki"
  shortName: 'AQW',                  // → 缩写
  description: '...',                // → 含游戏名 + 核心关键词
  domain: 'anvilwiki.pages.dev',     // → 你的域名（不带 https://）
  tagline: '...',                    // → 副标题
  legalNotice: '...',                // → 法律声明
  social: {
    official: 'https://...',         // → 游戏官网
    discord: 'https://...',          // → 没有就留 undefined
    youtube: 'https://...',
    twitter: 'https://...',
    reddit: 'https://...',
  },
  game: {
    name: 'Anvil Quest',             // → 游戏名
    platform: 'Steam',              // → Roblox / Steam / PS5 等
    developer: '...',               // → 开发商
    genre: 'Action RPG',            // → 游戏类型
    releaseDate: '2026-01-01',      // → 发售日（可选）
  },
};
```

**注意事项**：
- `domain` 不带 `https://` 协议前缀（协议由 `SITE_URL` 环境变量统一管理）
- 社交链接没有的留 `undefined`，不要删字段

---

## 2. navigation 配置

**文件**：`src/config/navigation.ts`

定义导航栏的分类。每个分类 = 一个内容类型（bosses / guides / codes...）。

```ts
export const NAVIGATION_CONFIG = [
  { key: 'bosses', path: '/bosses', icon: 'lucide:swords' },
  { key: 'guides', path: '/guides', icon: 'lucide:book-open' },
  { key: 'codes',  path: '/codes',  icon: 'lucide:gift' },
  // → 改成你的游戏需要的内容分类
];
```

**必须同步的三处**（改了 navigation.ts 就必须同步另外两处）：

| 位置 | 例子 |
|---|---|
| `navigation.ts` 的 `key` | `bosses` |
| `en.json` 的 `nav.bosses` | `"bosses": "Bosses"`（显示文本） |
| `src/content/wiki/<locale>/bosses/` | 目录名必须 = key |

`icon` 从 [lucide 图标库](https://lucide.dev/)选，加 `lucide:` 前缀。

---

## 3. 主题色

**文件**：`src/styles/globals.css`（顶部 4 行）

```css
:root {
  --brand: 22 90% 52%;        /* 亮色主色（HSL，空格分隔） */
  --brand-light: 22 90% 62%;  /* 亮色浅色变体 */
}
.dark {
  --brand: 22 85% 48%;        /* 暗色主色 */
  --brand-light: 22 85% 58%;  /* 暗色浅色变体 */
}
```

**怎么换色**：把你的 hex 色值转成 HSL（用 [w3schools HSL 转换器](https://www.w3schools.com/colors/colors_hsl.asp) 或任何工具），替换这 4 行的值。其他 CSS 变量（`--background` / `--foreground` / `--border` 等）通过 `var(--brand)` 自动跟随，不用改。

**验证**：
```bash
grep "brand" src/styles/globals.css          # 确认 4 行已更新
grep -rn "#[0-9a-fA-F]\{6\}" src/components/  # 确认组件里无硬编码 hex
```

---

## 4. 语言列表

**文件**：`src/i18n/routing.ts` + `src/i18n/ui.ts`

AnvilWiki 支持 as-needed 前缀策略：英文（默认）无 URL 前缀，其他语言带前缀（`/ja/...`、`/ru/...`）。

### routing.ts

```ts
export const locales = ['en', 'ja'] as const;
// → 改成你需要的语言，如 ['en', 'ja', 'ru', 'es']
```

### ui.ts

每加一个语言，需要在 ui.ts 注册 import：

```ts
import en from '~/locales/en.json';
import ja from '~/locales/ja.json';
// → 加新语言：import ru from '~/locales/ru.json';

export const messages = { en, ja /* , ru */ };
```

同时创建对应的空 JSON 文件（缺 key 会自动 fallback 英文）：

```bash
echo '{}' > src/locales/ru.json
```

**必须同步的三处**：
1. `routing.ts` 的 `locales` 数组
2. `src/locales/` 下实际存在的 JSON 文件
3. `ui.ts` 的 import + `messages` 对象

少同步任何一处，构建会报错。

---

## 5. UI 文案

**文件**：`src/locales/en.json`（英文真相源）+ `src/locales/<locale>.json`（其他语言）

所有用户可见的文字都在这里。**组件里不硬编码任何文字。**

### 主要命名空间

| 命名空间 | 内容 | 示例 |
|---|---|---|
| `site` | 站点名、描述、法律声明 | `site.name`、`site.description` |
| `nav` | 导航栏分类文本 | `nav.bosses: "Bosses"` |
| `overview` | 列表页标题和描述 | `overview.bosses.overviewTitle` |
| `home` | 首页所有文案 | `home.hero`、`home.start`、`home.explore` 等 |
| `footer` | 页脚 | `footer.copyrightText` |
| `shared` | 通用文案 | `shared.readMore`、`shared.noArticles` |

### 首页 home 命名空间结构

首页的数据结构详见 [PRD §6.5](./PRD.md#65-首页-home-命名空间)。关键字段：

- `home.meta.title` / `description`：SEO 元数据（title 50-60 字符，description 150-160 字符）
- `home.hero`：Hero 区域（`badge` / `title` / `description` / `ctaPrimary` / `ctaSecondary`）
- `home.start.cards[]`：QuickStart 卡片（4 张，每张含 `icon` + `href`）
- `home.explore.modules[]`：内容模块（4 个，每个含 `displayType` + `highlights[]`）
- `home.closingCta`：底部号召文案

**SEO 要求**：`home.explore.modules[].name` 必须包含游戏名。

### 多语言翻译

非英文 JSON 缺 key 时会通过 deepMerge 自动 fallback 英文。所以你可以先只翻译部分 key，不会崩溃。

不要翻译的内容：
- 法律页正文（硬编码英文）
- 文章正文（走 MDX 文件，放 `src/content/wiki/<locale>/`）

---

## 6. 静态资源

**目录**：`public/`

| 文件 | 说明 |
|---|---|
| `favicon.ico` / `favicon-16x16.png` / `favicon-32x32.png` | 浏览器标签图标 |
| `apple-touch-icon.png` | iOS 主屏图标（180×180） |
| `android-chrome-192x192.png` / `android-chrome-512x512.png` | Android 主屏图标 |
| `manifest.json` | PWA manifest（改 `name` / `short_name`） |
| `images/hero.webp` | Hero 图（模板自带可能是占位，必须换成真实图） |

**Hero 图**：模板自带的可能是占位文件。换成你的真实 Hero 图，格式推荐 WebP（体积最小）。如果你拿到的是 PNG/JPG，用任何工具转成 WebP 后覆盖。

**favicon 生成**：用 [favicon.io](https://favicon.io/favicon-converter/) 从一张图生成全套。

---

## 7. MDX 文章

**目录**：`src/content/wiki/<locale>/<category>/`

每篇文章是一个 `.mdx` 文件，使用 YAML frontmatter：

```mdx
---
title: "文章标题 - 游戏名"
description: "155 字符以内的描述，含关键词"
category: "bosses"
date: 2026-08-11
lastModified: 2026-08-11
image: "../../../../assets/covers/your-cover.png"
tags: ["boss", "guide"]
---

## 正文从 H2 开始
不写 H1——ArticlePage 自动用 title 渲染 H1。
```

文章格式详细说明见 [内容格式](./content-format.md)。

**分类目录名**必须与 `navigation.ts` 的 `key` 一致：`src/content/wiki/en/bosses/emberfang.mdx` → key = `bosses` → URL `/bosses/emberfang`。

**从其他格式迁移**：如果你的文章用的是 `export const metadata`（JS 元数据写法），需要手动改成 YAML frontmatter，详见 [内容格式 - 迁移](./content-format.md#从其他格式迁移文章)。

---

## 上线检查清单

```
□ site.ts 所有字段已换成新游戏
□ navigation.ts 分类与 content/ 子目录一致
□ globals.css 主题色已改（4 行）
□ routing.ts 语言与 locales/*.json 同步
□ en.json 无 demo 游戏名残留
□ favicon 全套已替换
□ hero 图是真实图片（非占位）
□ 所有 MDX frontmatter 通过 Zod schema（pnpm build 不报错）
□ sitemap URL 全部返回 200（pnpm check-sitemap）
□ SITE_URL 环境变量已配（含 https:// 协议，改 wrangler.toml 或 dashboard）
```

---

## 下一步

- [部署指南](./deployment.md)：部署到 Cloudflare Pages
- [内容格式](./content-format.md)：MDX 文章怎么写
- [SEO 说明](./seo.md)：SEO 工程化细节
- 回到 [README](../README.md)
