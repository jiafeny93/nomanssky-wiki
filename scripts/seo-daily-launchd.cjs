#!/usr/local/bin/node
// launchd 入口：macOS TCC 的桌面访问授权只挂在 /usr/local/bin/node 上，
// bash/python 直接当 launchd 根进程会被 "Operation not permitted" 拦（项目在 ~/Desktop 下）。
// 由已授权的 node 拉起 python，授权沿进程树继承。改本文件路径需同步改 plist。
const { spawnSync } = require('node:child_process');
const r = spawnSync('/usr/bin/python3', ['/Users/a0000/Desktop/AI_DEV/No Man\'s Sky/seo_daily_report.py'], { stdio: 'inherit' });
process.exit(r.status ?? 1);
