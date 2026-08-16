# SEO 工程化

> AnvilWiki 的 SEO 设计原则：**填好内容，SEO 标签由构建流程自动生成**。
>
> 文章写好 frontmatter，首页改好 en.json，构建时自动产出 title / 结构化数据 / sitemap / 多语言 alternate 链接。

---

## 自动生成的 SEO 要素

| 要素                                       | 哪里生成                   | 数据来源                                     |
| ------------------------------------------ | -------------------------- | -------------------------------------------- |
| `<title>`                                  | `BaseLayout.astro`         | 各页面的 title prop                          |
| `<meta description>`                       | `BaseLayout.astro`         | 各页面的 description prop                    |
| `og:title` / `og:description` / `og:image` | `BaseLayout.astro`         | 同上 + image prop                            |
| `twitter:card`                             | `BaseLayout.astro`         | 自动 summary_large_image（文章页）或 summary |
| Organization JSON-LD                       | `BaseLayout.astro`（全站） | `src/config/site.ts`                         |
| WebSite JSON-LD                            | 首页 `index.astro`         | `site.ts`                                    |
| Article JSON-LD                            | `ArticlePage.astro`        | 文章 frontmatter                             |
| BreadcrumbList JSON-LD                     | `ArticlePage.astro`        | 文章 + 分类                                  |
| ItemList JSON-LD                           | `ListPage.astro`           | 分类下所有文章                               |
| FAQPage JSON-LD                            | 首页（可选）               | `en.json` 的 `home.faq.items`                |
| hreflang alternates                        | `BaseLayout.astro`         | 遍历 `routing.locales`                       |
| sitemap.xml                                | `@astrojs/sitemap`         | 自动扫描所有页面                             |
| robots.txt                                 | `src/pages/robots.txt.ts`  | 含 sitemap 链接                              |
| canonical URL                              | `BaseLayout.astro`         | `SITE_URL` + 当前路径                        |

---

## 各页面的 SEO 产出

### 首页

```html
<title>Anvil Quest Wiki - Complete Boss Guides, Codes & Tier Lists</title>
<meta name="description" content="..." />

<!-- JSON-LD -->
<script type="application/ld+json">
  { "@type": "Organization", "name": "...", "url": "...", "logo": "..." }
</script>
<script type="application/ld+json">
  { "@type": "WebSite", "name": "...", "url": "...", "potentialAction": {...} }
</script>
<script type="application/ld+json">
  { "@type": "FAQPage", "mainEntity": [...] }
</script>
```

**title 来自**：`en.json` 的 `home.meta.title`（独立配置，不复用文章格式）。

### 列表页（如 /bosses）

```html
<title>All Bosses — Anvil Quest Wiki</title>

<script type="application/ld+json">
  {
    "@type": "ItemList",
    "name": "All Bosses",
    "itemListElement": [
      { "position": 1, "name": "Emberfang Boss Guide", "url": "..." },
      ...
    ]
  }
</script>
```

**title 来自**：`en.json` 的 `overview.bosses.overviewTitle`。

### 文章页（如 /bosses/emberfang）

```html
<title>Emberfang Boss Guide - Complete Strategy — Anvil Quest Wiki</title>
<meta property="og:type" content="article" />
<meta property="og:image" content="https://domain/images/emberfang.jpg" />
<meta name="twitter:card" content="summary_large_image" />

<script type="application/ld+json">
  {
    "@type": "Article",
    "headline": "...",
    "datePublished": "...",
    "dateModified": "...",
    "author": { "@type": "Organization" },
    "publisher": { "@type": "Organization" }
  }
</script>
<script type="application/ld+json">
  {
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "position": 1, "name": "Home" },
      { "position": 2, "name": "All Bosses" },
      { "position": 3, "name": "Emberfang Boss Guide" }
    ]
  }
</script>
```

**数据来自**：文章的 frontmatter（title / description / image / date / lastModified）。

> **JSON-LD 类型参考**：[schema.org](https://schema.org/)（[Organization](https://schema.org/Organization) / [WebSite](https://schema.org/WebSite) / [Article](https://schema.org/Article) / [BreadcrumbList](https://schema.org/BreadcrumbList) / [ItemList](https://schema.org/ItemList) / [FAQPage](https://schema.org/FAQPage)）、[Google 结构化数据入门](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)

---

## hreflang 多语言链接

每个页面 `<head>` 自动注入所有语言版本的 alternate：

```html
<link rel="alternate" hreflang="en" href="https://domain/bosses/emberfang" />
<link rel="alternate" hreflang="ja" href="https://domain/ja/bosses/emberfang" />
<link rel="alternate" hreflang="x-default" href="https://domain/bosses/emberfang" />
```

`x-default` 指向英文版（默认语言）。

> **参考**：[Google 多语言版本指南](https://developers.google.com/search/docs/specialty/international/localized-versions)（hreflang + x-default 用法）、[Astro i18n 文档](https://docs.astro.build/en/guides/internationalization/)

---

## sitemap 生成规则

**核心原则**：sitemap 只包含**实际存在的 MDX 文件**对应的 URL，**禁止**从硬编码数组生成。

```
构建时：
1. @astrojs/sitemap 扫描所有已生成的静态页面
2. 为每个页面生成 <url> 条目
3. 自动加 hreflang alternate（基于 astro.config.ts 的 i18n 配置）
4. 输出 dist/sitemap-0.xml + dist/sitemap-index.xml
```

**为什么不能硬编码**：列表页的卡片数据（en.json 里的 highlights）可能包含尚未写成文章的条目。如果 sitemap 从卡片数组生成，会产生指向 404 的 URL，损害 SEO。

> **参考**：[sitemaps.org 协议规范](https://www.sitemaps.org/protocol.html)、[Google sitemap 指南](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview)

---

## og:image 绝对路径（强制）

社交平台抓 OG 图要求**绝对路径**：

```html
<!-- ✅ 正确 -->
<meta property="og:image" content="https://domain.com/images/hero.webp" />

<!-- ❌ 错误（相对路径，社交平台抓不到） -->
<meta property="og:image" content="/images/hero.webp" />
```

由 `SITE_URL` 环境变量拼接，**禁止硬编码域名**。

> **参考**：[Open Graph 协议（ogp.me）](https://ogp.me/)（og:image 必须是绝对 URL）、[Google 搜索结果摘要指南](https://developers.google.com/search/docs/appearance/snippet)

---

## SEO 检查清单（上线前）

```
□ title 50-60 字符，含游戏名 + 核心关键词
□ description 150-160 字符，含关键词 + CTA
□ 每页有且仅有一个 H1
□ H1-H4 层级正确，不跳级
□ og:image 是绝对路径，图片真实存在
□ sitemap.xml 可访问，URL 数 = 实际页面数
□ robots.txt 可访问，含 sitemap 链接
□ Google Rich Results Test 验证 JSON-LD 全通过
□ hreflang 覆盖所有语言，x-default 指向英文
□ 移动端适配正常
□ Lighthouse SEO 分数 ≥ 95
```

> **检查清单依据**：[Google title 标签指南](https://developers.google.com/search/docs/appearance/title-element)（title 长度建议）、[Google 搜索结果摘要指南](https://developers.google.com/search/docs/appearance/snippet)（description）、[Google 语义 HTML 指南](https://developers.google.com/search/docs/appearances/semantic-html)（H1 单一性、标题层级）、[MDN 标题元素](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Heading_Elements)

### 用 Google Rich Results Test 验证

1. 访问 https://search.google.com/test/rich-results
2. 输入你的页面 URL
3. 确认所有 JSON-LD 类型（Organization / Article / Breadcrumb / FAQ）都通过

---

## 提交 Google Search Console

1. 打开 https://search.google.com/search-console
2. 添加资源 → 选"网域"方式 → DNS 验证
3. 在 Cloudflare 加 TXT 记录 → 验证所有权
4. 提交 `sitemap-index.xml`（注意是 sitemap-index.xml，不是 sitemap.xml）
5. 等 24-48 小时看收录

> GSC 常见 bug：第一次提交失败可能有缓存，在 URL 末尾加斜杠 `/` 重新提交。

---

## AI 搜索时代：让内容被 AI Overviews / ChatGPT 引用

2025-2026 年 Google AI Overviews 导致出版商搜索流量普遍下降（问答型查询首当其冲——而游戏 wiki 的"怎么打 X""最新 codes"正是问答型）。AnvilWiki 内置了应对这套打法的基础设施，你写作时按下面的规则做即可最大化被引用概率。

### 模板已内置的部分（自动生效）

| 能力 | 作用 |
|---|---|
| `summary` frontmatter + Quick Answer 卡片 | 40-60 词直答块，AI Overviews / featured snippet 抓取的最爱 |
| `llms.txt`（`/llms.txt`） | 给 ChatGPT/Perplexity/Claude 的站点内容索引，构建时自动生成 |
| `boss` frontmatter 数据卡 | 结构化键值对（HP/弱点/位置），AI 倾向引用结构化答案 |
| Article / FAQPage JSON-LD | 语义化结构，AI 爬虫仍解析（FAQ rich result 虽废弃） |
| sitemap `<lastmod>` | Google 唯一信任的调度字段，更新后重新抓取得更及时 |
| RSS feed（`/rss.xml`） | 内容分发的去中心化管道，配合聚合器/IFTTT 自动推送 |

### 写作规则（你需要做的）

1. **H2 用问题句式**：写 `## How do I beat Emberfang in phase 1?` 而非 `## 第一阶段打法`。用户的搜索词就是问题，AI 匹配问题标题。
2. **答案紧跟标题，40-60 词**：H2 下面第一段直接给答案，再展开细节。不要铺垫。
3. **用原生表格/有序列表呈现数据**：掉落率、配装、tier list 用 Markdown 表格（模板已做移动端横滑优化），AI 解析表格的准确率远高于散文。
4. **每篇必填 `summary`**：这是你的"AI 摘要候选人"字段。
5. **时效内容标注日期**：codes/patch notes 类文章的 `lastModified` 保持更新——AI 引用偏好新鲜内容，模板超 90 天会自动显示过期提示。

### 参考（公开权威来源）

- Google 官方：[优化生成式 AI 功能指南](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)
- [llms.txt 规范](https://llmstxt.org/)

---

## 下一步

- [内容格式](./content-format.md)
- [套用模板指南](./apply-template.md)
- 回到 [README](../README.md)


## v1.5–v1.8 新增的 SEO 资产

| 资产 | 位置 | 作用 |
|---|---|---|
| 标签聚合页 | `/tags/<tag>`(各语言独立生成,不回退) | 每篇文章的 tags 变成可收录的内链枢纽页,扩大长尾索引面 |
| `/recent` 页 | 全语言 | 承接 "patch notes / update" 类查询;配合 sitemap lastmod 提升回访 |
| VideoObject JSON-LD | 有 `videos` 的文章 | Google Video 搜索富结果资格 |
| ImageObject JSON-LD | 有 `gallery` 的文章 | Google Images 收录资格 |
| Person JSON-LD | `src/config/authors.ts` 注册过作者的文章 | author 实体从 Organization 升级为 Person(E-E-A-T),支持 sameAs |
| FAQPage JSON-LD | 有 `codes` frontmatter 的文章 | 本地化四问(redeem/过期/频率)结构化 |
| gameVersion 徽章 | 文章头 | 时效性信号,配 90 天过期横幅(STALE_CATEGORIES) |
| game.config 式新鲜度 | content-pipeline 每周审计 | codes >7 天 / 时效分类 >90 天自动开 issue |

注意:FAQPage 富摘要 Google 已限制到政府/医疗站(游戏站拿不到富展示),其价值在结构化信号而非 SERP 样式。
