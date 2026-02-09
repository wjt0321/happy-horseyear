import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  color: string;
  size: number;
}

interface Firework {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  color: string;
  exploded: boolean;
  particles: Particle[];
}

const Fireworks = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fireworksRef = useRef<Firework[]>([]);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const targetFps = 30;
    const frameInterval = 1000 / targetFps;
    let lastFrameTime = 0;
    let viewWidth = window.innerWidth;
    let viewHeight = window.innerHeight;

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      viewWidth = window.innerWidth;
      viewHeight = window.innerHeight;
      canvas.width = Math.floor(viewWidth * dpr);
      canvas.height = Math.floor(viewHeight * dpr);
      canvas.style.width = `${viewWidth}px`;
      canvas.style.height = `${viewHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, viewWidth, viewHeight);
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const colors = ['#dc2626', '#f59e0b', '#fbbf24', '#ef4444', '#f97316', '#fde047'];

    const createFirework = (): Firework => {
      const x = Math.random() * viewWidth;
      const y = viewHeight;
      const vx = (Math.random() - 0.5) * 4;
      const vy = -(Math.random() * 5 + 12);
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      return {
        x,
        y,
        vx,
        vy,
        alpha: 1,
        color,
        exploded: false,
        particles: [],
      };
    };

    const createParticles = (x: number, y: number, color: string): Particle[] => {
      const particles: Particle[] = [];
      const particleCount = Math.random() * 20 + 20;
      
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount;
        const speed = Math.random() * 4 + 2;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          color,
          size: Math.random() * 3 + 1,
        });
      }
      return particles;
    };

    const updateFireworks = () => {
      if (Math.random() < 0.03) {
        fireworksRef.current.push(createFirework());
      }

      fireworksRef.current = fireworksRef.current.filter((firework) => {
        if (!firework.exploded) {
          firework.x += firework.vx;
          firework.y += firework.vy;
          firework.vy += 0.2; // gravity

          if (firework.vy >= 0) {
            firework.exploded = true;
            firework.particles = createParticles(firework.x, firework.y, firework.color);
          }
        } else {
          firework.particles = firework.particles.filter((particle) => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.1; // gravity
            particle.alpha -= 0.015;
            return particle.alpha > 0;
          });

          if (firework.particles.length === 0) {
            return false;
          }
        }
        return true;
      });
    };

    const drawFireworks = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.fillRect(0, 0, viewWidth, viewHeight);

      fireworksRef.current.forEach((firework) => {
        if (!firework.exploded) {
          ctx.beginPath();
          ctx.arc(firework.x, firework.y, 3, 0, Math.PI * 2);
          ctx.fillStyle = firework.color;
          ctx.fill();
        } else {
          firework.particles.forEach((particle) => {
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fillStyle = particle.color;
            ctx.globalAlpha = particle.alpha;
            ctx.fill();
            ctx.globalAlpha = 1;
          });
        }
      });
    };

    const animate = (time: number) => {
      if (time - lastFrameTime >= frameInterval) {
        lastFrameTime = time;
        updateFireworks();
        drawFireworks();
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    const start = () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      animationRef.current = requestAnimationFrame(animate);
    };

    const stop = () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        stop();
      } else {
        start();
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    start();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      stop();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fireworks-canvas"
      style={{ background: 'transparent' }}
    />
  );
};

export default Fireworks;
