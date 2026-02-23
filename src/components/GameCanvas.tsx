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
  WIN_SCORE
} from '../constants';
import { GameStatus, Rocket, Interceptor, Silo, City } from '../types';

interface GameCanvasProps {
  status: GameStatus;
  onScoreUpdate: (score: number) => void;
  onGameEnd: (won: boolean) => void;
  language: 'zh' | 'en';
}

const GameCanvas: React.FC<GameCanvasProps> = ({ status, onScoreUpdate, onGameEnd, language }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(null);
  
  // Game State Refs (for the loop)
  const rocketsRef = useRef<Rocket[]>([]);
  const interceptorsRef = useRef<Interceptor[]>([]);
  const silosRef = useRef<Silo[]>(JSON.parse(JSON.stringify(INITIAL_SILOS)));
  const citiesRef = useRef<City[]>(JSON.parse(JSON.stringify(INITIAL_CITIES)));
  const scoreRef = useRef(0);
  const roundRef = useRef(1);
  const lastTimeRef = useRef(0);
  const spawnTimerRef = useRef(0);

  const resetGame = useCallback(() => {
    rocketsRef.current = [];
    interceptorsRef.current = [];
    silosRef.current = JSON.parse(JSON.stringify(INITIAL_SILOS));
    citiesRef.current = JSON.parse(JSON.stringify(INITIAL_CITIES));
    scoreRef.current = 0;
    roundRef.current = 1;
    onScoreUpdate(0);
  }, [onScoreUpdate]);

  useEffect(() => {
    if (status === GameStatus.START) {
      resetGame();
    }
  }, [status, resetGame]);

  const handleCanvasClick = (e: React.MouseEvent | React.TouchEvent) => {
    if (status !== GameStatus.PLAYING) return;

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

    // Find nearest silo with ammo
    let bestSilo: Silo | null = null;
    let minDist = Infinity;

    silosRef.current.forEach(silo => {
      if (!silo.isDestroyed && silo.ammo > 0) {
        const dist = Math.abs(silo.x - x);
        if (dist < minDist) {
          minDist = dist;
          bestSilo = silo;
        }
      }
    });

    if (bestSilo) {
      (bestSilo as Silo).ammo -= 1;
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
        maxExplosionRadius: EXPLOSION_MAX_RADIUS,
        explosionSpeed: EXPLOSION_GROWTH_SPEED
      });
    }
  };

  const update = (time: number) => {
    if (status !== GameStatus.PLAYING) {
      requestRef.current = requestAnimationFrame(update);
      return;
    }

    const deltaTime = time - lastTimeRef.current;
    lastTimeRef.current = time;

    // Spawn Rockets
    spawnTimerRef.current += deltaTime;
    const spawnRate = Math.max(500, 2000 - (roundRef.current * 100));
    if (spawnTimerRef.current > spawnRate) {
      spawnTimerRef.current = 0;
      const targets = [...citiesRef.current.filter(c => !c.isDestroyed), ...silosRef.current.filter(s => !s.isDestroyed)];
      if (targets.length > 0) {
        const target = targets[Math.floor(Math.random() * targets.length)];
        rocketsRef.current.push({
          id: Math.random().toString(36).substr(2, 9),
          x: Math.random() * CANVAS_WIDTH,
          y: 0,
          targetX: target.x,
          targetY: target.y,
          speed: ROCKET_SPEED_BASE + (roundRef.current * 0.0001),
          progress: 0
        });
      }
    }

    // Update Rockets
    rocketsRef.current.forEach((rocket, index) => {
      rocket.progress += rocket.speed;
      rocket.x = rocket.x + (rocket.targetX - rocket.x) * rocket.speed / (1 - rocket.progress + rocket.speed);
      rocket.y = rocket.y + (rocket.targetY - rocket.y) * rocket.speed / (1 - rocket.progress + rocket.speed);

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
          }
        });
      }
    });

    // Check Win/Loss
    if (scoreRef.current >= WIN_SCORE) {
      onGameEnd(true);
    }

    const activeSilos = silosRef.current.filter(s => !s.isDestroyed);
    if (activeSilos.length === 0) {
      onGameEnd(false);
    }

    // Round progression
    if (rocketsRef.current.length === 0 && spawnTimerRef.current > 1000) {
       // Simple round logic: refill ammo if all rockets gone
       silosRef.current.forEach(s => {
         if (!s.isDestroyed) s.ammo = s.maxAmmo;
       });
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
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

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

    // Draw Silos
    silosRef.current.forEach(silo => {
      if (!silo.isDestroyed) {
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.moveTo(silo.x - 20, silo.y);
        ctx.lineTo(silo.x + 20, silo.y);
        ctx.lineTo(silo.x, silo.y - 30);
        ctx.closePath();
        ctx.fill();
        
        // Ammo text
        ctx.fillStyle = '#fff';
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(silo.ammo.toString(), silo.x, silo.y + 15);
      } else {
        ctx.fillStyle = '#1e1e1e';
        ctx.beginPath();
        ctx.arc(silo.x, silo.y, 10, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Draw Rockets
    rocketsRef.current.forEach(rocket => {
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(rocket.x, rocket.y);
      // Find start point (approx)
      const startX = rocket.x - (rocket.targetX - rocket.x) * rocket.progress / (1 - rocket.progress);
      ctx.lineTo(startX, 0);
      ctx.stroke();

      ctx.fillStyle = '#ef4444';
      ctx.fillRect(rocket.x - 3, rocket.y - 3, 6, 6);
    });

    // Draw Interceptors
    interceptorsRef.current.forEach(inter => {
      if (!inter.isExploding) {
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(inter.startX, inter.startY);
        ctx.lineTo(inter.x, inter.y);
        ctx.stroke();

        // Target X
        ctx.strokeStyle = '#fff';
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
