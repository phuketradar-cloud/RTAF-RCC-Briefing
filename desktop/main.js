// RTAF RCC Briefing — Desktop (Windows) แบบระบบปิด
// - โหลดหน้าเว็บจากไฟล์ในเครื่อง (app/index.html)
// - บล็อกการเชื่อมต่อออกนอกเครื่องทั้งหมด ยกเว้นภาพแผนที่ (ถ้าเครื่องมีเน็ต)
// - ข้อมูลเก็บในโฟลเดอร์ผู้ใช้ของ Windows (%APPDATA%\RTAF RCC Briefing)
const { app, BrowserWindow, session, shell } = require('electron');
const path = require('path');

// ภาพแผนที่: ตั้งเป็น false ถ้าต้องการตัดการเชื่อมต่อภายนอกทั้งหมด (แผนที่จะไม่มีพื้นหลัง)
const ALLOW_MAP_TILES = true;
const MAP_TILE_HOSTS = [
  'tile.openstreetmap.org',
  'mt1.google.com',
  'server.arcgisonline.com',
  'tile.opentopomap.org',
];

function isAllowed(url) {
  const u = new URL(url);
  if (['file:', 'data:', 'blob:', 'about:', 'devtools:', 'chrome-extension:'].includes(u.protocol)) return true;
  if (ALLOW_MAP_TILES && u.protocol === 'https:') {
    return MAP_TILE_HOSTS.some(h => u.hostname === h || u.hostname.endsWith('.' + h));
  }
  return false;
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: '#0a1628',
    title: 'RTAF RCC Briefing',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  // หน้าต่างพิมพ์/PDF ของระบบเปิดเป็น about:blank — อนุญาต; ลิงก์เว็บภายนอกส่งไปเปิดในเบราว์เซอร์
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url === '' || url === 'about:blank') {
      return { action: 'allow', overrideBrowserWindowOptions: { autoHideMenuBar: true, width: 1000, height: 900 } };
    }
    if (/^https?:/.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });

  // ห้ามหน้าหลักเปลี่ยนไปหน้าอื่น
  win.webContents.on('will-navigate', (e, url) => {
    if (!url.startsWith('file:')) e.preventDefault();
  });

  win.once('ready-to-show', () => { win.maximize(); win.show(); });
  win.loadFile(path.join(__dirname, 'app', 'index.html'));
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => {
    const [win] = BrowserWindow.getAllWindows();
    if (win) { if (win.isMinimized()) win.restore(); win.focus(); }
  });

  app.whenReady().then(() => {
    session.defaultSession.webRequest.onBeforeRequest((details, cb) => {
      cb({ cancel: !isAllowed(details.url) });
    });
    session.defaultSession.setPermissionRequestHandler((_wc, _perm, cb) => cb(false));
    createWindow();
  });

  app.on('window-all-closed', () => app.quit());
}
