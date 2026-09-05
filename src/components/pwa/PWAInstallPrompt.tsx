'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, Download, Share, PlusSquare, X, CheckCircle2 } from 'lucide-react';
import { audio } from '@/lib/audio';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

let globalDeferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners: Array<() => void> = [];

export function registerGlobalPWAEventListener() {
  if (typeof window === 'undefined') return;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    globalDeferredPrompt = e as BeforeInstallPromptEvent;
    listeners.forEach((l) => l());
  });

  // Register service worker
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('Service worker registration failed:', err);
      });
    });
  }
}

export function usePWAStatus() {
  const [isStandalone, setIsStandalone] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://');
      setIsStandalone(isStandaloneMode);
    };

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    checkStandalone();
    setCanInstall(Boolean(globalDeferredPrompt));

    const updateState = () => {
      setCanInstall(Boolean(globalDeferredPrompt));
      checkStandalone();
    };

    listeners.push(updateState);
    return () => {
      const idx = listeners.indexOf(updateState);
      if (idx !== -1) listeners.splice(idx, 1);
    };
  }, []);

  const triggerInstall = async (): Promise<boolean> => {
    if (!globalDeferredPrompt) return false;
    audio.haptic('tap');
    try {
      await globalDeferredPrompt.prompt();
      const choiceResult = await globalDeferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        globalDeferredPrompt = null;
        setCanInstall(false);
        return true;
      }
    } catch (err) {
      console.error('Error triggering PWA install prompt:', err);
    }
    return false;
  };

  return { isStandalone, canInstall, isIOS, triggerInstall };
}

export function PWAInstallPrompt() {
  const [dismissed, setDismissed] = useState(true);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const { isStandalone, canInstall, isIOS, triggerInstall } = usePWAStatus();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    registerGlobalPWAEventListener();

    // Check if dismissed previously within 3 days
    const dismissedAt = localStorage.getItem('shuttlelions_pwa_dismissed');
    if (dismissedAt) {
      const daysSinceDismissed = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 3) {
        setDismissed(true);
        return;
      }
    }

    // Only show prompt on mobile screens and when NOT standalone
    const isMobileViewport = window.innerWidth <= 768;
    if (isMobileViewport && !isStandalone) {
      // Delay prompt slightly for a smooth first experience
      const timer = setTimeout(() => {
        setDismissed(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isStandalone]);

  if (dismissed || isStandalone) {
    return null;
  }

  const handleDismiss = () => {
    audio.haptic('tap');
    localStorage.setItem('shuttlelions_pwa_dismissed', Date.now().toString());
    setDismissed(true);
  };

  const handleInstallClick = async () => {
    if (isIOS) {
      audio.haptic('tap');
      setShowIOSGuide(true);
      return;
    }

    if (canInstall) {
      const accepted = await triggerInstall();
      if (accepted) {
        setDismissed(true);
      }
    } else {
      // Fallback guide if browser doesn't expose deferred prompt
      setShowIOSGuide(true);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 pointer-events-auto"
      >
        <div className="bg-[#121812] border-2 border-[#00875A] text-white p-4 rounded-2xl shadow-2xl backdrop-blur-md relative">
          <button
            onClick={handleDismiss}
            aria-label="Dismiss install banner"
            className="absolute top-3 right-3 p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-3.5 pr-6">
            <div className="w-10 h-10 rounded-xl bg-[#00875A]/20 border border-[#00875A]/40 flex items-center justify-center shrink-0 text-[#00E676]">
              <Smartphone className="w-5 h-5" />
            </div>

            <div className="flex-1">
              <h4 className="text-sm font-black tracking-wide text-white uppercase">
                Install ShuttleLions App
              </h4>
              <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                Add to your home screen for quick court check-in, instant game notifications, and offline access.
              </p>

              {showIOSGuide ? (
                <div className="mt-3 p-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-zinc-200 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Share className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>1. Tap the <strong>Share</strong> button in Safari toolbar.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <PlusSquare className="w-3.5 h-3.5 text-[#00E676] shrink-0" />
                    <span>2. Scroll down and select <strong>Add to Home Screen</strong>.</span>
                  </div>
                </div>
              ) : (
                <div className="mt-3.5 flex items-center gap-2.5">
                  <button
                    onClick={handleInstallClick}
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#00875A] hover:bg-[#00A36C] text-white text-xs font-bold transition-all shadow-md active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Install App</span>
                  </button>

                  <button
                    onClick={handleDismiss}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-750 text-zinc-300 hover:text-white text-xs font-semibold transition-colors"
                  >
                    Maybe Later
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
