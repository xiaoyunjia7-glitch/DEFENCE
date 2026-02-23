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

export const TRANSLATIONS = {
  zh: {
    title: "家齐新星防御",
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
  },
  en: {
    title: "Jiaqi Nova Defense",
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
  }
};
