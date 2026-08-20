var WIDTH = 400;
var HEIGHT = 700;
var GRAVITY = 0.26;
var JUMP_FORCE = -11.2;
var TEXT_COL = '#783915';
var MOVE_SPEED = 6.5;
var PLATFORM_WIDTH = 70;
var PLATFORM_HEIGHT = 18;
var PLAYER_WIDTH = 60;
var PLAYER_HEIGHT = 75;
var LEVEL_REWARD = 1000;
var LEVEL_CRYSTAL_REWARD = 5000;
var MISSION_ROLL_REWARD = 1000;
var SPIRIT_PRICE = 10000;
var BONUS1_PRICE = 500;
var BONUS2_PRICE = 500;
var BONUS3_PRICE = 250;
var ABILITY_COOLDOWN = 450;
var JUMP_BOOST_DURATION = 300;
var CHAR_UPGRADE_COST = 5000;
var BONUS_DURATION = 450;
var BONUS_SCALE = 1.7;
var BONUS_FLY_FORCE = -9.5;
var BONUS_SCALE_SPEED = 0.04;
var BONUS1_METERS = 500;
var BONUS1_WORLD = BONUS1_METERS * 10;
var SHIELD_SCALE_SPEED = 0.06;
var INTRO_DELAY = 50;
var MIN_LOAD_MS = 3000;
var TARGET_FPS = 90;
var FIXED_DT = 1000 / TARGET_FPS;
var SHAKE_DECAY = 0.88;
var SLOWMO_DURATION = 40;
var SLOWMO_FACTOR = 0.35;
var TOAST_DURATION = 120;
var MAGNET_RANGE = 220;
var MAGNET_SPEED = 12;
var AMBIENT_PARTICLE_CHANCE = 0.03;
var PARALLAX_BG_SPEED = 0.15;
var DEATH_SLOWMO_FRAMES = 50;
var LANDING_SQUASH = 0.75;
var LANDING_SQUASH_RECOVER = 0.06;
var BREAK_SHARD_COUNT = 8;
var SPRING_VISUAL_STRETCH = 1.4;
var ENEMY_NEAR_PLAYER_RANGE = 180;

var ASSETS = {
  titleName:       'assets/titlename.png',
  startBtn:        'assets/start.png',
  player:          'assets/player.png',
  player2:         'assets/player2.png',
  player3:         'assets/player3.png',
  player4:         'assets/player4.png',
  player5:         'assets/player5.png',
  player6:         'assets/player6.png',
  spirit:          'assets/spirit.png',
  spirit2:         'assets/spirit2.png',
  spirit3:         'assets/spirit3.png',
  spirit4:         'assets/spirit4.png',
  spirit5:         'assets/spirit5.png',
  spirit6:         'assets/spirit6.png',
  spiritIcon:      'assets/spiriticon.png',
  platform:        'assets/platform.png',
  platformBroken:  'assets/platform_broken.png',
  platformMoving:  'assets/platform_moving.png',
  spring:          'assets/spring.png',
  bonus:           'assets/bonus.png',
  background:      'assets/background.png',
  background2:     'assets/background2.png',
  background3:     'assets/background3.png',
  music:           'assets/music.mp3',
  lider:           'assets/Lider.png',
  gold:            'assets/gold.png',
  allgold:         'assets/allgold.png',
  crystal:         'assets/crystal.png',
  scroll:          'assets/Scroll.png',
  roll:            'assets/Roll.png',
  bonus2:          'assets/bonus2.png',
  bonus2_1:        'assets/bonus2_1.png',
  bonus3:          'assets/bonus3.png',
  pause:           'assets/pause.png',
  sound:           'assets/sound.png',
  level:           'assets/level.png',
  note:            'assets/note.png',
  setting:         'assets/setting.png',
  home:            'assets/Home.png',
  next:            'assets/next.png',
  level1_20:       'assets/1_20.png',
  level21_40:      'assets/21_40.png',
  level41_60:      'assets/41_60.png',
  level61_80:      'assets/61_80.png',
  level81_100:     'assets/81_100.png',
  complete:        'assets/complite.png',
  close:           'assets/close.png',
  frame:           'assets/frame.png',
  menuitem:        'assets/menuitem.png',
  wait:            'assets/wait.png',
  price:           'assets/price.png',
  backgroundmenu:  'assets/backgroundmenu.png',
  menuname:        'assets/menuname.png',
  keycap:          'assets/keycap.png'
};

var CHAR_INFO = [
  { name: 'Pip', price: 0, unlock: 'free', label: 'Запасная жизнь', desc: 'Запасная жизнь: один раз при падении спасает щитом и выбрасывает вверх.', folder: 'player' },
  { name: 'Janko', price: 15000, unlock: 'coins', label: '×2 монеты', desc: 'Жадный до золота: все собранные монеты считаются ×2.', folder: 'player2' },
  { name: 'Zora', price: 35000, unlock: 'coins', label: 'Магнит', desc: 'Магнит: монеты сами летят к персонажу.', folder: 'player3' },
  { name: 'Brutus', price: 70000, unlock: 'coins', label: 'Прочный', desc: 'Тяжёлый боец: разрушающиеся платформы выдерживают его прыжки.', folder: 'player4' },
  { name: 'Luma', price: 140000, unlock: 'coins', label: 'Стоп платформ', desc: 'Монеты ×2. Останавливает движущиеся платформы.', folder: 'player5' },
  { name: 'Hex', price: 280000, unlock: 'coins', label: 'Все силы', desc: 'Легенда арены: запасная жизнь, магнит и удвоение золота.', folder: 'player6' }
];
var MAX_SKINS = 10;

var SPIRIT_DESC = [
  "Второй шанс",
  "Удача и богатство",
  "Быстрый как ветер",
  "Защита",
  "Контроль хаоса",
  "Абсолютная мощь"
];

var MISSIONS = [
  {id:1,text:'Достигни 500 m за забег',type:'height',need:500,reward:100},
  {id:2,text:'Собери 20 монет за забег',type:'coins_run',need:20,reward:80},
  {id:3,text:'Сыграй 3 партии',type:'plays',need:3,reward:60},
  {id:4,text:'Достигни 1000 m',type:'height',need:1000,reward:150},
  {id:5,text:'Собери 50 монет за забег',type:'coins_run',need:50,reward:120},
  {id:6,text:'Используй бонус полёта 1 раз',type:'use_bonus1',need:1,reward:100},
  {id:7,text:'Используй защиту 1 раз',type:'use_bonus2',need:1,reward:100},
  {id:8,text:'Достигни 2000 m',type:'height',need:2000,reward:200},
  {id:9,text:'Собери 100 монет за всё время',type:'coins_total',need:100,reward:150},
  {id:10,text:'Пройди уровень 5',type:'level',need:5,reward:200},
  {id:11,text:'Достигни 3000 m',type:'height',need:3000,reward:250},
  {id:12,text:'Собери 80 монет за забег',type:'coins_run',need:80,reward:180},
  {id:13,text:'Сыграй 10 партий',type:'plays',need:10,reward:150},
  {id:14,text:'Используй ×2 прыжок',type:'use_bonus3',need:1,reward:120},
  {id:15,text:'Достигни 5000 m',type:'height',need:5000,reward:350},
  {id:16,text:'Собери 500 монет всего',type:'coins_total',need:500,reward:250},
  {id:17,text:'Пройди уровень 10',type:'level',need:10,reward:300},
  {id:18,text:'Достигни 7000 m',type:'height',need:7000,reward:400},
  {id:19,text:'Собери 120 монет за забег',type:'coins_run',need:120,reward:280},
  {id:20,text:'Сыграй 25 партий',type:'plays',need:25,reward:220},
  {id:21,text:'Достигни 10000 m',type:'height',need:10000,reward:500},
  {id:22,text:'Собери 1000 монет всего',type:'coins_total',need:1000,reward:400},
  {id:23,text:'Пройди уровень 20',type:'level',need:20,reward:450},
  {id:24,text:'Используй полёт 5 раз',type:'use_bonus1',need:5,reward:200},
  {id:25,text:'Используй защиту 5 раз',type:'use_bonus2',need:5,reward:200},
  {id:26,text:'Достигни 12000 m',type:'height',need:12000,reward:550},
  {id:27,text:'Собери 200 монет за забег',type:'coins_run',need:200,reward:400},
  {id:28,text:'Сыграй 50 партий',type:'plays',need:50,reward:350},
  {id:29,text:'Пройди уровень 30',type:'level',need:30,reward:600},
  {id:30,text:'Достигни 15000 m',type:'height',need:15000,reward:700},
  {id:31,text:'Собери 2500 монет всего',type:'coins_total',need:2500,reward:500},
  {id:32,text:'Используй ×2 прыжок 5 раз',type:'use_bonus3',need:5,reward:250},
  {id:33,text:'Пройди уровень 40',type:'level',need:40,reward:750},
  {id:34,text:'Достигни 18000 m',type:'height',need:18000,reward:800},
  {id:35,text:'Собери 300 монет за забег',type:'coins_run',need:300,reward:550},
  {id:36,text:'Сыграй 75 партий',type:'plays',need:75,reward:450},
  {id:37,text:'Пройди уровень 50',type:'level',need:50,reward:900},
  {id:38,text:'Достигни 20000 m',type:'height',need:20000,reward:1000},
  {id:39,text:'Собери 5000 монет всего',type:'coins_total',need:5000,reward:700},
  {id:40,text:'Используй полёт 15 раз',type:'use_bonus1',need:15,reward:400},
  {id:41,text:'Пройди уровень 60',type:'level',need:60,reward:1100},
  {id:42,text:'Достигни 22000 m',type:'height',need:22000,reward:1200},
  {id:43,text:'Собери 400 монет за забег',type:'coins_run',need:400,reward:700},
  {id:44,text:'Сыграй 100 партий',type:'plays',need:100,reward:600},
  {id:45,text:'Пройди уровень 75',type:'level',need:75,reward:1500},
  {id:46,text:'Достигни 25000 m',type:'height',need:25000,reward:1800},
  {id:47,text:'Собери 10000 монет всего',type:'coins_total',need:10000,reward:1200},
  {id:48,text:'Пройди уровень 90',type:'level',need:90,reward:2000},
  {id:49,text:'Пройди уровень 100',type:'level',need:100,reward:5000},
  {id:50,text:'Собери 500 монет за один забег',type:'coins_run',need:500,reward:2500}
];

var titleLayout = {
  charSize: 72, charY: 278, charGap: 28, rowGap: 158,
  startBtnW: 180, startBtnH: 70, startBtnY: 618,
  _buyBtns: [], _spiritBtn: null
};

var ENEMY_TYPES = [
  { width: 40, height: 40, speed: 1.2, color: '#e74c3c', eyeColor: '#fff', points: false },
  { width: 50, height: 35, speed: 1.8, color: '#8e44ad', eyeColor: '#f1c40f', points: true },
  { width: 35, height: 50, speed: 0.9, color: '#27ae60', eyeColor: '#e74c3c', points: false }
];
