var particles = [];
var coinPopups = [];
var comboCount = 0;
var comboTimer = 0;
var comboMultiplier = 1;
var levelIntroTimer = 0;
var levelIntroText = '';
var newBestFlag = false;
var popupFade = 0;
var shakeX = 0;
var shakeY = 0;
var shakeIntensity = 0;
var slowmoTimer = 0;
var slowmoFactor = 1;
var landingSquashY = 1;
var landingSquashX = 1;
var springStretchY = 1;
var springStretchX = 1;
var toasts = [];
var magnetLines = [];
var deathFlashAlpha = 0;
var bgParallaxY = 0;
var scoreDisplay = 0;
var scoreTarget = 0;
var gameOverStatsAnim = 0;

function spawnPlatformDust(x, y) {
  for (var i = 0; i < 7; i++) {
    var dir = (Math.random() - 0.5);
    particles.push({
      x: x + dir * 18, y: y - 2,
      vx: dir * (1.2 + Math.random() * 2.2), vy: -0.8 - Math.random() * 1.8,
      life: 14 + Math.random() * 12, maxLife: 26,
      size: 2 + Math.random() * 3.5, rot: 0, rotSpeed: 0, kind: 'dust'
    });
  }
  if (particles.length > 140) particles.splice(0, particles.length - 140);
}

function spawnDeathParticles() {
  var px = player.x + player.width / 2;
  var py = player.y + player.height / 2;
  for (var i = 0; i < 18; i++) {
    var ang = (Math.PI * 2 * i) / 18 + Math.random() * 0.3;
    var sp = 2 + Math.random() * 5;
    particles.push({
      x: px, y: py,
      vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 2,
      life: 30 + Math.random() * 25, maxLife: 55,
      size: 2 + Math.random() * 4, rot: Math.random() * Math.PI,
      rotSpeed: (Math.random() - 0.5) * 0.25, kind: 'death'
    });
  }
  for (var i = 0; i < 8; i++) {
    particles.push({
      x: px + (Math.random() - 0.5) * 20, y: py,
      vx: (Math.random() - 0.5) * 1.5, vy: -1 - Math.random() * 2,
      life: 35 + Math.random() * 20, maxLife: 55,
      size: 8 + Math.random() * 12, rot: 0, rotSpeed: 0, kind: 'smoke'
    });
  }
}

function spawnBonusParticles() {
  var px = player.x + player.width / 2;
  var py = player.y + player.height * 0.5;
  for (var i = 0; i < 5; i++) {
    var side = Math.random() < 0.5 ? -1 : 1;
    var spreadX = (Math.random() * 0.6 + 0.4) * WIDTH * 0.5 * side;
    particles.push({
      x: px + spreadX, y: py + HEIGHT * 0.3 + Math.random() * HEIGHT * 0.3,
      vx: -spreadX * 0.02, vy: 8 + Math.random() * 12,
      life: 12 + Math.random() * 10, maxLife: 22,
      size: 1 + Math.random() * 1.5, rot: 0, rotSpeed: 0, kind: 'warpLine'
    });
  }
  for (var i = 0; i < 3; i++) {
    particles.push({
      x: px + (Math.random() - 0.5) * 30, y: py + 10 + Math.random() * 20,
      vx: (Math.random() - 0.5) * 1.5, vy: 3 + Math.random() * 4,
      life: 8 + Math.random() * 6, maxLife: 14,
      size: 3 + Math.random() * 4, rot: Math.random() * Math.PI * 2, rotSpeed: 0.15, kind: 'warpRing'
    });
  }
  if (particles.length > 160) particles.splice(0, particles.length - 160);
}

function spawnCoinParticles(x, y) {
  for (var i = 0; i < 10; i++) {
    var ang = (Math.PI * 2 * i) / 10 + Math.random() * 0.35;
    var sp = 2.5 + Math.random() * 4;
    particles.push({
      x: x, y: y,
      vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 1.2,
      life: 12 + Math.random() * 10, maxLife: 22,
      size: 6 + Math.random() * 8, rot: ang, rotSpeed: 0, kind: 'coinSpark'
    });
  }
  if (particles.length > 120) particles.splice(0, particles.length - 120);
}

function updateParticles() {
  for (var i = particles.length - 1; i >= 0; i--) {
    var p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    if (p.kind === 'coinSpark') {
      p.vx *= 0.94; p.vy *= 0.94; p.vy += 0.05; p.size *= 0.96;
    } else if (p.kind === 'death') {
      p.vy += 0.12; p.vx *= 0.97;
    } else if (p.kind === 'wind') {
      p.y += 4 + Math.random() * 3;
    } else if (p.kind === 'plasma') {
      p.vy += 0.08;
    } else if (p.kind === 'smoke') {
      p.vy -= 0.05; p.size += 0.15; p.vx *= 0.98;
    } else if (p.kind === 'dust') {
      p.vy += 0.12; p.vx *= 0.92; p.size *= 0.97;
    } else if (p.kind === 'warpLine') {
      p.vy += 0.6; p.vx *= 0.96;
      p.size = Math.min(3, p.size + 0.08);
    } else if (p.kind === 'warpRing') {
      p.vy += 0.15; p.size *= 1.04;
    } else if (p.kind === 'win') {
      p.vy += 0.08; p.vx *= 0.99;
    }
    p.life--;
    p.rot += p.rotSpeed || 0;
    if (p.life <= 0) particles.splice(i, 1);
  }
}

function drawParticles() {
  for (var k = 0; k < particles.length; k++) {
    var p = particles[k];
    var screenY = p.y - cameraY;
    if (screenY < -40 || screenY > HEIGHT + 40) continue;
    var alpha = Math.max(0, p.life / p.maxLife);
    ctx.save();
    ctx.translate(p.x, screenY);
    ctx.globalAlpha = alpha;
    if (p.kind === 'coinSpark') {
      var len = Math.max(2, p.size);
      ctx.rotate(p.rot || 0);
      ctx.strokeStyle = 'rgba(255, 240, 150, ' + alpha + ')';
      ctx.lineWidth = 1.8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(len, 0);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255, 255, 255, ' + (alpha * 0.85) + ')';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(len * 0.55, 0);
      ctx.stroke();
    } else if (p.kind === 'wind') {
      var grad = ctx.createLinearGradient(0, 0, 0, p.size);
      grad.addColorStop(0, 'rgba(255,255,255,' + (alpha * 0.85) + ')');
      grad.addColorStop(0.5, 'rgba(180,220,255,' + (alpha * 0.4) + ')');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5 + Math.random();
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo((Math.random() - 0.5) * 2, 0);
      ctx.lineTo(0, p.size);
      ctx.stroke();
    } else if (p.kind === 'plasma') {
      ctx.fillStyle = 'rgba(255, ' + (180 + Math.random() * 50 | 0) + ', 80, ' + alpha + ')';
      ctx.shadowColor = '#FF6D00';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    } else if (p.kind === 'shockwave') {
      var r = p.size + (1 - alpha) * 55;
      ctx.strokeStyle = 'rgba(255, 230, 150, ' + (alpha * 0.7) + ')';
      ctx.lineWidth = 3 * alpha;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255, 120, 40, ' + (alpha * 0.4) + ')';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.7, 0, Math.PI * 2);
      ctx.stroke();
    } else if (p.kind === 'star') {
      ctx.rotate(p.rot || 0);
      ctx.fillStyle = 'rgba(255, 255, 200, ' + alpha + ')';
      ctx.shadowColor = '#FFD700';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      for (var j = 0; j < 5; j++) {
        var angle = (j * 4 * Math.PI) / 5 - Math.PI / 2;
        var rad = j % 2 === 0 ? p.size : p.size * 0.4;
        var sx = Math.cos(angle) * rad;
        var sy = Math.sin(angle) * rad;
        if (j === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
    } else if (p.kind === 'death') {
      ctx.rotate(p.rot || 0);
      ctx.fillStyle = 'rgba(255, ' + (100 + Math.random() * 80 | 0) + ', 60, ' + alpha + ')';
      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.kind === 'smoke') {
      ctx.fillStyle = 'rgba(80, 80, 90, ' + (alpha * 0.35) + ')';
      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.kind === 'dust') {
      ctx.fillStyle = 'rgba(210, 190, 150, ' + (alpha * 0.7) + ')';
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(0.5, p.size), 0, Math.PI * 2);
      ctx.fill();
    } else if (p.kind === 'shard') {
      ctx.rotate(p.rot || 0);
      ctx.fillStyle = 'rgba(180, 160, 120, ' + alpha + ')';
      ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.6);
    } else if (p.kind === 'ambient') {
      ctx.fillStyle = 'rgba(255, 255, 255, ' + (alpha * 0.3) + ')';
      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.kind === 'springPop') {
      ctx.fillStyle = 'rgba(100, 220, 255, ' + alpha + ')';
      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.kind === 'warpLine') {
      var lineLen = Math.max(4, p.size * 18);
      var grad = ctx.createLinearGradient(0, 0, 0, -lineLen);
      grad.addColorStop(0, 'rgba(120, 200, 255, ' + alpha + ')');
      grad.addColorStop(0.3, 'rgba(180, 230, 255, ' + (alpha * 0.8) + ')');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = p.size;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -lineLen);
      ctx.stroke();
    } else if (p.kind === 'warpRing') {
      ctx.rotate(p.rot || 0);
      var ringR = p.size;
      ctx.strokeStyle = 'rgba(100, 180, 255, ' + (alpha * 0.6) + ')';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, ringR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(200, 230, 255, ' + (alpha * 0.3) + ')';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.arc(0, 0, ringR * 0.6, 0, Math.PI * 2);
      ctx.stroke();
    } else if (p.kind === 'win') {
      var colors = ['#FFD700', '#4ecdc4', '#FF8A65', '#CE93D8', '#fff'];
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      ctx.globalAlpha = alpha;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
    } else {
      ctx.rotate(p.rot || 0);
      ctx.fillStyle = TEXT_COL;
      ctx.beginPath();
      for (var j = 0; j < 5; j++) {
        var angle = (j * 4 * Math.PI) / 5 - Math.PI / 2;
        var rad = j % 2 === 0 ? p.size : p.size * 0.4;
        var sx = Math.cos(angle) * rad;
        var sy = Math.sin(angle) * rad;
        if (j === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}

function spawnCoinPopup(x, y, amount) {
  var text = '+' + amount;
  if (comboMultiplier > 1) text += ' x' + comboMultiplier;
  coinPopups.push({
    x: x, y: y, text: text,
    vy: -1.8, life: 42, maxLife: 42,
    scale: 1.3, color: comboMultiplier > 1 ? '#FFD700' : '#ffffff'
  });
}

function spawnLevelPopup(x, y, text) {
  coinPopups.push({
    x: x, y: y, text: text,
    vy: -1.2, life: 70, maxLife: 70,
    scale: 1.6, color: '#4ecdc4'
  });
}

function updateCoinPopups() {
  for (var i = coinPopups.length - 1; i >= 0; i--) {
    var p = coinPopups[i];
    p.y += p.vy;
    p.vy *= 0.97;
    p.life--;
    if (p.life < 15) p.scale = Math.max(0.3, p.scale - 0.06);
    if (p.life <= 0) coinPopups.splice(i, 1);
  }
}

function drawCoinPopups() {
  for (var i = 0; i < coinPopups.length; i++) {
    var p = coinPopups[i];
    var alpha = Math.min(1, p.life / 15);
    var screenY = p.y - cameraY;
    if (screenY < -30 || screenY > HEIGHT + 30) continue;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = 'bold 14px Segoe UI, Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = 'rgba(0,0,0,0.6)';
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.strokeText(p.text, p.x, screenY);
    ctx.fillStyle = p.color;
    ctx.fillText(p.text, p.x, screenY);
    ctx.restore();
  }
}

function updateCombo() {
  if (comboTimer > 0) {
    comboTimer--;
    if (comboTimer <= 0) {
      comboCount = 0;
      comboMultiplier = 1;
    }
  }
}

function addCombo() {
  comboCount++;
  comboTimer = 90;
  if (comboCount >= 5) comboMultiplier = 2;
  else comboMultiplier = 1;
}

function addShake(intensity) {
  shakeIntensity = Math.max(shakeIntensity, intensity);
}

function updateShake() {
  if (shakeIntensity > 0.5) {
    shakeX = (Math.random() - 0.5) * shakeIntensity * 2;
    shakeY = (Math.random() - 0.5) * shakeIntensity * 2;
    shakeIntensity *= SHAKE_DECAY;
  } else {
    shakeX = 0; shakeY = 0; shakeIntensity = 0;
  }
}

function updateSlowmo() {
  if (slowmoTimer > 0) {
    slowmoTimer--;
    slowmoFactor = SLOWMO_FACTOR + (1 - SLOWMO_FACTOR) * (slowmoTimer / DEATH_SLOWMO_FRAMES);
  } else {
    slowmoFactor = 1;
  }
}

function triggerDeathSlowmo() {
  slowmoTimer = DEATH_SLOWMO_FRAMES;
  deathFlashAlpha = 0.6;
  addShake(12);
}

function updateLandingSquash() {
  landingSquashY += (1 - landingSquashY) * LANDING_SQUASH_RECOVER;
  landingSquashX += (1 - landingSquashX) * LANDING_SQUASH_RECOVER;
}

function triggerLandingSquash() {
  landingSquashY = LANDING_SQUASH;
  landingSquashX = 1 + (1 - LANDING_SQUASH) * 0.5;
}

function updateSpringStretch() {
  springStretchY += (1 - springStretchY) * 0.12;
  springStretchX += (1 - springStretchX) * 0.12;
}

function triggerSpringStretch() {
  springStretchY = SPRING_VISUAL_STRETCH;
  springStretchX = 1 / SPRING_VISUAL_STRETCH;
}

function addToast(text, color, icon) {
  toasts.push({ text: text, color: color || '#4ecdc4', icon: icon || '', life: TOAST_DURATION, maxLife: TOAST_DURATION });
  if (toasts.length > 4) toasts.splice(0, toasts.length - 4);
}

function updateToasts() {
  for (var i = toasts.length - 1; i >= 0; i--) {
    toasts[i].life--;
    if (toasts[i].life <= 0) toasts.splice(i, 1);
  }
}

function drawToasts() {
  var ty = 60;
  ctx.font = 'bold 13px Segoe UI, Arial';
  for (var i = 0; i < toasts.length; i++) {
    var t = toasts[i];
    var alpha = t.life > 20 ? 1 : t.life / 20;
    var slideIn = Math.min(1, (t.maxLife - t.life) / 12);
    var tw = Math.min(280, ctx.measureText(t.text).width + 50);
    var tx = WIDTH / 2 - tw / 2 + (1 - slideIn) * (WIDTH + 50);
    ctx.save();
    ctx.globalAlpha = alpha * 0.92;
    ctx.fillStyle = 'rgba(20,22,40,0.92)';
    roundRect(tx, ty, tw, 36, 10);
    ctx.fill();
    ctx.strokeStyle = t.color;
    ctx.lineWidth = 1.5;
    roundRect(tx, ty, tw, 36, 10);
    ctx.stroke();
    ctx.font = 'bold 13px Segoe UI, Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = t.color;
    ctx.fillText(t.text, tx + tw / 2, ty + 18);
    ctx.restore();
    ty += 44;
  }
}

function updateMagnetLines(playerX, playerY, coins) {
  magnetLines = [];
  if (!hasMagnet()) return;
  var camBot = cameraY + HEIGHT + 100;
  for (var i = 0; i < coins.length; i++) {
    var c = coins[i];
    if (c.collected) continue;
    var dx = playerX - c.x;
    var dy = playerY - c.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < MAGNET_RANGE && dist > 5) {
      magnetLines.push({ x1: c.x, y1: c.y, x2: playerX, y2: playerY, alpha: Math.max(0, 1 - dist / MAGNET_RANGE) * 0.4 });
    }
  }
}

function drawMagnetLines() {
  for (var i = 0; i < magnetLines.length; i++) {
    var l = magnetLines[i];
    var sy1 = l.y1 - cameraY;
    var sy2 = l.y2 - cameraY;
    ctx.save();
    ctx.globalAlpha = l.alpha;
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(l.x1, sy1);
    ctx.lineTo(l.x2, sy2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }
}

function spawnBreakShards(x, y, w) {
  for (var i = 0; i < BREAK_SHARD_COUNT; i++) {
    var ang = (Math.PI * 2 * i) / BREAK_SHARD_COUNT + (Math.random() - 0.5) * 0.5;
    var sp = 1.5 + Math.random() * 3;
    particles.push({
      x: x + Math.random() * w, y: y,
      vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 1.5,
      life: 20 + Math.random() * 15, maxLife: 35,
      size: 3 + Math.random() * 5, rot: Math.random() * Math.PI,
      rotSpeed: (Math.random() - 0.5) * 0.3, kind: 'shard'
    });
  }
}

function spawnAmbientParticles() {
  if (Math.random() > AMBIENT_PARTICLE_CHANCE) return;
  var x = Math.random() * WIDTH;
  var y = cameraY - 10;
  particles.push({
    x: x, y: y,
    vx: (Math.random() - 0.5) * 0.3, vy: 0.5 + Math.random() * 0.5,
    life: 80 + Math.random() * 60, maxLife: 140,
    size: 1 + Math.random() * 2, rot: 0, rotSpeed: 0, kind: 'ambient'
  });
}

function spawnSpringBounceParticles(x, y) {
  for (var i = 0; i < 6; i++) {
    var ang = -Math.PI / 2 + (Math.random() - 0.5) * 1.2;
    var sp = 2 + Math.random() * 3;
    particles.push({
      x: x, y: y,
      vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp,
      life: 12 + Math.random() * 8, maxLife: 20,
      size: 2 + Math.random() * 3, rot: 0, rotSpeed: 0, kind: 'springPop'
    });
  }
}

function updateGameOverStatsAnim() {
  if (gameOverStatsAnim > 0) gameOverStatsAnim--;
}

var warpPulse = 0;
var warpOrbits = [];
var warpSpeedLines = [];
var warpRings = [];

function updateWarpEffect() {
  var pcx = player.x + player.width / 2;
  var pcy = (player.y + player.height * 0.4) - cameraY;
  if (bonusActive) {
    warpPulse = Math.min(1, warpPulse + 0.06);
    if (Math.random() < 0.6) {
      var a = Math.random() * Math.PI * 2;
      warpOrbits.push({
        angle: a, dist: 20 + Math.random() * 30,
        size: 1.5 + Math.random() * 2.5,
        speed: 0.08 + Math.random() * 0.12,
        life: 30 + Math.random() * 20, maxLife: 50,
        orbitDir: Math.random() < 0.5 ? 1 : -1,
        hue: 190 + Math.random() * 50
      });
    }
    if (Math.random() < 0.7) {
      warpSpeedLines.push({
        x: pcx + (Math.random() - 0.5) * 120,
        y: pcy + 30 + Math.random() * 20,
        vy: 6 + Math.random() * 10,
        len: 15 + Math.random() * 35,
        width: 0.8 + Math.random() * 1.2,
        life: 10 + Math.random() * 8, maxLife: 18,
        alpha: 0.4 + Math.random() * 0.4
      });
    }
    if (Math.random() < 0.08) {
      warpRings.push({
        dist: 10, maxDist: 40 + Math.random() * 40,
        life: 25 + Math.random() * 15, maxLife: 40,
        width: 1.5 + Math.random() * 1.5
      });
    }
    for (var i = warpOrbits.length - 1; i >= 0; i--) {
      var o = warpOrbits[i];
      o.angle += o.speed * o.orbitDir;
      o.dist += Math.sin(o.angle * 2) * 0.3;
      o.life--;
      if (o.life <= 0) warpOrbits.splice(i, 1);
    }
    for (var i = warpSpeedLines.length - 1; i >= 0; i--) {
      var l = warpSpeedLines[i];
      l.y += l.vy;
      l.life--;
      if (l.life <= 0) warpSpeedLines.splice(i, 1);
    }
    for (var i = warpRings.length - 1; i >= 0; i--) {
      var r = warpRings[i];
      r.dist += (r.maxDist - r.dist) * 0.08;
      r.life--;
      if (r.life <= 0) warpRings.splice(i, 1);
    }
    if (warpOrbits.length > 30) warpOrbits.splice(0, warpOrbits.length - 30);
    if (warpSpeedLines.length > 35) warpSpeedLines.splice(0, warpSpeedLines.length - 35);
    if (warpRings.length > 8) warpRings.splice(0, warpRings.length - 8);
  } else {
    warpPulse *= 0.88;
    for (var i = warpOrbits.length - 1; i >= 0; i--) {
      warpOrbits[i].life -= 2;
      warpOrbits[i].dist += 0.5;
      if (warpOrbits[i].life <= 0) warpOrbits.splice(i, 1);
    }
    for (var i = warpSpeedLines.length - 1; i >= 0; i--) {
      warpSpeedLines[i].life -= 2;
      if (warpSpeedLines[i].life <= 0) warpSpeedLines.splice(i, 1);
    }
    for (var i = warpRings.length - 1; i >= 0; i--) {
      warpRings[i].dist += 2;
      warpRings[i].life -= 3;
      if (warpRings[i].life <= 0) warpRings.splice(i, 1);
    }
  }
}

function drawWarpEffect() {
  if (warpPulse < 0.01 && warpOrbits.length === 0 && warpSpeedLines.length === 0) return;
  var pcx = player.x + player.width / 2;
  var pcy = (player.y + player.height * 0.4) - cameraY;
  var t = performance.now() / 1000;
  var inten = Math.min(1, warpPulse);
  ctx.save();
  ctx.translate(pcx, pcy);
  if (inten > 0.05) {
    var coreR = 30 + Math.sin(t * 6) * 5;
    var coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, coreR);
    coreGrad.addColorStop(0, 'rgba(150, 220, 255, ' + (inten * 0.5) + ')');
    coreGrad.addColorStop(0.4, 'rgba(80, 160, 255, ' + (inten * 0.25) + ')');
    coreGrad.addColorStop(0.7, 'rgba(40, 100, 220, ' + (inten * 0.1) + ')');
    coreGrad.addColorStop(1, 'rgba(20, 60, 180, 0)');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(0, 0, coreR, 0, Math.PI * 2);
    ctx.fill();
  }
  if (inten > 0.15) {
    var pulseR = 22 + Math.sin(t * 12) * 8;
    ctx.strokeStyle = 'rgba(100, 200, 255, ' + (inten * 0.35) + ')';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, pulseR, 0, Math.PI * 2);
    ctx.stroke();
    var pulseR2 = 18 + Math.cos(t * 15) * 6;
    ctx.strokeStyle = 'rgba(180, 230, 255, ' + (inten * 0.2) + ')';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, pulseR2, 0, Math.PI * 2);
    ctx.stroke();
  }
  for (var i = 0; i < warpOrbits.length; i++) {
    var o = warpOrbits[i];
    var ox = Math.cos(o.angle) * o.dist;
    var oy = Math.sin(o.angle) * o.dist * 0.6;
    var alpha = Math.min(1, o.life / 10) * inten;
    ctx.save();
    ctx.globalAlpha = alpha;
    var orbGrad = ctx.createRadialGradient(ox, oy, 0, ox, oy, o.size * 2);
    orbGrad.addColorStop(0, 'hsla(' + o.hue + ', 80%, 85%, 1)');
    orbGrad.addColorStop(0.5, 'hsla(' + o.hue + ', 70%, 70%, 0.6)');
    orbGrad.addColorStop(1, 'hsla(' + o.hue + ', 60%, 60%, 0)');
    ctx.fillStyle = orbGrad;
    ctx.beginPath();
    ctx.arc(ox, oy, o.size * 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
  for (var i = 0; i < warpSpeedLines.length; i++) {
    var l = warpSpeedLines[i];
    var sy = l.y;
    var alpha2 = (l.life / l.maxLife) * l.alpha * inten;
    if (alpha2 < 0.01) continue;
    var lineGrad = ctx.createLinearGradient(l.x, sy - l.len, l.x, sy);
    lineGrad.addColorStop(0, 'rgba(150, 210, 255, 0)');
    lineGrad.addColorStop(0.5, 'rgba(180, 230, 255, ' + alpha2 + ')');
    lineGrad.addColorStop(1, 'rgba(220, 240, 255, ' + (alpha2 * 0.7) + ')');
    ctx.strokeStyle = lineGrad;
    ctx.lineWidth = l.width;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(l.x, sy - l.len);
    ctx.lineTo(l.x, sy);
    ctx.stroke();
  }
  for (var i = 0; i < warpRings.length; i++) {
    var r = warpRings[i];
    var rAlpha = (r.life / r.maxLife) * inten * 0.5;
    if (rAlpha < 0.01) continue;
    ctx.save();
    ctx.translate(pcx, pcy);
    ctx.globalAlpha = rAlpha;
    ctx.strokeStyle = 'rgba(100, 200, 255, 0.8)';
    ctx.lineWidth = r.width * (r.life / r.maxLife);
    ctx.beginPath();
    ctx.ellipse(0, 0, r.dist, r.dist * 0.35, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
  if (inten > 0.2) {
    ctx.save();
    ctx.globalAlpha = inten * 0.06;
    ctx.fillStyle = '#80d0ff';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.restore();
  }
}
