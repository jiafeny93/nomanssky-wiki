# 大版本 24 小时 SOP

> 官方发布大版本（如 Worlds、Cosmos 级更新）或新远征官宣时,本站当天出解读页、刷新全站版本信息。这是本站区别于 Fandom(编辑滞后数天)和媒体稿(无结构化)的核心机制。
>
> 触发条件:Hello Games 官网 news / Steam 公告 / 官方社媒发布任一出现新版本号或新远征公告。

---

## 铁律(先于一切流程)

1. **严禁编造**。官方没写的日期、数值、奖励,要么留空标注"待确认",要么明确写"社区推测"。占位页宁可薄,不可假——这是本站对竞品的信任优势。
2. **每次只从一个部署源发**:本仓库 `~/Desktop/AI_DEV/nomanssky-wiki`。部署前确认没有其他窗口在同时部署(见 [deployment.md](./deployment.md) 的并发警告)。
3. **dateModified 用真实时间**。回头改文章必须刷新 lastModified,不刷等于告诉 Google 内容没变。

---

## T+0h — 情报与骨架

- [ ] 官方信源三连:`nomanssky.com/news` + Steam 更新公告 + 官方 X。Reddit r/NoMansSkyTheGame 只作旁证(玩家实测),不作唯一来源。
- [ ] 建占位/解读页骨架:复制最近一篇同分类文章作模板,固定四段——**官方要点 / 新增物品与数值 / 对矿场·精炼·船价的影响 / FAQ**。
- [ ] 若信息足够:直接写全篇;若官方只官宣未发版:写窗口占位页(参考 `cosmos-patch-notes` 的写法),并放 Callout 承诺"发布后 24h 内更新"。
- [ ] frontmatter:date 与 lastModified 填当天;description 40–165 字符;FAQ 每条 question ≤120 / answer ≤400(schema 超限会**构建失败**)。

## T+2h — 成稿与织网

- [ ] 正文完成(1800–2600 词),内链只指向真实存在的 slug,新页至少 3 条指向既有页、既有 pillar 页(best-ships / expedition-guide / cosmos-update-guide)回链 1 条。
- [ ] 需要新封面:`pnpm covers`(脚本按 slug 确定性生成并自动注入 `image:`,重跑幂等)。
- [ ] `pnpm check-content` 过 schema,`pnpm check` 零错误。

## T+2~6h — 四语言翻译

- [ ] 每语言 1 个翻译代理(单代理全量,避免跨批次术语漂移),指令带术语表与语域:es=tú/hiperturbo、de=du/Units/Multiwerkzeug、fr=vous/multi-outil/distorsion/Œuf du néant、pt=você/hiperpropulsor。游戏名、更新名(Cosmos/The Swarm/Remnant)、Hello Games 不翻;内链路径保持英文;MDX import 块字节不变,import 后不得出现 `---`。
- [ ] 翻完跑术语冲突扫描(`grep` 裁定词的对立词,应为 0)。
- [ ] `pnpm check-i18n` 确认各语言文章数与 UI 键 100% 对齐。

## T+6~12h — 全量验证

- [ ] `pnpm check && pnpm test && SITE_URL=https://nomanssky.wiki pnpm build`
- [ ] 构建产物点检:新页 HTML 存在、hreflang 五语互链、og:image 为新封面绝对 URL。

## T+12~24h — 部署与收录

- [ ] 按语言/单元分 commit(保留回滚粒度),`git push origin main`。
- [ ] 部署(wrangler **必须去掉代理环境变量**):
  ```bash
  env -u https_proxy -u http_proxy -u all_proxy -u HTTPS_PROXY -u HTTP_PROXY -u ALL_PROXY \
    npx wrangler pages deploy dist --project-name nomanssky-wiki
  ```
- [ ] **部署后三查**(并发部署事故的教训,2026-08-18 实发过):
  1. `wrangler pages deployment list` — 最新生产部署是自己这次的;
  2. 直连(绕代理)抽查新页 + 老页 200,不随机 404;
  3. sitemap URL 数、rss 条数对得上。
- [ ] GSC:新页 URL 逐条"请求编入索引"(每天约 10 条配额,首页与 pillar 优先),其余交给 sitemap 自动发现。

## 同日收尾

- [ ] 全站版本徽章/状态类信息刷新(en.json 的 expeditionStatus 等,5 语言同步)。
- [ ] 受影响的旧文章(数值改动)逐篇更新并刷新 lastModified。
- [ ] 记忆文件记一笔:裁定的新术语、页面状态、遗留项。
