import { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

const externalUrls = (import.meta.env.VITE_MUSIC_URLS ?? '')
  .split(',')
  .map((v: string) => v.trim())
  .filter(Boolean);

type Step = {
  note: number | null;
  beats: number;
};

type Track = {
  name: string;
  tempo: number;
  pattern: Step[];
  waveform: OscillatorType;
};

const tracks: Track[] = [
  {
    name: '复古新年·八音阶',
    tempo: 108,
    waveform: 'square',
    pattern: [
      { note: 72, beats: 1 },
      { note: 74, beats: 1 },
      { note: 76, beats: 1 },
      { note: 79, beats: 1 },
      { note: 76, beats: 1 },
      { note: 74, beats: 1 },
      { note: 72, beats: 1 },
      { note: 67, beats: 1 },
      { note: 69, beats: 1 },
      { note: 72, beats: 1 },
      { note: 74, beats: 1 },
      { note: 76, beats: 1 },
      { note: 74, beats: 1 },
      { note: 72, beats: 1 },
      { note: 69, beats: 1 },
      { note: 67, beats: 1 },
    ],
  },
  {
    name: '复古新年·五声音阶',
    tempo: 96,
    waveform: 'triangle',
    pattern: [
      { note: 72, beats: 1 },
      { note: 74, beats: 1 },
      { note: 79, beats: 1 },
      { note: 81, beats: 1 },
      { note: 79, beats: 1 },
      { note: 74, beats: 1 },
      { note: 72, beats: 1 },
      { note: 69, beats: 1 },
      { note: 67, beats: 1 },
      { note: 69, beats: 1 },
      { note: 72, beats: 2 },
      { note: null, beats: 1 },
      { note: 74, beats: 1 },
      { note: 72, beats: 2 },
      { note: null, beats: 1 },
    ],
  },
  {
    name: '复古新年·鼓点循环',
    tempo: 120,
    waveform: 'square',
    pattern: [
      { note: 48, beats: 0.5 },
      { note: null, beats: 0.5 },
      { note: 48, beats: 0.5 },
      { note: null, beats: 0.5 },
      { note: 55, beats: 0.5 },
      { note: null, beats: 0.5 },
      { note: 48, beats: 0.5 },
      { note: null, beats: 0.5 },
      { note: 48, beats: 0.5 },
      { note: null, beats: 0.5 },
      { note: 55, beats: 0.5 },
      { note: null, beats: 0.5 },
      { note: 60, beats: 0.5 },
      { note: null, beats: 0.5 },
      { note: 55, beats: 0.5 },
      { note: null, beats: 0.5 },
    ],
  },
];

function midiToFrequency(note: number) {
  return 440 * Math.pow(2, (note - 69) / 12);
}

const BackgroundMusic = () => {
  const isExternalMode = externalUrls.length > 0;
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const timerRef = useRef<number | null>(null);
  const nextNoteTimeRef = useRef(0);
  const stepIndexRef = useRef(0);
  const toastTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = null;
      if (masterGainRef.current) {
        masterGainRef.current.gain.value = 0;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
        masterGainRef.current = null;
      }
    };
  }, []);

  const stop = async () => {
    if (isExternalMode) {
      if (audioRef.current) audioRef.current.pause();
      return;
    }
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
    if (masterGainRef.current && audioContextRef.current) {
      const t = audioContextRef.current.currentTime;
      masterGainRef.current.gain.cancelScheduledValues(t);
      masterGainRef.current.gain.setValueAtTime(masterGainRef.current.gain.value, t);
      masterGainRef.current.gain.linearRampToValueAtTime(0, t + 0.05);
    }
    if (audioContextRef.current && audioContextRef.current.state === 'running') {
      await audioContextRef.current.suspend().catch(() => {});
    }
  };

  const ensureContext = async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
      masterGainRef.current = audioContextRef.current.createGain();
      masterGainRef.current.gain.value = 0.22;
      masterGainRef.current.connect(audioContextRef.current.destination);
    }
    if (audioContextRef.current.state !== 'running') {
      await audioContextRef.current.resume();
    }
  };

  const scheduleStep = (ctx: AudioContext, track: Track, step: Step, startTime: number) => {
    const beatSeconds = 60 / track.tempo;
    const duration = Math.max(0.05, step.beats * beatSeconds);
    if (!step.note) return duration;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = track.waveform;
    osc.frequency.setValueAtTime(midiToFrequency(step.note), startTime);

    const peak = track.waveform === 'square' ? 0.08 : 0.1;
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(peak, startTime + 0.01);
    gain.gain.linearRampToValueAtTime(0, startTime + duration - 0.02);

    osc.connect(gain);
    gain.connect(masterGainRef.current as GainNode);

    osc.start(startTime);
    osc.stop(startTime + duration);
    osc.onended = () => {
      try {
        gain.disconnect();
        osc.disconnect();
      } catch (_) {}
    };

    return duration;
  };

  const start = async (trackIndex = currentTrack) => {
    if (isExternalMode) {
      const url = externalUrls[trackIndex];
      if (!url) return false;
      if (!audioRef.current) {
        audioRef.current = new Audio(url);
        audioRef.current.loop = true;
        audioRef.current.preload = 'auto';
        audioRef.current.crossOrigin = 'anonymous';
      } else if (audioRef.current.src !== url) {
        audioRef.current.src = url;
      }
      audioRef.current.volume = 0.35;
      try {
        await audioRef.current.play();
      } catch (_) {
        setShowTooltip(true);
        setTimeout(() => setShowTooltip(false), 3000);
        return false;
      }
      return true;
    }

    const track = tracks[trackIndex];
    try {
      await ensureContext();
    } catch (_) {
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 3000);
      return false;
    }

    const ctx = audioContextRef.current as AudioContext;
    if (masterGainRef.current) masterGainRef.current.gain.value = 0.22;

    stepIndexRef.current = 0;
    nextNoteTimeRef.current = ctx.currentTime + 0.05;

    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      if (!audioContextRef.current || !masterGainRef.current) return;
      const now = audioContextRef.current.currentTime;
      while (nextNoteTimeRef.current < now + 0.25) {
        const step = track.pattern[stepIndexRef.current];
        const dur = scheduleStep(audioContextRef.current, track, step, nextNoteTimeRef.current);
        nextNoteTimeRef.current += dur;
        stepIndexRef.current = (stepIndexRef.current + 1) % track.pattern.length;
      }
    }, 25);

    return true;
  };

  const togglePlay = async () => {
    if (isPlaying) {
      await stop();
      setIsPlaying(false);
      return;
    }
    const ok = await start();
    setIsPlaying(ok);
  };

  const showToast = (message: string) => {
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    setToast(message);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 1200);
  };

  const nextTrack = async () => {
    const wasPlaying = isPlaying;
    const totalTracks = isExternalMode ? externalUrls.length : tracks.length;
    const nextIndex = (currentTrack + 1) % Math.max(1, totalTracks);
    await stop();
    setCurrentTrack(nextIndex);
    setIsPlaying(false);
    const nextName = isExternalMode ? decodeURIComponent(externalUrls[nextIndex].split('/').pop() ?? '外链音乐') : tracks[nextIndex].name;
    showToast(`已切换：${nextName}`);
    if (wasPlaying) {
      const ok = await start(nextIndex);
      setIsPlaying(ok);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={togglePlay}
        onDoubleClick={nextTrack}
        className={`music-control ${isPlaying ? 'playing' : ''}`}
        title={isPlaying ? '双击切换下一首' : '点击播放音乐'}
        aria-label={isPlaying ? '暂停音乐（双击切换下一首）' : '播放音乐'}
        aria-pressed={isPlaying}
      >
        {isPlaying ? (
          <Volume2 className="w-6 h-6 text-white" />
        ) : (
          <VolumeX className="w-6 h-6 text-white" />
        )}
      </button>

      {!showTooltip && !isPlaying && (
        <div className="absolute bottom-full right-0 mb-3 flex flex-col items-end gap-2 pointer-events-none">
          <div className="bg-black/70 text-white px-3 py-1 rounded-md shadow-lg font-sans-sc text-xs">
            双击换曲
          </div>
        </div>
      )}
      
      {showTooltip && (
        <div className="absolute bottom-full right-0 mb-3 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 font-sans-sc text-sm w-max max-w-[260px]">
          请点击页面任意处后，再点击播放按钮
        </div>
      )}

      {toast && (
        <div className="absolute top-full right-0 mt-3 bg-amber-100 border-2 border-red-600 px-4 py-2 rounded-lg shadow-lg z-50 w-max max-w-[260px]">
          <p className="font-sans-sc text-sm text-gray-800">{toast}</p>
        </div>
      )}
      
      {isPlaying && (
        <div className="absolute bottom-full right-0 mb-3 bg-amber-100 border-2 border-red-600 px-4 py-2 rounded-lg shadow-lg z-50 w-max max-w-[260px]">
          <p className="font-calligraphy text-red-600 text-lg">
            正在播放:{' '}
            {isExternalMode
              ? decodeURIComponent(externalUrls[currentTrack].split('/').pop() ?? '外链音乐')
              : tracks[currentTrack].name}
          </p>
          <p className="font-sans-sc text-xs text-gray-600 mt-1">
            双击图标切换下一首
          </p>
        </div>
      )}
    </div>
  );
};

export default BackgroundMusic;
