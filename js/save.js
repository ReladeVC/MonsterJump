var totalCoins = 0;
var totalCrystals = 0;
var totalRolls = 0;
var invBonus1 = 0, invBonus2 = 0, invBonus3 = 0;
var unlockedChars = [true, false, false, false, false, false];
var charLevels = [1, 1, 1, 1, 1, 1];
var selectedCharacter = 0;
var selectedSpirit = -1;
var selectedSkins = [0, 0, 0, 0, 0, 0];
var unlockedSpirits = [false, false, false, false, false, false];
var bestScore = 0;
var bestRunCoins = 0;
var maxLevelUnlocked = 1;
var levelsCompleted = {};
var missionsDone = {};
var missionStats = { plays: 0, use_bonus1: 0, use_bonus2: 0, use_bonus3: 0 };
var rewardedLevels = {};

function getActiveChars() {
  var chars = [selectedCharacter];
  if (selectedSpirit >= 0) chars.push(selectedSpirit);
  return chars;
}

function hasCoinDouble() {
  return getActiveChars().some(function(i) { return i === 1 || i === 4 || i === 5; });
}

function hasMagnet() {
  return getActiveChars().some(function(i) { return i === 2 || i === 5; });
}

function fallGravityMul() {
  var chars = getActiveChars();
  var maxLvl = 1;
  chars.forEach(function(i) { maxLvl = Math.max(maxLvl, charLevels[i] || 1); });
  var reduce = (maxLvl / 99) * 0.70;
  return Math.max(0.30, 1 - reduce);
}

function fallReducePercent(i) {
  var lvl = Math.max(1, Math.min(99, charLevels[i != null ? i : selectedCharacter] || 1));
  return Math.round((lvl / 99) * 70);
}

function hasExtraLife() {
  return getActiveChars().some(function(i) { return i === 0 || i === 5; });
}

function hasSafeBreak() {
  return getActiveChars().some(function(i) { return i === 3; });
}

function hasMovingFreezeAbility() {
  return getActiveChars().some(function(i) { return i === 4; });
}

function isCharUnlocked(i) {
  if (i === 0 || unlockedChars[i]) return true;
  return false;
}

function loadProgress() {
  try {
    totalCoins = parseInt(localStorage.getItem('monsterJumpCoins') || '0', 10) || 0;
    totalCrystals = parseInt(localStorage.getItem('monsterJumpCrystals') || '0', 10) || 0;
    totalRolls = parseInt(localStorage.getItem('monsterJumpRolls') || '0', 10) || 0;
    invBonus1 = parseInt(localStorage.getItem('monsterJumpBonus1') || '0', 10) || 0;
    invBonus2 = parseInt(localStorage.getItem('monsterJumpBonus2') || '0', 10) || 0;
    invBonus3 = parseInt(localStorage.getItem('monsterJumpBonus3') || '0', 10) || 0;
    var u = localStorage.getItem('monsterJumpUnlocks');
    if (u) {
      var arr = JSON.parse(u);
      if (Array.isArray(arr)) {
        for (var i = 0; i < 6; i++) unlockedChars[i] = !!arr[i];
        unlockedChars[0] = true;
      }
    }
    var lv = localStorage.getItem('monsterJumpCharLevels');
    if (lv) {
      var arr2 = JSON.parse(lv);
      if (Array.isArray(arr2)) {
        for (var i = 0; i < 6; i++) charLevels[i] = Math.max(1, Math.min(99, parseInt(arr2[i], 10) || 1));
      }
    }
    var savedSpirit = localStorage.getItem('monsterJumpSelectedSpirit');
    if (savedSpirit !== null) {
      selectedSpirit = parseInt(savedSpirit, 10);
      if (isNaN(selectedSpirit) || selectedSpirit < -1 || selectedSpirit > 5) selectedSpirit = -1;
    }
    var us = localStorage.getItem('monsterJumpSpirits');
    if (us) {
      var arr3 = JSON.parse(us);
      if (Array.isArray(arr3)) {
        for (var i = 0; i < 6; i++) unlockedSpirits[i] = !!arr3[i];
      }
    }
    bestScore = parseInt(localStorage.getItem('monsterJumpBest') || '0', 10) || 0;
    bestRunCoins = parseInt(localStorage.getItem('monsterJumpBestRunCoins') || '0', 10) || 0;
    maxLevelUnlocked = parseInt(localStorage.getItem('monsterJumpMaxLevel') || '1', 10) || 1;
    try { levelsCompleted = JSON.parse(localStorage.getItem('monsterJumpLevelsDone') || '{}') || {}; } catch (e) {}
    try { missionsDone = JSON.parse(localStorage.getItem('monsterJumpMissions') || '{}') || {}; } catch (e) {}
    try { missionStats = JSON.parse(localStorage.getItem('monsterJumpMissionStats') || '{"plays":0,"use_bonus1":0,"use_bonus2":0,"use_bonus3":0}') || missionStats; } catch (e) {}
    try { rewardedLevels = JSON.parse(localStorage.getItem('monsterJumpRewardedLevels') || '{}') || {}; } catch (e) {}
    var sk = localStorage.getItem('monsterJumpSkins');
    if (sk) {
      var arr4 = JSON.parse(sk);
      if (Array.isArray(arr4)) {
        for (var i = 0; i < 6; i++) selectedSkins[i] = Math.max(0, Math.min(MAX_SKINS - 1, parseInt(arr4[i], 10) || 0));
      }
    }
    musicVol = parseFloat(localStorage.getItem('monsterJumpMusicVol') || '0.22');
    sfxVol = parseFloat(localStorage.getItem('monsterJumpSfxVol') || '0.7');
    if (localStorage.getItem('monsterJumpMusicOn') === '0') musicEnabled = false;
    if (localStorage.getItem('monsterJumpSfxOn') === '0') sfxEnabled = false;
    if (localStorage.getItem('monsterJumpVibroOn') === '0') vibrationEnabled = false;
    var savedCtrl = localStorage.getItem('monsterJumpControl');
    if (savedCtrl === 'swipe' || savedCtrl === 'gyro') controlType = savedCtrl;
    music.volume = musicVol;
  } catch (e) {}
}

function saveProgress() {
  try {
    localStorage.setItem('monsterJumpCoins', String(totalCoins));
    localStorage.setItem('monsterJumpCrystals', String(totalCrystals));
    localStorage.setItem('monsterJumpRolls', String(totalRolls));
    localStorage.setItem('monsterJumpUnlocks', JSON.stringify(unlockedChars));
    localStorage.setItem('monsterJumpCharLevels', JSON.stringify(charLevels));
    localStorage.setItem('monsterJumpBest', String(bestScore));
    localStorage.setItem('monsterJumpBonus1', String(invBonus1));
    localStorage.setItem('monsterJumpBonus2', String(invBonus2));
    localStorage.setItem('monsterJumpBonus3', String(invBonus3));
    localStorage.setItem('monsterJumpSpirits', JSON.stringify(unlockedSpirits));
    localStorage.setItem('monsterJumpSelectedSpirit', String(selectedSpirit));
    localStorage.setItem('monsterJumpSkins', JSON.stringify(selectedSkins));
  } catch (e) {}
}

function saveMetaProgress() {
  try {
    localStorage.setItem('monsterJumpMaxLevel', String(maxLevelUnlocked));
    localStorage.setItem('monsterJumpLevelsDone', JSON.stringify(levelsCompleted));
    localStorage.setItem('monsterJumpMissions', JSON.stringify(missionsDone));
    localStorage.setItem('monsterJumpMissionStats', JSON.stringify(missionStats));
    localStorage.setItem('monsterJumpMusicVol', String(musicVol));
    localStorage.setItem('monsterJumpSfxVol', String(sfxVol));
    localStorage.setItem('monsterJumpMusicOn', musicEnabled ? '1' : '0');
    localStorage.setItem('monsterJumpSfxOn', sfxEnabled ? '1' : '0');
    localStorage.setItem('monsterJumpVibroOn', vibrationEnabled ? '1' : '0');
    localStorage.setItem('monsterJumpControl', controlType);
  } catch (e) {}
}

function upgradeCharacter(i) {
  if (i < 0 || i >= 6) return false;
  if (!isCharUnlocked(i)) return false;
  var cur = charLevels[i] || 1;
  if (cur >= 99) return false;
  if (totalCrystals < CHAR_UPGRADE_COST) { coinShake = 18; return false; }
  totalCrystals -= CHAR_UPGRADE_COST;
  charLevels[i] = Math.min(99, cur + 1);
  saveProgress();
  playLevelUpSound();
  return true;
}

function resetCharacterLevel(i) {
  if (i < 0 || i >= 6) return false;
  var cur = charLevels[i] || 1;
  if (cur <= 1) return false;
  var refund = (cur - 1) * CHAR_UPGRADE_COST;
  totalCrystals += refund;
  charLevels[i] = 1;
  saveProgress();
  playCoinSound();
  coinShake = 15;
  return true;
}

function triggerNoMoneyShake(charIndex) {
  charShake[charIndex] = 24;
  coinShake = 24;
}
