import { useEffect, useMemo, useRef, useState } from 'react';
import { Copy, Search, Share2, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type LuckFilter = 'featured' | 'all' | 'super' | 'lucky' | 'medium' | 'low';

interface BlessingCategory {
  id: string;
  name: string;
  icon?: string;
  description?: string;
}

interface BlessingSign {
  id: string;
  title: string;
  subtitle?: string | null;
  content: string;
  poet?: string | null;
  poetSource?: string | null;
  categoryId: string;
  stars?: number | null;
  luckType?: string | null;
  luckyTime?: string | null;
  interpretation?: string | null;
  careerAdvice?: string | null;
  loveAdvice?: string | null;
  healthAdvice?: string | null;
  isFeatured?: boolean | null;
}

interface BlessingsData {
  categories: BlessingCategory[];
  blessings: BlessingSign[];
}

const PAGE_SIZE = 8;

function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function badgeForLuckType(luckType?: string | null) {
  const key = String(luckType || '').toUpperCase();
  if (key === 'SUPER_LUCKY') return { label: '上上签', className: 'bg-amber-100 text-amber-800 border-amber-400' };
  if (key === 'LUCKY') return { label: '上签', className: 'bg-red-100 text-red-700 border-red-400' };
  if (key === 'MEDIUM_LUCKY' || key === 'MEDIUM') return { label: '中签', className: 'bg-slate-100 text-slate-700 border-slate-300' };
  if (key === 'LOW_LUCKY') return { label: '下签', className: 'bg-neutral-100 text-neutral-700 border-neutral-300' };
  return { label: '祝福签', className: 'bg-amber-50 text-amber-900 border-amber-200' };
}

function matchesLuck(sign: BlessingSign, filter: LuckFilter) {
  if (filter === 'all') return true;
  if (filter === 'featured') return Boolean(sign.isFeatured);
  const lt = String(sign.luckType || '').toUpperCase();
  if (filter === 'super') return lt === 'SUPER_LUCKY';
  if (filter === 'lucky') return lt === 'LUCKY';
  if (filter === 'medium') return lt === 'MEDIUM_LUCKY' || lt === 'MEDIUM';
  if (filter === 'low') return lt === 'LOW_LUCKY';
  return true;
}

function includesText(sign: BlessingSign, q: string) {
  if (!q) return true;
  const needle = q.toLowerCase();
  const hay = [
    sign.title,
    sign.subtitle,
    sign.content,
    sign.poet,
    sign.poetSource,
    sign.interpretation,
    sign.careerAdvice,
    sign.loveAdvice,
    sign.healthAdvice,
    sign.luckyTime,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return hay.includes(needle);
}

function getBlessingParam() {
  if (typeof window === 'undefined') return null;
  const url = new URL(window.location.href);
  return url.searchParams.get('blessing');
}

function setBlessingParam(nextId: string | null, mode: 'push' | 'replace', state?: Record<string, unknown>) {
  const url = new URL(window.location.href);
  if (nextId) url.searchParams.set('blessing', nextId);
  else url.searchParams.delete('blessing');
  if (mode === 'push') window.history.pushState(state || null, '', url.toString());
  else window.history.replaceState(state || null, '', url.toString());
}

function buildShareUrl(blessingId: string) {
  const url = new URL(window.location.origin + window.location.pathname);
  url.searchParams.set('blessing', blessingId);
  return url.toString();
}

const FortuneBucket = () => {
  const [isShaking, setIsShaking] = useState(false);
  const [drawCount, setDrawCount] = useState(0);
  const [shakeHint, setShakeHint] = useState('点击摇签');
  const baseHintRef = useRef('点击摇签');
  const hintTimerRef = useRef<number | null>(null);
  const lastShakeTime = useRef(0);
  const sectionRef = useRef<HTMLElement>(null);
  const openedViaStateRef = useRef(false);

  const [data, setData] = useState<BlessingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [luck, setLuck] = useState<LuckFilter>('featured');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState<string | null>(() => getBlessingParam());

  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      baseHintRef.current = '点击或摇一摇手机';
      setShakeHint(baseHintRef.current);
    } else {
      baseHintRef.current = '点击摇签';
      setShakeHint(baseHintRef.current);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (hintTimerRef.current) window.clearTimeout(hintTimerRef.current);
    };
  }, []);

  const flashHint = (message: string) => {
    if (hintTimerRef.current) window.clearTimeout(hintTimerRef.current);
    setShakeHint(message);
    hintTimerRef.current = window.setTimeout(() => {
      setShakeHint(baseHintRef.current);
    }, 1200);
  };

  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (!isMobile) return;

    const requestMotionPermission = async () => {
      if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        try {
          const permission = await (DeviceMotionEvent as any).requestPermission();
          if (permission === 'granted') {
            startShakeDetection();
          }
        } catch (_) {
          //
        }
      } else {
        startShakeDetection();
      }
    };

    const startShakeDetection = () => {
      const handleMotion = (event: DeviceMotionEvent) => {
        const acceleration = event.accelerationIncludingGravity;
        if (!acceleration) return;

        const { x, y, z } = acceleration;
        if (x === null || y === null || z === null) return;

        // 计算加速度变化
        const accelerationMagnitude = Math.sqrt(x * x + y * y + z * z);
        const shakeThreshold = 25;

        if (accelerationMagnitude > shakeThreshold) {
          const now = Date.now();
          if (now - lastShakeTime.current > 2000) {
            lastShakeTime.current = now;
            drawBlessing();
          }
        }
      };

      window.addEventListener('devicemotion', handleMotion);
      
      return () => {
        window.removeEventListener('devicemotion', handleMotion);
      };
    };

    const handleFirstClick = () => {
      requestMotionPermission();
      document.removeEventListener('click', handleFirstClick);
    };
    document.addEventListener('click', handleFirstClick);

    return () => {
      document.removeEventListener('click', handleFirstClick);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setErrorMessage(null);
      try {
        const res = await fetch('/data/blessings.json', { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as BlessingsData;
        if (cancelled) return;
        setData(json);
      } catch (e) {
        if (cancelled) return;
        setErrorMessage(e instanceof Error ? e.message : '加载失败');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function onPopState() {
      const id = getBlessingParam();
      openedViaStateRef.current = false;
      setOpenId(id);
    }
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const categories = data?.categories ?? [];
  const blessings = data?.blessings ?? [];

  const categoryCountMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const b of blessings) map.set(b.categoryId, (map.get(b.categoryId) || 0) + 1);
    return map;
  }, [blessings]);

  const filtered = useMemo(() => {
    return blessings.filter((b) => {
      if (category && b.categoryId !== category) return false;
      if (!matchesLuck(b, luck)) return false;
      if (!includesText(b, q.trim())) return false;
      return true;
    });
  }, [blessings, category, luck, q]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = clampNumber(page, 1, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  useEffect(() => {
    if (safePage !== page) setPage(safePage);
  }, [page, safePage]);

  const current = useMemo(() => {
    if (!openId) return null;
    return blessings.find((b) => b.id === openId) || null;
  }, [blessings, openId]);

  useEffect(() => {
    if (loading) return;
    if (!openId) return;
    if (current) return;
    openedViaStateRef.current = false;
    setBlessingParam(null, 'replace');
    setOpenId(null);
  }, [current, loading, openId]);

  const openBlessing = (id: string) => {
    openedViaStateRef.current = true;
    setBlessingParam(id, 'push', { blessingModal: true });
    setOpenId(id);
  };

  const closeBlessing = () => {
    if (openedViaStateRef.current && window.history.state && (window.history.state as any).blessingModal) {
      window.history.back();
      return;
    }
    setBlessingParam(null, 'replace');
    setOpenId(null);
  };

  const drawBlessing = () => {
    if (isShaking) return;
    if (loading) {
      flashHint('正在加载签文…');
      return;
    }
    if (errorMessage) {
      flashHint('签文加载失败');
      return;
    }
    if (!blessings.length) {
      flashHint('暂无签文数据');
      return;
    }

    setIsShaking(true);
    setTimeout(() => {
      const next = blessings[Math.floor(Math.random() * blessings.length)];
      openBlessing(next.id);
      setIsShaking(false);
      setDrawCount((prev) => prev + 1);
    }, 250);
  };

  const luckFilters: Array<{ id: LuckFilter; label: string }> = [
    { id: 'featured', label: '推荐' },
    { id: 'all', label: '全部' },
    { id: 'super', label: '上上签' },
    { id: 'lucky', label: '上签' },
    { id: 'medium', label: '中签' },
    { id: 'low', label: '下签' },
  ];

  return (
    <section id="fortune" ref={sectionRef} className="py-20 px-4 relative">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="paper-badge mb-6">
            <img src="/icons/fortune-stick.png" alt="福签" className="w-5 h-5" />
            <span>祈福求签</span>
          </div>
          <h2 className="section-title">新年福签桶</h2>
          <p className="font-sans-sc text-gray-600 mt-4 text-lg">
            点击签筒抽一签，也可以在下方浏览与搜索祝福签
          </p>
        </div>

        <div className="paper-card p-8 text-center">
          <div className="relative inline-block">
            <button
              type="button"
              className={`relative transition-transform select-none ${
                isShaking ? 'animate-paper-shake' : 'hover:scale-105'
              }`}
              onClick={drawBlessing}
              aria-label="点击抽一签"
            >
              <img
                src="/icons/fortune-barrel.png"
                alt="签筒"
                className="w-48 h-48 object-contain mx-auto pointer-events-none"
              />

              <div className="absolute top-0 left-1/2 -translate-x-1/2 flex gap-1 pointer-events-none">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-3 h-12 bg-gradient-to-b from-red-600 to-red-800 rounded-t"
                    style={{
                      transform: `rotate(${(i - 2) * 5}deg)`,
                      height: `${40 + Math.random() * 20}px`,
                    }}
                  />
                ))}
              </div>
            </button>

            {!isShaking && (
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <span className="font-calligraphy text-red-600 text-xl animate-pulse">
                  {shakeHint}
                </span>
              </div>
            )}
          </div>

          <div className="mt-12 grid grid-cols-3 gap-4">
            {[
              { step: '1', text: '点击签筒' },
              { step: '2', text: '诚心摇签' },
              { step: '3', text: '查看运势' },
            ].map((item) => (
              <div key={item.step} className="paper-card py-4">
                <div className="w-10 h-10 mx-auto mb-2 bg-red-600 text-white font-calligraphy text-xl flex items-center justify-center rounded-full">
                  {item.step}
                </div>
                <p className="font-sans-sc text-gray-700">{item.text}</p>
              </div>
            ))}
          </div>

          {drawCount > 0 && (
            <p className="mt-6 font-sans-sc text-gray-500">
              已累计求签 <span className="text-red-600 font-bold">{drawCount}</span> 次
            </p>
          )}
        </div>

        <div className="mt-16">
          <div className="text-center mb-10">
            <h3 className="font-calligraphy text-3xl text-red-700">马年祝福签</h3>
          </div>

          <div className="paper-card p-6 md:p-8">
            <div className="flex flex-col gap-4 md:gap-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    className={`paper-chip font-calligraphy text-base border-2 ${category === null ? 'bg-red-600 text-white border-red-700' : 'text-gray-800'}`}
                    onClick={() => {
                      setCategory(null);
                      setPage(1);
                    }}
                    aria-pressed={category === null}
                  >
                    全部分类
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className={`paper-chip font-calligraphy text-base border-2 ${
                        category === c.id ? 'bg-red-600 text-white border-red-700' : 'text-gray-800'
                      }`}
                      onClick={() => {
                        setCategory(c.id);
                        setPage(1);
                      }}
                      aria-pressed={category === c.id}
                    >
                      {c.name}
                      <span className="ml-2 text-xs opacity-80">({categoryCountMap.get(c.id) || 0})</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto] md:items-center">
                <label className="relative">
                  <span className="sr-only">搜索祝福签</span>
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-500" aria-hidden="true" />
                  <input
                    className="paper-input w-full pl-10"
                    type="search"
                    value={q}
                    onChange={(e) => {
                      setQ(e.target.value);
                      setPage(1);
                    }}
                    placeholder="搜索：马到成功、财源滚滚..."
                    autoComplete="off"
                  />
                </label>

                <div className="flex flex-wrap gap-2 justify-start md:justify-end">
                  {luckFilters.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      className={`paper-chip font-calligraphy text-base border-2 ${luck === f.id ? 'bg-amber-500 text-black border-amber-600' : 'text-gray-800'}`}
                      onClick={() => {
                        setLuck(f.id);
                        setPage(1);
                      }}
                      aria-pressed={luck === f.id}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {loading && (
                  <div className="paper-card p-6 md:col-span-2 text-center">
                    <div className="font-sans-sc text-gray-700">正在加载祝福签…</div>
                  </div>
                )}

                {!loading && errorMessage && (
                  <div className="paper-card p-6 md:col-span-2 text-center">
                    <div className="font-sans-sc text-red-700">加载失败：{errorMessage}</div>
                    <div className="font-sans-sc text-gray-600 mt-2">请确认 /public/data/blessings.json 存在且可访问。</div>
                  </div>
                )}

                {!loading && !errorMessage && !pageItems.length && (
                  <div className="paper-card p-6 md:col-span-2 text-center">
                    <div className="font-sans-sc text-gray-700">没有匹配的祝福签</div>
                    <div className="font-sans-sc text-gray-600 mt-2">换个关键词，或切换分类/签运试试。</div>
                  </div>
                )}

                {!loading &&
                  !errorMessage &&
                  pageItems.map((b) => {
                    const cat = categories.find((c) => c.id === b.categoryId);
                    const badge = badgeForLuckType(b.luckType);
                    return (
                      <button
                        key={b.id}
                        type="button"
                        className="paper-card p-5 text-left hover:translate-y-[-1px] transition-transform"
                        onClick={() => openBlessing(b.id)}
                        aria-label={`打开祝福签：${b.title}`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className={`inline-flex items-center px-3 py-1 border rounded-full text-sm font-sans-sc ${badge.className}`}>
                            {badge.label}
                          </span>
                          <div className="text-xs font-sans-sc text-gray-600">{cat?.name || '未分类'}</div>
                        </div>
                        <div className="mt-3">
                          <div className="font-calligraphy text-2xl text-red-700">{b.title}</div>
                          {b.subtitle ? <div className="font-sans-sc text-gray-700 mt-1">{b.subtitle}</div> : null}
                        </div>
                        <div className="font-sans-sc text-gray-800 mt-3 leading-relaxed">“{b.content}”</div>
                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs font-sans-sc text-gray-600">
                          {b.luckyTime ? <span>吉时 {b.luckyTime}</span> : null}
                          {b.poetSource || b.poet ? <span>—— {b.poetSource || b.poet}</span> : null}
                        </div>
                      </button>
                    );
                  })}
              </div>

              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="font-sans-sc text-sm text-gray-700">
                  共 {filtered.length} 条 · 第 {safePage} / {totalPages} 页
                </div>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" disabled={safePage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                    上一页
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={safePage >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    下一页
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <Dialog open={Boolean(current)} onOpenChange={(open) => (!open ? closeBlessing() : undefined)}>
            <DialogContent className="paper-card border-4 border-red-600 max-w-xl w-full max-h-[90vh] overflow-y-auto">
              {current ? (
                <>
                  <DialogHeader className="border-b-2 border-red-100 pb-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center px-3 py-1 border rounded-full text-sm font-sans-sc ${badgeForLuckType(
                              current.luckType
                            ).className}`}
                          >
                            {badgeForLuckType(current.luckType).label}
                          </span>
                          <span className="font-sans-sc text-sm text-gray-600">
                            {(categories.find((c) => c.id === current.categoryId)?.name || '未分类') +
                              (current.luckyTime ? ` · 吉时 ${current.luckyTime}` : '')}
                          </span>
                        </div>
                        <DialogTitle className="font-calligraphy text-3xl text-red-700 mt-3">{current.title}</DialogTitle>
                        {current.subtitle ? <div className="font-sans-sc text-gray-700 mt-2">{current.subtitle}</div> : null}
                      </div>
                      <button type="button" onClick={closeBlessing} className="paper-chip border-2" aria-label="关闭">
                        <X className="size-4" aria-hidden="true" />
                      </button>
                    </div>
                  </DialogHeader>

                  <div className="mt-5 space-y-4">
                    <div className="font-sans-sc text-gray-900 leading-relaxed text-lg">“{current.content}”</div>
                    {current.poetSource || current.poet ? (
                      <div className="font-sans-sc text-gray-600">—— {current.poetSource || current.poet}</div>
                    ) : null}
                    {current.interpretation ? (
                      <div className="paper-card p-4 border-2 border-amber-200">
                        <div className="font-calligraphy text-xl text-red-700">解读</div>
                        <div className="font-sans-sc text-gray-800 mt-2 leading-relaxed">{current.interpretation}</div>
                      </div>
                    ) : null}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {current.careerAdvice ? (
                        <div className="paper-card p-4 border-2 border-red-100">
                          <div className="font-calligraphy text-lg text-red-700">事业</div>
                          <div className="font-sans-sc text-gray-800 mt-2 leading-relaxed">{current.careerAdvice}</div>
                        </div>
                      ) : null}
                      {current.loveAdvice ? (
                        <div className="paper-card p-4 border-2 border-red-100">
                          <div className="font-calligraphy text-lg text-red-700">感情</div>
                          <div className="font-sans-sc text-gray-800 mt-2 leading-relaxed">{current.loveAdvice}</div>
                        </div>
                      ) : null}
                      {current.healthAdvice ? (
                        <div className="paper-card p-4 border-2 border-red-100">
                          <div className="font-calligraphy text-lg text-red-700">健康</div>
                          <div className="font-sans-sc text-gray-800 mt-2 leading-relaxed">{current.healthAdvice}</div>
                        </div>
                      ) : null}
                    </div>

                    <div className="flex flex-col md:flex-row gap-2 md:items-center md:justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={async () => {
                          const text = `${current.title}\n\n“${current.content}”\n${
                            current.poetSource ? `—— ${current.poetSource}\n\n` : '\n'
                          }马年祝福签：${buildShareUrl(current.id)}`;
                          await navigator.clipboard.writeText(text);
                        }}
                      >
                        <Copy className="size-4" aria-hidden="true" />
                        复制祝福
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={async () => {
                          const url = buildShareUrl(current.id);
                          const text = `“${current.content}”`;
                          if ((navigator as any).share) {
                            try {
                              await (navigator as any).share({ title: current.title, text, url });
                              return;
                            } catch (_) {}
                          }
                          await navigator.clipboard.writeText(url);
                        }}
                      >
                        <Share2 className="size-4" aria-hidden="true" />
                        分享链接
                      </Button>
                    </div>
                  </div>
                </>
              ) : null}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </section>
  );
};

export default FortuneBucket;
