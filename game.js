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

// Enemy templates per stage (index 0..2)
function createEnemy(stage) {
  const table = [
    { name: 'บอทกากเน็ต', sprite: '🤖', spriteImg: 'assets/slime.png', weapon: 'body', attackStyle: 'tackle',
      skill: { name: 'สาดสลาย', style: 'splash', desc: 'กระโดดจี๊ดสาดสไลม์ใส่' }, hp: 70,  mp: 0, atk: 16, def: 4 },
    { name: 'ไวรัสจอมจุ้น', sprite: '🦠', spriteImg: 'assets/virus.png', weapon: 'spike', attackStyle: 'stab',
      skill: { name: 'แทงหนาม', style: 'spike', desc: 'ยิงหนามไวรัสแทงทะลุ' }, hp: 95,  mp: 0, atk: 21, def: 6 },
    { name: 'เจ้าพ่อเน็ตกาก', sprite: '👹', spriteImg: 'assets/dragon.png', weapon: 'fire', attackStyle: 'bite',
      skill: { name: 'พ่นไฟกาก', style: 'breath', desc: 'อ้าปากพ่นไฟเผาไล่' }, hp: 160, mp: 0, atk: 27, def: 10 },
  ];
  return makeEntity(table[stage]);
}

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
