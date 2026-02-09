import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  opacity: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
}

const Particles = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
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

    const colors = ['#dc2626', '#f59e0b', '#fbbf24', '#ef4444', '#f97316'];

    const initParticles = () => {
      particlesRef.current = [];
      const particleCount = Math.min(isCoarsePointer ? 24 : 50, Math.floor(viewWidth / 30));
      
      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push({
          x: Math.random() * viewWidth,
          y: Math.random() * viewHeight,
          size: Math.random() * 8 + 4,
          speedY: Math.random() * 0.5 + 0.2,
          speedX: (Math.random() - 0.5) * 0.3,
          opacity: Math.random() * 0.5 + 0.3,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.02,
        });
      }
    };
    initParticles();

    const drawParticle = (particle: Particle) => {
      ctx.save();
      ctx.translate(particle.x, particle.y);
      ctx.rotate(particle.rotation);
      ctx.globalAlpha = particle.opacity;
      
      // Draw a simple shape based on particle type
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      
      // Draw a star-like shape
      for (let i = 0; i < 5; i++) {
        const angle = (i * Math.PI * 2) / 5;
        const x = Math.cos(angle) * particle.size;
        const y = Math.sin(angle) * particle.size;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.fill();
      
      ctx.restore();
    };

    const updateParticles = () => {
      particlesRef.current.forEach((particle) => {
        particle.y += particle.speedY;
        particle.x += particle.speedX;
        particle.rotation += particle.rotationSpeed;

        if (particle.y > viewHeight) {
          particle.y = -particle.size;
          particle.x = Math.random() * viewWidth;
        }
        if (particle.x < -particle.size) {
          particle.x = viewWidth + particle.size;
        }
        if (particle.x > viewWidth + particle.size) {
          particle.x = -particle.size;
        }
      });
    };

    const animate = (time: number) => {
      if (time - lastFrameTime >= frameInterval) {
        lastFrameTime = time;
        ctx.clearRect(0, 0, viewWidth, viewHeight);
        updateParticles();
        particlesRef.current.forEach(drawParticle);
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
      className="particle-canvas"
      style={{ background: 'transparent' }}
    />
  );
};

export default Particles;
