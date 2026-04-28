import React, { useEffect, useState } from 'react';
import { Star, GitFork } from 'lucide-react';

interface OdometerStatsProps {
  stars: number;
  forks: number;
}

function AnimatedNumber({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTimestamp: number;
    const duration = 1500; // 1.5 seconds

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Easing function: easeOutExpo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      setDisplayValue(Math.floor(easeProgress * value));
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [value]);

  return <span className="font-mono tabular-nums">{displayValue.toLocaleString()}</span>;
}

export default function OdometerStats({ stars, forks }: OdometerStatsProps) {
  if (stars === 0 && forks === 0) return null;

  return (
    <div className="flex items-center gap-6 px-4 py-2 bg-dark-surface-elevated/50 backdrop-blur-md border border-border-default rounded-full mx-auto w-fit mt-4">
      <div className="flex items-center gap-2 text-text-primary">
        <Star className="w-4 h-4 text-warning fill-warning/20" />
        <span className="text-sm font-medium">
          <AnimatedNumber value={stars} />
        </span>
      </div>
      <div className="w-[1px] h-4 bg-border-default"></div>
      <div className="flex items-center gap-2 text-text-primary">
        <GitFork className="w-4 h-4 text-accent-primary" />
        <span className="text-sm font-medium">
          <AnimatedNumber value={forks} />
        </span>
      </div>
    </div>
  );
}
