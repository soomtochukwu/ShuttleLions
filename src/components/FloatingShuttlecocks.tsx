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
          <svg
            className="opacity-20 text-sl-green"
            style={{ width: shuttle.size, height: shuttle.size }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
            <line x1="16" y1="8" x2="2" y2="22" />
            <line x1="17.5" y1="15" x2="9" y2="15" />
          </svg>
 </span>
 ))}
 </div>
 );
}
export default FloatingShuttlecocks;
