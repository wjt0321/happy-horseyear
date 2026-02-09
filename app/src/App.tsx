import { useState, useEffect } from 'react';
import Hero from './sections/Hero';
import Culture from './sections/Culture';
import FortuneBucket from './sections/FortuneBucket';
import BlessingWall from './sections/BlessingWall';
import ZodiacMatch from './sections/ZodiacMatch';
import Footer from './sections/Footer';
import Fireworks from './components/Fireworks';
import Particles from './components/Particles';
import BackgroundMusic from './components/BackgroundMusic';
import ClickEffect from './components/ClickEffect';
import './App.css';

function App() {
  const [scrollY, setScrollY] = useState(0);
  const [showFireworks, setShowFireworks] = useState(() => {
    if (typeof window === 'undefined') return true;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    return !(reduceMotion || isCoarsePointer);
  });

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-red-50 to-amber-50 relative">
      {/* Background Effects */}
      {showFireworks && <Fireworks />}
      <Particles />
      
      {/* Paper Cut Background Pattern */}
      <div 
        className="fixed inset-0 opacity-5 pointer-events-none z-0"
        style={{
          backgroundImage: 'url(/paper-cut-bg.png)',
          backgroundSize: '600px 600px',
          backgroundRepeat: 'repeat',
          transform: `translateY(${scrollY * 0.05}px)`,
        }}
      />
      
      {/* Main Content */}
      <main className="relative z-10">
        <Hero />
        <Culture />
        <FortuneBucket />
        <BlessingWall />
        <ZodiacMatch />
        <Footer />
      </main>
      
      {/* Click Effect */}
      <ClickEffect />

      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3">
        <BackgroundMusic />
        <button
          type="button"
          onClick={() => setShowFireworks(!showFireworks)}
          className="w-12 h-12 bg-red-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-red-700 transition-colors border-2 border-amber-400"
          title={showFireworks ? '关闭烟花' : '开启烟花'}
          aria-label={showFireworks ? '关闭烟花' : '开启烟花'}
          aria-pressed={showFireworks}
        >
          <span className="text-xl">{showFireworks ? '🎆' : '✨'}</span>
        </button>
      </div>
    </div>
  );
}

export default App;
