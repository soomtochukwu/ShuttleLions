'use client';

import Link from 'next/link';
import { useAuth } from '@/components/AuthContext';
import { useTheme } from '@/components/ThemeProvider';
import { audio } from '@/lib/audio';
import { ShuttleButton } from '@/components/ui/ShuttleButton';

interface NavbarProps {
  onOpenAuth: () => void;
}

export function Navbar({ onOpenAuth }: NavbarProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, resolvedTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    audio.play('netDrop');
    if (theme === 'system') {
      setTheme('light');
    } else if (theme === 'light') {
      setTheme('dark');
    } else {
      setTheme('system');
    }
  };

  const handleNavClick = () => {
    audio.play('rally');
  };

  const handleLogout = () => {
    audio.play('courtSqueak');
    logout();
  };

  return (
    <nav className="w-full sticky top-0 z-50 bg-sl-panel border-b-3 border-sl-border px-4 py-3 flex items-center justify-between shadow-[0_3px_0_var(--sl-shadow)]">
      {/* Logo */}
      <Link href="/" onClick={handleNavClick} className="flex items-center gap-2">
        <span className="text-2xl sm:text-3xl font-bold text-stroke tracking-wider text-sl-green select-none" style={{ fontFamily: 'Bangers, cursive', textShadow: '2px 2px 0 var(--sl-border)' }}>
          SHUTTLELIONS 🏸
        </span>
      </Link>

      {/* Nav Links */}
      <div className="flex items-center gap-2 sm:gap-4">
        <Link href="/about" onClick={handleNavClick} className="text-sm font-bold uppercase hover:text-sl-green transition-colors px-2 py-1">
          About
        </Link>

        {isAuthenticated && (
          <Link href="/dashboard" onClick={handleNavClick} className="text-sm font-bold uppercase hover:text-sl-green transition-colors px-2 py-1">
            Dashboard
          </Link>
        )}

        {isAuthenticated && user?.role === 'admin' && (
          <Link href="/dashboard/admin" onClick={handleNavClick} className="text-sm font-bold uppercase text-sl-warning hover:text-sl-green transition-colors px-2 py-1">
            Admin
          </Link>
        )}

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 border-3 border-sl-border rounded-lg bg-sl-panel text-sl-foreground hover:bg-sl-bg hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none shadow-[2px_2px_0_var(--sl-shadow)] transition-all font-bold text-sm"
          title={`Theme: ${theme} (Current: ${resolvedTheme})`}
        >
          {theme === 'system' ? '💻' : theme === 'light' ? '☀️' : '🌙'}
        </button>

        {/* Auth CTA */}
        {isAuthenticated ? (
          <ShuttleButton
            variant="gray"
            className="py-1 px-3 sm:py-2 sm:px-4 text-xs sm:text-sm font-bold border-2 border-sl-border"
            onClick={handleLogout}
          >
            Logout
          </ShuttleButton>
        ) : (
          <ShuttleButton
            variant="green"
            className="py-1 px-3 sm:py-2 sm:px-4 text-xs sm:text-sm font-bold border-2 border-sl-border"
            onClick={() => {
              audio.play('smash');
              onOpenAuth();
            }}
          >
            Login
          </ShuttleButton>
        )}
      </div>
    </nav>
  );
}
