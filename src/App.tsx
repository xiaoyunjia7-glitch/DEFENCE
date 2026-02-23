import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Target, Trophy, AlertTriangle, Languages, ShoppingCart, Coins, X, ArrowUpCircle } from 'lucide-react';
import GameCanvas from './components/GameCanvas';
import { GameStatus } from './types';
import { TRANSLATIONS, WIN_SCORE, UPGRADE_COST, GEM_UPGRADE_COST } from './constants';

export default function App() {
  const [status, setStatus] = useState<GameStatus>(GameStatus.START);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [gems, setGems] = useState(0);
  const [upgradeCount, setUpgradeCount] = useState(0);
  const [totalPurchases, setTotalPurchases] = useState(0);
  const [language, setLanguage] = useState<'zh' | 'en'>('zh');
  const [isInfinite, setIsInfinite] = useState(false);
  const [shopTab, setShopTab] = useState<'gold' | 'gem'>('gold');
  
  // Temporary buffs
  const [damageBoostTime, setDamageBoostTime] = useState(0);
  const [dropRateBoostTime, setDropRateBoostTime] = useState(0);

  const t = TRANSLATIONS[language];

  // Timer for temporary buffs
  React.useEffect(() => {
    const timer = setInterval(() => {
      setDamageBoostTime(prev => Math.max(0, prev - 1));
      setDropRateBoostTime(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleScoreUpdate = useCallback((newScore: number) => {
    setScore(newScore);
  }, []);

  const handleCoinCollect = useCallback((newCoins: number) => {
    setCoins(newCoins);
  }, []);

  const handleGemCollect = useCallback((newGems: number) => {
    setGems(newGems);
  }, []);

  const handleGameEnd = useCallback((won: boolean) => {
    if (won) {
      if (isInfinite) {
        setStatus(GameStatus.INFINITE_WON);
      } else {
        setStatus(GameStatus.INFINITE_CHOICE);
      }
    } else {
      setStatus(GameStatus.LOST);
    }
  }, [isInfinite]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'zh' ? 'en' : 'zh');
  };

  const resetToInitial = () => {
    setScore(0);
    setCoins(0);
    setGems(0);
    setUpgradeCount(0);
    setTotalPurchases(0);
    setDamageBoostTime(0);
    setDropRateBoostTime(0);
    setIsInfinite(false);
    setStatus(GameStatus.PLAYING);
  };

  const startInfinite = () => {
    setIsInfinite(true);
    setStatus(GameStatus.PLAYING);
  };

  const toggleShop = () => {
    if (status === GameStatus.PLAYING) {
      setStatus(GameStatus.SHOP);
    } else if (status === GameStatus.SHOP) {
      setStatus(GameStatus.PLAYING);
    }
  };

  const buyUpgrade = () => {
    if (coins >= UPGRADE_COST) {
      setCoins(prev => prev - UPGRADE_COST);
      setUpgradeCount(prev => prev + 1);
      setTotalPurchases(prev => prev + 1);
    }
  };

  const buyTempDamage = () => {
    if (gems >= GEM_UPGRADE_COST) {
      setGems(prev => prev - GEM_UPGRADE_COST);
      setDamageBoostTime(30);
      setTotalPurchases(prev => prev + 1);
    }
  };

  const buyTempCoin = () => {
    if (gems >= GEM_UPGRADE_COST) {
      setGems(prev => prev - GEM_UPGRADE_COST);
      setDropRateBoostTime(30);
      setTotalPurchases(prev => prev + 1);
    }
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
              Nova Defense System v2.5 {isInfinite && "| INFINITE MODE"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={toggleShop}
            className={`p-2 rounded-full transition-all border ${status === GameStatus.SHOP ? 'bg-emerald-500 border-emerald-400 text-black' : 'hover:bg-white/5 border-white/10 text-white/60'}`}
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
          
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
          {/* Real-time HUD: Top Left Score */}
          <div className="absolute top-4 left-4 z-10 pointer-events-none">
            <div className="bg-black/60 backdrop-blur-md border border-white/10 p-3 rounded-xl">
              <span className="text-[10px] uppercase tracking-widest text-white/40 font-mono block mb-1">{t.score}</span>
              <span className="text-2xl font-light font-mono tabular-nums text-emerald-400">
                {score.toString().padStart(4, '0')}
              </span>
            </div>
          </div>

          {/* Real-time HUD: Bottom Right Coins & Gems */}
          <div className="absolute bottom-12 right-4 z-10 pointer-events-none flex flex-col gap-2">
            <div className="bg-black/60 backdrop-blur-md border border-white/10 p-3 rounded-xl flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="text-[10px] uppercase tracking-widest text-white/40 font-mono block mb-1">{t.coins}</span>
                <span className="text-2xl font-light font-mono tabular-nums text-yellow-400">
                  {coins}
                </span>
              </div>
              <div className="p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                <Coins className="w-5 h-5 text-yellow-400" />
              </div>
            </div>
            
            <div className="bg-black/60 backdrop-blur-md border border-white/10 p-3 rounded-xl flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="text-[10px] uppercase tracking-widest text-white/40 font-mono block mb-1">{t.gems}</span>
                <span className="text-2xl font-light font-mono tabular-nums text-blue-400">
                  {gems}
                </span>
              </div>
              <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <Target className="w-5 h-5 text-blue-400" />
              </div>
            </div>

            {/* Monster Speed Increase Display */}
            <div className="bg-black/60 backdrop-blur-md border border-white/10 p-2 rounded-lg text-right">
              <span className="text-[9px] uppercase tracking-widest text-white/40 font-mono block mb-0.5">{t.monsterSpeed}</span>
              <span className="text-sm font-mono text-red-400">
                +{( (Math.pow(1.035, totalPurchases) - 1) * 100 ).toFixed(1)}%
              </span>
            </div>
          </div>

          <GameCanvas 
            status={status} 
            isInfinite={isInfinite}
            upgradeCount={upgradeCount}
            totalPurchases={totalPurchases}
            isDamageBoosted={damageBoostTime > 0}
            isDropRateBoosted={dropRateBoostTime > 0}
            onScoreUpdate={handleScoreUpdate} 
            onCoinCollect={handleCoinCollect}
            onGemCollect={handleGemCollect}
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
                {status === GameStatus.SHOP ? (
                  <motion.div 
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="max-w-md w-full p-8 rounded-2xl border border-white/10 bg-[#0a0a0a] shadow-2xl"
                  >
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-3">
                        <ShoppingCart className="w-6 h-6 text-emerald-400" />
                        <h2 className="text-2xl font-bold font-serif italic">{t.shop}</h2>
                      </div>
                      <button onClick={toggleShop} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                        <X className="w-6 h-6 text-white/40" />
                      </button>
                    </div>

                    {/* Shop Tabs */}
                    <div className="flex gap-2 mb-6 p-1 bg-white/5 rounded-xl border border-white/10">
                      <button 
                        onClick={() => setShopTab('gold')}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${shopTab === 'gold' ? 'bg-emerald-500 text-black shadow-lg' : 'text-white/40 hover:text-white'}`}
                      >
                        {t.tabGold}
                      </button>
                      <button 
                        onClick={() => setShopTab('gem')}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${shopTab === 'gem' ? 'bg-blue-500 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
                      >
                        {t.tabGem}
                      </button>
                    </div>

                    <div className="space-y-6">
                      {shopTab === 'gold' ? (
                        <div className="p-6 rounded-xl border border-white/5 bg-white/5 flex flex-col items-center text-center">
                          <ArrowUpCircle className="w-12 h-12 text-emerald-400 mb-4" />
                          <h3 className="text-lg font-bold mb-2 uppercase tracking-wide">System Overclock</h3>
                          <p className="text-sm text-white/40 mb-6">{t.upgradeEffect}</p>
                          
                          <div className="flex items-center gap-2 mb-6 text-xs text-white/60 font-mono">
                            {t.owned}: <span className="text-emerald-400">{upgradeCount}</span>
                          </div>

                          <button 
                            onClick={buyUpgrade}
                            disabled={coins < UPGRADE_COST}
                            className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${coins >= UPGRADE_COST ? 'bg-emerald-500 hover:bg-emerald-400 text-black' : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'}`}
                          >
                            <Coins className="w-5 h-5" />
                            {t.buyUpgrade}
                          </button>
                          {coins < UPGRADE_COST && (
                            <p className="mt-2 text-[10px] text-red-400/60 uppercase tracking-widest">{t.insufficientFunds}</p>
                          )}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-4">
                          {/* Temp Damage */}
                          <div className="p-4 rounded-xl border border-white/5 bg-white/5 flex flex-col items-center text-center">
                            <Target className="w-8 h-8 text-blue-400 mb-2" />
                            <h3 className="text-md font-bold mb-1 uppercase tracking-wide">{t.tempDamage}</h3>
                            <p className="text-xs text-white/40 mb-4">{t.tempDamageDesc}</p>
                            
                            <button 
                              onClick={buyTempDamage}
                              disabled={gems < GEM_UPGRADE_COST || damageBoostTime > 0}
                              className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${gems >= GEM_UPGRADE_COST && damageBoostTime === 0 ? 'bg-blue-500 hover:bg-blue-400 text-white' : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'}`}
                            >
                              <Target className="w-4 h-4" />
                              {damageBoostTime > 0 ? `${t.active} (${damageBoostTime}s)` : `2 ${t.gems}`}
                            </button>
                          </div>

                          {/* Temp Coin Rate */}
                          <div className="p-4 rounded-xl border border-white/5 bg-white/5 flex flex-col items-center text-center">
                            <Coins className="w-8 h-8 text-yellow-400 mb-2" />
                            <h3 className="text-md font-bold mb-1 uppercase tracking-wide">{t.tempCoin}</h3>
                            <p className="text-xs text-white/40 mb-4">{t.tempCoinDesc}</p>
                            
                            <button 
                              onClick={buyTempCoin}
                              disabled={gems < GEM_UPGRADE_COST || dropRateBoostTime > 0}
                              className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${gems >= GEM_UPGRADE_COST && dropRateBoostTime === 0 ? 'bg-yellow-500 hover:bg-yellow-400 text-black' : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'}`}
                            >
                              <Coins className="w-4 h-4" />
                              {dropRateBoostTime > 0 ? `${t.active} (${dropRateBoostTime}s)` : `2 ${t.gems}`}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ) : (
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

                    {status === GameStatus.INFINITE_CHOICE && (
                      <>
                        <div className="mb-6 inline-flex p-4 bg-yellow-500/10 rounded-full border border-yellow-500/20">
                          <Trophy className="w-12 h-12 text-yellow-400" />
                        </div>
                        <h2 className="text-3xl font-bold mb-2 text-yellow-400">{t.win}</h2>
                        <p className="text-white/60 mb-4">{t.winMsg}</p>
                        <div className="text-4xl font-mono mb-8 text-white">{score}</div>
                        <div className="flex flex-col gap-3">
                          <button 
                            onClick={startInfinite}
                            className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest"
                          >
                            {t.infiniteMode}
                          </button>
                          <button 
                            onClick={resetToInitial}
                            className="w-full py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all border border-white/10 uppercase tracking-widest"
                          >
                            {t.restart}
                          </button>
                        </div>
                      </>
                    )}

                    {status === GameStatus.INFINITE_WON && (
                      <>
                        <div className="mb-6 inline-flex p-4 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                          <Trophy className="w-12 h-12 text-emerald-400" />
                        </div>
                        <h2 className="text-3xl font-bold mb-2 text-emerald-400">{t.win}</h2>
                        <p className="text-white/60 mb-8">{t.infiniteWin}</p>
                        <button 
                          onClick={resetToInitial}
                          className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest"
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
                          onClick={resetToInitial}
                          className="w-full py-4 bg-red-500 hover:bg-red-400 text-white font-bold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest"
                        >
                          {t.restart}
                        </button>
                      </>
                    )}
                  </motion.div>
                )}
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
