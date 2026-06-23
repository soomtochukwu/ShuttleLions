'use client';

import { useEffect, useState } from 'react';

interface Shuttlecock {
  id: number;
  left: string;
  size: string;
  duration: string;
  delay: string;
}

export function FloatingShuttlecocks() {
  const [shuttles, setShuttles] = useState<Shuttlecock[]>([]);

  useEffect(() => {
    // Generate static list of shuttlecocks to prevent continuous state churn
    const items = Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: `${0.8 + Math.random() * 1.2}rem`,
      duration: `${6 + Math.random() * 6}s`,
      delay: `${Math.random() * 8}s`,
    }));
    setShuttles(items);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {shuttles.map((shuttle) => (
        <span
          key={shuttle.id}
          className="floating-shuttlecock block"
          style={{
            left: shuttle.left,
            fontSize: shuttle.size,
            animationDuration: shuttle.duration,
            animationDelay: shuttle.delay,
            animationIterationCount: 'infinite',
            bottom: '-50px',
          }}
        >
          🏸
        </span>
      ))}
    </div>
  );
}
export default FloatingShuttlecocks;
