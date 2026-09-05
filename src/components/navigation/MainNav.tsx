'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthContext';
import { useTheme } from '@/components/ThemeProvider';
import { ActivityRibbon } from './ActivityRibbon';
import { NavDropdown, type DropdownItem } from './NavDropdown';
import { MobileDrawer } from './MobileDrawer';
import { ShuttleButton } from '@/components/ui/ShuttleButton';
import { audio } from '@/lib/audio';
import {
 Menu,
 Sun,
 Moon,
 Laptop,
 Users,
 MessageSquare,
 Vote,
 ShoppingBag,
 Video,
 BookOpen,
 Calendar,
 Shield,
 UserCheck,
} from 'lucide-react';

interface MainNavProps {
 onOpenAuth: () => void;
}

export function MainNav({ onOpenAuth }: MainNavProps) {
 const { user, isAuthenticated, logout } = useAuth();
 const { theme, resolvedTheme, setTheme } = useTheme();
 const [isDrawerOpen, setIsDrawerOpen] = useState(false);

 const toggleTheme = () => {
 audio.play('netDrop');
 if (theme === 'system') setTheme('light');
 else if (theme === 'light') setTheme('dark');
 else setTheme('system');
 };

 const communityDropdownItems: DropdownItem[] = [
 {
 title: 'Member Directory',
 description: 'Explore verified athletes & student profiles',
 href: '/dashboard/community',
 icon: <Users className="w-4 h-4" />,
 badge: 'Community',
 },
 {
 title: 'Community Chat',
 description: 'Channels for training, banter & announcements',
 href: '/dashboard/community/chat',
 icon: <MessageSquare className="w-4 h-4" />,
 badge: 'Coming Soon',
 },
 {
 title: 'Community Votes & Polls',
 description: 'Vote on club tournaments & match formats',
 href: '/dashboard/community/votes',
 icon: <Vote className="w-4 h-4" />,
 badge: 'Coming Soon',
 },
 ];

 const exploreDropdownItems: DropdownItem[] = [
 {
 title: 'Equipment Shop',
 description: 'Order pro rackets & gear with executive pickup',
 href: '/dashboard/shop',
 icon: <ShoppingBag className="w-4 h-4" />,
 badge: 'Coming Soon',
 },
 {
 title: 'Vlogs & Match Media',
 description: 'Highlights, match clips & rally photo gallery',
 href: '/dashboard/media',
 icon: <Video className="w-4 h-4" />,
 },
 {
 title: 'Drill Tutorials',
 description: 'Footwork guides & smash biomechanics lessons',
 href: '/dashboard/tutorials',
 icon: <BookOpen className="w-4 h-4" />,
 },
 ];

 return (
 <header className="sticky top-0 left-0 right-0 z-50 flex flex-col shadow-md">
 {/* Top Activity Ribbon */}
 <ActivityRibbon />

 {/* Main Glass Nav Bar */}
 <nav className="w-full bg-sl-panel/85 backdrop-blur-xl border-b border-sl-border/40 px-4 sm:px-8 py-3 flex items-center justify-between transition-colors">
 {/* Left: Brand Logo */}
 <Link
 href="/"
 onClick={() => audio.play('rally')}
 className="flex items-center gap-2.5 group"
 >
 <div className="w-9 h-9 rounded-xl bg-sl-green flex items-center justify-center text-white font-black text-xl shadow-[0_0_15px_rgba(0,200,83,0.4)] group-hover:scale-105 transition-transform">
 
 </div>
 <div className="flex flex-col">
 <span
 className="text-lg sm:text-2xl font-black tracking-wider text-sl-foreground leading-none"
 style={{ fontFamily: 'var(--font-title)' }}
 >
 SHUTTLE<span className="text-sl-green">LIONS</span>
 </span>
 <span className="text-[9px] font-bold text-sl-muted tracking-widest uppercase">
 UNN Badminton Club
 </span>
 </div>
 </Link>

 {/* Center: Desktop Navigation Links */}
 <div className="hidden lg:flex items-center gap-1 xl:gap-3">
 <Link
 href="/"
 onClick={() => audio.play('rally')}
 className="px-3 py-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-sl-foreground hover:text-sl-green rounded-lg hover:bg-sl-green/10 transition-colors"
 >
 Home
 </Link>

 <Link
 href="/dashboard/schedule"
 onClick={(e) => {
 if (!isAuthenticated) {
 e.preventDefault();
 audio.play('smash');
 onOpenAuth();
 return;
 }
 audio.play('rally');
 }}
 className="px-3 py-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-sl-foreground hover:text-sl-green rounded-lg hover:bg-sl-green/10 transition-colors flex items-center gap-1.5"
 >
 <Calendar className="w-3.5 h-3.5 text-sl-green" />
 <span>Schedules</span>
 </Link>

 <NavDropdown
 label="Community"
 items={communityDropdownItems}
 isAuthenticated={isAuthenticated}
 onAuthRequired={onOpenAuth}
 />
 <NavDropdown
 label="Explore & Gear"
 items={exploreDropdownItems}
 isAuthenticated={isAuthenticated}
 onAuthRequired={onOpenAuth}
 />

 {isAuthenticated && (
 <Link
 href="/dashboard"
 onClick={() => audio.play('rally')}
 className="px-3 py-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-sl-green hover:bg-sl-green/10 rounded-lg transition-colors flex items-center gap-1.5"
 >
 <UserCheck className="w-3.5 h-3.5" />
 <span>Dashboard</span>
 </Link>
 )}

 {isAuthenticated && (user?.role === 'admin' || user?.role === 'captain') && (
 <Link
 href="/dashboard/admin"
 onClick={() => audio.play('serve')}
 className="px-3 py-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-sl-warning bg-sl-warning/10 border border-sl-warning/30 hover:bg-sl-warning/20 rounded-lg transition-colors flex items-center gap-1.5"
 >
 <Shield className="w-3.5 h-3.5" />
 <span>Admin Room</span>
 </Link>
 )}
 </div>

 {/* Right: Actions (Theme Toggle + Auth Button + Mobile Menu) */}
 <div className="flex items-center gap-2 sm:gap-3">
 {/* Theme Switcher Button */}
 <button
 onClick={toggleTheme}
 className="p-2 rounded-lg bg-sl-bg border border-sl-border text-sl-foreground hover:border-sl-green hover:scale-105 active:scale-95 transition-all shadow-sm"
 title={`Current: ${theme}`}
 >
 {theme === 'system' ? (
 <Laptop className="w-4 h-4" />
 ) : resolvedTheme === 'dark' ? (
 <Moon className="w-4 h-4 text-sl-green-glow" />
 ) : (
 <Sun className="w-4 h-4 text-amber-500" />
 )}
 </button>

 {/* Desktop Auth Button */}
 <div className="hidden sm:block">
 {isAuthenticated ? (
 <div className="flex items-center gap-2">
 <Link
 href="/dashboard/profile"
 onClick={() => audio.play('rally')}
 className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-sl-panel border border-sl-border hover:border-sl-green transition-all"
 >
 {user?.avatar_url ? (
 <img
 src={user.avatar_url}
 alt={user.full_name}
 className="w-6 h-6 rounded-full object-cover border border-sl-green shadow-sm"
 />
 ) : (
 <div className="w-6 h-6 rounded-full bg-sl-green text-white text-xs font-bold flex items-center justify-center">
 {user?.full_name?.charAt(0) || 'L'}
 </div>
 )}
 <span className="text-xs font-bold text-sl-foreground max-w-[120px] truncate">
 {user?.full_name || 'Athlete'}
 </span>
 </Link>

 <ShuttleButton
 variant="gray"
 onClick={() => {
 audio.play('courtSqueak');
 logout();
 }}
 className="py-1.5 px-3 text-xs font-bold border border-sl-border"
 >
 Log Out
 </ShuttleButton>
 </div>
 ) : (
 <ShuttleButton
 variant="green"
 onClick={() => {
 audio.play('smash');
 onOpenAuth();
 }}
 className="py-1.5 px-4 text-xs font-bold shadow-md"
 >
 Register / Login 
 </ShuttleButton>
 )}
 </div>

 {/* Mobile Hamburger Trigger */}
 <button
 onClick={() => {
 audio.play('rally');
 setIsDrawerOpen(true);
 }}
 className="lg:hidden p-2 rounded-lg bg-sl-bg border border-sl-border text-sl-foreground hover:border-sl-green transition-colors"
 >
 <Menu className="w-5 h-5" />
 </button>
 </div>
 </nav>

 {/* Mobile Drawer */}
 <MobileDrawer
 isOpen={isDrawerOpen}
 onClose={() => setIsDrawerOpen(false)}
 onOpenAuth={onOpenAuth}
 />
 </header>
 );
}
export default MainNav;
