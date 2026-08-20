function drawBackground() {
  var parallax = 0.25;
  var bgH = HEIGHT;
  var scroll = Math.floor(-cameraY * parallax);
  var offset = ((scroll % bgH) + bgH) % bgH;
  function drawBgLayer(img, alpha, pSpeed, xOffset) {
    if (!isImageReady(img) || alpha <= 0.001) return;
    var p = pSpeed || parallax;
    var s = Math.floor(-cameraY * p);
    var o = (((s + (xOffset || 0)) % bgH) + bgH) % bgH;
    ctx.save(); ctx.globalAlpha = alpha;
    for (var i = -1; i <= 2; i++) {
      var y = o + i * bgH - 1;
      ctx.drawImage(img, 0, y, WIDTH, bgH + 2);
    }
    ctx.restore();
  }
  if (currentLevel > 0 || levelWinLevel > 0) {
    var n = currentLevel > 0 ? currentLevel : levelWinLevel;
    var lvlBg = getLevelBgImg(n);
    if (isImageReady(lvlBg)) { drawBgLayer(lvlBg, 1); return; }
  }
  if (isImageReady(bg3Img)) drawBgLayer(bg3Img, 0.3, 0.08);
  if (isImageReady(bg2Img)) drawBgLayer(bg2Img, 1);
  else if (isImageReady(bgImg)) drawBgLayer(bgImg, 1);
  else {
    var grad = ctx.createLinearGradient(0, 0, 0, HEIGHT);
    grad.addColorStop(0, '#5B9BD5');
    grad.addColorStop(1, '#E0F7FA');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  }
}

function drawPlatform(p) {
  var bob = p.bob || 0;
  var screenY = p.y - cameraY + bob;
  if (screenY < -50 || screenY > HEIGHT + 50) return;
  if (p.broken && p.breakTimer > 8) return;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.35)';
  ctx.shadowBlur = 18; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 2;
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  roundRect(p.x - 2, screenY - 1, p.width + 4, p.height + 4, 10); ctx.fill();
  ctx.shadowBlur = 8; ctx.shadowColor = 'rgba(0,0,0,0.25)';
  ctx.fillStyle = 'rgba(0,0,0,0.08)';
  roundRect(p.x, screenY, p.width, p.height, 8); ctx.fill();
  ctx.restore();
  var baseImg = null;
  if (p.type === 'breaking') baseImg = brokenPlatformImg;
  else if (p.type === 'moving') baseImg = movingPlatformImg;
  else baseImg = platformImg;
  if (isImageReady(baseImg)) ctx.drawImage(baseImg, p.x, screenY, p.width, p.height);
  if (p.type === 'moving' && !p.broken && isImageReady(baseImg)) {
    var t = p.phase || 0;
    var shineX = p.x + ((Math.sin(t * 1.5) * 0.5 + 0.5) * (p.width - 20));
    var grad2 = ctx.createLinearGradient(shineX, screenY, shineX + 20, screenY);
    grad2.addColorStop(0, 'rgba(255,255,255,0)');
    grad2.addColorStop(0.5, 'rgba(255,255,255,0.45)');
    grad2.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad2;
    ctx.fillRect(p.x + 4, screenY + 2, p.width - 8, p.height - 4);
    ctx.fillStyle = TEXT_COL;
    var ax = p.dir > 0 ? p.x + p.width - 14 : p.x + 14;
    var ay = screenY + p.height / 2;
    ctx.beginPath();
    if (p.dir > 0) { ctx.moveTo(ax - 5, ay - 5); ctx.lineTo(ax + 4, ay); ctx.lineTo(ax - 5, ay + 5); }
    else { ctx.moveTo(ax + 5, ay - 5); ctx.lineTo(ax - 4, ay); ctx.lineTo(ax + 5, ay + 5); }
    ctx.closePath(); ctx.fill();
  }
  if (p.type === 'spring' && isImageReady(springImg)) {
    var springW = Math.min(42, p.width * 0.55);
    var aspect = springImg.naturalHeight / springImg.naturalWidth;
    var springH = springW * aspect;
    var springX = p.x + (p.width - springW) / 2;
    var springY = screenY - springH + 4;
    ctx.drawImage(springImg, springX, springY, springW, springH);
  }
}

function drawCoin(c) {
  if (c.collected) return;
  var screenY = c.y - cameraY + Math.sin(c.phase) * 3;
  if (screenY < -40 || screenY > HEIGHT + 40) return;
  var size = 32;
  var cx = c.x + c.width / 2;
  var cy = screenY + c.height / 2;
  drawSprite(goldImg, cx, cy, size, size, { shadow: 'rgba(255, 200, 0, 0.35)', blur: 6 });
}

function drawBonus(b) {
  if (b.collected) return;
  var screenY = b.y - cameraY;
  if (screenY < -50 || screenY > HEIGHT + 50) return;
  var cx = b.x + b.width / 2;
  var cy = screenY + b.height / 2;
  ctx.fillStyle = 'rgba(255, 215, 0, 0.25)';
  ctx.beginPath(); ctx.arc(cx, cy, 26, 0, Math.PI * 2); ctx.fill();
  drawSprite(bonusImg, cx, cy, 48, 48, { shadow: 'rgba(255, 180, 0, 0.4)', blur: 10 });
}

function drawSpirit() {
  if (selectedSpirit < 0) return;
  if (!unlockedSpirits[selectedSpirit]) return;
  var img = spiritImgs[selectedSpirit];
  if (!isImageReady(img)) return;
  var size = 48;
  var cx, cy;
  if (gameState === 'title' && !spiritShopOpen && charInfoPopup < 0 && titleMenu === null) {
    if (!titleLayout._spiritBtn) return;
    cx = titleLayout._spiritBtn.x + titleLayout._spiritBtn.w / 2;
    cy = titleLayout._spiritBtn.y + titleLayout._spiritBtn.h / 2;
    ctx.save(); ctx.translate(cx, cy);
    if (isImageReady(spiritIconImg)) {
      ctx.drawImage(spiritIconImg, -size / 2 - 4, -size / 2 - 4, size + 8, size + 8);
    } else {
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath(); ctx.arc(0, 0, size / 2 + 4, 0, Math.PI * 2); ctx.fill();
    }
    ctx.beginPath(); ctx.arc(0, 0, size / 2, 0, Math.PI * 2); ctx.clip();
    ctx.globalAlpha = 0.85;
    ctx.drawImage(img, -size / 2, -size / 2, size, size);
    ctx.restore(); return;
  }
  if (gameState !== 'playing' && gameState !== 'levelwin' && gameState !== 'dying') return;
  cx = player.x + player.width / 2;
  cy = (player.y - cameraY) + player.height - PLAYER_HEIGHT * 0.7;
  var time = Date.now() / 300;
  var hoverY = Math.sin(time) * 6;
  var offsetX = 45 * bonusVisualScale;
  var offsetY = -45 * bonusVisualScale + hoverY;
  var cos = Math.cos(playerTilt);
  var sin = Math.sin(playerTilt);
  var spiritX = cx + (offsetX * cos - offsetY * sin);
  var spiritY = cy + (offsetX * sin + offsetY * cos);
  ctx.save(); ctx.translate(spiritX, spiritY);
  ctx.beginPath(); ctx.arc(0, 0, size / 2, 0, Math.PI * 2); ctx.clip();
  ctx.globalAlpha = 0.85;
  ctx.drawImage(img, -size / 2, -size / 2, size, size);
  ctx.restore();
}

function drawPlayer() {
  var screenY = player.y - cameraY;
  var img = currentPlayerImg;
  var scale = bonusVisualScale;
  var tilt = playerTilt;
  var speedY = Math.abs(player.vy);
  var stretchY = 1, stretchX = 1;
  if (bonusVisualScale < 1.05) {
    if (player.vy < -2) { stretchY = 1 + Math.min(0.12, speedY * 0.008); stretchX = 1 / stretchY; }
    else if (player.vy > 4) { stretchY = 1 - Math.min(0.08, speedY * 0.005); stretchX = 1 / stretchY; }
    var moveStretch = Math.min(0.06, Math.abs(player.vx) * 0.008);
    stretchX *= 1 + moveStretch; stretchY *= 1 - moveStretch * 0.5;
  }
  stretchX *= landingSquashX * springStretchX;
  stretchY *= landingSquashY * springStretchY;
  if (invincibleTimer > 0 && Math.floor(invincibleTimer / 6) % 2 === 0) return;
  var deathAlpha = 1, deathSpin = 0;
  if (gameState === 'dying') { deathAlpha = Math.max(0, dyingTimer / 90); deathSpin = (90 - dyingTimer) * 0.1; }
  var aspect = isImageReady(img) ? img.naturalWidth / img.naturalHeight : 0.8;
  var drawH = PLAYER_HEIGHT * scale;
  var drawW = drawH * aspect;
  var drawX = player.x + (player.width - drawW) / 2;
  var drawY = screenY + player.height - drawH;
  var pcx = drawX + drawW / 2;
  var pcy = drawY + drawH * 0.7;
  var bodyCy = (extraLifeReady && invincibleTimer <= 0) ? pcy + 5 : pcy;
  if (gameState === 'playing' && bonusVisualScale < 1.05 && (Math.abs(player.vx) > 1.5 || player.vy < -3)) {
    for (var i = 1; i <= 3; i++) {
      var t = i / 4;
      var ox = -player.vx * i * 1.8;
      var oy = -player.vy * i * 0.35;
      ctx.save();
      ctx.globalAlpha = 0.12 * (1 - t) * deathAlpha;
      ctx.translate(pcx + ox, pcy + oy);
      ctx.rotate(tilt);
      ctx.scale(stretchX * (1 - t * 0.15), stretchY * (1 - t * 0.15));
      if (isImageReady(img)) ctx.drawImage(img, -drawW / 2, -drawH * 0.7, drawW, drawH);
      ctx.restore();
    }
  }
  if (shieldVisualScale > 0.02 && invincibleTimer <= 0 && gameState === 'playing') {
    var bx = pcx; var by = pcy - drawH * 0.1;
    var fw = (Math.max(drawW, drawH) * 1.35 + 10) * shieldVisualScale;
    var fh = fw;
    var pulse = 0.55 + 0.45 * Math.sin(Date.now() / 160);
    var sAlpha = Math.min(1, shieldVisualScale);
    ctx.save(); ctx.globalAlpha = sAlpha;
    var outer = ctx.createRadialGradient(bx, by, fw * 0.12, bx, by, fw * 0.8);
    outer.addColorStop(0, 'rgba(255, 100, 80, ' + (0.28 * pulse) + ')');
    outer.addColorStop(0.4, 'rgba(255, 40, 40, ' + (0.16 * pulse) + ')');
    outer.addColorStop(1, 'rgba(255, 0, 0, 0)');
    ctx.fillStyle = outer;
    ctx.beginPath(); ctx.arc(bx, by, fw * 0.8, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    ctx.save(); ctx.translate(bx, by); ctx.globalAlpha = sAlpha;
    ctx.shadowColor = 'rgba(255, 50, 40, ' + (0.8 + pulse * 0.2) + ')';
    ctx.shadowBlur = 30 + pulse * 18;
    ctx.rotate(shieldAngle);
    if (isImageReady(bonus2ShieldImg)) {
      ctx.globalAlpha = 0.4 * sAlpha;
      ctx.drawImage(bonus2ShieldImg, -fw / 2 - 3, -fh / 2 - 3, fw + 6, fh + 6);
      ctx.globalAlpha = sAlpha;
      ctx.drawImage(bonus2ShieldImg, -fw / 2, -fh / 2, fw, fh);
    } else {
      ctx.strokeStyle = 'rgba(255, 60, 60, ' + (0.75 + pulse * 0.25) + ')';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(0, 0, fw * 0.42, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();
    ctx.save(); ctx.globalAlpha = sAlpha;
    ctx.strokeStyle = 'rgba(255, 130, 110, ' + (0.3 + pulse * 0.25) + ')';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = 'rgba(255, 40, 40, 0.6)'; ctx.shadowBlur = 12;
    ctx.beginPath(); ctx.arc(bx, by, fw * (0.4 + pulse * 0.05), 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }
  ctx.save(); ctx.globalAlpha = deathAlpha;
  ctx.translate(pcx, bodyCy);
  ctx.rotate(tilt + deathSpin);
  ctx.scale(stretchX, stretchY);
  if (isImageReady(img)) {
    ctx.shadowColor = 'rgba(255,255,255,0.15)'; ctx.shadowBlur = 6; ctx.shadowOffsetY = 0;
    ctx.drawImage(img, -drawW / 2, -drawH * 0.7, drawW, drawH);
    ctx.shadowBlur = 0;
  }
  ctx.restore();
}

function drawScoreHUD() {
  if (gameState !== 'playing') return;
  scoreTarget = score;
  scoreDisplay += (scoreTarget - scoreDisplay) * 0.3;
  if (Math.abs(scoreDisplay - scoreTarget) < 0.5) scoreDisplay = scoreTarget;
  var topY = 10; var barH = 48; var leftX = 2; var iconSize = 30;
  drawResourceBarBg(leftX, topY, 118, barH);
  var totalIcon = isImageReady(allgoldImg) ? allgoldImg : goldImg;
  drawSprite(totalIcon, leftX + 6 + iconSize / 2, topY + barH / 2, iconSize, iconSize);
  drawResourceText('× ', totalCoins, leftX + iconSize + 10, topY + barH / 2, 118 - iconSize - 16);
  var scoreW = 150;
  var scoreX = (WIDTH - scoreW) / 2;
  drawResourceBarBg(scoreX, topY, scoreW, barH);
  if (currentLevel > 0 && levelTarget > 0) {
    drawOutlinedText('Цель × ' + levelTarget + ' m', scoreX + scoreW / 2, topY + 16, 'bold 14px Segoe UI, Arial', 'center');
  } else {
    if (isImageReady(liderImg)) drawSprite(liderImg, scoreX + 20, topY + 16, 20, 20);
    drawOutlinedText(bestScore + ' m', scoreX + scoreW / 2 + 8, topY + 16, 'bold 16px Segoe UI, Arial', 'center');
  }
  var displayScore = Math.floor(scoreDisplay);
  drawOutlinedText(displayScore + ' m', scoreX + scoreW / 2, topY + 34, 'bold 13px Segoe UI, Arial', 'center');
  drawBonusShop(leftX, topY + barH + 10);
}

function drawBonusShop(anchorX, anchorY) {
  shopHit = { b1: null, buy1: null, b2: null, buy2: null, b3: null, buy3: null };
  var colX = 2; var cellW = 56; var cellH = 52; var buyW = 60; var buyH = 24; var iconBox = 40; var gapY = 5;
  var y = anchorY;
  function drawBonusCell(which, img, count) {
    var cellX = colX;
    var cd = which === 1 ? cdBonus1 : (which === 2 ? cdBonus2 : cdBonus3);
    var busy = (which === 1 && (bonusActive || bonus1Pending)) || (which === 2 && (extraLifeReady || bonus2CdPending)) || (which === 3 && jumpBoostTimer > 0);
    drawResourceBarBg(cellX, y, cellW, cellH);
    var cx = cellX + cellW / 2; var cy = y + iconBox / 2 + 4;
    if (busy || cd > 0) ctx.globalAlpha = 0.4;
    drawSprite(img, cx, cy, iconBox, iconBox);
    ctx.globalAlpha = 1;
    if (cd > 0) {
      var progress = 1 - cd / ABILITY_COOLDOWN;
      var ringR = iconBox / 2 + 3;
      ctx.beginPath(); ctx.strokeStyle = 'rgba(0,0,0,0.45)'; ctx.lineWidth = 3; ctx.arc(cx, cy, ringR, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath();
      ctx.strokeStyle = which === 1 ? '#FFD700' : (which === 2 ? '#4FC3F7' : '#CE93D8');
      ctx.lineWidth = 3; ctx.lineCap = 'round';
      ctx.arc(cx, cy, ringR, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2); ctx.stroke();
      drawOutlinedText(String(Math.ceil(cd / 60)), cx, cy, 'bold 12px Segoe UI', 'center');
    }
    drawOutlinedText('×' + count, cellX + cellW - 5, y + cellH - 6, 'bold 11px Segoe UI', 'right');
    var useBox = { x: cellX, y: y, w: cellW, h: cellH };
    if (which === 1) shopHit.b1 = useBox;
    else if (which === 2) shopHit.b2 = useBox;
    else shopHit.b3 = useBox;
    y += cellH + 3;
  }
  function drawBuyCell(which, price) {
    var bx = colX;
    drawResourceBarBg(bx, y, buyW, buyH);
    drawSprite(goldImg, bx + 11, y + buyH / 2, 14, 14);
    drawOutlinedText('×' + price, bx + 20, y + buyH / 2, 'bold 11px Segoe UI', 'left');
    var buyBox = { x: bx, y: y, w: buyW, h: buyH };
    if (which === 1) shopHit.buy1 = buyBox;
    else if (which === 2) shopHit.buy2 = buyBox;
    else shopHit.buy3 = buyBox;
    y += buyH + gapY + 3;
  }
  drawBonusCell(1, bonusImg, invBonus1); drawBuyCell(1, BONUS1_PRICE);
  drawBonusCell(2, bonus2Img, invBonus2); drawBuyCell(2, BONUS2_PRICE);
  drawBonusCell(3, bonus3Img, invBonus3); drawBuyCell(3, BONUS3_PRICE);
}

function drawHUDButtons() {
  if (gameState === 'playing') {
    var bx = pauseBtn.x, by = pauseBtn.y, bs = pauseBtn.size;
    var pPress = beginPressTransform(bx, by, bs, bs);
    drawResourceBarBg(bx, by, bs, bs);
    if (isPaused) {
      drawOutlinedText('▶', bx + bs / 2, by + bs / 2, 'bold 22px Segoe UI, Arial', 'center');
      ctx.strokeStyle = 'rgba(78, 205, 196, 0.7)'; ctx.lineWidth = 2;
      roundRect(bx, by, bs, bs, 8); ctx.stroke();
    } else {
      var bw = 5, bh = 18, gap = 6;
      var pbx = bx + bs / 2 - (bw * 2 + gap) / 2;
      var pby = by + bs / 2 - bh / 2;
      ctx.lineJoin = 'round';
      [0, bw + gap].forEach(function(ox) {
        ctx.fillStyle = '#ffffff'; ctx.fillRect(pbx + ox, pby, bw, bh);
        ctx.strokeStyle = TEXT_COL; ctx.lineWidth = 2.2; ctx.strokeRect(pbx + ox, pby, bw, bh);
      });
    }
    endPressTransform(pPress, bx, by, bs, bs);
    var mb = musicBtn;
    var mPress = beginPressTransform(mb.x, mb.y, mb.size, mb.size);
    drawResourceBarBg(mb.x, mb.y, mb.size, mb.size);
    drawOutlinedText(musicEnabled ? '♪' : '♫', mb.x + mb.size / 2, mb.y + mb.size / 2, 'bold 22px Segoe UI, Arial', 'center');
    if (!musicEnabled) {
      ctx.strokeStyle = '#ff6b6b'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(mb.x + 10, mb.y + mb.size - 10); ctx.lineTo(mb.x + mb.size - 10, mb.y + 10); ctx.stroke();
    }
    endPressTransform(mPress, mb.x, mb.y, mb.size, mb.size);
  }
}

function drawGameOverScreen() {
  gameOverStatsAnim = Math.min(30, gameOverStatsAnim + 1);
  var animT = Math.min(1, gameOverStatsAnim / 20);
  var slideY = (1 - animT) * 40;
  ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(0, 0, WIDTH, HEIGHT);
  var panelW = 300, panelH = 340;
  var panelX = (WIDTH - panelW) / 2, panelY = (HEIGHT - panelH) / 2 - 16 + slideY;
  ctx.save();
  ctx.globalAlpha = animT;
  drawMenuPanelBg(panelX, panelY, panelW, panelH, 22);
  var fw2 = 280, fh2 = 52, tcx = WIDTH / 2, tcy = panelY + 48;
  if (isImageReady(menuNameImg)) ctx.drawImage(menuNameImg, tcx - fw2 / 2, tcy - fh2 / 2, fw2, fh2);
  ctx.fillStyle = TEXT_COL; ctx.font = 'bold 15px Segoe UI, Arial';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('Попробовать еще раз?', tcx, tcy + 1);
  ctx.textBaseline = 'alphabetic';
  var iconS = 28, rowGap = 36, rowY1 = panelY + 100, rowY2 = rowY1 + rowGap;
  ctx.font = 'bold 20px Segoe UI, Arial';
  var animScore = Math.floor(score * Math.min(1, animT * 1.5));
  var animCoins = Math.floor(runCoins * Math.min(1, animT * 1.5));
  var scoreStr = '× ' + animScore + ' m', coinStr = '× ' + animCoins;
  var textW = Math.max(ctx.measureText(scoreStr).width, ctx.measureText(coinStr).width);
  var blockW = iconS + 10 + textW, blockX = WIDTH / 2 - blockW / 2;
  if (isImageReady(liderImg)) ctx.drawImage(liderImg, blockX, rowY1 - iconS / 2, iconS, iconS);
  if (isImageReady(goldImg)) ctx.drawImage(goldImg, blockX, rowY2 - iconS / 2, iconS, iconS);
  ctx.fillStyle = TEXT_COL; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(scoreStr, blockX + iconS + 10, rowY1);
  ctx.fillText(coinStr, blockX + iconS + 10, rowY2);
  ctx.textBaseline = 'alphabetic';
  var btnW = 200, btnH = 48, contX = (WIDTH - btnW) / 2, menuY = panelY + 190;
  if (newBestFlag) {
    var pulse = 0.6 + 0.4 * Math.sin(performance.now() / 300);
    ctx.save();
    ctx.globalAlpha = pulse;
    drawOutlinedText('★ НОВЫЙ РЕКОРД! ★', WIDTH / 2, panelY + 160, 'bold 18px Segoe UI, Arial', 'center');
    ctx.restore();
  }
  drawKeycapBtn(contX, menuY, btnW, btnH, 'Меню', TEXT_COL);
  var retryY = menuY + btnH + 12;
  drawKeycapBtn(contX, retryY, btnW, btnH, 'Повторить', TEXT_COL);
  gameOverMenuBtns.menu = { x: contX, y: menuY, w: btnW, h: btnH };
  gameOverMenuBtns.retry = { x: contX, y: retryY, w: btnW, h: btnH };
  ctx.restore();
}

function drawLevelWinScreen() {
  var easeOutBack = function(x) { var c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
  var easeIn = function(x) { return x * x; };
  var anim = levelWinAnimT;
  if (levelWinAnim === 'in') anim = easeOutBack(Math.min(1, levelWinAnimT));
  else if (levelWinAnim === 'out') anim = easeIn(levelWinAnimT);
  else anim = 1;
  var scale = Math.max(0.01, anim);
  var alpha = Math.max(0, Math.min(1, levelWinAnimT));
  ctx.fillStyle = 'rgba(8, 12, 28, ' + (0.65 * alpha) + ')';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  if (levelWinAnim === 'in' && levelWinAnimT < 0.5) {
    ctx.fillStyle = 'rgba(255, 220, 80, ' + ((0.5 - levelWinAnimT) * 0.35) + ')';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  }
  var panelW = 300, panelH = 360;
  var panelX = (WIDTH - panelW) / 2, panelY = (HEIGHT - panelH) / 2 - 20;
  ctx.save();
  ctx.translate(WIDTH / 2, HEIGHT / 2 - 10);
  ctx.scale(scale, scale);
  ctx.translate(-WIDTH / 2, -(HEIGHT / 2 - 10));
  ctx.globalAlpha = alpha;
  drawMenuPanelBg(panelX, panelY, panelW, panelH, 22);
  drawMenuTitle('Уровень пройден!', WIDTH / 2, panelY + 42, 260, 48);
  var cellS = 72, midY = panelY + 120;
  var gx = panelX + 28, gy = midY - cellS / 2;
  var bg = getLevelRangeImg(levelWinLevel);
  if (isImageReady(bg)) ctx.drawImage(bg, gx, gy, cellS, cellS);
  else { ctx.fillStyle = 'rgba(78,205,196,0.35)'; roundRect(gx, gy, cellS, cellS, 10); ctx.fill(); }
  ctx.font = 'bold 28px Segoe UI, Arial';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  ctx.strokeStyle = TEXT_COL; ctx.lineWidth = 4;
  ctx.strokeText(String(levelWinLevel), gx + cellS / 2, gy + cellS / 2);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(String(levelWinLevel), gx + cellS / 2, gy + cellS / 2);
  ctx.textBaseline = 'alphabetic';
  if (isImageReady(completeImg)) { var cs = Math.floor(cellS * 0.38); ctx.drawImage(completeImg, gx + cellS - cs - 2, gy + cellS - cs - 2, cs, cs); }
  var rewardCoins = levelWinFirstClear ? LEVEL_REWARD : 0;
  var rewardCrystals = levelWinFirstClear ? LEVEL_CRYSTAL_REWARD : 0;
  var iconS = 26, rowH2 = 36, colRight = panelX + panelW - 28;
  ctx.font = 'bold 17px Segoe UI, Arial';
  var parts = [
    { img: isImageReady(crystalImg) ? crystalImg : null, text: '× ' + rewardCrystals },
    { img: isImageReady(goldImg) ? goldImg : null, text: '× ' + rewardCoins }
  ];
  var maxBlock = 0;
  var measured = parts.map(function(p) {
    var tw = ctx.measureText(p.text).width;
    var bw = iconS + 10 + tw;
    if (bw > maxBlock) maxBlock = bw;
    return { img: p.img, text: p.text, tw: tw, bw: bw };
  });
  var rowY = midY - (parts.length - 1) * rowH2 / 2;
  measured.forEach(function(p) {
    var bx = colRight - maxBlock;
    if (p.img) ctx.drawImage(p.img, bx, rowY - iconS / 2, iconS, iconS);
    ctx.fillStyle = TEXT_COL; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(p.text, bx + iconS + 10, rowY);
    rowY += rowH2;
  });
  ctx.textBaseline = 'alphabetic';
  var btnW2 = 200, btnH2 = 48;
  var homeX = (WIDTH - btnW2) / 2, menuY2 = panelY + 230, nextY = menuY2 + btnH2 + 12;
  drawKeycapBtn(homeX, menuY2, btnW2, btnH2, 'Меню', TEXT_COL);
  drawKeycapBtn(homeX, nextY, btnW2, btnH2, levelWinLevel >= 100 ? 'Финиш' : 'Продолжить', TEXT_COL);
  ctx.restore();
  if (levelWinAnim === 'idle') {
    levelWinBtns.home = { x: homeX, y: menuY2, w: btnW2, h: btnH2 };
    levelWinBtns.next = { x: homeX, y: nextY, w: btnW2, h: btnH2 };
  } else {
    levelWinBtns.home = null; levelWinBtns.next = null;
  }
}

function drawEnemy(e) {
  var screenY = e.y - cameraY;
  if (screenY < -60 || screenY > HEIGHT + 60) return;
  var cx = e.x + e.width / 2;
  var cy = screenY + e.height / 2;
  var t = ENEMY_TYPES[e.type];
  ctx.save();
  ctx.translate(cx, cy);
  var bob = Math.sin(e.bobPhase) * 3;
  ctx.translate(0, bob);
  ctx.fillStyle = t.color;
  ctx.beginPath();
  ctx.arc(0, 0, e.width / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = t.color;
  ctx.beginPath();
  ctx.ellipse(0, 0, e.width / 2, e.height / 2, 0, 0, Math.PI * 2);
  ctx.fill();
  var eyeOffX = e.dir > 0 ? 4 : -4;
  ctx.fillStyle = t.eyeColor;
  ctx.beginPath();
  ctx.arc(eyeOffX - 5, -4, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(eyeOffX + 5, -4, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#111';
  ctx.beginPath();
  ctx.arc(eyeOffX - 4 + e.dir * 2, -4, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(eyeOffX + 6 + e.dir * 2, -4, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#111';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-6, 6);
  for (var i = 0; i < 5; i++) {
    var tx = -6 + i * 3;
    var ty = i % 2 === 0 ? 6 : 10;
    ctx.lineTo(tx, ty);
  }
  ctx.lineTo(6, 6);
  ctx.stroke();
  ctx.restore();
}

function drawLoadingScreen() {
  checkAssetsReady();
  if (isImageReady(waitImg)) {
    ctx.drawImage(waitImg, 0, 0, WIDTH, HEIGHT);
  } else {
    ctx.fillStyle = '#0a0a12'; ctx.fillRect(0, 0, WIDTH, HEIGHT);
  }
  var veil = ctx.createLinearGradient(0, HEIGHT * 0.55, 0, HEIGHT);
  veil.addColorStop(0, 'rgba(0,0,0,0)'); veil.addColorStop(1, 'rgba(0,0,0,0.45)');
  ctx.fillStyle = veil; ctx.fillRect(0, 0, WIDTH, HEIGHT);
  if (isImageReady(titleNameImg)) {
    var maxW = WIDTH * 0.85;
    var aspect = titleNameImg.naturalWidth / titleNameImg.naturalHeight;
    var tw = maxW, th = tw / aspect;
    if (th > 140) { th = 140; tw = th * aspect; }
    ctx.drawImage(titleNameImg, (WIDTH - tw) / 2, 80, tw, th);
  }
  var progress = loadVisualProgress;
  var pulse = 0.5 + 0.5 * Math.sin(performance.now() / 450);
  drawOutlinedText('Загрузка', WIDTH / 2, HEIGHT - 88, 'bold 16px Segoe UI, Arial', 'center');
  var barW = 240, barH = 14, barX = (WIDTH - barW) / 2, barY = HEIGHT - 58;
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; roundRect(barX - 3, barY - 3, barW + 6, barH + 6, 8); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.18)'; roundRect(barX, barY, barW, barH, 7); ctx.fill();
  if (progress > 0.01) {
    var fw = Math.max(8, barW * progress);
    var g = ctx.createLinearGradient(barX, barY, barX + fw, barY);
    g.addColorStop(0, '#c9a227'); g.addColorStop(0.5, '#ffe082'); g.addColorStop(1, '#c9a227');
    ctx.fillStyle = g; roundRect(barX, barY, fw, barH, 7); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,' + (0.15 + 0.1 * pulse) + ')';
    roundRect(barX, barY, fw, barH * 0.4, 7); ctx.fill();
  }
  drawOutlinedText(Math.floor(progress * 100) + '%', WIDTH / 2, barY + 32, 'bold 14px Segoe UI, Arial', 'center');
}
