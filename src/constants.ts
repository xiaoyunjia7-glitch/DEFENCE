export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

export const INITIAL_SILOS = [
  { id: 0, x: 80, y: 550, ammo: 20, maxAmmo: 20, isDestroyed: false },
  { id: 1, x: 400, y: 550, ammo: 40, maxAmmo: 40, isDestroyed: false },
  { id: 2, x: 720, y: 550, ammo: 20, maxAmmo: 20, isDestroyed: false },
];

export const INITIAL_CITIES = [
  { id: 0, x: 180, y: 570, isDestroyed: false },
  { id: 1, x: 260, y: 570, isDestroyed: false },
  { id: 2, x: 340, y: 570, isDestroyed: false },
  { id: 3, x: 460, y: 570, isDestroyed: false },
  { id: 4, x: 540, y: 570, isDestroyed: false },
  { id: 5, x: 620, y: 570, isDestroyed: false },
];

export const ROCKET_SPEED_BASE = 0.0005;
export const INTERCEPTOR_SPEED = 0.02;
export const EXPLOSION_MAX_RADIUS = 40;
export const EXPLOSION_GROWTH_SPEED = 1.5;
export const WIN_SCORE = 1000;
export const INFINITE_WIN_SCORE = 20000;
export const COIN_DROP_CHANCE = 0.05;
export const UPGRADE_COST = 20;
export const GEM_UPGRADE_COST = 2;

export const TRANSLATIONS = {
  zh: {
    title: "Stephen新星防御",
    start: "开始游戏",
    restart: "再玩一次",
    win: "任务成功！",
    lose: "城市沦陷...",
    score: "得分",
    ammo: "弹药",
    round: "波次",
    instructions: "点击屏幕发射拦截导弹。保护你的城市和炮台！",
    winMsg: "你成功保卫了家园！",
    loseMsg: "所有炮台已被摧毁。",
    infiniteMode: "进入无尽模式",
    infiniteWin: "你赢了！你可以再玩一次。",
    infiniteTarget: "目标: 20000",
    shop: "商店",
    coins: "金币",
    gems: "宝石",
    buyUpgrade: "购买强化 (20金币)",
    upgradeEffect: "伤害 +2%, 频率 +1%",
    insufficientFunds: "货币不足！",
    owned: "已强化次数",
    tabGold: "金币区",
    tabGem: "宝石区",
    tempDamage: "临时伤害",
    tempDamageDesc: "伤害提升50% (30秒)",
    tempCoin: "金币掉率",
    tempCoinDesc: "掉率提升10% (30秒)",
    active: "生效中",
    monsterSpeed: "怪物速度提升",
  },
  en: {
    title: "Stephen Nova Defense",
    start: "Start Game",
    restart: "Play Again",
    win: "Mission Success!",
    lose: "Cities Fallen...",
    score: "Score",
    ammo: "Ammo",
    round: "Wave",
    instructions: "Click to fire interceptors. Protect your cities and silos!",
    winMsg: "You successfully defended the homeland!",
    loseMsg: "All silos have been destroyed.",
    infiniteMode: "Enter Infinite Mode",
    infiniteWin: "You won! You can play again.",
    infiniteTarget: "Target: 20000",
    shop: "Shop",
    coins: "Coins",
    gems: "Gems",
    buyUpgrade: "Buy Upgrade (20 Coins)",
    upgradeEffect: "Damage +2%, Freq +1%",
    insufficientFunds: "Not enough currency!",
    owned: "Upgrades",
    tabGold: "Gold Area",
    tabGem: "Gem Area",
    tempDamage: "Temp Damage",
    tempDamageDesc: "Damage +50% (30s)",
    tempCoin: "Coin Drop Rate",
    tempCoinDesc: "Drop Rate +10% (30s)",
    active: "Active",
    monsterSpeed: "Monster Speed Boost",
  }
};
