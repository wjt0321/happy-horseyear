import { useEffect, useState } from 'react';

interface ClickParticle {
  id: number;
  x: number;
  y: number;
  color: string;
}

const ClickEffect = () => {
  const [particles, setParticles] = useState<ClickParticle[]>([]);
  const colors = ['#dc2626', '#f59e0b', '#fbbf24', '#ef4444', '#f97316'];

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const newParticle: ClickParticle = {
        id: Date.now(),
        x: e.clientX,
        y: e.clientY,
        color: colors[Math.floor(Math.random() * colors.length)],
      };
      
      setParticles((prev) => [...prev, newParticle]);
      
      // Remove particle after animation
      setTimeout(() => {
        setParticles((prev) => prev.filter((p) => p.id !== newParticle.id));
      }, 500);
    };

    document.addEventListener('click', handleClick);
    
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <>
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="click-effect"
          style={{
            left: particle.x - 15,
            top: particle.y - 15,
            background: `radial-gradient(circle, ${particle.color} 0%, transparent 70%)`,
          }}
        />
      ))}
    </>
  );
};

export default ClickEffect;
