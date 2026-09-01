'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { MainNav } from '@/components/navigation/MainNav';
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
} from 'lucide-react';
import { audio } from '@/lib/audio';

const DASHBOARD_NAV = [
 { label: 'Overview', href: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
 { label: 'My Profile & ID', href: '/dashboard/profile', icon: <User className="w-4 h-4" /> },
 { label: 'Executive Board', href: '/dashboard/community/executives', icon: <Crown className="w-4 h-4 text-sl-green" />, badge: 'Roles' },
 { label: 'Games & Schedules', href: '/dashboard/schedule', icon: <Calendar className="w-4 h-4" /> },
 { label: 'Member Directory', href: '/dashboard/community', icon: <Users className="w-4 h-4" />, badge: 'Paid' },
 { label: 'Community Chat', href: '/dashboard/community/chat', icon: <MessageSquare className="w-4 h-4" />, badge: 'Live' },
 { label: 'Community Votes', href: '/dashboard/community/votes', icon: <Vote className="w-4 h-4" /> },
 { label: 'Equipment Shop', href: '/dashboard/shop', icon: <ShoppingBag className="w-4 h-4" /> },
 { label: 'Vlogs & Media', href: '/dashboard/media', icon: <Video className="w-4 h-4" /> },
 { label: 'Drill Tutorials', href: '/dashboard/tutorials', icon: <BookOpen className="w-4 h-4" /> },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
 const pathname = usePathname();
 const router = useRouter();
 const { user, isAuthenticated, isLoading, logout } = useAuth();
 const [isAuthOpen, setIsAuthOpen] = useState(false);

 useEffect(() => {
 if (!isLoading &&!isAuthenticated) {
 router.replace('/?auth=required');
 }
 }, [isLoading, isAuthenticated, router]);

 // Loading state while verifying athlete session
 if (isLoading) {
 return (
 <div className="min-h-screen bg-sl-bg flex flex-col items-center justify-center text-sl-foreground space-y-4">
 <div className="w-12 h-12 rounded-2xl bg-sl-green flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(0,200,83,0.5)] animate-bounce">
 
 </div>
 <p className="text-xs font-black uppercase text-sl-green tracking-widest font-mono">
 Verifying ShuttleLions Athlete Credentials...
 </p>
 </div>
 );
 }

 // Access denied fallback (redirecting)
 if (!isAuthenticated) {
 return null;
 }

 return (
 <div className="min-h-screen bg-sl-bg flex flex-col justify-between text-sl-foreground">
 {/* Top Main Navigation */}
 <MainNav onOpenAuth={() => setIsAuthOpen(true)} />

 {/* Main Dashboard Container with Sidebar */}
 <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
 {/* Left Sidebar */}
 <aside className="w-full lg:w-64 shrink-0 space-y-6">
 {/* User Profile Card */}
 <div className="shuttle-panel p-5 bg-sl-panel space-y-4">
 <div className="flex items-center gap-3.5">
 {user?.avatar_url ? (
 <img
 src={user.avatar_url}
 alt={user.full_name}
 className="w-12 h-12 rounded-full object-cover border-2 border-sl-green shadow-[0_0_12px_rgba(0,200,83,0.35)]"
 />
 ) : (
 <div className="w-12 h-12 rounded-full bg-sl-green text-white font-black text-xl flex items-center justify-center border-2 border-sl-border shadow-[0_0_10px_rgba(0,200,83,0.3)]">
 {user?.full_name?.charAt(0) || 'L'}
 </div>
 )}
 <div className="flex-1 min-w-0">
 <h3 className="text-sm font-black text-sl-foreground truncate">
 {user?.full_name || 'Guest Lion'}
 </h3>
 <span className="inline-block text-[10px] font-bold text-sl-green bg-sl-green/10 border border-sl-green/20 px-2 py-0.5 rounded uppercase mt-0.5">
 {user?.role || 'Member'}
 </span>
 </div>
 </div>

 <div className="pt-2 border-t border-sl-border/40 text-[11px] text-sl-muted space-y-1 font-semibold">
 <p className="truncate"> {user?.department || 'Department pending'}</p>
 <p className="truncate"> {user?.level ? `${user.level} Level` : 'Level pending'}</p>
 </div>
 </div>

 {/* Navigation Menu Links */}
 <nav className="shuttle-panel p-2.5 bg-sl-panel space-y-1">
 {DASHBOARD_NAV.map((item) => {
 const isActive = pathname === item.href;
 return (
 <Link
 key={item.href}
 href={item.href}
 onClick={() => audio.play('rally')}
 className={`flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs transition-all ${
 isActive
 ? 'bg-sl-green text-white shadow-[0_4px_12px_rgba(0,200,83,0.3)]'
 : 'text-sl-foreground hover:bg-sl-green/10 hover:text-sl-green'
 }`}
 >
 <div className="flex items-center gap-2.5">
 {item.icon}
 <span>{item.label}</span>
 </div>
 {item.badge && (
 <span
 className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
 isActive
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

 {/* Admin Command Room Link */}
 {isAuthenticated && (user?.role === 'admin' || user?.role === 'captain') && (
 <div className="pt-2 border-t border-sl-border/40">
 <Link
 href="/dashboard/admin"
 onClick={() => audio.play('serve')}
 className={`flex items-center justify-between px-3 py-2.5 rounded-xl font-black text-xs transition-all ${
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
 </aside>

 {/* Right Main Page Viewport */}
 <main className="flex-1 min-w-0">
 {children}
 </main>
 </div>
 </div>
 );
}
