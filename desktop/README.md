# RTAF RCC Briefing — Desktop (Windows)

เวอร์ชันโปรแกรม `.exe` แบบระบบปิด รันบนเครื่องที่ใช้งานเท่านั้น ใช้ไฟล์ `../index.html` เป็นต้นฉบับ

- ไลบรารี (Leaflet, html2canvas, jsPDF) และฟอนต์ (Sarabun, Share Tech Mono) อยู่ในโปรแกรม ไม่ต้องใช้เน็ต
- บล็อกการเชื่อมต่อออกนอกเครื่องทั้งหมด ยกเว้นภาพแผนที่ (ปิดได้ที่ `ALLOW_MAP_TILES` ใน `main.js`)
- ข้อมูลเก็บที่ `%APPDATA%\RTAF RCC Briefing` ของผู้ใช้ Windows

## Build

```bash
npm install
npm run build:win     # ได้ dist/RTAF-RCC-Briefing-win32-x64/RTAF-RCC-Briefing.exe
npm start             # ทดลองรันบนเครื่องที่ build
```

บน Linux ต้องมี Wine (`apt-get install -y --no-install-recommends wine64` แล้ว `ln -sf /usr/lib/wine/wine64 /usr/local/bin/wine64`)

แก้ `../index.html` แล้วต้อง build ใหม่ทุกครั้ง ถ้า `prepare.js` แจ้งว่าไม่พบรูปแบบ แปลว่าส่วนหัวของ index.html ถูกแก้ ให้ปรับรายการแทนที่ใน `prepare.js`
