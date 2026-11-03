/* 美術加強：場景細節道具、環境動畫、光影、情緒特效（全部為向量 SVG＋CSS 動畫） */
(function (G) {
  'use strict';
  const R = (x, y, w, h, f, o) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f}" ${o || ''}/>`;
  const C = (x, y, r, f, o) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}" ${o || ''}/>`;
  const E = (x, y, rx, ry, f, o) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${f}" ${o || ''}/>`;
  const P = (d, f, o) => `<path d="${d}" fill="${f}" ${o || ''}/>`;
  const S = (d, c, w, o) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${o || ''}/>`;
  const TX = (x, y, t, size, f, o) => `<text x="${x}" y="${y}" font-size="${size}" fill="${f}" font-weight="700" text-anchor="middle" font-family="'Noto Sans TC','PingFang TC','Microsoft JhengHei',sans-serif" ${o || ''}>${t}</text>`;
  let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const dl = (i, n) => `style="animation-delay:${(-(i * 0.73) % (n || 4)).toFixed(2)}s"`;
  const twk = (n, x0, x1, y0, y1, c, rmax) => Array.from({ length: n }, (_, i) => C(x0 + rnd() * (x1 - x0), y0 + rnd() * (y1 - y0), 1 + rnd() * (rmax || 2), c || '#fff', `class="twk" ${dl(i)}`)).join('');
  const steam = (x, y, n, c) => Array.from({ length: n || 3 }, (_, i) => S(`M${x + i * 14} ${y} q-8 -14 0 -28 q8 -14 0 -28`, c || '#fff', 4, `class="steam" opacity=".6" ${dl(i, 3)}`)).join('');
  const fall = (n, cols, w, h) => Array.from({ length: n }, (_, i) => R(rnd() * 940, -20, w || 8, h || 4, cols[i % cols.length], `class="fall" style="animation-duration:${6 + rnd() * 6}s;animation-delay:${-rnd() * 10}s"`)).join('');
  const beam = (pts, c, o) => P(`M${pts}Z`, c, `opacity="${o || .18}" class="pulse"`);
  const heart = (x, y, s, c) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 8 C-14 -4 -8 -16 0 -8 C8 -16 14 -4 0 8Z" fill="${c || '#ff6f9c'}"/>`;
  const spark = (x, y, s, c) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 -10 L2.4 -2.4 L10 0 L2.4 2.4 L0 10 L-2.4 2.4 L-10 0 L-2.4 -2.4Z" fill="${c || '#fff6b0'}"/>`;
  const bird = (x, y) => S(`M${x} ${y} q8 -9 16 0 q8 -9 16 0`, '#2a3a55', 2.5, 'class="bobx"');
  const glass = (x, y) => P(`M${x - 8} ${y - 26} H${x + 8} L${x + 5} ${y - 8} Q${x} ${y} ${x - 5} ${y - 8}Z`, '#fff', 'opacity=".55"') + R(x - 1, y, 2, 14, '#ffffffaa') + R(x - 8, y + 14, 16, 2, '#ffffffaa');
  const gift = (x, y, w, h, c) => R(x, y, w, h, c) + R(x + w / 2 - 3, y, 6, h, '#fff', 'opacity=".8"') + R(x, y + h / 2 - 3, w, 6, '#fff', 'opacity=".8"') + C(x + w / 2, y - 4, 6, '#fff');

  const X = {
    home: () => beam('500 70 690 70 820 420 520 420', '#fff6c8', .22) + twk(18, 480, 800, 90, 400, '#fff7d0', 2) +
      R(300, 90, 76, 76, '#fff', 'rx="38" stroke="#b58f62" stroke-width="5"') + S('M338 128 V100 M338 128 L360 138', '#5a4030', 4) +
      R(880, 250, 8, 150, '#8a6a4a') + P('M850 250 H918 L906 200 H862Z', '#ffe9a8') + E(884, 250, 34, 8, '#fff7c0', 'opacity=".7"') + E(884, 405, 26, 6, '#000', 'opacity=".15"') +
      E(470, 442, 56, 24, '#e8b878') + C(520, 432, 20, '#e8b878') + P('M512 416 l4 -14 l6 12Z M526 416 l6 -12 l4 14Z', '#e8b878') + S('M420 450 q-26 -6 -20 -26', '#e8b878', 8) + C(524, 432, 2, '#4a3020') +
      R(410, 372, 130, 12, '#a07040') + R(420, 384, 8, 30, '#8a5a30') + R(522, 384, 8, 30, '#8a5a30') + R(448, 352, 22, 20, '#fff', 'rx="4"') + steam(452, 350, 2, '#fff'),
    conv: () => R(0, 150, 960, 6, '#fff', 'opacity=".3"') + R(300, 90, 130, 40, '#ff3b5c', 'rx="8" opacity=".9"') + TX(365, 119, 'OPEN', 28, '#fff', 'class="twk"') +
      R(420, 262, 140, 70, '#c9ced6', 'rx="6"') + R(430, 272, 120, 40, '#7a4a2a') + steam(450, 270, 4, '#fff') + [0, 1, 2, 3].map(i => R(436 + i * 28, 278, 20, 26, ['#f4d6a6', '#ffd0d8', '#fff', '#d8f0b0'][i], 'rx="5"')).join('') +
      [0, 1, 2].map(i => P(`M${300 + i * 90} 150 l14 0 l-7 22Z`, ['#ffd93d', '#ff6b6b', '#6bcB77'][i])).join('') +
      R(0, 420, 960, 4, '#fff', 'opacity=".5"') + E(480, 500, 420, 20, '#fff', 'opacity=".08"') + twk(8, 780, 940, 100, 380, '#cfe8ff', 1.6),
    breakfast: () => lampRow() + R(420, 300, 90, 100, '#d9b27a', 'rx="6"') + [0, 1, 2].map(i => E(465, 312 + i * 30, 44, 12, '#e8c78e', 'stroke="#b88a4a" stroke-width="2"')).join('') + steam(450, 290, 3, '#fff') +
      E(640, 412, 52, 10, '#fff') + P('M600 406 q40 -30 80 0Z', '#f2c46a') + S('M610 400 q30 -16 60 0', '#e08a3a', 3) + C(880, 130, 30, '#fff', 'opacity=".9"') + S('M880 130 V108 M880 130 L896 138', '#444', 3) +
      P('M30 400 h70 l-8 -50 h-54Z', '#e07a5f') + twk(14, 480, 900, 100, 300, '#fff1c0', 2),
    busstop: () => E(460, 470, 120, 14, '#7fa0c0', 'opacity=".5"') + [0, 1, 2].map(i => `<ellipse cx="${400 + i * 90}" cy="${462 + i * 8}" rx="12" ry="4" fill="none" stroke="#fff" stroke-width="2" class="ripple" ${dl(i, 2)}/>`).join('') +
      R(300, 330, 150, 60, '#2b3445', 'rx="10" opacity=".8"') + [0, 1, 2, 3].map(i => R(312 + i * 34, 340, 26, 22, '#ffe9a0', 'opacity=".8"')).join('') + C(330, 392, 12, '#111') + C(420, 392, 12, '#111') +
      R(880, 120, 10, 290, '#4a5566') + C(885, 120, 22, '#ffe9a0', 'opacity=".9"') + C(885, 120, 60, '#ffe9a0', 'opacity=".12" class="pulse"') +
      P('M120 420 q10 -26 28 -26 q4 14 -4 26Z', '#7a8a9a') + S('M134 394 V380', '#555', 3) + fall(8, ['#c7a27a', '#e0b070'], 10, 6),
    cafe: () => R(60, 300, 14, 110, '#8a5a3a') + R(60, 292, 100, 12, '#c98f5e') + [0, 1].map(i => C(90 + i * 34, 280, 12, ['#6bcB77', '#ffd93d'][i])).join('') +
      R(400, 150, 260, 90, '#2c3a34', 'rx="6" stroke="#c98f5e" stroke-width="6"') + TX(530, 190, '今日特調', 22, '#fff') + TX(530, 222, '焦糖拿鐵 ♥', 20, '#ffd27d') +
      steam(450, 244, 2, '#fff') + steam(560, 240, 2, '#fff') + S('M700 60 q40 40 20 90', '#4f9b63', 6) + [0, 1, 2, 3].map(i => E(704 + i * 6, 80 + i * 18, 12, 6, '#5cb86a')).join('') + twk(16, 340, 940, 60, 300, '#ffd27d', 2),
    cinema: () => beam('480 0 380 0 150 280 810 280', '#cfe6ff', .12) + twk(22, 180, 780, 40, 290, '#fff', 1.6) +
      R(840, 40, 90, 34, '#1faa5a', 'rx="6"') + TX(885, 64, 'EXIT', 20, '#fff', 'class="twk"') +
      R(20, 340, 70, 90, '#e8eef5', 'rx="6"') + P('M20 340 q35 -50 70 0Z', '#ff5f6d') + [0, 1, 2].map(i => C(40 + i * 16, 336 - (i % 2) * 6, 8, '#fff4c0')).join('') +
      R(880, 120, 60, 90, '#552233') + P('M880 120 h60 v90 h-60Z', '#ffd27d', 'opacity=".15"'),
    mall: () => R(420, 130, 8, 280, '#d8d8e0') + E(424, 130, 40, 12, '#fff2b8', 'opacity=".7"') +
      P('M600 360 q10 -80 40 -90 q30 10 40 90Z', '#e8d9f4') + C(640, 250, 18, '#f7c8a8') + gift(700, 370, 40, 36, '#ff9ff3') + gift(750, 380, 30, 28, '#6bcB77') + gift(60, 380, 36, 30, '#ffd93d') +
      [0, 1, 2].map(i => spark(80 + i * 70, 76 + (i % 2) * 14, 1.1, '#fff6b0').replace('<path', '<path class="twk"')).join('') + R(300, 40, 360, 6, '#ff6b6b', 'opacity=".5"') +
      [0, 1, 2, 3, 4].map(i => P(`M${330 + i * 70} 46 l20 0 l-10 24Z`, ['#ff6b6b', '#ffd93d', '#6bcB77', '#4d96ff', '#ff9ff3'][i])).join('') + E(480, 470, 440, 20, '#fff', 'opacity=".25"'),
    nightmarket: () => [0, 1, 2, 3, 4].map(i => `<g class="sway" ${dl(i, 5)}>${S(`M${370 + i * 70} 70 V92`, '#ffd27d', 2)}${E(370 + i * 70, 112, 16, 22, ['#ff5f6d', '#ffd166', '#ff9f1c'][i % 3])}${E(370 + i * 70, 112, 26, 34, '#ffd27d', 'opacity=".15"')}</g>`).join('') +
      steam(190, 280, 4, '#fff') + R(380, 360, 150, 60, '#8a5a3a') + E(455, 360, 70, 14, '#4aa8d8') + [0, 1, 2, 3].map(i => E(410 + i * 28, 358, 9, 4, '#ff9f1c', 'class="bobx"')).join('') +
      [0, 1, 2].map(i => `<g class="bob" ${dl(i, 3)}>${E(850 + i * 18, 150 - i * 14, 14, 18, ['#ff5f6d', '#4d96ff', '#ffd166'][i])}${S(`M${850 + i * 18} ${168 - i * 14} V230`, '#fff', 1.5, 'opacity=".6"')}</g>`).join('') + twk(26, 20, 940, 40, 360, '#ffd27d', 2),
    restaurant: () => P('M560 40 H620 L610 70 H570Z', '#e8b45f', 'opacity=".0"') + twk(30, 80, 460, 80, 300, '#ffd27d', 2.6) +
      glass(420, 346) + glass(560, 346) + R(486, 332, 14, 28, '#2a6a4a', 'rx="3"') + [0, 1, 2].map(i => C(493 + (i - 1) * 8, 322 - (i % 2) * 6, 8, '#e84a5f')).join('') +
      P('M30 0 H110 Q80 200 60 400 H20Z', '#4a1a2e', 'opacity=".85"') + P('M930 0 H850 Q880 200 900 400 H940Z', '#4a1a2e', 'opacity=".85"') + E(480, 470, 420, 24, '#ffd27d', 'opacity=".07"'),
    park: () => [0, 1, 2].map(i => `<g class="drift" ${dl(i, 7)}>${P(`M${300 + i * 130} ${200 + i * 20} q-12 -14 -2 -22 q10 8 2 22 q12 -14 22 -4 q-8 10 -22 4Z`, ['#ffd93d', '#ff9ff3', '#8fd6ff'][i])}</g>`).join('') +
      Array.from({ length: 22 }, (_, i) => C(rnd() * 960, 420 + rnd() * 110, 3 + rnd() * 2.5, ['#fff', '#ffd93d', '#ff9ff3', '#ff6b6b'][i % 4])).join('') +
      bird(380, 110) + bird(440, 90) + bird(300, 140) + beam('820 0 880 0 560 300 440 300', '#fff6c8', .14) + fall(8, ['#ffc0cb', '#ffe0ea'], 9, 6),
    amusement: () => [0, 1, 2, 3, 4, 5, 6].map(i => P(`M${i * 150} 0 l24 0 l-12 36Z`, ['#ff5f6d', '#ffd166', '#06d6a0', '#4d96ff'][i % 4])).join('') + S('M0 0 Q480 60 960 0', '#fff', 3) +
      R(40, 400, 120, 70, '#fff', 'rx="8"') + P('M30 400 H170 L150 360 H50Z', '#ff5f6d') + TX(100, 440, '爆米花', 20, '#e8527f') +
      Array.from({ length: 10 }, (_, i) => spark(80 + rnd() * 800, 80 + rnd() * 260, .7 + rnd() * .6, ['#fff6b0', '#ffb3d1', '#b3e0ff'][i % 3]).replace('<path', '<path class="twk"')).join('') + fall(10, ['#ff5f6d', '#ffd166', '#06d6a0', '#4d96ff'], 8, 4),
    beach: () => [0, 1].map(i => bird(420 + i * 70, 80 + i * 24)).join('') + P('M520 250 l16 -34 l16 34Z', '#fff') + P('M512 252 H560 L552 262 H520Z', '#8a5a3a') + S('M536 216 V252', '#8a5a3a', 2) +
      S('M0 262 Q60 252 120 262 T240 262 T360 262 T480 262 T600 262 T720 262 T840 262 T960 262', '#fff', 3, 'class="sway" opacity=".7"') + S('M0 400 Q80 388 160 400 T320 400 T480 400 T640 400 T800 400 T960 400', '#fff', 5, 'class="sway" opacity=".6"') +
      C(700, 450, 18, '#ff5f6d') + P('M700 432 a18 18 0 0 1 0 36Z', '#fff') + P('M620 440 l6 -14 l6 14Z', '#ff9ff3') + P('M440 470 l5 -12 l5 12Z', '#ffd93d') + E(300, 470, 14, 5, '#e8b88a') + twk(14, 0, 960, 270, 380, '#fff', 1.6),
    library: () => beam('120 60 220 60 360 420 190 420', '#fff6c8', .2) + twk(20, 130, 360, 70, 400, '#fff7d0', 1.8) + R(830, 330, 90, 80, '#a2713f') + R(838, 300, 74, 30, '#c0392b') + R(846, 280, 58, 20, '#2e86c1') +
      C(870, 250, 28, '#7fb2e0', 'stroke="#c98f5e" stroke-width="4"') + S('M870 222 V278 M842 250 H898', '#c98f5e', 2) + R(40, 320, 6, 90, '#c9a778') + R(100, 320, 6, 90, '#c9a778') + P('M40 330 h66 M40 360 h66 M40 390 h66', 'none', 'stroke="#c9a778" stroke-width="5"'),
    office: () => twk(40, 20, 940, 40, 380, '#ffe27a', 1.6) + R(870, 150, 60, 250, '#9aa7b8') + R(900, 150, 2, 250, '#6c7885') + C(900, 130, 10, '#1faa5a') + R(300, 360, 150, 50, '#6b7384') + R(310, 340, 130, 24, '#22304a') + TX(375, 358, 'CHASE', 16, '#6fb1e6') +
      P('M960 420 q-60 -10 -60 -60 q30 -10 60 20Z', '#4f9b63') + E(480, 480, 440, 22, '#fff', 'opacity=".12"'),
    supermarket: () => [0, 1, 2, 3].map(i => R(300 + i * 60, 400 - (i % 2) * 10, 52, 40, '#c98f5e', 'rx="4"') + C(316 + i * 60, 396 - (i % 2) * 10, 10, ['#e84a5f', '#ff9f1c', '#6bcB77', '#ffd93d'][i]) + C(338 + i * 60, 398 - (i % 2) * 10, 9, ['#ff9f1c', '#e84a5f', '#ffd93d', '#6bcB77'][i])).join('') +
      [0, 1, 2, 3, 4, 5].map(i => R(120 + i * 140, 26, 90, 18, '#fff', 'opacity=".5"')).join('') + [0, 1, 2].map(i => P(`M${340 + i * 130} 80 l60 0 l-4 26 l-52 0Z`, ['#ff6b6b', '#ffd93d', '#6bcB77'][i])).join('') +
      TX(370, 98, '蛋 29', 14, '#fff') + TX(500, 98, '奶 49', 14, '#555') + TX(630, 98, '菜 19', 14, '#fff') + E(480, 480, 440, 22, '#fff', 'opacity=".25"'),
    station: () => [0, 1, 2, 3, 4].map(i => `<g>${C(70 + i * 212, 304, 11, '#4a5a7a')}${R(60 + i * 212, 315, 20, 20, '#4a5a7a', 'rx="6"')}</g>`).join('') +
      R(700, 300, 80, 110, '#e84a5f', 'rx="6"') + R(710, 312, 60, 36, '#fff', 'opacity=".85" rx="4"') + C(740, 378, 10, '#ffd93d') + R(620, 40, 220, 40, '#1f5fa8', 'rx="6"') + TX(730, 68, '第 2 月台 ▶', 22, '#fff') +
      S('M0 470 H960 M0 500 H960', '#8c97ab', 3) + P('M480 410 L420 540 H540Z', '#fff', 'opacity=".05"') + twk(20, 0, 960, 0, 200, '#fff', 1.8),
    party: () => TX(480, 110, 'HAPPY BIRTHDAY', 40, '#ff5f93', 'class="pulse" style="letter-spacing:4px"') + gift(60, 380, 60, 46, '#6bcB77') + gift(130, 396, 44, 32, '#4d96ff') + gift(830, 376, 70, 50, '#ffd93d') + gift(780, 400, 40, 28, '#ff9ff3') +
      [0, 1, 2, 3, 4, 5].map(i => spark(400 + i * 36, 250 + (i % 2) * 20, 1, '#fff6b0').replace('<path', '<path class="twk"')).join('') + fall(30, ['#ff5f6d', '#ffd166', '#06d6a0', '#4d96ff', '#ff9ff3'], 8, 5),
    onsen: () => steam(560, 400, 4, '#fff') + steam(660, 400, 3, '#fff') + R(560, 400, 200, 8, '#b8864f') + R(580, 372, 60, 30, '#8a5a3a', 'rx="4"') + E(610, 372, 30, 6, '#d8f0ff') +
      R(780, 330, 130, 70, '#a06a3a') + R(796, 306, 40, 24, '#fff', 'rx="5"') + R(846, 312, 40, 18, '#ffd0d8', 'rx="4"') + steam(816, 304, 2, '#fff') +
      fall(14, ['#e8503a', '#ff9f1c', '#c0392b'], 10, 7) + P('M470 40 h18 v26 h-18Z', '#ff8a5c', 'opacity=".5"') + C(479, 80, 54, '#ff8a5c', 'opacity=".1" class="pulse"'),
    concert: () => [0, 1, 2, 3].map(i => S(`M${160 + i * 220} 8 L${60 + i * 270} 400`, ['#ff5fa2', '#5fd4ff', '#ffd35f', '#b36bff'][i], 3, `class="twk" opacity=".6" ${dl(i, 3)}`)).join('') +
      R(30, 300, 70, 130, '#14102c', 'rx="6"') + C(65, 340, 22, '#2a2250') + C(65, 340, 10, '#8a7cff') + R(860, 300, 70, 130, '#14102c', 'rx="6"') + C(895, 340, 22, '#2a2250') + C(895, 340, 10, '#8a7cff') +
      twk(40, 0, 960, 20, 420, '#fff', 1.8) + E(480, 440, 480, 40, '#b36bff', 'opacity=".12"') +
      Array.from({ length: 10 }, (_, i) => `<g class="sway" ${dl(i, 3)}>${R(70 + i * 90, 400 - (i % 3) * 8, 5, 46, ['#ff5fa2', '#5fd4ff', '#ffd35f'][i % 3], 'rx="2"')}</g>`).join(''),
    rooftop: () => `<g class="shoot">${S('M0 0 L80 50', '#fff', 3)}${C(80, 50, 4, '#fff')}</g>` + R(380, 350, 200, 10, '#e8d9f4', 'opacity=".9"') + R(400, 360, 10, 50, '#6e6890') + R(550, 360, 10, 50, '#6e6890') + glass(440, 346) + glass(520, 346) +
      R(476, 320, 8, 26, '#fff3d0') + P('M480 304 q-6 10 0 14 q6 -4 0 -14Z', '#ffb02e') + C(480, 312, 22, '#ffd27d', 'opacity=".25" class="pulse"') +
      [0, 1, 2, 3, 4].map(i => `<g class="floatup" ${dl(i, 6)}>${heart(300 + i * 90, 400, 1 + (i % 2) * .4, i % 2 ? '#ff9fc0' : '#ff6f9c')}</g>`).join('') + P('M40 420 h120 l-10 -40 h-100Z', '#c2185b', 'opacity=".5"') + twk(26, 0, 960, 0, 300, '#fff', 1.8),
  };
  function lampRow() { return [0, 1, 2].map(i => `<path d="M${520 + i * 120} 0 V70" stroke="#444" stroke-width="2"/>` + P(`M${496 + i * 120} 96 Q${520 + i * 120} 60 ${544 + i * 120} 96Z`, '#ffb347') + E(520 + i * 120, 100, 22, 6, '#fff3c0', 'opacity=".8"')).join(''); }

  /* ---------- 整體光影（暗角＋色調） ---------- */
  const TINT = { conv: '#6fa8ff', busstop: '#7a9ab8', cinema: '#a01830', nightmarket: '#ff9f40', restaurant: '#ffb050', concert: '#b36bff', rooftop: '#7a5cff', station: '#4a6aaa', home: '#ffe0a0', breakfast: '#ffc070', cafe: '#ffb070', park: '#fff0a0', beach: '#fff0b0', onsen: '#ffc080', party: '#ffb0d8', amusement: '#ffe0f0' };
  const light = (k) => `<rect width="960" height="540" fill="${TINT[k] || '#fff'}" opacity=".08" style="mix-blend-mode:soft-light"/>` + '<rect width="960" height="540" fill="url(#gVig)"/>';

  /* ---------- 情緒特效（畫在人物前面） ---------- */
  function fx(mood, who) {
    const cx = who === 'girl' ? 770 : 190, cy = 170;
    let o = '';
    if (who === 'girl') {
      switch (mood) {
        case 'angry':
          o += `<g class="vein">${S(`M${cx + 82} ${cy - 108} l12 -6 M${cx + 92} ${cy - 126} l6 12 M${cx + 112} ${cy - 112} l-12 6 M${cx + 102} ${cy - 94} l-6 -12`, '#e5303a', 6)}</g>`;
          break;
        case 'sulk':
          o += `<g class="bob"><ellipse cx="${cx - 110}" cy="${cy - 100}" rx="34" ry="22" fill="#fff" stroke="#e8527f" stroke-width="3"/><path d="M${cx - 90} ${cy - 84} l12 14 l-2 -18Z" fill="#fff" stroke="#e8527f" stroke-width="3"/>${TX(cx - 110, cy - 92, '哼！', 22, '#e8527f')}</g>`;
          break;
        case 'sad':
          o += `<g class="bob">${E(cx - 70, cy - 150, 44, 22, '#9fb4cc')}${E(cx - 40, cy - 160, 34, 22, '#b6c8dc')}${E(cx - 100, cy - 156, 30, 18, '#8aa0ba')}</g>` + [0, 1, 2, 3].map(i => S(`M${cx - 96 + i * 20} ${cy - 130} v18`, '#7fb8ff', 3, `class="rainl" ${dl(i, 1.2)}`)).join('');
          break;
        case 'shock':
          o += [0, 1, 2, 3, 4, 5, 6, 7].map(i => { const a = i * Math.PI / 4; return S(`M${cx + Math.cos(a) * 112} ${cy - 10 + Math.sin(a) * 112} L${cx + Math.cos(a) * 150} ${cy - 10 + Math.sin(a) * 150}`, '#fff', 4, 'class="pulse"'); }).join('') + TX(cx + 100, cy - 112, '！', 44, '#ff3b4a', 'class="bob"');
          break;
        case 'cold':
          o += [0, 1, 2, 3, 4, 5].map(i => S(`M${cx - 60 + i * 24} ${cy - 76} v${24 + (i % 3) * 10}`, '#9a7ab8', 2.5, 'opacity=".4"')).join('') + [0, 1, 2].map(i => spark(cx - 100 + i * 100, cy - 130 + (i % 2) * 30, .9, '#cfe8ff').replace('<path', '<path class="twk"')).join('');
          break;
        case 'happy':
          o += [0, 1, 2, 3, 4, 5].map(i => `<g class="floatup" ${dl(i, 5)}>${heart(cx - 100 + i * 40, cy + 110, .9 + (i % 3) * .3, i % 2 ? '#ff9fc0' : '#ff6f9c')}</g>`).join('') + [0, 1, 2, 3].map(i => spark(cx - 110 + i * 70, cy - 120 + (i % 2) * 40, 1.1).replace('<path', '<path class="twk"')).join('');
          break;
        case 'blush':
          o += [0, 1, 2].map(i => `<g class="floatup" ${dl(i, 4)}>${heart(cx + 60 + i * 24, cy + 40, .8, '#ff9fc0')}</g>`).join('') + [0, 1].map(i => spark(cx - 100 + i * 190, cy - 100, .9).replace('<path', '<path class="twk"')).join('');
          break;
      }
    } else {
      if (mood === 'happy') o += [0, 1, 2].map(i => spark(cx - 80 + i * 80, cy - 110 + (i % 2) * 30, 1).replace('<path', '<path class="twk"')).join('');
      if (mood === 'shock') o += TX(cx - 100, cy - 100, '！', 36, '#ff3b4a', 'class="bob"');
    }
    return o;
  }

  const Art = G.Art;
  Art.extras = (k) => (X[k] ? (seed = 11, X[k]()) : '');
  Art.fx = fx;
  Art.fxBack = (mood, who) => who === 'girl' && mood === 'angry' ? `<radialGradient id="gAura"><stop offset="0" stop-color="#ff2a3a" stop-opacity=".55"/><stop offset="1" stop-color="#ff2a3a" stop-opacity="0"/></radialGradient><g class="pulse">${E(770, 200, 190, 220, 'url(#gAura)')}${[0, 1, 2, 3, 4, 5].map((i) => P(`M${640 + i * 50} 400 L${650 + i * 50} ${250 - (i % 2) * 50} L${665 + i * 50} 400Z`, '#ff3b4a', 'opacity=".25"')).join('')}</g>` : '';
  Art.vigDef0 = '<radialGradient id="gVig" cx=".5" cy=".5" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".38"/></radialGradient>';

  /* =====================================================================
   * 寫實化合成層：透視地板、牆面質感、環境遮蔽、景深、光暈、顆粒
   * 背景（含這些效果）合成一次後轉成點陣圖快取，動態道具與人物疊在上面
   * ===================================================================== */
  const FILTERS = `
    <filter id="fBlurBG" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="1.25"/></filter>
    <filter id="fBloom" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="9"/></filter>
    <filter id="fBokeh" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3"/></filter>
    <filter id="fGrain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 .9 -.3"/></filter>
    <filter id="fWood" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".006 .32" numOctaves="3" seed="5"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1.5 -.55"/></filter>
    <filter id="fPlaster" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".011" numOctaves="4" seed="9"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .9 -.28"/></filter>
    <filter id="fSpeck" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".55" numOctaves="3" seed="2"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1.8 -.8"/></filter>
    <radialGradient id="gVig" cx=".5" cy=".5" r=".78"><stop offset=".5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".42"/></radialGradient>
    <linearGradient id="gAOtop" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".32"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>
    <linearGradient id="gAObot" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".3"/></linearGradient>
    <linearGradient id="gAOl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".28"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>
    <linearGradient id="gGloss" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`;
  Art.vigDef = '';
  Art.filters = FILTERS;

  const FLOORS = {
    home: { y: 400, type: 'wood', c1: '#c79b66', c2: '#8c6038', opaque: 1 },
    conv: { y: 380, type: 'tile', c1: '#f0f3f8', c2: '#b4bfce', opaque: 1 },
    breakfast: { y: 400, type: 'wood', c1: '#b9824f', c2: '#76482a', opaque: 1 },
    busstop: { y: 414, type: 'asphalt', c1: '#5b6470', c2: '#2a3038', opaque: 1 },
    cafe: { y: 410, type: 'wood', c1: '#5a3624', c2: '#2c1a10', opaque: 1 },
    cinema: { y: 400, type: 'carpet', c1: '#7a1c30', c2: '#2c0a14', alpha: .35 },
    mall: { y: 410, type: 'tile', c1: '#f7e8da', c2: '#d2b69c', opaque: 1 },
    nightmarket: { y: 420, type: 'asphalt', c1: '#47395f', c2: '#1d1731', opaque: 1 },
    restaurant: { y: 420, type: 'wood', c1: '#4a2c38', c2: '#1d1219', alpha: .65 },
    park: { y: 388, type: 'grass', c1: '#8fd18a', c2: '#3f8a46', alpha: .5 },
    amusement: { y: 432, type: 'grass', c1: '#8fd18a', c2: '#3f8a46', alpha: .5 },
    beach: { y: 386, type: 'sand', c1: '#f6e2b4', c2: '#d6b57c', alpha: .55 },
    library: { y: 410, type: 'wood', c1: '#8f5f38', c2: '#4a2e1a', opaque: 1 },
    office: { y: 412, type: 'tile', c1: '#d4dae4', c2: '#8a93a6', opaque: 1 },
    supermarket: { y: 410, type: 'tile', c1: '#f1e8d4', c2: '#c4b690', opaque: 1 },
    station: { y: 424, type: 'tile', c1: '#6e788c', c2: '#363e52', opaque: 1 },
    party: { y: 420, type: 'wood', c1: '#e9bc8a', c2: '#a97a4a', opaque: 1 },
    onsen: { y: 410, type: 'tatami', c1: '#c9d48c', c2: '#8a9850', opaque: 1 },
    concert: null,
    rooftop: { y: 412, type: 'concrete', c1: '#554d74', c2: '#262140', opaque: 1 },
  };
  const WALLS = ['home', 'conv', 'breakfast', 'cafe', 'cinema', 'mall', 'restaurant', 'library', 'office', 'supermarket', 'onsen', 'party'];
  const GLOW = {
    home: [[535, 150, 150, '#fff3c0', .5]], conv: [[480, 60, 260, '#cfe8ff', .35]],
    breakfast: [[520, 98, 80, '#ffd080', .6], [640, 98, 80, '#ffd080', .6], [760, 98, 80, '#ffd080', .6]], busstop: [[885, 120, 130, '#ffe9a0', .5]],
    cafe: [[480, 92, 110, '#ffcb6b', .6], [660, 122, 110, '#ffcb6b', .6], [840, 82, 110, '#ffcb6b', .6]], cinema: [[480, 150, 300, '#9cc8ff', .25]],
    mall: [[420, 54, 170, '#fff2b8', .5], [620, 64, 170, '#fff2b8', .5]], nightmarket: [[100, 70, 200, '#ffd27d', .4], [480, 70, 260, '#ffd27d', .4], [860, 70, 200, '#ffd27d', .4]],
    restaurant: [[620, 86, 120, '#e8b45f', .55], [840, 80, 120, '#e8b45f', .55], [485, 300, 90, '#ffb02e', .5]], park: [[820, 40, 280, '#fff6c8', .45]],
    amusement: [[180, 230, 280, '#ffd0e8', .25]], beach: [[800, 100, 280, '#fff2a0', .5]], library: [[470, 72, 150, '#9be07a', .4], [480, 200, 300, '#fff6c8', .2]],
    office: [[250, 60, 200, '#8fb6ff', .25]], supermarket: [[480, 10, 420, '#fff', .28]], station: [[480, 90, 130, '#fff', .35]], party: [[480, 260, 220, '#ffd0e0', .3]],
    onsen: [[470, 72, 150, '#ff8a5c', .5], [690, 190, 270, '#9bd0ff', .2]], concert: [[480, 230, 340, '#b36bff', .3]], rooftop: [[130, 100, 170, '#fff6c8', .5], [480, 310, 130, '#ffd27d', .4]],
  };
  const NIGHT = { conv: '#cfe8ff', busstop: '#ffe9a0', nightmarket: '#ffd27d', restaurant: '#ffd27d', office: '#ffe27a', station: '#fff3c0', concert: '#ff8fd0', rooftop: '#ffe27a' };

  function floorSvg(f) {
    if (!f) return '';
    seed = 21;
    const y0 = f.y, vy = y0 - 320, vx = 480, H = 540 - y0, id = 'fl' + y0 + f.type;
    const xAt = (xb, y) => vx + (xb - vx) * (y - vy) / (540 - vy);
    const yAt = (t, p) => y0 + H * Math.pow(t, p || 1.7);
    let o = `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${f.c1}"/><stop offset="1" stop-color="${f.c2}"/></linearGradient>`;
    o += R(0, y0, 960, H, `url(#${id})`, f.opaque ? '' : `opacity="${f.alpha || .5}"`);
    const Wd = f.type === 'tatami' ? 230 : f.type === 'concrete' ? 170 : f.type === 'tile' ? 96 : 84;
    switch (f.type) {
      case 'wood': case 'tile': case 'concrete': case 'tatami': {
        for (let i = -14; i < 14; i++) {
          const xb = 480 + i * Wd;
          if (f.type === 'wood') o += P(`M${xAt(xb, y0)} ${y0} L${xAt(xb + Wd, y0)} ${y0} L${xb + Wd} 540 L${xb} 540Z`, i % 2 ? '#000' : '#fff', `opacity="${i % 3 ? .05 : .09}"`);
          if (f.type === 'tile' && i % 2 === 0) o += P(`M${xAt(xb, y0)} ${y0} L${xAt(xb + Wd, y0)} ${y0} L${xb + Wd} 540 L${xb} 540Z`, '#000', 'opacity=".035"');
          o += S(`M${xAt(xb, y0)} ${y0} L${xb} 540`, f.type === 'tatami' ? '#4d5a26' : '#000', f.type === 'tatami' ? 3 : 1.3, `opacity="${f.type === 'wood' ? .3 : .16}"`);
        }
        const rows = f.type === 'tatami' ? 3 : f.type === 'wood' ? 12 : 9;
        for (let k = 1; k < rows; k++) {
          const y = yAt(k / rows, f.type === 'wood' ? 1.9 : 1.7);
          if (f.type === 'wood') { for (let i = -14; i < 14; i++) if ((k + i * 2) % 5 === 0) o += S(`M${xAt(480 + i * Wd, y)} ${y} L${xAt(480 + (i + 1) * Wd, y)} ${y}`, '#000', 1.1, 'opacity=".28"'); }
          else o += S(`M0 ${y} H960`, f.type === 'tatami' ? '#4d5a26' : '#000', f.type === 'tatami' ? 3 : 1.2, 'opacity=".16"');
        }
        if (f.type === 'tatami') for (let i = -60; i < 60; i++) o += S(`M${xAt(480 + i * 16, y0)} ${y0} L${480 + i * 16} 540`, '#fff', 1, 'opacity=".07"');
        if (f.type === 'wood') o += R(0, y0, 960, H, '#2a1608', 'filter="url(#fWood)" opacity=".55"');
        if (f.type === 'concrete') o += R(0, y0, 960, H, '#000', 'filter="url(#fSpeck)" opacity=".25"');
        break;
      }
      case 'carpet': o += R(0, y0, 960, H, '#000', 'filter="url(#fSpeck)" opacity=".35"') + S(`M${xAt(300, y0)} ${y0} L120 540 M${xAt(660, y0)} ${y0} L840 540`, '#ffd27d', 3, 'opacity=".2"'); break;
      case 'asphalt': {
        o += R(0, y0, 960, H, '#000', 'filter="url(#fSpeck)" opacity=".4"');
        for (let i = 0; i < 7; i++) o += E(100 + i * 140, y0 + 40 + (i % 3) * 26, 70, 7, '#fff', 'opacity=".06"') + S(`M${80 + i * 140} ${y0 + 8} V540`, '#fff', 12, 'opacity=".035"');
        o += E(300, y0 + 60, 110, 12, '#cfe0f0', 'opacity=".22"') + E(720, y0 + 90, 150, 14, '#cfe0f0', 'opacity=".18"');
        break;
      }
      case 'grass': {
        for (let k = 0; k < 9; k++) o += R(0, yAt(k / 9, 1.5), 960, yAt((k + 1) / 9, 1.5) - yAt(k / 9, 1.5), k % 2 ? '#fff' : '#000', 'opacity=".05"');
        for (let i = 0; i < 380; i++) { const t = Math.pow(rnd(), .6), y = y0 + 6 + H * t, x = rnd() * 960, l = 4 + 14 * t; o += S(`M${x} ${y} q${rnd() * 4 - 2} ${-l * .6} ${rnd() * 6 - 3} ${-l}`, rnd() > .5 ? '#2f7a38' : '#a6e08a', 1 + t, 'opacity=".5"'); }
        break;
      }
      case 'sand': {
        o += R(0, y0, 960, H, '#7a5a2a', 'filter="url(#fSpeck)" opacity=".28"');
        for (let k = 1; k < 6; k++) o += S(`M0 ${yAt(k / 6, 1.5)} Q240 ${yAt(k / 6, 1.5) - 8} 480 ${yAt(k / 6, 1.5)} T960 ${yAt(k / 6, 1.5)}`, '#fff', 2, 'opacity=".25"');
        break;
      }
    }
    // 光澤反射與近景變暗
    if (f.type === 'wood' || f.type === 'tile' || f.type === 'tatami') o += R(0, y0, 960, Math.min(90, H), 'url(#gGloss)', 'opacity=".55"') + E(480, y0 + 70, 420, 30, '#fff', 'opacity=".07"');
    o += R(0, y0, 960, 26, 'url(#gAObot)', 'transform="translate(0 0)" opacity="0"');
    o += R(0, 540 - 70, 960, 70, 'url(#gAObot)', 'opacity=".5"');
    o += R(0, y0 - 2, 960, 24, '#000', 'opacity=".0"');
    // 牆腳陰影（接地感）
    o += `<linearGradient id="${id}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".32"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>` + R(0, y0, 960, 22, `url(#${id}w)`);
    return o;
  }

  function staticSvg(k) {
    seed = 33;
    const f = FLOORS[k], fy = f ? f.y : 420;
    let o = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540" width="1920" height="1080"><defs>${FILTERS}</defs>`;
    o += `<g filter="url(#fBlurBG)" transform="translate(-12 -7) scale(1.025)">${Art.scene(k)}</g>`;
    o += floorSvg(f);
    if (WALLS.includes(k)) {
      o += R(0, 0, 960, fy, '#000', 'filter="url(#fPlaster)" opacity=".1" style="mix-blend-mode:multiply"');
      o += R(0, 0, 960, 120, 'url(#gAOtop)') + R(0, 0, 90, fy, 'url(#gAOl)') + `<g transform="translate(960 0) scale(-1 1)">${R(0, 0, 90, fy, 'url(#gAOl)')}</g>`;
      o += R(0, fy - 40, 960, 40, 'url(#gAObot)', 'opacity=".5"');
    } else o += R(0, 0, 960, 80, 'url(#gAOtop)', 'opacity=".6"');
    // 光暈（燈光／窗光／陽光）
    const gl = GLOW[k] || [];
    gl.forEach((g, i) => { o += `<radialGradient id="gl${i}"><stop offset="0" stop-color="${g[3]}" stop-opacity="${g[4]}"/><stop offset="1" stop-color="${g[3]}" stop-opacity="0"/></radialGradient>` + C(g[0], g[1], g[2], `url(#gl${i})`, 'style="mix-blend-mode:screen"'); });
    // 夜景散景（失焦的遠方燈光）
    if (NIGHT[k]) { for (let i = 0; i < 16; i++) o += C(rnd() * 960, 60 + rnd() * 300, 8 + rnd() * 18, NIGHT[k], `opacity="${.12 + rnd() * .2}" filter="url(#fBokeh)"`); }
    o += R(0, 0, 960, 540, 'url(#gVig)') + R(0, 0, 960, 540, '#000', 'filter="url(#fGrain)" opacity=".22" style="mix-blend-mode:overlay"');
    return o + '</svg>';
  }
  Art.staticSvg = staticSvg;
})(window.GAME = window.GAME || {});
