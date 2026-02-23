export enum GameStatus {
  START = 'START',
  PLAYING = 'PLAYING',
  WON = 'WON',
  LOST = 'LOST',
  ROUND_END = 'ROUND_END',
  INFINITE_CHOICE = 'INFINITE_CHOICE',
  INFINITE_WON = 'INFINITE_WON',
  SHOP = 'SHOP'
}

export interface Point {
  x: number;
  y: number;
}

export interface Entity extends Point {
  id: string;
}

export interface Rocket extends Entity {
  targetX: number;
  targetY: number;
  speed: number;
  progress: number; // 0 to 1
  isBoss?: boolean;
}

export interface Interceptor extends Entity {
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  speed: number;
  progress: number;
  isExploding: boolean;
  explosionRadius: number;
  maxExplosionRadius: number;
  explosionSpeed: number;
}

export interface Silo extends Point {
  id: number;
  ammo: number;
  maxAmmo: number;
  isDestroyed: boolean;
}

export interface City extends Point {
  id: number;
  isDestroyed: boolean;
}

export interface GameState {
  status: GameStatus;
  score: number;
  round: number;
  silos: Silo[];
  cities: City[];
  rockets: Rocket[];
  interceptors: Interceptor[];
  language: 'zh' | 'en';
}
