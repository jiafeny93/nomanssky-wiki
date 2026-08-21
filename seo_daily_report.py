#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
nomanssky.wiki 每日 SEO 日报
============================
每天 09:41 由 launchd 自动跑(也可手动: python3 seo_daily_report.py)

四个模块,缺凭证自动跳过,互不阻塞:
  1. gsc      — Google Search Console API: 查询词/页面 展示·点击·排名 7天环比 + 新词检测
                (需本目录 gsc-secret.json + GSC 后台已加服务账号邮箱)
  2. suggest  — 谷歌联想词挖掘(en+es+pt+fr+de),与快照 diff 出新长尾词(无需任何凭证)
  3. sitemaps — 自家站掉页预警 + 官方 nomanssky.com / 社区资源站 nomansskyresources.com 新页 diff
                (fandom 站被 Cloudflare 盾拦 403,无法监控,不列入)
  4. rank     — 核心词排名: GSC searchAnalytics 真实排名(数据晚 2~3 天;无展示≈未进前 100)
                (复用 gsc-secret.json;2026-08-20 弃用 CSE——谷歌要求项目绑结算卡,大陆无法绑)

输出: seo-reports/YYYY-MM-DD.md + snapshots/ 下历史快照
用法: python3 seo_daily_report.py [--modules gsc,suggest,sitemaps,rank] [--verbose]
"""
import argparse
import datetime as dt
import json
import os
import re
import sys
import time
import xml.etree.ElementTree as ET

import requests

BASE = os.path.dirname(os.path.abspath(__file__))
REPORT_DIR = os.path.join(BASE, "seo-reports")
SNAP_DIR = os.path.join(REPORT_DIR, "snapshots")
GSC_KEY = os.path.join(BASE, "gsc-secret.json")
SEO_CONFIG = os.path.join(BASE, "seo_config.json")
KW_FILE = os.path.join(BASE, "seo_rank_keywords.txt")
SITE = "nomanssky.wiki"

os.makedirs(SNAP_DIR, exist_ok=True)
UA = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"}


def today_str():
    return dt.date.today().isoformat()


def log(msg):
    print("[%s] %s" % (dt.datetime.now().strftime("%H:%M:%S"), msg), flush=True)


def load_json(path, default):
    try:
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return default


def save_json(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, sort_keys=True)


def _gsc_api(creds):
    """webmasters 客户端。httplib2 不读系统代理,缺 PySocks 时还会静默直连→墙外超时,
    这里显式探测本机 7897(Clash),在线则走代理。2026-08-21 踩坑记录。"""
    import httplib2
    from google_auth_httplib2 import AuthorizedHttp
    from googleapiclient.discovery import build
    http_args = {"timeout": 25}
    try:
        import socket
        s = socket.create_connection(("127.0.0.1", 7897), timeout=0.6)
        s.close()
        http_args["proxy_info"] = httplib2.ProxyInfo(  # 3 = PROXY_TYPE_HTTP
            proxy_type=3, proxy_host="127.0.0.1", proxy_port=7897)
        log("GSC 走本机代理 127.0.0.1:7897")
    except Exception:
        log("GSC 直连(7897 代理不在线)")
    return build("webmasters", "v3",
                 http=AuthorizedHttp(creds, http=httplib2.Http(**http_args)),
                 cache_discovery=False)


# ---------------------------------------------------------------- GSC 模块
def gsc_fetch():
    """返回 (报告段落[str], 是否成功)。数据滞后 2-3 天,取最新可得日为窗口末。"""
    from google.oauth2 import service_account
    from googleapiclient.discovery import build
    from googleapiclient.errors import HttpError

    creds = service_account.Credentials.from_service_account_file(
        GSC_KEY, scopes=["https://www.googleapis.com/auth/webmasters.readonly"]
    )
    api = _gsc_api(creds)

    # 探测资源类型: 域名资源 or URL 前缀资源
    site_url = None
    for cand in ["sc-domain:nomanssky.wiki", "https://nomanssky.wiki/"]:
        try:
            api.sites().get(siteUrl=cand).execute()
            site_url = cand
            break
        except HttpError:
            continue
    if not site_url:
        return "## GSC\n\n❌ 服务账号在 GSC 里看不到 nomanssky.wiki 资源(检查后台是否已加邮箱/权限)\n", False

    def q(start, end, dims, limit=25000):
        return (
            api.searchanalytics()
            .query(
                siteUrl=site_url,
                body={"startDate": start, "endDate": end, "dimensions": dims, "rowLimit": limit},
            )
            .execute()
            .get("rows", [])
        )

    # 1) 逐日 35 天,找最新可得日
    end_probe = dt.date.today()
    start_probe = end_probe - dt.timedelta(days=35)
    daily = q(str(start_probe), str(end_probe), ["date"], limit=500)
    if not daily:
        return "## GSC\n\n⚠️ GSC 尚无任何搜索数据(新站正常,过几天再看)\n", True
    latest = max(r["keys"][0] for r in daily)
    latest_d = dt.date.fromisoformat(latest)
    cur_s, cur_e = latest_d - dt.timedelta(days=6), latest_d           # 近 7 天
    prev_s, prev_e = latest_d - dt.timedelta(days=13), latest_d - dt.timedelta(days=7)  # 前 7 天
    log("GSC 最新可得数据日: %s (窗口 %s~%s vs %s~%s)" % (latest, cur_s, cur_e, prev_s, prev_e))

    daily_map = {r["keys"][0]: r for r in daily}

    def rows_by(dim):
        cur = {r["keys"][0]: r for r in q(str(cur_s), str(cur_e), [dim])}
        prev = {r["keys"][0]: r for r in q(str(prev_s), str(prev_e), [dim])}
        return cur, prev

    lines = ["## 1. GSC 搜索数据(截至 %s,滞后 2-3 天)" % latest]

    # 总量环比
    tot_c = sum(r.get("clicks", 0) for r in daily_map.values())
    def week_total(a, b):
        return (
            sum(daily_map[k].get("clicks", 0) for k in daily_map if a <= k <= b),
            sum(daily_map[k].get("impressions", 0) for k in daily_map if a <= k <= b),
        )
    c_cur, i_cur = week_total(str(cur_s), str(cur_e))
    c_prev, i_prev = week_total(str(prev_s), str(prev_e))
    pct = lambda x: ("+" if x >= 0 else "") + "%.0f%%" % (x * 100)
    lines.append(
        "\n**近 7 天 vs 前 7 天**: 点击 %d→%d (%s) · 展示 %d→%d (%s)"
        % (
            c_prev, c_cur, pct((c_cur - c_prev) / c_prev) if c_prev else "新",
            i_prev, i_cur, pct((i_cur - i_prev) / i_prev) if i_prev else "新",
        )
    )

    # 2) 查询词维度
    cur, prev = rows_by("query")
    seen = load_json(os.path.join(SNAP_DIR, "gsc_seen_queries.json"), {"queries": {}})
    new_queries = []
    for k, r in cur.items():
        if k not in seen["queries"]:
            seen["queries"][k] = {"first_seen": today_str()}
            new_queries.append((k, r))
    new_queries.sort(key=lambda x: -(x[1].get("clicks", 0) * 10 + x[1].get("impressions", 0)))
    save_json(os.path.join(SNAP_DIR, "gsc_seen_queries.json"), seen)

    risers, gainers, losers = [], [], []
    for k, rc in cur.items():
        rp = prev.get(k)
        if rp is None:
            continue
        if rc.get("impressions", 0) - rp.get("impressions", 0) >= 5:
            gainers.append((k, rp, rc))
        dp = rp.get("position", 99) - rc.get("position", 99)
        if dp >= 1 and rc.get("impressions", 0) >= 10:
            risers.append((k, rp, rc, dp))
        dc = rc.get("clicks", 0) - rp.get("clicks", 0)
        if dc < 0 and rp.get("clicks", 0) >= 3:
            losers.append((k, rp, rc))
    gainers.sort(key=lambda x: -(x[2]["impressions"] - x[1]["impressions"]))
    risers.sort(key=lambda x: -x[3])
    losers.sort(key=lambda x: x[2]["clicks"] - x[1]["clicks"])

    def tbl(rows, cols):
        out = ["| " + " | ".join(cols) + " |", "|" + "---|" * len(cols)]
        for r in rows:
            out.append("| " + " | ".join(str(c) for c in r) + " |")
        return out

    if risers:
        lines.append("\n### 排名上升榜(位置: 前7天 → 近7天)\n")
        lines += tbl(
            [(k, "%.1f → %.1f" % (rp["position"], rc["position"]), rc["impressions"], rc["clicks"]) for k, rp, rc, _ in risers[:15]],
            ["查询词", "位置", "展示", "点击"],
        )
    if gainers:
        lines.append("\n### 展示增长榜\n")
        lines += tbl(
            [(k, rp["impressions"], rc["impressions"], rc["clicks"], "%.1f" % rc.get("position", 0)) for k, rp, rc in gainers[:15]],
            ["查询词", "展示:旧→新", "新展示", "点击", "位置"],
        )
    if new_queries:
        lines.append("\n### 🆕 新出现的查询词(首次进 GSC,共 %d 个,= 内容机会)\n" % len(new_queries))
        lines += tbl(
            [(k, r.get("impressions", 0), r.get("clicks", 0), "%.1f" % r.get("position", 0)) for k, r in new_queries[:25]],
            ["查询词", "展示", "点击", "位置"],
        )
    if losers:
        lines.append("\n### ⚠️ 点击下滑词\n")
        lines += tbl(
            [(k, rp["clicks"], rc["clicks"], "%.1f → %.1f" % (rp.get("position", 0), rc.get("position", 0))) for k, rp, rc in losers[:10]],
            ["查询词", "点击:旧→新", "新点击", "位置"],
        )

    # 3) 页面维度(精简)
    curp, prevp = rows_by("page")
    page_rows = []
    for k, rc in curp.items():
        rp = prevp.get(k)
        if rp and (rc.get("clicks", 0) - rp.get("clicks", 0) != 0 or rc.get("impressions", 0) - rp.get("impressions", 0) >= 20):
            page_rows.append((k.replace("https://nomanssky.wiki", ""), rp.get("clicks", 0), rc.get("clicks", 0), rp.get("impressions", 0), rc.get("impressions", 0)))
    page_rows.sort(key=lambda x: -(abs(x[2] - x[1]) + (x[4] - x[3]) / 10.0))
    if page_rows:
        lines.append("\n### 页面变化(点击/展示 有动静的)\n")
        lines += tbl([(p, oc, nc, oi, ni) for p, oc, nc, oi, ni in page_rows[:12]],
                     ["页面", "点击旧", "点击新", "展示旧", "展示新"])

    return "\n".join(lines) + "\n", True


# ------------------------------------------------------------ 联想词模块
SUGGEST_SEEDS = [
    "no man's sky wiki", "no man's sky guide", "no man's sky codes", "no man's sky expeditions",
    "no man's sky living ship", "no man's sky sentinel", "no man's sky freighter", "no man's sky units",
    "no man's sky nanites", "no man's sky quicksilver", "no man's sky cosmos", "no man's sky best ship",
    "no man's sky multiplayer", "no man's sky update", "no man's sky map",
]
SUGGEST_LANGS = {"en": "en", "es": "es", "pt": "pt", "fr": "fr", "de": "de"}


def suggest_fetch(verbose=False):
    """谷歌联想词(四语)。a-z 补全挖长尾,快照 diff 出新词。"""
    def ask(q, hl):
        for host in ("https://suggestqueries.google.com/complete/search",
                     "https://www.google.com/complete/search"):
            try:
                r = requests.get(host, params={"client": "firefox", "hl": hl, "q": q},
                                 headers=UA, timeout=6)
                if r.status_code == 200:
                    return r.json()[1]
            except Exception:
                continue
        return []

    seeds = {"en": list(SUGGEST_SEEDS), "es": ["no man's sky"], "pt": ["no man's sky"], "fr": ["no man's sky"], "de": ["no man's sky"]}
    seeds["en"] += ["no man's sky " + ch for ch in "abcdefghijklmnopqrstuvwxyz"]  # 长尾主矿在 en
    found = {}
    for lang, hl in SUGGEST_LANGS.items():
        got = set()
        for s in seeds[lang]:
            got.update(ask(s, hl))
            time.sleep(0.2)
        if not got:
            log("联想词 %s: 0 条(网络故障或该语言暂无联想词,保留旧快照不动)" % lang)
            continue
        found[lang] = sorted(got)
        log("联想词 %s: %d 条" % (lang, len(found[lang])))

    snap_path = os.path.join(SNAP_DIR, "suggest_seen.json")
    seen = load_json(snap_path, {})
    lines = ["## 2. 谷歌联想词(自动补全挖词)"]
    any_new = False
    for lang, words in found.items():
        old = set(seen.get(lang, []))
        fresh = [w for w in words if w not in old]
        seen[lang] = words
        if fresh:
            any_new = True
            lines.append("\n**%s 新联想词 %d 个**:\n" % (lang, len(fresh)))
            lines.append(", ".join("`%s`" % w for w in fresh[:40]))
            lines.append("")
    save_json(snap_path, seen)
    if not any_new:
        lines.append("\n(与上次快照比无新增联想词)")
    return "\n".join(lines) + "\n"


# ---------------------------------------------------------- sitemap 模块
def sitemap_locs(url, cap=30000):
    r = requests.get(url, headers=UA, timeout=30)
    r.raise_for_status()
    txt = r.text
    if len(txt) > 60 * 1024 * 1024:
        txt = txt[: 60 * 1024 * 1024]
    locs = re.findall(r"<loc>\s*([^<\s]+)\s*</loc>", txt)
    return locs[:cap]


def site_sitemap_urls(site):
    """robots.txt 里声明的 sitemap(sitemap.xml 404 时的兜底)"""
    try:
        robots = requests.get(site.rstrip("/") + "/robots.txt", headers=UA, timeout=15).text
        return re.findall(r"(?im)^sitemap:\s*(\S+)", robots)
    except Exception:
        return []


def sitemaps_fetch():
    lines = ["## 3. 站点动态(自家/官方/竞品)"]
    snap_path = os.path.join(SNAP_DIR, "sitemaps_seen.json")
    seen = load_json(snap_path, {})
    for name, url in [
        ("自家站 nomanssky.wiki(自监控: 新部署页/掉页预警)", "https://nomanssky.wiki/sitemap-0.xml"),
        ("官方 nomanssky.com(新闻/更新页 = 新内容机会)", "https://www.nomanssky.com/sitemap.xml"),
        ("社区资源站 nomansskyresources.com", "https://www.nomansskyresources.com/sitemap.xml"),
    ]:
        try:
            try:
                locs = sitemap_locs(url)
            except Exception:
                # sitemap 直链 404 → 从 robots.txt 找声明的 sitemap
                host = "https://" + url.split("//")[1].split("/")[0]
                locs = []
                for s in site_sitemap_urls(host)[:3]:
                    try:
                        locs += sitemap_locs(s)
                    except Exception:
                        pass
                if not locs:
                    # sitemap/robots 全无 → 至少看首页活没活(竞品死站本身是情报)
                    h = requests.get(host, headers=UA, timeout=15)
                    m = re.search(r"<title[^>]*>(.*?)</title>", h.text, re.S | re.I)
                    title = (m.group(1).strip()[:80] if m else "(无 title)")
                    lines.append("\n**%s**: ⚠️ sitemap 与 robots 均不可用;首页 HTTP %d · 标题「%s」— 疑似崩塌/改版,无法 diff 新页" % (name, h.status_code, title))
                    continue
            old = set(seen.get(name, []))
            fresh = [u for u in locs if u not in old]
            seen[name] = locs
            lines.append("\n**%s**: 共 %d 页" % (name, len(locs)))
            gone = [u for u in old if u not in set(locs)]
            if not old:
                lines.append("(首次建立快照,明天起 diff 新增)")
            elif fresh:
                lines.append("🆕 **新增 %d 页**:" % len(fresh))
                for u in fresh[:50]:
                    lines.append("- " + u)
            elif not gone:
                lines.append("(无新页)")
            if old and gone:
                lines.append("⚠️ **消失 %d 页**(自家站=部署事故预警;外部站=对手删页,也是情报):" % len(gone))
                for u in gone[:10]:
                    lines.append("- " + u)
        except Exception as e:
            lines.append("\n**%s**: 拉取失败 %s" % (name, e))
    save_json(snap_path, seen)
    return "\n".join(lines) + "\n"


# ------------------------------------------------------------- 排名模块
def rank_fetch(verbose=False):
    """核心词排名: GSC searchAnalytics 真实排名。2026-08-20 弃用 CSE(谷歌要求项目绑
    结算账户,大陆无法绑卡)。GSC 数据晚 2~3 天;核心词无展示 ≈ 未进前 100。"""
    if not os.path.exists(GSC_KEY):
        return "## 4. 核心词排名\n\n⏳ 等待 `gsc-secret.json`\n", False
    kws = [l.strip() for l in open(KW_FILE, encoding="utf-8")
           if l.strip() and not l.strip().startswith("#")]
    if not kws:
        return "## 4. 核心词排名\n\n⚠️ seo_rank_keywords.txt 为空\n", False

    from google.oauth2 import service_account
    from googleapiclient.discovery import build
    from googleapiclient.errors import HttpError

    creds = service_account.Credentials.from_service_account_file(
        GSC_KEY, scopes=["https://www.googleapis.com/auth/webmasters.readonly"])
    api = _gsc_api(creds)

    site_url = None
    for cand in ["sc-domain:%s" % SITE, "https://%s/" % SITE]:
        try:
            api.sites().get(siteUrl=cand).execute()
            site_url = cand
            break
        except HttpError:
            continue
    if not site_url:
        return "## 4. 核心词排名\n\n❌ 服务账号在 GSC 里看不到 %s\n" % SITE, False

    daily = api.searchanalytics().query(siteUrl=site_url, body={
        "startDate": str(dt.date.today() - dt.timedelta(days=35)),
        "endDate": str(dt.date.today()), "dimensions": ["date"], "rowLimit": 500,
    }).execute().get("rows", [])
    if not daily:
        return "## 4. 核心词排名\n\n⚠️ GSC 尚无搜索数据(新站正常,过几天再看)\n", True
    latest = max(r["keys"][0] for r in daily)
    rows = api.searchanalytics().query(siteUrl=site_url, body={
        "startDate": str(dt.date.fromisoformat(latest) - dt.timedelta(days=6)),
        "endDate": latest, "dimensions": ["query"], "rowLimit": 25000,
    }).execute().get("rows", [])
    by_q = {r["keys"][0].lower(): r for r in rows}
    log("排名数据源: GSC 截至 %s,近 7 天共 %d 个查询词" % (latest, len(rows)))

    snap_path = os.path.join(SNAP_DIR, "rank_history.json")
    prev_rank = load_json(snap_path, {})

    cur_rank = {}
    for kw in kws:
        r = by_q.get(kw.lower())
        cur_rank[kw] = {
            "pos": round(r["position"], 1) if r else None,
            "imp": r.get("impressions", 0) if r else 0,
            "clk": r.get("clicks", 0) if r else 0,
            "date": latest,
        }

    top10 = sum(1 for v in cur_rank.values() if v["pos"] and v["pos"] <= 10)
    top30 = sum(1 for v in cur_rank.values() if v["pos"] and v["pos"] <= 30)
    lines = ["## 4. 核心词排名(GSC 真实数据,截至 %s)" % latest,
             "\n**%d 个核心词: %d 个进前 10,%d 个进前 30;其余无展示(≈未进前 100)**\n"
             % (len(cur_rank), top10, top30)]
    out = ["| 关键词 | 近7天排名 | 上次 | 变化 | 7天展示 | 7天点击 |", "|---|---|---|---|---|---|"]
    for kw, v in cur_rank.items():
        p_old = prev_rank.get(kw, {}).get("pos")
        chg = ""
        if v["pos"] and p_old:
            d = p_old - v["pos"]
            chg = ("↑%g" % d) if d > 0 else (("↓%g" % -d) if d < 0 else "–")
        elif v["pos"] and not p_old:
            chg = "new"
        out.append("| %s | %s | %s | %s | %s | %s |" % (
            kw,
            ("#" + ("%g" % v["pos"])) if v["pos"] else "无展示",
            ("#" + ("%g" % p_old)) if p_old else "-",
            chg,
            "%d" % v["imp"], "%d" % v["clk"],
        ))
    lines += out
    save_json(snap_path, cur_rank)
    return "\n".join(lines) + "\n", True


# ------------------------------------------------------------------ main
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--modules", default="gsc,suggest,sitemaps,rank")
    ap.add_argument("--verbose", action="store_true")
    args = ap.parse_args()
    mods = [m.strip() for m in args.modules.split(",") if m.strip()]

    parts = ["# SEO 日报 %s\n" % today_str(),
             "> 生成时间 %s · 手动跑: `python3 No\\ Man's\\ Sky/seo_daily_report.py`\n"
             % dt.datetime.now().strftime("%Y-%m-%d %H:%M")]

    status = []
    if "gsc" in mods:
        if os.path.exists(GSC_KEY):
            try:
                s, ok = gsc_fetch()
                parts.append(s)
                status.append("gsc✓")
            except Exception as e:
                parts.append("## 1. GSC\n\n❌ 失败: `%s`\n" % e)
                status.append("gsc✗")
        else:
            parts.append("## 1. GSC\n\n⏳ 等待 `No Man's Sky/gsc-secret.json`(授权步骤见 1-ANIIMO/Aniimo/《GSC-API授权指引.md》第 2 步)\n")
            status.append("gsc-")
    if "suggest" in mods:
        try:
            parts.append(suggest_fetch(args.verbose))
            status.append("sgg✓")
        except Exception as e:
            parts.append("## 2. 联想词\n\n❌ 失败: `%s`\n" % e)
            status.append("sgg✗")
    if "sitemaps" in mods:
        try:
            parts.append(sitemaps_fetch())
            status.append("sit✓")
        except Exception as e:
            parts.append("## 3. sitemap\n\n❌ 失败: `%s`\n" % e)
            status.append("sit✗")
    if "rank" in mods:
        try:
            s, ok = rank_fetch(args.verbose)
            parts.append(s)
            status.append("rnk%s" % ("✓" if ok else "-"))
        except Exception as e:
            parts.append("## 4. 排名抽查\n\n❌ 失败: `%s`\n" % e)
            status.append("rnk✗")

    parts.append("\n---\n*模块状态: %s · 明天 09:41 自动再跑*\n" % " ".join(status))
    out = os.path.join(REPORT_DIR, "%s.md" % today_str())

    def split_sections(text):
        """按 '## ' 标题切段,返回 {标题行: 段文本};非 ## 前后内容忽略"""
        secs, cur, buf = {}, None, []
        for line in text.split("\n"):
            if line.startswith("## "):
                if cur is not None:
                    secs[cur] = "\n".join(buf)
                cur, buf = line, [line]
            elif cur is not None:
                buf.append(line)
        if cur is not None:
            secs[cur] = "\n".join(buf)
        return secs

    merged = ""
    if os.path.exists(out):  # 同日重跑: 旧段保留,本次模块段替换
        try:
            old_secs = split_sections(open(out, encoding="utf-8").read())
            new_secs = split_sections("\n".join(parts))
            old_secs.update(new_secs)
            merged = "\n".join(old_secs[h] for h in sorted(old_secs))
        except Exception:
            pass
    body = merged if merged else "\n".join(parts)
    with open(out, "w", encoding="utf-8") as f:
        f.write(body)
    log("日报已写: %s (%s)" % (out, " ".join(status)))


if __name__ == "__main__":
    main()
