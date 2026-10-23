// สร้างโฟลเดอร์ app/ จาก ../index.html สำหรับเวอร์ชัน Desktop (ออฟไลน์)
// - เปลี่ยนไลบรารีจาก CDN เป็นไฟล์ในเครื่อง (vendor/)
// - เปลี่ยนฟอนต์ Google Fonts เป็นไฟล์ในเครื่อง
// - ตัดส่วน PWA (manifest / icon) ที่ไม่ใช้ใน Desktop
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SRC = path.join(ROOT, '..', 'index.html');
const OUT = path.join(ROOT, 'app');
const VENDOR = path.join(OUT, 'vendor');
const NM = path.join(ROOT, 'node_modules');

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(VENDOR, { recursive: true });

const copy = (from, to) => fs.cpSync(path.join(NM, from), path.join(VENDOR, to), { recursive: true });
copy('leaflet/dist', 'leaflet');
copy('html2canvas/dist/html2canvas.min.js', 'html2canvas.min.js');
copy('jspdf/dist/jspdf.umd.min.js', 'jspdf.umd.min.js');

// ฟอนต์: คัดเฉพาะน้ำหนักที่หน้าเว็บใช้
const fontDir = path.join(VENDOR, 'fonts');
const fontCss = [];
for (const [pkg, weights] of [
  ['sarabun', [300, 400, 600, 700]],
  ['share-tech-mono', [400]],
  ['cinzel', [600, 700]],
  ['noto-serif-thai', [500, 600, 700]],
]) {
  fs.cpSync(path.join(NM, '@fontsource', pkg, 'files'), path.join(fontDir, pkg, 'files'), { recursive: true });
  for (const w of weights) {
    fs.copyFileSync(path.join(NM, '@fontsource', pkg, `${w}.css`), path.join(fontDir, pkg, `${w}.css`));
    fontCss.push(`@import url('${pkg}/${w}.css');`);
  }
}
fs.writeFileSync(path.join(fontDir, 'fonts.css'), fontCss.join('\n') + '\n');

let html = fs.readFileSync(SRC, 'utf8');

// แต่ละรายการต้องเจอในไฟล์ ถ้าไม่เจอ (index.html ถูกแก้) ให้ build ล้มเหลว จะได้รู้ตัว
const replacements = [
  [/<link rel="manifest"[^>]*>\s*/, ''],
  [/<link rel="apple-touch-icon"[^>]*>\s*/, ''],
  [/https:\/\/unpkg\.com\/leaflet@1\.9\.4\/dist\/leaflet\.css/, 'vendor/leaflet/leaflet.css'],
  [/https:\/\/unpkg\.com\/leaflet@1\.9\.4\/dist\/leaflet\.js/, 'vendor/leaflet/leaflet.js'],
  [/https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/html2canvas\/1\.4\.1\/html2canvas\.min\.js/, 'vendor/html2canvas.min.js'],
  [/https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/jspdf\/2\.5\.1\/jspdf\.umd\.min\.js/, 'vendor/jspdf.umd.min.js'],
  [/https:\/\/fonts\.googleapis\.com\/css2\?[^'")]*/g, 'vendor/fonts/fonts.css'],
  [/☁️ กำลังเชื่อมต่อ\.\.\./, '💻 ออฟไลน์ — เก็บข้อมูลในเครื่อง'],
];
for (const [re, to] of replacements) {
  if (!re.test(html)) throw new Error(`prepare.js: ไม่พบรูปแบบ ${re} ใน index.html`);
  re.lastIndex = 0;
  html = html.replace(re, to);
}

// หน้าต่างพิมพ์ (about:blank) ไม่มี base URL ที่แน่นอน จึงใช้ path แบบเต็มของไฟล์ฟอนต์
const PRINT_FONT = "@import url('vendor/fonts/fonts.css');\n    *{margin:0";
if (!html.includes(PRINT_FONT)) throw new Error('prepare.js: ไม่พบ @import ฟอนต์ของหน้าต่างพิมพ์');
html = html.replace(PRINT_FONT, "@import url('${new URL('vendor/fonts/fonts.css', location.href).href}');\n    *{margin:0");

fs.writeFileSync(path.join(OUT, 'index.html'), html);
console.log('app/ พร้อมแล้ว');
