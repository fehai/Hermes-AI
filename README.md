# Hermes-AI

โปรเจกต์สาธิตของลูกพี่ + มีมี่ (ลูกน้องผู้หญิง) 💜

## หน้าแรก (Hello World Pro Max)
- หน้าเว็บ glassmorphism พร้อม animated gradient, theme toggle, มาสคอตมีมี่ (พื้นหลังใส)
- ไฟล์: `index.html`, `mimi-mascot.png`, `favicon-256.png`

## เกม: ภารกิจล้มเจ้าพ่อเน็ตกาก 🎮 (กราฟิก 2D)

### โหมด 1 — ผจญภัยบนแผนที่ (`map.html`)
- แผนที่ grid 7x7 เดินได้ด้วย WASD / ลูกศร / ปุ่มบนจอ
- มอนสเตอร์ 3 ตัววางในแผนที่ เดินชนตัวไหน → เข้าฉากต่อสู้แบบ turn-based
- ชนะครบ 3 ตัว → ชนะเกม
- ไฟล์: `map.html`

### โหมด 2 — ต่อสู้ด่านต่อด่าน (`game.html`)
- เข้าฉากสู้ทันที 3 ด่าน: slime → virus → dragon boss
- ไฟล์: `game.html`

**ระบบร่วม:** HP/MP, 3 แอคชัน (โจมตี / เวทมีมี่ / ฮีล), AI ศัตรู, ชนะ-แพ้
- Logic กลาง: `game.js` (เล่นได้ทั้ง Node และเบราว์เซอร์)
- Debug: `node debug-test.js` รันจำลอง 600 รอบก่อนลงหน้าเว็บ

### สปริต 2D (พื้นหลังใส ทั้งหมด) ใน `assets/`
- `knight.png` อัศวินมีมี่ (ฮีโร่) · `slime.png` บอทกากเน็ต · `virus.png` ไวรัสจอมจุ้น
- `dragon.png` เจ้าพ่อเน็ตกาก (บอส) · `battlefield.png` ฉาก · `icons.png` ไอคอน UI · `panel.png` กรอบ UI

## ดูผลงาน (GitHub Pages)
- เว็บไซต์: https://fehai.github.io/Hermes-AI/
- ผจญภัยแผนที่: https://fehai.github.io/Hermes-AI/map.html
- ต่อสู้ด่าน: https://fehai.github.io/Hermes-AI/game.html

## บันทึกเทคนิค
- `.gitattributes` กำหนด `*.png binary` เพื่อไม่ให้ git แปลง CRLF ทำรูปเสียหายบน Pages
- เปิดไฟล์ HTML ในเบราว์เซอร์ได้เลย ไม่ต้องติดตั้งอะไร
