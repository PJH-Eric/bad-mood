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
  // BGM：依場景切換調性、速度、音色與環境音
  const CH = [[48, 55, 60, 64], [45, 52, 57, 60], [41, 48, 53, 57], [43, 50, 55, 59]];
  const MEL = [76, 0, 79, 0, 81, 79, 0, 76, 74, 0, 76, 0, 72, 0, 0, 0, 72, 0, 74, 0, 76, 74, 0, 72, 69, 0, 72, 0, 71, 0, 0, 0,
    77, 0, 81, 0, 84, 81, 0, 77, 76, 0, 79, 0, 76, 0, 0, 0, 74, 0, 79, 0, 83, 79, 0, 74, 72, 0, 0, 0, 0, 0, 0, 0];
  const MEL2 = [72, 0, 0, 0, 76, 0, 0, 0, 79, 0, 0, 0, 76, 0, 0, 0, 74, 0, 0, 0, 77, 0, 0, 0, 81, 0, 0, 0, 77, 0, 0, 0,
    71, 0, 0, 0, 74, 0, 0, 0, 77, 0, 0, 0, 74, 0, 0, 0, 72, 0, 0, 0, 76, 0, 0, 0, 79, 0, 0, 0, 0, 0, 0, 0];
  // style：[轉調半音, 間隔 ms, 旋律音色, 旋律型(1輕快/2舒緩), 環境音]
  const STY = {
    home: [0, 170, 'triangle', 2, ''], conv: [2, 140, 'square', 1, 'hum'], breakfast: [5, 150, 'triangle', 1, 'crowd'], busstop: [-2, 180, 'sine', 2, 'rain'],
    cafe: [-5, 190, 'sine', 2, 'crowd'], cinema: [-7, 200, 'triangle', 2, 'hum'], mall: [4, 135, 'triangle', 1, 'crowd'], nightmarket: [7, 125, 'square', 1, 'crowd'],
    restaurant: [-3, 165, 'triangle', 2, 'crowd'], park: [3, 160, 'triangle', 1, 'birds'], amusement: [9, 120, 'square', 1, 'crowd'], beach: [5, 155, 'sine', 1, 'waves'],
    library: [-9, 210, 'sine', 2, ''], office: [-4, 175, 'triangle', 2, 'hum'], supermarket: [6, 140, 'square', 1, 'hum'], station: [-2, 165, 'triangle', 2, 'crowd'],
    party: [7, 120, 'square', 1, 'crowd'], onsen: [-6, 200, 'sine', 2, 'water'], concert: [2, 115, 'sawtooth', 1, 'crowd'], rooftop: [-7, 195, 'sine', 2, 'wind'],
    airport: [3, 150, 'triangle', 1, 'crowd'], gym: [5, 120, 'sawtooth', 1, 'hum'], wedding: [0, 190, 'sine', 2, ''], newyear: [7, 125, 'square', 1, 'crowd'], space: [-9, 220, 'sine', 2, 'hum'],
  };
  let sty = STY.home, ambNode = null, birdT = null;
  function stopAmb() { clearInterval(birdT); if (ambNode) { try { ambNode.src.stop(); } catch (e) { } try { ambNode.g.disconnect(); } catch (e) { } ambNode = null; } }
  function startAmb(kind) {
    stopAmb(); if (!ctx || !kind || !st.bgm) return;
    if (kind === 'birds') { birdT = setInterval(() => { if (!st.bgm || !ctx) return; const t = ctx.currentTime, f = 1800 + Math.random() * 1400; tone(f, t, .09, 'sine', .03); tone(f * 1.2, t + .11, .09, 'sine', .025); }, 1700); return; }
    const len = ctx.sampleRate * 2, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
    let lp = 0; for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; lp = kind === 'hum' ? lp * .98 + w * .02 : w; d[i] = lp; }
    const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
    const f = ctx.createBiquadFilter(), g = ctx.createGain();
    const P = { rain: ['highpass', 3500, .035], waves: ['lowpass', 500, .07], crowd: ['bandpass', 900, .022], hum: ['lowpass', 220, .5], water: ['bandpass', 2200, .018], wind: ['lowpass', 380, .05] }[kind];
    f.type = P[0]; f.frequency.value = P[1]; g.gain.value = P[2];
    if (kind === 'waves') { const o = ctx.createOscillator(), og = ctx.createGain(); o.frequency.value = .12; og.gain.value = .05; o.connect(og); og.connect(g.gain); o.start(); }
    src.connect(f); f.connect(g); g.connect(master); src.start(); ambNode = { src, g };
  }
  function bgmStep() {
    if (!ctx || !st.bgm) return;
    const t = ctx.currentTime + .05, i = step % 64, bar = Math.floor(i / 16) % 4, b = i % 16, sh = sty[0];
    const ch = CH[bar], m = sty[3] === 2 ? MEL2 : MEL;
    if (b % 4 === 0) tone(N(ch[0] + sh), t, .38, 'triangle', .1);
    if (b % 2 === 0) tone(N(ch[1 + (b / 2 % 3 | 0)] + 12 + sh), t, .16, 'sine', .035);
    if (m[i]) tone(N(m[i] + sh), t, sty[3] === 2 ? .5 : .22, sty[2], sty[2] === 'sawtooth' ? .03 : .05);
    step++;
  }
  G.Audio = {
    st,
    unlock: ensure,
    play(n) { if (st.sfx && ensure() && sfx[n]) sfx[n](); },
    startBgm() { if (!ensure() || bgmTimer) return; bgmTimer = setInterval(bgmStep, sty[1]); startAmb(sty[4]); },
    stopBgm() { clearInterval(bgmTimer); bgmTimer = null; stopAmb(); },
    setScene(k) { sty = STY[k] || STY.home; if (bgmTimer) { clearInterval(bgmTimer); bgmTimer = setInterval(bgmStep, sty[1]); startAmb(sty[4]); } },
    setTheme(k) { this.setScene(k || 'home'); },
    setSfx(v) { st.sfx = v; },
    setBgm(v) { st.bgm = v; v ? this.startBgm() : this.stopBgm(); },
  };
})(window.GAME = window.GAME || {});
