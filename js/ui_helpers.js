var canvas, ctx;
var scoreEl, gameOverEl, hintEl;

var titleNameImg = null, levelImg = null, noteImg = null, settingImg = null, playerUpImg = null;
var homeImg = null, nextImg = null, levelRangeImgs = [null,null,null,null,null], completeImg = null, closeImg = null;
var frameImg = null, menuItemImg = null, waitImg = null, priceImg = null, backgroundMenuImg = null, menuNameImg = null, keycapImg = null;
var playerImgs = [null,null,null,null,null,null];
var playerSkinImgs = [[],[],[],[],[],[]];
var spiritImgs = [null,null,null,null,null,null];
var spiritIconImg = null;
var platformImg = null, brokenPlatformImg = null, movingPlatformImg = null, springImg = null;
var bonusImg = null, bonus2Img = null, bonus2ShieldImg = null, bonus3Img = null;
var bgImg = null, bg2Img = null, bg3Img = null, levelBgImgs = [null,null,null,null,null];
var liderImg = null, goldImg = null, allgoldImg = null, crystalImg = null, scrollImg = null, rollImg = null;
var pauseImg = null, soundImg = null;

var assetsLoaded = 0;
var assetsTotal = 0;
var assetsReady = false;

var coinShake = 0;
var secretFlashTimer = 0;
var secretFlashText = '+10000';
var charShake = { 1:0, 2:0, 3:0, 4:0, 5:0 };
var charSelectScale = [1,1,1,1,1,1];
var charInfoPopup = -1;
var skinScrollX = 0;
var skinScrollDrag = null;
var skinHits = [];
var titleInfoBtns = [];
var sliderDrag = null;
var spiritShopOpen = false;
var spiritShopScrollY = 0;
var spiritShopHits = [];
var titleMenu = null;
var menuSlide = 0;
var menuTargetSlide = 0;
var menuOriginX = 0;
var menuOriginY = 0;
var menuOriginW = 0;
var menuOriginH = 0;
var spiritShopSlide = 0;
var spiritShopTargetSlide = 0;
var spiritShopOriginX = 0;
var spiritShopOriginY = 0;
var spiritShopOriginW = 0;
var spiritShopOriginH = 0;
var charInfoSlide = 0;
var charInfoTargetSlide = 0;
var charInfoOriginX = 0;
var charInfoOriginY = 0;
var levelScrollY = 0, levelScrollV = 0, levelScrollMax = 0, levelDrag = null, levelDidScroll = false;
var missionScrollY = 0, missionScrollV = 0, missionScrollMax = 0, missionDrag = null, missionDidScroll = false;
var missionPage = 0;

var musicBtn = { x: WIDTH - 56, y: 10, size: 48 };
var pauseBtn = { x: WIDTH - 112, y: 10, size: 48 };
var pauseMenuBtns = { continue: null, menu: null };
var gameOverMenuBtns = { menu: null, retry: null };
var shopHit = { b1: null, buy1: null, b2: null, buy2: null, b3: null, buy3: null };

function loadImage(src) {
  var img = new Image(); assetsTotal++; var settled = false;
  var done = function() { if (settled) return; settled = true; assetsLoaded++; };
  img.onload = done; img.onerror = function() { console.warn('Failed:', src); done(); };
  img.src = src; if (img.complete) done(); return img;
}

function loadImageWithFallback(paths) {
  var img = new Image(); assetsTotal++; var settled = false; var index = 0;
  var done = function() { if (settled) return; settled = true; assetsLoaded++; };
  function tryNext() {
    if (index >= paths.length) { console.warn('Not found:', paths[0]); done(); return; }
    img.src = paths[index++]; if (img.complete && img.naturalWidth > 0) done();
  }
  img.onload = done; img.onerror = tryNext; tryNext(); return img;
}

function initAssets() {
  titleNameImg      = loadImage(ASSETS.titleName);
  playerImgs[0]     = loadImage(ASSETS.player);
  playerImgs[1]     = loadImage(ASSETS.player2);
  playerImgs[2]     = loadImage(ASSETS.player3);
  playerImgs[3]     = loadImage(ASSETS.player4);
  playerImgs[4]     = loadImage(ASSETS.player5);
  playerImgs[5]     = loadImage(ASSETS.player6);
  for (var ci = 0; ci < 6; ci++) {
    var folder = CHAR_INFO[ci].folder;
    for (var si = 0; si < MAX_SKINS; si++) {
      var prefix = si + 1;
      var fname = folder + 'skin' + prefix + '.png';
      playerSkinImgs[ci][si] = loadImageWithFallback(['assets/' + folder + '/' + fname, 'assets/' + fname]);
    }
  }
  spiritImgs[0]     = loadImage(ASSETS.spirit);
  spiritImgs[1]     = loadImage(ASSETS.spirit2);
  spiritImgs[2]     = loadImage(ASSETS.spirit3);
  spiritImgs[3]     = loadImage(ASSETS.spirit4);
  spiritImgs[4]     = loadImage(ASSETS.spirit5);
  spiritImgs[5]     = loadImage(ASSETS.spirit6);
  spiritIconImg     = loadImage(ASSETS.spiritIcon);
  platformImg       = loadImage(ASSETS.platform);
  brokenPlatformImg = loadImage(ASSETS.platformBroken);
  movingPlatformImg = loadImage(ASSETS.platformMoving);
  springImg         = loadImage(ASSETS.spring);
  bonusImg          = loadImageWithFallback(['assets/bonus.png','assets/Bonus.png']);
  bonus2Img         = loadImageWithFallback(['assets/bonus2.png','assets/Bonus2.png']);
  bonus2ShieldImg   = loadImageWithFallback(['assets/bonus2_1.png','assets/Bonus2_1.png']);
  bonus3Img         = loadImageWithFallback(['assets/bonus3.png','assets/Bonus3.png']);
  bgImg             = loadImage(ASSETS.background);
  bg2Img            = loadImageWithFallback(['assets/background2.png','assets/Background2.png']);
  bg3Img            = loadImageWithFallback(['assets/background3.png','assets/Background3.png']);
  liderImg          = loadImageWithFallback(['assets/Lider.png','assets/lider.png']);
  goldImg           = loadImageWithFallback(['assets/gold.png','assets/Gold.png']);
  allgoldImg        = loadImageWithFallback(['assets/allgold.png','assets/Allgold.png']);
  crystalImg        = loadImageWithFallback(['assets/crystal.png','assets/Crystal.png']);
  scrollImg         = loadImageWithFallback(['assets/Scroll.png','assets/scroll.png']);
  rollImg           = loadImageWithFallback(['assets/Roll.png','assets/roll.png']);
  pauseImg          = loadImageWithFallback(['assets/pause.png','assets/Pause.png']);
  soundImg          = loadImageWithFallback(['assets/sound.png','assets/Sound.png']);
  levelImg          = loadImageWithFallback(['assets/level.png','assets/Level.png']);
  noteImg           = loadImageWithFallback(['assets/note.png','assets/Note.png']);
  settingImg        = loadImageWithFallback(['assets/setting.png','assets/Setting.png']);
  playerUpImg       = loadImageWithFallback(['assets/playerup.png','assets/Playerup.png']);
  homeImg           = loadImageWithFallback(['assets/Home.png','assets/home.png']);
  nextImg           = loadImageWithFallback(['assets/next.png','assets/Next.png']);
  levelRangeImgs[0] = loadImageWithFallback(['assets/1_20.png','assets/1-20.png']);
  levelRangeImgs[1] = loadImageWithFallback(['assets/21_40.png','assets/21-40.png']);
  levelRangeImgs[2] = loadImageWithFallback(['assets/41_60.png','assets/41-60.png']);
  levelRangeImgs[3] = loadImageWithFallback(['assets/61_80.png','assets/61-80.png']);
  levelRangeImgs[4] = loadImageWithFallback(['assets/81_100.png','assets/81-100.png']);
  levelBgImgs[0] = loadImageWithFallback(['assets/background1_20.PNG','assets/background1_20.png']);
  levelBgImgs[1] = loadImageWithFallback(['assets/background21_40.PNG','assets/background21_40.png']);
  levelBgImgs[2] = loadImageWithFallback(['assets/background41_60.PNG','assets/background41_60.png']);
  levelBgImgs[3] = loadImageWithFallback(['assets/background61_80.PNG','assets/background61_80.png']);
  levelBgImgs[4] = loadImageWithFallback(['assets/background81_100.PNG','assets/background81_100.png']);
  completeImg = loadImageWithFallback(['assets/complite.png','assets/complete.png']);
  closeImg = loadImageWithFallback(['assets/close.png','assets/Close.png']);
  frameImg = loadImageWithFallback(['assets/frame.png','assets/Frame.png']);
  menuItemImg = loadImageWithFallback(['assets/menuitem.png','assets/Menuitem.png','assets/menuItem.png']);
  waitImg = loadImageWithFallback(['assets/wait.jpg','assets/wait.png']);
  priceImg = loadImageWithFallback(['assets/price.png','assets/Price.png']);
  backgroundMenuImg = loadImageWithFallback(['assets/backgroundmenu.png','assets/Backgroundmenu.png']);
  menuNameImg = loadImageWithFallback(['assets/menuname.png','assets/Menuname.png']);
  keycapImg = loadImageWithFallback(['assets/keycap.png','assets/Keycap.png']);
}

function getLevelRangeImg(n) { if(n<=20) return levelRangeImgs[0]; if(n<=40) return levelRangeImgs[1]; if(n<=60) return levelRangeImgs[2]; if(n<=80) return levelRangeImgs[3]; return levelRangeImgs[4]; }
function getLevelBgImg(n) { if(n<=20) return levelBgImgs[0]; if(n<=40) return levelBgImgs[1]; if(n<=60) return levelBgImgs[2]; if(n<=80) return levelBgImgs[3]; return levelBgImgs[4]; }
function isImageReady(img) { return img && img.complete && img.naturalWidth > 0; }
function checkAssetsReady() { if(assetsReady)return true; if(assetsTotal>0&&assetsLoaded>=assetsTotal){assetsReady=true;return true;} return false; }

function resize() {
  var cssScale = Math.min(window.innerWidth / WIDTH, window.innerHeight / HEIGHT);
  var dpr = Math.min(window.devicePixelRatio || 1, 3);
  canvas.width = Math.floor(WIDTH * dpr);
  canvas.height = Math.floor(HEIGHT * dpr);
  canvas.style.width = Math.floor(WIDTH * cssScale) + 'px';
  canvas.style.height = Math.floor(HEIGHT * cssScale) + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
}

function canvasToGame(clientX, clientY) {
  var rect = canvas.getBoundingClientRect();
  return { x: (clientX - rect.left) * (WIDTH / rect.width), y: (clientY - rect.top) * (HEIGHT / rect.height) };
}

function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function formatResource(n) {
  n = Math.floor(Number(n) || 0);
  if (n >= 1000000) { var m = n / 1000000; return (Number.isInteger(m) ? m : m.toFixed(1)) + 'M'; }
  if (n >= 100000) return Math.floor(n / 1000) + 'k';
  return String(n);
}

function drawResourceBarBg(x, y, w, h) {
  ctx.save(); ctx.globalAlpha = 0.25;
  if (isImageReady(backgroundMenuImg)) { ctx.drawImage(backgroundMenuImg, x, y, w, h); }
  else { ctx.fillStyle = 'rgba(40,30,20,0.25)'; roundRect(x, y, w, h, 8); ctx.fill(); }
  ctx.restore();
}

function drawOutlinedText(text, x, y, font, align) {
  ctx.font = font || 'bold 16px Segoe UI,Arial';
  ctx.textAlign = align || 'left';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.miterLimit = 2;
  ctx.strokeStyle = TEXT_COL;
  ctx.lineWidth = 3.2;
  ctx.strokeText(text, x, y);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(text, x, y);
  ctx.textBaseline = 'alphabetic';
}

function drawResourceText(prefix, value, x, y, maxW) {
  var text = prefix + formatResource(value);
  var fs = 16;
  ctx.font = 'bold ' + fs + 'px Segoe UI,Arial';
  while (fs > 10 && ctx.measureText(text).width > maxW) { fs--; ctx.font = 'bold ' + fs + 'px Segoe UI,Arial'; }
  drawOutlinedText(text, x, y, 'bold ' + fs + 'px Segoe UI,Arial', 'left');
}

function drawMenuTitle(text, cx, cy, frameW, frameH) {
  var fw = frameW || Math.max(180, text.length * 14 + 40);
  var fh = frameH || 44;
  var fx = cx - fw / 2;
  var fy = cy - fh / 2;
  if (isImageReady(menuNameImg)) { ctx.drawImage(menuNameImg, fx, fy, fw, fh); }
  ctx.fillStyle = TEXT_COL;
  ctx.globalAlpha = 1;
  ctx.font = 'bold 20px Segoe UI,Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, cx, cy + 1);
  ctx.textBaseline = 'alphabetic';
}

function drawMenuPanelBg(x, y, w, h, radius) {
  var r = radius || 20;
  ctx.save();
  roundRect(x, y, w, h, r);
  ctx.clip();
  if (isImageReady(backgroundMenuImg)) { ctx.drawImage(backgroundMenuImg, x, y, w, h); }
  else { ctx.fillStyle = 'rgba(26,28,50,0.96)'; ctx.fillRect(x, y, w, h); }
  ctx.restore();
}

function pressBtn(x, y, w, h) { uiPress = { x: x, y: y, w: w, h: h, life: 18 }; }

function beginPressTransform(x, y, w, h) {
  if (!uiPress || uiPress.life <= 0) return false;
  if (Math.abs(uiPress.x - x) > 1 || Math.abs(uiPress.y - y) > 1 || Math.abs(uiPress.w - w) > 1 || Math.abs(uiPress.h - h) > 1) return false;
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.scale(0.88, 0.88);
  ctx.translate(-(x + w / 2), -(y + h / 2));
  return true;
}

function endPressTransform(was, x, y, w, h) {
  if (!was) return;
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  roundRect(x, y, w, h, 10);
  ctx.fill();
  ctx.restore();
}

function drawKeycapBtn(x, y, w, h, label, textColor) {
  var pressed = beginPressTransform(x, y, w, h);
  if (isImageReady(keycapImg)) { ctx.drawImage(keycapImg, x, y, w, h); }
  else { ctx.fillStyle = 'rgba(78,205,196,0.95)'; roundRect(x, y, w, h, 12); ctx.fill(); }
  ctx.save();
  ctx.globalAlpha = 1;
  ctx.fillStyle = textColor || TEXT_COL;
  var fs = Math.max(12, Math.floor(h * 0.38));
  ctx.font = 'bold ' + fs + 'px Segoe UI,Arial';
  var maxTextW = w - 24;
  while (fs > 11 && ctx.measureText(label).width > maxTextW) { fs--; ctx.font = 'bold ' + fs + 'px Segoe UI,Arial'; }
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x + w / 2, y + h / 2 + 1);
  ctx.restore();
  endPressTransform(pressed, x, y, w, h);
}

function drawSprite(img, cx, cy, maxW, maxH, opts) {
  if (!isImageReady(img)) return;
  var nw = img.naturalWidth; var nh = img.naturalHeight;
  if (nw <= 0 || nh <= 0) return;
  var w = maxW; var h = maxW * (nh / nw);
  if (h > maxH) { h = maxH; w = maxH * (nw / nh); }
  var x = Math.round(cx - w / 2); var y = Math.round(cy - h / 2);
  ctx.save();
  if (opts && opts.shadow) { ctx.shadowColor = opts.shadow; ctx.shadowBlur = opts.blur || 8; }
  ctx.drawImage(img, x, y, w, h);
  ctx.restore();
}

function isHudClick(mx, my) {
  var buttons = [pauseBtn, musicBtn];
  for (var i = 0; i < buttons.length; i++) {
    var b = buttons[i];
    if (mx >= b.x && mx <= b.x + b.size && my >= b.y && my <= b.y + b.size) return true;
  }
  for (var key in shopHit) {
    var box = shopHit[key];
    if (box && mx >= box.x && mx <= box.x + box.w && my >= box.y && my <= box.y + box.h) return true;
  }
  return false;
}

function wrapTextStrict(text, maxW, fontSize) {
  ctx.font = fontSize + 'px Segoe UI, Arial';
  var words = text.split(' ');
  var lines = [];
  var line = '';
  for (var i = 0; i < words.length; i++) {
    var w = words[i];
    var test = line ? line + ' ' + w : w;
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line);
      line = w;
      if (ctx.measureText(w).width > maxW) {
        var part = '';
        for (var ci = 0; ci < w.length; ci++) {
          if (ctx.measureText(part + w[ci]).width > maxW) { lines.push(part); part = w[ci]; }
          else part += w[ci];
        }
        line = part;
      }
    } else { line = test; }
  }
  if (line) lines.push(line);
  return lines;
}

function getCharPositions() {
  var totalW = 3 * titleLayout.charSize + 2 * titleLayout.charGap;
  var startX = (WIDTH - totalW) / 2;
  var positions = [];
  for (var i = 0; i < 6; i++) {
    var col = i % 3;
    var row = Math.floor(i / 3);
    positions.push({ x: startX + col * (titleLayout.charSize + titleLayout.charGap), y: titleLayout.charY + row * titleLayout.rowGap });
  }
  return positions;
}

function getMissionProgress(m) {
  if (m.type === 'height') return bestScore;
  if (m.type === 'coins_total') return totalCoins;
  if (m.type === 'coins_run') return bestRunCoins;
  if (m.type === 'plays') return missionStats.plays || 0;
  if (m.type === 'use_bonus1') return missionStats.use_bonus1 || 0;
  if (m.type === 'use_bonus2') return missionStats.use_bonus2 || 0;
  if (m.type === 'use_bonus3') return missionStats.use_bonus3 || 0;
  if (m.type === 'level') {
    var c = 0;
    for (var i = 1; i <= 100; i++) if (levelsCompleted[i]) c++;
    return c;
  }
  return 0;
}

function drawToggle(x, y, on) {
  var w = 48, h = 26;
  ctx.save();
  ctx.fillStyle = on ? 'rgba(76, 175, 80, 0.95)' : 'rgba(80, 80, 90, 0.9)';
  roundRect(x, y, w, h, h / 2); ctx.fill();
  ctx.strokeStyle = on ? 'rgba(200, 255, 200, 0.5)' : 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 1.5;
  roundRect(x, y, w, h, h / 2); ctx.stroke();
  var kx = on ? x + w - 13 : x + 13;
  ctx.beginPath();
  ctx.arc(kx, y + h / 2, 10, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.2)'; ctx.lineWidth = 1; ctx.stroke();
  ctx.font = 'bold 9px Segoe UI, Arial';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = on ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.55)';
  ctx.fillText(on ? 'Вкл' : 'Выкл', on ? x + 16 : x + w - 16, y + h / 2 + 0.5);
  ctx.restore();
}

function drawRadio(x, y, selected) {
  var r = 12;
  ctx.save();
  ctx.beginPath(); ctx.arc(x + r, y + r, r, 0, Math.PI * 2);
  ctx.strokeStyle = TEXT_COL; ctx.lineWidth = 2; ctx.stroke();
  if (selected) {
    ctx.beginPath(); ctx.arc(x + r, y + r, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#4CAF50'; ctx.fill();
  }
  ctx.restore();
}

function drawSlider(x, y, w, val) {
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  roundRect(x, y + 6, w, 8, 4); ctx.fill();
  ctx.fillStyle = '#4ecdc4';
  roundRect(x, y + 6, w * Math.max(0, Math.min(1, val)), 8, 4); ctx.fill();
  ctx.fillStyle = TEXT_COL;
  ctx.beginPath();
  ctx.arc(x + w * Math.max(0, Math.min(1, val)), y + 10, 9, 0, Math.PI * 2);
  ctx.fill();
}
