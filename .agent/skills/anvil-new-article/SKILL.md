---
name: anvil-new-article
description: 从用户提供的素材(口述要点/视频内容/别的攻略/原始数据)直接生成一篇符合 AnvilWiki schema 的 MDX 文章页,自动填 frontmatter(title/description/category/tags/summary/boss 等),写完后自动跑校验。触发词:写文章 / 生成攻略页 / new article / 帮我把这些内容做成页面。
---

# AnvilWiki 新文章生成

把用户给的任何素材变成一篇构建必过的 MDX 页面。**先读规范再动手:**

1. 读 `docs/content-format.md`(frontmatter 字段表 + 正文规则)
2. 读 `src/content.config.ts`(Zod schema——这是构建时硬校验,不过就 build 失败)
3. 读 `src/config/navigation.ts` 的 `CONTENT_TYPES`(category 必须是这里的 key)
4. 参考一篇同类文章(如 `src/content/wiki/en/bosses/emberfang.mdx`)对齐结构

## 工作流

### Step 1 — 判断页面类型(按搜索意图)

| 用户素材特征 | category 建议 | 页面形态 |
|---|---|---|
| 兑换码列表 / 奖励码 | `codes` | frontmatter `codes:` 数组(status/expiryDate/source),页面自动渲染 Active/Expired 分区 + FAQPage JSON-LD |
| Boss 打法 / 属性 | `bosses` | frontmatter 加 `boss:` 结构化数据卡 + 按阶段 H2 |
| 教程 / 路线 / how to | `guides` | 问题式 H2 + 每节首段 40-60 词直答 |
| 排名 / 对比 | `guides`(或 tier-list 分类若存在) | 表格为主 |

### Step 2 — 写 frontmatter(硬规则)

- `description`: **40-165 字符**,build 会失败短于 40
- `title`: ≤80 字符,含游戏名+关键词(如 "Emberfang Boss Guide - Complete Strategy")
- `date` / `lastModified`: ISO 日期(YYYY-MM-DD)
- `summary`: 40-60 词直答句(会成为 Quick Answer 卡 + AI 搜索摘要候选)
- `tags`: 3-5 个,复用已有 tag(跑 `grep -r "tags:" src/content/wiki/en/` 看现有词,保证标签页聚合)
- 时效性内容加 `gameVersion`(如 "v2.5")
- 素材未验证的版本,加 `draft: true`(dev 可见,build 排除)

### Step 3 — 写正文(硬规则)

- **不写 H1**——H1 由 title 渲染;第一个标题必须是 H2
- H2 用问题式("How do I dodge the fire volley?")
- 每个 H2 后第一段直接回答(40-60 词),再展开
- 数据用 Markdown 表格(移动端可横滑、AI 可解析)
- 兑换码用 `<CodeBlock code="..." label="..." />`(import 自 `~/components/article/CodeBlock.astro`)
- 提示/警告用 `<Callout type="warn|tip">`,多阶段细节用 `<Accordion title="...">`(import 自 `~/components/mdx/`)
- 图片放 `src/assets/covers/`,frontmatter `image` 写相对路径
- 内链用无尾斜杠相对路径(`/bosses/emberfang`,不是 `https://...` 也不是 `/bosses/emberfang/`)
- 视频**两条规则**:
  1. **frontmatter `videos: [id]` 必须登记**(这是 VideoObject JSON-LD 的来源)
  2. 位置:想放在某个小节下面,就在该小节末尾 `import Video from '~/components/mdx/Video.astro'` + `<Video id="..." title="..."/>`(与 Callout 同款心智);只想文末展示则只写 frontmatter(内联过的 id 不会在文末重复渲染)

### Step 4 — 自检(必须执行)

```bash
pnpm check-content     # H1/alt/跳级/尾斜杠 lint
pnpm build             # Zod schema + 全站构建,任何 frontmatter 错误在这里暴露
```

两个都过才算完成。build 失败就修 frontmatter 再跑。

### Step 5 — 汇报

告诉用户:文件路径、预览方式(`pnpm dev` + URL)、建议补充项(封面图/翻译版)。
