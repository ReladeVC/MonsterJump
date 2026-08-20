function drawTitleScreen() {
  if (isImageReady(bgImg)) ctx.drawImage(bgImg, 0, 0, WIDTH, HEIGHT);
  else {
    var grad = ctx.createLinearGradient(0, 0, 0, HEIGHT);
    grad.addColorStop(0, '#1a1a2e'); grad.addColorStop(0.5, '#16213e'); grad.addColorStop(1, '#0f3460');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, WIDTH, HEIGHT);
  }
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(0, 0, WIDTH, HEIGHT);
  if (isImageReady(titleNameImg)) {
    var maxW = WIDTH * 0.85;
    var aspect = titleNameImg.naturalWidth / titleNameImg.naturalHeight;
    var tw = maxW, th = tw / aspect;
    if (th > 140) { th = 140; tw = th * aspect; }
    ctx.drawImage(titleNameImg, (WIDTH - tw) / 2, 80, tw, th);
  } else {
    ctx.fillStyle = TEXT_COL; ctx.font = 'bold 42px Segoe UI, Arial';
    ctx.textAlign = 'center'; ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 10;
    ctx.fillText('Monster Jump', WIDTH / 2, 140); ctx.shadowBlur = 0;
  }
  if (coinShake > 0) coinShake--;
  if (secretFlashTimer > 0) secretFlashTimer--;
  for (var k = 1; k <= 5; k++) if (charShake[k] > 0) charShake[k]--;
  var coinOx = coinShake > 0 ? Math.sin(coinShake * 1.8) * 5 : 0;
  var coinOy = coinShake > 0 ? Math.cos(coinShake * 2.2) * 3 : 0;
  var tTop = 10, tBarH = 48, tIcon = 28, panelW = 124, panelGap = 6;
  var totalRowW = panelW * 3 + panelGap * 2;
  var tLeft = (WIDTH - totalRowW) / 2;
  var coinX = tLeft + coinOx;
  var cryX = tLeft + panelW + panelGap + coinOx;
  var rollX = tLeft + (panelW + panelGap) * 2 + coinOx;
  var resTextMax = panelW - tIcon - 18;
  drawResourceBarBg(coinX, tTop + coinOy, panelW, tBarH);
  if (secretFlashTimer > 0) { ctx.fillStyle = 'rgba(255, 215, 0, 0.35)'; roundRect(coinX, tTop + coinOy, panelW, tBarH, 8); ctx.fill(); }
  var titleCoinIcon = isImageReady(allgoldImg) ? allgoldImg : goldImg;
  drawSprite(titleCoinIcon, coinX + 6 + tIcon / 2, tTop + tBarH / 2 + coinOy, tIcon, tIcon);
  drawResourceText('× ', totalCoins, coinX + tIcon + 10, tTop + tBarH / 2 + coinOy, resTextMax);
  if (secretFlashTimer > 0) drawOutlinedText(secretFlashText, coinX + tIcon + 10, tTop + tBarH / 2 + coinOy + 14, 'bold 11px Segoe UI', 'left');
  drawResourceBarBg(cryX, tTop + coinOy, panelW, tBarH);
  if (isImageReady(crystalImg)) drawSprite(crystalImg, cryX + 6 + tIcon / 2, tTop + tBarH / 2 + coinOy, tIcon, tIcon);
  else {
    ctx.fillStyle = '#7FDBFF'; ctx.beginPath();
    ctx.moveTo(cryX + 20, tTop + 12 + coinOy); ctx.lineTo(cryX + 32, tTop + 24 + coinOy);
    ctx.lineTo(cryX + 20, tTop + 36 + coinOy); ctx.lineTo(cryX + 8, tTop + 24 + coinOy);
    ctx.closePath(); ctx.fill();
  }
  drawResourceText('× ', totalCrystals, cryX + tIcon + 10, tTop + tBarH / 2 + coinOy, resTextMax);
  drawResourceBarBg(rollX, tTop + coinOy, panelW, tBarH);
  if (isImageReady(rollImg)) drawSprite(rollImg, rollX + 6 + tIcon / 2, tTop + tBarH / 2 + coinOy, tIcon, tIcon);
  else {
    ctx.fillStyle = '#E57373'; ctx.beginPath();
    ctx.arc(rollX + 20, tTop + tBarH / 2 + coinOy, 12, 0, Math.PI * 2); ctx.fill();
  }
  drawResourceText('× ', totalRolls, rollX + tIcon + 10, tTop + tBarH / 2 + coinOy, resTextMax);
  drawOutlinedText('Выбери персонажа', WIDTH / 2, 222, 'bold 16px Segoe UI, Arial', 'center');
  var spiritBtnSize = 60, spiritBtnX = WIDTH - 40, spiritBtnY = 205;
  titleLayout._spiritBtn = { x: spiritBtnX - spiritBtnSize / 2, y: spiritBtnY - spiritBtnSize / 2, w: spiritBtnSize, h: spiritBtnSize };
  ctx.save(); ctx.translate(spiritBtnX, spiritBtnY);
  if (isImageReady(spiritIconImg)) ctx.drawImage(spiritIconImg, -spiritBtnSize / 2 - 4, -spiritBtnSize / 2 - 4, spiritBtnSize + 8, spiritBtnSize + 8);
  else { ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.arc(0, 0, spiritBtnSize / 2 + 4, 0, Math.PI * 2); ctx.fill(); }
  if (selectedSpirit >= 0 && unlockedSpirits[selectedSpirit] && isImageReady(spiritImgs[selectedSpirit])) {
    ctx.globalAlpha = 0.8; ctx.drawImage(spiritImgs[selectedSpirit], -spiritBtnSize / 2, -spiritBtnSize / 2, spiritBtnSize, spiritBtnSize);
  } else {
    ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.font = '30px Segoe UI'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('+', 0, 0);
  }
  ctx.restore();
  drawOutlinedText('Дух', spiritBtnX, spiritBtnY + spiritBtnSize / 2 + 14, 'bold 12px Segoe UI', 'center');
  var positions = getCharPositions();
  titleLayout._buyBtns = [];
  titleInfoBtns = [];
  for (var i = 0; i < 6; i++) {
    var shakeT = charShake[i] || 0;
    var sx = shakeT > 0 ? Math.sin(shakeT * 2.5) * 5 : 0;
    var sy = shakeT > 0 ? Math.cos(shakeT * 3.1) * 3 : 0;
    var baseX = positions[i].x, baseY = positions[i].y;
    var size = titleLayout.charSize;
    var unlocked = isCharUnlocked(i);
    var isSelected = selectedCharacter === i && unlocked;
    var info = CHAR_INFO[i];
    var targetScale = isSelected ? 1.18 : 1;
    charSelectScale[i] += (targetScale - charSelectScale[i]) * 0.14;
    var sc = charSelectScale[i];
    var pad = 8, cardW = size + pad * 2, cardH = size + pad * 2, radius = 16;
    var cx0 = baseX + size / 2 + sx, cy0 = baseY + size / 2 + sy;
    var x = cx0 - size / 2, y = cy0 - size / 2;
    var cardX = x - pad, cardY = y - pad;
    ctx.save(); ctx.translate(cx0, cy0); ctx.scale(sc, sc); ctx.translate(-cx0, -cy0);
    if (isImageReady(frameImg)) ctx.drawImage(frameImg, cardX - 4, cardY - 4, cardW + 8, cardH + 8);
    else {
      ctx.fillStyle = 'rgba(60, 65, 80, 0.45)'; roundRect(cardX, cardY, cardW, cardH, radius); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 1.5;
      roundRect(cardX + 1, cardY + 1, cardW - 2, cardH - 2, radius - 1); ctx.stroke();
    }
    var skIdx = selectedSkins[i];
    var pimg = (skIdx > 0 && isImageReady(playerSkinImgs[i][skIdx - 1]) && playerSkinImgs[i][skIdx - 1].naturalWidth > 0) ? playerSkinImgs[i][skIdx - 1] : playerImgs[i];
    if (isImageReady(pimg)) {
      var asp = pimg.naturalWidth / pimg.naturalHeight;
      var dw = size, dh = size / asp;
      if (dh > size) { dh = size; dw = size * asp; }
      var idleBob = isSelected ? Math.sin(performance.now() / 400) * 2 : 0;
      ctx.drawImage(pimg, x + (size - dw) / 2, y + (size - dh) / 2 + idleBob, dw, dh);
    }
    var setS = 24, setX = cardX + cardW - setS - 3, setY = cardY + 3;
    if (isImageReady(playerUpImg)) ctx.drawImage(playerUpImg, setX, setY, setS, setS);
    else if (isImageReady(settingImg)) ctx.drawImage(settingImg, setX, setY, setS, setS);
    else {
      ctx.fillStyle = 'rgba(255,255,255,0.2)'; roundRect(setX, setY, setS, setS, 6); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 14px Segoe UI'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('⬆', setX + setS / 2, setY + setS / 2 + 1); ctx.textBaseline = 'alphabetic';
    }
    titleInfoBtns.push({ i: i, x: setX - 2, y: setY - 2, w: setS + 4, h: setS + 4 });
    if (!unlocked) {
      ctx.fillStyle = shakeT > 0 ? 'rgba(120,0,0,0.5)' : 'rgba(0,0,0,0.45)';
      roundRect(cardX, cardY, cardW, cardH, radius); ctx.fill();
      if (isImageReady(closeImg)) { var csz = Math.floor(size / 2); ctx.drawImage(closeImg, x + (size - csz) / 2, y + (size - csz) / 2, csz, csz); }
      else { ctx.fillStyle = TEXT_COL; ctx.font = '22px Segoe UI'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('🔒', x + size / 2, y + size / 2 - 2); ctx.textBaseline = 'alphabetic'; }
    }
    drawOutlinedText('Ур: ' + (charLevels[i] || 1), cardX + cardW - 6, cardY + cardH - 8, 'bold 11px Segoe UI, Arial', 'right');
    ctx.restore();
    drawOutlinedText(info.name, baseX + size / 2 + sx, cardY - 10 - (sc - 1) * cardH * 0.35, 'bold 13px Segoe UI, Arial', 'center');
    if (!unlocked) {
      var buyW = size + 10, buyH = 28;
      var buyX = baseX - 5, buyY = cardY + cardH + 6;
      if (info.unlock === 'coins') {
        var canAfford = totalCoins >= info.price;
        if (isImageReady(priceImg)) { ctx.save(); if (!canAfford) ctx.globalAlpha = 0.55; ctx.drawImage(priceImg, buyX + sx, buyY + sy, buyW, buyH); ctx.restore(); }
        else { ctx.fillStyle = canAfford ? 'rgba(78, 205, 196, 0.95)' : 'rgba(80,80,90,0.9)'; roundRect(buyX + sx, buyY + sy, buyW, buyH, 8); ctx.fill(); }
        if (isImageReady(goldImg)) ctx.drawImage(goldImg, buyX + 16 + sx, buyY + 5 + sy, 18, 18);
        ctx.fillStyle = TEXT_COL; ctx.font = 'bold 11px Segoe UI'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        var priceStr = info.price >= 1000 ? (info.price / 1000) + 'k' : String(info.price);
        ctx.fillText(priceStr, buyX + 36 + sx, buyY + buyH / 2 + sy);
        ctx.textBaseline = 'alphabetic';
        titleLayout._buyBtns.push({ i: i, x: buyX, y: buyY, w: buyW, h: buyH });
      }
    }
  }
  var menuKeys = ['start', 'levels', 'missions', 'settings'];
  var btnSize = 84, btnGap = 10;
  var rowW = 4 * btnSize + 3 * btnGap;
  var rowX = (WIDTH - rowW) / 2;
  var rowY = titleLayout.startBtnY - 8;
  var lastClearedLevel = 0;
  try { for (var k in levelsCompleted) { if (levelsCompleted[k]) { var n = parseInt(k, 10); if (n > lastClearedLevel) lastClearedLevel = n; } } } catch (e) {}
  var missionsLeft = 0;
  try { var totalM = MISSIONS.length; var doneC = 0; for (var k in missionsDone) if (missionsDone[k]) doneC++; missionsLeft = Math.max(0, totalM - doneC); } catch (e) { missionsLeft = 0; }
  var menuLabels = [{ top: 'Режим', bot: '∞' }, { top: 'Уровни', bot: String(lastClearedLevel) }, { top: 'Задания', bot: String(missionsLeft) }, { top: 'Настройки', bot: '⚙' }];
  titleLayout._menuBtns = [];
  for (var i = 0; i < 4; i++) {
    var bx = rowX + i * (btnSize + btnGap);
    var by2 = rowY;
    var pressed = beginPressTransform(bx, by2, btnSize, btnSize);
    if (isImageReady(menuItemImg)) ctx.drawImage(menuItemImg, bx, by2, btnSize, btnSize);
    else if (isImageReady(frameImg)) ctx.drawImage(frameImg, bx, by2, btnSize, btnSize);
    else { ctx.fillStyle = 'rgba(60, 50, 40, 0.95)'; roundRect(bx, by2, btnSize, btnSize, 12); ctx.fill(); }
    var lb = menuLabels[i];
    drawOutlinedText(lb.top, bx + btnSize / 2, by2 + 22, 'bold 12px Segoe UI, Arial', 'center');
    var botFont = (lb.bot === '∞') ? 'bold 36px Segoe UI, Arial' : 'bold 24px Segoe UI, Arial';
    drawOutlinedText(lb.bot, bx + btnSize / 2, by2 + btnSize / 2 + 12, botFont, 'center');
    endPressTransform(pressed, bx, by2, btnSize, btnSize);
    titleLayout._menuBtns.push({ key: menuKeys[i], x: bx, y: by2, w: btnSize, h: btnSize });
  }
  titleLayout._btnX = titleLayout._menuBtns[0].x;
  titleLayout._btnY = titleLayout._menuBtns[0].y;
  titleLayout._btnW = btnSize;
  titleLayout._btnH = btnSize;
  drawHUDButtons();
  if (titleMenu) drawTitleMenuPanel();
  if ((charInfoPopup >= 0 && charInfoPopup < CHAR_INFO.length) || charInfoTargetSlide > 0.5) {
    if (charInfoPopup >= 0 && charInfoPopup < CHAR_INFO.length) {
      if (charInfoTargetSlide === 0) {
        charInfoSlide -= 0.12;
        if (charInfoSlide <= 0) { charInfoSlide = 0; charInfoTargetSlide = 0; charInfoPopup = -1; }
      } else {
        charInfoSlide += (1 - charInfoSlide) * 0.15;
      }
    }
    if (charInfoPopup >= 0 && charInfoPopup < CHAR_INFO.length) {
      popupFade = Math.min(1, popupFade + 0.1) * charInfoSlide;
      var info = CHAR_INFO[charInfoPopup];
      var cis = Math.min(1, Math.max(0, charInfoSlide));
      var isInfoClosing = charInfoTargetSlide === 0;
      var infoScale = isInfoClosing ? 1 : cis;
      var infoAlpha = isInfoClosing ? cis : cis;
      var ox = charInfoOriginX, oy = charInfoOriginY;
      ctx.fillStyle = 'rgba(0,0,0,' + (0.55 * infoAlpha) + ')'; ctx.fillRect(0, 0, WIDTH, HEIGHT);
      ctx.save();
      ctx.globalAlpha = infoAlpha;
      if (!isInfoClosing) { ctx.translate(ox, oy); ctx.scale(infoScale, infoScale); ctx.translate(-ox, -oy); }
      var pw = Math.min(300, WIDTH - 30), ph = 320;
      var px = (WIDTH - pw) / 2, py = (HEIGHT - ph) / 2 - 10;
      ctx.globalAlpha = popupFade;
      drawMenuPanelBg(px, py, pw, ph, 16);
      var ci = charInfoPopup;
      var lvl = charLevels[ci] || 1;

      var ccx = px + pw - 24, ccy = py + 30;
      drawOutlinedText('×', ccx, ccy, 'bold 20px Segoe UI, Arial', 'center');
      titleLayout._infoClose = { x: ccx - 14, y: ccy - 14, w: 28, h: 28 };

      var av = 56, avX = px + 16, avY = py + 36;
      var cSkIdx = selectedSkins[ci];
      var cimg = (cSkIdx > 0 && isImageReady(playerSkinImgs[ci][cSkIdx - 1]) && playerSkinImgs[ci][cSkIdx - 1].naturalWidth > 0) ? playerSkinImgs[ci][cSkIdx - 1] : playerImgs[ci];
      if (isImageReady(cimg)) {
        var casp = cimg.naturalWidth / cimg.naturalHeight;
        var cdw = av, cdh = av / casp;
        if (cdh > av) { cdh = av; cdw = av * casp; }
        ctx.drawImage(cimg, avX + (av - cdw) / 2, avY + (av - cdh) / 2, cdw, cdh);
      }
      var textCX = px + pw / 2;
      var nameY = py + 50;
      drawOutlinedText(info.name, textCX, nameY, 'bold 18px Segoe UI, Arial', 'center');
      drawOutlinedText('Ур: ' + lvl + '  |  ' + info.label, textCX, nameY + 18, 'bold 12px Segoe UI, Arial', 'center');

      var lines = wrapTextStrict(info.desc, pw - 30, 12);
      var descY = nameY + 61;
      for (var li = 0; li < lines.length; li++) { drawOutlinedText(lines[li], textCX, descY, '12px Segoe UI, Arial', 'center'); descY += 15; }

      var skinY = descY + 10;
      drawOutlinedText('Скины:', textCX, skinY, 'bold 12px Segoe UI, Arial', 'center');
      skinY += 10;

      var skinSize = 44, skinGap = 6;
      var arrowW = 28;
      var skinClipX = px + arrowW + 4, skinClipW = pw - arrowW * 2 - 8;
      var skinRowH = skinSize + 16;
      var ci2 = ci;
      var allSkins = [{ img: playerImgs[ci2], label: 'Основ.', idx: 0 }];
      for (var si = 0; si < MAX_SKINS; si++) {
        if (isImageReady(playerSkinImgs[ci2][si]) && playerSkinImgs[ci2][si].naturalWidth > 0) {
          allSkins.push({ img: playerSkinImgs[ci2][si], label: '#' + (si + 1), idx: si + 1 });
        }
      }
      var skinCount = allSkins.length;
      var totalSkinW = skinCount * (skinSize + skinGap) - skinGap;
      var maxScroll = Math.max(0, totalSkinW - skinClipW);
      skinScrollX = Math.max(0, Math.min(skinScrollX, maxScroll));

      var arrowBtnSize = 24;
      var arrowCY = skinY + skinRowH / 2;
      if (skinScrollX > 2) {
        var alX = px + 4, alY = arrowCY - arrowBtnSize / 2;
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        roundRect(alX, alY, arrowBtnSize, arrowBtnSize, 6); ctx.fill();
        drawOutlinedText('‹', alX + arrowBtnSize / 2, alY + arrowBtnSize / 2 + 1, 'bold 18px Segoe UI, Arial', 'center');
        titleLayout._infoSkinLeft = { x: alX, y: alY, w: arrowBtnSize, h: arrowBtnSize };
      } else {
        titleLayout._infoSkinLeft = null;
      }
      if (skinScrollX < maxScroll - 2) {
        var arX = px + pw - 4 - arrowBtnSize, arY = arrowCY - arrowBtnSize / 2;
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        roundRect(arX, arY, arrowBtnSize, arrowBtnSize, 6); ctx.fill();
        drawOutlinedText('›', arX + arrowBtnSize / 2, arY + arrowBtnSize / 2 + 1, 'bold 18px Segoe UI, Arial', 'center');
        titleLayout._infoSkinRight = { x: arX, y: arY, w: arrowBtnSize, h: arrowBtnSize };
      } else {
        titleLayout._infoSkinRight = null;
      }

      ctx.save();
      ctx.beginPath();
      ctx.rect(skinClipX, skinY, skinClipW, skinRowH);
      ctx.clip();
      skinHits = [];
      for (var si2 = 0; si2 < allSkins.length; si2++) {
        var sk = allSkins[si2];
        var sx = skinClipX + si2 * (skinSize + skinGap) - skinScrollX;
        if (sx + skinSize < skinClipX - 10 || sx > skinClipX + skinClipW + 10) {
          skinHits.push(null);
          continue;
        }
        var isActive = (selectedSkins[ci] === sk.idx);
        if (isActive) {
          ctx.strokeStyle = '#FFD700'; ctx.lineWidth = 2.5;
          roundRect(sx + 1, skinY + 1, skinSize - 2, skinSize - 2, 7); ctx.stroke();
        }
        var sasp = sk.img.naturalWidth / sk.img.naturalHeight;
        var sdw = skinSize, sdh = skinSize / sasp;
        if (sdh > skinSize) { sdh = skinSize; sdw = skinSize * sasp; }
        ctx.drawImage(sk.img, sx + (skinSize - sdw) / 2, skinY + (skinSize - sdh) / 2, sdw, sdh);
        drawOutlinedText(sk.label, sx + skinSize / 2, skinY + skinSize + 12, '9px Segoe UI, Arial', 'center');
        skinHits.push({ x: sx, y: skinY, w: skinSize, h: skinSize, ci: ci, si: sk.idx });
      }
      ctx.restore();

      var curSkin = selectedSkins[ci];
      var curLabel = curSkin === 0 ? 'Основной' : ('Скин #' + curSkin);
      drawOutlinedText('Выбран: ' + curLabel, textCX, skinY + skinRowH + 12, 'bold 11px Segoe UI, Arial', 'center');

      var upY = skinY + skinRowH + 42;
      var rstBtnSize = 34;
      var upW = Math.min(160, pw - rstBtnSize - 34), upH = 34;
      var upX = px + (pw - upW - rstBtnSize - 6) / 2;
      var atMax = lvl >= 99;
      var canUp = isCharUnlocked(ci) && totalCrystals >= CHAR_UPGRADE_COST && !atMax;
      drawKeycapBtn(upX, upY, upW, upH, '', TEXT_COL);
      if (isImageReady(crystalImg) && !atMax) ctx.drawImage(crystalImg, upX + 10, upY + (upH - 18) / 2, 18, 18);
      var upLabel = atMax ? 'МАКС. УР. 99' : ('Улучшить ×' + CHAR_UPGRADE_COST);
      drawOutlinedText(upLabel, upX + upW / 2 + (atMax ? 0 : 4), upY + upH / 2, 'bold 11px Segoe UI, Arial', 'center');
      if (!canUp) { ctx.fillStyle = 'rgba(0,0,0,0.35)'; roundRect(upX, upY, upW, upH, 8); ctx.fill(); }
      drawOutlinedText('Падение −' + fallReducePercent(ci) + '%', upX + upW / 2, upY - 6, 'bold 10px Segoe UI, Arial', 'center');
      titleLayout._infoUpgrade = { x: upX, y: upY, w: upW, h: upH, i: ci };

      var rstX = upX + upW + 6, rstY = upY, rstW = rstBtnSize, rstH = rstBtnSize;
      var canReset = lvl > 1;
      drawKeycapBtn(rstX, rstY, rstW, rstH, '', '#a33');
      drawOutlinedText('↻', rstX + rstW / 2, rstY + rstH / 2 + 1, 'bold 18px Segoe UI, Arial', 'center');
      if (!canReset) { ctx.fillStyle = 'rgba(0,0,0,0.4)'; roundRect(rstX, rstY, rstW, rstH, 8); ctx.fill(); }
      titleLayout._infoReset = { x: rstX, y: rstY, w: rstW, h: rstH, i: ci };

      titleLayout._infoPanel = { x: px, y: py, w: pw, h: ph };
      titleLayout._infoSkinClip = { x: skinClipX, y: skinY, w: skinClipW, h: skinRowH };
      ctx.restore();
    }
  } else {
    popupFade = 0;
    titleLayout._infoClose = null; titleLayout._infoPanel = null;
    titleLayout._infoUpgrade = null; titleLayout._infoReset = null;
    titleLayout._infoSkin = null;
    titleLayout._infoSkinLeft = null; titleLayout._infoSkinRight = null;
  }
  drawSpiritShop();
}

function drawSpiritShop() {
  if (!spiritShopOpen && spiritShopSlide < 0.01) return;
  if (spiritShopTargetSlide === 0) {
    spiritShopSlide -= 0.12;
    if (spiritShopSlide <= 0) { spiritShopSlide = 0; spiritShopOpen = false; return; }
  } else {
    spiritShopSlide += (1 - spiritShopSlide) * 0.15;
  }
  var t = Math.min(1, Math.max(0, spiritShopSlide));
  var isSClose = spiritShopTargetSlide === 0;
  var scale = isSClose ? 1 : t;
  var alpha = isSClose ? t : t;
  popupFade = Math.min(1, popupFade + 0.12) * alpha;
  var ox = spiritShopOriginX, oy = spiritShopOriginY;
  ctx.save();
  ctx.globalAlpha = alpha;
  if (!isSClose) { ctx.translate(ox, oy); ctx.scale(scale, scale); ctx.translate(-ox, -oy); }
  if (isImageReady(backgroundMenuImg)) ctx.drawImage(backgroundMenuImg, 0, 0, WIDTH, HEIGHT);
  else if (isImageReady(bgImg)) ctx.drawImage(bgImg, 0, 0, WIDTH, HEIGHT);
  else { ctx.fillStyle = '#0a0a12'; ctx.fillRect(0, 0, WIDTH, HEIGHT); }
  ctx.save();
  ctx.globalAlpha = popupFade;
  var pw = WIDTH - 20, ph = HEIGHT - 40, px = 10, py = 20;
  drawMenuPanelBg(px, py, pw, ph, 20);
  drawMenuTitle('Магазин Духов', WIDTH / 2, py + 50, 240, 48);
  var scx = px + pw - 28, scy = py + 32;
  drawOutlinedText('×', scx, scy, 'bold 22px Segoe UI, Arial', 'center');
  titleLayout._spiritShopClose = { x: scx - 16, y: scy - 16, w: 32, h: 32 };
  var itemH = 90, startY = py + 90;
  spiritShopHits = [];
  ctx.save(); ctx.beginPath(); ctx.rect(px, startY, pw, ph - 110); ctx.clip();
  for (var i = 0; i < 6; i++) {
    var iy = startY + i * itemH - spiritShopScrollY;
    if (iy + itemH < startY || iy > startY + ph - 110) continue;
    var isUnlockedChar = isCharUnlocked(i);
    var isBoughtSpirit = unlockedSpirits[i];
    var isSel = selectedSpirit === i;
    ctx.fillStyle = isSel ? 'rgba(78, 205, 196, 0.2)' : 'rgba(255,255,255,0.05)';
    roundRect(px + 10, iy + 5, pw - 20, itemH - 10, 10); ctx.fill();
    var iconSize = 50, iconX = px + 20, iconY = iy + (itemH - iconSize) / 2;
    if (isImageReady(spiritImgs[i])) { ctx.globalAlpha = isUnlockedChar ? 1 : 0.3; ctx.drawImage(spiritImgs[i], iconX, iconY, iconSize, iconSize); ctx.globalAlpha = 1; }
    else { ctx.fillStyle = '#555'; ctx.fillRect(iconX, iconY, iconSize, iconSize); }
    var textX = iconX + iconSize + 15;
    drawOutlinedText(CHAR_INFO[i].name, textX, iy + 25, 'bold 16px Segoe UI', 'left');
    ctx.fillStyle = TEXT_COL;
    var descFontSize = 10;
    ctx.font = descFontSize + 'px Segoe UI, Arial';
    var btnW = 100, btnMargin = 10, maxDescW = pw - 60 - btnW - btnMargin;
    var lines = wrapTextStrict(SPIRIT_DESC[i], maxDescW, descFontSize);
    var ty = iy + 48, lineHeight = 13;
    for (var li = 0; li < lines.length; li++) { ctx.fillText(lines[li], textX, ty); ty += lineHeight; }
    var bx = px + pw - btnW - 20, by = iy + (itemH - 30) / 2;
    if (isBoughtSpirit) {
      if (isSel) drawKeycapBtn(bx, by, btnW, 30, 'Выбран', '#4CAF50');
      else { drawKeycapBtn(bx, by, btnW, 30, 'Выбрать', TEXT_COL); spiritShopHits.push({ type: 'select', idx: i, x: bx, y: by, w: btnW, h: 30 }); }
    } else {
      if (!isUnlockedChar) {
        ctx.fillStyle = 'rgba(100,100,100,0.5)'; roundRect(bx, by, btnW, 30, 8); ctx.fill();
        drawOutlinedText('Закрыто', bx + btnW / 2, by + 15, 'bold 12px Segoe UI', 'center');
      } else {
        drawKeycapBtn(bx, by, btnW, 30, '', TEXT_COL);
        if (isImageReady(rollImg)) ctx.drawImage(rollImg, bx + 10, by + 5, 20, 20);
        var rollPriceStr = SPIRIT_PRICE >= 1000 ? Math.floor(SPIRIT_PRICE / 1000) + 'k' : String(SPIRIT_PRICE);
        drawOutlinedText(rollPriceStr, bx + 35, by + 15, 'bold 12px Segoe UI', 'left');
        spiritShopHits.push({ type: 'buy', idx: i, x: bx, y: by, w: btnW, h: 30 });
      }
    }
  }
  ctx.restore();
  ctx.restore();
  ctx.restore();
}

function drawTitleMenuPanel() {
  if (menuTargetSlide === 0) {
    menuSlide -= 0.12;
    if (menuSlide <= 0) { menuSlide = 0; titleMenu = null; return; }
  } else {
    menuSlide += (1 - menuSlide) * 0.15;
  }
  var t = Math.min(1, Math.max(0, menuSlide));
  var pw = WIDTH, ph = HEIGHT;
  var ox = menuOriginX, oy = menuOriginY;
  var isClosing = menuTargetSlide === 0;
  var scale = isClosing ? 1 : t;
  var alpha = isClosing ? t : (t < 0.15 ? t / 0.15 : 1);
  ctx.save();
  ctx.globalAlpha = alpha;
  if (!isClosing) { ctx.translate(ox, oy); ctx.scale(scale, scale); ctx.translate(-ox, -oy); }
  if (isImageReady(bgImg)) ctx.drawImage(bgImg, 0, 0, pw, ph);
  else { ctx.fillStyle = 'rgba(22, 24, 40, 1)'; ctx.fillRect(0, 0, pw, ph); }
  ctx.fillStyle = 'rgba(8, 10, 24, 0.35)'; ctx.fillRect(0, 0, pw, ph);
  var titles = { levels: 'Уровни', missions: 'Задания', settings: 'Настройки' };
  drawMenuTitle(titles[titleMenu] || '', pw / 2, 36, 220, 48);
  var ccx = pw - 28, ccy = 28;
  drawOutlinedText('×', ccx, ccy, 'bold 22px Segoe UI, Arial', 'center');
  titleLayout._menuClose = { x: ccx - 16, y: ccy - 16, w: 32, h: 32 };
  titleLayout._menuHits = [];
  if (titleMenu === 'levels') {
    var cols = 5, cellS = 58, cellW = cellS, cellH = cellS, gap = 8;
    var gridW = cols * cellW + (cols - 1) * gap;
    var gx0 = (WIDTH - gridW) / 2;
    var rows = Math.ceil(100 / cols);
    var contentH = rows * (cellH + gap);
    var viewTop = 71, viewH = ph - 87;
    levelScrollMax = Math.max(0, contentH - viewH);
    levelScrollY = Math.max(0, Math.min(levelScrollMax, levelScrollY));
    if (!levelDrag && Math.abs(levelScrollV) > 0.05) {
      levelScrollY += levelScrollV; levelScrollV *= 0.92;
      if (levelScrollY < 0) { levelScrollY = 0; levelScrollV = 0; }
      if (levelScrollY > levelScrollMax) { levelScrollY = levelScrollMax; levelScrollV = 0; }
    }
    titleLayout._levelClip = { x: 4, y: viewTop, w: pw - 8, h: viewH };
    ctx.save(); ctx.beginPath(); ctx.rect(4, viewTop, pw - 8, viewH); ctx.clip();
    for (var n = 1; n <= 100; n++) {
      var idx = n - 1;
      var col = idx % cols, row = Math.floor(idx / cols);
      var gx = gx0 + col * (cellW + gap);
      var gy2 = viewTop + row * (cellH + gap) - levelScrollY;
      if (gy2 + cellH < viewTop - 4 || gy2 > viewTop + viewH + 4) continue;
      var unl = isLevelUnlocked(n);
      var done = !!levelsCompleted[n];
      var bg = getLevelRangeImg(n);
      var lvlPressed = beginPressTransform(gx, gy2, cellW, cellH);
      if (isImageReady(bg)) { ctx.save(); if (!unl) ctx.globalAlpha = 0.35; else if (done) ctx.globalAlpha = 0.9; ctx.drawImage(bg, gx, gy2, cellW, cellH); ctx.restore(); }
      else { ctx.fillStyle = done ? 'rgba(78,205,196,0.35)' : (unl ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.35)'); roundRect(gx, gy2, cellW, cellH, 8); ctx.fill(); }
      ctx.font = 'bold 20px Segoe UI, Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      var numX = gx + cellW / 2, numY = gy2 + cellH / 2;
      ctx.lineJoin = 'round'; ctx.miterLimit = 2; ctx.strokeStyle = TEXT_COL; ctx.lineWidth = 3.5;
      ctx.strokeText(String(n), numX, numY);
      ctx.fillStyle = '#ffffff'; ctx.fillText(String(n), numX, numY);
      ctx.textBaseline = 'alphabetic';
      if (done && isImageReady(completeImg)) { var cs = Math.floor(cellS * 0.38); ctx.drawImage(completeImg, gx + cellW - cs - 2, gy2 + cellH - cs - 2, cs, cs); }
      if (!unl && isImageReady(closeImg)) { var cs2 = Math.floor(cellS / 2); ctx.drawImage(closeImg, gx + (cellW - cs2) / 2, gy2 + (cellH - cs2) / 2, cs2, cs2); }
      endPressTransform(lvlPressed, gx, gy2, cellW, cellH);
      if (unl) titleLayout._menuHits.push({ type: 'level', n: n, x: gx, y: gy2, w: cellW, h: cellH });
    }
    ctx.restore();
    if (levelScrollMax > 0) {
      var barH = Math.max(24, viewH * (viewH / contentH));
      var barY = viewTop + (viewH - barH) * (levelScrollY / levelScrollMax);
      ctx.fillStyle = 'rgba(255,255,255,0.2)'; roundRect(pw - 10, barY, 4, barH, 2); ctx.fill();
    }
    drawOutlinedText('свайп ↑↓', WIDTH / 2, ph - 14, 'bold 12px Segoe UI, Arial', 'center');
  }
  if (titleMenu === 'missions') {
    var sorted = MISSIONS.map(function(m) {
      var done = !!missionsDone[m.id];
      var progress = getMissionProgress(m);
      var ready = !done && progress >= m.need;
      var order = ready ? 0 : (done ? 2 : 1);
      return { m: m, done: done, progress: progress, ready: ready, order: order };
    }).sort(function(a, b) { return a.order - b.order || a.m.id - b.m.id; });
    var rowH = 88, scrollW = pw - 24, scrollH = rowH - 6;
    var viewTop2 = 63, viewH2 = ph - 115;
    var contentH2 = sorted.length * rowH;
    missionScrollMax = Math.max(0, contentH2 - viewH2);
    missionScrollY = Math.max(0, Math.min(missionScrollMax, missionScrollY));
    if (!missionDrag && Math.abs(missionScrollV) > 0.05) {
      missionScrollY += missionScrollV; missionScrollV *= 0.92;
      if (missionScrollY < 0) { missionScrollY = 0; missionScrollV = 0; }
      if (missionScrollY > missionScrollMax) { missionScrollY = missionScrollMax; missionScrollV = 0; }
    }
    titleLayout._missionClip = { x: 4, y: viewTop2, w: pw - 8, h: viewH2 };
    ctx.save(); ctx.beginPath(); ctx.rect(4, viewTop2, pw - 8, viewH2); ctx.clip();
    for (var i = 0; i < sorted.length; i++) {
      var s = sorted[i], m = s.m;
      var sx0 = 12, my = viewTop2 + i * rowH - missionScrollY;
      if (my + scrollH < viewTop2 - 4 || my > viewTop2 + viewH2 + 4) continue;
      var midX = sx0 + scrollW / 2;
      if (isImageReady(scrollImg)) { ctx.save(); if (s.done) ctx.globalAlpha = 0.7; ctx.drawImage(scrollImg, sx0, my, scrollW, scrollH); ctx.restore(); }
      else { ctx.fillStyle = s.done ? 'rgba(78,205,196,0.18)' : 'rgba(255,255,255,0.1)'; roundRect(sx0, my, scrollW, scrollH, 12); ctx.fill(); }
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = TEXT_COL;
      ctx.font = 'bold 13px Segoe UI';
      var title = m.text;
      var maxTw = scrollW - 100;
      if (ctx.measureText(title).width > maxTw) { while (title.length > 8 && ctx.measureText(title + '…').width > maxTw) title = title.slice(0, -1); title += '…'; }
      ctx.fillText(title, midX, my + scrollH * 0.32);
      ctx.font = '12px Segoe UI'; ctx.fillStyle = TEXT_COL;
      ctx.fillText(Math.min(s.progress, m.need) + '/' + m.need + ' · монеты ×' + m.reward, midX, my + scrollH * 0.52);
      var rollLineY = my + scrollH * 0.72;
      if (isImageReady(rollImg)) ctx.drawImage(rollImg, midX - 36, rollLineY - 9, 18, 18);
      ctx.fillStyle = TEXT_COL; ctx.font = 'bold 12px Segoe UI'; ctx.textAlign = 'left';
      ctx.fillText('+' + MISSION_ROLL_REWARD, midX - 14, rollLineY + 1);
      ctx.textBaseline = 'alphabetic';
      if (s.done) { ctx.fillStyle = TEXT_COL; ctx.font = 'bold 14px Segoe UI'; ctx.textAlign = 'right'; ctx.fillText('✓', sx0 + scrollW - 24, my + scrollH / 2); }
      else if (s.ready) {
        var claimW = Math.round(80 * 0.7), claimH = Math.round(28 * 0.7);
        var claimX = sx0 + scrollW - 100, claimY = my + scrollH / 2 - claimH / 2;
        drawKeycapBtn(claimX, claimY, claimW, claimH, 'Забрать', '#783915');
        titleLayout._menuHits.push({ type: 'claim', id: m.id, reward: m.reward, x: claimX, y: claimY, w: claimW, h: claimH });
      }
    }
    ctx.restore();
    if (missionScrollMax > 0) {
      var barH2 = Math.max(24, viewH2 * (viewH2 / contentH2));
      var barY2 = viewTop2 + (viewH2 - barH2) * (missionScrollY / missionScrollMax);
      ctx.fillStyle = 'rgba(255,255,255,0.2)'; roundRect(pw - 10, barY2, 4, barH2, 2); ctx.fill();
    }
    var claimable = sorted.filter(function(s) { return s.ready; });
    var claimAllY = ph - 42;
    if (claimable.length > 0) {
      var sum = claimable.reduce(function(s, c) { return s + c.m.reward; }, 0);
      drawKeycapBtn(40, claimAllY, pw - 80, 34, 'Забрать все (' + claimable.length + ') · ×' + sum, '#783915');
      titleLayout._menuHits.push({ type: 'claimAll', x: 40, y: claimAllY, w: pw - 80, h: 34 });
    }
    if (claimable.length === 0) drawOutlinedText('свайп ↑↓', WIDTH / 2, ph - 16, 'bold 12px Segoe UI, Arial', 'center');
  }
  if (titleMenu === 'settings') {
    var rowPad = 16, rxx = 20, rw = pw - 40, sy = 72;
    var rowH2 = 48;
    drawMenuPanelBg(rxx, sy, rw, rowH2, 14);
    drawOutlinedText('Музыка', rxx + rowPad, sy + rowH2 / 2, 'bold 15px Segoe UI, Arial', 'left');
    var tx = rxx + rw - 70, ty = sy + (rowH2 - 28) / 2, tw = 56, th = 28;
    var tp = beginPressTransform(tx, ty, tw, th);
    drawToggle(tx + 4, ty + 1, musicEnabled);
    endPressTransform(tp, tx, ty, tw, th);
    titleLayout._menuHits.push({ type: 'togMusic', x: tx, y: ty, w: tw, h: th });
    sy += rowH2 + 8;
    var rowH3 = 48;
    drawMenuPanelBg(rxx, sy, rw, rowH3, 14);
    drawOutlinedText('Звуки', rxx + rowPad, sy + rowH3 / 2, 'bold 15px Segoe UI, Arial', 'left');
    var tx2 = rxx + rw - 70, ty2 = sy + (rowH3 - 28) / 2, tw2 = 56, th2 = 28;
    var tp2 = beginPressTransform(tx2, ty2, tw2, th2);
    drawToggle(tx2 + 4, ty2 + 1, sfxEnabled);
    endPressTransform(tp2, tx2, ty2, tw2, th2);
    titleLayout._menuHits.push({ type: 'togSfx', x: tx2, y: ty2, w: tw2, h: th2 });
    sy += rowH3 + 8;
    var rowH3b = 48;
    drawMenuPanelBg(rxx, sy, rw, rowH3b, 14);
    drawOutlinedText('Вибро', rxx + rowPad, sy + rowH3b / 2, 'bold 15px Segoe UI, Arial', 'left');
    var tx3 = rxx + rw - 70, ty3 = sy + (rowH3b - 28) / 2, tw3 = 56, th3 = 28;
    var tp3 = beginPressTransform(tx3, ty3, tw3, th3);
    drawToggle(tx3 + 4, ty3 + 1, vibrationEnabled);
    endPressTransform(tp3, tx3, ty3, tw3, th3);
    titleLayout._menuHits.push({ type: 'togVibro', x: tx3, y: ty3, w: tw3, h: th3 });
    sy += rowH3b + 8;
    var rowH4 = 58;
    drawMenuPanelBg(rxx, sy, rw, rowH4, 14);
    drawOutlinedText('Громкость музыки', rxx + rowPad, sy + 16, 'bold 13px Segoe UI, Arial', 'left');
    drawSlider(rxx + rowPad, sy + 30, rw - rowPad * 2, musicVol);
    titleLayout._menuHits.push({ type: 'slMusic', x: rxx + rowPad, y: sy + 22, w: rw - rowPad * 2, h: 28 });
    sy += rowH4 + 8;
    var rowH5 = 58;
    drawMenuPanelBg(rxx, sy, rw, rowH5, 14);
    drawOutlinedText('Громкость эффектов', rxx + rowPad, sy + 16, 'bold 13px Segoe UI, Arial', 'left');
    drawSlider(rxx + rowPad, sy + 30, rw - rowPad * 2, sfxVol);
    titleLayout._menuHits.push({ type: 'slSfx', x: rxx + rowPad, y: sy + 22, w: rw - rowPad * 2, h: 28 });
    sy += rowH5 + 12;
    drawOutlinedText('Коды: monstergold · monsterall · monsterdell · openall', WIDTH / 2, sy + 8, 'bold 11px Segoe UI, Arial', 'center');
  }
  ctx.restore();
}
