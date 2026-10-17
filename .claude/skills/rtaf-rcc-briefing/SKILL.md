---
name: rtaf-rcc-briefing
description: Maintain and extend the "RTAF RCC Briefing" app (ระบบบรรยายสรุปการปฏิบัติงาน ห้องประสานงานการค้นหาและช่วยชีวิต ศยอ.ศปก.ทอ.) — a single-file, Thai-language HTML/JS PWA in the repo phuketradar-cloud/RTAF-RCC-Briefing (index.html) used for the daily SAR duty briefing. Use this skill whenever the user asks to add a feature, fix a bug, restyle, or explain any part of the briefing app — the duty/standby roster (เจ้าหน้าที่เวร / สำรอง), aircraft status FMC/PMC/NMC (สถานภาพอากาศยาน), daily missions (ภารกิจประจำวัน), training zones OSCAR/FOCAL/BIGSHELL (แผนการฝึกบิน), the Leaflet coverage map (แผนที่ Coverage, 150 NM), the "อื่นๆ" image attachments, themes, save/Export JSON/Word/PDF, or the PWA — even if the word "skill" or the repo name is not mentioned.
---

# RTAF RCC Briefing — คู่มือดูแลระบบ

แอปหน้าเดียว (`index.html` ~3,100 บรรทัด, HTML + CSS + vanilla JS ในไฟล์เดียว ไม่มี build step)
สำหรับเจ้าหน้าที่ RTAF RCC ใช้เตรียมและนำเสนอ **บรรยายสรุปประจำวัน** ของหน่วยบินค้นหาและช่วยชีวิต (SAR)
ข้อมูลเก็บใน `localStorage` ของเบราว์เซอร์ และส่งออกเป็น JSON / Word / PDF ได้

อ่าน `references/code-map.md` เมื่อต้องการรายละเอียดฟังก์ชัน, element id และโครงสร้างข้อมูล

## หน้าจอ (nav tabs ตามลำดับ)

| # | ปุ่ม | page id | เนื้อหา |
|---|------|---------|---------|
| 0 | 👮 เจ้าหน้าที่เวร | `page-duty` | นาฬิกา Bangkok realtime (พ.ศ.), ตารางเวร 5 ตำแหน่ง (`dutySlots`), ตารางสำรอง 5 ช่อง (`standbySlots`), นำเข้า CSV รายชื่อ (`staffDB`) |
| 1 | 🚁 สถานภาพอากาศยาน | `page-aircraft` | การ์ดสรุป FMC/PMC/NMC, ตารางหน่วยบิน 9 หน่วย (`units`) เลือกสถานภาพ / การติดต่อสื่อสาร / สาเหตุ, ปุ่ม "บันทึก & ดูแผนที่" |
| 2 | 📋 ภารกิจประจำวัน | `page-mission` | ตารางภารกิจต่อหน่วย สถานภาพ sync จากหน้า 1 อัตโนมัติ |
| 3 | 🗺️ แผนการฝึกบิน | `page-training` | Zone editor (`zones`): OSCAR, FOCAL, BIGSHELL + เพิ่ม/ลบเขตและรายการ |
| 4 | 🗺️ แผนที่ Coverage | `page-map` | Leaflet map, marker 🚁 + วงกลม coverage 150 NM (BELL-412 = 100 NM), sidebar เปลี่ยนสถานภาพ, ย้ายที่ตั้งผ่าน popup, base layers Google/OSM/Esri/OpenTopo |
| 5 | 📎 อื่นๆ | `page-others` | 5 sub-tab แนบภาพ (สูงสุด 10 ภาพ/แท็บ, zoom, 1/2 คอลัมน์): แผนการปฏิบัติทางอากาศ, ภารกิจติดตามอากาศยาน, OSCAR, FOCAL, BIGSHELL |

ปุ่มลอยขวาล่างสลับธีม 4 แบบ: Dark (ค่าเริ่มต้น) → Light → Camo → Heavy Metal (`body.theme-*`, เก็บใน `localStorage['rtaf_theme']`)

## ความหมายสถานภาพ (ห้ามเปลี่ยนสี/คำโดยไม่ได้รับคำสั่ง)

- **FMC** — พร้อมปฏิบัติเต็มที่ — เขียว `#00ff88` — คลาส `sf` / `st-fmc` — วงกลมเส้นทึบ
- **PMC** — พร้อมปฏิบัติบางส่วน — เหลือง `#ffd700` — `sp` / `st-pmc` — เส้นประ `4,3`
- **NMC** — ไม่พร้อมปฏิบัติ — แดง `#ff4444` — `sn` / `st-nmc` — เส้นประ `6,6`, opacity 0.4
- การติดต่อสื่อสาร: `comm: 'ok'` (✅ ติดต่อได้) / `'no'` (❌ ติดต่อไม่ได้)

## กฎสำคัญเมื่อแก้โค้ด

1. **ไฟล์เดียว** — แก้ใน `index.html` เท่านั้น อย่าแยกไฟล์ CSS/JS หรือเพิ่ม framework/build tool เว้นแต่ผู้ใช้ขอ
   ไลบรารีภายนอกโหลดจาก CDN: Leaflet 1.9.4 (unpkg), html2canvas 1.4.1, jsPDF 2.5.1 (cdnjs), ฟอนต์ Sarabun + Share Tech Mono (Google Fonts)
2. **สไตล์โค้ดเดิม** — vanilla JS, ตัวแปร global, สร้างแถวด้วย template string + `innerHTML +=`, handler แบบ inline `onclick="fn(...)"`,
   คอมเมนต์หัวข้อแบบ `// ── ชื่อหัวข้อ ──` (ไทยปนอังกฤษ), inline style บนปุ่ม. เขียนให้กลมกลืนแบบเดียวกัน
3. **ข้อความ UI เป็นภาษาไทย** — ใช้ศัพท์ทหารอากาศเดิม (หน่วยบิน, จนท., น.ควบคุมการปฏิบัติ ฯลฯ) วันที่แสดงเป็น พ.ศ. (`getFullYear()+543`) และเดือนย่อ `thMonths`, เวลาใช้ `Asia/Bangkok`
4. **ธีม** — สีใหม่ใช้ CSS variable (`--accent`, `--card-bg`, `--text` …). ถ้าเพิ่ม component ใหม่ที่มีสีตายตัว ต้องเพิ่ม override ให้ครบทั้ง `theme-light`, `theme-camo`, `theme-metal` (ดูบล็อก CSS ต้นไฟล์)
5. **การบันทึกข้อมูล — ทุกฟิลด์ใหม่ต้องเดินครบวงจร**:
   UI → `syncAllData()` (อ่านค่าจาก DOM เข้าตัวแปร) → object ใน `saveAll()` **และ** `autoSaveLocal()` (สองที่นี้สร้าง object เหมือนกัน ต้องแก้คู่กัน) → restore ใน `loadSaved()` → `exportJSON()` / `importJSON()` → ถ้าเกี่ยวกับบรรยาย ให้ใส่ใน `exportWord()` และ `exportPDF()` ด้วย
   - `exportWord()` และ `exportJSON()` มีโค้ด sync ของตัวเอง (ไม่ได้เรียก `syncAllData()`) ตรวจให้ครบ
   - `localStorage` เต็มได้ง่ายเพราะภาพ base64 ใน `imgStore` — ห่อ `setItem` ด้วย try/catch และแจ้ง `showToast(..., 'red')`
6. **sync ระหว่างหน้า** — สถานภาพหน่วยบินมีสำเนาใน 3 ที่: select `ac-sel-{id}` (หน้า 1), `m-status-{id}` (หน้า 2), `msel-{id}` + marker/circle (แผนที่).
   เปลี่ยนสถานภาพจากหน้าไหนให้ผ่าน `acChangeStatus()` / `updateStatus()` และเรียก `updateAcSummary()` / `updateMapSummary()`
   แผนที่สร้างแบบ lazy (`initMap()` เมื่อเปิดแท็บครั้งแรก, เช็ค `mapInit`) — โค้ดที่แตะ `map`/`markers`/`circles` ต้องเช็ค `mapInit` ก่อน และเรียก `map.invalidateSize()` หลังแสดงหน้า
7. **ลำดับ nav tab มีโค้ดพึ่งพา** — `captureAllPages()` ใช้ `navIdx` และ `applyAndGoMap()` เลือกปุ่มด้วย selector. ถ้าเพิ่ม/ย้ายแท็บ ต้องอัปเดตจุดเหล่านี้ และเพิ่มหน้าใหม่ใน `captureAllPages()` ด้วย
8. **หน่วยบินใหม่** — เพิ่มใน `units` (id, name, loc, lat, lng, type, status, mission, reason, comm, `radius` ถ้าไม่ใช่ 150 NM), `locMap`, และ `locations` ถ้าเป็นที่ตั้งใหม่. การ์ดสรุป "หน่วยบินทั้งหมด" ในหน้า 1 เป็นเลข 9 แบบ hard-code — แก้ด้วย
9. **ข้อมูลบุคคล** — `staffDB` มีชื่อและเบอร์โทรจริงของกำลังพล อย่าคัดลอกไปไว้ที่อื่น (README, คอมเมนต์, commit message, artifact) และอย่าแก้รายชื่อเว้นแต่ผู้ใช้สั่ง. เบอร์โทรผ่าน `fixTel()` เสมอ (เติม 0 ถ้า 9 หลัก)
10. **ความปลอดภัย** — ค่าที่ผู้ใช้พิมพ์ถูกใส่ลง `innerHTML`/`value="..."` ตรงๆ; เมื่อเขียนโค้ดใหม่ที่ render ข้อความผู้ใช้ ให้ escape `& < > "` ก่อน.
    `exportPDF()` เรียก `https://api.anthropic.com/v1/messages` จากเบราว์เซอร์โดยไม่มี API key (OCR ภาพ) — ใช้งานจริงไม่ได้หากไม่มี proxy; อย่าใส่ API key ลงในไฟล์ ถ้าผู้ใช้ต้องการ OCR ให้เสนอ backend proxy
11. `SERVER_API` (`sarmanagement.rtafsar.com/rtaf_rcc_api.php`) และ `saveToServer()/loadFromServer()` ยังมีอยู่แต่ **ไม่ถูกเรียก** — ตอนนี้ใช้ LocalStorage อย่างเดียว อย่าเปิดใช้ server sync เองโดยไม่ได้รับคำสั่ง
12. **PWA** — อ้างถึง `manifest.json`, `sw.js`, `icon-192.png` ซึ่ง *ไม่มีใน repo* (น่าจะอยู่บนเซิร์ฟเวอร์ที่ deploy). ถ้าผู้ใช้ถามเรื่องติดตั้งแอป/offline ให้แจ้งเรื่องนี้

## ขั้นตอนทำงาน

1. อ่านส่วนที่เกี่ยวข้องใน `index.html` ก่อนแก้ (ใช้ `grep -n "function ชื่อ"` หรือหัวข้อ `// ──` เพื่อหาตำแหน่ง)
2. แก้แบบน้อยที่สุดตามที่ขอ ไม่ refactor ส่วนอื่น
3. ตรวจด้วย Playwright/Chromium (มีในเครื่อง cloud): เปิด `index.html` แบบ `file://` หรือ `python3 -m http.server`,
   คลิกทุกแท็บ, ดู console error, ทดสอบ บันทึก → reload → ข้อมูลยังอยู่, และสลับธีมดูว่า component ใหม่ไม่เพี้ยน.
   (tile แผนที่/CDN อาจโหลดไม่ได้ถ้า network ถูกจำกัด — ให้แยกแยะ error จาก network กับ bug จริง)
4. Commit ข้อความภาษาอังกฤษสั้นๆ บอกสิ่งที่เปลี่ยน (สไตล์ repo: "Remove …", "Center …", "Add …") แล้ว push ไป branch ที่กำหนด
5. สรุปให้ผู้ใช้เป็นภาษาไทย บอกว่าเปลี่ยนอะไร ทดสอบอะไรแล้ว และอะไรที่ทดสอบไม่ได้
