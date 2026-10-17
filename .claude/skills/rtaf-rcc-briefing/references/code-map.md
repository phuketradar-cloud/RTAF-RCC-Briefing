# index.html — แผนที่โค้ด

ลำดับในไฟล์ (หาตำแหน่งด้วย `grep -n` ตามชื่อ เพราะเลขบรรทัดเปลี่ยนได้):

1. `<head>` — PWA meta, CDN (Leaflet, html2canvas, jsPDF)
2. `<style>` — `:root` vars → `body.theme-dark|light|camo|metal` overrides → component CSS → `@media(max-width:700px)` → `@media print`
3. `<body class="theme-dark">` — `#theme-btn`, `.app-header` (logo, `.nav-tabs`, ปุ่มบันทึก + `#save-dropdown`, `#header-date`, `#server-status`, `#pwa-install-btn`), แล้วตาม `.page` ทั้ง 6
4. `<script>` หลัก — หัวข้อ `// ── ... ──` ตามลำดับ:
   THEME CYCLE → MULTI-IMAGE SYSTEM → SUB TAB → BUILD MISSION TABLE → PAGE SWITCHING → ZONE EDITOR →
   REALTIME CLOCK → STAFF DATABASE (+ dutySlots/standbySlots, fixTel, CSV) → BUILD AIRCRAFT TABLE →
   MAP DATA (locMap, units, colors) → initMap / markers / popup / LOCATIONS / unit list / toggleCov →
   SERVER SYNC (ไม่ได้ใช้) → LOCAL STORAGE (syncAllData, saveAll, loadSaved, autoSaveLocal) →
   SAVE DROPDOWN → EXPORT JSON / IMPORT JSON → TOAST → exportWord → captureAllPages → exportPDF
5. `<script>` ท้าย — register `./sw.js`, `beforeinstallprompt`, `installPWA()`

## ตัวแปร global หลัก

| ตัวแปร | รูปแบบ | หมายเหตุ |
|--------|--------|----------|
| `units` | `[{id,name,loc,lat,lng,type,status,mission,reason,comm,radius?,userEdited?}]` | 9 หน่วย: 2031–2035, 2037, 2038 (H225M), 2021 (BELL-412 EP, radius 100), 9203. ค่าว่างใช้ `'—'` |
| `staffDB` | `[{name,tel}]` | รายชื่อจริง — ห้ามนำออกนอกไฟล์ |
| `dutySlots` | `[{role,loc,selected}]` | 5 ตำแหน่ง; `selected` = index ใน `staffDB`, `-1` = ไม่มี |
| `standbySlots` | `[{selected}]` | 5 ช่อง |
| `zones` / `zoneCounter` | `[{id:'z1',name,items:[string]}]` | แผนฝึกบิน; `exportPDF` หาเขตด้วย `name.includes('OSCAR'|'FOCAL'|'BIGSHELL')` |
| `imgStore` / `viewMode` | `{'1'..'5': [{src,zoom}]}` / `'single'|'double'` | ภาพแนบหน้า อื่นๆ (base64), `MAX_IMGS = 10` |
| `themes` / `themeIdx` | | `localStorage['rtaf_theme']` |
| `map, markers, circles, mapInit, covState` | | Leaflet state; `circles[id] = {layer,status}` |
| `colors`, `statusTh`, `scClass` | | map สถานภาพ → สี / คำไทย / คลาส |
| `locations`, `locMap` | | ที่ตั้งสำหรับ dropdown ย้ายหน่วย / id → จังหวัด |
| `STORAGE_KEY = 'rtaf_rcc_data'` | | key หลักใน localStorage |

## Element id ที่ใช้บ่อย

- เวร: `duty-tbody`, `duty-sel-{i}`, `duty-tel-{i}`, `standby-tbody`, `standby-sel-{i}`, `standby-tel-{i}`, `csv-upload`, `csv-status`
- นาฬิกา: `clock-date`, `clock-time`, `clock-day`, `duty-date-label`, `header-date`, `mission-date`
- อากาศยาน: `ac-tbody`, `ac-row-{id}`, `ac-sel-{id}`, `comm-sel-{id}`, `ac-inp-{id}`, `ac-sum-f|p|n`
- ภารกิจ: `mission-tbody`, `m-status-{id}`, `m-inp-{id}`
- ฝึกบิน: `zone-list`, `zb-{zoneId}` (body), input คลาส `.zone-item-input`
- แผนที่: `map`, `ms-unit-list`, `mitem-{id}`, `mdot-{id}`, `msel-{id}`, `msum-f|p|n`, `btn-FMC|PMC|NMC|all`
- อื่นๆ: `sub1..sub5`, `img-grid-{n}`, `img-empty-{n}`, `img-count-{n}`, `view-btn-{n}`, `img-viewer-{n}`

## ฟังก์ชันตามหน้าที่

- นำทาง: `showPage(id, btn)` (sync สถานภาพ/ภารกิจก่อนแสดง mission, lazy `initMap`), `showSub(id, btn)`
- เวร: `buildDutyTable`, `dutyChanged`, `buildStandbyTable`, `standbyChanged`, `loadCSV` (รองรับ 2–5+ คอลัมน์: ยศ,ชื่อ,นามสกุล,[ตำแหน่ง],เบอร์ — อ่านเป็นข้อความ UTF-8; ไฟล์ .xlsx จริงจะ parse ไม่ได้), `fixTel`
- อากาศยาน: `buildAircraftTable`, `acChangeStatus`, `commChanged`, `updateAcSummary`, `clearReason`, `applyAndGoMap`
- ภารกิจ: `buildMissionTable`, `clearMission`
- ฝึกบิน: `renderZones`, `rerenderSummary`, `addZone`, `deleteZone`, `updateZoneName`, `addZoneItem`, `updateZoneItem`, `clearZoneItem`, `removeZoneItem`
- แผนที่: `initMap`, `makeMarker`, `makePopup`, `buildUnitList`, `moveUnit`, `selectUnit`, `updateStatus`, `updateMapSummary`, `toggleCov`, `toggleAll`
- ภาพ: `addImages`, `renderImgGrid`, `zoomImgNew`, `resetZoomNew`, `removeImg`, `toggleView` (+ ฟังก์ชันรุ่นเก่า `loadImage/zoomImg/resetZoom/clearImage`)
- บันทึก: `syncAllData`, `saveAll` (บันทึก local + เรียก `exportWord(true)`), `autoSaveLocal` (ทุก 30 วิ + `beforeunload` + หลังแก้เวร/ย้ายหน่วย), `loadSaved` (ตอนเปิดแอป)
- ส่งออก: `exportJSON` (ไม่รวมภาพ), `importJSON` (ไม่ restore `comm` และภาพ), `exportWord` (HTML → `.doc`), `exportPDF` (เปิดหน้าต่างใหม่เป็นบทบรรยาย + OCR ภาพผ่าน Claude API), `captureAllPages` (html2canvas ทุกหน้า + sub-tab → jsPDF)
- UI: `showToast(msg, 'green'|'cyan'|'red', filename?)`, `toggleSaveMenu`, `cycleTheme/applyTheme`, `setServerStatus`
- ชื่อไฟล์ส่งออก: `RTAF_RCC_{DD}{MM}{พ.ศ.}_{HH}{mm}.json|.doc`

## ข้อสังเกต / ปัญหาที่พบ (ณ ตอนเขียน skill)

- `applyAndGoMap()` ใช้ `document.querySelector('.nav-tab:last-child')` ซึ่งตอนนี้คือแท็บ "อื่นๆ" ไม่ใช่ "แผนที่ Coverage" → แผนที่แสดงถูกแต่ไฮไลต์แท็บผิด
- `importJSON()` ไม่ restore `comm`/`userEdited` และ `exportJSON()` ไม่รวม `imgStore` (ต่างจาก `saveAll`)
- `exportWord()` ไม่ sync `standbySlots`/`comm` ก่อนส่งออก
- `saveAll()` กับ `autoSaveLocal()` สร้าง payload ซ้ำกัน — แก้ field ต้องแก้ทั้งคู่
- ไม่มี escape HTML สำหรับข้อความที่ผู้ใช้พิมพ์ (สาเหตุ, ภารกิจ, ชื่อเขต)
- `exportPDF()` เรียก Anthropic API โดยตรงจากเบราว์เซอร์ด้วย model เก่าและไม่มี key → OCR ล้มเหลวเงียบๆ แล้วขึ้น "ไม่มีเอกสารแนบ"
- ไฟล์ PWA (`manifest.json`, `sw.js`, `icon-192.png`) ไม่อยู่ใน repo

แก้ข้อเหล่านี้เฉพาะเมื่อผู้ใช้ขอ (หรือเกี่ยวข้องกับงานที่ทำอยู่โดยตรง)
