# 大版本 24 小时更新 SOP

> 本站区别于全部竞品的核心机制：**新版本发布 → 24 小时内解读页上线 + 全站版本状态同步刷新**。
>
> 对照竞品实况（2026-08 侦察证据）：Fandom 补丁汇总页滞后 5 周以上、核心玩法页滞后 8 个月且版本标注自相矛盾；
> 官网首页停在 2019 年、补丁条目只有一句话。谁先满足搜索意图，谁拿排名——这个 SOP 就是护城河。

---

## 触发条件

| 信号 | 来源 | 动作 |
|------|------|------|
| 更新预告（teaser/trailer） | 官网 news、官方 X、Reddit 置顶 | 进入「预告期」流程（T-2 天） |
| 补丁正式发布 + patch notes | [nomanssky.com/release-log](https://www.nomanssky.com/release-log/) | 启动本 SOP 主流程（T0） |
| 新远征开启/结束 | 游戏内公告、Reddit | 补充远征页 + 时间线 |
| Redux 复刻公告 | 官方 X | 更新 `redux-expeditions-schedule` 页 |

建议把官方 X（@NoMansSky）、r/NoMansSkyTheGame、release-log 三处设为每日一次的检查点。

---

## 时间线

### T-2 天（预告期）——抢先占位

1. 在对应分类下新建预告文章（slug 按 `requirements/关键词.json` 的规则：关键词小写中划线）
2. 内容框架：官方确认了什么 / 社区报道了什么（明确标注出处层级）/ 发布后本页将持续更新
3. `date` 与 `lastModified` 填当天——**预告页就是占位页，发布日当天改写为正式解读页**

### T0（发布日）——当天必做

1. **改写预告页为正式解读页**，固定四段结构：
   - 官方 patch notes 要点（链接官网原文）
   - 新增物品与数值变化
   - 对既有玩法的影响（矿场 / 精炼 / 船价 / 存档）
   - FAQ（会被 `faqPageJsonLd` 吃进富摘要）
2. **首页时间线模块刷新**：`src/locales/en.json` → `home.explore.modules` 里 displayType 为 `timeline` 的模块，把新版本加到第一位并打 `"badge": "Latest"`，去掉旧条目的 Latest
3. **全站版本徽章**：相关旧文章补充「XX 版本已验证/已过时」提示段，并更新其 `lastModified`
4. 构建 + 部署 + 抽查（见下方检查清单）

### T+24h —— 收尾

1. 检查 GSC「网页索引」是否出现新 URL；未收录则手动「请求编入索引」
2. 搜索新版本关键词，记录我站排名位置（种子词表见 `requirements/01竞品分析与反超方案.md`）
3. 补充社区新发现的细节（Reddit 热帖里的实测数据）

### T+7天 —— 长尾巩固

1. 补齐次级页面：新物品/新机制的独立攻略页，内链回 pillar 页
2. 更新 `guides/new-update-2026` 年度汇总表

---

## 硬性规范（踩过的坑）

- **frontmatter 字符串一律用双引号**：`title: "No Man's Sky ..."`。单引号包撇号（`'...Man's...'`）会让 YAML 解析直接失败、构建报错——2026-08-17 已批量修过一次，`requirements/articles/en/` 源草稿已同步修复
- **目录名 = category = navigation key**，三处一致（cosmos-update / expeditions / guides）
- **title ≤ 80 字符、description 40–165 字符**，Zod 构建时强校验，超了直接红
- **sitemap 只含真实 MDX**：新建分类必须先有文章，再进 `navigation.ts`，否则产生空列表页
- **lastModified 必须真实**：只在内容真的变更时更新，虚构新鲜度会被搜索引擎反噬

## 部署命令（直传模式，无需 git）

```bash
pnpm build
npx wrangler pages deploy dist --project-name nomanssky-wiki --branch main
```

> 项目名来自 `wrangler.toml` 的 `name` 字段（已改为 `nomanssky-wiki`）。
> 若换成 GitHub + Pages Git 集成模式，见 [deployment.md](./deployment.md)。

## T0 检查清单

```
□ 新文章 frontmatter 双引号、长度合规、category 正确
□ 首页 timeline 模块已置顶新版本 + Latest 徽章
□ 受影响的旧文章已加版本提示并更新 lastModified
□ pnpm test 全绿
□ pnpm build 零警告
□ 部署后抽查：新 URL 200 / sitemap 已含新 URL / 首页时间线已更新
□ GSC 请求编入索引
□ 记录排名快照（8 组种子词）
```

---

## 下一步

- [SEO 工程化](./seo.md) — 结构化数据与 sitemap 细节
- [内容格式](./content-format.md) — MDX 写作规范
- 回到 [README](../README.md)
