'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  X,
  Calendar,
  Users,
  MessageSquare,
  Vote,
  ShoppingBag,
  Video,
  BookOpen,
  Shield,
  Crown,
  User,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { ShuttleButton } from '@/components/ui/ShuttleButton';
import { audio } from '@/lib/audio';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth: () => void;
}

export function MobileDrawer({ isOpen, onClose, onOpenAuth }: MobileDrawerProps) {
  const { user, isAuthenticated, logout } = useAuth();

  const handleLinkClick = (href?: string) => (e: React.MouseEvent) => {
    if (!isAuthenticated && href && href.startsWith('/dashboard')) {
      e.preventDefault();
      audio.play('smash');
      onClose();
      onOpenAuth();
      return;
    }
    audio.play('rally');
    onClose();
  };

  const handleLogout = () => {
    audio.play('courtSqueak');
    logout();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100]"
          />

          {/* Drawer Container */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed right-0 top-0 bottom-0 w-[85%] max-w-sm bg-sl-bg border-l border-sl-border z-[101] flex flex-col justify-between overflow-y-auto shadow-2xl p-6"
          >
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-sl-border/40 pb-4">
                <span className="text-xl font-extrabold text-sl-green tracking-wider">
                  SHUTTLELIONS 🏸
                </span>
                <button
                  onClick={() => {
                    audio.play('netDrop');
                    onClose();
                  }}
                  className="p-2 rounded-lg bg-sl-panel border border-sl-border text-sl-foreground hover:bg-sl-bg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Profile Card if logged in */}
              {isAuthenticated && user && (
                <div className="shuttle-panel p-4 bg-sl-panel flex items-center gap-3">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.full_name}
                      className="w-11 h-11 rounded-full object-cover border-2 border-sl-green shadow-sm"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-sl-green text-white font-bold flex items-center justify-center text-lg border-2 border-sl-border">
                      {user.full_name?.charAt(0) || 'L'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-sl-foreground truncate">{user.full_name}</p>
                    <p className="text-[11px] text-sl-muted truncate">{user.department || user.email}</p>
                  </div>
                </div>
              )}

              {/* Navigation Links */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-sl-muted uppercase tracking-widest px-2">
                  Navigation
                </p>
                <Link
                  href="/"
                  onClick={handleLinkClick('/')}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg font-bold text-sm text-sl-foreground hover:bg-sl-green/10 hover:text-sl-green transition-colors"
                >
                  🏸 Home & Arena
                </Link>

                <Link
                  href="/dashboard/schedule"
                  onClick={handleLinkClick('/dashboard/schedule')}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg font-bold text-sm text-sl-foreground hover:bg-sl-green/10 hover:text-sl-green transition-colors"
                >
                  <Calendar className="w-4 h-4 text-sl-green" /> Games & Schedules
                </Link>

                <Link
                  href="/dashboard/community/executives"
                  onClick={handleLinkClick('/dashboard/community/executives')}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg font-bold text-sm text-sl-foreground hover:bg-sl-green/10 hover:text-sl-green transition-colors"
                >
                  <Crown className="w-4 h-4 text-sl-green" /> Executive Board
                </Link>

                <Link
                  href="/dashboard/community"
                  onClick={handleLinkClick('/dashboard/community')}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg font-bold text-sm text-sl-foreground hover:bg-sl-green/10 hover:text-sl-green transition-colors"
                >
                  <Users className="w-4 h-4 text-sl-green" /> Member Directory
                </Link>

                <Link
                  href="/dashboard/community/chat"
                  onClick={handleLinkClick('/dashboard/community/chat')}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg font-bold text-sm text-sl-foreground hover:bg-sl-green/10 hover:text-sl-green transition-colors"
                >
                  <MessageSquare className="w-4 h-4 text-sl-green" /> Community Chat
                </Link>

                <Link
                  href="/dashboard/community/votes"
                  onClick={handleLinkClick('/dashboard/community/votes')}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg font-bold text-sm text-sl-foreground hover:bg-sl-green/10 hover:text-sl-green transition-colors"
                >
                  <Vote className="w-4 h-4 text-sl-green" /> Community Votes
                </Link>

                <Link
                  href="/dashboard/shop"
                  onClick={handleLinkClick('/dashboard/shop')}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg font-bold text-sm text-sl-foreground hover:bg-sl-green/10 hover:text-sl-green transition-colors"
                >
                  <ShoppingBag className="w-4 h-4 text-sl-green" /> Equipment Shop
                </Link>

                <Link
                  href="/dashboard/media"
                  onClick={handleLinkClick('/dashboard/media')}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg font-bold text-sm text-sl-foreground hover:bg-sl-green/10 hover:text-sl-green transition-colors"
                >
                  <Video className="w-4 h-4 text-sl-green" /> Vlogs & Media
                </Link>

                <Link
                  href="/dashboard/tutorials"
                  onClick={handleLinkClick('/dashboard/tutorials')}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg font-bold text-sm text-sl-foreground hover:bg-sl-green/10 hover:text-sl-green transition-colors"
                >
                  <BookOpen className="w-4 h-4 text-sl-green" /> Drill Tutorials
                </Link>

                {isAuthenticated && (user?.role === 'admin' || user?.role === 'captain') && (
                  <Link
                    href="/dashboard/admin"
                    onClick={handleLinkClick('/dashboard/admin')}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg font-bold text-sm text-sl-warning hover:bg-sl-warning/10 transition-colors"
                  >
                    <Shield className="w-4 h-4 text-sl-warning" /> Admin Command Room
                  </Link>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-sl-border/40 space-y-3">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/dashboard/profile"
                    onClick={handleLinkClick('/dashboard/profile')}
                    className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg bg-sl-panel border border-sl-border font-bold text-xs text-sl-foreground hover:border-sl-green"
                  >
                    <User className="w-4 h-4" /> Personal Profile & ID Badge
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg text-sl-error font-bold text-xs bg-sl-error/10 hover:bg-sl-error/20"
                  >
                    <LogOut className="w-4 h-4" /> Log Out
                  </button>
                </>
              ) : (
                <ShuttleButton
                  variant="green"
                  onClick={() => {
                    audio.play('smash');
                    onClose();
                    onOpenAuth();
                  }}
                  className="w-full py-3 text-sm font-black"
                >
                  Register / Login Now ⚡
                </ShuttleButton>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
