import { useState, useEffect, useRef } from 'react';
import { Search, Heart, Users, Star, Info } from 'lucide-react';

interface Zodiac {
  id: number;
  name: string;
  icon: string;
  years: number[];
  element: string;
  traits: string[];
  bestMatches: number[];
  worstMatches: number[];
}

const zodiacs: Zodiac[] = [
  { id: 1, name: '鼠', icon: '/icons/zodiac-rat.png', years: [2020, 2008, 1996, 1984, 1972], element: '水', traits: ['聪明', '机智', '适应力强'], bestMatches: [5, 9, 4], worstMatches: [7, 6] },
  { id: 2, name: '牛', icon: '/icons/zodiac-ox.png', years: [2021, 2009, 1997, 1985, 1973], element: '土', traits: ['勤奋', '踏实', '可靠'], bestMatches: [6, 10, 9], worstMatches: [8, 5] },
  { id: 3, name: '虎', icon: '/icons/zodiac-tiger.png', years: [2022, 2010, 1998, 1986, 1974], element: '木', traits: ['勇敢', '自信', '领导力'], bestMatches: [7, 11, 10], worstMatches: [9, 6] },
  { id: 4, name: '兔', icon: '/icons/zodiac-rabbit.png', years: [2023, 2011, 1999, 1987, 1975], element: '木', traits: ['温柔', '优雅', '善良'], bestMatches: [8, 12, 1], worstMatches: [10, 7] },
  { id: 5, name: '龙', icon: '/icons/zodiac-dragon.png', years: [2024, 2012, 2000, 1988, 1976], element: '土', traits: ['权威', '自信', '有抱负'], bestMatches: [9, 1, 11], worstMatches: [2, 8] },
  { id: 6, name: '蛇', icon: '/icons/zodiac-snake.png', years: [2025, 2013, 2001, 1989, 1977], element: '火', traits: ['智慧', '神秘', '直觉强'], bestMatches: [10, 2, 12], worstMatches: [3, 9] },
  { id: 7, name: '马', icon: '/icons/zodiac-horse.png', years: [2026, 2014, 2002, 1990, 1978], element: '火', traits: ['热情', '自由', '活力'], bestMatches: [11, 3, 1], worstMatches: [4, 10] },
  { id: 8, name: '羊', icon: '/icons/zodiac-goat.png', years: [2027, 2015, 2003, 1991, 1979], element: '土', traits: ['温和', '艺术', '有同情心'], bestMatches: [12, 4, 2], worstMatches: [5, 11] },
  { id: 9, name: '猴', icon: '/icons/zodiac-monkey.png', years: [2028, 2016, 2004, 1992, 1980], element: '金', traits: ['聪明', '活泼', '好奇'], bestMatches: [1, 5, 3], worstMatches: [6, 12] },
  { id: 10, name: '鸡', icon: '/icons/zodiac-rooster.png', years: [2029, 2017, 2005, 1993, 1981], element: '金', traits: ['勤奋', '诚实', '勇敢'], bestMatches: [2, 6, 4], worstMatches: [7, 1] },
  { id: 11, name: '狗', icon: '/icons/zodiac-dog.png', years: [2030, 2018, 2006, 1994, 1982], element: '土', traits: ['忠诚', '诚实', '可靠'], bestMatches: [3, 7, 5], worstMatches: [8, 2] },
  { id: 12, name: '猪', icon: '/icons/zodiac-pig.png', years: [2031, 2019, 2007, 1995, 1983], element: '水', traits: ['善良', '慷慨', '乐观'], bestMatches: [4, 8, 6], worstMatches: [9, 3] },
];

const ZodiacMatch = () => {
  const [selectedZodiac1, setSelectedZodiac1] = useState<Zodiac | null>(null);
  const [selectedZodiac2, setSelectedZodiac2] = useState<Zodiac | null>(null);
  const [matchResult, setMatchResult] = useState<'best' | 'good' | 'neutral' | 'bad' | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [yearInput, setYearInput] = useState('');
  const [foundZodiac, setFoundZodiac] = useState<Zodiac | null>(null);
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

  const checkMatch = () => {
    if (!selectedZodiac1 || !selectedZodiac2) return;

    if (selectedZodiac1.id === selectedZodiac2.id) {
      setMatchResult('neutral');
    } else if (selectedZodiac1.bestMatches.includes(selectedZodiac2.id)) {
      setMatchResult('best');
    } else if (selectedZodiac1.worstMatches.includes(selectedZodiac2.id)) {
      setMatchResult('bad');
    } else {
      setMatchResult('good');
    }
    setShowResult(true);
  };

  const findZodiacByYear = () => {
    const year = parseInt(yearInput);
    if (!year || year < 1900 || year > 2100) {
      setFoundZodiac(null);
      return;
    }

    const zodiac = zodiacs.find(z => z.years.includes(year));
    if (zodiac) {
      setFoundZodiac(zodiac);
    } else {
      const remainder = (year - 4) % 12;
      const zodiacId = remainder === 0 ? 12 : remainder;
      setFoundZodiac(zodiacs.find(z => z.id === zodiacId) || null);
    }
  };

  const getMatchDescription = () => {
    switch (matchResult) {
      case 'best':
        return { text: '天作之合！', emoji: '💕', color: 'text-pink-600', bg: 'bg-pink-100' };
      case 'good':
        return { text: '相处融洽', emoji: '💛', color: 'text-amber-600', bg: 'bg-amber-100' };
      case 'neutral':
        return { text: '需要磨合', emoji: '💙', color: 'text-blue-600', bg: 'bg-blue-100' };
      case 'bad':
        return { text: '需要努力', emoji: '💜', color: 'text-purple-600', bg: 'bg-purple-100' };
      default:
        return { text: '', emoji: '', color: '', bg: '' };
    }
  };

  return (
    <section 
      id="zodiac" 
      ref={sectionRef}
      className="py-20 px-4"
    >
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <div className={`text-center mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="paper-badge mb-6">
            <Users className="w-5 h-5" />
            <span>生肖配对</span>
          </div>
          <h2 className="section-title">生肖配对查询</h2>
          <p className="font-sans-sc text-gray-600 mt-4 text-lg">
            查询生肖之间的相合程度，看看谁是你的最佳拍档！
          </p>
        </div>

        {/* Year Lookup */}
        <div className={`paper-card p-6 mb-8 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h3 className="font-calligraphy text-2xl text-gray-800 mb-4 flex items-center gap-2">
            <Search className="w-6 h-6" />
            年份查询生肖
          </h3>
          <div className="flex gap-4">
            <input
              type="number"
              value={yearInput}
              onChange={(e) => setYearInput(e.target.value)}
              placeholder="输入年份 (如: 1990)"
              className="paper-input flex-1"
              min="1900"
              max="2100"
            />
            <button
              onClick={findZodiacByYear}
              className="paper-btn"
            >
              查询
            </button>
          </div>
          
          {foundZodiac && (
            <div className="mt-4 p-4 bg-gradient-to-br from-amber-50 to-red-50 border-2 border-amber-600 flex items-center gap-4 rounded-lg">
              <img src={foundZodiac.icon} alt={foundZodiac.name} className="w-16 h-16 object-contain" />
              <div>
                <div className="font-calligraphy text-2xl text-gray-800">{foundZodiac.name}</div>
                <div className="font-sans-sc text-gray-600 mt-1">
                  五行: {foundZodiac.element} | 
                  特点: {foundZodiac.traits.join('、')}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Zodiac Match */}
        <div className={`paper-card p-6 mb-8 transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h3 className="font-calligraphy text-2xl text-gray-800 mb-4 flex items-center gap-2">
            <Heart className="w-6 h-6 text-red-600" />
            生肖配对
          </h3>

          {/* Selection */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="font-calligraphy text-lg text-gray-700 mb-2 block">选择第一个生肖</label>
              <div className="grid grid-cols-4 gap-2">
                {zodiacs.map((zodiac) => (
                  <button
                    key={`z1-${zodiac.id}`}
                    onClick={() => setSelectedZodiac1(zodiac)}
                    className={`aspect-square border-2 flex items-center justify-center transition-all rounded-lg p-2 ${
                      selectedZodiac1?.id === zodiac.id
                        ? 'border-red-600 bg-red-100'
                        : 'border-gray-300 bg-white hover:border-gray-400'
                    }`}
                  >
                    <img src={zodiac.icon} alt={zodiac.name} className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
              {selectedZodiac1 && (
                <p className="font-sans-sc text-gray-600 mt-2">
                  已选择: <span className="font-calligraphy text-lg text-red-600">{selectedZodiac1.name}</span> ({selectedZodiac1.element})
                </p>
              )}
            </div>

            <div>
              <label className="font-calligraphy text-lg text-gray-700 mb-2 block">选择第二个生肖</label>
              <div className="grid grid-cols-4 gap-2">
                {zodiacs.map((zodiac) => (
                  <button
                    key={`z2-${zodiac.id}`}
                    onClick={() => setSelectedZodiac2(zodiac)}
                    className={`aspect-square border-2 flex items-center justify-center transition-all rounded-lg p-2 ${
                      selectedZodiac2?.id === zodiac.id
                        ? 'border-red-600 bg-red-100'
                        : 'border-gray-300 bg-white hover:border-gray-400'
                    }`}
                  >
                    <img src={zodiac.icon} alt={zodiac.name} className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
              {selectedZodiac2 && (
                <p className="font-sans-sc text-gray-600 mt-2">
                  已选择: <span className="font-calligraphy text-lg text-red-600">{selectedZodiac2.name}</span> ({selectedZodiac2.element})
                </p>
              )}
            </div>
          </div>

          {/* Match Button */}
          <button
            onClick={checkMatch}
            disabled={!selectedZodiac1 || !selectedZodiac2}
            className={`paper-btn w-full ${(!selectedZodiac1 || !selectedZodiac2) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Star className="inline w-5 h-5 mr-2" />
            查看配对结果
          </button>

          {/* Result */}
          {showResult && matchResult && (
            <div className={`mt-6 p-6 border-2 rounded-lg ${getMatchDescription().bg} ${getMatchDescription().color.replace('text-', 'border-')}`}>
              <div className="text-center">
                <div className="font-calligraphy text-3xl mb-2">{getMatchDescription().text}</div>
                <div className="flex justify-center items-center gap-4 mb-4">
                  <div className="text-center">
                    <img src={selectedZodiac1?.icon} alt="" className="w-16 h-16 mx-auto" />
                    <div className="font-calligraphy text-lg mt-1">{selectedZodiac1?.name}</div>
                  </div>
                  <div className="text-2xl">+</div>
                  <div className="text-center">
                    <img src={selectedZodiac2?.icon} alt="" className="w-16 h-16 mx-auto" />
                    <div className="font-calligraphy text-lg mt-1">{selectedZodiac2?.name}</div>
                  </div>
                </div>
                <p className="font-sans-sc text-gray-700">
                  {matchResult === 'best' && '你们是天作之合，性格互补，相处会非常融洽！'}
                  {matchResult === 'good' && '你们相处融洽，有良好的沟通基础。'}
                  {matchResult === 'neutral' && '你们需要一些磨合，互相理解就能相处愉快。'}
                  {matchResult === 'bad' && '你们性格差异较大，需要更多努力来维系关系。'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Zodiac Info */}
        <div className={`paper-card p-6 transition-all duration-1000 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h3 className="font-calligraphy text-2xl text-gray-800 mb-4 flex items-center gap-2">
            <Info className="w-6 h-6" />
            十二生肖
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {zodiacs.map((zodiac) => (
              <div
                key={zodiac.id}
                className="text-center p-3 bg-gradient-to-br from-amber-50 to-red-50 border-2 border-amber-200 hover:border-amber-400 transition-colors cursor-pointer rounded-lg"
                onClick={() => {
                  setSelectedZodiac1(zodiac);
                  window.scrollTo({ top: document.getElementById('zodiac')?.offsetTop || 0, behavior: 'smooth' });
                }}
              >
                <img src={zodiac.icon} alt={zodiac.name} className="w-12 h-12 mx-auto object-contain" />
                <div className="font-calligraphy text-lg text-gray-700 mt-1">{zodiac.name}</div>
                <div className="font-sans-sc text-sm text-gray-500">{zodiac.element}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ZodiacMatch;
