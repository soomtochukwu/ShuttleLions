'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { audio } from '@/lib/audio';

export interface DropdownItem {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

interface NavDropdownProps {
  label: string;
  items: DropdownItem[];
  isAuthenticated?: boolean;
  onAuthRequired?: () => void;
}

export function NavDropdown({
  label,
  items,
  isAuthenticated = false,
  onAuthRequired,
}: NavDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleItemClick = (e: React.MouseEvent, href: string) => {
    if (!isAuthenticated && href.startsWith('/dashboard') && onAuthRequired) {
      e.preventDefault();
      audio.play('smash');
      setIsOpen(false);
      onAuthRequired();
      return;
    }
    audio.play('rally');
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        onClick={() => {
          audio.play('rally');
          setIsOpen(!isOpen);
        }}
        className={`flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors rounded-lg ${
          isOpen ? 'text-sl-green bg-sl-green/10' : 'text-sl-foreground hover:text-sl-green'
        }`}
      >
        <span>{label}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180 text-sl-green' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.16 }}
            className="absolute left-0 top-full pt-2 z-50 w-72"
          >
            <div className="shuttle-panel bg-sl-panel p-2 shadow-2xl border border-sl-border space-y-1">
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleItemClick(e, item.href)}
                  className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-sl-green/10 transition-colors group"
                >
                  <div className="p-2 rounded-md bg-sl-bg border border-sl-border group-hover:border-sl-green/40 group-hover:text-sl-green text-sl-muted transition-colors">
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-sl-foreground group-hover:text-sl-green transition-colors">
                        {item.title}
                      </span>
                      {item.badge && (
                        <span className="text-[9px] font-bold bg-sl-green/20 text-sl-green px-1.5 py-0.5 rounded">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-sl-muted line-clamp-1 mt-0.5 font-medium">
                      {item.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
