import { useState, useEffect, useRef } from 'react';
import { Copy, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Blessing {
  id: number;
  name: string;
  message: string;
  icon: string;
  likes: number;
  timestamp: number;
  isLiked?: boolean;
}

const blessingIcons = [
  '/icons/fortune-barrel.png',
  '/icons/fortune-stick.png',
  '/icons/lantern.png',
  '/icons/firecracker.png',
  '/icons/zodiac-rat.png',
  '/icons/zodiac-ox.png',
  '/icons/zodiac-tiger.png',
  '/icons/zodiac-rabbit.png',
  '/icons/zodiac-dragon.png',
  '/icons/zodiac-snake.png',
  '/icons/zodiac-horse.png',
  '/icons/zodiac-goat.png',
  '/icons/zodiac-monkey.png',
  '/icons/zodiac-rooster.png',
  '/icons/zodiac-dog.png',
  '/icons/zodiac-pig.png',
  '/icons/horse-cursor.png',
];

const BlessingWall = () => {
  const [blessings, setBlessings] = useState<Blessing[]>([]);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(blessingIcons[0]);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const iconLabels: Record<string, string> = {
    '/icons/fortune-barrel.png': '福桶',
    '/icons/fortune-stick.png': '签筒',
    '/icons/lantern.png': '灯笼',
    '/icons/firecracker.png': '鞭炮',
    '/icons/zodiac-rat.png': '生肖鼠',
    '/icons/zodiac-ox.png': '生肖牛',
    '/icons/zodiac-tiger.png': '生肖虎',
    '/icons/zodiac-rabbit.png': '生肖兔',
    '/icons/zodiac-dragon.png': '生肖龙',
    '/icons/zodiac-snake.png': '生肖蛇',
    '/icons/zodiac-horse.png': '生肖马',
    '/icons/zodiac-goat.png': '生肖羊',
    '/icons/zodiac-monkey.png': '生肖猴',
    '/icons/zodiac-rooster.png': '生肖鸡',
    '/icons/zodiac-dog.png': '生肖狗',
    '/icons/zodiac-pig.png': '生肖猪',
    '/icons/horse-cursor.png': '马蹄光标',
  };

  const getIconLabel = (icon: string) => iconLabels[icon] ?? '图标';

  const presetMessages = [
    '马到成功，万事如意！',
    '龙马精神，身体健康！',
    '红马年大吉大利！',
    '一马当先，事业腾飞！',
    '愿2026年红红火火！',
    '祝你马年行大运！',
  ];

  // Load blessings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('horse-year-blessings');
    if (saved) {
      setBlessings(JSON.parse(saved));
    } else {
      const defaultBlessings: Blessing[] = [
        { id: 1, name: '小明', message: '马到成功，万事如意！', icon: blessingIcons[0], likes: 12, timestamp: Date.now() - 100000 },
        { id: 2, name: '红红', message: '红马年大吉大利！', icon: blessingIcons[1], likes: 8, timestamp: Date.now() - 200000 },
        { id: 3, name: '阿杰', message: '龙马精神，身体健康！', icon: blessingIcons[2], likes: 15, timestamp: Date.now() - 300000 },
      ];
      setBlessings(defaultBlessings);
      localStorage.setItem('horse-year-blessings', JSON.stringify(defaultBlessings));
    }
  }, []);

  useEffect(() => {
    if (blessings.length > 0) {
      localStorage.setItem('horse-year-blessings', JSON.stringify(blessings));
    }
  }, [blessings]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    const newBlessing: Blessing = {
      id: Date.now(),
      name: name.trim(),
      message: message.trim(),
      icon: selectedIcon,
      likes: 0,
      timestamp: Date.now(),
    };

    setBlessings([newBlessing, ...blessings]);
    setName('');
    setMessage('');
  };

  const handleLike = (id: number) => {
    setBlessings(blessings.map(b => {
      if (b.id === id) {
        return {
          ...b,
          likes: b.isLiked ? b.likes - 1 : b.likes + 1,
          isLiked: !b.isLiked,
        };
      }
      return b;
    }));
  };

  const copyLink = async () => {
    const url = window.location.href;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = url;
        textarea.style.position = 'fixed';
        textarea.style.top = '0';
        textarea.style.left = '0';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('复制失败，请手动复制链接：', url);
    }
  };

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    return `${days}天前`;
  };

  return (
    <section 
      id="blessing" 
      ref={sectionRef}
      className="py-20 px-4"
    >
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <div className={`text-center mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="paper-badge mb-6">
            <img src="/icons/fortune-barrel.png" alt="祝福" className="w-5 h-5" />
            <span>祝福墙</span>
          </div>
          <h2 className="section-title">马年祝福互动墙</h2>
          <p className="font-sans-sc text-gray-600 mt-4 text-lg">
            留下你的祝福，与朋友分享红马年的好运！
          </p>
        </div>

        {/* Blessing Form */}
        <div className={`paper-card p-6 mb-8 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="blessing-name" className="font-calligraphy text-xl text-gray-700 mb-2 block">你的名字</label>
              <input
                id="blessing-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="输入你的名字..."
                className="paper-input w-full"
                maxLength={10}
              />
            </div>

            <div className="mb-4">
              <label className="font-calligraphy text-xl text-gray-700 mb-2 block">选择图标</label>
              <div className="flex flex-wrap gap-3">
                {blessingIcons.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setSelectedIcon(icon)}
                    aria-label={`选择图标：${getIconLabel(icon)}`}
                    aria-pressed={selectedIcon === icon}
                    className={`w-14 h-14 p-2 border-2 transition-all rounded-lg ${
                      selectedIcon === icon
                        ? 'border-red-600 bg-red-100'
                        : 'border-gray-300 bg-white hover:border-gray-400'
                    }`}
                  >
                    <img src={icon} alt="" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="blessing-message" className="font-calligraphy text-xl text-gray-700 mb-2 block">祝福话语</label>
              <textarea
                id="blessing-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="写下你的祝福..."
                className="paper-input w-full h-28 resize-none"
                maxLength={100}
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {presetMessages.map((msg) => (
                  <button
                    key={msg}
                    type="button"
                    onClick={() => setMessage(msg)}
                    aria-label={`使用预设祝福：${msg}`}
                    className="paper-chip"
                  >
                    {msg}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button type="submit" className="paper-btn flex-1">
                发送祝福
              </button>
              <button
                type="button"
                onClick={() => setShowShareDialog(true)}
                className="paper-btn paper-btn-gold px-6"
              >
                分享
              </button>
            </div>
          </form>
        </div>

        {/* Blessings List */}
        <div className={`space-y-4 transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h3 className="font-calligraphy text-2xl text-gray-800 mb-4">
            最新祝福 ({blessings.length})
          </h3>
          
          {blessings.map((blessing) => (
            <div
              key={blessing.id}
              className="paper-card p-4 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-red-100 to-amber-100 border-2 border-red-600 flex items-center justify-center flex-shrink-0 rounded-lg">
                  <img src={blessing.icon} alt="" className="w-10 h-10 object-contain" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-calligraphy text-lg text-gray-800">{blessing.name}</span>
                    <span className="font-sans-sc text-sm text-gray-500">{formatTime(blessing.timestamp)}</span>
                  </div>
                  <p className="font-sans-sc text-gray-700 leading-relaxed break-words">
                    {blessing.message}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleLike(blessing.id)}
                  aria-label={`${blessing.isLiked ? '取消点赞' : '点赞'}：${blessing.name}，当前${blessing.likes}个赞`}
                  aria-pressed={!!blessing.isLiked}
                  className={`flex flex-col items-center gap-1 px-3 py-2 border-2 rounded-lg transition-colors ${
                    blessing.isLiked
                      ? 'border-red-600 bg-red-100'
                      : 'border-gray-300 bg-white hover:border-red-400'
                  }`}
                >
                  <img 
                    src="/icons/zodiac-horse.png" 
                    alt="" 
                    className={`w-6 h-6 ${blessing.isLiked ? 'opacity-100' : 'opacity-50'}`} 
                  />
                  <span className="font-sans-sc text-sm">{blessing.likes}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Share Dialog */}
        <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
          <DialogContent className="paper-card border-4 border-red-600">
            <DialogHeader>
              <DialogTitle className="font-calligraphy text-2xl text-center">分享祝福墙</DialogTitle>
            </DialogHeader>
            <div className="p-4">
              <p className="font-sans-sc text-gray-600 mb-4 text-center">
                复制链接分享给朋友，一起来留下马年祝福吧！
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={window.location.href}
                  readOnly
                  className="paper-input flex-1 text-sm"
                  aria-label="分享链接"
                />
                <button
                  onClick={copyLink}
                  className={`paper-btn ${copied ? 'bg-green-600' : ''}`}
                  aria-label={copied ? '已复制' : '复制链接'}
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
              {copied && (
                <p className="font-sans-sc text-green-600 text-center mt-2">
                  链接已复制！
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default BlessingWall;
