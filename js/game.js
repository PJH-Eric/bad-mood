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
  const state = { name: '小晴', cleared: Array(20).fill(false), fails: 0, speed: 'mid', sfx: true, bgm: true };
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { } }
  function load() {
    try { const o = JSON.parse(localStorage.getItem(KEY) || 'null'); if (o) { Object.assign(state, o); if (!Array.isArray(state.cleared) || state.cleared.length !== 20) state.cleared = Array(20).fill(false); } } catch (e) { }
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
  function buildQuestions(lv) {
    const list = lv.fixed.slice();
    shuffle(lv.pool).slice(0, lv.pick).forEach((q) => list.splice(1 + (Math.random() * list.length | 0), 0, q));
    return list.map((q) => {
      const good = q.good[Math.random() * q.good.length | 0];
      const nb = Math.min(q.bad.length, [1, 2, 2, 3, 3][Math.random() * 5 | 0]);
      const opts = shuffle([{ t: good, ok: true }].concat(shuffle(q.bad).slice(0, nb).map((t) => ({ t, ok: false }))));
      return { q, opts };
    });
  }

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
      timerStart(sec, () => { box.innerHTML = ''; res({ timeout: true }); });
    });
  }

  async function playLevel(idx) {
    const tok = ++runId, chk = () => { if (tok !== runId) throw CANCEL; };
    const lv = LV[idx], qs = buildQuestions(lv); cur = { idx, qs, qi: 0, opts: null };
    try {
      titleStop(); hideAll(); inGameUI(true); setScene(lv.scene);
      $('lvTag').textContent = `第 ${idx + 1} 關 ‧ ${lv.place}`;
      const dots = $('dots'); dots.innerHTML = qs.map(() => '<i></i>').join('');
      $('timerBar').style.transform = 'scaleX(1)'; $('dlgText').textContent = ''; $('nameTag').style.display = 'none';
      // 開場卡
      $('introNo').textContent = `STAGE ${String(idx + 1).padStart(2, '0')}`; $('introPlace').textContent = lv.place; $('introTitle').textContent = lv.title;
      show('scrIntro'); await sleep(1500); chk(); hideAll();
      await say('旁白', lv.intro); chk(); await waitNext(); chk();
      for (let qi = 0; qi < qs.length; qi++) {
        cur.qi = qi; const { q, opts } = qs[qi];
        [...dots.children].forEach((d, i) => { d.className = i < qi ? 'on' : i === qi ? 'cur' : ''; });
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
      state.fails++; save(); inGameUI(false);
      $('overMsg').textContent = `${state.name}氣得轉身走了……\n（第 ${idx + 1} 關　${lv.place}　第 ${qi + 1} / ${qs.length} 題）`;
      show('scrOver');
    }
  }

  async function winLevel(idx, tok) {
    const chk = () => { if (tok !== runId) throw CANCEL; };
    state.cleared[idx] = true; save(); Au.play('clear');
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
    const f = state.fails;
    const rank = f <= 5 ? '完美男友　讀心術大師' : f <= 15 ? '超懂她　高級男友' : f <= 30 ? '努力型男友　愈挫愈勇' : '靠毅力通關的勇者　她看見了你的誠意';
    $('endMsg').textContent = `${state.name}終於笑了。\n恭喜你通過全部 20 個場景！`;
    $('endStat').innerHTML = '';
    const a = document.createElement('div'); a.append('累計踩雷（GAME OVER）次數：', Object.assign(document.createElement('b'), { textContent: f }), ' 次');
    const b = document.createElement('div'); b.append('評級：', Object.assign(document.createElement('b'), { textContent: rank }));
    $('endStat').append(a, b);
    show('scrEnd');
  }

  /* ---------- 選關 ---------- */
  function renderSelect() {
    const g = $('grid'); g.innerHTML = ''; const done = state.cleared.filter(Boolean).length; let nextIdx = state.cleared.indexOf(false);
    LV.forEach((lv, i) => {
      const unlocked = debug || i === 0 || state.cleared[i - 1], c = document.createElement('div');
      c.className = 'card' + (state.cleared[i] ? ' cleared' : '') + (unlocked ? '' : ' locked');
      const no = document.createElement('div'); no.className = 'no'; no.textContent = i + 1;
      const pl = document.createElement('div'); pl.className = 'pl'; pl.textContent = unlocked ? lv.place : '？？？';
      const st = document.createElement('div'); st.className = 'st'; st.textContent = !unlocked ? '未解鎖' : state.cleared[i] ? '已通關' : i === nextIdx ? '挑戰中' : '可挑戰';
      c.append(no, pl, st);
      c.addEventListener('click', () => { if (!unlocked) return; Au.play('click'); playLevel(i); });
      g.appendChild(c);
    });
    $('selStat').textContent = `${done} / 20`;
  }
  function toSelect() { runId++; timerStop(); inGameUI(false); paused = false; renderSelect(); show('scrSelect'); }
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
    const n = state.cleared.filter(Boolean).length; $('progChip').textContent = n ? `　進度 ${n} / 20` : '';
  }
  function titleStop() { clearInterval(tTimer); titleLayout(false); ['bg', 'bgx', 'girlG', 'boyG', 'fxG', 'fxB'].forEach((i) => ($(i).style.opacity = 1)); }
  (function petals() { const p = $('petals'); for (let i = 0; i < 16; i++) { const d = document.createElement('i'); d.style.left = Math.random() * 100 + '%'; d.style.animationDuration = 7 + Math.random() * 7 + 's'; d.style.animationDelay = -Math.random() * 12 + 's'; d.style.setProperty('--s', .6 + Math.random() * .9); p.appendChild(d); } })();

  function toTitle() { runId++; timerStop(); inGameUI(false); show('scrTitle'); titleStart(); }

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
    $('swSfx').classList.toggle('on', state.sfx); $('swBgm').classList.toggle('on', state.bgm);
    [...$('segSpeed').children].forEach((b) => b.classList.toggle('on', b.dataset.v === state.speed));
  }
  $('swSfx').onclick = () => { state.sfx = !state.sfx; Au.setSfx(state.sfx); save(); refreshSet(); Au.play('click'); };
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
  $('btnClear').onclick = () => confirmBox('清除進度', '所有關卡進度與累計次數都會歸零，確定要清除嗎？', () => { state.cleared = Array(20).fill(false); state.fails = 0; save(); refreshSet(); show('scrSet'); });

  /* ---------- 其他按鈕 ---------- */
  $('btnStart').onclick = () => {
    Au.unlock(); Au.play('click'); if (state.bgm) Au.startBgm();
    state.name = ($('nameIn').value.trim() || '小晴').slice(0, 8); save(); renderSelect(); show('scrSelect');
  };
  $('nameIn').addEventListener('keydown', (e) => { if (e.key === 'Enter') $('btnStart').click(); e.stopPropagation(); });
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
  G.game = { state, playLevel, get cur() { return cur; }, buildQuestions };
})(window.GAME = window.GAME || {});
