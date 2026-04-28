import React, { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  speed: number;
  text: string;
  opacity: number;
  fontSize: number;
}

const TOKENS = ['{}', '()', '</>', 'const', '=>', 'import', 'async', 'await', '||', '&&', '[]', '??', '...'];

export default function CodeRain({ speedFactor = 1 }: { speedFactor?: number }) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const particleCount = 30;
    const initialParticles: Particle[] = Array.from({ length: particleCount }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      speed: 0.1 + Math.random() * 0.3,
      text: TOKENS[Math.floor(Math.random() * TOKENS.length)],
      opacity: 0.02 + Math.random() * 0.03, // Max 5% opacity
      fontSize: 10 + Math.random() * 14,
    }));

    setParticles(initialParticles);

    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = (time: number) => {
      const deltaTime = time - lastTime;
      lastTime = time;

      setParticles((prevParticles) =>
        prevParticles.map((p) => {
          let newY = p.y - p.speed * (deltaTime / 16) * speedFactor;
          if (newY < -10) {
            newY = 110;
            p.x = Math.random() * 100;
            p.text = TOKENS[Math.floor(Math.random() * TOKENS.length)];
          }
          return { ...p, y: newY };
        })
      );

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [speedFactor]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute font-mono text-white transition-opacity duration-1000"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            opacity: p.opacity,
            fontSize: `${p.fontSize}px`,
          }}
        >
          {p.text}
        </div>
      ))}
    </div>
  );
}
