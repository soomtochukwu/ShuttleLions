'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { useTheme } from '@/components/ThemeProvider';
import {
  LayoutDashboard,
  User,
  Calendar,
  Users,
  MessageSquare,
  Vote,
  ShoppingBag,
  Video,
  BookOpen,
  Shield,
  Crown,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Sun,
  Moon,
  Laptop,
  Home,
  Settings,
} from 'lucide-react';
import { audio } from '@/lib/audio';
import { NotificationScheduler } from '@/components/notifications/NotificationScheduler';
import { RealtimeNotificationListener } from '@/components/notifications/RealtimeNotificationListener';
import { PWAInstallPrompt } from '@/components/pwa/PWAInstallPrompt';

const DASHBOARD_NAV = [
  { label: 'Overview', href: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: 'Digital Lion ID', href: '/dashboard/profile', icon: <User className="w-4 h-4" /> },
  { label: 'Settings', href: '/dashboard/settings', icon: <Settings className="w-4 h-4" /> },
  { label: 'Executive Board', href: '/dashboard/community/executives', icon: <Crown className="w-4 h-4 text-sl-green" />, badge: 'Roles' },
  { label: 'Games & Schedules', href: '/dashboard/schedule', icon: <Calendar className="w-4 h-4" /> },
  { label: 'Member Directory', href: '/dashboard/community', icon: <Users className="w-4 h-4" />, badge: 'Paid' },
  { label: 'Community Chat', href: '/dashboard/community/chat', icon: <MessageSquare className="w-4 h-4" />, badge: 'Coming Soon' },
  { label: 'Community Votes', href: '/dashboard/community/votes', icon: <Vote className="w-4 h-4" />, badge: 'Coming Soon' },
  { label: 'Equipment Shop', href: '/dashboard/shop', icon: <ShoppingBag className="w-4 h-4" />, badge: 'Coming Soon' },
  { label: 'Vlogs & Media', href: '/dashboard/media', icon: <Video className="w-4 h-4" /> },
  { label: 'Drill Tutorials', href: '/dashboard/tutorials', icon: <BookOpen className="w-4 h-4" /> },
];

const MOBILE_BOTTOM_NAV = [
  { label: 'Overview', href: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'Games', href: '/dashboard/schedule', icon: <Calendar className="w-5 h-5" /> },
  { label: 'Tutorials', href: '/dashboard/tutorials', icon: <BookOpen className="w-5 h-5" /> },
  { label: 'Community', href: '/dashboard/community', icon: <Users className="w-5 h-5" /> },
  { label: 'My ID', href: '/dashboard/profile', icon: <User className="w-5 h-5" /> },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleTheme = () => {
    audio.play('netDrop');
    if (theme === 'system') setTheme('light');
    else if (theme === 'light') setTheme('dark');
    else setTheme('system');
  };

  const [showStallWarning, setShowStallWarning] = useState(false);

  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setShowStallWarning(true);
      }, 2500);
      return () => clearTimeout(timer);
    } else {
      setShowStallWarning(false);
    }
  }, [isLoading]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/?auth=required');
    }
  }, [isLoading, isAuthenticated, router]);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-sl-bg flex flex-col items-center justify-center text-sl-foreground p-6">
        <div className="shuttle-panel p-8 bg-sl-panel max-w-sm w-full text-center space-y-4 border border-sl-border shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-sl-green text-white flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(0,200,83,0.5)] animate-bounce">
            <span className="w-4 h-4 rounded-full bg-white animate-ping" />
          </div>

          <div className="space-y-1">
            <h2
              className="text-base font-black uppercase text-sl-foreground tracking-wider"
              style={{ fontFamily: 'var(--font-title)' }}
            >
              SHUTTLE<span className="text-sl-green">LIONS</span>
            </h2>
            <p className="text-xs font-black uppercase text-sl-green tracking-widest font-mono">
              Verifying ShuttleLions Athlete Profile...
            </p>
          </div>

          {showStallWarning && (
            <div className="pt-3 border-t border-sl-border/40 space-y-3">
              <p className="text-xs text-sl-muted leading-relaxed">
                Verification is taking a moment. You can force entry into the dashboard or return to sign in.
              </p>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    window.location.replace('/dashboard');
                  }}
                  className="w-full py-2.5 bg-sl-green text-white text-xs font-black rounded-lg uppercase tracking-wider hover:brightness-110 shadow cursor-pointer transition-all"
                >
                  Force Load Dashboard
                </button>
                <button
                  type="button"
                  onClick={() => {
                    logout().finally(() => window.location.replace('/?auth=required'));
                  }}
                  className="w-full py-2.5 bg-sl-bg border border-sl-border text-sl-foreground text-xs font-black rounded-lg uppercase tracking-wider hover:bg-sl-panel cursor-pointer transition-all"
                >
                  Return to Sign In
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const activeNavItem = DASHBOARD_NAV.find((item) => item.href === pathname);
  const pageTitle = activeNavItem?.label || (pathname === '/dashboard/admin' ? 'Admin Command Room' : 'Dashboard');

  const isFixedLayoutPage = [
    '/dashboard/media',
    '/dashboard/community',
    '/dashboard/community/executives',
    '/dashboard/schedule',
    '/dashboard/tutorials',
  ].includes(pathname);

  return (
    <div className="h-screen h-[100dvh] w-screen overflow-hidden flex flex-col bg-sl-bg text-sl-foreground">
      {/* Background Notification Scheduler for Pre-Game Reminders */}
      <NotificationScheduler />

      {/* Realtime Supabase Notification Listener with Sounds, Haptics & Heads-up Banner */}
      <RealtimeNotificationListener />

      {/* Mobile PWA Install Prompt */}
      <PWAInstallPrompt />

      {/* 1. Sleek Dashboard Top Navigation Bar */}
      <header className="w-full h-16 shrink-0 border-b border-sl-border bg-sl-panel flex items-center justify-between px-4 sm:px-6 lg:px-8 z-30 select-none">
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="lg:hidden p-2 rounded-xl border border-sl-border bg-sl-bg hover:bg-sl-green/10 text-sl-foreground transition-colors"
            aria-label="Toggle navigation drawer"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Platform Brand */}
          <Link
            href="/dashboard"
            onClick={() => audio.play('rally')}
            className="flex items-center gap-2"
          >
            <span
              className="text-xl sm:text-2xl font-extrabold uppercase tracking-wider text-stroke text-sl-foreground hover:text-sl-green transition-colors"
              style={{ fontFamily: 'Bangers, cursive' }}
            >
              SHUTTLE<span className="text-sl-green">LIONS</span>
            </span>
          </Link>

          {/* Current Page Breadcrumb */}
          <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-sl-border/40 text-xs font-bold text-sl-muted">
            <span>Portal</span>
            <ChevronRight className="w-3 h-3 text-sl-muted/50" />
            <span className="text-sl-foreground font-black">{pageTitle}</span>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-3">
          {/* Back to Public Arena Link */}
          <Link
            href="/"
            onClick={() => audio.play('rally')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-sl-border text-xs font-bold text-sl-muted hover:text-sl-green hover:border-sl-green transition-all"
            title="Return to Public Landing Arena"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Public Arena</span>
          </Link>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 border border-sl-border rounded-xl bg-sl-bg hover:bg-sl-panel transition-all text-sl-foreground"
            title="Toggle theme"
          >
            {theme === 'system' ? (
              <Laptop className="w-4 h-4 text-sl-foreground" />
            ) : theme === 'light' ? (
              <Sun className="w-4 h-4 text-amber-500" />
            ) : (
              <Moon className="w-4 h-4 text-sl-green" />
            )}
          </button>

          {/* Athlete Quick Status */}
          <div className="flex items-center gap-2 pl-2">
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.full_name || 'Athlete'}
                className="w-8 h-8 rounded-full object-cover border border-sl-green"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-sl-green text-white font-bold text-xs flex items-center justify-center border border-sl-border">
                {user?.full_name?.charAt(0) || 'L'}
              </div>
            )}
            <span className="hidden md:inline-block text-xs font-black text-sl-foreground max-w-[120px] truncate">
              {user?.full_name?.split(' ')[0] || 'Athlete'}
            </span>
          </div>
        </div>
      </header>

      {/* 2. Main Body Container: Fixed Leftmost Sidebar + Scrollable Viewport */}
      <div className="flex-1 w-full flex flex-row overflow-hidden relative">
        {/* Left Sidebar (Desktop Pinned at left: 0) */}
        <aside className="w-64 lg:w-72 h-full shrink-0 border-r border-sl-border bg-sl-panel overflow-y-auto p-5 space-y-6 select-none z-20 hidden lg:flex flex-col justify-between">
          <div className="space-y-6">
            {/* User Profile Card */}
            <div className="shuttle-panel p-4 bg-sl-bg border border-sl-border space-y-3">
              <div className="flex items-center gap-3">
                {user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.full_name || 'Athlete'}
                    className="w-11 h-11 rounded-full object-cover border-2 border-sl-green shadow-[0_0_10px_rgba(0,200,83,0.3)]"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-sl-green text-white font-black text-lg flex items-center justify-center border border-sl-border">
                    {user?.full_name?.charAt(0) || 'L'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-black text-sl-foreground truncate">
                    {user?.full_name || 'Guest Lion'}
                  </h3>
                  <span className="inline-block text-[10px] font-bold text-sl-green bg-sl-green/10 border border-sl-green/20 px-2 py-0.5 rounded uppercase mt-0.5">
                    {user?.role || 'Member'}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-sl-border/40 text-[11px] text-sl-muted space-y-0.5 font-semibold">
                <p className="truncate">{user?.department || 'Department pending'}</p>
                <p className="truncate">{user?.level ? `${user.level} Level` : 'Level pending'}</p>
              </div>
            </div>

            {/* Navigation Menu Links */}
            <nav className="space-y-1">
              {DASHBOARD_NAV.map((item) => {
                const isActive = pathname === item.href;
                const isDimmed = item.badge === 'Coming Soon';

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={(e) => {
                      audio.play('rally');
                    }}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                      isDimmed
                        ? 'opacity-40 hover:opacity-75 text-sl-muted hover:text-sl-foreground bg-sl-bg/40'
                        : isActive
                        ? 'bg-sl-green text-white shadow-[0_4px_12px_rgba(0,200,83,0.3)]'
                        : 'text-sl-foreground hover:bg-sl-green/10 hover:text-sl-green'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {item.icon}
                      <span className={isDimmed ? 'line-through decoration-sl-muted/50' : ''}>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                          item.badge === 'Coming Soon'
                            ? 'bg-amber-500/10 text-amber-500/70 border border-amber-500/20'
                            : isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-sl-green/15 text-sl-green'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}

              {/* Admin Command Room Link - strictly admin only */}
              {isAuthenticated && user?.role === 'admin' && (
                <div className="pt-2 border-t border-sl-border/40">
                  <Link
                    href="/dashboard/admin"
                    onClick={() => audio.play('serve')}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-black text-xs transition-all ${
                      pathname === '/dashboard/admin'
                        ? 'bg-sl-warning text-black shadow-[0_4px_12px_rgba(255,179,0,0.3)]'
                        : 'text-sl-warning hover:bg-sl-warning/10'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Shield className="w-4 h-4" />
                      <span>Admin Command Room</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </nav>
          </div>

          {/* Quick Sign Out Action */}
          <div className="pt-4 border-t border-sl-border/40">
            <button
              onClick={() => {
                audio.play('netDrop');
                logout();
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-bold text-xs text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out Session</span>
            </button>
          </div>
        </aside>

        {/* Mobile Slide-Out Drawer Overlay */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 flex">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="relative w-72 max-w-[80vw] bg-sl-panel border-r border-sl-border h-full p-5 space-y-6 flex flex-col justify-between overflow-y-auto z-50">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black uppercase tracking-wider text-sl-foreground">
                    Menu
                  </span>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1.5 rounded-lg border border-sl-border text-sl-muted hover:text-sl-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Profile in Mobile Drawer */}
                <div className="shuttle-panel p-3.5 bg-sl-bg border border-sl-border space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-sl-green text-white font-bold text-xs flex items-center justify-center">
                      {user?.full_name?.charAt(0) || 'L'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-black text-sl-foreground truncate">{user?.full_name}</h4>
                      <span className="text-[10px] text-sl-green font-bold uppercase">{user?.role || 'Member'}</span>
                    </div>
                  </div>
                </div>

                {/* Links */}
                <nav className="space-y-1">
                  {DASHBOARD_NAV.map((item) => {
                    const isActive = pathname === item.href;
                    const isDimmed = item.badge === 'Coming Soon';

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => {
                          audio.play('rally');
                          setIsMobileMenuOpen(false);
                        }}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs ${
                          isDimmed
                            ? 'opacity-40 text-sl-muted hover:opacity-75'
                            : isActive
                            ? 'bg-sl-green text-white'
                            : 'text-sl-foreground hover:bg-sl-green/10'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {item.icon}
                          <span className={isDimmed ? 'line-through decoration-sl-muted/50' : ''}>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                              item.badge === 'Coming Soon'
                                ? 'bg-amber-500/10 text-amber-500/70 border border-amber-500/20'
                                : 'bg-sl-green/15 text-sl-green'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <button
                onClick={() => {
                  audio.play('netDrop');
                  logout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl font-bold text-xs text-rose-400 hover:bg-rose-500/10"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}

        {/* 3. Main Page Viewport with Generous Spacing and Independent Scroll */}
        <main
          className={`flex-1 h-full bg-sl-bg relative focus:outline-none flex flex-col ${
            isFixedLayoutPage ? 'overflow-hidden' : 'overflow-y-auto'
          }`}
        >
          <div
            className={`w-full ${
              isFixedLayoutPage
                ? 'h-full flex-1 flex flex-col p-2 sm:p-4 lg:p-6 pb-20 sm:pb-4 lg:pb-6 min-h-0 overflow-hidden'
                : 'max-w-7xl mx-auto p-4 sm:p-8 lg:p-12 pb-24 sm:pb-12 lg:pb-12 space-y-6 sm:space-y-10'
            }`}
          >
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Persistent, thumb-friendly app feel) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-sl-panel/95 backdrop-blur-md border-t border-sl-border flex items-center justify-around px-2 py-1.5 safe-area-bottom select-none">
        {MOBILE_BOTTOM_NAV.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                audio.haptic('tap');
                audio.play('rally');
              }}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer min-w-[56px] ${
                isActive ? 'text-sl-green font-black' : 'text-sl-muted hover:text-sl-foreground font-bold'
              }`}
            >
              <div className={`p-1 rounded-lg transition-all ${isActive ? 'bg-sl-green/15 text-sl-green' : ''}`}>
                {item.icon}
              </div>
              <span className="text-[10px] tracking-tight mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
