var audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function makeSpace(ctx, input, outGain, delayTime, feedback, wet) {
  var delay = ctx.createDelay(0.5);
  var fb = ctx.createGain();
  var wetG = ctx.createGain();
  delay.delayTime.value = delayTime;
  fb.gain.value = feedback;
  wetG.gain.value = wet;
  input.connect(delay);
  delay.connect(fb);
  fb.connect(delay);
  delay.connect(wetG);
  wetG.connect(outGain);
}

function canPlaySfx() {
  return sfxEnabled && sfxVol > 0.001;
}

function playTone(ctx, now, opts) {
  if (!canPlaySfx()) return;
  var osc = ctx.createOscillator();
  var gain = ctx.createGain();
  var filter = ctx.createBiquadFilter();
  var v = (opts.vol || 0.1) * sfxVol;
  osc.type = opts.type || 'sine';
  filter.type = 'lowpass';
  filter.frequency.value = opts.filterFreq || 4000;
  filter.Q.value = opts.Q || 1;
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  makeSpace(ctx, filter, ctx.destination, 0.045, 0.22, v * 0.35);
  var t0 = now + (opts.delay || 0);
  osc.frequency.setValueAtTime(opts.freq, t0);
  if (opts.freqEnd) osc.frequency.exponentialRampToValueAtTime(Math.max(40, opts.freqEnd), t0 + opts.dur);
  gain.gain.setValueAtTime(0.001, t0);
  gain.gain.exponentialRampToValueAtTime(v, t0 + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + opts.dur);
  osc.start(t0);
  osc.stop(t0 + opts.dur + 0.02);
}

function playJumpSound() {
  if (!canPlaySfx()) return;
  try {
    var ctx = getAudioCtx();
    var now = ctx.currentTime;
    var osc = ctx.createOscillator();
    var g = ctx.createGain();
    var f = ctx.createBiquadFilter();
    osc.type = 'sine';
    f.type = 'lowpass';
    f.frequency.value = 1000;
    osc.connect(f);
    f.connect(g);
    g.connect(ctx.destination);
    osc.frequency.setValueAtTime(340, now);
    osc.frequency.exponentialRampToValueAtTime(210, now + 0.07);
    g.gain.setValueAtTime(0.001, now);
    g.gain.exponentialRampToValueAtTime(0.11 * sfxVol, now + 0.008);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    osc.start(now);
    osc.stop(now + 0.1);
  } catch (e) {}
}

function playDeathSound() {
  if (!canPlaySfx()) return;
  try {
    var ctx = getAudioCtx();
    var now = ctx.currentTime;
    var master = ctx.createGain();
    master.gain.value = 0.7;
    master.connect(ctx.destination);
    [[400,120,0,0.12],[300,90,0.12,0.1],[220,60,0.28,0.08]].forEach(function(d) {
      var osc = ctx.createOscillator();
      var g = ctx.createGain();
      var f = ctx.createBiquadFilter();
      osc.type = 'sine';
      f.type = 'lowpass';
      f.frequency.value = 1800;
      osc.connect(f);
      f.connect(g);
      g.connect(master);
      var t0 = now + d[2];
      osc.frequency.setValueAtTime(d[0], t0);
      osc.frequency.exponentialRampToValueAtTime(d[1], t0 + 0.35);
      g.gain.setValueAtTime(0.001, t0);
      g.gain.exponentialRampToValueAtTime(d[3], t0 + 0.04);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.4);
      osc.start(t0);
      osc.stop(t0 + 0.42);
    });
    var osc2 = ctx.createOscillator();
    var g2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.connect(g2);
    g2.connect(master);
    osc2.frequency.setValueAtTime(80, now);
    osc2.frequency.exponentialRampToValueAtTime(40, now + 0.5);
    g2.gain.setValueAtTime(0.001, now);
    g2.gain.exponentialRampToValueAtTime(0.14, now + 0.02);
    g2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.start(now);
    osc2.stop(now + 0.58);
  } catch (e) {}
}

function playSpringSound() {
  if (!canPlaySfx()) return;
  try {
    var ctx = getAudioCtx();
    var now = ctx.currentTime;
    playTone(ctx, now, {type:'triangle',freq:180,freqEnd:720,dur:0.2,vol:0.2,filterFreq:2500});
    playTone(ctx, now, {type:'sine',freq:320,freqEnd:900,dur:0.25,vol:0.14,delay:0.04,filterFreq:3000});
    playTone(ctx, now, {type:'sine',freq:520,freqEnd:260,dur:0.28,vol:0.1,delay:0.08,filterFreq:1800});
  } catch (e) {}
}

function playBonusSound() {
  if (!canPlaySfx()) return;
  try {
    var ctx = getAudioCtx();
    var now = ctx.currentTime;
    [0,0.07,0.14,0.22].forEach(function(d, i) {
      var f = 360 + i * 160;
      playTone(ctx, now, {type:'sine',freq:f,freqEnd:f*1.45,dur:0.2,vol:0.16-i*0.02,delay:d,filterFreq:3500});
      playTone(ctx, now, {type:'triangle',freq:f*0.5,freqEnd:f*0.7,dur:0.22,vol:0.08,delay:d,filterFreq:1500});
    });
  } catch (e) {}
}

function playLevelWinSound() {
  if (!canPlaySfx()) return;
  try {
    var ctx = getAudioCtx();
    var now = ctx.currentTime;
    var notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach(function(f, i) {
      playTone(ctx, now, {type:'sine',freq:f,freqEnd:f*1.02,dur:0.28,vol:0.14,delay:i*0.09,filterFreq:4000});
      playTone(ctx, now, {type:'triangle',freq:f*0.5,freqEnd:f*0.5,dur:0.3,vol:0.06,delay:i*0.09,filterFreq:2000});
    });
    playTone(ctx, now, {type:'sine',freq:1318.5,freqEnd:1568,dur:0.45,vol:0.1,delay:0.4,filterFreq:5000});
  } catch (e) {}
}

function playLevelUpSound() {
  if (!canPlaySfx()) return;
  try {
    var ctx = getAudioCtx();
    var now = ctx.currentTime;
    [440,554,659,880].forEach(function(f, i) {
      playTone(ctx, now, {type:'square',freq:f,freqEnd:f*1.08,dur:0.12,vol:0.07-i*0.008,delay:i*0.055,filterFreq:2800});
    });
    playTone(ctx, now, {type:'sine',freq:1175,freqEnd:1319,dur:0.35,vol:0.12,delay:0.22,filterFreq:4500});
  } catch (e) {}
}

function playCoinSound() {
  if (!canPlaySfx()) return;
  try {
    var ctx = getAudioCtx();
    var now = ctx.currentTime;
    var master = ctx.createGain();
    master.gain.value = 0.5 * sfxVol;
    master.connect(ctx.destination);
    function bell(freq, t0, vol, dur) {
      var osc = ctx.createOscillator();
      var g = ctx.createGain();
      var f = ctx.createBiquadFilter();
      osc.type = 'sine';
      f.type = 'lowpass';
      f.frequency.value = 3200;
      osc.connect(f);
      f.connect(g);
      g.connect(master);
      osc.frequency.setValueAtTime(freq, t0);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.96, t0 + dur);
      g.gain.setValueAtTime(0.001, t0);
      g.gain.exponentialRampToValueAtTime(vol, t0 + 0.015);
      g.gain.exponentialRampToValueAtTime(vol * 0.35, t0 + dur * 0.35);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
      osc.start(t0);
      osc.stop(t0 + dur + 0.02);
    }
    bell(1318.5, now, 0.075, 0.22);
    bell(1568, now + 0.07, 0.065, 0.28);
    bell(2093, now + 0.08, 0.022, 0.16);
  } catch (e) {}
}

var musicEnabled = true;
var sfxEnabled = true;
var vibrationEnabled = true;
var musicStarted = false;
var musicVol = 0.22;
var sfxVol = 0.7;

var music = new Audio();
music.loop = true;
music.preload = 'auto';
music.volume = musicVol;

(function initMusicSrc() {
  var c = ['assets/music.mp3', 'assets/Music.mp3', 'assets/MUSIC.mp3', 'assets/music.ogg', 'assets/music.wav'];
  var i = 0;
  function t() {
    if (i >= c.length) { console.warn('Music not found'); return; }
    music.src = c[i++];
  }
  music.addEventListener('error', t);
  t();
})();

function startMusic() {
  if (!musicEnabled) return;
  if (gameState === 'title' || gameState === 'loading') return;
  var p = music.play();
  if (p && p.then) p.then(function() { musicStarted = true; }).catch(function() {});
}

function stopMusic() {
  music.pause();
  music.currentTime = 0;
  musicStarted = false;
}

function toggleMusic() {
  musicEnabled = !musicEnabled;
  if (musicEnabled) startMusic();
  else music.pause();
}

function vibrate(ms) {
  if (!vibrationEnabled) return;
  try {
    if (navigator.vibrate) { navigator.vibrate(ms || 15); return; }
    if (window.AudioContext || window.webkitAudioContext) {
      var ac = new (window.AudioContext || window.webkitAudioContext)();
      var osc = ac.createOscillator();
      var gain = ac.createGain();
      osc.connect(gain); gain.connect(ac.destination);
      osc.frequency.value = 1;
      osc.type = 'sine';
      gain.gain.value = 0;
      osc.start(); osc.stop(ac.currentTime + (ms || 15) / 1000);
      setTimeout(function() { try { ac.close(); } catch(e) {} }, 100);
    }
  } catch (e) {}
}
