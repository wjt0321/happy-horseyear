import { useState, useEffect, useRef, useCallback } from 'react';
import { Trophy, RotateCcw, Play, Pause } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Horse {
  id: number;
  name: string;
  color: string;
  icon: string;
  position: number;
  speed: number;
}

const HorseRaceGame = () => {
  const [horses, setHorses] = useState<Horse[]>([
    { id: 1, name: '红焰马', color: '#dc2626', icon: '/icons/zodiac-horse.png', position: 0, speed: 0 },
    { id: 2, name: '金龙马', color: '#f59e0b', icon: '/icons/zodiac-dragon.png', position: 0, speed: 0 },
    { id: 3, name: '青云马', color: '#0891b2', icon: '/icons/zodiac-tiger.png', position: 0, speed: 0 },
    { id: 4, name: '紫霞马', color: '#7c3aed', icon: '/icons/zodiac-rabbit.png', position: 0, speed: 0 },
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [winner, setWinner] = useState<Horse | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [selectedHorse, setSelectedHorse] = useState<number | null>(null);
  const [betResult, setBetResult] = useState<'win' | 'lose' | null>(null);
  const [countdown, setCountdown] = useState(0);
  const animationRef = useRef<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const resetRace = () => {
    setHorses(horses.map(h => ({ ...h, position: 0, speed: 0 })));
    setWinner(null);
    setShowResult(false);
    setBetResult(null);
    setIsRunning(false);
    setCountdown(0);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const startRace = () => {
    if (isRunning || winner) return;
    
    setCountdown(3);
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setIsRunning(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const updateRace = useCallback(() => {
    if (!isRunning) return;

    setHorses(prevHorses => {
      const updatedHorses = prevHorses.map(horse => {
        const newSpeed = 0.5 + Math.random() * 2.5;
        const newPosition = Math.min(horse.position + newSpeed, 100);
        return {
          ...horse,
          speed: newSpeed,
          position: newPosition,
        };
      });

      const finishedHorse = updatedHorses.find(h => h.position >= 100);
      if (finishedHorse && !winner) {
        setWinner(finishedHorse);
        setIsRunning(false);
        setShowResult(true);
        if (selectedHorse === finishedHorse.id) {
          setBetResult('win');
        } else if (selectedHorse !== null) {
          setBetResult('lose');
        }
      }

      return updatedHorses;
    });

    if (isRunning && !winner) {
      animationRef.current = requestAnimationFrame(updateRace);
    }
  }, [isRunning, winner, selectedHorse]);

  useEffect(() => {
    if (isRunning) {
      animationRef.current = requestAnimationFrame(updateRace);
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning, updateRace]);

  const selectHorse = (id: number) => {
    if (isRunning || winner) return;
    setSelectedHorse(id === selectedHorse ? null : id);
  };

  return (
    <section 
      id="game" 
      ref={sectionRef}
      className="py-20 px-4"
    >
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <div className={`text-center mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="paper-badge mb-6">
            <img src="/icons/zodiac-horse.png" alt="赛马" className="w-5 h-5" />
            <span>赛马游戏</span>
          </div>
          <h2 className="section-title">红马竞速赛</h2>
          <p className="font-sans-sc text-gray-600 mt-4 text-lg">
            选择你的赛马，看看谁能一马当先！
          </p>
        </div>

        {/* Game Area */}
        <div className={`paper-card p-6 mb-8 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Track */}
          <div className="space-y-4 mb-6">
            {horses.map((horse, index) => (
              <div
                key={horse.id}
                className={`relative border-2 ${
                  selectedHorse === horse.id ? 'border-red-600 bg-red-50' : 'border-gray-300 bg-amber-50'
                } h-20 cursor-pointer transition-all rounded-lg`}
                onClick={() => selectHorse(horse.id)}
              >
                {/* Lane Number */}
                <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center font-calligraphy text-xl text-white rounded-l-lg">
                  {index + 1}
                </div>

                {/* Horse */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 transition-all duration-100"
                  style={{ left: `calc(${horse.position}% - 32px + 12%)` }}
                >
                  <img
                    src={horse.icon}
                    alt={horse.name}
                    className={`w-12 h-12 object-contain ${isRunning ? 'animate-bounce' : ''}`}
                    style={{ filter: `drop-shadow(2px 2px 0 ${horse.color})` }}
                  />
                </div>

                {/* Finish Line */}
                <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-b from-red-600 via-white to-red-600 opacity-50 rounded-r-lg" />

                {/* Selection Indicator */}
                {selectedHorse === horse.id && (
                  <div className="absolute -left-2 -top-2 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                    <img src="/icons/fortune-stick.png" alt="" className="w-4 h-4" />
                  </div>
                )}

                {/* Horse Name */}
                <div className="absolute right-8 top-1/2 -translate-y-1/2 font-calligraphy text-lg text-gray-600">
                  {horse.name}
                </div>
              </div>
            ))}
          </div>

          {/* Countdown */}
          {countdown > 0 && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
              <div className="font-calligraphy text-9xl text-amber-400 animate-paper-pulse drop-shadow-lg">
                {countdown}
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={startRace}
              disabled={isRunning || !!winner || countdown > 0}
              className={`paper-btn ${(isRunning || !!winner || countdown > 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isRunning ? (
                <><Pause className="inline w-5 h-5 mr-2" />比赛中</>
              ) : (
                <><Play className="inline w-5 h-5 mr-2" />开始比赛</>
              )}
            </button>
            <button
              onClick={resetRace}
              className="paper-btn paper-btn-gold"
            >
              <RotateCcw className="inline w-5 h-5 mr-2" />
              重新开始
            </button>
          </div>

          {/* Selected Horse Info */}
          {selectedHorse && !winner && (
            <div className="mt-6 text-center">
              <p className="font-sans-sc text-gray-700 text-lg">
                你选择了: <span className="text-red-600 font-bold font-calligraphy text-xl">{horses.find(h => h.id === selectedHorse)?.name}</span>
              </p>
              <p className="font-sans-sc text-gray-500 mt-1">
                点击&quot;开始比赛&quot;看看你的马能否获胜！
              </p>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className={`grid md:grid-cols-3 gap-4 transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {[
            { step: '1', text: '选择一匹你喜欢的赛马' },
            { step: '2', text: '点击"开始比赛"按钮' },
            { step: '3', text: '看看你的马能否获胜！' },
          ].map((item) => (
            <div key={item.step} className="paper-card p-4 text-center">
              <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-red-600 to-red-700 text-white font-calligraphy text-2xl flex items-center justify-center rounded-full shadow-lg">
                {item.step}
              </div>
              <p className="font-sans-sc text-gray-700">{item.text}</p>
            </div>
          ))}
        </div>

        {/* Result Dialog */}
        <Dialog open={showResult} onOpenChange={setShowResult}>
          <DialogContent className="paper-card border-4 border-red-600">
            <DialogHeader>
              <DialogTitle className="text-center flex items-center justify-center gap-2">
                <Trophy className="w-8 h-8 text-amber-500" />
                <span className="font-calligraphy text-3xl">比赛结束！</span>
              </DialogTitle>
            </DialogHeader>
            <div className="p-6 text-center">
              <img src={winner?.icon} alt="" className="w-20 h-20 mx-auto mb-4 animate-bounce" />
              <p className="font-calligraphy text-2xl text-gray-800 mb-2">
                获胜者是: {winner?.name}
              </p>
              
              {betResult && (
                <div className={`mt-4 p-4 border-2 rounded-lg ${betResult === 'win' ? 'border-green-600 bg-green-100' : 'border-red-600 bg-red-100'}`}>
                  <p className={`font-calligraphy text-xl ${betResult === 'win' ? 'text-green-600' : 'text-red-600'}`}>
                    {betResult === 'win' ? '🎉 恭喜你猜对了！' : '😅 很遗憾，下次再接再厉！'}
                  </p>
                </div>
              )}

              <button
                onClick={() => {
                  setShowResult(false);
                  resetRace();
                }}
                className="paper-btn mt-6"
              >
                再来一局
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default HorseRaceGame;
