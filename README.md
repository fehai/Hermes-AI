# Hermes-AI

โปรเจกต์สาธิตของลูกพี่ + มีมี่ (ลูกน้องผู้หญิง) 💜

## หน้าแรก (Hello World Pro Max)
- หน้าเว็บ glassmorphism พร้อม animated gradient, theme toggle, มาสคอตมีมี่ (พื้นหลังใส)
- ไฟล์: `index.html`, `mimi-mascot.png`, `favicon-256.png`

## เกม: ภารกิจล้มเจ้าพ่อเน็ตกาก 🎮 (กราฟิก 2D)
เกม Turn-based RPG บนเว็บ — อัศวินมีมี่ ผจญภัยผ่าน 3 ด่านเพื่อโค่นบอส "เจ้าพ่อเน็ตกาก"
- ด่าน 1: บอทกากเน็ต (slime) 🟢
- ด่าน 2: ไวรัสจอมจุ้น (virus) 🟣
- ด่าน 3: เจ้าพ่อเน็ตกาก (dragon boss) 🐉

**กราฟิก 2D sprite (พื้นหลังใส ทั้งหมด):**
- `assets/knight.png` — อัศวินมีมี่ (ฮีโร่)
- `assets/slime.png` — บอทกากเน็ต
- `assets/virus.png` — ไวรัสจอมจุ้น
- `assets/dragon.png` — เจ้าพ่อเน็ตกาก (บอส)
- `assets/battlefield.png` — ฉากสนามรบ top-down
- `assets/icons.png` — ไอคอน UI (ยา, เหรียญ, ดาบ)
- `assets/panel.png` — กรอบ UI ไม้ทอง

ระบบ: HP/MP แถบหลอด, 3 แอคชัน (โจมตี / เวทมีมี่ / ฮีล), AI ศัตรู, ชนะ-แพ้
- ไฟล์: `game.html` (UI 2D), `game.js` (logic แยกต่างหาก เล่นได้ทั้ง Node และเบราว์เซอร์)
- Debug: `node debug-test.js` รันจำลอง 600 รอบตรวจความถูกต้องก่อนลงหน้าเว็บ

## ดูผลงาน
- เว็บไซต์: https://fehai.github.io/Hermes-AI/
- เกม: https://fehai.github.io/Hermes-AI/game.html

## วิธีรันเกมในเครื่อง
เปิด `index.html` หรือ `game.html` ในเบราว์เซอร์ได้เลย (ไม่ต้องติดตั้งอะไร)
