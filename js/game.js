var player = { x: WIDTH / 2 - PLAYER_WIDTH / 2, y: HEIGHT - 150, vx: 0, vy: 0, width: PLAYER_WIDTH, height: PLAYER_HEIGHT, facing: 1 };
var platforms = [], bonuses = [], coins = [], enemies = [];
var cameraY = 0, maxHeight = 0, score = 0, runCoins = 0;
var gameState = 'loading', loadStartTime = performance.now(), loadVisualProgress = 0, loadFadeOut = 0, titleFadeIn = 0;
var keys = { left: false, right: false, up: false, down: false };
var touchY = null, touchX = null;
var bonusActive = false, bonusTimer = 0;
var bonusVisualScale = 1;
var playerTilt = 0, bonus1Pending = false, bonusesLockedUntilLand = false, bonus1TargetY = 0;
var isPaused = false, uiPress = null, pendingUiAction = null;
var introActive = false, introTimer = 0, introLaunched = false;
var invincibleTimer = 0, dyingTimer = 0, onPlatform = false;
var extraLifeReady = false, shieldAngle = 0, shieldVisualScale = 0;
var cdBonus1 = 0, cdBonus2 = 0, cdBonus3 = 0;
var bonus2FromItem = false, bonus2CdPending = false, bonus2LandArmed = false, jumpBoostTimer = 0;
var currentPlayerImg = null;
var currentLevel = 0, levelTarget = 0, levelWinLevel = 0, levelWinFirstClear = true, levelWinTimer = 0;
var levelWinBtns = { home: null, next: null };
var levelWinAnim = 'in', levelWinAnimT = 0, levelWinPending = null, levelWinFlyTimer = 0;

function pickPlatformType() {
  var r = Math.random();
  var lv = currentLevel || 0;
  var stage = 0;
  if (lv > 0 && levelTarget > 0) stage = Math.max(0, Math.min(1, score / levelTarget));
  if (lv >= 41 && lv <= 60) {
    if (r < 0.52) return 'breaking';
    if (r < 0.62) return 'moving';
    if (r < 0.72) return 'spring';
    return 'normal';
  }
  if (lv >= 61 && lv <= 80) {
    if (r < 0.52) return 'moving';
    if (r < 0.62) return 'breaking';
    if (r < 0.72) return 'spring';
    return 'normal';
  }
  if (lv >= 81 && lv <= 100) {
    var special = 0.28 + stage * 0.42;
    var breakShare = 0.45 + stage * 0.1;
    if (r < special * breakShare) return 'breaking';
    if (r < special) return 'moving';
    if (r < special + 0.08) return 'spring';
    return 'normal';
  }
  var types = ['normal', 'normal', 'normal', 'moving', 'breaking', 'spring'];
  return types[Math.floor(Math.random() * types.length)];
}

function createPlatform(y, type) {
  var t = type || pickPlatformType();
  return {
    x: Math.random() * (WIDTH - PLATFORM_WIDTH), y: y,
    width: PLATFORM_WIDTH, height: PLATFORM_HEIGHT,
    type: t, dir: Math.random() > 0.5 ? 1 : -1,
    speed: 1.8 + Math.random() * 1.4, phase: Math.random() * Math.PI * 2, bob: 0,
    broken: false, breakTimer: 0
  };
}

function createBonus(x, y) { return { x: x, y: y, width: 36, height: 36, collected: false }; }

function createCoin(x, y) {
  return { x: x, y: y, width: 28, height: 28, collected: false, magnetized: false, phase: Math.random() * Math.PI * 2, vx: 0, vy: 0 };
}

function spawnCoinsNear(y) {
  var count = 2 + Math.floor(Math.random() * 3);
  var minDist = 42;
  var placed = [];
  var attempts = 0;
  while (placed.length < count && attempts < 40) {
    attempts++;
    var cx = 24 + Math.random() * (WIDTH - 72);
    var cy = y - 25 - Math.random() * 80;
    var ok = true;
    for (var j = 0; j < placed.length; j++) {
      var dx = placed[j].x - cx, dy = placed[j].y - cy;
      if (dx * dx + dy * dy < minDist * minDist) { ok = false; break; }
    }
    if (ok) {
      for (var j = 0; j < coins.length; j++) {
        if (coins[j].collected) continue;
        var dx = coins[j].x - cx, dy = coins[j].y - cy;
        if (dx * dx + dy * dy < minDist * minDist) { ok = false; break; }
      }
    }
    if (ok) { placed.push({ x: cx, y: cy }); coins.push(createCoin(cx, cy)); }
  }
}

function avoidAboveSprings(p) {
  for (var j = 0; j < platforms.length; j++) {
    var s = platforms[j];
    if (s.type !== 'spring') continue;
    var dy = s.y - p.y;
    if (dy > 0 && dy < 140) {
      var overlap = p.x < s.x + s.width + 10 && p.x + p.width > s.x - 10;
      if (overlap) {
        if (s.x > WIDTH / 2) p.x = Math.max(0, s.x - PLATFORM_WIDTH - 30 - Math.random() * 40);
        else p.x = Math.min(WIDTH - PLATFORM_WIDTH, s.x + s.width + 30 + Math.random() * 40);
      }
    }
  }
}

function initPlatforms() {
  platforms = []; bonuses = []; coins = [];
  bonusActive = false; bonusTimer = 0; bonusVisualScale = 1;
  bonus1Pending = false; bonusesLockedUntilLand = false; runCoins = 0;
  platforms.push({ x: WIDTH / 2 - PLATFORM_WIDTH / 2, y: HEIGHT - 80, width: PLATFORM_WIDTH, height: PLATFORM_HEIGHT, type: 'normal', dir: 1, speed: 0, phase: 0, bob: 0, broken: false, breakTimer: 0 });
  var y = HEIGHT - 200;
  var prevWasSpring = false;
  while (y > -HEIGHT * 2) {
    if (prevWasSpring) y -= 70 + Math.random() * 40;
    var p = createPlatform(y);
    avoidAboveSprings(p);
    platforms.push(p);
    prevWasSpring = (p.type === 'spring');
    if (p.type === 'normal' && Math.random() < 0.12) bonuses.push(createBonus(p.x + p.width / 2 - 18, p.y - 50));
    if (Math.random() < 0.85) spawnCoinsNear(y);
    y -= 90 + Math.random() * 60;
  }
}

function generateMorePlatforms() {
  var highest = platforms.reduce(function(min, p) { return Math.min(min, p.y); }, Infinity);
  var prevWasSpring = platforms.length && platforms[platforms.length - 1].type === 'spring';
  while (highest > cameraY - HEIGHT) {
    highest -= 90 + Math.random() * 60;
    if (prevWasSpring) highest -= 70 + Math.random() * 40;
    var p = createPlatform(highest);
    avoidAboveSprings(p);
    platforms.push(p);
    prevWasSpring = (p.type === 'spring');
    if (!bonusActive && p.type === 'normal' && Math.random() < 0.12) bonuses.push(createBonus(p.x + p.width / 2 - 18, p.y - 50));
    if (Math.random() < 0.85) spawnCoinsNear(highest);
    spawnEnemiesAbove(highest);
  }
}

function collectCoin(c) {
  if (c.collected) return;
  c.collected = true;
  addCombo();
  var baseAmount = hasCoinDouble() ? 2 : 1;
  var amount = baseAmount * comboMultiplier;
  runCoins += amount;
  totalCoins += amount;
  saveProgress();
  playCoinSound();
  spawnCoinParticles(c.x + c.width / 2, c.y + c.height / 2);
  spawnCoinPopup(c.x + c.width / 2, c.y - 10, amount);
}

function buyBonus(which) {
  if (which === 1) {
    if (totalCoins >= BONUS1_PRICE) { totalCoins -= BONUS1_PRICE; invBonus1++; saveProgress(); return true; }
    coinShake = 20; return false;
  }
  if (which === 2) {
    if (totalCoins >= BONUS2_PRICE) { totalCoins -= BONUS2_PRICE; invBonus2++; saveProgress(); return true; }
    coinShake = 20; return false;
  }
  if (which === 3) {
    if (totalCoins >= BONUS3_PRICE) { totalCoins -= BONUS3_PRICE; invBonus3++; saveProgress(); return true; }
    coinShake = 20; return false;
  }
  return false;
}

function createEnemy(y) {
  var typeIdx = Math.floor(Math.random() * ENEMY_TYPES.length);
  var t = ENEMY_TYPES[typeIdx];
  var dir = Math.random() > 0.5 ? 1 : -1;
  return {
    x: dir > 0 ? -t.width : WIDTH,
    y: y,
    width: t.width, height: t.height,
    vx: t.speed * dir, vy: 0,
    type: typeIdx, dir: dir,
    bobPhase: Math.random() * Math.PI * 2
  };
}

function spawnEnemiesAbove(topY) {
  if (currentLevel > 0 && score < 200) return;
  var baseChance = currentLevel > 0 ? 0.05 : 0.025;
  var heightBonus = Math.min(0.04, maxHeight * 0.00002);
  var spawnChance = baseChance + heightBonus;
  if (Math.random() < spawnChance) {
    var ey = topY - 80 - Math.random() * 200;
    var e = createEnemy(ey);
    var heightSpeedBonus = Math.min(1.5, maxHeight * 0.0001);
    e.vx = e.vx * (1 + heightSpeedBonus);
    enemies.push(e);
  }
}

function updateEnemies() {
  for (var i = enemies.length - 1; i >= 0; i--) {
    var e = enemies[i];
    e.x += e.vx;
    e.bobPhase += 0.05;
    e.y += Math.sin(e.bobPhase) * 0.5;
    if (e.x < -e.width - 20 || e.x > WIDTH + 20) { enemies.splice(i, 1); continue; }
    if (invincibleTimer <= 0 && !bonusActive) {
      var px = player.x, py = player.y;
      var ex = e.x, ey = e.y;
      if (px < ex + e.width && px + player.width > ex && py < ey + e.height && py + player.height > ey) {
        startDeathAnimation(); return;
      }
    }
  }
}

function useBonus1() {
  if (invBonus1 <= 0 || bonusActive || bonus1Pending || bonusesLockedUntilLand || cdBonus1 > 0 || gameState !== 'playing' || isPaused) return false;
  invBonus1--; saveProgress(); bonus1Pending = true;
  missionStats.use_bonus1 = (missionStats.use_bonus1 || 0) + 1;
  saveMetaProgress(); playBonusSound(); return true;
}

function activateBonus1() {
  if (!bonus1Pending || bonusActive) return;
  bonus1Pending = false; bonusActive = true;
  bonusTimer = BONUS_DURATION; bonus1TargetY = player.y - BONUS1_WORLD;
}

function useBonus2() {
  if (invBonus2 <= 0 || cdBonus2 > 0 || bonus2CdPending || bonusesLockedUntilLand || gameState !== 'playing' || isPaused) return false;
  if (extraLifeReady) return false;
  invBonus2--; saveProgress(); extraLifeReady = true; bonus2FromItem = true;
  missionStats.use_bonus2 = (missionStats.use_bonus2 || 0) + 1;
  saveMetaProgress(); playBonusSound(); return true;
}

function useBonus3() {
  if (invBonus3 <= 0 || jumpBoostTimer > 0 || bonusesLockedUntilLand || cdBonus3 > 0 || gameState !== 'playing' || isPaused) return false;
  invBonus3--; saveProgress(); jumpBoostTimer = JUMP_BOOST_DURATION;
  missionStats.use_bonus3 = (missionStats.use_bonus3 || 0) + 1;
  saveMetaProgress(); playBonusSound(); return true;
}

function updateShield() {
  if (extraLifeReady) { shieldAngle += 0.09; if (shieldAngle > Math.PI * 2) shieldAngle -= Math.PI * 2; }
  var target = extraLifeReady ? 1 : 0;
  if (shieldVisualScale < target) shieldVisualScale = Math.min(target, shieldVisualScale + SHIELD_SCALE_SPEED);
  else if (shieldVisualScale > target) shieldVisualScale = Math.max(target, shieldVisualScale - SHIELD_SCALE_SPEED);
}

function triggerLevelWin(cleared) {
  levelWinLevel = cleared;
  levelWinFirstClear = !levelsCompleted[cleared];
  levelsCompleted[cleared] = true;
  if (cleared >= maxLevelUnlocked && cleared < 100) maxLevelUnlocked = cleared + 1;
  if (levelWinFirstClear) {
    totalCoins += LEVEL_REWARD;
    rewardedLevels[cleared] = true;
    totalCrystals += 5000;
    saveProgress();
  }
  saveMetaProgress(); playLevelWinSound();
  if (runCoins > bestRunCoins) {
    bestRunCoins = runCoins;
    try { localStorage.setItem('monsterJumpBestRunCoins', String(bestRunCoins)); } catch (e) {}
  }
  for (var i = 0; i < 40; i++) {
    var ang = Math.random() * Math.PI * 2;
    var sp = 2 + Math.random() * 6;
    particles.push({
      x: WIDTH / 2 + (Math.random() - 0.5) * 80, y: HEIGHT * 0.4 + (Math.random() - 0.5) * 40,
      vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 3,
      life: 40 + Math.random() * 30, maxLife: 70,
      size: 3 + Math.random() * 5, rot: Math.random() * Math.PI,
      rotSpeed: (Math.random() - 0.5) * 0.3, kind: 'win'
    });
  }
  levelWinTimer = 0; levelWinAnim = 'fly'; levelWinAnimT = 0; levelWinFlyTimer = 0;
  levelWinPending = null; player.vy = JUMP_FORCE * 2.4; player.vx *= 0.3;
  gameState = 'levelwin'; isPaused = false;
  keys.left = false; keys.right = false; keys.up = false; keys.down = false;
  hintEl.style.display = 'none'; scoreEl.style.display = 'none';
}

function startDeathAnimation() {
  gameState = 'dying'; dyingTimer = 90;
  player.vx = (Math.random() - 0.5) * 3; player.vy = Math.min(player.vy, 2);
  playDeathSound(); spawnDeathParticles();
  triggerDeathSlowmo();
  vibrate(40);
  if (score > bestScore) { bestScore = score; newBestFlag = true; saveProgress(); addToast('НОВЫЙ РЕКОРД! ' + score + ' m', '#FFD700'); }
  if (runCoins > bestRunCoins) {
    bestRunCoins = runCoins;
    try { localStorage.setItem('monsterJumpBestRunCoins', String(bestRunCoins)); } catch (e) {}
  }
  hintEl.style.display = 'none'; scoreEl.style.display = 'none';
}

function gameOver() {
  gameState = 'gameover';
  if (score > bestScore) { bestScore = score; newBestFlag = true; saveProgress(); }
  hintEl.style.display = 'none'; scoreEl.style.display = 'none';
}

function startGame() {
  getAudioCtx();
  // FIX BUG #1: startMusic AFTER gameState changes to 'playing'
  missionStats.plays = (missionStats.plays || 0) + 1;
  saveMetaProgress();
  var skIdx = selectedSkins[selectedCharacter];
  if (skIdx > 0 && isImageReady(playerSkinImgs[selectedCharacter][skIdx - 1]) && playerSkinImgs[selectedCharacter][skIdx - 1].naturalWidth > 0) {
    currentPlayerImg = playerSkinImgs[selectedCharacter][skIdx - 1];
  } else {
    currentPlayerImg = playerImgs[selectedCharacter];
  }
  player.x = WIDTH / 2 - PLAYER_WIDTH / 2; player.y = HEIGHT - 150;
  player.vx = 0; player.vy = 0; player.width = PLAYER_WIDTH; player.height = PLAYER_HEIGHT;
  cameraY = 0; maxHeight = 0; score = 0;
  bonusActive = false; bonusTimer = 0; bonusVisualScale = 1;
  bonus1Pending = false; bonusesLockedUntilLand = false;
  particles = []; enemies = []; isPaused = false;
  gameOverStatsAnim = 0; scoreDisplay = 0; deathFlashAlpha = 0;
  toasts = []; magnetLines = [];
  landingSquashY = 1; landingSquashX = 1; springStretchY = 1; springStretchX = 1;
  shakeX = 0; shakeY = 0; shakeIntensity = 0; slowmoTimer = 0; slowmoFactor = 1;
  warpPulse = 0; warpStreaks = [];
  extraLifeReady = hasExtraLife();
  shieldVisualScale = extraLifeReady ? 1 : 0;
  invincibleTimer = 0; dyingTimer = 0;
  cdBonus1 = 0; cdBonus2 = 0; cdBonus3 = 0;
  bonus2FromItem = false; bonus2CdPending = false; bonus2LandArmed = false;
  jumpBoostTimer = 0; scoreEl.textContent = '0 m'; scoreEl.style.display = 'none';
  runCoins = 0;
  gameOverEl.style.display = 'none';
  hintEl.style.display = 'block';
  initPlatforms();
  var basePlat = platforms.reduce(function(a, b) { return (a.y > b.y ? a : b); }, platforms[0]);
  player.x = basePlat.x + basePlat.width / 2 - PLAYER_WIDTH / 2;
  player.y = HEIGHT + PLAYER_HEIGHT + 30;
  player.vx = 0; player.vy = 0; cameraY = 0;
  introActive = true; introTimer = INTRO_DELAY; introLaunched = false;
  comboCount = 0; comboTimer = 0; comboMultiplier = 1;
  coinPopups = [];
  newBestFlag = false;
  if (currentLevel > 0) {
    levelIntroTimer = 70;
    levelIntroText = 'Уровень ' + currentLevel;
  } else {
    levelIntroTimer = 0;
  }
  // FIX BUG #1: set gameState BEFORE starting music
  gameState = 'playing';
  startMusic();
}

function goToMenu() {
  gameState = 'title'; gameOverEl.style.display = 'none';
  scoreEl.style.display = 'none'; hintEl.style.display = 'none';
  isPaused = false; keys.left = false; keys.right = false;
  currentLevel = 0; levelTarget = 0; levelWinLevel = 0;
  menuSlide = 0; menuTargetSlide = 0;
  spiritShopSlide = 0; spiritShopTargetSlide = 0;
  charInfoSlide = 0; charInfoTargetSlide = 0;
  titleMenu = null; spiritShopOpen = false; charInfoPopup = -1;
  stopMusic();
}

function retryGame() {
  gameOverEl.style.display = 'none';
  if (currentLevel > 0) levelTarget = getLevelTarget(currentLevel);
  startGame();
}

function getLevelTarget(n) { return Math.floor(250 + n * 90 + n * n * 1.6); }
function isLevelUnlocked(n) { return n <= maxLevelUnlocked; }

function update() {
  if (gameState === 'levelwin') {
    levelWinTimer++; updateParticles();
    if (levelWinAnim === 'fly') {
      levelWinFlyTimer++; player.vy -= 0.55; player.y += player.vy; player.x += player.vx * 0.4;
      var targetCam = player.y - HEIGHT * 0.45;
      cameraY += (targetCam - cameraY) * 0.12;
      if (levelWinFlyTimer % 2 === 0) particles.push({
        x: player.x + player.width / 2 + (Math.random() - 0.5) * 20, y: player.y + player.height,
        vx: (Math.random() - 0.5) * 2, vy: 2 + Math.random() * 3,
        life: 20 + Math.random() * 15, maxLife: 35,
        size: 2 + Math.random() * 3, rot: 0, rotSpeed: 0, kind: 'star'
      });
      var screenY = player.y - cameraY;
      if (screenY < -80 || levelWinFlyTimer > 70) { levelWinAnim = 'in'; levelWinAnimT = 0; }
      return;
    }
    var ANIM_FRAMES = 28;
    if (levelWinAnim === 'in') {
      levelWinAnimT = Math.min(1, levelWinAnimT + 1 / ANIM_FRAMES);
      if (levelWinAnimT >= 1) levelWinAnim = 'idle';
    } else if (levelWinAnim === 'out') {
      levelWinAnimT = Math.max(0, levelWinAnimT - 1 / ANIM_FRAMES);
      if (levelWinAnimT <= 0) {
        var action = levelWinPending; levelWinPending = null; levelWinAnim = 'in';
        if (action === 'home') { currentLevel = 0; levelTarget = 0; levelWinLevel = 0; goToMenu(); }
        else if (action === 'next') {
          if (levelWinLevel >= 100) { currentLevel = 0; levelTarget = 0; levelWinLevel = 0; goToMenu(); }
          else { var next = levelWinLevel + 1; currentLevel = next; levelTarget = getLevelTarget(next); levelWinLevel = 0; startGame(); }
        }
        return;
      }
    }
    if (levelWinAnim === 'idle' && levelWinTimer % 4 === 0) particles.push({
      x: Math.random() * WIDTH, y: -10, vx: (Math.random() - 0.5) * 2, vy: 2 + Math.random() * 3,
      life: 40 + Math.random() * 20, maxLife: 60,
      size: 2 + Math.random() * 4, rot: Math.random() * Math.PI, rotSpeed: 0.1, kind: 'win'
    });
    return;
  }
  if (gameState === 'dying') {
    player.vy += GRAVITY * 1.15; player.y += player.vy; player.x += player.vx * 0.4;
    player.vx *= 0.98; updateParticles();
    updateShake(); updateSlowmo(); updateToasts(); updateGameOverStatsAnim();
    updateLandingSquash(); updateSpringStretch();
    if (dyingTimer % 6 === 0) particles.push({
      x: player.x + player.width / 2 + (Math.random() - 0.5) * 20, y: player.y + player.height * 0.5,
      vx: (Math.random() - 0.5) * 1.2, vy: -0.5 - Math.random(),
      life: 25 + Math.random() * 15, maxLife: 40,
      size: 6 + Math.random() * 10, rot: 0, rotSpeed: 0, kind: 'smoke'
    });
    if (dyingTimer > 0) { dyingTimer--; if (dyingTimer <= 0) { gameState = 'gameover'; gameOverEl.style.display = 'none'; } }
    return;
  }
  if (gameState !== 'playing' || isPaused) return;
  if (introActive && !introLaunched) {
    if (introTimer > 0) { introTimer--; player.vx = 0; player.vy = 0; player.y = cameraY + HEIGHT + 24; updateParticles(); updateShield(); return; }
    var basePlat = platforms.reduce(function(a, b) { return (a.y > b.y ? a : b); }, platforms[0]);
    player.x = basePlat.x + basePlat.width / 2 - PLAYER_WIDTH / 2;
    player.y = cameraY + HEIGHT + 8; player.vy = JUMP_FORCE * 1.25;
    introLaunched = true; playJumpSound();
  }
  onPlatform = false;
  if (cdBonus1 > 0) cdBonus1--;
  if (cdBonus2 > 0) cdBonus2--;
  if (cdBonus3 > 0) cdBonus3--;
  if (bonus2CdPending && !bonus2LandArmed && player.vy > 0) bonus2LandArmed = true;
  if (jumpBoostTimer > 0) { jumpBoostTimer--; if (jumpBoostTimer <= 0) cdBonus3 = ABILITY_COOLDOWN; }
  if (bonusActive) {
    bonusTimer--;
    if (bonusTimer % 3 === 0) spawnBonusParticles();
    var remainY = player.y - bonus1TargetY;
    if (bonusTimer > 0 && remainY > 0) {
      var needVy = -(remainY / Math.max(1, bonusTimer));
      player.vy += (needVy - player.vy) * 0.35;
    }
    if (bonusTimer <= 0) {
      if (player.y > bonus1TargetY) player.y = bonus1TargetY;
      player.vy = Math.min(player.vy, -0.5);
      bonusActive = false; cdBonus1 = ABILITY_COOLDOWN;
    }
  }
  var scaleTarget = bonusActive ? BONUS_SCALE : 1;
  bonusVisualScale += (scaleTarget - bonusVisualScale) * 0.12;
  if (Math.abs(bonusVisualScale - scaleTarget) < 0.008) bonusVisualScale = scaleTarget;
  updateParticles(); updateShield(); updateCombo(); updateCoinPopups(); updateEnemies();
  updateShake(); updateSlowmo(); updateLandingSquash(); updateSpringStretch(); updateToasts(); updateGameOverStatsAnim(); updateWarpEffect();
  spawnAmbientParticles();
  if (hasMagnet()) updateMagnetLines(player.x + player.width / 2, player.y + player.height / 2, coins);
  if (levelIntroTimer > 0) levelIntroTimer--;
  if (keys.left) { player.vx = -MOVE_SPEED; player.facing = -1; }
  else if (keys.right) { player.vx = MOVE_SPEED; player.facing = 1; }
  else { player.vx *= 0.78; if (Math.abs(player.vx) < 0.15) player.vx = 0; }
  var tiltTarget = Math.max(-0.22, Math.min(0.22, player.vx * 0.035));
  playerTilt += (tiltTarget - playerTilt) * 0.2;
  if (player.x + player.width < 0) player.x = WIDTH;
  if (player.x > WIDTH) player.x = -player.width;
  if (!bonusActive) {
    var g = GRAVITY;
    if (player.vy > 0) g = GRAVITY * fallGravityMul();
    player.vy += g * slowmoFactor;
  }
  player.y += player.vy * slowmoFactor;
  player.x += player.vx * slowmoFactor;
  if (invincibleTimer > 0) invincibleTimer--;
  var targetCam = player.y - HEIGHT * 0.4;
  if (player.y < cameraY + HEIGHT * 0.4) {
    if (bonusActive || bonusVisualScale > 1.02) cameraY += (targetCam - cameraY) * 0.18;
    else cameraY = targetCam;
  }
  for (var i = 0; i < platforms.length; i++) {
    var p = platforms[i];
    if (p.type === 'moving' && !p.broken && !p.frozen) {
      var prevX = p.x;
      p.x += p.dir * p.speed;
      if (p.x <= 0) { p.x = 0; p.dir = 1; }
      if (p.x + p.width >= WIDTH) { p.x = WIDTH - p.width; p.dir = -1; }
      p.phase = (p.phase || 0) + 0.08;
      p.bob = Math.sin(p.phase) * 2.5;
      if (!bonusActive && player.vy >= 0) {
        var onPlat = player.x + player.width > p.x + 6 && player.x < p.x + p.width - 6 && Math.abs((player.y + player.height) - p.y) < 8;
        if (onPlat) player.x += (p.x - prevX);
      }
    } else if (p.type === 'normal' || p.type === 'spring') {
      p.phase = (p.phase || 0) + 0.03; p.bob = Math.sin(p.phase) * 0.8;
    }
    if (p.broken) { p.breakTimer++; p.y += 4; }
  }
  if (!bonusActive && !bonus1Pending && !bonusesLockedUntilLand) {
    for (var i = 0; i < bonuses.length; i++) {
      var b = bonuses[i];
      if (b.collected) continue;
      if (player.x < b.x + b.width && player.x + player.width > b.x && player.y < b.y + b.height && player.y + player.height > b.y) {
        b.collected = true;
        if (!bonusActive && !bonus1Pending) { bonus1Pending = true; playBonusSound(); }
      }
    }
  }
  var magnetOn = hasMagnet();
  var speedY = Math.abs(player.vy);
  var bodyScale = bonusVisualScale;
  var bodyW = PLAYER_WIDTH * bodyScale;
  var bodyH = PLAYER_HEIGHT * bodyScale;
  var bodyX = player.x + (player.width - bodyW) / 2;
  var bodyY = player.y + player.height - bodyH;
  var magnetRange = magnetOn ? 280 + (bonusActive ? 140 : 0) + speedY * 12 : 0;
  var pcx = bodyX + bodyW / 2;
  var pcy = bodyY + bodyH / 2;
  for (var i = coins.length - 1; i >= 0; i--) {
    var c = coins[i];
    if (c.collected) continue;
    c.phase += 0.1;
    if (magnetOn) {
      var dx = pcx - (c.x + c.width / 2);
      var dy = pcy - (c.y + c.height / 2);
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < magnetRange) c.magnetized = true;
      if (c.magnetized && dist > 1) {
        var pull;
        if (dist < 60) pull = Math.min(dist, 18 + speedY * 1.5 + (bonusActive ? 14 : 0));
        else if (dist < 130) pull = 5.5 + speedY * 0.4;
        else pull = 2.4 + speedY * 0.2;
        if (c.y > player.y) pull += 4 + speedY * 0.6;
        c.x += (dx / dist) * pull;
        c.y += (dy / dist) * pull;
      }
      if (c.magnetized && dist < 36 * bodyScale) { collectCoin(c); continue; }
    }
    var nearPad = 4;
    if (bodyX - nearPad < c.x + c.width && bodyX + bodyW + nearPad > c.x && bodyY - nearPad < c.y + c.height && bodyY + bodyH + nearPad > c.y)
      collectCoin(c);
  }
  if (player.vy > 0 && !bonusActive) {
    for (var i = 0; i < platforms.length; i++) {
      var p = platforms[i];
      if (p.broken) continue;
      var screenY = p.y - cameraY;
      if (screenY < -20 || screenY > HEIGHT + 10) continue;
      if (player.x + player.width > p.x + 8 && player.x < p.x + p.width - 8 && player.y + player.height > p.y && player.y + player.height < p.y + p.height + player.vy + 2) {
        player.y = p.y - player.height;
        var jumpMul = jumpBoostTimer > 0 ? 2 : 1;
        onPlatform = true; bonusesLockedUntilLand = false;
        if (introActive) { introActive = false; introLaunched = false; }
        if (bonus1Pending) { activateBonus1(); break; }
        if (bonus2CdPending && bonus2LandArmed) { bonus2CdPending = false; bonus2LandArmed = false; cdBonus2 = ABILITY_COOLDOWN; }
        if (hasMovingFreezeAbility() && p.type === 'moving' && !p.frozen) { p.frozen = true; p.speed = 0; p.dir = 0; }
        player.vy = JUMP_FORCE * jumpMul;
        spawnPlatformDust(player.x + player.width / 2, p.y);
        if (p.type === 'spring') {
          player.vy = JUMP_FORCE * 1.7 * jumpMul; playSpringSound(); vibrate(12);
          triggerSpringStretch(); addShake(4); spawnSpringBounceParticles(player.x + player.width / 2, p.y);
        }
        else { playJumpSound(); vibrate(6); triggerLandingSquash(); }
        if (p.type === 'breaking' && !hasSafeBreak()) { p.broken = true; p.breakTimer = 0; spawnBreakShards(p.x, p.y, p.width); addShake(3); }
        break;
      }
    }
  }
  var currentHeight = Math.max(0, Math.floor(-cameraY / 10));
  if (currentHeight > maxHeight) {
    maxHeight = currentHeight; score = maxHeight;
    scoreEl.textContent = score + ' m';
    if (score > bestScore) { bestScore = score; saveProgress(); }
    if (currentLevel > 0 && levelTarget > 0 && score >= levelTarget) triggerLevelWin(currentLevel);
  }
  if (maxHeight > 2 && hintEl.style.display !== 'none') hintEl.style.display = 'none';
  generateMorePlatforms();
  var camBottom = cameraY + HEIGHT + 100;
  for (var i = platforms.length - 1; i >= 0; i--) { if (platforms[i].y >= camBottom) platforms.splice(i, 1); }
  for (var i = bonuses.length - 1; i >= 0; i--) { var b = bonuses[i]; if (b.collected || b.y >= camBottom) bonuses.splice(i, 1); }
  for (var i = coins.length - 1; i >= 0; i--) { var c = coins[i]; if (c.collected || (!c.magnetized && c.y >= camBottom)) coins.splice(i, 1); }
  var eCamTop = cameraY - 300, eCamBottom = cameraY + HEIGHT + 200;
  for (var i = enemies.length - 1; i >= 0; i--) { var e = enemies[i]; if (e.y >= eCamBottom || e.y <= eCamTop) enemies.splice(i, 1); }
  if (introActive && introLaunched && player.y > cameraY + HEIGHT + 50) { introActive = false; introLaunched = false; }
  if (!bonusActive && !introActive && invincibleTimer <= 0 && gameState === 'playing' && player.y > cameraY + HEIGHT + 50) {
    if (extraLifeReady) {
      extraLifeReady = false; bonus2FromItem = false; bonus2CdPending = true;
      bonus2LandArmed = false; bonusesLockedUntilLand = true;
      player.vy = -Math.sqrt(2 * GRAVITY * 1000);
      player.y = cameraY + HEIGHT * 0.55;
      invincibleTimer = 180; playSpringSound();
    } else startDeathAnimation();
  }
}

function draw() {
  if (uiPress && uiPress.life > 0) uiPress.life--;
  else { uiPress = null; if (pendingUiAction) { var fn = pendingUiAction; pendingUiAction = null; fn(); } }
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  if (gameState === 'loading' || gameState === 'loadfade') updateLoadingTransition();
  if (gameState === 'loading') { drawLoadingScreen(); return; }
  if (gameState === 'loadfade') {
    drawTitleScreen();
    var a = 1 - loadFadeOut;
    if (a > 0.02) { ctx.save(); ctx.globalAlpha = a; drawLoadingScreen(); ctx.restore(); ctx.globalAlpha = 1; }
    return;
  }
  if (gameState === 'title') { titleFadeIn = 1; drawTitleScreen(); return; }
  drawBackground();
  ctx.save();
  ctx.translate(shakeX, shakeY);
  for (var i = 0; i < platforms.length; i++) drawPlatform(platforms[i]);
  for (var i = 0; i < bonuses.length; i++) drawBonus(bonuses[i]);
  for (var i = 0; i < coins.length; i++) drawCoin(coins[i]);
  for (var i = 0; i < enemies.length; i++) drawEnemy(enemies[i]);
  drawMagnetLines();
  drawParticles();
  drawCoinPopups();
  drawSpirit();
  drawPlayer();
  drawWarpEffect();
  if (bonusActive) {
    var barW = 120, barH = 10, barX = (WIDTH - barW) / 2, barY = 68;
    var progress = bonusTimer / BONUS_DURATION;
    ctx.fillStyle = 'rgba(0,0,0,0.4)'; roundRect(barX - 2, barY - 2, barW + 4, barH + 4, 6); ctx.fill();
    ctx.fillStyle = TEXT_COL; roundRect(barX, barY, barW * progress, barH, 4); ctx.fill();
  }
  drawScoreHUD(); drawHUDButtons();
  if (isPaused) {
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0, 0, WIDTH, HEIGHT);
    var panelW = 280, panelH = 220;
    var panelX = (WIDTH - panelW) / 2, panelY = (HEIGHT - panelH) / 2 - 20;
    drawMenuPanelBg(panelX, panelY, panelW, panelH, 20);
    drawMenuTitle('ПАУЗА', WIDTH / 2, panelY + 42, 200, 48);
    var btnW = 200, btnH = 48;
    var contX = (WIDTH - btnW) / 2, menuY = panelY + 80;
    drawKeycapBtn(contX, menuY, btnW, btnH, 'Меню', TEXT_COL);
    var contY = menuY + btnH + 12;
    drawKeycapBtn(contX, contY, btnW, btnH, 'Продолжить', TEXT_COL);
    pauseMenuBtns.menu = { x: contX, y: menuY, w: btnW, h: btnH };
    pauseMenuBtns.continue = { x: contX, y: contY, w: btnW, h: btnH };
  }
  if (gameState === 'levelwin' && levelWinAnim !== 'fly') drawLevelWinScreen();
  if (gameState === 'gameover') drawGameOverScreen();
  if (levelIntroTimer > 0) {
    var introAlpha = Math.min(1, levelIntroTimer / 20);
    var introFade = levelIntroTimer < 20 ? levelIntroTimer / 20 : 1;
    ctx.save();
    ctx.globalAlpha = introAlpha * introFade;
    ctx.fillStyle = 'rgba(8, 12, 28, 0.75)';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.font = 'bold 36px Segoe UI, Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = TEXT_COL;
    ctx.lineWidth = 4;
    ctx.lineJoin = 'round';
    ctx.strokeText(levelIntroText, WIDTH / 2, HEIGHT / 2 - 10);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(levelIntroText, WIDTH / 2, HEIGHT / 2 - 10);
    if (currentLevel > 0 && levelTarget > 0) {
      ctx.font = 'bold 16px Segoe UI, Arial';
      ctx.strokeText('Цель: ' + levelTarget + ' m', WIDTH / 2, HEIGHT / 2 + 30);
      ctx.fillStyle = '#ffe082';
      ctx.fillText('Цель: ' + levelTarget + ' m', WIDTH / 2, HEIGHT / 2 + 30);
    }
    ctx.restore();
  }
  if (gameState === 'dying') {
    var t = 1 - dyingTimer / 90;
    if (t < 0.25) { ctx.fillStyle = 'rgba(180, 30, 40, ' + ((0.25 - t) * 1.2) + ')'; ctx.fillRect(0, 0, WIDTH, HEIGHT); }
    ctx.fillStyle = 'rgba(10, 8, 20, ' + (t * 0.65) + ')'; ctx.fillRect(0, 0, WIDTH, HEIGHT);
  }
  ctx.restore();
  if (deathFlashAlpha > 0.01) {
    ctx.save();
    ctx.globalAlpha = deathFlashAlpha;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.restore();
    deathFlashAlpha *= 0.85;
  }
  var vignette = ctx.createRadialGradient(WIDTH / 2, HEIGHT / 2, HEIGHT * 0.3, WIDTH / 2, HEIGHT / 2, HEIGHT * 0.9);
  vignette.addColorStop(0, 'rgba(0,0,0,0)'); vignette.addColorStop(1, 'rgba(0,0,0,0.15)');
  ctx.fillStyle = vignette; ctx.fillRect(0, 0, WIDTH, HEIGHT);
  drawToasts();
}

function handleTitleClick(clientX, clientY) {
  var rect = canvas.getBoundingClientRect();
  var mx = (clientX - rect.left) * (WIDTH / rect.width);
  var my = (clientY - rect.top) * (HEIGHT / rect.height);
  if (spiritShopOpen && spiritShopSlide > 0.02) {
    var ss = Math.max(0.01, spiritShopSlide);
    mx = spiritShopOriginX + (mx - spiritShopOriginX) / ss;
    my = spiritShopOriginY + (my - spiritShopOriginY) / ss;
    var cl = titleLayout._spiritShopClose;
    if (cl && mx >= cl.x && mx <= cl.x + cl.w && my >= cl.y && my <= cl.y + cl.h) { pressBtn(cl.x, cl.y, cl.w, cl.h); spiritShopTargetSlide = 0; return; }
    for (var i = 0; i < spiritShopHits.length; i++) {
      var h = spiritShopHits[i];
      if (mx >= h.x && mx <= h.x + h.w && my >= h.y && my <= h.y + h.h) {
        pressBtn(h.x, h.y, h.w, h.h);
        if (h.type === 'buy') {
          if (totalRolls >= SPIRIT_PRICE) { totalRolls -= SPIRIT_PRICE; unlockedSpirits[h.idx] = true; saveProgress(); playCoinSound(); }
          else coinShake = 20;
        } else if (h.type === 'select') { selectedSpirit = h.idx; saveProgress(); }
        return;
      }
    }
    return;
  }
  if (titleMenu) {
    if (menuTargetSlide === 0) return;
    if (menuSlide > 0.02) {
      var ms = Math.max(0.01, menuSlide);
      mx = menuOriginX + (mx - menuOriginX) / ms;
      my = menuOriginY + (my - menuOriginY) / ms;
    }
    var cl = titleLayout._menuClose;
    if (cl && mx >= cl.x && mx <= cl.x + cl.w && my >= cl.y && my <= cl.y + cl.h) { pressBtn(cl.x, cl.y, cl.w, cl.h); menuTargetSlide = 0; return; }
    var hits = titleLayout._menuHits || [];
    for (var i = 0; i < hits.length; i++) {
      var h = hits[i];
      if (mx >= h.x && mx <= h.x + h.w && my >= h.y && my <= h.y + h.h) {
        pressBtn(h.x, h.y, h.w, h.h);
        if (h.type === 'level' && isLevelUnlocked(h.n)) {
          if (levelDidScroll) { levelDidScroll = false; return; }
          var n = h.n;
          pendingUiAction = function() { currentLevel = n; levelTarget = getLevelTarget(n); menuTargetSlide = 0; titleMenu = null; if (!unlockedChars[selectedCharacter]) selectedCharacter = 0; startGame(); };
          return;
        }
        if (h.type === 'claim' && !missionsDone[h.id]) {
          if (missionDidScroll) { missionDidScroll = false; return; }
          missionsDone[h.id] = true; totalCoins += h.reward; totalRolls += MISSION_ROLL_REWARD;
          saveProgress(); saveMetaProgress();
          secretFlashTimer = 60; secretFlashText = '+' + MISSION_ROLL_REWARD; coinShake = 12;
        }
        if (h.type === 'claimAll') {
          var sum = 0, cnt = 0;
          for (var j = 0; j < MISSIONS.length; j++) {
            var m = MISSIONS[j];
            if (missionsDone[m.id]) continue;
            if (getMissionProgress(m) >= m.need) { missionsDone[m.id] = true; sum += m.reward; cnt++; }
          }
          if (cnt > 0) { totalCoins += sum; totalRolls += cnt * MISSION_ROLL_REWARD; saveProgress(); saveMetaProgress(); secretFlashTimer = 70; secretFlashText = '+' + (cnt * MISSION_ROLL_REWARD); coinShake = 14; }
        }
        if (h.type === 'togMusic') toggleMusic();
        if (h.type === 'togSfx') { sfxEnabled = !sfxEnabled; saveMetaProgress(); }
        if (h.type === 'togVibro') { vibrationEnabled = !vibrationEnabled; saveMetaProgress(); }
        if (h.type === 'slMusic') { musicVol = Math.max(0, Math.min(1, (mx - h.x) / h.w)); music.volume = musicVol; saveMetaProgress(); }
        if (h.type === 'slSfx') { sfxVol = Math.max(0, Math.min(1, (mx - h.x) / h.w)); saveMetaProgress(); }
        return;
      }
    }
    return;
  }
  if (charInfoPopup >= 0) {
    if (charInfoTargetSlide === 0) return;
    if (charInfoSlide > 0.02) {
      var cs = Math.max(0.01, charInfoSlide);
      mx = charInfoOriginX + (mx - charInfoOriginX) / cs;
      my = charInfoOriginY + (my - charInfoOriginY) / cs;
    }
    var up = titleLayout._infoUpgrade;
    if (up && mx >= up.x && mx <= up.x + up.w && my >= up.y && my <= up.y + up.h) { pressBtn(up.x, up.y, up.w, up.h); upgradeCharacter(up.i); return; }
    var rst = titleLayout._infoReset;
    if (rst && mx >= rst.x && mx <= rst.x + rst.w && my >= rst.y && my <= rst.y + rst.h) { pressBtn(rst.x, rst.y, rst.w, rst.h); resetCharacterLevel(rst.i); return; }
    var skLeft = titleLayout._infoSkinLeft;
    if (skLeft && mx >= skLeft.x && mx <= skLeft.x + skLeft.w && my >= skLeft.y && my <= skLeft.y + skLeft.h) {
      var step = 44 + 6;
      skinScrollX = Math.max(0, skinScrollX - step);
      playCoinSound();
      return;
    }
    var skRight = titleLayout._infoSkinRight;
    if (skRight && mx >= skRight.x && mx <= skRight.x + skRight.w && my >= skRight.y && my <= skRight.y + skRight.h) {
      var step2 = 44 + 6;
      skinScrollX = skinScrollX + step2;
      playCoinSound();
      return;
    }
    for (var si = 0; si < skinHits.length; si++) {
      var sh = skinHits[si];
      if (sh && mx >= sh.x && mx <= sh.x + sh.w && my >= sh.y && my <= sh.y + sh.h) {
        selectedSkins[sh.ci] = sh.si;
        saveProgress();
        playCoinSound();
        return;
      }
    }
    var cl = titleLayout._infoClose;
    var panel = titleLayout._infoPanel;
    if (cl && mx >= cl.x && mx <= cl.x + cl.w && my >= cl.y && my <= cl.y + cl.h) { charInfoTargetSlide = 0; return; }
    if (panel && !(mx >= panel.x && mx <= panel.x + panel.w && my >= panel.y && my <= panel.y + panel.h)) { charInfoTargetSlide = 0; return; }
    return;
  }
  if (titleLayout._spiritBtn) {
    var b = titleLayout._spiritBtn;
    if (mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h) { spiritShopOpen = true; spiritShopTargetSlide = 1; spiritShopSlide = 0; spiritShopOriginX = b.x + b.w / 2; spiritShopOriginY = b.y + b.h / 2; spiritShopOriginW = b.w; spiritShopOriginH = b.h; pressBtn(b.x, b.y, b.w, b.h); return; }
  }
  if (titleLayout._menuBtns) {
    for (var i = 0; i < titleLayout._menuBtns.length; i++) {
      var b = titleLayout._menuBtns[i];
      if (mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h) {
        pressBtn(b.x, b.y, b.w, b.h);
        var key = b.key;
        pendingUiAction = function() {
          if (key === 'start') { currentLevel = 0; levelTarget = 0; if (!unlockedChars[selectedCharacter]) selectedCharacter = 0; startGame(); }
          else if (key === 'levels') { titleMenu = 'levels'; menuTargetSlide = 1; menuSlide = 0; menuOriginX = b.x + b.w / 2; menuOriginY = b.y + b.h / 2; menuOriginW = b.w; menuOriginH = b.h; levelScrollY = 0; levelScrollV = 0; }
          else if (key === 'missions') { titleMenu = 'missions'; menuTargetSlide = 1; menuSlide = 0; menuOriginX = b.x + b.w / 2; menuOriginY = b.y + b.h / 2; menuOriginW = b.w; menuOriginH = b.h; missionScrollY = 0; missionScrollV = 0; }
          else if (key === 'settings') { titleMenu = 'settings'; menuTargetSlide = 1; menuSlide = 0; menuOriginX = b.x + b.w / 2; menuOriginY = b.y + b.h / 2; menuOriginW = b.w; menuOriginH = b.h; }
        };
        return;
      }
    }
  }
  for (var i = 0; i < titleInfoBtns.length; i++) {
    var b = titleInfoBtns[i];
    if (mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h) { pressBtn(b.x, b.y, b.w, b.h); charInfoPopup = b.i; charInfoTargetSlide = 1; charInfoSlide = 0; charInfoOriginX = b.x + b.w / 2; charInfoOriginY = b.y + b.h / 2; skinScrollX = 0; return; }
  }
  if (titleLayout._buyBtns) {
    for (var i = 0; i < titleLayout._buyBtns.length; i++) {
      var b = titleLayout._buyBtns[i];
      if (mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h) {
        pressBtn(b.x, b.y, b.w, b.h);
        var info = CHAR_INFO[b.i];
        if (!isCharUnlocked(b.i) && info.unlock === 'coins') {
          if (totalCoins >= info.price) { totalCoins -= info.price; unlockedChars[b.i] = true; selectedCharacter = b.i; saveProgress(); }
          else triggerNoMoneyShake(b.i);
        }
        return;
      }
    }
  }
  var positions = getCharPositions();
  for (var i = 0; i < 6; i++) {
    var pos = positions[i];
    var sz = titleLayout.charSize;
    if (mx >= pos.x - 8 && mx <= pos.x + sz + 8 && my >= pos.y - 8 && my <= pos.y + sz + 8) {
      if (i === 0) { /* pip secret */ }
      else if (i === 1) { /* janko secret */ }
      else if (i === 2) { /* zora secret */ }
      else if (i === 3) { /* brutus secret */ }
      else if (i === 5) { /* hex secret */ }
      if (isCharUnlocked(i)) selectedCharacter = i;
      else if (CHAR_INFO[i].unlock === 'coins') triggerNoMoneyShake(i);
      return;
    }
  }
}

function handleGameClick(clientX, clientY) {
  var rect = canvas.getBoundingClientRect();
  var mx = (clientX - rect.left) * (WIDTH / rect.width);
  var my = (clientY - rect.top) * (HEIGHT / rect.height);
  if (gameState === 'gameover') {
    var m = gameOverMenuBtns.menu, r = gameOverMenuBtns.retry;
    if (m && mx >= m.x && mx <= m.x + m.w && my >= m.y && my <= m.y + m.h) { pressBtn(m.x, m.y, m.w, m.h); goToMenu(); return; }
    if (r && mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h) { pressBtn(r.x, r.y, r.w, r.h); retryGame(); return; }
    return;
  }
  if (gameState === 'levelwin') {
    if (levelWinAnim !== 'idle') return;
    var h = levelWinBtns.home, n = levelWinBtns.next;
    if (h && mx >= h.x && mx <= h.x + h.w && my >= h.y && my <= h.y + h.h) { pressBtn(h.x, h.y, h.w, h.h); levelWinPending = 'home'; levelWinAnim = 'out'; return; }
    if (n && mx >= n.x && mx <= n.x + n.w && my >= n.y && my <= n.y + n.h) { pressBtn(n.x, n.y, n.w, n.h); levelWinPending = 'next'; levelWinAnim = 'out'; return; }
    return;
  }
  if (gameState === 'playing') {
    if (!isPaused) {
      var hit = function(box) { return box && mx >= box.x && mx <= box.x + box.w && my >= box.y && my <= box.y + box.h; };
      if (hit(shopHit.buy1)) { pressBtn(shopHit.buy1.x, shopHit.buy1.y, shopHit.buy1.w, shopHit.buy1.h); buyBonus(1); return; }
      if (hit(shopHit.buy2)) { pressBtn(shopHit.buy2.x, shopHit.buy2.y, shopHit.buy2.w, shopHit.buy2.h); buyBonus(2); return; }
      if (hit(shopHit.buy3)) { pressBtn(shopHit.buy3.x, shopHit.buy3.y, shopHit.buy3.w, shopHit.buy3.h); buyBonus(3); return; }
      if (hit(shopHit.b1)) { pressBtn(shopHit.b1.x, shopHit.b1.y, shopHit.b1.w, shopHit.b1.h); useBonus1(); return; }
      if (hit(shopHit.b2)) { pressBtn(shopHit.b2.x, shopHit.b2.y, shopHit.b2.w, shopHit.b2.h); useBonus2(); return; }
      if (hit(shopHit.b3)) { pressBtn(shopHit.b3.x, shopHit.b3.y, shopHit.b3.w, shopHit.b3.h); useBonus3(); return; }
    }
    if (isPaused) {
      var c = pauseMenuBtns.continue, mm = pauseMenuBtns.menu;
      if (c && mx >= c.x && mx <= c.x + c.w && my >= c.y && my <= c.y + c.h) { pressBtn(c.x, c.y, c.w, c.h); isPaused = false; keys.left = false; keys.right = false; return; }
      if (mm && mx >= mm.x && mx <= mm.x + mm.w && my >= mm.y && my <= mm.y + mm.h) { pressBtn(mm.x, mm.y, mm.w, mm.h); isPaused = false; goToMenu(); return; }
      return;
    }
    var pb = pauseBtn;
    if (mx >= pb.x && mx <= pb.x + pb.size && my >= pb.y && my <= pb.y + pb.size) { pressBtn(pb.x, pb.y, pb.size, pb.size); isPaused = !isPaused; keys.left = false; keys.right = false; return; }
    var mb = musicBtn;
    if (mx >= mb.x && mx <= mb.x + mb.size && my >= mb.y && my <= mb.y + mb.size) { pressBtn(mb.x, mb.y, mb.size, mb.size); toggleMusic(); return; }
  }
}

var cheatBuffer = '';
function handleCheatCode(key) {
  cheatBuffer += key.toLowerCase();
  if (cheatBuffer.length > 20) cheatBuffer = cheatBuffer.slice(-20);
  if (cheatBuffer.indexOf('monstergold') !== -1) {
    totalCoins += 50000; saveProgress(); secretFlashTimer = 80; secretFlashText = '+50000'; coinShake = 20; vibrate(30);
    cheatBuffer = ''; return true;
  }
  if (cheatBuffer.indexOf('monsterall') !== -1) {
    for (var i = 0; i < 6; i++) unlockedChars[i] = true;
    saveProgress(); secretFlashTimer = 80; secretFlashText = 'ВСЕ ГОТОВЫ'; coinShake = 20; vibrate(30);
    cheatBuffer = ''; return true;
  }
  if (cheatBuffer.indexOf('monsterdell') !== -1) {
    totalCoins = 0; totalCrystals = 0; totalRolls = 0;
    for (var i = 1; i < 6; i++) unlockedChars[i] = false;
    bestScore = 0; bestRunCoins = 0;
    levelsCompleted = {}; missionsDone = {}; maxLevelUnlocked = 1;
    for (var i = 0; i < 6; i++) { charLevels[i] = 1; unlockedSpirits[i] = false; }
    selectedCharacter = 0; selectedSpirit = -1;
    saveProgress(); saveMetaProgress();
    secretFlashTimer = 80; secretFlashText = 'СБРОС'; coinShake = 20; vibrate(50);
    cheatBuffer = ''; return true;
  }
  if (cheatBuffer.indexOf('openall') !== -1) {
    for (var i = 0; i < 6; i++) unlockedChars[i] = true;
    maxLevelUnlocked = 100;
    saveProgress(); saveMetaProgress();
    secretFlashTimer = 80; secretFlashText = 'ВСЕ УРОВНИ'; coinShake = 20; vibrate(30);
    cheatBuffer = ''; return true;
  }
  return false;
}

window.addEventListener('keydown', function(e) {
  if (gameState === 'title' && e.key.length === 1) { handleCheatCode(e.key); }
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = true;
  if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = true;
  if (e.code === 'ArrowDown' || e.code === 'KeyS') keys.down = true;
  if (e.code === 'ArrowUp' || e.code === 'KeyW') keys.up = true;
  if (e.code === 'Space' && gameState === 'gameover') retryGame();
  if ((e.code === 'KeyP' || e.code === 'Escape') && gameState === 'playing') { isPaused = !isPaused; keys.left = false; keys.right = false; }
});

window.addEventListener('keyup', function(e) {
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = false;
  if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = false;
  if (e.code === 'ArrowDown' || e.code === 'KeyS') keys.down = false;
  if (e.code === 'ArrowUp' || e.code === 'KeyW') keys.up = false;
});

var mouseDown = false;

function registerCanvasEvents() {
  canvas.addEventListener('touchstart', function(e) {
    e.preventDefault();
    if (gameState === 'title' && charInfoPopup >= 0) {
      var p = canvasToGame(e.touches[0].clientX, e.touches[0].clientY);
      var skClip = titleLayout._infoSkinClip;
      if (skClip && p.x >= skClip.x && p.x <= skClip.x + skClip.w && p.y >= skClip.y && p.y <= skClip.y + skClip.h) {
        skinScrollDrag = { x: p.x, scroll: skinScrollX, lastX: p.x, moved: false };
      }
      return;
    }
    if (gameState === 'title' && (titleMenu === 'levels' || titleMenu === 'missions')) {
      var p = canvasToGame(e.touches[0].clientX, e.touches[0].clientY);
      if (titleMenu === 'levels') {
        var clip = titleLayout._levelClip;
        if (clip && p.x >= clip.x && p.x <= clip.x + clip.w && p.y >= clip.y && p.y <= clip.y + clip.h) {
          levelDrag = { y: p.y, scroll: levelScrollY, lastY: p.y, moved: false }; levelScrollV = 0;
        }
      } else {
        var clip2 = titleLayout._missionClip;
        if (clip2 && p.x >= clip2.x && p.x <= clip2.x + clip2.w && p.y >= clip2.y && p.y <= clip2.y + clip2.h) {
          missionDrag = { y: p.y, scroll: missionScrollY, lastY: p.y, moved: false }; missionScrollV = 0;
        }
      }
      return;
    }
    if (gameState !== 'playing' || isPaused) return;
    var p = canvasToGame(e.touches[0].clientX, e.touches[0].clientY);
    if (isHudClick(p.x, p.y)) return;
    touchX = e.touches[0].clientX; touchY = e.touches[0].clientY;
    keys.left = p.x < WIDTH / 2; keys.right = !keys.left;
  }, { passive: false });

  canvas.addEventListener('touchmove', function(e) {
    e.preventDefault();
    if (gameState === 'title' && titleMenu === 'levels' && levelDrag) {
      var p = canvasToGame(e.touches[0].clientX, e.touches[0].clientY);
      var dy = p.y - levelDrag.y;
      if (Math.abs(dy) > 4) levelDrag.moved = true;
      levelScrollY = Math.max(0, Math.min(levelScrollMax, levelDrag.scroll - dy));
      levelScrollV = levelDrag.lastY - p.y; levelDrag.lastY = p.y; return;
    }
    if (gameState === 'title' && titleMenu === 'missions' && missionDrag) {
      var p2 = canvasToGame(e.touches[0].clientX, e.touches[0].clientY);
      var dy2 = p2.y - missionDrag.y;
      if (Math.abs(dy2) > 4) missionDrag.moved = true;
      missionScrollY = Math.max(0, Math.min(missionScrollMax, missionDrag.scroll - dy2));
      missionScrollV = missionDrag.lastY - p2.y; missionDrag.lastY = p2.y; return;
    }
    if (gameState === 'title' && charInfoPopup >= 0 && skinScrollDrag) {
      var p4 = canvasToGame(e.touches[0].clientX, e.touches[0].clientY);
      var dx4 = skinScrollDrag.x - p4.x;
      if (Math.abs(dx4) > 4) skinScrollDrag.moved = true;
      skinScrollX = Math.max(0, skinScrollDrag.scroll + dx4);
      skinScrollDrag.lastX = p4.x; return;
    }
    if (gameState !== 'playing' || isPaused || touchX === null) return;
    var p3 = canvasToGame(e.touches[0].clientX, e.touches[0].clientY);
    var currentY = e.touches[0].clientY;
    var dy3 = touchY != null ? currentY - touchY : 0;
    if (Math.abs(dy3) > 28) { if (dy3 > 0) { keys.down = true; keys.up = false; } else { keys.up = true; keys.down = false; } touchY = currentY; }
    keys.left = p3.x < WIDTH / 2; keys.right = !keys.left;
    touchX = e.touches[0].clientX;
  }, { passive: false });

  canvas.addEventListener('mousedown', function(e) {
    var p = canvasToGame(e.clientX, e.clientY);
    if (gameState === 'title') {
      if (charInfoPopup >= 0) {
        var skClip = titleLayout._infoSkinClip;
        if (skClip && p.x >= skClip.x && p.x <= skClip.x + skClip.w && p.y >= skClip.y && p.y <= skClip.y + skClip.h) {
          skinScrollDrag = { x: p.x, scroll: skinScrollX, lastX: p.x, moved: false };
        }
        return;
      }
      if (titleMenu === 'levels') {
        var clip = titleLayout._levelClip;
        if (clip && p.x >= clip.x && p.x <= clip.x + clip.w && p.y >= clip.y && p.y <= clip.y + clip.h) {
          levelDrag = { y: p.y, scroll: levelScrollY, lastY: p.y, moved: false }; levelScrollV = 0;
        }
      } else if (titleMenu === 'missions') {
        var clip2 = titleLayout._missionClip;
        if (clip2 && p.x >= clip2.x && p.x <= clip2.x + clip2.w && p.y >= clip2.y && p.y <= clip2.y + clip2.h) {
          missionDrag = { y: p.y, scroll: missionScrollY, lastY: p.y, moved: false }; missionScrollV = 0;
        }
      }
      return;
    }
    if (gameState !== 'playing') return;
    if (isHudClick(p.x, p.y)) return;
    mouseDown = true;
    keys.left = p.x < WIDTH / 2; keys.right = !keys.left;
  });

  canvas.addEventListener('wheel', function(e) {
    if (gameState !== 'title') return;
    if (charInfoPopup >= 0) { e.preventDefault(); skinScrollX = Math.max(0, skinScrollX + e.deltaY * 0.5); return; }
    if (titleMenu === 'levels') { e.preventDefault(); levelScrollY = Math.max(0, Math.min(levelScrollMax, levelScrollY + e.deltaY * 0.5)); levelScrollV = 0; }
    else if (titleMenu === 'missions') { e.preventDefault(); missionScrollY = Math.max(0, Math.min(missionScrollMax, missionScrollY + e.deltaY * 0.5)); missionScrollV = 0; }
  }, { passive: false });

  canvas.addEventListener('click', function(e) {
    if (gameState === 'title') handleTitleClick(e.clientX, e.clientY);
    else if (gameState === 'playing' || gameState === 'levelwin' || gameState === 'gameover') handleGameClick(e.clientX, e.clientY);
  });

  canvas.addEventListener('touchend', function(e) {
    if (skinScrollDrag) { skinScrollDrag = null; }
    if (levelDrag) { levelDidScroll = !!levelDrag.moved; levelDrag = null; }
    if (missionDrag) { missionDidScroll = !!missionDrag.moved; missionDrag = null; }
    if (e.changedTouches.length > 0) {
      var t = e.changedTouches[0];
      if (gameState === 'title') { e.preventDefault(); handleTitleClick(t.clientX, t.clientY); }
      else if (gameState === 'playing' || gameState === 'levelwin' || gameState === 'gameover') { e.preventDefault(); handleGameClick(t.clientX, t.clientY); }
    }
    touchX = null; touchY = null;
    if (gameState === 'playing') { keys.left = false; keys.right = false; keys.up = false; keys.down = false; }
  }, { passive: false });
}

window.addEventListener('mousemove', function(e) {
  if (skinScrollDrag) {
    var p = canvasToGame(e.clientX, e.clientY);
    var dx = skinScrollDrag.x - p.x;
    if (Math.abs(dx) > 4) skinScrollDrag.moved = true;
    skinScrollX = Math.max(0, skinScrollDrag.scroll + dx);
    skinScrollDrag.lastX = p.x; return;
  }
  if (levelDrag && titleMenu === 'levels') {
    var p = canvasToGame(e.clientX, e.clientY);
    var dy = p.y - levelDrag.y;
    if (Math.abs(dy) > 4) levelDrag.moved = true;
    levelScrollY = Math.max(0, Math.min(levelScrollMax, levelDrag.scroll - dy));
    levelScrollV = levelDrag.lastY - p.y; levelDrag.lastY = p.y; return;
  }
  if (missionDrag && titleMenu === 'missions') {
    var p2 = canvasToGame(e.clientX, e.clientY);
    var dy2 = p2.y - missionDrag.y;
    if (Math.abs(dy2) > 4) missionDrag.moved = true;
    missionScrollY = Math.max(0, Math.min(missionScrollMax, missionDrag.scroll - dy2));
    missionScrollV = missionDrag.lastY - p2.y; missionDrag.lastY = p2.y; return;
  }
  if (!mouseDown || gameState !== 'playing') return;
  var p3 = canvasToGame(e.clientX, e.clientY);
  keys.left = p3.x < WIDTH / 2; keys.right = !keys.left;
});

window.addEventListener('mouseup', function() {
  if (skinScrollDrag) { skinScrollDrag = null; }
  if (levelDrag) { levelDidScroll = !!levelDrag.moved; levelDrag = null; }
  if (missionDrag) { missionDidScroll = !!missionDrag.moved; missionDrag = null; }
  mouseDown = false;
  if (gameState === 'playing') { keys.left = false; keys.right = false; }
});

function updateLoadingTransition() {
  checkAssetsReady();
  var elapsed = performance.now() - loadStartTime;
  var timeP = Math.min(1, elapsed / MIN_LOAD_MS);
  var assetP = assetsTotal > 0 ? assetsLoaded / assetsTotal : 0;
  var target = Math.min(1, timeP * 0.55 + assetP * 0.45);
  loadVisualProgress += (Math.max(target, timeP * 0.35) - loadVisualProgress) * 0.08;
  if (loadVisualProgress > 0.995) loadVisualProgress = 1;
  if (gameState === 'loading' && assetsReady && elapsed >= MIN_LOAD_MS && loadVisualProgress >= 0.98) { gameState = 'loadfade'; loadFadeOut = 0; titleFadeIn = 0; }
  if (gameState === 'loadfade') { loadFadeOut = Math.min(1, loadFadeOut + 0.025); titleFadeIn = loadFadeOut; if (loadFadeOut >= 0.999) { loadFadeOut = 1; titleFadeIn = 1; gameState = 'title'; } }
}

var lastFrameTime = 0;
var accumulator = 0;

function loop(now) {
  if (!lastFrameTime) lastFrameTime = now;
  var frameTime = now - lastFrameTime;
  lastFrameTime = now;
  if (frameTime > 45) frameTime = 45;
  accumulator += frameTime;
  while (accumulator >= FIXED_DT) {
    if (gameState === 'playing' || gameState === 'dying' || gameState === 'levelwin') update();
    accumulator -= FIXED_DT;
  }
  draw();
  requestAnimationFrame(loop);
}

function init() {
  canvas = document.getElementById('gameCanvas');
  ctx = canvas.getContext('2d');
  scoreEl = document.getElementById('score');
  gameOverEl = document.getElementById('game-over');
  hintEl = document.getElementById('hint');
  loadProgress();
  initAssets();
  resize();
  document.getElementById('game-container').style.visibility = 'visible';
  window.addEventListener('resize', resize);
  registerCanvasEvents();
  requestAnimationFrame(loop);
}

init();
