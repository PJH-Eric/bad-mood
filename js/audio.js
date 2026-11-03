/* 音效與 BGM：全部用 WebAudio 即時合成，不需任何音檔 */
(function (G) {
  'use strict';
  let ctx = null, master = null, bgmTimer = null, step = 0;
  const st = { sfx: true, bgm: true };
  function ensure() {
    if (!ctx) {
      try { const AC = window.AudioContext || window.webkitAudioContext; ctx = new AC(); master = ctx.createGain(); master.gain.value = .5; master.connect(ctx.destination); } catch (e) { ctx = null; }
    }
    if (ctx && ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function tone(f, t0, dur, type, vol, dest) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(f, t0);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + .015); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(dest || master); o.start(t0); o.stop(t0 + dur + .05);
  }
  const N = (n) => 440 * Math.pow(2, (n - 69) / 12);
  const sfx = {
    click() { tone(N(84), ctx.currentTime, .08, 'triangle', .18); },
    good() { const t = ctx.currentTime; [76, 80, 83, 88].forEach((n, i) => tone(N(n), t + i * .07, .18, 'triangle', .22)); },
    bad() { const t = ctx.currentTime; tone(N(55), t, .35, 'sawtooth', .22); tone(N(52), t + .15, .5, 'sawtooth', .22); },
    clear() { const t = ctx.currentTime; [72, 76, 79, 84, 79, 84, 88].forEach((n, i) => tone(N(n), t + i * .11, .25, 'triangle', .22)); },
    tick() { tone(N(96), ctx.currentTime, .03, 'square', .03); },
    warn() { tone(N(70), ctx.currentTime, .08, 'square', .08); },
  };
  // 輕快 BGM：C 大調流行小段（和弦＋旋律），16 分音符排程
  const CH = [[48, 55, 60, 64], [45, 52, 57, 60], [41, 48, 53, 57], [43, 50, 55, 59]];
  const MEL = [76, 0, 79, 0, 81, 79, 0, 76, 74, 0, 76, 0, 72, 0, 0, 0, 72, 0, 74, 0, 76, 74, 0, 72, 69, 0, 72, 0, 71, 0, 0, 0,
    77, 0, 81, 0, 84, 81, 0, 77, 76, 0, 79, 0, 76, 0, 0, 0, 74, 0, 79, 0, 83, 79, 0, 74, 72, 0, 0, 0, 0, 0, 0, 0];
  function bgmStep() {
    if (!ctx || !st.bgm) return;
    const t = ctx.currentTime + .05, i = step % 64, bar = Math.floor(i / 16) % 4, b = i % 16;
    const ch = CH[bar];
    if (b % 4 === 0) tone(N(ch[0]), t, .38, 'triangle', .1);
    if (b % 2 === 0) tone(N(ch[1 + (b / 2 % 3 | 0)] + 12), t, .16, 'sine', .035);
    if (MEL[i]) tone(N(MEL[i]), t, .22, 'triangle', .05);
    step++;
  }
  G.Audio = {
    st,
    unlock: ensure,
    play(n) { if (st.sfx && ensure() && sfx[n]) sfx[n](); },
    startBgm() { if (!ensure() || bgmTimer) return; bgmTimer = setInterval(bgmStep, 150); },
    stopBgm() { clearInterval(bgmTimer); bgmTimer = null; },
    setSfx(v) { st.sfx = v; },
    setBgm(v) { st.bgm = v; v ? this.startBgm() : this.stopBgm(); },
  };
})(window.GAME = window.GAME || {});
