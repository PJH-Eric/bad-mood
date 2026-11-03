/* 美術：全部為手繪向量 SVG（人物表情、服裝、20 個場景），不依賴任何外部圖片 */
(function (G) {
  'use strict';
  let uid = 0;
  const R = (x, y, w, h, f, o) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f}" ${o || ''}/>`;
  const C = (x, y, r, f, o) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}" ${o || ''}/>`;
  const E = (x, y, rx, ry, f, o) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${f}" ${o || ''}/>`;
  const P = (d, f, o) => `<path d="${d}" fill="${f}" ${o || ''}/>`;
  const S = (d, c, w, o) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${o || ''}/>`;
  const TX = (x, y, t, size, f, o) => `<text x="${x}" y="${y}" font-size="${size}" fill="${f}" font-weight="700" text-anchor="middle" font-family="'Noto Sans TC','PingFang TC','Microsoft JhengHei',sans-serif" ${o || ''}>${t}</text>`;
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  /* ---------- 共用漸層（放在舞台 <defs>） ---------- */
  const DEFS = `
  <linearGradient id="gHair" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffc2dc"/><stop offset=".3" stop-color="#ff98c3"/><stop offset=".7" stop-color="#e65f97"/><stop offset="1" stop-color="#b53a72"/></linearGradient>
  <linearGradient id="gHairB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a5878"/><stop offset=".35" stop-color="#3b3852"/><stop offset="1" stop-color="#16141f"/></linearGradient>
  <linearGradient id="gSkin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff4ea"/><stop offset=".6" stop-color="#ffe3d2"/><stop offset="1" stop-color="#f7c9b4"/></linearGradient>
  <radialGradient id="gFaceShade" cx=".5" cy=".42" r=".62"><stop offset=".62" stop-color="#d27f6c" stop-opacity="0"/><stop offset="1" stop-color="#c06a5c" stop-opacity=".38"/></radialGradient>
  <radialGradient id="gIris" cx=".5" cy=".3" r=".75"><stop offset="0" stop-color="#9a3d75"/><stop offset=".45" stop-color="#e48ab4"/><stop offset=".85" stop-color="#ffc4dc"/><stop offset="1" stop-color="#7a2e5e"/></radialGradient>
  <radialGradient id="gIrisB" cx=".5" cy=".3" r=".75"><stop offset="0" stop-color="#8a5210"/><stop offset=".45" stop-color="#f2b84a"/><stop offset=".85" stop-color="#ffe49a"/><stop offset="1" stop-color="#7a4a10"/></radialGradient>
  <linearGradient id="gCloth" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".18"/><stop offset=".35" stop-color="#fff" stop-opacity=".12"/><stop offset=".7" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></linearGradient>
  <linearGradient id="gShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".0"/><stop offset="1" stop-color="#000" stop-opacity=".25"/></linearGradient>`;

  /* ---------- 表情設定 ---------- */
  const MOODS = {
    normal: { h: 19, lid: 0, brow: [-24, -27], mouth: 'smile', blush: .25 },
    angry: { h: 15, lid: 9, brow: [-18, -33], mouth: 'angry', blush: .1, vein: 1 },
    sulk: { h: 16, lid: 4, brow: [-24, -24], mouth: 'pout', blush: .5, puff: 1, look: 7 },
    sad: { h: 19, lid: 0, brow: [-34, -20], mouth: 'wave', blush: .1, tear: 1 },
    shock: { h: 23, lid: 0, brow: [-40, -42], mouth: 'o', blush: 0, sweat: 1, small: 1 },
    cold: { h: 14, lid: 7, brow: [-26, -26], mouth: 'flat', blush: 0 },
    happy: { h: 0, lid: 0, brow: [-28, -32], mouth: 'open', blush: .6, closed: 1 },
    blush: { h: 18, lid: 0, brow: [-26, -29], mouth: 'smile', blush: .9, look: -6 },
    nervous: { h: 18, lid: 0, brow: [-34, -24], mouth: 'wave', blush: 0, sweat: 1 },
  };

  function face(m, who) {
    const c = MOODS[m] || MOODS.normal;
    const boy = who === 'boy';
    const dark = boy ? '#2b2233' : '#5a2d3d';
    const iris = boy ? 'url(#gIrisB)' : 'url(#gIris)';
    const ex = boy ? 25 : 27, ey = boy ? 4 : 6, sx = boy ? .85 : 1.02;
    let o = '';
    // 臉頰紅暈
    if (c.blush) o += E(-39, ey + 25, 12, 7, '#ff8fa8', `opacity="${c.blush * (boy ? .6 : .8)}"`) + E(39, ey + 25, 12, 7, '#ff8fa8', `opacity="${c.blush * (boy ? .6 : .8)}"`);
    if (c.puff) o += E(-45, ey + 30, 12, 11, '#ffd0c0', 'opacity=".6"') + E(45, ey + 30, 12, 11, '#ffd0c0', 'opacity=".6"');
    // 眼睛
    for (const s of [-1, 1]) {
      const cx = s * ex, id = 'ec' + (++uid);
      if (c.closed) { o += S(`M${cx - 15} ${ey + 4} Q${cx} ${ey - 12} ${cx + 15} ${ey + 4}`, dark, 4); continue; }
      const h = c.h * sx, lid = c.lid, look = (c.look || 0) * s * (c.look < 0 ? -1 : 1) * 0 + (c.look || 0);
      // 眼瞼裁切（生氣＝內側下壓；冷淡＝半睜）
      const inner = -s, topOuter = ey - h - 4 + lid * 0.4, topInner = ey - h - 4 + lid;
      const clip = `<clipPath id="${id}"><polygon points="${cx - 22},${s < 0 ? topOuter : topInner} ${cx + 22},${s < 0 ? topInner : topOuter} ${cx + 22},${ey + 30} ${cx - 22},${ey + 30}"/></clipPath>`;
      const lx = cx + look * .6, ir = c.small ? 6 : (boy ? 10.5 : 11.8), ih = c.small ? 7 : h * .9;
      o += clip + `<g clip-path="url(#${id})">` + E(cx, ey, 15, h, '#fff', `stroke="${dark}" stroke-width="2"`) +
        E(cx, ey - h * .55, 15, h * .5, boy ? '#c9b8a0' : '#cdb4cc', 'opacity=".5"') +
        E(lx, ey + 1, ir, ih, iris) + E(lx, ey + 1, ir, ih, 'none', `stroke="${boy ? '#7a4a0c' : '#6a2656'}" stroke-width="1.8" opacity=".8"`) +
        E(lx, ey - ih * .3, ir * .95, ih * .5, boy ? '#5a2e00' : '#3a1030', 'opacity=".3"') + S(`M${lx} ${ey + 1} L${lx - ir * .8} ${ey - ih * .5} M${lx} ${ey + 1} L${lx + ir * .8} ${ey - ih * .5} M${lx} ${ey + 1} L${lx - ir * .95} ${ey + ih * .2} M${lx} ${ey + 1} L${lx + ir * .95} ${ey + ih * .2} M${lx} ${ey + 1} L${lx - ir * .5} ${ey + ih * .9} M${lx} ${ey + 1} L${lx + ir * .5} ${ey + ih * .9}`, '#fff', .8, 'opacity=".28"') +
        E(lx, ey + ih * .55, ir * .72, ih * .34, '#fff', 'opacity=".38"') +
        E(lx, ey + 2, c.small ? 3.2 : 5.4, c.small ? 3.6 : h * .44, '#26101e') +
        E(lx - 4.6, ey - h * .42, c.small ? 2.2 : 3.6, c.small ? 2.6 : 4.8, '#fff') + C(lx + 4.4, ey + h * .42, c.small ? 1.2 : 2, '#fff', 'opacity=".9"') + C(lx + 1.5, ey - h * .1, .9, '#fff', 'opacity=".8"') + '</g>';
      o += S(`M${cx - 14} ${ey - h - 5} Q${cx} ${ey - h - 11} ${cx + 14} ${ey - h - 4}`, dark, 1.3, 'opacity=".45"');
      if (!boy) o += S(`M${cx - 10} ${ey + h + 3} Q${cx} ${ey + h + 6} ${cx + 10} ${ey + h + 3}`, dark, 1.2, 'opacity=".35"');
      // 上睫毛
      const lash = ey - h + (s < 0 ? lid * .4 : lid) * (s < 0 ? 1 : 0) + 0;
      o += S(`M${cx - 16} ${ey - h * .2 + (s < 0 ? lid * .3 : lid * .9) * 0.0} Q${cx} ${ey - h - 7 + lid * .5} ${cx + 16} ${ey - h * .1}`, dark, boy ? 3 : 4);
      if (!boy) o += S(`M${cx + s * 15} ${ey - h * .3} l${s * 7} -5`, dark, 2.5);
      else o += S(`M${cx - 15} ${ey - h * .2} Q${cx} ${ey - h - 8} ${cx + 15} ${ey - h * .1}`, '#000', 1.4, 'opacity=".5"') + S(`M${cx + s * 14} ${ey - h * .3} l${s * 4} -3`, dark, 2);
    }
    // 眉毛
    const [bi, bo] = c.brow, by = boy ? 3 : 0;
    for (const s of [-1, 1]) o += S(`M${s * 11} ${bi + by - 1} Q${s * 26} ${(bi + bo) / 2 - 7 + by} ${s * 40} ${bo + by}`, boy ? '#1a1626' : '#a24a76', boy ? 5 : 3.5);
    o += S(`M-1.5 ${ey + 24} q1.5 3 3 0`, boy ? '#b9806a' : '#d99a86', 1.8, 'opacity=".7"') + S(`M-3 ${ey + 14} Q0 ${ey + 18} 3 ${ey + 14}`, '#fff', 1.6, 'opacity=".55"') + E(2, ey + 22, 2, 1.2, '#fff', 'opacity=".7"');
    // 嘴巴
    const my = boy ? 48 : 46;
    switch (c.mouth) {
      case 'smile': o += S(`M-11 ${my} Q0 ${my + 11} 11 ${my}`, dark, 3) + (boy ? '' : S(`M-5 ${my + 7} Q0 ${my + 10} 5 ${my + 7}`, '#ff8fa0', 3, 'opacity=".55"') + S(`M-3 ${my + 8} Q0 ${my + 9.5} 3 ${my + 8}`, '#fff', 1.2, 'opacity=".6"')); break;
      case 'open': o += P(`M-15 ${my - 4} Q0 ${my + 28} 15 ${my - 4}Z`, '#c23a5b', `stroke="${dark}" stroke-width="2.5"`) + E(0, my + 8, 7, 4, '#ff8fa0'); break;
      case 'pout': o += S(`M-7 ${my + 4} Q0 ${my - 3} 7 ${my + 4}`, dark, 3); break;
      case 'o': o += E(0, my + 5, 7, 10, '#b8344f', `stroke="${dark}" stroke-width="2.5"`); break;
      case 'flat': o += S(`M-9 ${my + 3} L9 ${my + 3}`, dark, 3); break;
      case 'wave': o += S(`M-13 ${my + 5} Q-6 ${my - 3} 0 ${my + 5} Q6 ${my + 13} 13 ${my + 5}`, dark, 3); break;
      case 'angry': o += P(`M-15 ${my} L15 ${my} L12 ${my + 12} L-12 ${my + 12}Z`, '#fff', `stroke="${dark}" stroke-width="2.5" stroke-linejoin="round"`) + S(`M-5 ${my} V${my + 12} M5 ${my} V${my + 12} M0 ${my} V${my + 12}`, dark, 1.6); break;
    }
    if (c.tear) o += E(-30, ey + 26, 4, 7, '#7fc6ff', 'opacity=".9"') + E(30, ey + 26, 4, 7, '#7fc6ff', 'opacity=".9"') + S(`M-27 ${ey + 12} L-30 ${ey + 36} M27 ${ey + 12} L30 ${ey + 36}`, '#7fc6ff', 3);
    if (c.sweat) o += P('M60 -40 Q68 -22 60 -14 Q52 -22 60 -40Z', '#9ad8ff', 'stroke="#4aa8e8" stroke-width="2"');
    if (c.vein) o += S('M48 -62 l8 -4 M54 -74 l4 8 M68 -66 l-8 4 M62 -54 l-4 -8', '#e5303a', 4.5);
    return o;
  }

  /* ---------- 女主角：服裝 ---------- */
  function torsoGirl(kind, c1, c2) {
    const sh = 'M-125 340 C-125 200 -90 130 -26 112 L26 112 C90 130 125 200 125 340Z';
    let o = '';
    const skin = P(sh, 'url(#gSkin)');
    switch (kind) {
      case 'swim':
        o += skin + P('M-30 130 q-18 18 -2 38 q14 8 28 -2 q0 -26 -26 -36Z M30 130 q18 18 2 38 q-14 8 -28 -2 q0 -26 26 -36Z', c1) +
          S('M-26 124 Q0 100 26 124', c1, 4) + S('M-22 124 Q-40 112 -50 126', c1, 3) + S('M22 124 Q40 112 50 126', c1, 3);
        break;
      case 'formal':
        o += P(sh, 'url(#gSkin)') + P('M-125 340 C-125 250 -108 210 -70 190 Q0 220 70 190 C108 210 125 250 125 340Z', c1) +
          S('M-70 190 Q0 220 70 190', c2 || '#fff', 3) + S('M-30 150 Q0 188 30 150', '#fff6d8', 4, 'stroke-dasharray="1 7"');
        break;
      case 'yukata':
        o += P(sh, c1) + P('M-26 112 L26 112 L6 330 L-6 330Z', '#fff') + P('M-26 112 L14 190 L26 112Z', c1, 'opacity=".25"') +
          S('M-26 112 L10 200 M26 112 L-10 200', '#fff', 6) + R(-125, 262, 250, 36, c2 || '#f4a8c3') + P('M-14 250 q-30 6 -26 40 q16 0 26 -10Z M14 250 q30 6 26 40 q-16 0 -26 -10Z', c2 || '#f4a8c3');
        for (let i = 0; i < 9; i++) o += C(-100 + i * 26, 220 + (i % 3) * 14, 4, '#fff', 'opacity=".5"');
        break;
      case 'pajama':
        o += P(sh, c1) + S('M-26 114 Q0 150 26 114', '#fff', 6) + R(-125, 250, 250, 6, c2 || '#fff', 'opacity=".5"');
        for (const [x, y] of [[-70, 200], [-20, 240], [60, 210], [90, 280], [-95, 290], [20, 300]]) o += `<path transform="translate(${x} ${y})" d="M0 -9 L3 -3 L9 -3 L4 1 L6 8 L0 4 L-6 8 L-4 1 L-9 -3 L-3 -3Z" fill="#ffe27a"/>`;
        o += S('M-120 340 V300 M120 340 V300', '#fff', 0);
        break;
      case 'coat':
        o += P(sh, c1) + P('M-26 112 L-8 340 L-40 340Z M26 112 L8 340 L40 340Z', '#000', 'opacity=".12"') + S('M0 130 V340', '#000', 2, 'opacity=".3"') +
          P('M-60 118 Q0 160 60 118 L66 150 Q0 196 -66 150Z', c2 || '#e8505b') + P('M-14 160 L-34 238 L-6 232Z', c2 || '#e8505b');
        o += C(-5, 206, 4, '#fff6') + C(-5, 262, 4, '#fff6');
        break;
      case 'hoodie':
        o += P(sh, c1) + P('M-52 124 Q0 196 52 124 L40 112 Q0 138 -40 112Z', '#000', 'opacity=".2"') + S('M-52 124 Q-60 60 -26 108 M52 124 Q60 60 26 108', c1, 12) +
          S('M-14 150 V206 M14 150 V206', '#fff', 3) + P('M-34 270 H34 V320 H-34Z', '#000', 'opacity=".12"');
        break;
      case 'tee':
        o += P(sh, c1) + S('M-26 114 Q0 144 26 114', '#222', 5) + `<path transform="translate(0 230) scale(2.2)" d="M0 -14 L4 -4 L14 -4 L6 3 L9 13 L0 7 L-9 13 L-6 3 L-14 -4 L-4 -4Z" fill="${c2 || '#ff5fa2'}"/>`;
        break;
      case 'blouse':
        o += P(sh, c1) + P('M-26 112 L-62 134 L-30 168 L0 128Z M26 112 L62 134 L30 168 L0 128Z', '#fff', 'stroke="#cdd" stroke-width="2"') +
          P('M-18 140 L18 140 L12 160 L-12 160Z', c2 || '#d8283f') + P('M-18 140 L-34 130 L-30 164Z M18 140 L34 130 L30 164Z', c2 || '#d8283f');
        break;
      case 'sweater':
        o += P(sh, c1);
        for (let i = 0; i < 12; i++) o += S(`M${-110 + i * 20} 150 V340`, '#000', 2, 'opacity=".07"');
        o += S('M-30 114 Q0 142 30 114', '#fff', 10, 'opacity=".7"') + R(-125, 322, 250, 18, '#000', 'opacity=".1"');
        break;
      default: // dress：青綠洋裝＋粉色口袋滾邊（比照截圖）
        o += P(sh, c1 || '#7fd1d8') + S('M0 118 V340', '#58b4bd', 3) + P('M-26 112 L0 150 L26 112 Q0 124 -26 112Z', '#fff') +
          P('M-92 270 H-36 V330 H-92Z M36 270 H92 V330 H36Z', c2 || '#f78fb3', 'opacity=".95"') + C(-3, 170, 3.6, '#58b4bd') + C(-3, 210, 3.6, '#58b4bd');
    }
    return o;
  }

  function accessory(a) {
    switch (a) {
      case 'glasses': return S('M-52 14 q0 -16 22 -16 q22 0 22 16 q0 16 -22 16 q-22 0 -22 -16Z M8 14 q0 -16 22 -16 q22 0 22 16 q0 16 -22 16 q-22 0 -22 -16Z M-8 8 Q0 4 8 8', '#5b3b6e', 3.2) + P('M-52 14 q0 -16 22 -16 q22 0 22 16 q0 16 -22 16 q-22 0 -22 -16Z', '#bfe7ff', 'opacity=".18"') + P('M8 14 q0 -16 22 -16 q22 0 22 16 q0 16 -22 16 q-22 0 -22 -16Z', '#bfe7ff', 'opacity=".18"');
      case 'partyhat': return P('M-26 -108 L8 -190 L40 -104Z', '#ffd45e', 'stroke="#e8a620" stroke-width="3"') + C(8, -192, 8, '#ff5f93') + S('M-18 -128 l50 8 M-10 -150 l36 6', '#ff5f93', 5);
      case 'tiara': return P('M-40 -104 L-26 -128 L-12 -108 L0 -134 L12 -108 L26 -128 L40 -104Z', '#ffe27a', 'stroke="#e4b52b" stroke-width="2.5"') + C(0, -128, 4, '#ff6fa5') + C(-26, -123, 3, '#8fd6ff') + C(26, -123, 3, '#8fd6ff');
      case 'flower': return `<g transform="translate(50 -78)">${[0, 72, 144, 216, 288].map(r => E(0, -12, 8, 12, '#fff', `transform="rotate(${r})" stroke="#f4a8c3" stroke-width="2"`)).join('')}${C(0, 0, 6, '#ffd54a')}</g>`;
      case 'headband': return S('M-76 -40 Q0 -126 76 -40', '#7c4dff', 7) + C(60, -78, 9, '#ff5fa2');
      default: return '';
    }
  }

  /* ---------- 人物（比照參考圖：半寫實日系視覺小說比例、有手臂與手） ---------- */
  const LINE = 'stroke="#4a2438" stroke-opacity=".55" stroke-width="1.5" stroke-linejoin="round"';
  const FACE_G = 'M-58 -6 C-58 -50 -30 -72 0 -72 C30 -72 58 -50 58 -6 C58 38 34 72 0 82 C-34 72 -58 38 -58 -6Z';
  const FACE_B = 'M-56 -4 C-56 -48 -30 -70 0 -70 C30 -70 56 -48 56 -4 C56 36 38 70 0 78 C-38 70 -56 36 -56 -4Z';
  const arm = (d, c, w) => S(d, '#3a2a3f', w + 4, 'stroke-opacity=".4"') + S(d, c, w);
  const hand = (x, y, r) => { r = r || 1; let o = E(x, y, 15 * r, 13 * r, 'url(#gSkin)', LINE);
    for (let i = 0; i < 4; i++) o += E(x - 9 * r + i * 6 * r, y + 9 * r, 3.8 * r, 6.5 * r, 'url(#gSkin)', 'stroke="#b8806c" stroke-opacity=".5" stroke-width="1.2"') + E(x - 9 * r + i * 6 * r, y + 12 * r, 2 * r, 1.6 * r, '#ffd0cc', 'opacity=".8"');
    o += E(x + 13 * r, y - 1 * r, 4.5 * r, 7 * r, 'url(#gSkin)', 'stroke="#b8806c" stroke-opacity=".5" stroke-width="1.2" transform="rotate(-20 ' + (x + 13 * r) + ' ' + y + ')"') + E(x - 3 * r, y - 5 * r, 8 * r, 3 * r, '#fff', 'opacity=".4"') + S(`M${x - 7 * r} ${y + 1 * r} q1 5 0 8 M${x - 1 * r} ${y} q1 6 0 10 M${x + 5 * r} ${y + 1 * r} q1 5 0 8`, '#c9907a', 1.1, 'opacity=".5"'); return o; };

  function girl(mood, outfit) {
    const o = outfit || { kind: 'dress' }, hair = 'url(#gHair)';
    const sleeve = (o.kind === 'swim' || o.kind === 'formal') ? 'url(#gSkin)' : (o.c1 || '#7fd1d8');
    let s = '';
    s += P('M-84 -6 C-90 -92 -42 -112 0 -112 C42 -112 90 -92 84 -6 C92 70 88 150 74 214 L-74 214 C-88 150 -92 70 -84 -6Z', hair, LINE);
    s += P('M-74 20 C-84 90 -80 160 -68 208 L68 208 C80 160 84 90 74 20Z', '#b83f7a', 'opacity=".4"');
    s += '<g transform="translate(0 -16)">';
    s += `<g transform="scale(.9 1)">${torsoGirl(o.kind, o.c1, o.c2)}</g>`;
    s += P('M-14 60 L14 60 L16 126 L-16 126Z', '#f3c2a6') + P('M-14 60 L14 60 L14 84 Q0 98 -14 84Z', '#000', 'opacity=".12"');
    // 手臂：抱胸（生氣／鬧彆扭／冷淡）或雙手交握在胸前（其他）
    if (mood === 'angry' || mood === 'sulk' || mood === 'cold') {
      s += arm('M-88 150 Q-104 226 -2 232', sleeve, 34) + arm('M88 150 Q104 238 4 248', sleeve, 34) + hand(-8, 232) + hand(10, 248);
    } else if (mood === 'shock') {
      s += arm('M-88 150 Q-112 190 -52 196', sleeve, 32) + arm('M88 150 Q112 190 52 196', sleeve, 32) + hand(-40, 190) + hand(40, 190);
    } else {
      s += arm('M-88 150 Q-108 226 -18 224', sleeve, 32) + arm('M88 150 Q108 226 18 224', sleeve, 32) + hand(-8, 220, .95) + hand(8, 220, .95);
    }
    s += P('M-100 340 C-100 205 -74 142 -20 126 L20 126 C74 142 100 205 100 340Z', 'url(#gShade)', 'opacity=".45"') + S('M-70 250 Q-52 290 -58 336 M70 250 Q52 290 58 336 M-30 300 Q-24 322 -28 340 M30 300 Q24 322 28 340', '#000', 2.5, 'opacity=".13"');
    s += S('M-84 160 Q-60 140 -30 132 M84 160 Q60 140 30 132', '#fff', 3, 'opacity=".35"') + S('M-76 200 Q-70 250 -80 300 M76 200 Q70 250 80 300', '#000', 2, 'opacity=".12"') + P('M-100 340 C-100 205 -74 142 -20 126 L20 126 C74 142 100 205 100 340Z', 'url(#gCloth)', 'opacity=".7"');
    s += '</g>';
    s += E(-58, 8, 7, 13, '#ffd9c4', LINE) + E(58, 8, 7, 13, '#ffd9c4', LINE) + S('M-59 2 q-3 6 0 12 M59 2 q3 6 0 12', '#e49a86', 1.6, 'opacity=".6"');
    s += P(FACE_G, 'url(#gSkin)', LINE) + P(FACE_G, 'url(#gFaceShade)', 'opacity=".6"') + P('M-30 70 Q0 88 30 70 Q0 80 -30 70Z', '#c06a5c', 'opacity=".22"');
    s += E(-34, 30, 20, 12, '#fff', 'opacity=".18"') + E(34, 30, 20, 12, '#fff', 'opacity=".18"');
    s += P('M-60 -18 Q0 6 60 -18 Q56 -46 0 -52 Q-56 -46 -60 -18Z', '#b8467a', 'opacity=".2"');
    s += face(mood, 'girl');
    s += P('M-60 -30 C-86 30 -82 130 -68 214 C-54 160 -52 80 -54 20Z', hair, LINE) + P('M60 -30 C86 30 82 130 68 214 C54 160 52 80 54 20Z', hair, LINE);
    s += P('M-66 -14 C-68 -90 -24 -110 4 -110 C40 -110 72 -88 66 -14 C60 -46 46 -66 26 -76 C30 -54 18 -34 4 -30 C0 -54 -18 -68 -38 -64 C-56 -56 -62 -36 -66 -14Z', hair, LINE) +
      P('M-30 -98 Q-6 -110 22 -100', 'none', 'stroke="#fff" stroke-opacity=".55" stroke-width="5" stroke-linecap="round"') +
      S('M-4 -96 Q-14 -64 -8 -38 M30 -88 Q36 -64 24 -42 M-36 -86 Q-50 -62 -56 -36', '#c94b83', 2.2, 'opacity=".55"');
    s += S('M-50 -70 Q-70 -20 -66 40 M-30 -92 Q-62 -50 -58 10 M20 -92 Q50 -66 56 -20 M0 -100 Q30 -90 46 -66', '#ffd9ea', 3, 'opacity=".6"') +
      S('M-70 60 Q-76 120 -70 190 M70 60 Q76 120 70 190 M-62 80 Q-64 140 -58 196 M62 80 Q64 140 58 196', '#ffb3d1', 2.4, 'opacity=".7"') +
      S('M-70 70 Q-78 130 -72 200 M70 70 Q78 130 72 200', '#c94b83', 2.5, 'opacity=".35"');
    s += S('M-62 -14 C-56 -40 -40 -54 -22 -56 M-22 -56 C-12 -44 -2 -38 6 -34 M6 -34 C20 -40 30 -52 28 -66 M28 -66 C44 -58 56 -44 62 -16', '#b8467a', 9, 'opacity=".16"') +
      S('M-40 -100 Q-52 -78 -58 -50 M-18 -106 Q-30 -80 -34 -56 M8 -108 Q0 -82 2 -58 M34 -100 Q36 -78 30 -56 M54 -88 Q60 -66 58 -40', '#ff8fbd', 2.6, 'opacity=".55"') +
      S('M-26 -100 Q-38 -76 -42 -54 M20 -104 Q18 -80 16 -60 M44 -94 Q50 -72 46 -50', '#fff', 1.6, 'opacity=".5"') +
      S('M-80 -40 Q-96 -56 -90 -78 M78 -44 Q98 -52 94 -80 M-30 -108 Q-40 -126 -28 -134', '#ff98c3', 2, 'opacity=".8"') +
      S('M-72 100 Q-80 150 -72 200 M72 100 Q80 150 72 200', '#fff', 2.2, 'opacity=".35"') +
      S('M-76 30 Q-84 90 -78 150 M76 30 Q84 90 78 150', '#7a2450', 3, 'opacity=".25"');
    s += C(46, -64, 6.5, '#ffd54a', 'stroke="#e0a61a" stroke-width="2"') + C(46, -64, 2.4, '#fff');
    s += accessory(o.acc);
    return s;
  }

  function boy(mood) {
    const W = '#fdfdff', WL = 'stroke="#aeb4c6" stroke-width="2.2" stroke-linejoin="round"';
    let s = '';
    s += '<g transform="translate(0 -20)">';
    s += P('M-108 340 C-108 210 -82 144 -22 126 L22 126 C82 144 108 210 108 340Z', W, WL);
    // 手臂：左手叉腰、右手自然下垂（短袖襯衫）
    s += arm('M-86 152 Q-122 190 -118 226', W, 38) + arm('M-118 226 Q-112 262 -62 276', 'url(#gSkin)', 22) + hand(-58, 276, .95);
    s += arm('M86 152 Q112 220 110 262', W, 38) + arm('M110 262 L108 330', 'url(#gSkin)', 22) + hand(108, 336, .95);
    s += P('M-86 138 L-122 214 L-98 226 L-70 150Z M86 138 L118 214 L94 226 L70 150Z', W, WL) ;
    s += P('M-15 62 L15 62 L16 134 L-16 134Z', '#f3c2a6') + P('M-15 62 L15 62 L15 86 Q0 100 -15 86Z', '#000', 'opacity=".12"');
    s += P('M-24 126 L0 170 L24 126 Q0 138 -24 126Z', '#f3c2a6');
    s += P('M-26 122 L-6 168 L-46 178 L-62 144Z M26 122 L6 168 L46 178 L62 144Z', W, WL);
    s += P('M-9 168 L9 168 L12 184 L-12 184Z', '#20202a') + P('M-12 184 L12 184 L19 318 L2 338 L-17 318Z', '#2a2a35') + S('M-5 200 L-9 300', '#fff', 1.4, 'opacity=".12"');
    s += P('M-66 -6 C-80 -84 -40 -112 0 -112 C40 -112 80 -84 66 -6 L62 40 L-62 40Z', 'url(#gHairB)', LINE);
    s += P('M-100 340 C-100 212 -78 148 -20 128 L20 128 C78 148 100 212 100 340Z', 'url(#gShade)', 'opacity=".4"') + S('M-60 200 Q-40 250 -52 330 M60 200 Q44 250 52 330 M-20 250 Q-16 300 -22 336 M26 240 Q30 290 24 336', '#7a8098', 2.6, 'opacity=".28"');
    s += S('M-70 160 Q-60 190 -66 230 M70 160 Q60 190 66 230 M-30 190 Q-34 230 -30 280 M32 196 Q36 236 30 286 M-52 150 Q-30 140 -20 150', '#8c93ad', 1.8, 'opacity=".4"') +
      P('M-9 168 L9 168 L12 184 L-12 184Z', '#fff', 'opacity=".12"') + S('M-8 214 L10 218 M-9 244 L11 248 M-10 274 L12 278', '#fff', 2, 'opacity=".18"') +
      C(-2, 150, 1.8, '#c4cadb') + C(-2, 164, 1.8, '#c4cadb') + P('M-100 340 C-100 212 -78 148 -20 128 L20 128 C78 148 100 212 100 340Z', 'url(#gCloth)', 'opacity=".6"');
    s += '</g>';
    s += E(-56, 6, 7, 13, '#ffd9c4', LINE) + E(56, 6, 7, 13, '#ffd9c4', LINE) + S('M-57 0 q-3 6 0 12 M57 0 q3 6 0 12', '#e49a86', 1.6, 'opacity=".6"');
    s += P(FACE_B, 'url(#gSkin)', LINE) + P(FACE_B, 'url(#gFaceShade)') + S('M-40 62 Q0 82 40 62', '#b9806a', 2, 'opacity=".25"');
    s += face(mood, 'boy');
    s += P('M-62 -6 C-74 -70 -40 -104 -6 -106 L-12 -130 L12 -108 L30 -128 L34 -102 L60 -114 L52 -86 C70 -66 66 -30 62 -6 C58 -30 52 -46 38 -56 C34 -40 16 -44 8 -56 C0 -40 -20 -44 -30 -54 C-42 -40 -52 -30 -62 -6Z', 'url(#gHairB)', LINE) +
      P('M-34 -100 Q-6 -112 28 -102', 'none', 'stroke="#fff" stroke-opacity=".35" stroke-width="5" stroke-linecap="round"') +
      S('M-44 -86 Q-52 -50 -56 -20 M-14 -100 Q-24 -70 -30 -50 M16 -102 Q8 -76 6 -58 M44 -96 Q54 -70 58 -34', '#6a74b0', 2.4, 'opacity=".6"') + S('M-50 -60 Q-30 -86 6 -90', '#9aa8ff', 3, 'opacity=".45"') +
      S('M-36 -96 Q-48 -70 -50 -44 M0 -104 Q-10 -80 -12 -58 M26 -102 Q30 -80 24 -60 M50 -86 Q60 -62 56 -40', '#fff', 1.6, 'opacity=".28"') +
      S('M-56 -60 Q-62 -86 -42 -100 M40 -100 Q62 -92 62 -62', '#8a94d8', 2, 'opacity=".5"') +
      S('M-30 -54 Q-20 -40 -8 -56 M8 -56 Q22 -40 34 -54', '#16141f', 3, 'opacity=".2"') +
      P('M-62 -6 C-64 24 -60 50 -54 60 C-54 36 -54 14 -52 -4Z', 'url(#gHairB)') + P('M62 -6 C64 24 60 50 54 60 C54 36 54 14 52 -4Z', 'url(#gHairB)');
    return s;
  }

  /* ---------- 場景 ---------- */
  const win = (x, y, w, h, sky) => R(x, y, w, h, sky || '#bfe6ff', 'rx="6" stroke="#fff" stroke-width="6"') + R(x + w / 2 - 2, y, 4, h, '#fff') + R(x, y + h / 2 - 2, w, 4, '#fff');
  const floorBase = (y, c1, c2) => `<linearGradient id="fl${y}${c1.slice(1)}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>` + R(0, y, 960, 540 - y, `url(#fl${y}${c1.slice(1)})`);
  const bgGrad = (id, a, b) => `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
  const lamp = (x, y, c) => S(`M${x} 0 V${y}`, '#444', 2) + P(`M${x - 22} ${y + 26} Q${x} ${y - 6} ${x + 22} ${y + 26}Z`, c) + E(x, y + 30, 20, 6, '#fff7c2', 'opacity=".8"');

  const SCENES = {
    home() {
      return bgGrad('bgh', '#fbf3e4', '#f3e6cf') + R(0, 0, 960, 540, 'url(#bgh)') + R(0, 400, 960, 140, '#c9a97c') +
        S('M0 420 H960 M0 460 H960 M0 500 H960', '#b58f62', 2) +
        R(30, 90, 120, 320, '#f2eee4', 'stroke="#d8cfbf" stroke-width="4"') + [0, 1, 2, 3].map(i => R(38, 100 + i * 78, 104, 6, '#d8cfbf') + [0, 1, 2, 3, 4].map(j => R(44 + j * 20, 70 + 100 + i * 78 - 60 + 14, 14, 52, ['#e8788a', '#6fb7d8', '#f2c14e', '#8cc084', '#b79be0'][(i + j) % 5])).join('')).join('') +
        win(440, 70, 190, 150, '#cdeeff') + P('M430 60 H470 L480 240 H430Z M640 60 H600 L590 240 H640Z', '#f7a8b8', 'opacity=".85"') +
        R(640, 70, 210, 130, '#d84a43', 'rx="6" stroke="#fff" stroke-width="8"') + C(745, 135, 36, '#f6a041') + C(710, 105, 14, '#f6a041') + C(780, 160, 16, '#f6a041') +
        E(100, 420, 36, 14, '#8bbf7a') + P('M70 410 q-16 -50 14 -60 q6 30 10 60Z M100 410 q10 -60 40 -64 q-10 36 -22 64Z', '#4f9b63') +
        R(0, 400, 960, 8, '#e4d3b4') + R(40, 380, 220, 20, '#d9c4a0') + E(480, 470, 380, 34, '#9ad2c4', 'opacity=".6"');
    },
    conv() {
      let o = bgGrad('bgc', '#1d2a4a', '#314a78') + R(0, 0, 960, 540, 'url(#bgc)') + R(0, 380, 960, 160, '#dfe6ee') + S('M0 420 H960 M0 470 H960', '#c2ccd8', 2);
      o += R(0, 40, 960, 28, '#fff') + R(0, 40, 320, 28, '#27b24a') + R(320, 40, 100, 28, '#f26d21') + TX(160, 62, '24H 便利商店', 22, '#fff');
      for (let r = 0; r < 3; r++) { o += R(20, 110 + r * 82, 250, 10, '#9aa7b8'); for (let i = 0; i < 12; i++) o += R(28 + i * 20, 82 + r * 82, 15, 28, ['#ff6b6b', '#ffd93d', '#6bcB77', '#4d96ff', '#b983ff'][(i + r) % 5], 'rx="3"'); }
      o += R(780, 90, 160, 300, '#eaf3fb', 'stroke="#b8c8d8" stroke-width="5"') + R(790, 100, 140, 280, '#cfe2f3') + R(850, 100, 4, 280, '#b8c8d8');
      for (let r = 0; r < 4; r++) for (let i = 0; i < 4; i++) o += R(796 + i * 34, 110 + r * 68, 26, 50, ['#ff8fa3', '#fff1a8', '#a8e6cf', '#a8d8ff'][(i + r) % 4], 'rx="3"');
      return o + R(380, 330, 200, 50, '#f2f2f2', 'stroke="#c8c8c8" stroke-width="3"') + R(380, 330, 200, 12, '#27b24a');
    },
    breakfast() {
      let o = bgGrad('bgb', '#ffe9c7', '#ffd7a0') + R(0, 0, 960, 540, 'url(#bgb)') + R(0, 400, 960, 140, '#b87a4a') + R(0, 396, 960, 14, '#8a5630');
      o += R(60, 60, 280, 110, '#2c3a34', 'rx="6" stroke="#8a5630" stroke-width="6"') + TX(200, 105, '今日菜單', 20, '#fff') + TX(200, 135, '蛋餅 30　奶茶 25', 18, '#ffe9a8') + TX(200, 158, '漢堡 45　薯餅 20', 18, '#ffe9a8');
      o += R(520, 120, 380, 110, '#d9dde2', 'rx="6"') + R(540, 140, 340, 70, '#bfc5cc', 'rx="6"');
      for (let i = 0; i < 4; i++) o += `<g opacity=".7">${S(`M${590 + i * 85} 130 q-14 -20 0 -34 q14 -14 0 -30`, '#fff', 5)}</g>`;
      return o + E(640, 410, 44, 14, '#f5d482') + E(760, 410, 40, 12, '#f5d482') + C(850, 392, 22, '#e8785a') + E(180, 420, 70, 10, '#8a5630', 'opacity=".4"');
    },
    busstop() {
      let o = bgGrad('bgbs', '#9fb4c6', '#d3dde5') + R(0, 0, 960, 540, 'url(#bgbs)') + R(0, 410, 960, 130, '#4d5560') + R(0, 400, 960, 14, '#aab3bd') + S('M0 475 H960', '#fff', 5, 'stroke-dasharray="40 30"');
      o += R(60, 80, 12, 330, '#6c7885') + R(30, 70, 72, 70, '#2f6fbd', 'rx="8"') + TX(66, 98, '15', 26, '#fff') + TX(66, 126, '公車站', 14, '#fff');
      o += R(540, 60, 360, 14, '#6c7885') + R(540, 74, 8, 340, '#6c7885') + R(892, 74, 8, 340, '#6c7885') + R(548, 74, 344, 170, '#cfe9ff', 'opacity=".35"') + R(560, 390, 320, 14, '#8a5630');
      for (let i = 0; i < 60; i++) { const x = rnd() * 960, y = rnd() * 400; o += S(`M${x} ${y} l-8 22`, '#fff', 1.6, 'opacity=".6"'); }
      return o + E(300, 540, 500, 28, '#fff', 'opacity=".12"');
    },
    cafe() {
      let o = bgGrad('bgcf', '#7d5238', '#5a3a28') + R(0, 0, 960, 540, 'url(#bgcf)') + R(0, 410, 960, 130, '#3e271b');
      o += win(80, 70, 240, 200, '#bfe6c4') + P('M90 270 q10 -80 40 -60 q-6 40 -4 60Z M250 270 q14 -70 50 -44 q-14 30 -10 44Z', '#3f8f4f');
      o += lamp(480, 60, '#ffcb6b') + lamp(660, 90, '#ffcb6b') + lamp(840, 50, '#ffcb6b');
      o += R(380, 300, 560, 110, '#8a5a3a') + R(380, 296, 560, 12, '#c98f5e');
      for (let i = 0; i < 6; i++) o += R(400 + i * 85, 250 + (i % 2) * 6, 26, 46, ['#fff', '#ffd9c4', '#fff', '#c4e6ff', '#fff', '#ffd9c4'][i], 'rx="5"') + E(413 + i * 85, 252 + (i % 2) * 6, 13, 4, '#6b3b1b');
      return o + R(40, 320, 120, 14, '#c98f5e') + R(60, 334, 10, 76, '#c98f5e') + R(130, 334, 10, 76, '#c98f5e') + TX(700, 190, 'COFFEE', 26, '#ffcb6b');
    },
    cinema() {
      let o = bgGrad('bgcn', '#3a0f1a', '#1b0610') + R(0, 0, 960, 540, 'url(#bgcn)') + R(160, 60, 640, 230, '#e8eef8', 'rx="6"') + R(176, 74, 608, 202, '#6fb1e6') + P('M176 276 L400 160 L520 230 L640 140 L784 276Z', '#3b6e8f') + C(660, 120, 28, '#ffe27a');
      o += P('M0 0 H150 Q130 280 90 540 H0Z M960 0 H810 Q830 280 870 540 H960Z', '#a1182e') + S('M40 0 Q30 270 20 540 M90 0 Q80 270 60 540 M920 0 Q930 270 940 540 M870 0 Q880 270 900 540', '#7c1223', 4);
      for (let r = 0; r < 3; r++) for (let i = 0; i < 12; i++) o += E(80 + i * 72, 420 + r * 40, 30, 24 + r * 3, '#5c1624') + R(52 + i * 72, 430 + r * 40, 56, 30, '#701a2b', 'rx="8"');
      return o;
    },
    mall() {
      let o = bgGrad('bgm', '#fff6ee', '#ffe3d6') + R(0, 0, 960, 540, 'url(#bgm)') + R(0, 410, 960, 130, '#f0d9c8') + S('M0 450 H960', '#e5c9b4', 3);
      o += R(40, 70, 260, 280, '#fff', 'stroke="#f2c3a8" stroke-width="5"') + R(40, 70, 260, 50, '#ff6b6b') + TX(170, 106, '週年慶 SALE', 26, '#fff');
      for (let i = 0; i < 4; i++) o += R(60 + i * 58, 140, 44, 140, ['#ffd6e0', '#c7ecee', '#fff3b0', '#e0c3fc'][i], 'rx="4"') + C(82 + i * 58, 160, 14, '#f7c8a8');
      o += P('M520 80 L930 330 L930 370 L520 130Z', '#e9eef5', 'stroke="#c9d3df" stroke-width="3"');
      for (let i = 0; i < 10; i++) o += S(`M${540 + i * 40} ${100 + i * 24} l20 12`, '#c9d3df', 3);
      for (let i = 0; i < 6; i++) o += R(310 + i * 30, 60 + (i % 2) * 8, 18, 40, ['#ff6b6b', '#ffd93d', '#6bcB77', '#4d96ff', '#ff9ff3', '#ffa94d'][i], 'rx="4"');
      return o + lamp(420, 24, '#fff2b8') + lamp(620, 34, '#fff2b8');
    },
    nightmarket() {
      let o = bgGrad('bgn', '#1f1b3a', '#4a2c5e') + R(0, 0, 960, 540, 'url(#bgn)') + R(0, 420, 960, 120, '#2d2540');
      for (let i = 0; i < 16; i++) o += S(`M${i * 64} 36 Q${i * 64 + 32} 62 ${i * 64 + 64} 36`, '#ffd27d', 2) + C(i * 64 + 32, 64, 10, ['#ff5f6d', '#ffd166', '#06d6a0', '#ff9f1c'][i % 4]) + C(i * 64 + 32, 64, 22, '#ffd27d', 'opacity=".12"');
      o += R(40, 190, 300, 220, '#4b3a66') + P('M20 190 L360 190 L330 130 L50 130Z', '#ff5f6d') + [0, 1, 2, 3, 4].map(i => P(`M${50 + i * 56} 130 h56 v60 h-56Z`, i % 2 ? '#fff' : '#ff5f6d', 'opacity=".85"')).join('') + TX(190, 168, '炸雞排', 24, '#fff') + R(60, 300, 260, 12, '#c98f5e');
      o += R(560, 200, 360, 210, '#3a4a6b') + P('M540 200 L940 200 L910 140 L570 140Z', '#ffd166') + TX(740, 178, '手搖飲', 24, '#7a3e00') + R(580, 310, 320, 12, '#c98f5e');
      for (let i = 0; i < 5; i++) o += R(596 + i * 60, 270, 28, 40, ['#f4d6a6', '#d9a066', '#fff', '#ffd9c4', '#e6b8ff'][i], 'rx="5"');
      return o;
    },
    restaurant() {
      let o = bgGrad('bgr', '#1c1a33', '#33264a') + R(0, 0, 960, 540, 'url(#bgr)') + R(0, 420, 960, 120, '#2a1d26');
      o += R(90, 60, 360, 240, '#101a33', 'rx="8" stroke="#6b5b3a" stroke-width="8"');
      for (let i = 0; i < 28; i++) o += R(100 + rnd() * 340, 120 + rnd() * 170, 6 + rnd() * 14, 20 + rnd() * 120, '#ffd27d', 'opacity=".55"');
      for (let i = 0; i < 10; i++) o += C(110 + rnd() * 330, 70 + rnd() * 60, 1.6, '#fff');
      o += lamp(620, 56, '#e8b45f') + lamp(840, 50, '#e8b45f');
      o += R(360, 360, 260, 18, '#f6efe3') + R(380, 378, 18, 80, '#6b5b3a') + R(580, 378, 18, 80, '#6b5b3a');
      o += R(480, 316, 10, 46, '#fff3d0') + P('M485 296 q-8 14 0 20 q8 -6 0 -20Z', '#ffb02e') + C(485, 308, 24, '#ffd27d', 'opacity=".25"');
      return o + E(400, 358, 26, 6, '#fff') + C(400, 352, 8, '#e84a5f');
    },
    park() {
      let o = bgGrad('bgp', '#8fd3ff', '#e3f6ff') + R(0, 0, 960, 540, 'url(#bgp)') + P('M0 380 Q240 320 480 380 T960 370 V540 H0Z', '#8fd18a') + P('M0 430 Q300 400 600 430 T960 420 V540 H0Z', '#6fbf6a');
      for (const [x, y, s] of [[110, 130, 1], [520, 90, .8], [820, 160, 1.1]]) o += `<g transform="translate(${x} ${y}) scale(${s})" opacity=".95">${E(0, 0, 50, 22, '#fff')}${E(30, -10, 34, 20, '#fff')}${E(-28, -6, 30, 18, '#fff')}</g>`;
      for (const [x, s] of [[70, 1.15], [900, 1.3], [470, .8]]) o += `<g transform="translate(${x} 400) scale(${s})">${R(-10, -120, 20, 120, '#8a5a3a')}${C(0, -150, 62, '#3f9a52')}${C(-34, -124, 38, '#4aae5e')}${C(36, -128, 40, '#35893f')}</g>`;
      o += S('M0 470 Q480 440 960 480', '#e8d9b0', 40, 'opacity=".7"') + R(600, 394, 150, 12, '#8a5a3a') + R(612, 406, 10, 38, '#6b4429') + R(728, 406, 10, 38, '#6b4429');
      return o;
    },
    amusement() {
      let o = bgGrad('bgam', '#7cc7ff', '#ffe6f0') + R(0, 0, 960, 540, 'url(#bgam)') + R(0, 430, 960, 110, '#7fcf86');
      o += `<g transform="translate(180 230)">${C(0, 0, 150, 'none', 'stroke="#ff7aa8" stroke-width="8"')}${C(0, 0, 8, '#ff7aa8')}${Array.from({ length: 8 }, (_, i) => { const a = i * Math.PI / 4; return S(`M0 0 L${Math.cos(a) * 150} ${Math.sin(a) * 150}`, '#ff7aa8', 4) + `<rect x="${Math.cos(a) * 150 - 14}" y="${Math.sin(a) * 150 - 10}" width="28" height="22" rx="6" fill="${['#ffd93d', '#6bcB77', '#4d96ff', '#ff9ff3'][i % 4]}"/>`; }).join('')}${P('M-60 220 L0 0 L60 220', 'none', 'stroke="#ff7aa8" stroke-width="8"')}</g>`;
      o += S('M480 430 Q520 160 600 180 T700 420 T800 220 T930 430', '#e8505b', 9) + S('M480 430 V440 M700 420 V440 M930 430 V440', '#e8505b', 9);
      for (let i = 0; i < 6; i++) o += C(560 + i * 62, 120 + (i % 3) * 22, 20, ['#ff5f6d', '#ffd166', '#06d6a0', '#4d96ff', '#ff9ff3', '#ffa94d'][i]) + S(`M${560 + i * 62} ${140 + (i % 3) * 22} q-6 40 6 90`, '#fff', 2, 'opacity=".7"');
      return o;
    },
    beach() {
      let o = bgGrad('bgbc', '#6cc7ff', '#d7f1ff') + R(0, 0, 960, 540, 'url(#bgbc)') + C(800, 100, 52, '#ffe066') + C(800, 100, 80, '#fff2a0', 'opacity=".3"');
      o += R(0, 250, 960, 130, '#2aa7d8') + P('M0 250 Q80 236 160 250 T320 250 T480 250 T640 250 T800 250 T960 250 V270 H0Z', '#7fd6f2') + P('M0 380 Q240 350 480 380 T960 372 V540 H0Z', '#f3dcae');
      o += P('M60 380 Q200 300 340 380Z', '#ff6b6b') + S('M200 330 V460', '#8a5a3a', 6) + S('M60 380 Q200 300 340 380', '#fff', 4, 'stroke-dasharray="36 14"') + E(210, 462, 50, 8, '#000', 'opacity=".1"');
      o += P('M880 380 q10 -60 60 -50 M900 380 q-20 -50 -60 -40', '#3f9a52', 'stroke="#2c7a3d" stroke-width="2"');
      return o + E(500, 440, 12, 8, '#ffd0c0') + P('M560 470 l14 -22 l14 22Z', '#ff9ff3');
    },
    library() {
      let o = bgGrad('bgl', '#e6d3b3', '#c9a778') + R(0, 0, 960, 540, 'url(#bgl)') + R(0, 410, 960, 130, '#8a5a3a');
      for (const x of [20, 340, 660]) { o += R(x, 50, 280, 360, '#a2713f', 'stroke="#6b4429" stroke-width="5"'); for (let r = 0; r < 4; r++) { o += R(x + 8, 120 + r * 72 - 8, 264, 7, '#6b4429'); for (let i = 0; i < 14; i++) o += R(x + 12 + i * 18, 62 + r * 72 + (i % 3) * 3, 14, 56 - (i % 3) * 3, ['#c0392b', '#2e86c1', '#27ae60', '#f1c40f', '#8e44ad', '#e67e22', '#16a085'][(i + r * 3 + x) % 7]); } }
      return o + lamp(470, 40, '#7fb26a') + R(350, 380, 260, 14, '#c98f5e') + R(430, 340, 60, 40, '#3b6e8f') + R(500, 346, 50, 34, '#c0392b');
    },
    office() {
      let o = bgGrad('bgo', '#10183a', '#2a3b6e') + R(0, 0, 960, 540, 'url(#bgo)') + R(0, 410, 960, 130, '#b8bfcc') + S('M0 450 H960', '#a3abba', 3);
      for (let i = 0; i < 20; i++) { const x = i * 50, h = 90 + rnd() * 190; o += R(x, 400 - h, 44, h, '#1c2550'); for (let j = 0; j < h / 24; j++) if (rnd() > .35) o += R(x + 6, 400 - h + 8 + j * 24, 10, 12, '#ffe27a', 'opacity=".8"') + R(x + 26, 400 - h + 8 + j * 24, 10, 12, '#ffe27a', 'opacity=".5"'); }
      o += R(0, 380, 960, 30, '#8e97a8') + R(60, 40, 380, 50, '#2f3a58', 'rx="8"') + TX(250, 76, 'CHASE 辦公大樓', 26, '#fff') + R(520, 110, 14, 300, '#d3d9e4') + R(780, 110, 14, 300, '#d3d9e4') + R(534, 110, 246, 300, '#cfe5ff', 'opacity=".25"');
      return o + R(40, 340, 90, 70, '#6b7384') + R(50, 310, 70, 30, '#0d1226') + R(56, 316, 58, 18, '#6fb1e6');
    },
    supermarket() {
      let o = bgGrad('bgs', '#fffdf2', '#fff2d2') + R(0, 0, 960, 540, 'url(#bgs)') + R(0, 410, 960, 130, '#e9dfc7') + S('M0 450 H960 M0 490 H960', '#d6caac', 2);
      for (const x of [20, 560]) { o += R(x, 90, 380, 320, '#d9d9e0', 'stroke="#b6b6c2" stroke-width="4"'); for (let r = 0; r < 4; r++) { o += R(x + 6, 150 + r * 66, 368, 6, '#9a9aa8'); for (let i = 0; i < 12; i++) o += R(x + 12 + i * 30, 104 + r * 66 + (i % 2) * 4, 22, 44 - (i % 2) * 4, ['#ff6b6b', '#ffd93d', '#6bcB77', '#4d96ff', '#ff9ff3', '#ffa94d'][(i + r * 2) % 6], 'rx="4"'); } }
      o += R(0, 0, 960, 26, '#ff6b6b') + TX(480, 20, '特價 雞蛋 限量搶購', 18, '#fff');
      return o + P('M390 340 H470 L490 400 H400Z', 'none', 'stroke="#555" stroke-width="5"') + C(412, 420, 8, '#444') + C(480, 420, 8, '#444') + S('M390 340 L370 320', '#555', 5);
    },
    station() {
      let o = bgGrad('bgst', '#0e1230', '#273a68') + R(0, 0, 960, 540, 'url(#bgst)') + R(0, 400, 960, 140, '#4c5668') + R(0, 410, 960, 12, '#f2c14e');
      o += R(0, 250, 960, 110, '#c9d2e0', 'stroke="#8c97ab" stroke-width="4"');
      for (let i = 0; i < 9; i++) o += R(30 + i * 106, 270, 84, 56, '#ffe9a8', 'rx="6"') + R(30 + i * 106, 270, 84, 8, '#6fb1e6');
      o += R(0, 360, 960, 20, '#8c97ab') + R(100, 40, 14, 220, '#9aa7b8') + R(860, 40, 14, 220, '#9aa7b8') + C(480, 90, 46, '#fff', 'stroke="#555" stroke-width="6"') + S('M480 90 V58 M480 90 L500 100', '#333', 4);
      for (let i = 0; i < 40; i++) o += C(rnd() * 960, rnd() * 160, 1.4, '#fff', 'opacity=".7"');
      return o;
    },
    party() {
      let o = bgGrad('bgpt', '#ffe3f1', '#d8f0ff') + R(0, 0, 960, 540, 'url(#bgpt)') + R(0, 420, 960, 120, '#f7d8b0');
      o += S('M0 40 Q240 110 480 40 T960 40', '#ff5f93', 6) + Array.from({ length: 14 }, (_, i) => P(`M${i * 70 + 10} ${52 + Math.sin(i) * 16} l22 0 l-11 30Z`, ['#ffd93d', '#6bcB77', '#4d96ff', '#ff9ff3'][i % 4])).join('');
      for (let i = 0; i < 9; i++) { const x = 40 + i * 110; o += E(x, 140 + (i % 3) * 36, 26, 32, ['#ff5f6d', '#ffd166', '#06d6a0', '#4d96ff', '#ff9ff3'][i % 5]) + S(`M${x} ${172 + (i % 3) * 36} q-8 60 6 110`, '#fff', 2, 'opacity=".7"'); }
      for (let i = 0; i < 50; i++) o += R(rnd() * 960, rnd() * 420, 8, 4, ['#ff5f6d', '#ffd166', '#06d6a0', '#4d96ff'][i % 4], `transform="rotate(${rnd() * 360} 0 0)"`);
      return o + R(380, 340, 200, 80, '#f6efe3') + E(480, 340, 100, 14, '#ffb3d1') + R(440, 292, 80, 48, '#fff', 'rx="6"') + E(480, 292, 40, 8, '#ff7aa8') + R(477, 262, 6, 30, '#fff3d0') + P('M480 248 q-6 10 0 14 q6 -4 0 -14Z', '#ffb02e');
    },
    onsen() {
      let o = bgGrad('bgon', '#f3e3c5', '#e6cfa0') + R(0, 0, 960, 540, 'url(#bgon)') + R(0, 410, 960, 130, '#b8c78a');
      for (let i = 0; i < 12; i++) o += S(`M${i * 80} 410 V540`, '#a2b273', 2);
      o += R(60, 50, 360, 300, '#fffdf4', 'stroke="#8a5a3a" stroke-width="8"') + S('M180 50 V350 M300 50 V350 M60 200 H420', '#8a5a3a', 4);
      o += R(520, 70, 340, 240, '#9bd0ff', 'stroke="#8a5a3a" stroke-width="10"') + P('M520 310 L640 160 L720 240 L790 150 L860 310Z', '#4f8a6b') + P('M640 160 L610 200 L660 196Z M790 150 L765 190 L812 186Z', '#fff') + C(560, 110, 24, '#fff6c8');
      return o + lamp(470, 40, '#ff8a5c') + E(150, 440, 60, 12, '#000', 'opacity=".08"') + R(100, 410, 90, 44, '#b8864f');
    },
    concert() {
      let o = bgGrad('bgcc', '#0b0720', '#2b1050') + R(0, 0, 960, 540, 'url(#bgcc)');
      for (const [x, c] of [[160, '#ff5fa2'], [380, '#5fd4ff'], [600, '#ffd35f'], [820, '#b36bff']]) o += P(`M${x} 0 L${x - 140} 420 L${x + 140} 420Z`, c, 'opacity=".22"') + C(x, 6, 14, c);
      o += R(120, 170, 720, 120, '#1a1236', 'rx="6"') + R(120, 170, 720, 8, '#ff5fa2') + TX(480, 250, '★ LIVE 2026 ★', 46, '#ffe27a');
      for (let i = 0; i < 46; i++) { const x = 10 + i * 21, y = 440 + (i % 3) * 14; o += E(x, y + 40, 18, 30, '#05030f') + C(x, y, 12, '#05030f') + (i % 4 === 0 ? R(x + 6, y - 44, 5, 44, ['#ff5fa2', '#5fd4ff', '#ffd35f'][i % 3], 'rx="2"') : ''); }
      return o;
    },
    rooftop() {
      let o = bgGrad('bgrt', '#0a0f35', '#3a2a6b') + R(0, 0, 960, 540, 'url(#bgrt)');
      for (let i = 0; i < 90; i++) o += C(rnd() * 960, rnd() * 330, rnd() * 1.8 + .6, '#fff', `opacity="${.5 + rnd() * .5}"`);
      o += C(130, 100, 34, '#fff6c8') + C(145, 92, 30, '#0a0f35', 'opacity=".0"') + P('M0 420 L0 340 L50 340 L50 290 L110 290 L110 360 L170 360 L170 310 L230 310 L230 380 L300 380 L300 330 L360 330 L360 400 L440 400 L440 300 L500 300 L500 370 L580 370 L580 320 L650 320 L650 390 L720 390 L720 340 L790 340 L790 300 L860 300 L860 370 L960 370 V420Z', '#14183f');
      for (let i = 0; i < 40; i++) o += R(rnd() * 940, 300 + rnd() * 100, 6, 8, '#ffe27a', 'opacity=".7"');
      o += R(0, 410, 960, 130, '#3b3555') + R(0, 400, 960, 12, '#6e6890') + S('M0 400 H960', '#cfc9ef', 4);
      for (let i = 0; i < 25; i++) o += R(i * 40, 330, 5, 70, '#cfc9ef');
      o += S('M0 80 Q120 150 240 80 T480 80 T720 80 T960 80', '#ffe27a', 2);
      for (let i = 0; i < 17; i++) o += C(i * 60, 100 + (i % 2) * 38 - 30, 7, '#ffe27a') + C(i * 60, 100 + (i % 2) * 38 - 30, 18, '#ffe27a', 'opacity=".15"');
      return o;
    },
  };

  /* ---------- 女主角的場景服裝 ---------- */
  const OUTFITS = {
    home: { kind: 'pajama', c1: '#cdb8f5' }, conv: { kind: 'hoodie', c1: '#f2b660' }, breakfast: { kind: 'sweater', c1: '#f7e3bd' },
    busstop: { kind: 'coat', c1: '#f4cf4a', c2: '#e8505b' }, cafe: { kind: 'dress' }, cinema: { kind: 'dress', c1: '#c7a6f0', c2: '#fff' },
    mall: { kind: 'dress', c1: '#ff9a8a', c2: '#fff1c9' }, nightmarket: { kind: 'hoodie', c1: '#7ad0a8' }, restaurant: { kind: 'formal', c1: '#25254b', c2: '#fff' },
    park: { kind: 'sweater', c1: '#a7dca0' }, amusement: { kind: 'hoodie', c1: '#ff9fb3', acc: 'headband' }, beach: { kind: 'swim', c1: '#ff7f9e' },
    library: { kind: 'sweater', c1: '#b4c8f0', acc: 'glasses' }, office: { kind: 'blouse', c1: '#e8ecf6', c2: '#d8283f' }, supermarket: { kind: 'dress', c1: '#ffd166', c2: '#fff' },
    station: { kind: 'coat', c1: '#3b4a7a', c2: '#ff9a3c' }, party: { kind: 'dress', c1: '#ff9cc2', c2: '#fff', acc: 'partyhat' }, onsen: { kind: 'yukata', c1: '#5aa9e6', c2: '#f4a8c3', acc: 'flower' },
    concert: { kind: 'tee', c1: '#ffffff', c2: '#ff5fa2', acc: 'headband' }, rooftop: { kind: 'formal', c1: '#c2185b', c2: '#ffe7f0', acc: 'tiara' },
  };

  // 立繪圖片：以頭部中心為原點、約 340 寬 × 480 高，可在 js/sprites.js 指定
  const sprite = (u) => `<image href="${u}" x="-170" y="-130" width="340" height="480" preserveAspectRatio="xMidYMin meet"/>`;
  G.Art = {
    defs: DEFS,
    scene: (k) => { seed = 7; return (SCENES[k] || SCENES.home)(); },
    girl: (mood, scene) => (G.SPRITES && G.SPRITES.girl && G.SPRITES.girl[mood]) ? sprite(G.SPRITES.girl[mood]) : girl(mood, OUTFITS[scene] || OUTFITS.cafe),
    boy: (mood) => (G.SPRITES && G.SPRITES.boy && G.SPRITES.boy[mood]) ? sprite(G.SPRITES.boy[mood]) : boy(mood),
    outfits: OUTFITS,
    scenes: Object.keys(SCENES),
  };
})(window.GAME = window.GAME || {});
