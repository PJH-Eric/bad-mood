/* 繁 → 簡 即時轉換（零依賴）：以字元對照表處理 DOM 文字、SVG 文字與場景圖 */
(function (G) {
  const T = '丟並乾亂佔來侶係個們側傘備傳傷價儀優兒內兩凍別刪則剛劃劇動務勞勢勵區卻厭參叢員唸問啞啟單嗎嗚嘆噴嚇嚐嚴囉囑國圍園圓圖堅報場塊墊壓壞壽夠夢夾妝媽學實寫寬將專對導尷層屬帥師帳帶幫幹幾庫廁廂廢廣廳張強彆彈後徑從徵悅愛態慣慶應懶懺戀戰戲戶捲掛揚換揮搖搶撈撐撥撫撿擇擋擔據擠擬擺擾攤攪攬敗數斷於時暈暫曉曬書會東桿條棄極槓樂樓標樣樹機橫檔櫃櫥櫻欄權歡歸殺氣決沒沖況涼淚淨淺減測湊湯準溝溫滾滿漢漸澆澤濕瀏灑灘灣為無煙煩熱燈燒燙燭爭爾牆牽獎獻現環產畫當疊痠發皺盤眾睜瞞瞼確碼禮稅種稱穩筆箏節範簡簽籃籤糾紀約紅純紙級紛細紹終組結絕絡給統絲綁經綠維網緊緒線緣編緩練縮縱總繞繪繼繽續罰罵罷羨義習聞聯聰聲聽聾肅脅脫腦腳腸臉臟與興舉舊艙華葉蓋蔔蔥蕩薦薩藍蘇蘋蘿處號蝦螢蠟術衛衝裊補裝裡複襯見規視親覺觀計訊討託記設許訴註評詞試詩話該誇認語誠誤說誰調談請諒諾謊講謝謬證識譜譯議護讀變讓讚貓負財貨販責貴買費貼資賓賠賣質賴購賽贏趕蹤車軌軟軸較載輕輛輩輪輸轉轟辦迴這連週進遊運過達違遙遞遠適遲選遺還邊鄰醬釋鈍鈕鈴銀鋪鋼錄錢錯錶鍊鍵鎖鏡鐘鐵鑰長門閃閉開閒間闆關陣陰陽隊隨隻雙雜雞離難雲電靈靜響頁頂項順須預頓領頭頰顆題顏願類顧顯風飄飛飯飲飽飾餅養餓餘館馬駁騙騷驚髒體髮鬆鬍鬥鬧魚鮮鳥鳴鴨鴿鵝鷗鹹麥麵麼黃點齊龍', S = '丢并干乱占来侣系个们侧伞备传伤价仪优儿内两冻别删则刚划剧动务劳势励区却厌参丛员念问哑启单吗呜叹喷吓尝严啰嘱国围园圆图坚报场块垫压坏寿够梦夹妆妈学实写宽将专对导尴层属帅师帐带帮干几库厕厢废广厅张强别弹后径从征悦爱态惯庆应懒忏恋战戏户卷挂扬换挥摇抢捞撑拨抚捡择挡担据挤拟摆扰摊搅揽败数断于时晕暂晓晒书会东杆条弃极杠乐楼标样树机横档柜橱樱栏权欢归杀气决没冲况凉泪净浅减测凑汤准沟温滚满汉渐浇泽湿浏洒滩湾为无烟烦热灯烧烫烛争尔墙牵奖献现环产画当叠酸发皱盘众睁瞒睑确码礼税种称稳笔筝节范简签篮签纠纪约红纯纸级纷细绍终组结绝络给统丝绑经绿维网紧绪线缘编缓练缩纵总绕绘继缤续罚骂罢羡义习闻联聪声听聋肃胁脱脑脚肠脸脏与兴举旧舱华叶盖卜葱荡荐萨蓝苏苹萝处号虾萤蜡术卫冲袅补装里复衬见规视亲觉观计讯讨托记设许诉注评词试诗话该夸认语诚误说谁调谈请谅诺谎讲谢谬证识谱译议护读变让赞猫负财货贩责贵买费贴资宾赔卖质赖购赛赢赶踪车轨软轴较载轻辆辈轮输转轰办回这连周进游运过达违遥递远适迟选遗还边邻酱释钝钮铃银铺钢录钱错表炼键锁镜钟铁钥长门闪闭开闲间板关阵阴阳队随只双杂鸡离难云电灵静响页顶项顺须预顿领头颊颗题颜愿类顾显风飘飞饭饮饱饰饼养饿余馆马驳骗骚惊脏体发松胡斗闹鱼鲜鸟鸣鸭鸽鹅鸥咸麦面么黄点齐龙';
  const M = {}; for (let i = 0; i < T.length; i++) M[T[i]] = S[i];
  const P = { '「': '“', '」': '”', '『': '‘', '』': '’' };
  const KEY = 'whyangry.lang';
  let cur = 'tc'; try { cur = localStorage.getItem(KEY) === 'sc' ? 'sc' : 'tc'; } catch (e) {}
  const sc = (s) => String(s).replace(/[\u3400-\u9fff「」『』]/g, (c) => M[c] || P[c] || c);
  const L = G.Lang = { get cur() { return cur; }, sc, tx: (s) => (cur === 'sc' ? sc(s) : s), onChange: [] };
  const orig = new WeakMap();
  function conv(n) {
    if (n.nodeType === 3) { const v = n.nodeValue; if (cur === 'sc') { const c = sc(v); if (c !== v) { n.nodeValue = c; } } return; }
    if (n.nodeType !== 1 || n.tagName === 'SCRIPT' || n.tagName === 'STYLE') return;
    ['title', 'placeholder', 'aria-label'].forEach((a) => { if (n.hasAttribute && n.hasAttribute(a)) { const v = n.getAttribute(a), c = sc(v); if (c !== v) n.setAttribute(a, c); } });
    for (let c = n.firstChild; c; c = c.nextSibling) conv(c);
  }
  let busy = false;
  const mo = new MutationObserver((ms) => {
    if (cur !== 'sc' || busy) return; busy = true;
    ms.forEach((m) => { if (m.type === 'characterData') conv(m.target); else m.addedNodes.forEach(conv); });
    busy = false;
  });
  function apply() {
    document.documentElement.lang = cur === 'sc' ? 'zh-Hans' : 'zh-Hant';
    document.title = cur === 'sc' ? sc(document.title) : (L.baseTitle || document.title);
    document.querySelectorAll('.langSeg b').forEach((b) => b.classList.toggle('on', b.dataset.v === cur));
  }
  L.set = function (v) {
    if (v === cur) return; cur = v; try { localStorage.setItem(KEY, v); } catch (e) {}
    if (v === 'tc') { location.reload(); return; } // 簡 → 繁 需還原原文，直接重新載入
    conv(document.body); apply(); L.onChange.forEach((f) => f());
  };
  L.baseTitle = document.title;
  function mkSeg() {
    const d = document.createElement('div'); d.className = 'seg langSeg';
    d.innerHTML = '<b data-v="tc">繁中</b><b data-v="sc">简中</b>';
    d.addEventListener('click', (e) => {
      const b = e.target.closest('b'); if (!b || b.dataset.v === cur) return;
      const v = b.dataset.v, sc2 = v === 'sc', prev = [...document.querySelectorAll('.scr')].find((x) => !x.classList.contains('hidden'));
      const back = () => { if (prev && G.showScr) G.showScr(prev.id); };
      if (!G.confirmBox) { L.set(v); return; }
      G.confirmBox(sc2 ? '切換語言' : '切换语言', sc2 ? '要切換成「简体中文」嗎？\n（若正在關卡中，這一關需要重新開始，進度不受影響）' : '要切换成「繁體中文」吗？\n（页面会重新载入；若正在关卡中，这一关需要重新开始，进度不受影响）', () => { back(); L.set(v); }, back);
    });
    return d;
  }
  function init() {
    const row = document.createElement('div'); row.className = 'setRow'; const sp = document.createElement('span'); sp.textContent = '語言 / 语言'; row.append(sp, mkSeg());
    const sr = document.getElementById('segSpeed'); if (sr && sr.parentNode && sr.parentNode.parentNode) sr.parentNode.parentNode.insertBefore(row, sr.parentNode);
    const t = document.getElementById('scrTitle'); if (t) { const w = document.createElement('div'); w.className = 'langTop'; w.appendChild(mkSeg()); t.appendChild(w); }
    new MutationObserver(() => {}); // 保留
    mo.observe(document.body, { childList: true, subtree: true, characterData: true });
    if (cur === 'sc') conv(document.body); apply();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})(window.GAME = window.GAME || {});
