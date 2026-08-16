# 选品与首日工作流(从 0 到上线第一个 24 小时)

> 本页回答 fork 用户最贵的两个问题:**做哪个游戏**(选品)和**上线第一天做什么**(首日)。
> 方法论参考了社区验证的"游戏 wiki SEO 套利"实践(选品漏斗 + 关键词验证 + 意图分类产页)。

## 为什么选品比建站重要

游戏 wiki 的流量结构:新游戏爆发后 **2-8 周**是黄金窗口(该游戏生命周期 60-80% 的搜索量),
此后指数衰减。窗口选对了,普通内容也有排名;选错了,完美内容也没有流量。

**选品判断的本质是两个概率的乘积:**
1. 这个游戏会火吗?(需求验证)
2. 火的时候 Google 结果页还有空位吗?(竞争验证)

## 选品漏斗(四层,从 100 个到 1 个)

### 第 1 层 · 发现(广撒网)

| 来源 | 看什么 |
|---|---|
| itch.io `/newest`(Play in browser) | 每日新游,零竞争窗口最大 |
| Steam 新品/热门愿望单 | 品质信号强,但竞争也强 |
| Roblox 新游 rising | codes/wiki 需求最密集的生态 |
| YouTube 游戏频道近期爆款 | 50K+ views / 7 天 = 确认需求存在的金标准 |

### 第 2 层 · 游戏评分(信号模型)

对每个候选打分(0-100,≥60 进入下一层):

- **wiki 内容深度**(硬门槛,不满足直接淘汰):游戏有没有足够的机制/物品/攻略/Boss 可写?
  纯休闲小游戏没有 wiki 需求。
- **社交证明**:评论数/订阅/同时在线;devlog 活跃度(作者还在更新=内容窗口长)
- **标题搜索友好度**:玩家会搜"游戏名 + wiki/guide/codes"吗?
- **英语内容**(国际搜索量)

### 第 3 层 · 需求验证(最关键的一步)

用 Google Trends 对比锚定词(`{game name} codes` / `{game name} wiki` vs 一个已知基准词):
**只有搜索量真实存在且在上升,才值得建站。** YouTube 高播放但 Trends 无搜索 = 观众在YouTube看,不搜 wiki。

### 第 4 层 · 竞争验证(2 分钟)

Google 搜 `{game name} wiki` 和 `{game name} codes`,看前 10:
- 结果 < 10 条 / 大多是 PDF、论坛帖、YouTube → **空位,立即建**
- Fandom 有但内容薄、更新慢 → 可切
- Fandom/Game8 内容厚且日更 → 放弃,换下一个

**双源规则**:需求信号至少两个独立来源交叉确认(如 Trends + YouTube);
只有单一来源(如仅 Reddit 讨论)的,先观察一周再决定。

## 建站(30 分钟)

选品完成后 → fork 本仓库 → `pnpm apply-template`(或跑一次 "Initialize AnvilWiki"
workflow)→ 详细步骤见 [apply-template.md](apply-template.md) 和 [deployment.md](deployment.md)。

## 首日 10 页(黄金窗口的黄金 24 小时)

fork 完成的第一天,目标不是打磨站点,是**让 Google 尽快看到 10 个可索引页面**。
用 AI 直接产页(见 README「用 AI 直接生成内容」,或 `/anvil-new-article` 技能):

| 顺序 | 页面 | 为什么第一 |
|---|---|---|
| 1 | `{game} codes`(用 `codes` frontmatter + 自动 Active/Expired 分区) | codes 是流量最高的页面类型,玩家默认日更 |
| 2 | beginner guide(`guides`) | "how to start X" 是新手第一搜 |
| 3-5 | 3 个最重要 Boss/关卡攻略(`bosses`,带 boss 数据卡) | 长尾明确、可引用性强 |
| 6 | tier list / 最佳装备排名 | Commercial 意图,RPM 高 |
| 7 | how to redeem / 基础机制 FAQ | 问题式 H2 → featured snippet 候选 |
| 8-10 | 补齐选品时验证过的 Top 3 搜索词对应页面 | 窗口词优先 |

每篇都必须:问题式 H2 + 首段 40-60 词直答(summary 字段)→ 这是 AI 搜索时代被引用的最小单元。

**首日之后**:每周跑一次 freshness 审计(Actions 里已配好 `Content freshness audit`
定时任务,会自动开 issue 提醒该更新什么);codes 页数据更新用 `/anvil-update-codes` 技能。

## 意图 → 页面类型决策表(产页前先分类)

| 搜索意图 | 特征词 | 页面类型 | 千万别 |
|---|---|---|---|
| Transactional | codes / redeem / free | codes 页(表格+复制) | 写成 3000 字指南 |
| Informational | how to / how do I | 指南页(问题式 H2) | 堆砌表格没有解释 |
| Commercial | best / tier / vs / ranking | 排名/对比页(表格为主) | 不给结论 |
| Navigational | wiki / guide / map | 聚合页/分类页 | 只放链接没有内容 |
