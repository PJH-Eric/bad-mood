const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const VPS = [[1280,720],[1920,1080],[1024,768],[800,600],[2560,1080],[390,844],[844,390],[768,1024]];
  const lang = process.argv[2] || 'tc';
  for (const [w,h] of VPS) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    await p.addInitScript(l => localStorage.setItem('whyangry.lang', l), lang);
    await p.goto('file://' + require('path').resolve(__dirname, '..', 'index.html') + ''); await p.waitForTimeout(500);
    const res = await p.evaluate(() => {
      const G = window.GAME, $ = id => document.getElementById(id);
      const tw = [].concat(...G.TWIST).sort((a, b) => b.length - a.length)[0];
      const absBad = [].concat(...G.ABS_BAD).sort((a, b) => b.length - a.length).slice(0, 6);
      let qs = []; G.LEVELS.forEach(l => l.fixed.concat(l.pool).forEach(q => qs.push(q)));
      Object.values(G.ABSURD).forEach(a => a.forEach(q => qs.push(q)));
      const mk = q => { const bad = q.bad.concat(absBad).sort((a, b) => b.length - a.length).slice(0, 3); return [q.good.slice().sort((a,b)=>b.length-a.length)[0] + tw].concat(bad).map(t => '大小姐，' + t); };
      const scored = qs.map(q => ({ q, o: mk(q), s: mk(q).reduce((a, t) => a + t.length, 0) + q.q.length * 3 })).sort((a, b) => b.s - a.s).slice(0, 25);
      const longQ = qs.slice().sort((a, b) => b.q.length - a.q.length).slice(0, 5).map(q => ({ q, o: mk(q) }));
      document.querySelectorAll('.scr').forEach(s => s.classList.add('hidden'));
      $('hud').classList.remove('hidden'); $('dlg').classList.remove('hidden');
      const out = [];
      scored.concat(longQ).forEach(({ q, o }) => {
        $('dlgText').textContent = q.q; $('nameTag').textContent = '大小姐'; $('nameTag').style.display = '';
        const box = $('choices'); box.innerHTML = '';
        o.forEach((t, i) => { const d = document.createElement('div'); d.className = 'choice'; d.style.animation = 'none'; const bb = document.createElement('b'); bb.textContent = i + 1; d.append(bb, document.createTextNode(t)); box.appendChild(d); });
        G.fitChoices(box);
        const issues = [];
        const st = $('stage');
        const rel = (el) => { let t = 0, e = el; while (e && e !== st) { t += e.offsetTop; e = e.offsetParent; } return t; };
        const bt = rel(box), kids = [...box.children];
        const top = Math.min(...kids.map(c => bt + c.offsetTop)), bot = Math.max(...kids.map(c => bt + c.offsetTop + c.offsetHeight));
        const dTop = rel($('dlg')), dt = $('dlgText');
        if (bot > dTop - 2) issues.push('選項蓋到對話框 ' + Math.round(bot - dTop));
        const relL = (el) => { let t = 0, e = el; while (e && e !== st) { t += e.offsetLeft; e = e.offsetParent; } return t; };
        const bl = relL(box) , br = bl + box.offsetWidth; let hb = 0, hn = '';
        ['timer','lvTag','exitBtn','dots','affChip','nameTag'].forEach(i => { const e = $(i); if (!e || !e.offsetHeight || !e.offsetWidth) return; const l = relL(e), r = l + e.offsetWidth; if (r > bl && l < br) { const bb2 = rel(e) + e.offsetHeight; if (bb2 > hb) { hb = bb2; hn = i; } } });
        if (top < hb - 2) issues.push('選項蓋到' + hn + ' ' + Math.round(hb - top));
        if (dt.scrollHeight > dt.clientHeight + 1) issues.push('對話文字超出對話框 ' + (dt.scrollHeight - dt.clientHeight));
        if (kids.some(c => c.scrollWidth > c.clientWidth + 1)) issues.push('選項橫向溢出');
        const sw = box.offsetWidth, sl = box.offsetLeft; if (sl < 0 || sl + sw > st.offsetWidth) issues.push('選項超出舞台左右');
        issues.push && 0;
        out.push && 0;
        if (issues.length) out.push({ q: q.q.slice(0, 18), issues });
      });
      return { rot: getComputedStyle($('stage')).transform, out };
    });
    console.log(w + 'x' + h, 'rot=' + (res.rot !== 'none'), 'problems:', res.out.length, JSON.stringify(res.out.slice(0, 3)));
    await p.close();
  }
  await b.close();
})();
