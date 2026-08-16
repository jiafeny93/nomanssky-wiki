# AnvilWiki 文档中心

> 全部文档按**角色**和**使用时机**组织。从下面找到你的路径,按顺序读即可。

## 快速索引

| 文档 | 一句话 | 读者 |
|---|---|---|
| [game-selection.md](game-selection.md) | 做哪个游戏?上线第一天写什么? | 🎯 想建站赚钱的人(从这里开始) |
| [README](../README.md) | 项目是什么 + 5 分钟跑起来 | 所有人 |
| [apply-template.md](apply-template.md) | 把 demo 站换成你的游戏(配置层手册) | fork 用户 |
| [deployment.md](deployment.md) | 部署到 Cloudflare Pages(含 wrangler.toml 大坑) | fork 用户 |
| [content-format.md](content-format.md) | 怎么写文章(frontmatter 字段表 + 组件用法) | 内容作者 |
| [seo.md](seo.md) | SEO 工程化:为什么每个页面长这样 | 内容作者 / 好奇的人 |
| [comments.md](comments.md) | 接入 Giscus 评论 | 需要评论的站长 |
| [staying-up-to-date.md](staying-up-to-date.md) | fork 之后怎么同步上游更新 | fork 用户(长期) |
| [migration-from-nextjs.md](migration-from-nextjs.md) | 从 Next.js 模板迁移 | 迁移用户 |
| [development.md](development.md) | 给模板本身写代码:架构、模式、验证、发版 | 贡献者 / 模板开发者 |
| [PRD.md](PRD.md) | 完整产品设计文档(架构、数据模型、路线图) | 深入理解每个设计决策 |
| [ROADMAP-v1.5-v1.6.md](ROADMAP-v1.5-v1.6.md) | v1.5-v1.8 的规划存档(专家团审计产出) | 想了解演进逻辑的人 |

## 阅读路径

### 🎯 路径 A:我想用这个模板建站赚钱(最常见)

```
1. game-selection.md      ← 先回答"做哪个游戏",这比建站重要
2. README                 ← fork + 本地跑起来(5 分钟)
3. apply-template.md      ← 换成你的游戏(或跑 pnpm apply-template)
4. game-selection.md 首日 10 页 ← 用 AI 直接产页(README「用 AI 直接生成内容」章节)
5. deployment.md          ← 部署上线(⚠️ 必读 wrangler.toml 警告)
6. staying-up-to-date.md  ← 上线后回来看:如何跟上游、如何保持新鲜
```

### ✍️ 路径 B:我是内容作者(站已建好,我来写文章)

```
1. content-format.md      ← 唯一必读:frontmatter 字段表 + 正文规则 + 组件清单
2. seo.md 第 1-4 条       ← 问题式 H2、Quick Answer——为什么这么写
3. (日常) 对 AI 说"帮我写一篇 X"即可——.agent/skills/ 会自动生效
   兑换码更新 → /anvil-update-codes;不知道该更新什么 → /anvil-refresh
```

### 🤖 路径 C:我是 AI Agent(ZCode / Claude Code / Codex / Cursor)

```
1. AGENTS.md              ← 仓库根目录,自动加载:硬规则 + 对话式产页章节
2. .agent/skills/         ← 自动发现的 3 个技能(anvil-new-article / update-codes / refresh)
3. docs/content-format.md ← 需要字段细节时查
```

### 🔧 路径 D:我要给模板本身贡献代码

```
1. development.md         ← 开发指导:三层架构、加功能的模式、验证清单、发版流程(必读)
2. PRD.md 第 3-13 章      ← 架构与每个模块的设计依据
3. AGENTS.md              ← 工程约束 + Astro 5 踩坑清单(6 条,全是实测)
4. development.md 的发版流程 ← 改完代码怎么验证、怎么发版
```

## 一页决策地图

```
我该读哪份文档?
│
├─ 还没建站,纠结做哪个游戏 ──────────→ game-selection.md
├─ 刚 fork,要换成我的游戏 ───────────→ apply-template.md
├─ 要部署 / 部署后 env 不生效 ───────→ deployment.md(wrangler.toml 警告)
├─ 要写/更新文章 ────────────────────→ content-format.md 或直接对 AI 说
├─ 上游更新了,要不要合并 ───────────→ staying-up-to-date.md
├─ 想改模板代码 / 提 PR ────────────→ development.md
└─ 想知道"为什么这么设计" ───────────→ PRD.md
```

## 维护约定

- 新增文档:**必须**同步加进上面的快速索引,并归入某条阅读路径
- 文档面向 fork 用户的部分用中文为主、关键术语保留英文;面向国际社区的锚点在 README 英文区
- 与代码强相关的规则(硬约束)优先写进 `AGENTS.md`(Agent 自动读),文档负责"为什么"和"怎么做"
