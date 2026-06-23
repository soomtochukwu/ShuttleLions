'use client';

import Link from 'next/link';
import { audio } from '@/lib/audio';

export function Footer() {
  const handleLinkClick = () => {
    audio.play('rally');
  };

  return (
    <footer className="w-full bg-sl-panel border-t-3 border-sl-border py-6 px-4 md:px-6 relative z-10 safe-area-bottom mt-auto">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <span
            className="text-xl font-bold tracking-wider text-sl-green text-stroke"
            style={{ fontFamily: 'Bangers, cursive' }}
          >
            SHUTTLELIONS 🏸
          </span>
          <p className="text-xs text-sl-muted font-bold mt-1">
            Official Badminton Club of the University of Nigeria, Nsukka (UNN)
          </p>
        </div>

        {/* Footer Navigation */}
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
          <Link
            href="/about"
            onClick={handleLinkClick}
            className="text-xs sm:text-sm font-bold uppercase tracking-wider text-sl-foreground bg-sl-panel border-2 border-sl-border px-3 py-1.5 hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none hover:bg-sl-bg shadow-[3px_3px_0_var(--sl-shadow)] transition-all"
          >
            About ShuttleLions
          </Link>
          <a
            href="https://chat.whatsapp.com/mock-unn-badminton"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => audio.play('rally')}
            className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white bg-sl-green border-2 border-sl-border px-3 py-1.5 hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none hover:bg-sl-accent shadow-[3px_3px_0_var(--sl-shadow)] transition-all"
          >
            WhatsApp Group
          </a>
          <a
            href="https://github.com/mock-unn-shuttlelions"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => audio.play('rally')}
            className="text-xs sm:text-sm font-bold uppercase tracking-wider text-sl-panel bg-sl-foreground border-2 border-sl-border px-3 py-1.5 hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none shadow-[3px_3px_0_var(--sl-shadow)] transition-all"
          >
            GitHub
          </a>
        </div>
      </div>
      <div className="max-w-6xl mx-auto border-t-2 border-sl-border/20 mt-6 pt-4 text-center">
        <p className="text-[10px] sm:text-xs font-mono text-sl-muted">
          &copy; {new Date().getFullYear()} ShuttleLions UNN. Built with passion for Nigerian badminton.
        </p>
      </div>
    </footer>
  );
}
