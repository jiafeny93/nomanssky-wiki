# 同步上游更新(Staying Up to Date)

> fork 之后如何持续吸收 AnvilWiki 上游的新功能,而不丢失你自己的游戏配置和内容。

## 核心原则:三层分离让 merge 可行

AnvilWiki 的代码/配置/内容三层分离(见 README)正是为这个场景设计的:

| 层 | 目录 | fork 后你会改吗 | merge 冲突概率 |
| --- | --- | --- | --- |
| Code | `src/pages` `src/components` `src/lib` `src/i18n` | 几乎不碰 | 低 |
| Config | `src/config` `src/locales` `src/styles/globals.css` `wrangler.toml` `astro.config.ts` | 一定会改 | **高(预期内)** |
| Content | `src/content` `src/locales/<loc>.json` 的 home 数据 | 一定会替换 | 高(预期内) |

上游新功能(组件、页面、脚本)几乎全部落在 Code 层,所以 merge 通常很干净。

## 同步步骤

```bash
# 1. 添加上游 remote(一次性)
git remote add upstream https://github.com/PNGTRID/AnvilWiki.git

# 2. 拉取并合并
git fetch upstream
git merge upstream/main

# 3. 冲突时:Config/Content 层的冲突永远保留你自己的值
#    (你的游戏名、主题色、文案、文章),只把上游 Code 层的改动收进来。

# 4. 验证三件套
pnpm check-config   # 三处一致性(分类 key / 语言列表)
pnpm build          # schema 校验 + 构建
pnpm check-links    # 内链对账(build 后)
```

## 版本策略(SemVer)

- **MAJOR**(如 v2.0):有 breaking change —— 升级需要按 CHANGELOG 的迁移说明操作。
- **MINOR**(如 v1.5 → v1.6):新功能,默认关闭或向后兼容(env 门控),merge 后开箱行为不变。
- **PATCH**:bug 修复,直接 merge 即可。

**兼容性承诺**:
- frontmatter 字段只增不改名,旧文章永远能构建;
- 所有可选功能(广告/评论/赞助/分析)都是 env 门控 + 默认关闭,新版本不会让它们自动开启;
- `src/locales/<locale>.json` 缺 key 时运行时回退英文,merge 上游新增的 UI key 不会报错(可用 `pnpm check-i18n` 查看缺哪些)。

## 每次同步后的检查清单

```bash
pnpm check-config   # 配置三处一致
pnpm check-i18n     # 上游新增 UI key → 你需要翻译的清单
pnpm typecheck && pnpm test && pnpm build
pnpm check-links    # dist/ 内链全检
```

## 不想同步怎么办

完全没问题。这是一个静态模板,不是运行时依赖 —— 你的 fork 冻结在某个版本也能永远跑下去。建议至少合并 PATCH(安全/bug 修复),用 `git cherry-pick` 挑选也行。
