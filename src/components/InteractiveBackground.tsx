'use client';

import { useEffect, useRef, useState } from 'react';

// Custom Racket Component centered on its head (0,0)
const Racket = ({ x, y, rotation, active }: { x: number; y: number; rotation: number; active: boolean }) => {
  const glowColor = active ? 'var(--sl-green-glow)' : 'var(--sl-green)';
  const opacity = active ? 0.85 : 0.18;

  return (
    <g
      transform={`translate(${x}, ${y}) rotate(${rotation})`}
      className="transition-all duration-500 ease-out"
      style={{ opacity }}
    >
      {/* Glow highlight if active */}
      {active && (
        <ellipse
          cx="0"
          cy="0"
          rx="45"
          ry="55"
          fill="none"
          stroke="var(--sl-green-glow)"
          strokeWidth="8"
          className="blur-[6px] opacity-35"
        />
      )}

      {/* Racket Head Frame */}
      <ellipse
        cx="0"
        cy="0"
        rx="30"
        ry="38"
        fill="rgba(0, 0, 0, 0.05)"
        stroke={glowColor}
        strokeWidth="3.5"
      />

      {/* Grid Strings */}
      {/* Verticals */}
      <line x1="-18" y1="-25" x2="-18" y2="25" stroke={glowColor} strokeWidth="1" opacity="0.5" />
      <line x1="-9" y1="-34" x2="-9" y2="34" stroke={glowColor} strokeWidth="1" opacity="0.5" />
      <line x1="0" y1="-38" x2="0" y2="38" stroke={glowColor} strokeWidth="1.5" opacity="0.7" />
      <line x1="9" y1="-34" x2="9" y2="34" stroke={glowColor} strokeWidth="1" opacity="0.5" />
      <line x1="18" y1="-25" x2="18" y2="25" stroke={glowColor} strokeWidth="1" opacity="0.5" />

      {/* Horizontals */}
      <line x1="-25" y1="-20" x2="25" y2="-20" stroke={glowColor} strokeWidth="1" opacity="0.5" />
      <line x1="-28" y1="-10" x2="28" y2="-10" stroke={glowColor} strokeWidth="1" opacity="0.5" />
      <line x1="-30" y1="0" x2="30" y2="0" stroke={glowColor} strokeWidth="1.5" opacity="0.7" />
      <line x1="-28" y1="10" x2="28" y2="10" stroke={glowColor} strokeWidth="1" opacity="0.5" />
      <line x1="-25" y1="20" x2="25" y2="20" stroke={glowColor} strokeWidth="1" opacity="0.5" />

      {/* Shaft */}
      <line x1="0" y1="38" x2="0" y2="100" stroke={glowColor} strokeWidth="3" />

      {/* Handle / Grip */}
      <rect
        x="-5.5"
        y="100"
        width="11"
        height="35"
        fill="var(--sl-foreground)"
        stroke={glowColor}
        strokeWidth="1.5"
        rx="2"
      />
      {/* Grip details */}
      <line x1="-5" y1="110" x2="5" y2="114" stroke="var(--sl-muted)" strokeWidth="1.5" opacity="0.5" />
      <line x1="-5" y1="120" x2="5" y2="124" stroke="var(--sl-muted)" strokeWidth="1.5" opacity="0.5" />
    </g>
  );
};

// Stylized Shuttlecock Vector
const Shuttlecock = ({ x, y, rotation }: { x: number; y: number; rotation: number }) => {
  return (
    <g
      transform={`translate(${x}, ${y}) rotate(${rotation})`}
      className="filter drop-shadow-[0_0_10px_var(--sl-green-glow)] transition-transform duration-75 ease-out"
    >
      {/* Feathers skirt cone */}
      <path
        d="M -12,-15 L -22,22 L 22,22 L 12,-15 Z"
        fill="rgba(255, 255, 255, 0.9)"
        stroke="var(--sl-green-glow)"
        strokeWidth="2.5"
      />
      {/* Feathers spine details */}
      <line x1="-5" y1="-15" x2="-11" y2="22" stroke="var(--sl-green)" strokeWidth="1.2" opacity="0.7" />
      <line x1="0" y1="-15" x2="0" y2="22" stroke="var(--sl-green)" strokeWidth="1.5" opacity="0.8" />
      <line x1="5" y1="-15" x2="11" y2="22" stroke="var(--sl-green)" strokeWidth="1.2" opacity="0.7" />

      {/* Feathers reinforcing bands */}
      <path d="M -15.5,5 C -7.5,7 7.5,7 15.5,5" fill="none" stroke="var(--sl-green)" strokeWidth="1.8" />
      <path d="M -18.5,13.5 C -9.5,15.5 9.5,15.5 18.5,13.5" fill="none" stroke="var(--sl-green)" strokeWidth="1.8" />

      {/* Rounded Cork Base */}
      <path
        d="M -12,-15 C -12,-28 12,-28 12,-15 Z"
        fill="#FFFFFF"
        stroke="var(--sl-green-glow)"
        strokeWidth="2.5"
      />
      {/* Cork base bounding band */}
      <path d="M -12,-14.5 C -6,-12.5 6,-12.5 12,-14.5" fill="none" stroke="var(--sl-green)" strokeWidth="3" />
    </g>
  );
};

// Subtle Background Badminton Court marking lines
const CourtLines = ({ y }: { y: number }) => {
  return (
    <g
      transform={`translate(500, ${y})`}
      className="opacity-[0.06] dark:opacity-[0.03]"
      stroke="var(--sl-foreground)"
      strokeWidth="2"
      fill="none"
    >
      {/* Outer court boundary */}
      <rect x="-320" y="-210" width="640" height="420" />
      {/* Center line */}
      <line x1="0" y1="-210" x2="0" y2="210" />
      {/* Inner singles sideline */}
      <line x1="-280" y1="-210" x2="-280" y2="210" />
      <line x1="280" y1="-210" x2="280" y2="210" />
      {/* Short service lines */}
      <line x1="-320" y1="-65" x2="320" y2="-65" />
      <line x1="-320" y1="65" x2="320" y2="65" />
      {/* Net line */}
      <line x1="-320" y1="0" x2="320" y2="0" strokeWidth="4" />
      {/* Back service lines for doubles */}
      <line x1="-320" y1="-190" x2="320" y2="-190" />
      <line x1="-320" y1="190" x2="320" y2="190" />
    </g>
  );
};

export function InteractiveBackground() {
  const pathRef = useRef<SVGPathElement>(null);
  const [shuttle, setShuttle] = useState({ x: 500, y: 500, angle: 45 });
  const [scrollProgress, setScrollProgress] = useState(0);
  const [pathLength, setPathLength] = useState(0);

  // Landmarks coordinates in the SVG viewBox "0 0 1000 5000"
  const landmarks = [
    { id: 0, x: 500, y: 500, rotation: 45 },    // Section 1: Hero Center
    { id: 1, x: 180, y: 1500, rotation: -45 },  // Section 2: Gallery Left
    { id: 2, x: 820, y: 2500, rotation: 45 },   // Section 3: About Right
    { id: 3, x: 180, y: 3500, rotation: -45 },  // Section 4: Fees Left
    { id: 4, x: 500, y: 4500, rotation: 0 },    // Section 5: Onboard Center
  ];

  // Map progress to active index (from 0 to 4)
  const getActiveIndex = (progress: number) => {
    if (progress < 0.125) return 0;
    if (progress < 0.375) return 1;
    if (progress < 0.625) return 2;
    if (progress < 0.875) return 3;
    return 4;
  };

  const activeIndex = getActiveIndex(scrollProgress);

  useEffect(() => {
    const path = pathRef.current;
    if (path) {
      setPathLength(path.getTotalLength());
    }

    const handleScroll = () => {
      if (!path) return;

      const html = document.documentElement;
      const body = document.body;
      
      const scrollTop = window.pageYOffset || html.scrollTop || body.scrollTop;
      const scrollHeight = html.scrollHeight || body.scrollHeight;
      const clientHeight = html.clientHeight || window.innerHeight;

      const totalScrollable = scrollHeight - clientHeight;
      if (totalScrollable <= 0) return;

      const progress = Math.min(Math.max(scrollTop / totalScrollable, 0), 1);
      setScrollProgress(progress);

      const length = path.getTotalLength();
      const currentLength = progress * length;

      // Get Point on path
      const point = path.getPointAtLength(currentLength);

      // Get Point slightly ahead to calculate tangent orientation angle
      const delta = 3;
      const aheadLength = Math.min(currentLength + delta, length);
      const pointAhead = path.getPointAtLength(aheadLength);

      const dx = pointAhead.x - point.x;
      const dy = pointAhead.y - point.y;
      
      let angle = 0;
      if (Math.abs(dx) > 0.001 || Math.abs(dy) > 0.001) {
        angle = Math.atan2(dy, dx) * (180 / Math.PI);
        // Correct offset: because our base Shuttlecock points straight up (-y direction)
        // when rotation is 0, we add 90 degrees to align it with the tangent vector direction
        angle = angle + 90;
      } else {
        // Fallback to racket rotation at endpoints
        const idx = getActiveIndex(progress);
        angle = landmarks[idx].rotation;
      }

      setShuttle({ x: point.x, y: point.y, angle });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [pathLength]);

  // Combined Bezier path connecting all section landmark points cleanly
  const pathD = "M 500,500 C 800,700 850,1200 180,1500 C 100,1800 400,2200 820,2500 C 950,2800 600,3200 180,3500 C 100,3800 300,4200 500,4500";

  return (
    <div className="absolute top-0 left-0 w-full h-[500vh] pointer-events-none z-0 overflow-hidden select-none">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1000 5000"
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        {/* Subtle glow lights in the background of each section */}
        {landmarks.map((landmark) => (
          <circle
            key={`glow-${landmark.id}`}
            cx={landmark.x}
            cy={landmark.y}
            r="160"
            fill="radial-gradient(circle, rgba(0, 230, 118, 0.04) 0%, transparent 70%)"
            className="opacity-30 dark:opacity-20"
            style={{
              fill: 'url(#bg-radial-glow)',
            }}
          />
        ))}

        <defs>
          <radialGradient id="bg-radial-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--sl-green-glow)" stopOpacity="0.12" />
            <stop offset="100%" stopColor="var(--sl-bg)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* 5 Background Courts */}
        {landmarks.map((landmark) => (
          <CourtLines key={`court-${landmark.id}`} y={landmark.y} />
        ))}

        {/* The Flight Path Dotted Background Trail */}
        <path
          ref={pathRef}
          d={pathD}
          fill="none"
          stroke="var(--sl-green)"
          strokeWidth="3.5"
          strokeDasharray="8 12"
          className="opacity-[0.16] dark:opacity-[0.1]"
        />

        {/* Dynamic Flight Path Glowing Overlay (Drawn as user scrolls) */}
        {pathLength > 0 && (
          <path
            d={pathD}
            fill="none"
            stroke="var(--sl-green-glow)"
            strokeWidth="4"
            strokeDasharray={pathLength}
            strokeDashoffset={pathLength - scrollProgress * pathLength}
            className="opacity-70 filter drop-shadow-[0_0_6px_var(--sl-green-glow)]"
          />
        )}

        {/* 5 Stationary Rackets */}
        {landmarks.map((landmark) => (
          <Racket
            key={`racket-${landmark.id}`}
            x={landmark.x}
            y={landmark.y}
            rotation={landmark.rotation}
            active={activeIndex === landmark.id}
          />
        ))}

        {/* Floating Shuttlecock moving along the flight path */}
        <Shuttlecock x={shuttle.x} y={shuttle.y} rotation={shuttle.angle} />
      </svg>
    </div>
  );
}
