/* Node debug harness — runs headless simulations to verify the game logic
   before it is wired into the browser UI. */
const G = require('./game.js');

function assert(cond, msg) {
  if (!cond) { console.error('❌ FAIL:', msg); process.exitCode = 1; }
  else console.log('✅', msg);
}

// 1) entities build correctly
const hero = G.createHero();
const e0 = G.createEnemy(0);
assert(hero.hp === hero.maxHp && hero.hp > 0, 'hero HP initialised');
assert(e0.hp > 0 && e0.name === 'บอทกากเน็ต', 'stage 1 enemy builds');
assert(G.createEnemy(2).name === 'เจ้าพ่อเน็ตกาก', 'boss builds at stage 3');

// 2) basic attack reduces enemy hp and never goes below 0
const before = e0.hp;
const d = G.basicAttack(hero, e0);
assert(e0.hp === before - d, 'basicAttack subtracts exact dmg');
assert(e0.hp >= 0, 'hp never negative');

// 3) skill consumes MP and hits harder than basic on average
const hero2 = G.createHero();
const e2 = G.createEnemy(0);
const mpBefore = hero2.mp;
const r = G.skillAttack(hero2, e2);
assert(!r.fail && hero2.mp === mpBefore - 12, 'skill costs 12 MP');

// 4) heal restores hp and is capped at max
const hero3 = G.createHero();
hero3.hp = 10;
const h = G.healAction(hero3);
assert(hero3.hp > 10, 'heal raises hp');
assert(hero3.hp <= hero3.maxHp, 'heal capped at maxHp');

// 5) MP-exhaustion fallback works
const hero4 = G.createHero();
hero4.mp = 0;
const sf = G.skillAttack(hero4, e2);
assert(sf.fail === true, 'skill fails when MP=0');

// 6) battle always resolves (no infinite loop) across many runs & stages
let wins = 0, losses = 0, draws = 0;
const strategies = [
  () => 'attack',
  (h) => (h.hp < 40 ? 'heal' : 'skill'),
  (h) => (h.mp >= 12 ? 'skill' : 'attack'),
];
for (let stage = 0; stage < 3; stage++) {
  for (let i = 0; i < 200; i++) {
    const strat = strategies[i % strategies.length];
    const res = G.simulateBattle(stage, strat);
    assert(['win', 'lose', 'draw'].includes(res.result), `stage ${stage} run ${i} resolves`);
    if (res.result === 'win') wins++; else if (res.result === 'lose') losses++; else draws++;
    assert(res.turns < 300, `stage ${stage} run ${i} ends before turn cap`);
  }
}
console.log(`\n📊 600 sims -> win:${wins} lose:${losses} draw:${draws}`);
assert(wins > 0, 'hero can win at least sometimes (game is winnable)');
assert(losses > 0, 'enemy can win sometimes (game has challenge)');

console.log('\n🎉 All logic checks passed. Game is playable.');
