/* 遊戲流程：標題／選關／對話與作答／GAME OVER／通關／結局 */
(function (G) {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const Art = G.Art, Au = G.Audio, LV = G.LEVELS;
  const KEY = 'whyangry.v1';
  const CANCEL = { cancel: true };
  const SPEED = { slow: 55, mid: 32, fast: 16, off: 0 };
  const OKS = ['……哼，算你還知道。', '……這次先放過你。', '……嗯，還算你有心。', '……你、你還不算太笨嘛。', '……（別過頭）有在聽就好。'];
  const CLEARS = [
    '好啦，今天就原諒你。晚餐一起吃吧。', '……剛剛那支冰淇淋，分我一口。', '下次，蛋餅也要幫我點喔。', '公車來了，傘……我們一起撐。', '這杯拿鐵，現在變甜了。',
    '爆米花，我們一起吃。', '那件藍色的，你幫我拎著。', '再去吃一次炸雞排好不好？', '今天的燭光……其實很美。', '手，借我牽一下。',
    '摩天輪……我們再坐一次。', '防曬乳，現在可以幫我擦了。', '（小聲）下次，也要陪我來。', '便當……我們一起吃吧。', '雞蛋，記得是「雞」蛋喔。',
    '末班車……我們慢慢走回家吧。', '蛋糕我們一人一半。', '今晚的星星，我們一起看。', '螢光棒……給你一支。', '',
  ];
  const state = { name: '小晴', cleared: Array(20).fill(false), clearedR: Array(20).fill(false), fails: 0, failsR: 0, mode: 'fixed', chat: true, speed: 'mid', sfx: true, bgm: true };
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { } }
  function load() {
    try { const o = JSON.parse(localStorage.getItem(KEY) || 'null'); if (o) { Object.assign(state, o); ['cleared', 'clearedR'].forEach((k) => { if (!Array.isArray(state[k]) || state[k].length !== 20) state[k] = Array(20).fill(false); }); if (state.mode !== 'rand') state.mode = 'fixed'; state.chat = state.chat !== false; } } catch (e) { }
  }
  const nm = (t) => String(t).replace(/\{n\}/g, state.name);
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0;[a[i], a[j]] = [a[j], a[i]]; } return a; };
  const debug = /[?&]debug=1/.test(location.search);

  /* ---------- 舞台尺寸 ---------- */
  function fit() {
    // 直向裝置：舞台旋轉 90 度、以橫向畫面遊玩（整個畫面都能用，不會縮得很小）
    const w = innerWidth, h = innerHeight, portrait = h > w * 1.05;
    const maxW = portrait ? h : w, maxH = portrait ? w : h, sw = Math.min(maxW, maxH * 16 / 9);
    const st = $('stage'); st.style.width = sw + 'px'; st.style.height = sw * 9 / 16 + 'px'; st.style.setProperty('--u', sw / 960 + 'px');
    st.style.rotate = portrait ? '90deg' : '0deg';
  }
  addEventListener('resize', fit); fit();

  /* ---------- 繪圖 ---------- */
  let sceneKey = 'home';
  function setScene(k) { sceneKey = k; $('bg').innerHTML = `<image href="${bgImage(k)}" x="0" y="0" width="960" height="540" preserveAspectRatio="none"/>`; $('bgx').innerHTML = Art.extras(k); setGirl('normal'); setBoy('normal'); }
  const bgCache = {};
  function bgImage(k) { return bgCache[k] || (bgCache[k] = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(Art.staticSvg(k))); }
  function setGirl(m) { $('girlG').innerHTML = `<g class="breath">${Art.girl(m, sceneKey)}</g>`; fxG.girl = Art.fx(m, 'girl'); $('fxB').innerHTML = Art.fxBack(m, 'girl'); drawFx(); $('moodTint').setAttribute('opacity', m === 'angry' ? '.16' : '0'); }
  function setBoy(m) { $('boyG').innerHTML = `<g class="breath" style="animation-delay:-1.4s">${Art.boy(m)}</g>`; fxG.boy = Art.fx(m, 'boy'); drawFx(); }
  const fxG = { girl: '', boy: '' };
  function drawFx() { $('fxG').innerHTML = fxG.boy + fxG.girl; }
  $('defs').innerHTML = Art.defs;

  /* ---------- 畫面切換 ---------- */
  const SCRS = ['scrTitle', 'scrSelect', 'scrIntro', 'scrOver', 'scrClear', 'scrEnd', 'scrPause', 'scrSet', 'scrHow', 'scrConfirm'];
  function show(id) { SCRS.forEach((s) => $(s).classList.toggle('hidden', s !== id)); }
  function hideAll() { show(null); }
  function inGameUI(on) { ['hud', 'dlg'].forEach((i) => $(i).classList.toggle('hidden', !on)); if (!on) { $('choices').innerHTML = ''; } }

  /* ---------- 對話框（打字機） ---------- */
  let typing = null, nextCb = null;
  function say(name, text) {
    return new Promise((res) => {
      $('nameTag').textContent = name; $('nameTag').style.display = name ? '' : 'none';
      const t = nm(text), el = $('dlgText'); $('next').classList.add('hidden'); nextCb = null;
      const sp = SPEED[state.speed]; if (typing) typing.finish();
      if (!sp) { el.textContent = t; typing = null; return res(); }
      let i = 0; el.textContent = '';
      const iv = setInterval(() => { i++; el.textContent = t.slice(0, i); if (i % 3 === 0) Au.play('tick'); if (i >= t.length) done(); }, sp);
      function done() { clearInterval(iv); el.textContent = t; typing = null; res(); }
      typing = { finish: done };
    });
  }
  function waitNext() { return new Promise((res) => { $('next').classList.remove('hidden'); nextCb = () => { $('next').classList.add('hidden'); nextCb = null; res(); }; }); }
  function advance() { if (typing) typing.finish(); else if (nextCb) { Au.play('click'); nextCb(); } }
  $('dlg').addEventListener('click', (e) => { if (e.target.closest('#menuBtn')) return; advance(); });
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  /* ---------- 計時 ---------- */
  let timer = { raf: 0, on: false, paused: false, left: 0, total: 0, last: 0, cb: null, warn: 0 };
  function timerStart(sec, cb) {
    timer.total = timer.left = sec * 1000; timer.cb = cb; timer.on = true; timer.paused = false; timer.last = performance.now(); timer.warn = 0;
    cancelAnimationFrame(timer.raf);
    const loop = (now) => {
      if (!timer.on) return;
      if (!timer.paused) {
        timer.left -= now - timer.last; const sec2 = Math.ceil(timer.left / 1000);
        if (sec2 <= 3 && sec2 !== timer.warn && timer.left > 0) { timer.warn = sec2; Au.play('warn'); }
        $('timerBar').style.transform = `scaleX(${Math.max(0, timer.left / timer.total)})`;
        if (timer.left <= 0) { timer.on = false; const f = timer.cb; timer.cb = null; f && f(); return; }
      }
      timer.last = now; timer.raf = requestAnimationFrame(loop);
    };
    $('timerBar').style.transform = 'scaleX(1)'; timer.raf = requestAnimationFrame(loop);
  }
  function timerStop() { timer.on = false; cancelAnimationFrame(timer.raf); }
  const limitFor = (idx) => Math.round(30 - idx * (22 / 19));

  /* ---------- 出題 ---------- */
  // 固定題模式：每關題目、順序、選項排列每次都完全相同（以關卡編號為種子）
  // 全隨機模式：從該關整個題庫（固定題＋題池）隨機抽題，順序與選項每次都不同
  function rngOf(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function shuffleWith(a, r) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = r() * (i + 1) | 0;[a[i], a[j]] = [a[j], a[i]]; } return a; }
  // 讓玩家（男主角）的回答也會喊出她的名字：約四成的選項會帶名字，與對錯無關，避免成為線索
  function addName(t, r) {
    if (t.includes('{n}') || t.startsWith('（') || t.length > 28 || r() >= .4) return t;
    if (r() < .55) return '{n}，' + t;
    return /[。？！]$/.test(t) && !/……$/.test(t) ? t.slice(0, -1) + '，{n}' + t.slice(-1) : '{n}，' + t;
  }
  function buildQuestions(lv, idx, mode) {
    const rand = mode === 'rand', r = rand ? Math.random : rngOf((idx + 1) * 7919 + 13);
    /* 越後面的關卡，混入越多荒謬題（第 4 關起 1 題，之後每 4 關多 1 題） */
    const A = G.ABSURD || {}, own = A[idx] || [];
    const ap = []; for (let k = 3; k <= idx; k++) (A[k] || []).forEach((q) => ap.push(q));
    const na = idx < 3 ? 0 : Math.min(own.length, 1 + Math.floor((idx - 3) / 4));
    const total = lv.fixed.length + lv.pick;
    let list;
    if (rand) {
      const abs = shuffleWith(ap, r).slice(0, na);
      list = shuffleWith(lv.fixed.concat(lv.pool), r).slice(0, total - abs.length);
      abs.forEach((q) => list.splice(r() * (list.length + 1) | 0, 0, q));
    } else {
      list = lv.fixed.slice();
      shuffleWith(lv.pool, r).slice(0, Math.max(0, lv.pick - na)).forEach((q) => list.splice(1 + (r() * list.length | 0), 0, q));
      shuffleWith(own, r).slice(0, na).forEach((q) => list.splice(Math.max(2, list.length - 1 - (r() * 3 | 0)), 0, q));
    }
    const bridges = list.map(() => (r() < .5 ? r() * G.BRIDGES.length | 0 : -1));
    const tier = idx < 6 ? -1 : idx < 12 ? 0 : idx < 17 ? 1 : 2;
    return list.map((q, qi) => {
      const good = rand ? q.good[r() * q.good.length | 0] : q.good[0];
      let bad = q.bad;
      if (tier >= 0 && G.ABS_BAD && !q.absurd && r() < .35 + tier * .2) { const pool = G.ABS_BAD[Math.min(2, tier + (r() < .3 ? 1 : 0))]; bad = bad.concat(pool[r() * pool.length | 0]); }
      const nb = Math.min(bad.length, rand ? [1, 2, 2, 3, 3][r() * 5 | 0] : 2 + (r() * 2 | 0));
      let wrong = shuffleWith(bad, r).slice(0, nb);
      if (bad.length > q.bad.length && !wrong.includes(bad[bad.length - 1])) wrong[0] = bad[bad.length - 1];
      const opts = shuffleWith([{ t: addName(good, r), ok: true }].concat(wrong.map((t) => ({ t: addName(t, r), ok: false }))), r);
      return { q, opts, bridge: qi > 0 ? bridges[qi] : -1 };
    });
  }
  const CL = () => (state.mode === 'rand' ? state.clearedR : state.cleared);
  const FK = () => (state.mode === 'rand' ? 'failsR' : 'fails');

  /* ---------- 作答 ---------- */
  let runId = 0, cur = null, paused = false;
  function ask(opts, sec) {
    return new Promise((res) => {
      const box = $('choices'); box.innerHTML = '';
      opts.forEach((o, i) => {
        const d = document.createElement('div'); d.className = 'choice'; d.style.animationDelay = i * 60 + 'ms';
        const b = document.createElement('b'); b.textContent = i + 1; d.append(b, document.createTextNode(nm(o.t)));
        d.addEventListener('click', () => { if (paused) return; timerStop(); Au.play('click'); d.classList.add('picked'); [...box.children].forEach((c) => (c.style.pointerEvents = 'none')); res({ o }); });
        box.appendChild(d);
      });
      cur.opts = opts;
      if (sec) timerStart(sec, () => { box.innerHTML = ''; res({ timeout: true }); }); else { timerStop(); $('timerBar').style.transform = 'scaleX(1)'; }
    });
  }

  /* 各場景專屬介面配色：[對話框上, 對話框下, 邊框, 選項上, 選項下, 選項框, 選項字, 強調色, 按鈕上, 按鈕下, 裝飾字] */
  const THEMES = {
    home: ['rgba(120,74,52,.9)', 'rgba(78,46,34,.94)', '#ffe2b8', '#fffaf0', '#fbe9d2', '#e3b07a', '#5a3822', '#ffb45e', '#e9a35c', '#a8642c', '☕'],
    conv: ['rgba(30,110,76,.9)', 'rgba(16,72,50,.94)', '#d8ffe6', '#ffffff', '#e6f8ec', '#4cc27a', '#1d5a3a', '#ff9a3c', '#ff9a3c', '#d4601a', '✚'],
    breakfast: ['rgba(214,150,60,.9)', 'rgba(150,96,28,.94)', '#fff0c0', '#fffdf0', '#fff1c8', '#f2c14e', '#6a4410', '#ffb300', '#f7b733', '#c9801a', '☀'],
    busstop: ['rgba(56,92,140,.9)', 'rgba(34,58,98,.94)', '#d6e8ff', '#f8fbff', '#e0ecfb', '#7fa8e0', '#25406a', '#ffd23f', '#5f95e0', '#31609e', '➤'],
    cafe: ['rgba(110,72,50,.9)', 'rgba(66,40,28,.94)', '#f3dcc2', '#fff8ee', '#f3e2cd', '#c79a6e', '#5a3a26', '#e8a06a', '#c98a5c', '#7a4a2c', '♨'],
    cinema: ['rgba(80,18,38,.92)', 'rgba(36,8,20,.96)', '#ffd27a', '#2a1a24', '#42222f', '#e0a63a', '#ffe9b0', '#ffcf5a', '#c8363f', '#7a1424', '★'],
    mall: ['rgba(188,70,140,.9)', 'rgba(120,40,98,.94)', '#ffd9f0', '#fffafd', '#ffe4f3', '#f27fc0', '#6a2056', '#ffd23f', '#f06eb4', '#b03286', '♛'],
    nightmarket: ['rgba(150,26,30,.92)', 'rgba(88,12,18,.96)', '#ffd36b', '#fff4d8', '#ffe0a0', '#e8383a', '#6a1a10', '#ffcf3a', '#e8383a', '#a01418', '❖'],
    restaurant: ['rgba(140,40,40,.9)', 'rgba(86,22,26,.94)', '#ffe8cf', '#fff8ef', '#fbe5d0', '#d4624a', '#5a2218', '#ffb347', '#d9573f', '#9a2a22', '✿'],
    park: ['rgba(60,128,70,.9)', 'rgba(36,86,48,.94)', '#e4ffd2', '#fbfff4', '#e6f7d6', '#8fcf6a', '#2a5a22', '#ffd966', '#74c15a', '#3a8a3a', '❀'],
    amusement: ['rgba(120,64,190,.9)', 'rgba(74,34,130,.94)', '#ffe0fb', '#fffaff', '#f0e4ff', '#b48cf5', '#4a2a7a', '#ffdf4a', '#ff6fb5', '#a22d92', '✦'],
    beach: ['rgba(28,128,170,.9)', 'rgba(14,86,128,.94)', '#e0fbff', '#ffffff', '#e0f6fb', '#4ec3e0', '#16506a', '#ffd35e', '#39b7de', '#146e9e', '≋'],
    library: ['rgba(60,80,70,.92)', 'rgba(36,52,46,.95)', '#e8e0c4', '#fbf7ea', '#efe6cc', '#a49060', '#3e3a22', '#d9b45a', '#7a9a6a', '#46623e', '❧'],
    office: ['rgba(60,70,96,.92)', 'rgba(36,42,62,.95)', '#dde3f0', '#fafbfd', '#e9edf5', '#8d9ab8', '#2b3350', '#5fb3ff', '#6a7aa8', '#3c4872', '▪'],
    supermarket: ['rgba(196,56,48,.9)', 'rgba(128,32,32,.94)', '#fff0c8', '#fffdf4', '#ffeed2', '#f0b43c', '#6a2218', '#ffd23f', '#f05a48', '#b02820', '％'],
    station: ['rgba(48,62,84,.92)', 'rgba(26,34,52,.96)', '#cfe0ff', '#f7faff', '#e2eaf8', '#6f8fc8', '#22304e', '#ff9d3a', '#4f78b8', '#2a4678', '◆'],
    party: ['rgba(206,56,110,.9)', 'rgba(134,30,76,.94)', '#fff0b8', '#fffbf0', '#ffe6f0', '#ffb62e', '#6a1a46', '#ffe14a', '#ff5f9a', '#c22a70', '♪'],
    onsen: ['rgba(120,72,44,.92)', 'rgba(74,42,26,.96)', '#ffe0c0', '#fff6ea', '#f6e0c6', '#c98a5a', '#5a3420', '#9fd8e8', '#d08a54', '#8a4c26', '♨'],
    concert: ['rgba(34,18,80,.93)', 'rgba(14,8,44,.97)', '#7ff0ff', '#1d1440', '#2c1f60', '#ff4fd8', '#f0e6ff', '#7ff0ff', '#a54bff', '#4a1aa8', '♫'],
    rooftop: ['rgba(26,36,86,.93)', 'rgba(12,18,52,.97)', '#c8d6ff', '#eef2ff', '#d7e0fa', '#8a9ef0', '#1e2a5a', '#ffd86a', '#6f7ff0', '#3a44b0', '☾'],
  };
  function applyTheme(k) {
    const st = $('stage').style, t = THEMES[k];
    ['--g1', '--g2', '--line', '--cA', '--cB', '--cBd', '--cInk', '--acc', '--bA', '--bB', '--deco'].forEach((v, i) => (t ? st.setProperty(v, i === 10 ? `"${t[10]}"` : t[i]) : st.removeProperty(v)));
    if (t) st.setProperty('--hi', t[7]); else st.removeProperty('--hi');
  }
  async function playLevel(idx) {
    const tok = ++runId, chk = () => { if (tok !== runId) throw CANCEL; };
    const lv = LV[idx], qs = buildQuestions(lv, idx, state.mode); cur = { idx, qs, qi: 0, opts: null };
    try {
      titleStop(); hideAll(); inGameUI(true); setScene(lv.scene); applyTheme(lv.scene);
      $('lvTag').textContent = `第 ${idx + 1} 關 ‧ ${lv.place} ‧ ${state.mode === 'rand' ? '全隨機' : '固定題'}`;
      const dots = $('dots'); dots.innerHTML = qs.map(() => '<i></i>').join('');
      $('timerBar').style.transform = 'scaleX(1)'; $('dlgText').textContent = ''; $('nameTag').style.display = 'none';
      // 開場卡
      $('introNo').textContent = `STAGE ${String(idx + 1).padStart(2, '0')}`; $('introPlace').textContent = lv.place; $('introTitle').textContent = lv.title;
      show('scrIntro'); await sleep(1500); chk(); hideAll();
      await say('旁白', lv.intro); chk(); await waitNext(); chk();
      if (state.chat) await prelude(idx, chk);
      for (let qi = 0; qi < qs.length; qi++) {
        cur.qi = qi; const { q, opts } = qs[qi];
        [...dots.children].forEach((d, i) => { d.className = i < qi ? 'on' : i === qi ? 'cur' : ''; });
        if (state.chat && qs[qi].bridge >= 0) { setBoy('normal'); setGirl('cold'); for (const bt of G.BRIDGES[qs[qi].bridge]) await beat(bt, chk); }
        setGirl(q.mood); setBoy(['angry', 'shock', 'cold', 'sad'].includes(q.mood) ? 'nervous' : 'normal');
        await say(state.name, q.q); chk();
        const r = await ask(opts, limitFor(idx)); chk(); $('choices').innerHTML = '';
        if (r.timeout) { await fail('……你怎麼都不說話！連回答都不願意是嗎！', qi); return; }
        await say('你', r.o.t); chk(); await sleep(650); chk();
        if (!r.o.ok) { await fail(q.fail, qi); return; }
        Au.play('good'); setBoy('happy'); setGirl(Math.random() < .4 ? 'blush' : 'normal');
        await say(state.name, q.ok || OKS[Math.random() * OKS.length | 0]); chk(); await waitNext(); chk();
      }
      [...dots.children].forEach((d) => (d.className = 'on'));
      await winLevel(idx, tok);
    } catch (e) { if (e !== CANCEL) throw e; }

    async function fail(line, qi) {
      setGirl('angry'); setBoy('shock'); Au.play('bad'); $('stage').classList.remove('shake'); void $('stage').offsetWidth; $('stage').classList.add('shake');
      await say(state.name, line); chk(); await sleep(1100); chk();
      state[FK()]++; save(); inGameUI(false);
      $('overMsg').textContent = `${state.name}氣得轉身走了……\n（第 ${idx + 1} 關　${lv.place}　第 ${qi + 1} / ${qs.length} 題）`;
      show('scrOver');
    }
  }

  // 閒聊一行：n 旁白、b 你、g 她
  async function beat(bt, chk) {
    const [who, text, mood] = bt;
    if (who === 'g') { setGirl(mood || 'cold'); await say(state.name, text); }
    else if (who === 'b') { setBoy('normal'); await say('你', text); }
    else await say('旁白', text);
    chk(); await waitNext(); chk();
  }
  // 進關後的閒聊＋不計分的互動，聊完才會出題
  async function prelude(idx, chk) {
    const c = G.CHAT[idx]; if (!c) return;
    setBoy('normal'); setGirl('cold');
    for (const bt of c.lines) await beat(bt, chk);
    const w = c.warm; if (!w) return;
    setGirl('cold'); await say(state.name, '……'); chk();
    const r = await ask(w.ask.map((t) => ({ t, ok: true })), 0); chk(); $('choices').innerHTML = '';
    const i = w.ask.indexOf(r.o.t);
    await say('你', r.o.t); chk(); await sleep(600); chk();
    Au.play('good'); setBoy('happy'); setGirl(w.reply[i][0]);
    await say(state.name, w.reply[i][1]); chk(); await waitNext(); chk();
    setBoy('normal');
  }

  async function winLevel(idx, tok) {
    const chk = () => { if (tok !== runId) throw CANCEL; };
    CL()[idx] = true; save(); Au.play('clear');
    setGirl('happy'); setBoy('happy');
    if (idx === 19) { await endGame(tok); return; }
    await say(state.name, CLEARS[idx]); chk(); await waitNext(); chk();
    inGameUI(false);
    $('clearMsg').textContent = `${state.name}消氣了！\n第 ${idx + 1} 關　${LV[idx].place}　通關`;
    show('scrClear');
  }

  async function endGame(tok) {
    const chk = () => { if (tok !== runId) throw CANCEL; };
    const L = ['……其實我知道，你每次都很努力在猜。', '（走近）我生氣，只是希望你多看看我。', '所以……謝謝你，一直沒有放棄。', '我也愛你。笨蛋。'];
    setGirl('blush');
    for (const l of L) { await say(state.name, l); chk(); await waitNext(); chk(); }
    setGirl('happy'); inGameUI(false);
    const f = state[FK()];
    const rank = f <= 5 ? '完美男友　讀心術大師' : f <= 15 ? '超懂她　高級男友' : f <= 30 ? '努力型男友　愈挫愈勇' : '靠毅力通關的勇者　她看見了你的誠意';
    $('endMsg').textContent = `${state.name}終於笑了。\n恭喜你通過全部 20 個場景！（${state.mode === 'rand' ? '全隨機模式' : '固定題模式'}）`;
    $('endStat').innerHTML = '';
    const a = document.createElement('div'); a.append('累計踩雷（GAME OVER）次數：', Object.assign(document.createElement('b'), { textContent: f }), ' 次');
    const b = document.createElement('div'); b.append('評級：', Object.assign(document.createElement('b'), { textContent: rank }));
    $('endStat').append(a, b);
    show('scrEnd');
  }

  /* ---------- 選關 ---------- */
  const CARD_IC = ['🛋️', '🏪', '🍳', '🚌', '☕', '🎬', '🛍️', '🏮', '🍜', '🌳', '🎡', '🏖️', '📚', '💼', '🛒', '🚉', '🎉', '♨️', '🎤', '🌃'];
  const CARD_C = [['#ffd9e4', '#ff9fbd'], ['#d8f0d4', '#7fcf9a'], ['#fff0c2', '#ffc861'], ['#d6e8ff', '#8fb8f0'], ['#f1dccb', '#d9a37a'], ['#e6dcff', '#b49cf0'], ['#ffdbe9', '#f78fb6'], ['#ffe0c2', '#ff9a5c'], ['#fff2c9', '#f2c14e'], ['#daf3d0', '#8fd07a']];
  function renderSelect() {
    const g = $('grid'); g.innerHTML = ''; const cl = CL(), done = cl.filter(Boolean).length; let nextIdx = cl.indexOf(false);
    [...$('modeTabs').children].forEach((b) => b.classList.toggle('on', b.dataset.m === state.mode));
    $('modeDesc').textContent = state.mode === 'rand' ? '整個題庫隨機抽題：題目、順序、選項每次都不同。進度與固定題模式分開計算。' : '每關題目與順序固定，每次都一樣，可以記住她的地雷。進度與全隨機模式分開計算。';
    LV.forEach((lv, i) => {
      const unlocked = debug || i === 0 || cl[i - 1], c = document.createElement('div');
      c.className = 'card' + (cl[i] ? ' cleared' : '') + (unlocked ? '' : ' locked');
      const no = document.createElement('div'); no.className = 'no'; no.textContent = i + 1;
      const pl = document.createElement('div'); pl.className = 'pl'; pl.textContent = unlocked ? lv.place : '？？？';
      const st = document.createElement('div'); st.className = 'st'; st.textContent = !unlocked ? '未解鎖' : cl[i] ? '已通關' : i === nextIdx ? '挑戰中' : '可挑戰';
      const ic = document.createElement('div'); ic.className = 'ic'; ic.textContent = unlocked ? (CARD_IC[i] || '✿') : '🔒';
      c.style.setProperty('--c1', CARD_C[i % CARD_C.length][0]); c.style.setProperty('--c2', CARD_C[i % CARD_C.length][1]);
      c.append(ic, no, pl, st);
      c.addEventListener('click', () => { if (!unlocked) return; Au.play('click'); playLevel(i); });
      g.appendChild(c);
    });
    $('selStat').textContent = `${done} / 20`;
  }
  function toSelect() { applyTheme(null); runId++; timerStop(); inGameUI(false); paused = false; renderSelect(); show('scrSelect'); }
  /* ---------- 首頁：關鍵視覺輪播 ---------- */
  const TSHOW = [['home', 'sulk', 'nervous'], ['cafe', 'angry', 'nervous'], ['park', 'happy', 'happy'], ['beach', 'blush', 'normal'], ['rooftop', 'sad', 'nervous'], ['restaurant', 'cold', 'nervous'], ['onsen', 'sulk', 'normal'], ['mall', 'shock', 'shock']];
  let tIdx = 0, tTimer = 0;
  function titleLayout(on) {
    $('boyG').setAttribute('transform', on ? 'translate(150 214) scale(1.14)' : 'translate(190 172) scale(.96)');
    $('girlG').setAttribute('transform', on ? 'translate(810 214) scale(1.14)' : 'translate(770 172) scale(.96)');
  }
  function titleFrame() { const [sc, gm, bm] = TSHOW[tIdx % TSHOW.length]; setScene(sc); setGirl(gm); setBoy(bm); }
  function titleStart() {
    clearInterval(tTimer); titleLayout(true); titleFrame();
    tTimer = setInterval(() => {
      if ($('scrTitle').classList.contains('hidden')) return;
      const L = ['bg', 'bgx', 'girlG', 'boyG', 'fxG', 'fxB']; L.forEach((i) => ($(i).style.opacity = 0));
      setTimeout(() => { tIdx++; titleFrame(); L.forEach((i) => ($(i).style.opacity = 1)); }, 650);
    }, 6500);
    const n1 = state.cleared.filter(Boolean).length, n2 = state.clearedR.filter(Boolean).length; $('progChip').textContent = n1 + n2 ? `　固定 ${n1}／隨機 ${n2}` : '';
  }
  function titleStop() { clearInterval(tTimer); titleLayout(false); ['bg', 'bgx', 'girlG', 'boyG', 'fxG', 'fxB'].forEach((i) => ($(i).style.opacity = 1)); }
  (function petals() { const p = $('petals'); for (let i = 0; i < 16; i++) { const d = document.createElement('i'); d.style.left = Math.random() * 100 + '%'; d.style.animationDuration = 7 + Math.random() * 7 + 's'; d.style.animationDelay = -Math.random() * 12 + 's'; d.style.setProperty('--s', .6 + Math.random() * .9); p.appendChild(d); } })();

  function toTitle() { applyTheme(null); runId++; timerStop(); inGameUI(false); show('scrTitle'); titleStart(); }

  /* ---------- 暫停／設定／說明／確認 ---------- */
  let setBack = 'scrTitle';
  function openPause() {
    if ($('dlg').classList.contains('hidden') || !$('scrOver').classList.contains('hidden')) return;
    paused = true; timer.paused = true; show('scrPause');
  }
  function closePause() { paused = false; timer.paused = false; timer.last = performance.now(); hideAll(); }
  $('menuBtn').addEventListener('click', (e) => { e.stopPropagation(); Au.play('click'); openPause(); });
  $('pResume').onclick = () => { Au.play('click'); closePause(); };
  $('pRetry').onclick = () => { Au.play('click'); paused = false; timer.paused = false; playLevel(cur.idx); };
  $('pSel').onclick = () => { Au.play('click'); toSelect(); };
  $('pSet').onclick = () => { Au.play('click'); setBack = 'scrPause'; refreshSet(); show('scrSet'); };
  $('btnSet').onclick = () => { Au.play('click'); setBack = 'scrTitle'; refreshSet(); show('scrSet'); };
  $('setBack').onclick = () => { Au.play('click'); show(setBack); };
  $('btnHow').onclick = () => { Au.play('click'); show('scrHow'); };
  $('howBack').onclick = () => { Au.play('click'); show('scrTitle'); };
  function refreshSet() {
    $('swSfx').classList.toggle('on', state.sfx); $('swChat').classList.toggle('on', state.chat); $('swBgm').classList.toggle('on', state.bgm);
    [...$('segSpeed').children].forEach((b) => b.classList.toggle('on', b.dataset.v === state.speed));
  }
  $('swSfx').onclick = () => { state.sfx = !state.sfx; Au.setSfx(state.sfx); save(); refreshSet(); Au.play('click'); };
  $('swChat').onclick = () => { state.chat = !state.chat; save(); refreshSet(); Au.play('click'); };
  $('swBgm').onclick = () => { state.bgm = !state.bgm; Au.setBgm(state.bgm); save(); refreshSet(); Au.play('click'); };
  $('segSpeed').onclick = (e) => { const v = e.target.dataset && e.target.dataset.v; if (!v) return; state.speed = v; save(); refreshSet(); Au.play('click'); };
  function confirmBox(title, msg, yes, no) {
    $('cfTitle').textContent = title; $('cfMsg').textContent = msg; $('cfMsg').style.whiteSpace = 'pre-wrap'; show('scrConfirm');
    $('cfYes').onclick = () => { Au.play('click'); yes(); }; $('cfNo').onclick = () => { Au.play('click'); (no || (() => show('scrSet')))(); };
  }
  // 關卡內隨時可離開（本關進度不保留，不計入失敗次數）
  $('exitBtn').onclick = (e) => {
    e.stopPropagation(); Au.play('click'); paused = true; timer.paused = true;
    confirmBox('離開本關', '要離開這一關、回到選關畫面嗎？\n本關目前的進度不會保留。', toSelect, closePause);
  };
  $('pHome').onclick = () => { Au.play('click'); paused = false; timer.paused = false; toTitle(); };
  $('btnClear').onclick = () => confirmBox('清除進度', '所有關卡進度與累計次數都會歸零，確定要清除嗎？', () => { state.cleared = Array(20).fill(false); state.clearedR = Array(20).fill(false); state.fails = 0; state.failsR = 0; save(); refreshSet(); show('scrSet'); });

  /* ---------- 其他按鈕 ---------- */
  $('btnStart').onclick = () => {
    Au.unlock(); Au.play('click'); if (state.bgm) Au.startBgm();
    state.name = ($('nameIn').value.trim() || randName()).slice(0, 8); $('nameIn').value = state.name; save(); renderSelect(); show('scrSelect');
  };
  const NAMES = ['小晴', '小美', '雅婷', '怡君', '欣妤', '思妍', '詩涵', '佳蓉', '靜怡', '郁婷', '品妍', '芷若', '語晴', '沐恩', '宛庭', '子晴', '雨桐', '安琪', '心怡', '妍希', '曉彤', '柔安', '可晴', '若彤', '梓涵', '筱柔', '米米', '小櫻', '小雪', '小薰', '依依', '婉婷', '羽彤', '知夏', '星語', '蜜桃', '芷晴', '昕妤', '悅慈', '映彤'];
  function randName() { let n; do { n = NAMES[Math.random() * NAMES.length | 0]; } while (n === $('nameIn').value && NAMES.length > 1); return n; }
  $('btnRandName').onclick = () => { Au.unlock(); Au.play('click'); $('nameIn').value = randName(); };
  $('nameIn').addEventListener('keydown', (e) => { if (e.key === 'Enter') $('btnStart').click(); e.stopPropagation(); });
  $('modeTabs').onclick = (e) => { const m = e.target.dataset && e.target.dataset.m; if (!m || m === state.mode) return; Au.play('click'); state.mode = m; save(); renderSelect(); };
  $('selBack').onclick = () => { Au.play('click'); toTitle(); };
  $('btnRetry').onclick = () => { Au.play('click'); playLevel(cur.idx); };
  $('btnOverSel').onclick = () => { Au.play('click'); toSelect(); };
  $('btnNext').onclick = () => { Au.play('click'); playLevel(cur.idx + 1); };
  $('btnClearSel').onclick = () => { Au.play('click'); toSelect(); };
  $('btnEndSel').onclick = () => { Au.play('click'); toSelect(); };
  $('btnEndTitle').onclick = () => { Au.play('click'); toTitle(); };

  addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return;
    if (e.key === 'Escape') { if (!$('scrPause').classList.contains('hidden')) closePause(); else openPause(); return; }
    if (/^[1-4]$/.test(e.key)) { const c = $('choices').children[+e.key - 1]; if (c && !paused) c.click(); return; }
    if (e.key === 'Enter' || e.key === ' ') { if (!paused) { e.preventDefault(); advance(); } }
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden && cur && timer.on && !paused) openPause(); });

  /* ---------- 啟動 ---------- */
  load(); Au.setSfx(state.sfx); Au.st.bgm = state.bgm;
  $('nameIn').value = state.name === '小晴' && !localStorage.getItem(KEY) ? '' : state.name;
  show('scrTitle'); titleStart();
  G.game = { state, playLevel, get cur() { return cur; }, buildQuestions, rngOf };
})(window.GAME = window.GAME || {});
