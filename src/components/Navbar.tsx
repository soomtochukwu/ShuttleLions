'use client';

import Link from 'next/link';
import { useAuth } from '@/components/AuthContext';
import { useTheme } from '@/components/ThemeProvider';
import { audio } from '@/lib/audio';
import { ShuttleButton } from '@/components/ui/ShuttleButton';
import { Sun, Moon, Laptop } from 'lucide-react';

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
 <nav className="w-full bg-sl-panel/60 backdrop-blur-md border-b border-sl-border/40 px-4 py-3 flex items-center justify-between shadow-sm">
 {/* Logo */}
 <Link href="/" onClick={handleNavClick} className="flex items-center gap-2">
 <span
 className="text-2xl sm:text-3xl font-extrabold tracking-wider text-sl-green text-stroke select-none"
 style={{
 fontFamily: 'var(--font-title)',
 }}
 >
 SHUTTLELIONS 
 </span>
 </Link>

 {/* Nav Links */}
 <div className="flex items-center gap-2 sm:gap-4">
 <a
 href="#about-section"
 onClick={handleNavClick}
 className="text-xs sm:text-sm font-bold uppercase hover:text-sl-green text-sl-foreground transition-colors px-2 py-1 font-sub"
 >
 About
 </a>

 {isAuthenticated && (
 <Link
 href="/dashboard"
 onClick={handleNavClick}
 className="text-xs sm:text-sm font-bold uppercase hover:text-sl-green text-sl-foreground transition-colors px-2 py-1 font-sub"
 >
 Dashboard
 </Link>
 )}

 {isAuthenticated && user?.role === 'admin' && (
 <Link
 href="/dashboard/admin"
 onClick={handleNavClick}
 className="text-xs sm:text-sm font-bold uppercase text-sl-warning hover:text-sl-green transition-colors px-2 py-1 font-sub"
 >
 Admin
 </Link>
 )}

 {/* Theme Toggle Button */}
 <button
 onClick={toggleTheme}
 className="p-2 border border-sl-border rounded-lg bg-sl-glass-bg text-sl-foreground hover:bg-sl-panel hover:scale-105 active:scale-95 transition-all shadow-sm text-sm"
 title={`Theme: ${theme} (Current: ${resolvedTheme})`}
 >
 {theme === 'system' ? (
   <Laptop className="w-4 h-4 text-sl-foreground" />
 ) : theme === 'light' ? (
   <Sun className="w-4 h-4 text-amber-500" />
 ) : (
   <Moon className="w-4 h-4 text-sl-green" />
 )}
 </button>

 {/* Auth CTA */}
 {isAuthenticated ? (
 <ShuttleButton
 variant="gray"
 className="py-1.5 px-3 sm:py-2 sm:px-4 text-xs sm:text-sm font-bold border border-sl-border"
 onClick={handleLogout}
 >
 Logout
 </ShuttleButton>
 ) : (
 <ShuttleButton
 variant="green"
 className="py-1.5 px-3 sm:py-2 sm:px-4 text-xs sm:text-sm font-bold border border-sl-border"
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
export default Navbar;
