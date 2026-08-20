// 生成 favicon 全家桶 + hero.webp，写入模板 public/ 并备份到 requirements/
// 运行方式：cd nomanssky-wiki && node requirements/assets-src/gen.cjs
const fs = require('fs');
const path = require('path');

const TPL = '/Users/a0000/Desktop/AI_DEV/nomanssky-wiki';
const sharp = require(path.join(TPL, 'node_modules', 'sharp'));
const SRC = __dirname;
const REQ = path.join(SRC, '..');

async function svgPng(buf, size) {
  const density = Math.ceil((72 * size) / 64);
  return sharp(buf, { density }).resize(size, size).png().toBuffer();
}

// PNG-embedded ICO（Vista+ 全兼容）
function makeIco(entries) {
  const n = entries.length;
  const header = Buffer.alloc(6 + 16 * n);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(n, 4);
  let offset = 6 + 16 * n;
  let pos = 6;
  const datas = [];
  for (const e of entries) {
    const s = e.size >= 256 ? 0 : e.size;
    header[pos] = s;
    header[pos + 1] = s;
    header[pos + 2] = 0;
    header[pos + 3] = 0;
    header.writeUInt16LE(1, pos + 4);
    header.writeUInt16LE(32, pos + 6);
    header.writeUInt32LE(e.buf.length, pos + 8);
    header.writeUInt32LE(offset, pos + 12);
    offset += e.buf.length;
    pos += 16;
    datas.push(e.buf);
  }
  return Buffer.concat([header, ...datas]);
}

(async () => {
  const logo = fs.readFileSync(path.join(SRC, 'logo.svg'));
  const hero = fs.readFileSync(path.join(SRC, 'hero.svg'));

  // favicon 全家桶
  const jobs = [
    [16, 'favicon-16x16.png'],
    [32, 'favicon-32x32.png'],
    [180, 'apple-touch-icon.png'],
    [192, 'android-chrome-192x192.png'],
    [512, 'android-chrome-512x512.png'],
  ];
  const bufs = {};
  for (const [s, f] of jobs) {
    bufs[s] = await svgPng(logo, s);
    fs.writeFileSync(path.join(TPL, 'public', f), bufs[s]);
  }
  fs.writeFileSync(path.join(TPL, 'public', 'favicon.svg'), logo);
  const ico48 = await svgPng(logo, 48);
  fs.writeFileSync(
    path.join(TPL, 'public', 'favicon.ico'),
    makeIco([{ size: 16, buf: bufs[16] }, { size: 32, buf: bufs[32] }, { size: 48, buf: ico48 }])
  );

  // hero 1200x630
  const heroWebp = await sharp(hero, { density: 144 }).resize(1200, 630).webp({ quality: 88 }).toBuffer();
  fs.writeFileSync(path.join(TPL, 'public', 'images', 'hero.webp'), heroWebp);
  fs.writeFileSync(path.join(TPL, 'public', 'images', 'hero.svg'), hero);
  // 自检用 PNG 预览
  const heroPng = await sharp(hero, { density: 144 }).resize(1200, 630).png().toBuffer();
  fs.writeFileSync(path.join(SRC, 'hero-preview.png'), heroPng);
  fs.writeFileSync(path.join(SRC, 'logo-preview.png'), bufs[512]);

  // 备份到 requirements/（SOP 规定的产出物目录）
  const R = path.join(REQ, 'favicon_io');
  fs.mkdirSync(R, { recursive: true });
  for (const f of [
    'favicon.svg',
    'favicon.ico',
    'favicon-16x16.png',
    'favicon-32x32.png',
    'apple-touch-icon.png',
    'android-chrome-192x192.png',
    'android-chrome-512x512.png',
  ]) {
    fs.copyFileSync(path.join(TPL, 'public', f), path.join(R, f));
  }
  fs.copyFileSync(path.join(TPL, 'public', 'images', 'hero.webp'), path.join(REQ, 'hero.webp'));

  console.log('OK: favicon x7 + hero.webp + previews');
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
