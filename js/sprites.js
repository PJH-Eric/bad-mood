/* 立繪圖片（選用）
 * 預設為空，使用內建的向量人物。若你有自己的立繪（透明背景 PNG／WebP／SVG），
 * 在這裡填入檔案路徑，就會取代對應表情的向量人物，其餘表情維持向量。
 * 圖片會以「頭部中心」為原點，約 340 寬 × 480 高顯示（上半身）。
 * 表情名稱：normal angry sulk sad shock cold happy blush nervous
 *
 * 範例：
 *   GAME.SPRITES = {
 *     girl: { normal: 'assets/girl_normal.png', angry: 'assets/girl_angry.png' },
 *     boy:  { normal: 'assets/boy_normal.png' },
 *   };
 */
window.GAME = window.GAME || {};
window.GAME.SPRITES = { girl: {}, boy: {} };
