import { Heart } from 'lucide-react';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="py-16 px-4 bg-gradient-to-br from-red-900 via-red-800 to-amber-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url(/paper-cut-bg.png)`,
          backgroundSize: '400px 400px',
        }} />
      </div>

      {/* Floating Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <img
            key={i}
            src="/icons/lantern.png"
            alt=""
            className="absolute w-10 h-14 object-contain opacity-20 animate-paper-float"
            style={{
              left: `${10 + i * 15}%`,
              top: `${10 + (i % 3) * 25}%`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Main Content */}
        <div className="text-center mb-12">
          <div className="paper-badge mb-6 mx-auto">
            <img src="/icons/firecracker.png" alt="" className="w-5 h-5" />
            <span>2026 丙午红马年</span>
            <img src="/icons/firecracker.png" alt="" className="w-5 h-5" />
          </div>

          <h2 className="font-calligraphy text-4xl md:text-5xl mb-4">
            马年大吉
          </h2>
          <p className="font-sans-sc text-red-200 mb-8 text-lg">
            愿2026年红马年带给你无限的好运与成功
          </p>

          {/* Quick Links */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {[
              { label: '马年文化', href: '#culture' },
              { label: '福签祈福', href: '#fortune' },
              { label: '祝福墙', href: '#blessing' },
              { label: '赛马游戏', href: '#game' },
              { label: '生肖配对', href: '#zodiac' },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="font-sans-sc text-red-200 hover:text-white transition-colors border-b-2 border-transparent hover:border-white pb-1"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Blessing */}
          <div className="paper-card bg-gradient-to-br from-amber-50 to-red-50 text-gray-800 p-6 max-w-lg mx-auto mb-12">
            <img src="/icons/fortune-barrel.png" alt="" className="w-10 h-10 mx-auto mb-4" />
            <p className="font-calligraphy text-xl leading-relaxed">
              龙马精神，马到成功<br/>
              红马年，愿你事业腾飞<br/>
              生活美满，万事如意
            </p>
          </div>

          {/* Back to Top */}
          <button
            onClick={scrollToTop}
            className="paper-btn paper-btn-gold mb-8"
          >
            回到顶部
          </button>
        </div>

        {/* Divider */}
        <div className="border-t-2 border-white/20 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src="/icons/zodiac-horse.png" alt="" className="w-8 h-8" />
              <span className="font-calligraphy text-xl">红马年2026</span>
            </div>
            
            <p className="font-sans-sc text-red-300 flex items-center gap-1">
              用 <Heart className="w-4 h-4 text-red-400 fill-red-400" /> 制作
            </p>
            
            <p className="font-sans-sc text-red-300">
              © 2026 红马年
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
