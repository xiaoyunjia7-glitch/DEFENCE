import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Target, Trophy, AlertTriangle, Languages, Info } from 'lucide-react';
import GameCanvas from './components/GameCanvas';
import { GameStatus } from './types';
import { TRANSLATIONS, WIN_SCORE } from './constants';

export default function App() {
  const [status, setStatus] = useState<GameStatus>(GameStatus.START);
  const [score, setScore] = useState(0);
  const [language, setLanguage] = useState<'zh' | 'en'>('zh');

  const t = TRANSLATIONS[language];

  const handleScoreUpdate = useCallback((newScore: number) => {
    setScore(newScore);
  }, []);

  const handleGameEnd = useCallback((won: boolean) => {
    setStatus(won ? GameStatus.WON : GameStatus.LOST);
  }, []);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'zh' ? 'en' : 'zh');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-emerald-500/30 overflow-hidden flex flex-col">
      {/* Header / HUD */}
      <header className="p-4 md:p-6 flex justify-between items-center border-b border-white/5 bg-black/40 backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
            <Shield className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight uppercase italic font-serif">
              {t.title}
            </h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-mono">
              Nova Defense System v2.5
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-[10px] uppercase tracking-widest text-white/40 font-mono">{t.score}</span>
            <span className="text-2xl font-light font-mono tabular-nums text-emerald-400">
              {score.toString().padStart(4, '0')}
              <span className="text-sm text-white/20 ml-1">/ {WIN_SCORE}</span>
            </span>
          </div>
          
          <button 
            onClick={toggleLanguage}
            className="p-2 hover:bg-white/5 rounded-full transition-colors border border-white/10"
          >
            <Languages className="w-5 h-5 text-white/60" />
          </button>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="flex-1 relative flex items-center justify-center p-4">
        <div className="w-full max-w-4xl aspect-[4/3] relative">
          <GameCanvas 
            status={status} 
            onScoreUpdate={handleScoreUpdate} 
            onGameEnd={handleGameEnd}
            language={language}
          />

          {/* Overlays */}
          <AnimatePresence>
            {status !== GameStatus.PLAYING && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-sm"
              >
                <motion.div 
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  className="max-w-md w-full p-8 rounded-2xl border border-white/10 bg-[#0a0a0a] shadow-2xl text-center"
                >
                  {status === GameStatus.START && (
                    <>
                      <div className="mb-6 inline-flex p-4 bg-blue-500/10 rounded-full border border-blue-500/20">
                        <Target className="w-12 h-12 text-blue-400" />
                      </div>
                      <h2 className="text-3xl font-bold mb-4 font-serif italic">{t.title}</h2>
                      <p className="text-white/60 mb-8 leading-relaxed">
                        {t.instructions}
                      </p>
                      <button 
                        onClick={() => setStatus(GameStatus.PLAYING)}
                        className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest"
                      >
                        {t.start}
                      </button>
                    </>
                  )}

                  {status === GameStatus.WON && (
                    <>
                      <div className="mb-6 inline-flex p-4 bg-yellow-500/10 rounded-full border border-yellow-500/20">
                        <Trophy className="w-12 h-12 text-yellow-400" />
                      </div>
                      <h2 className="text-3xl font-bold mb-2 text-yellow-400">{t.win}</h2>
                      <p className="text-white/60 mb-4">{t.winMsg}</p>
                      <div className="text-4xl font-mono mb-8 text-white">{score}</div>
                      <button 
                        onClick={() => {
                          setScore(0);
                          setStatus(GameStatus.PLAYING);
                        }}
                        className="w-full py-4 bg-white text-black font-bold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest"
                      >
                        {t.restart}
                      </button>
                    </>
                  )}

                  {status === GameStatus.LOST && (
                    <>
                      <div className="mb-6 inline-flex p-4 bg-red-500/10 rounded-full border border-red-500/20">
                        <AlertTriangle className="w-12 h-12 text-red-400" />
                      </div>
                      <h2 className="text-3xl font-bold mb-2 text-red-500">{t.lose}</h2>
                      <p className="text-white/60 mb-8">{t.loseMsg}</p>
                      <button 
                        onClick={() => {
                          setScore(0);
                          setStatus(GameStatus.PLAYING);
                        }}
                        className="w-full py-4 bg-red-500 hover:bg-red-400 text-white font-bold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest"
                      >
                        {t.restart}
                      </button>
                    </>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer / Mobile HUD */}
      <footer className="p-4 md:hidden border-t border-white/5 bg-black/40 flex justify-center">
        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-widest text-white/40 font-mono">{t.score}</span>
          <span className="text-2xl font-light font-mono tabular-nums text-emerald-400">
            {score.toString().padStart(4, '0')}
          </span>
        </div>
      </footer>

      {/* Decorative Grid Background */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>
    </div>
  );
}
