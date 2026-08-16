# 部署指南

> 把 AnvilWiki 部署到 Cloudflare Pages，全程免费、零配置、无限带宽。
>
> 预计耗时：首次 10 分钟，熟练后 3 分钟。

---

## 前提条件

- 一个 [GitHub](https://github.com) 账号（免费）
- 一个 [Cloudflare](https://cloudflare.com) 账号（免费）
- 本地已安装 Node.js 22+ 和 pnpm
- 已经 fork 了 AnvilWiki 仓库并改好了配置层（见 [apply-template.md](./apply-template.md)）

> 还没 fork？看 [快速开始](../README.md#5-分钟快速开始)。

---

## 方式一：Cloudflare Pages Git 自动部署（推荐新手）

这是最简单的方式——连一下 GitHub 仓库，之后每次 `git push` 自动构建部署。

### Step 1 — 推代码到 GitHub

```bash
# 在项目根目录
git init
git add .
git commit -m "Initial commit: AnvilWiki site"
git branch -M main
git remote add origin https://github.com/<你的用户名>/<你的仓库>.git
git push -u origin main
```

> 如果你 fork 的仓库，remote 已经配好了，直接 `git push`。

### Step 2 — 在 Cloudflare 创建 Pages 项目

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 左侧菜单选 **Workers & Pages**
3. 点 **Create** → **Pages** → **Connect to Git**
4. 授权 Cloudflare 访问你的 GitHub（首次需要）
5. 选中你的 AnvilWiki 仓库
6. 点 **Begin setup**

### Step 3 — 配置构建

Cloudflare 会自动检测 Astro，但请确认以下设置：

| 字段                       | 值                                  |
| -------------------------- | ----------------------------------- |
| **Project name**           | 你的站点名（如 `anvil-quest-wiki`） |
| **Production branch**      | `main`                              |
| **Framework preset**       | `Astro`（自动识别）                 |
| **Build command**          | `pnpm build`                        |
| **Build output directory** | `dist`                              |
| **Root directory**         | `/`（留空）                         |

展开 **Environment variables (advanced)**，添加：

| 变量名                    | 值                            | 说明                                   |
| ------------------------- | ----------------------------- | -------------------------------------- |
| `NODE_VERSION`            | `22`                          | 确保 Node 版本（pnpm 11 需要 ≥22.13）  |
| `SITE_URL`                | `https://<project>.pages.dev` | **先用临时域名**，必须含 `https://` 前缀 |
| `PUBLIC_ADSENSE_CLIENT`    | （你的 AdSense Publisher ID） | 可选，留空则不显示广告                 |

> ⚠️ **`SITE_URL` 必须含 `https://` 前缀**（如 `https://anvilquestwiki.wiki`，不是裸域名 `anvilquestwiki.wiki`）。Astro 把它当 URL 解析，裸域名会让 build 报 `Invalid url`。它影响 sitemap、og:image、robots.txt 里所有绝对 URL 的生成。

> 🚨 **重要：`wrangler.toml` 会接管 env 配置。** 本仓库根目录有 `wrangler.toml`，里面声明了 `[vars]` 段。**当 wrangler.toml 存在时，Cloudflare dashboard 的 Environment variables 会被完全忽略**（[官方文档](https://developers.cloudflare.com/pages/functions/wrangler-configuration/)）。所以你有两个选择：
>
> - **选项 A（推荐新手）：删掉 `wrangler.toml`**，然后 dashboard 的 Environment variables 就能正常工作。fork 后 `git rm wrangler.toml && git commit`，再在 dashboard 配 env 即可。
> - **选项 B（保留 wrangler.toml）：改 `wrangler.toml` 的 `[vars]` 值**，把 `SITE_URL` 和 `PUBLIC_GISCUS_*` 改成你自己的，dashboard 不用配（配了也被忽略）。
>
> 如果你在 dashboard 配了 env 但 build 时拿不到（症状：组件不渲染、`process.env` 读不到），99% 是踩了这个坑。诊断方法：在 `astro.config.ts` 顶部加一行 `console.log('ENV:', Object.keys(process.env).filter(k => k.startsWith('PUBLIC_')))`，push 后看 build 日志。

### Step 4 — 部署

点 **Save and Deploy**。Cloudflare 会：

1. 拉取你的代码
2. 运行 `pnpm install` + `pnpm build`
3. 把 `dist/` 部署到全球 CDN

构建日志里看到 `Complete!` 和 `27 page(s) built` 就成功了。整个过程 2-3 分钟。

### Step 5 — 访问站点

部署完成后，你会拿到一个 `https://<project>.pages.dev` 的地址，打开就能看到你的站点了。

---

## 绑定自定义域名

免费赠送的 `*.pages.dev` 域名可以一直用，但为了 SEO 和品牌，建议绑自定义域名。

### Step 1 — 买域名

推荐平台（按价格/易用度）：

| 平台                                                        | 后缀推荐         | 价格       |
| ----------------------------------------------------------- | ---------------- | ---------- |
| [Spaceship](https://spaceship.com)                          | `.wiki` / `.com` | ~十几元/年 |
| [Cloudflare Registrar](https://dash.cloudflare.com/domains) | `.com` / `.net`  | 成本价     |
| [Namecheap](https://namecheap.com)                          | `.xyz` / `.com`  | ~十几元/年 |

> 游戏 wiki 站首选 `.wiki` 后缀——便宜、相关性高、SEO 友好。

### Step 2 — 在 Cloudflare 配域名

1. 进入你的 Pages 项目 → **Custom domains** → **Set up a custom domain**
2. 输入你的域名（如 `anvilquestwiki.wiki`）
3. Cloudflare 会给你一条 **CNAME 记录**：
   ```
   类型:  CNAME
   名称:  @（或 www）
   值:    <project>.pages.dev
   ```
4. 去你的域名注册商后台，把这条 CNAME 加上
5. 等 DNS 生效（几分钟到几小时）

### Step 3 — 更新 SITE_URL 并重新部署

DNS 生效后，改 `SITE_URL` 为你的真实域名。**根据你部署时的选择**：

- **如果删了 `wrangler.toml`**：去 Cloudflare Pages → **Settings** → **Environment variables**，把 `SITE_URL` 改成 `https://anvilquestwiki.wiki`。
- **如果保留了 `wrangler.toml`**：改 `wrangler.toml` 里 `[vars]` 的 `SITE_URL`，commit + push。

```
SITE_URL=https://anvilquestwiki.wiki
```

然后触发一次重新部署（push 一个空 commit，或在 dashboard 点 **Retry deployment**）。

> ⚠️ 这一步必做——否则 sitemap 里的 URL 还是 `*.pages.dev`，影响 SEO。

### Step 4 — HTTPS 自动生效

Cloudflare 会自动签发 Let's Encrypt SSL 证书。DNS 生效后等 5-15 分钟，`https://` 就能访问了。期间浏览器报证书错误（CN=`*.pages.dev`）是正常的，证书变 **Active** 后就好。

---

## 方式二：Wrangler CLI 部署（进阶）

适合不想连 GitHub、或想在 CI/CD 里控制部署的场景。

### 前提

```bash
# 安装 Wrangler（Cloudflare 的 CLI）
pnpm add -g wrangler

# 登录
wrangler login
```

### 部署

```bash
# 先构建
pnpm build

# 部署到 Pages
wrangler pages deploy dist --project-name=<你的项目名>
```

首次会问你是否创建项目，选 yes。之后每次部署就一行命令。

---

## 方式三：导出静态文件到其他平台

AnvilWiki 是纯静态站点（`dist/`），可以部署到任何静态托管：

| 平台             | 配置                                      | 免费额度     |
| ---------------- | ----------------------------------------- | ------------ |
| **Netlify**      | Build: `pnpm build`，Publish: `dist`      | 100GB/月带宽 |
| **Vercel**       | 自动识别 Astro                            | 100GB/月带宽 |
| **GitHub Pages** | 需配 `base`                               | 100GB/月带宽 |
| **自建 VPS**     | `scp -r dist/ user@vps:/var/www/` + nginx | 看你的 VPS   |

> ⚠️ 只有 Cloudflare Pages 是**无限带宽**。其他平台超量后要么限速要么收费。这也是 AnvilWiki 默认推荐 Cloudflare 的原因。

---

## 环境变量清单

在 Pages → **Settings** → **Environment variables** 配置。支持 Production / Preview 两套。

| 变量                        | 必填 | 说明                                                   |
| --------------------------- | ---- | ------------------------------------------------------ |
| `SITE_URL`                  | ✅   | 站点绝对 URL（无尾斜杠），影响 sitemap/og:image/robots |
| `NODE_VERSION`              | ✅   | 固定 `22`                                              |
| `PUBLIC_ADSENSE_CLIENT`      | 可选 | AdSense Publisher ID（`ca-pub-XXXXXXXXXXXXXXXX`）      |
| `PUBLIC_ADSENSE_SLOT_STICKY` | 可选 | Sticky 粘顶横幅 slot ID                                |
| `PUBLIC_ADSENSE_SLOT_SIDEBAR`| 可选 | Sidebar 桌面端侧边栏 slot ID                           |
| `PUBLIC_ADSENSE_SLOT_INCONTENT` | 可选 | InContent 文章内 slot ID                            |
| `PUBLIC_GA_ID`              | 可选 | Google Analytics ID                                    |

完整清单见 [`.env.example`](../.env.example)。所有广告变量**留空时对应广告位不渲染**——新手可以先不配广告把站上线，后续再加。

---

## 部署后验证清单

部署成功后，逐项检查：

```bash
# 1. 站点可访问
curl -I https://<你的域名>/
# 期望: HTTP/2 200

# 2. sitemap 可访问
curl https://<你的域名>/sitemap-index.xml
# 期望: 返回 XML，含你的所有页面 URL

# 3. robots.txt 可访问
curl https://<你的域名>/robots.txt
# 期望: 含 Sitemap: https://<你的域名>/sitemap-index.xml

# 4. 多语言页面可访问
curl -I https://<你的域名>/ja/   # 日文首页
curl -I https://<你的域名>/bosses/  # 英文列表页

# 5. 文章页正常
curl -I https://<你的域名>/bosses/emberfang/
# 期望: 200，不是 404

# 6. 法律页可访问
curl -I https://<你的域名>/about/
curl -I https://<你的域名>/privacy-policy/
```

### SEO 验证

1. **Google Rich Results Test**：https://search.google.com/test/rich-results
   - 输入你的首页 URL，验证 Organization + WebSite + FAQPage 结构化数据有效
   - 输入一篇文章 URL，验证 Article + BreadcrumbList 有效

2. **Google Search Console**：
   - 添加你的域名（选"网域"方式 → DNS 验证）
   - 提交 `sitemap-index.xml`
   - 等 24-48 小时看收录情况

### 性能验证

1. **PageSpeed Insights**：https://pagespeed.web.dev
   - 输入你的域名，Lighthouse Performance 应该 ≥ 95
   - Core Web Vitals 全绿（LCP < 2.5s，CLS < 0.1）

---

## 常见问题

### Q: 构建失败，报 `Cannot find module 'astro:content'`

A: Cloudflare Pages 的 Node 版本可能不对。确认环境变量 `NODE_VERSION=22` 已配。

### Q: 构建失败，报 `ERR_PNPM_IGNORED_BUILDS`

A: pnpm 版本太新，需要 `pnpm-workspace.yaml` 里的 `allowBuilds` 配置（仓库已自带）。确认文件存在：

```bash
cat pnpm-workspace.yaml
# 应该看到:
# allowBuilds:
#   esbuild: true
#   sharp: true
```

### Q: 部署成功但页面 404

A: 检查 Cloudflare 的 **Build output directory** 是不是 `dist`（不是 `public` 或 `.next`）。

### Q: 图片不显示 / og:image 抓不到

A: og:image 必须是**绝对路径**。确认：

1. `SITE_URL` 环境变量已配为最终域名
2. `public/images/hero.webp`（或你的封面图）确实存在且不是 0 字节占位文件
3. 用 `curl` 检查：`curl -I https://<你的域名>/images/hero.webp` 应返回 200

### Q: sitemap 里的 URL 还是 `*.pages.dev` 而不是自定义域名

A: `SITE_URL` 环境变量没更新或没重新部署。改完后必须触发一次新部署。

### Q: 日文页面显示英文 fallback

A: 这是设计行为，不是 bug。参见 [PRD §9.3](./PRD.md#93-文章-fallback-机制)：单篇文章缺失时自动回退英文，保证 URL 不 404；列表页不回退（该语言没内容就显示空状态）。

---

## 下一步

- [套用模板指南](./apply-template.md)：把 demo 站换成真实游戏
- [内容格式](./content-format.md)：怎么写 MDX 文章
- 回到 [README](../README.md)
