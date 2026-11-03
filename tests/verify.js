/* 題庫與美術完整性檢查：node tests/verify.js */
global.window = {};
const fs = require('fs'), path = require('path');
for (const f of ['audio.js', 'sprites.js', 'art.js', 'art2.js', 'data-a.js', 'data-b.js', 'data-c.js', 'data-d.js', 'data-e.js']) new Function('window', fs.readFileSync(path.join(__dirname, '..', 'js', f), 'utf8'))(window);
const { LEVELS, Art } = window.GAME;
const MOODS = ['angry', 'sulk', 'sad', 'shock', 'cold', 'happy', 'blush', 'normal', 'nervous'];
let err = 0; const bad = (m) => { console.log('✗', m); err++; };
if (LEVELS.length !== 25) bad('關卡數應為 25，實際 ' + LEVELS.length);
let total = 0;
LEVELS.forEach((lv, i) => {
  const n = lv.fixed.length + lv.pick; total += lv.fixed.length + lv.pool.length;
  if (n < 5 || n > 10) bad(`第 ${i + 1} 關題數 ${n} 不在 5～10`);
  if (lv.pool.length < lv.pick) bad(`第 ${i + 1} 關題池不足`);
  if (!Art.scenes.includes(lv.scene)) bad(`第 ${i + 1} 關場景 ${lv.scene} 不存在`);
  [...lv.fixed, ...lv.pool].forEach((q, j) => {
    const w = `第 ${i + 1} 關第 ${j + 1} 題`;
    if (!MOODS.includes(q.mood)) bad(w + ' 情緒無效 ' + q.mood);
    if (!q.q || !q.fail) bad(w + ' 缺台詞');
    if (!q.good.length || q.bad.length < 2) bad(w + ' 選項不足');
    if (q.good.some((g) => q.bad.includes(g))) bad(w + ' 正解與錯誤選項重複');
    if (new Set(q.bad).size !== q.bad.length) bad(w + ' 錯誤選項重複');
  });
  console.log(`第 ${String(i + 1).padStart(2)} 關 ${lv.place.padEnd(5, '　')} 每次 ${n} 題（固定 ${lv.fixed.length}＋隨機 ${lv.pick}/${lv.pool.length}）`);
});
console.log(`題庫總題數 ${total}`);
for (const m of MOODS) { try { Art.girl(m, 'cafe'); Art.boy(m); } catch (e) { bad('繪圖失敗 ' + m + ' ' + e.message); } }
for (const s of Art.scenes) { try { if (Art.scene(s).length < 200) bad('場景過短 ' + s); } catch (e) { bad('場景失敗 ' + s + ' ' + e.message); } }
for (const s of Art.scenes) { try { Art.extras(s); } catch (e) { bad('場景細節失敗 ' + s + ' ' + e.message); } }
for (const m of MOODS) { try { Art.fx(m, 'girl'); Art.fx(m, 'boy'); } catch (e) { bad('特效失敗 ' + m); } }
console.log(err ? `失敗 ${err} 項` : '全部通過');
process.exit(err ? 1 : 0);

// 荒謬題庫檢查
{
  const A = window.GAME.ABSURD; let n = 0;
  for (const k of Object.keys(A)) for (const q of A[k]) { n++; if (!q.q || !q.good.length || q.bad.length < 3 || !q.fail || !q.ok) { console.log('荒謬題格式錯誤', k, q.q); process.exit(1); } }
  console.log('荒謬題', n, '題（第 4～25 關）');
}
