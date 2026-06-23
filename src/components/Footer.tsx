'use client';

import Link from 'next/link';
import { audio } from '@/lib/audio';

export function Footer() {
  const handleLinkClick = () => {
    audio.play('rally');
  };

  return (
    <footer className="w-full bg-sl-panel/40 border-t border-sl-border/30 py-8 px-4 md:px-6 relative z-10 backdrop-blur-md">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <span
            className="text-xl font-bold tracking-wider text-sl-green text-stroke"
            style={{ fontFamily: 'var(--font-title)' }}
          >
            SHUTTLELIONS 🏸
          </span>
          <p className="text-xs text-sl-muted font-semibold mt-1">
            Official Badminton Club of the University of Nigeria, Nsukka (UNN)
          </p>
        </div>

        {/* Footer Navigation */}
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="#about-section"
            onClick={handleLinkClick}
            className="shuttle-btn shuttle-btn-white text-xs uppercase py-2 px-4"
          >
            About Club
          </Link>
          <a
            href="https://chat.whatsapp.com/mock-unn-badminton"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => audio.play('rally')}
            className="shuttle-btn shuttle-btn-green text-xs uppercase py-2 px-4"
          >
            WhatsApp Group
          </a>
        </div>
      </div>
      <div className="max-w-6xl mx-auto border-t border-sl-border/10 mt-6 pt-4 text-center">
        <p className="text-[10px] sm:text-xs font-mono text-sl-muted">
          &copy; {new Date().getFullYear()} ShuttleLions UNN. Built with passion for Nigerian badminton.
        </p>
      </div>
    </footer>
  );
}
