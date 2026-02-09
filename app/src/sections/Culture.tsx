import { useEffect, useRef, useState } from 'react';

const Culture = () => {
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

  const features = [
    {
      icon: '/icons/firecracker.png',
      title: '双火叠加',
      desc: '丙火+午火，60年一遇的极盛火年',
      color: 'bg-red-600',
    },
    {
      icon: '/icons/lantern.png',
      title: '马到成功',
      desc: '事业腾飞，一往无前的冲劲',
      color: 'bg-amber-600',
    },
    {
      icon: '/icons/fortune-stick.png',
      title: '龙马精神',
      desc: '精力充沛，活力四射的一年',
      color: 'bg-orange-600',
    },
    {
      icon: '/icons/zodiac-horse.png',
      title: '一马当先',
      desc: '勇争第一，敢于突破的精神',
      color: 'bg-yellow-600',
    },
  ];

  const idioms = [
    { text: '马到成功', meaning: 'Instant Success' },
    { text: '龙马精神', meaning: 'Dragon-Horse Spirit' },
    { text: '一马当先', meaning: 'Taking the Lead' },
    { text: '汗马功劳', meaning: 'Meritorious Service' },
    { text: '千里马', meaning: 'Thousand-Li Horse' },
    { text: '老马识途', meaning: 'Old Horse Knows the Way' },
  ];

  const horseYears = [
    { year: 1978, element: '土马', age: 48 },
    { year: 1990, element: '金马', age: 36 },
    { year: 2002, element: '水马', age: 24 },
    { year: 2014, element: '木马', age: 12 },
    { year: 2026, element: '红马', age: 0, highlight: true },
  ];

  return (
    <section 
      id="culture" 
      ref={sectionRef}
      className="py-20 px-4"
    >
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="paper-badge mb-6">
            <img src="/icons/zodiac-horse.png" alt="马" className="w-5 h-5" />
            <span>马年文化</span>
          </div>
          <h2 className="section-title">2026 红马年的意义</h2>
          <p className="font-sans-sc text-gray-600 mt-4 text-lg max-w-2xl mx-auto leading-relaxed">
            在中国传统文化中，马象征着力量、速度、自由与成功。
            2026年丙午红马年，双火叠加，是六十年一遇的特殊年份。
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={`paper-card p-6 transition-all duration-700 hover:scale-105 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className={`${feature.color} w-20 h-20 flex items-center justify-center mb-4 rounded-lg shadow-lg mx-auto`}>
                <img src={feature.icon} alt={feature.title} className="w-12 h-12 object-contain" />
              </div>
              <h3 className="font-calligraphy text-2xl text-gray-800 mb-2 text-center">{feature.title}</h3>
              <p className="font-sans-sc text-gray-600 text-center">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Idioms Section */}
        <div className={`paper-card p-8 mb-20 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h3 className="font-calligraphy text-3xl text-center text-gray-800 mb-8">
            <img src="/icons/fortune-barrel.png" alt="" className="inline w-8 h-8 mr-2" />
            马年成语
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {idioms.map((idiom, index) => (
              <div
                key={idiom.text}
                className="paper-card p-4 text-center hover:bg-red-50 transition-colors cursor-pointer group bg-gradient-to-br from-red-50 to-amber-50"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="font-calligraphy text-2xl text-red-600 mb-1 group-hover:scale-110 transition-transform">
                  {idiom.text}
                </div>
                <div className="font-sans-sc text-sm text-gray-500">{idiom.meaning}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Horse Years Timeline */}
        <div className={`transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h3 className="font-calligraphy text-3xl text-center text-gray-800 mb-8">
            马年年份对照
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            {horseYears.map((item) => (
              <div
                key={item.year}
                className={`paper-card p-6 text-center ${
                  item.highlight ? 'bg-gradient-to-br from-red-100 to-amber-100 border-red-600 border-4' : ''
                }`}
              >
                <div className={`font-calligraphy text-3xl ${item.highlight ? 'text-red-600' : 'text-gray-800'}`}>
                  {item.year}
                </div>
                <div className="font-sans-sc text-gray-600 mt-2">{item.element}</div>
                {item.age > 0 && (
                  <div className="font-sans-sc text-sm text-gray-500 mt-1">{item.age}岁</div>
                )}
                {item.highlight && (
                  <div className="mt-2 inline-block bg-red-600 text-white px-3 py-1 font-calligraphy text-sm rounded">
                    即将到来
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Fire Horse Info */}
        <div className={`mt-20 paper-card p-8 bg-gradient-to-br from-red-50 to-orange-50 transition-all duration-1000 delay-900 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <h3 className="font-calligraphy text-3xl text-red-600 mb-4">
                为什么2026年特别？
              </h3>
              <p className="font-sans-sc text-gray-700 leading-relaxed mb-4 text-lg">
                2026年是丙午年，丙属阳火，午也属火，这种&quot;火火相生&quot;的组合在六十甲子中极为罕见。
                上一次丙午红马年是1966年，下一次则要等到2086年。
              </p>
              <p className="font-sans-sc text-gray-700 leading-relaxed text-lg">
                红马年象征着极盛的能量、突破与变革。在这一年，人们更容易获得事业上的突破，
                但也需要注意控制情绪，避免冲动行事。
              </p>
            </div>
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="w-36 h-36 bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center rounded-lg shadow-2xl">
                  <span className="font-calligraphy text-5xl text-white">丙午</span>
                </div>
                <div className="absolute -top-3 -right-3 w-12 h-12 bg-amber-500 flex items-center justify-center rounded-lg shadow-lg">
                  <img src="/icons/firecracker.png" alt="" className="w-8 h-8" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Culture;
