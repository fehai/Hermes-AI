/* =====================================================================
   Hermes-AI: ภารกิจล้มเจ้าพ่อเน็ตกาก
   Turn-based RPG battle logic  (pure, no DOM — works in Node & browser)
   ===================================================================== */

// ---- RNG helper (variance) ----
function variance(base, pct) {
  const spread = base * pct;
  return Math.round(base + (Math.random() * 2 - 1) * spread);
}

// ---- Entity factory ----
function makeEntity(cfg) {
  // spread all cfg fields so character-specific props (weapon, attackStyle,
  // skill, spriteImg, etc.) survive; then ensure the required numeric fields.
  return Object.assign({}, cfg, {
    name: cfg.name,
    sprite: cfg.sprite || '❓',
    spriteImg: cfg.spriteImg || '',
    hp: cfg.hp,
    maxHp: cfg.hp,
    mp: cfg.mp != null ? cfg.mp : 0,
    maxMp: cfg.mp != null ? cfg.mp : 0,
    atk: cfg.atk,
    def: cfg.def,
    isHero: !!cfg.isHero,
  });
}

// Hero template
function createHero() {
  return makeEntity({
    name: 'อัศวินมีมี่',
    sprite: '💜',
    spriteImg: 'assets/knight.png',
    weapon: 'sword',                      // for animation: lunges & slashes
    attackStyle: 'slash',                 // distinct per character
    hp: 120, maxHp: 120,
    mp: 40, maxMp: 40,
    atk: 22, def: 8,
    isHero: true,
  });
}

// Enemy templates — 8 monsters across 3 dungeon stages
// stage field groups them; each has idle/wind/hit frame keys + a unique skill
function createEnemy(id) {
  const table = [
    // Stage 1 — Slime family
    { name: 'บอทกากเน็ต', sprite: '🤖', spriteImg: 'assets/slime.png', weapon: 'body', attackStyle: 'tackle', stage: 0,
      frames: { idle:'assets/slime_idle.png', wind:'assets/slime_wind.png', hit:'assets/slime_hit.png' },
      skill: { name: 'สาดสลาย', style: 'splash', fx:'splash', desc: 'กระโดดจี๊ดสาดสไลม์ใส่' }, hp: 70,  mp: 0, atk: 16, def: 4 },
    { name: 'สไลม์น้ำแข็ง', sprite: '🔵', spriteImg: 'assets/iceslime_idle.png', weapon: 'ice', attackStyle: 'ram', stage: 0,
      frames: { idle:'assets/iceslime_idle.png', wind:'assets/iceslime_wind.png', hit:'assets/iceslime_hit.png' },
      skill: { name: 'ปะทะเย็นเฉียบ', style: 'splash', fx:'ice', desc: 'พุ่งชนพร้อมเหน็บความเย็น' }, hp: 85,  mp: 0, atk: 18, def: 5 },
    // Stage 2 — Virus family
    { name: 'ไวรัสจอมจุ้น', sprite: '🦠', spriteImg: 'assets/virus.png', weapon: 'spike', attackStyle: 'stab', stage: 1,
      frames: { idle:'assets/virus_idle.png', wind:'assets/virus_wind.png', hit:'assets/virus_hit.png' },
      skill: { name: 'แทงหนาม', style: 'spike', fx:'spike', desc: 'ยิงหนามไวรัสแทงทะลุ' }, hp: 95,  mp: 0, atk: 21, def: 6 },
    { name: 'สปอร์เหลือง', sprite: '🟡', spriteImg: 'assets/spore_idle.png', weapon: 'spore', attackStyle: 'shoot', stage: 1,
      frames: { idle:'assets/spore_idle.png', wind:'assets/spore_wind.png', hit:'assets/spore_hit.png' },
      skill: { name: 'ระเบิดสปอร์', style: 'spike', fx:'spore', desc: 'ยิงสปอร์ระเบิดใส่' }, hp: 110, mp: 0, atk: 23, def: 7 },
    // Stage 3 — Dragon lord + minions
    { name: 'อสูรกาก', sprite: '👹', spriteImg: 'assets/oni_idle.png', weapon: 'claw', attackStyle: 'slash', stage: 2,
      frames: { idle:'assets/oni_idle.png', wind:'assets/oni_wind.png', hit:'assets/oni_hit.png' },
      skill: { name: 'เหวี่ยงกรงเล็บ', style: 'slash', fx:'slash', desc: 'ฟาดกรงเล็บแดงฉาน' }, hp: 130, mp: 0, atk: 25, def: 9 },
    { name: 'ผีดิบเน็ต', sprite: '🧟', spriteImg: 'assets/zombie_idle.png', weapon: 'claw', attackStyle: 'claw', stage: 2,
      frames: { idle:'assets/zombie_idle.png', wind:'assets/zombie_wind.png', hit:'assets/zombie_hit.png' },
      skill: { name: 'คำสาปลาก', style: 'curse', fx:'curse', desc: 'ตะครุบแล้วสาปให้สะดุด' }, hp: 120, mp: 0, atk: 24, def: 8 },
    { name: 'ยักษ์เน็ต', sprite: '👾', spriteImg: 'assets/troll_idle.png', weapon: 'stomp', attackStyle: 'stomp', stage: 2,
      frames: { idle:'assets/troll_idle.png', wind:'assets/troll_wind.png', hit:'assets/troll_hit.png' },
      skill: { name: 'เหยียบย่ำ', style: 'stomp', fx:'stomp', desc: 'เหยียบย่ำด้วยฝ่าเท้ายักษ์' }, hp: 140, mp: 0, atk: 26, def: 10 },
    { name: 'เจ้าพ่อเน็ตกาก', sprite: '🐉', spriteImg: 'assets/dragon.png', weapon: 'fire', attackStyle: 'bite', stage: 2,
      frames: { idle:'assets/dragon_idle.png', wind:'assets/dragon_wind.png', hit:'assets/dragon_hit.png' },
      skill: { name: 'พ่นไฟกาก', style: 'breath', fx:'breath', desc: 'อ้าปากพ่นไฟเผาไล่' }, hp: 180, mp: 0, atk: 30, def: 12 },
  ];
  return makeEntity(table[id]);
}
// keep stage->id mapping for map.js (monster order)
const ENEMY_BY_STAGE = { 0:[0,1], 1:[2,3], 2:[4,5,6,7] };

// ---- Combat math ----
// Basic attack: physical, reduced by def
function basicAttack(attacker, defender) {
  const raw = variance(attacker.atk, 0.15);
  const dmg = Math.max(1, raw - Math.floor(defender.def / 2));
  defender.hp = Math.max(0, defender.hp - dmg);
  return dmg;
}

// Special skill (costs MP): stronger magic hit, ignores some def
function skillAttack(attacker, defender) {
  const cost = 12;
  if (attacker.mp < cost) return { dmg: 0, fail: true };
  attacker.mp -= cost;
  const raw = variance(Math.round(attacker.atk * 1.8), 0.15);
  const dmg = Math.max(1, raw - Math.floor(defender.def / 3));
  defender.hp = Math.max(0, defender.hp - dmg);
  return { dmg, fail: false };
}

// Heal (costs MP)
function healAction(attacker) {
  const cost = 14;
  if (attacker.mp < cost) return { amount: 0, fail: true };
  attacker.mp -= cost;
  const amount = variance(38, 0.1);
  const before = attacker.hp;
  attacker.hp = Math.min(attacker.maxHp, attacker.hp + amount);
  return { amount: attacker.hp - before, fail: false };
}

// Enemy AI: picks an action based on simple rules
function enemyTurn(enemy, hero) {
  // If low HP and hero low MP-ish, just attack; otherwise random
  const roll = Math.random();
  if (roll < 0.75) {
    const dmg = basicAttack(enemy, hero);
    return { type: 'attack', dmg };
  } else {
    // heavy slam (enemy version of skill, no MP cost)
    const raw = variance(Math.round(enemy.atk * 1.6), 0.15);
    const dmg = Math.max(1, raw - Math.floor(hero.def / 3));
    hero.hp = Math.max(0, hero.hp - dmg);
    return { type: 'heavy', dmg };
  }
}

// Check battle state
function battleState(hero, enemy) {
  if (hero.hp <= 0) return 'lose';
  if (enemy.hp <= 0) return 'win';
  return 'ongoing';
}

// Simulate a full battle headlessly (used for debug). Returns result object.
function simulateBattle(stage, strategy) {
  const hero = createHero();
  const enemy = createEnemy(stage);
  let turn = 0;
  const MAX_TURNS = 300;
  const log = [];
  while (turn < MAX_TURNS) {
    turn++;
    // hero acts
    const act = strategy(hero, enemy);
    if (act === 'attack') {
      const d = basicAttack(hero, enemy);
      log.push(`มีมี่ โจมตี -${d}`);
    } else if (act === 'skill') {
      const r = skillAttack(hero, enemy);
      if (r.fail) { const d = basicAttack(hero, enemy); log.push(`MP ไม่พอ โจมตี -${d}`); }
      else log.push(`มีมี่ ใช้เวทมีมี่ -${r.dmg}`);
    } else if (act === 'heal') {
      const r = healAction(hero);
      if (r.fail) { const d = basicAttack(hero, enemy); log.push(`MP ไม่พอ โจมตี -${d}`); }
      else log.push(`มีมี่ ฮีล +${r.amount}`);
    }
    if (battleState(hero, enemy) === 'win') return { result: 'win', turns: turn, heroHp: hero.hp, enemyHp: enemy.hp, log };
    // enemy acts
    const e = enemyTurn(enemy, hero);
    log.push(`ศัตรู ${e.type} -${e.dmg}`);
    const st = battleState(hero, enemy);
    if (st === 'lose') return { result: 'lose', turns: turn, heroHp: hero.hp, enemyHp: enemy.hp, log };
    if (st === 'win') return { result: 'win', turns: turn, heroHp: hero.hp, enemyHp: enemy.hp, log };
  }
  return { result: 'draw', turns: turn, heroHp: hero.hp, enemyHp: enemy.hp, log };
}

// Export for Node (unit test / debug)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    variance, makeEntity, createHero, createEnemy,
    basicAttack, skillAttack, healAction, enemyTurn, battleState,
    simulateBattle,
  };
}
