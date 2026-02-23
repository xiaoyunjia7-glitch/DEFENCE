import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  CANVAS_WIDTH, 
  CANVAS_HEIGHT, 
  INITIAL_SILOS, 
  INITIAL_CITIES, 
  ROCKET_SPEED_BASE, 
  INTERCEPTOR_SPEED, 
  EXPLOSION_MAX_RADIUS, 
  EXPLOSION_GROWTH_SPEED,
  WIN_SCORE,
  COIN_DROP_CHANCE
} from '../constants';
import { GameStatus, Rocket, Interceptor, Silo, City } from '../types';

interface GameCanvasProps {
  status: GameStatus;
  isInfinite: boolean;
  upgradeCount: number;
  totalPurchases: number;
  isDamageBoosted: boolean;
  isDropRateBoosted: boolean;
  onScoreUpdate: (score: number) => void;
  onCoinCollect: (coins: number) => void;
  onGemCollect: (gems: number) => void;
  onGameEnd: (won: boolean) => void;
  language: 'zh' | 'en';
}

const GameCanvas: React.FC<GameCanvasProps> = ({ 
  status, 
  isInfinite, 
  upgradeCount,
  totalPurchases,
  isDamageBoosted,
  isDropRateBoosted,
  onScoreUpdate, 
  onCoinCollect,
  onGemCollect,
  onGameEnd, 
  language 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(null);
  
  // Game State Refs (for the loop)
  const rocketsRef = useRef<Rocket[]>([]);
  const interceptorsRef = useRef<Interceptor[]>([]);
  const silosRef = useRef<Silo[]>(JSON.parse(JSON.stringify(INITIAL_SILOS)));
  const citiesRef = useRef<City[]>(JSON.parse(JSON.stringify(INITIAL_CITIES)));
  const scoreRef = useRef(0);
  const coinsRef = useRef(0);
  const gemsRef = useRef(0);
  const roundRef = useRef(1);
  const lastTimeRef = useRef(0);
  const spawnTimerRef = useRef(0);
  const infiniteLevelRef = useRef(0);
  const lastFireTimeRef = useRef(0);
  const defeatedCountRef = useRef(0);
  const lastBossSpawnScoreRef = useRef(0);
  const starsRef = useRef<{x: number, y: number, size: number, opacity: number}[]>([]);

  // Initialize stars once
  useEffect(() => {
    const stars = [];
    for (let i = 0; i < 100; i++) {
      stars.push({
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * CANVAS_HEIGHT,
        size: Math.random() * 2,
        opacity: Math.random()
      });
    }
    starsRef.current = stars;
  }, []);

  const resetGame = useCallback(() => {
    rocketsRef.current = [];
    interceptorsRef.current = [];
    silosRef.current = JSON.parse(JSON.stringify(INITIAL_SILOS));
    citiesRef.current = JSON.parse(JSON.stringify(INITIAL_CITIES));
    scoreRef.current = 0;
    coinsRef.current = 0;
    gemsRef.current = 0;
    defeatedCountRef.current = 0;
    lastBossSpawnScoreRef.current = 0;
    roundRef.current = 1;
    infiniteLevelRef.current = 0;
    lastFireTimeRef.current = 0;
    onScoreUpdate(0);
    onCoinCollect(0);
    onGemCollect(0);
  }, [onScoreUpdate, onCoinCollect, onGemCollect]);

  useEffect(() => {
    if (status === GameStatus.START) {
      resetGame();
    }
  }, [status, resetGame]);

  const handleCanvasClick = (e: React.MouseEvent | React.TouchEvent) => {
    if (status !== GameStatus.PLAYING) return;

    // Rule 5: Attack frequency buff
    // Base cooldown 200ms, reduced by 1% per upgrade
    const baseCooldown = 200;
    const cooldown = baseCooldown * Math.pow(0.99, upgradeCount);
    const now = performance.now();
    if (now - lastFireTimeRef.current < cooldown) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    // Find nearest silo (Rule 1: Infinite ammo)
    let bestSilo: Silo | null = null;
    let minDist = Infinity;

    silosRef.current.forEach(silo => {
      if (!silo.isDestroyed) {
        const dist = Math.abs(silo.x - x);
        if (dist < minDist) {
          minDist = dist;
          bestSilo = silo;
        }
      }
    });

    if (bestSilo) {
      lastFireTimeRef.current = now;
      // Rule 5: Damage (explosion radius) buff
      const baseExplosionRadius = EXPLOSION_MAX_RADIUS;
      let explosionRadius = baseExplosionRadius * Math.pow(1.02, upgradeCount);
      
      // Gem Tool 1: Temporary Damage Boost (+50%)
      if (isDamageBoosted) {
        explosionRadius *= 1.5;
      }

      interceptorsRef.current.push({
        id: Math.random().toString(36).substr(2, 9),
        x: (bestSilo as Silo).x,
        y: (bestSilo as Silo).y,
        startX: (bestSilo as Silo).x,
        startY: (bestSilo as Silo).y,
        targetX: x,
        targetY: y,
        speed: INTERCEPTOR_SPEED,
        progress: 0,
        isExploding: false,
        explosionRadius: 0,
        maxExplosionRadius: explosionRadius,
        explosionSpeed: EXPLOSION_GROWTH_SPEED
      });
    }
  };

  const update = (time: number) => {
    if (status !== GameStatus.PLAYING && status !== GameStatus.SHOP) {
      requestRef.current = requestAnimationFrame(update);
      return;
    }

    // If in shop, we still want to draw but maybe pause simulation?
    // The user didn't specify, but usually shops pause the action.
    if (status === GameStatus.SHOP) {
      draw();
      requestRef.current = requestAnimationFrame(update);
      return;
    }

    const deltaTime = time - lastTimeRef.current;
    lastTimeRef.current = time;

    // Spawn Rockets
    spawnTimerRef.current += deltaTime;
    
    // Rule 3: Infinite mode buffs
    let speedMultiplier = 1;
    let frequencyMultiplier = 1;
    if (isInfinite) {
      const level = Math.floor((scoreRef.current - 1000) / 1000) + 1;
      if (level > infiniteLevelRef.current) {
        infiniteLevelRef.current = level;
      }
      // Stack 5% for each level
      speedMultiplier = Math.pow(1.05, infiniteLevelRef.current);
      frequencyMultiplier = Math.pow(1.05, infiniteLevelRef.current);
    }

    // Rule: Every purchase increases enemy speed by 3.5%
    const purchaseSpeedMultiplier = Math.pow(1.035, totalPurchases);
    speedMultiplier *= purchaseSpeedMultiplier;

    const baseSpawnRate = Math.max(500, 2000 - (roundRef.current * 100));
    const spawnRate = baseSpawnRate / frequencyMultiplier;

    if (spawnTimerRef.current > spawnRate) {
      spawnTimerRef.current = 0;
      const targets = [...citiesRef.current.filter(c => !c.isDestroyed), ...silosRef.current.filter(s => !s.isDestroyed)];
      if (targets.length > 0) {
        const target = targets[Math.floor(Math.random() * targets.length)];
        
        // Infinite mode specific enemy blue missile generation rule
        // Every 1000 points in infinite mode
        let isBoss = false;
        if (isInfinite && scoreRef.current >= 1000) {
          const currentInfinitePoints = scoreRef.current - 1000;
          const nextBossMilestone = (Math.floor(lastBossSpawnScoreRef.current / 1000) + 1) * 1000;
          if (currentInfinitePoints >= nextBossMilestone) {
            isBoss = true;
            lastBossSpawnScoreRef.current = currentInfinitePoints;
          }
        }

        rocketsRef.current.push({
          id: Math.random().toString(36).substr(2, 9),
          x: Math.random() * CANVAS_WIDTH,
          y: 0,
          targetX: target.x,
          targetY: target.y,
          speed: (ROCKET_SPEED_BASE + (roundRef.current * 0.0001)) * speedMultiplier * (isBoss ? 0.5 : 1),
          progress: 0,
          isBoss: isBoss
        });
      }
    }

    // Update Rockets
    rocketsRef.current.forEach((rocket, index) => {
      rocket.progress += rocket.speed;
      
      if (rocket.isBoss) {
        // Blue missiles fly in a straight line, not a parabola (which the current logic already does, but let's be explicit)
        // The current logic: rocket.x = rocket.x + (rocket.targetX - rocket.x) * rocket.speed / (1 - rocket.progress + rocket.speed)
        // This is actually a linear interpolation over progress, so it IS a straight line.
        rocket.x = rocket.x + (rocket.targetX - rocket.x) * rocket.speed / (1 - rocket.progress + rocket.speed);
        rocket.y = rocket.y + (rocket.targetY - rocket.y) * rocket.speed / (1 - rocket.progress + rocket.speed);
      } else {
        rocket.x = rocket.x + (rocket.targetX - rocket.x) * rocket.speed / (1 - rocket.progress + rocket.speed);
        rocket.y = rocket.y + (rocket.targetY - rocket.y) * rocket.speed / (1 - rocket.progress + rocket.speed);
      }

      if (rocket.progress >= 1) {
        // Hit target
        const hitCity = citiesRef.current.find(c => Math.abs(c.x - rocket.targetX) < 5 && Math.abs(c.y - rocket.targetY) < 5);
        if (hitCity) hitCity.isDestroyed = true;
        
        const hitSilo = silosRef.current.find(s => Math.abs(s.x - rocket.targetX) < 5 && Math.abs(s.y - rocket.targetY) < 5);
        if (hitSilo) hitSilo.isDestroyed = true;

        rocketsRef.current.splice(index, 1);
      }
    });

    // Update Interceptors
    interceptorsRef.current.forEach((inter, index) => {
      if (!inter.isExploding) {
        inter.progress += inter.speed;
        inter.x = inter.startX + (inter.targetX - inter.startX) * inter.progress;
        inter.y = inter.startY + (inter.targetY - inter.startY) * inter.progress;

        if (inter.progress >= 1) {
          inter.isExploding = true;
        }
      } else {
        inter.explosionRadius += inter.explosionSpeed;
        if (inter.explosionRadius >= inter.maxExplosionRadius) {
          interceptorsRef.current.splice(index, 1);
        }

        // Check collision with rockets
        rocketsRef.current.forEach((rocket, rIndex) => {
          const dist = Math.sqrt(Math.pow(rocket.x - inter.x, 2) + Math.pow(rocket.y - inter.y, 2));
          if (dist < inter.explosionRadius) {
            rocketsRef.current.splice(rIndex, 1);
            scoreRef.current += 20;
            onScoreUpdate(scoreRef.current);

            // Monster coin payout rule: Every 10 monsters defeated
            defeatedCountRef.current += 1;
            if (defeatedCountRef.current >= 10) {
              defeatedCountRef.current = 0;
              coinsRef.current += 1;
              onCoinCollect(coinsRef.current);
            }

            // Rule 3: Coin Drop (5% chance) - Keep existing rule as well? 
            // The user said "When a player accumulates 10... it will trigger a coin drop". 
            // Usually this means in addition to or replacing. I'll keep both for more coins.
            let dropChance = COIN_DROP_CHANCE;
            if (isDropRateBoosted) {
              dropChance += 0.10; // +10% absolute increase
            }

            if (Math.random() < dropChance) {
              coinsRef.current += 1;
              onCoinCollect(coinsRef.current);
            }

            // Gem Acquisition: Defeating a blue boss drops a gem
            if (rocket.isBoss) {
              gemsRef.current += 1;
              onGemCollect(gemsRef.current);
            }
          }
        });
      }
    });

    // Check Win/Loss
    if (!isInfinite && scoreRef.current >= WIN_SCORE) {
      onGameEnd(true);
    } else if (isInfinite && scoreRef.current >= 20000) {
      onGameEnd(true);
    }

    const activeSilos = silosRef.current.filter(s => !s.isDestroyed);
    if (activeSilos.length === 0) {
      onGameEnd(false);
    }

    // Round progression
    if (rocketsRef.current.length === 0 && spawnTimerRef.current > 1000) {
       roundRef.current += 1;
    }

    draw();
    requestRef.current = requestAnimationFrame(update);
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw Starry Sky
    starsRef.current.forEach(star => {
      ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
      
      // Twinkle effect
      if (Math.random() > 0.98) star.opacity = Math.random();
    });

    // Draw Ground
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(0, CANVAS_HEIGHT - 30, CANVAS_WIDTH, 30);

    // Draw Cities
    citiesRef.current.forEach(city => {
      if (!city.isDestroyed) {
        ctx.fillStyle = '#4ade80';
        ctx.fillRect(city.x - 15, city.y - 10, 30, 10);
        ctx.fillRect(city.x - 10, city.y - 20, 20, 10);
      } else {
        ctx.fillStyle = '#451a03';
        ctx.fillRect(city.x - 15, city.y - 5, 30, 5);
      }
    });

    // Draw Silos (Chainmail exterior)
    silosRef.current.forEach(silo => {
      if (!silo.isDestroyed) {
        ctx.save();
        ctx.translate(silo.x, silo.y);
        
        // Base Silo Shape
        ctx.fillStyle = '#4b5563'; // Metallic gray
        ctx.beginPath();
        ctx.moveTo(-20, 0);
        ctx.lineTo(20, 0);
        ctx.lineTo(15, -25);
        ctx.lineTo(-15, -25);
        ctx.closePath();
        ctx.fill();

        // Chainmail texture (cross-hatching)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = -15; i <= 15; i += 5) {
          ctx.moveTo(i, 0);
          ctx.lineTo(i, -25);
        }
        for (let j = 0; j >= -25; j -= 5) {
          ctx.moveTo(-15, j);
          ctx.lineTo(15, j);
        }
        ctx.stroke();

        // Cannon Top
        ctx.fillStyle = '#1f2937';
        ctx.fillRect(-5, -35, 10, 15);
        
        ctx.restore();
        
        // Rule 1: Ammo text (Infinite)
        ctx.fillStyle = '#fff';
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('∞', silo.x, silo.y + 15);
      } else {
        ctx.fillStyle = '#1e1e1e';
        ctx.beginPath();
        ctx.arc(silo.x, silo.y, 10, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Draw Rockets (Missile appearance)
    rocketsRef.current.forEach(rocket => {
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(rocket.x, rocket.y);
      const startX = rocket.x - (rocket.targetX - rocket.x) * rocket.progress / (1 - rocket.progress);
      ctx.lineTo(startX, 0);
      ctx.stroke();

      // Draw Missile Body
      ctx.save();
      ctx.translate(rocket.x, rocket.y);
      const angle = Math.atan2(rocket.targetY - rocket.y, rocket.targetX - rocket.x);
      ctx.rotate(angle + Math.PI / 2);
      
      // Body
      ctx.fillStyle = rocket.isBoss ? '#3b82f6' : '#94a3b8';
      const sizeScale = rocket.isBoss ? 3 : 1;
      ctx.fillRect(-2 * sizeScale, -6 * sizeScale, 4 * sizeScale, 12 * sizeScale);
      // Head
      ctx.fillStyle = rocket.isBoss ? '#1d4ed8' : '#ef4444';
      ctx.beginPath();
      ctx.moveTo(-2 * sizeScale, -6 * sizeScale);
      ctx.lineTo(2 * sizeScale, -6 * sizeScale);
      ctx.lineTo(0, -10 * sizeScale);
      ctx.closePath();
      ctx.fill();
      // Fins
      ctx.fillStyle = rocket.isBoss ? '#1d4ed8' : '#ef4444';
      ctx.fillRect(-4 * sizeScale, 2 * sizeScale, 2 * sizeScale, 4 * sizeScale);
      ctx.fillRect(2 * sizeScale, 2 * sizeScale, 2 * sizeScale, 4 * sizeScale);
      
      ctx.restore();
    });

    // Draw Interceptors (Bomb models)
    interceptorsRef.current.forEach(inter => {
      if (!inter.isExploding) {
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(inter.startX, inter.startY);
        ctx.lineTo(inter.x, inter.y);
        ctx.stroke();

        // Draw Bomb
        ctx.save();
        ctx.translate(inter.x, inter.y);
        
        // Bomb Body
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Fuse
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, -5);
        ctx.quadraticCurveTo(3, -8, 5, -5);
        ctx.stroke();
        
        // Spark
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(5, -5, 1.5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();

        // Target X
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.moveTo(inter.targetX - 5, inter.targetY - 5);
        ctx.lineTo(inter.targetX + 5, inter.targetY + 5);
        ctx.moveTo(inter.targetX + 5, inter.targetY - 5);
        ctx.lineTo(inter.targetX - 5, inter.targetY + 5);
        ctx.stroke();
      } else {
        const alpha = 1 - (inter.explosionRadius / inter.maxExplosionRadius);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(inter.x, inter.y, inter.explosionRadius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = `rgba(59, 130, 246, ${alpha})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [status]);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="max-w-full max-h-full aspect-[4/3] cursor-crosshair touch-none border border-white/10 shadow-2xl"
        onClick={handleCanvasClick}
        onTouchStart={handleCanvasClick}
      />
    </div>
  );
};

export default GameCanvas;
