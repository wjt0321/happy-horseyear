import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const Hero = () => {
  const [showIntro, setShowIntro] = useState(() => {
    if (typeof window === 'undefined') return true;
    return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });
  const [textIndex, setTextIndex] = useState(0);
  
  const introTexts = [
    '2026 丙午年',
    '红马年降临',
    '60年一遇',
    '双火叠加',
  ];

  useEffect(() => {
    if (showIntro) {
      const interval = setInterval(() => {
        setTextIndex((prev) => {
          if (prev >= introTexts.length - 1) {
            setTimeout(() => setShowIntro(false), 800);
            return prev;
          }
          return prev + 1;
        });
      }, 600);
      return () => clearInterval(interval);
    }
  }, [showIntro]);

  useEffect(() => {
    if (!showIntro) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowIntro(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showIntro]);

  const scrollToContent = () => {
    const element = document.getElementById('culture');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const replayIntro = () => {
    setTextIndex(0);
    setShowIntro(true);
  };

  if (showIntro) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-red-900 via-red-800 to-amber-900 z-50 flex items-center justify-center">
        <button
          type="button"
          onClick={() => setShowIntro(false)}
          className="absolute top-4 right-4 px-4 py-2 bg-black/30 text-amber-200 border border-amber-400/50 rounded-lg backdrop-blur hover:bg-black/40 transition-colors"
          aria-label="跳过开场"
        >
          跳过
        </button>
        <div className="text-center">
          <div className="font-calligraphy text-5xl md:text-7xl text-amber-300 animate-paper-pulse drop-shadow-lg">
            {introTexts[textIndex]}
          </div>
          <div className="mt-8 flex justify-center gap-2">
            {introTexts.map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full ${
                  i === textIndex ? 'bg-amber-400' : 'bg-red-700'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-screen flex flex-col items-center justify-center relative px-4 py-20">
      <div className="absolute top-4 right-4 z-20">
        <button
          type="button"
          onClick={replayIntro}
          className="px-4 py-2 bg-white/70 border-2 border-red-600 text-red-700 rounded-lg shadow-sm hover:bg-white transition-colors font-sans-sc"
          aria-label="重播开场"
        >
          重播开场
        </button>
      </div>
      {/* Floating Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <img
            key={i}
            src="/icons/lantern.png"
            alt=""
            className="absolute w-12 h-16 object-contain opacity-30 animate-paper-float"
            style={{
              left: `${10 + i * 12}%`,
              top: `${5 + (i % 3) * 15}%`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="text-center max-w-5xl mx-auto relative z-10">
        {/* Badge */}
        <div className="paper-badge mb-8">
          <img src="/icons/firecracker.png" alt="鞭炮" className="w-5 h-5" />
          <span>2026 丙午红马年</span>
          <img src="/icons/firecracker.png" alt="鞭炮" className="w-5 h-5" />
        </div>

        {/* Title */}
        <h1 className="font-calligraphy text-5xl md:text-7xl lg:text-8xl text-red-600 mb-4 leading-tight drop-shadow-lg">
          <span className="block animate-paper-float">红马年</span>
          <span className="block text-3xl md:text-5xl text-amber-600 mt-4">
            YEAR OF THE HORSE
          </span>
        </h1>

        {/* Pixel Horse Image */}
        <div className="relative my-12">
          <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full" />
          <img
            src="/horse-pixel.png"
            alt="Fire Horse Pixel Art"
            className="pixelated relative w-64 h-64 md:w-80 md:h-80 mx-auto object-contain animate-paper-float drop-shadow-2xl"
          />
          <img 
            src="/icons/lantern.png" 
            alt="" 
            className="absolute top-0 right-1/4 w-10 h-14 animate-pulse" 
          />
          <img 
            src="/icons/firecracker.png" 
            alt="" 
            className="absolute bottom-1/4 left-1/4 w-10 h-14 animate-pulse" 
            style={{ animationDelay: '0.5s' }} 
          />
        </div>

        {/* Subtitle */}
        <p className="font-calligraphy text-xl md:text-2xl text-gray-700 mb-8 max-w-2xl mx-auto leading-relaxed">
          丙午双火，六十年一遇<br/>
          马到成功，龙马精神
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={scrollToContent}
            className="paper-btn"
          >
            探索红马年
          </button>
          <a 
            href="#fortune"
            className="paper-btn paper-btn-gold"
          >
            求签祈福
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-16 max-w-lg mx-auto">
          {[
            { label: '天干', value: '丙', color: 'bg-red-600' },
            { label: '地支', value: '午', color: 'bg-amber-600' },
            { label: '五行', value: '火', color: 'bg-orange-600' },
          ].map((item) => (
            <div key={item.label} className="paper-card p-4">
              <div className={`${item.color} text-white w-16 h-16 mx-auto flex items-center justify-center font-calligraphy text-3xl mb-2 rounded-lg shadow-lg`}>
                {item.value}
              </div>
              <div className="font-sans-sc text-gray-600 font-medium">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll Indicator */}
      <button 
        onClick={scrollToContent}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce"
      >
        <ChevronDown className="w-10 h-10 text-red-600" />
      </button>
    </section>
  );
};

export default Hero;
