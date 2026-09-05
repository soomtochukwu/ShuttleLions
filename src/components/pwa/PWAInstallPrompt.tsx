'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Smartphone,
  Download,
  Share,
  PlusSquare,
  X,
  MoreVertical,
  Monitor,
} from 'lucide-react';
import { audio } from '@/lib/audio';

export type SupportedPlatform = 'android' | 'ios' | 'desktop';

export function usePWAStatus() {
  const [isStandalone, setIsStandalone] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [platform, setPlatform] = useState<SupportedPlatform>('desktop');

  const checkState = useCallback(() => {
    if (typeof window === 'undefined') return;

    // Standalone detection
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');
    setIsStandalone(isStandaloneMode);

    // Platform detection
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice =
      /iphone|ipad|ipod/.test(userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isAndroidDevice = /android/.test(userAgent);

    if (isIosDevice) {
      setPlatform('ios');
    } else if (isAndroidDevice) {
      setPlatform('android');
    } else {
      setPlatform('desktop');
    }

    setCanInstall(Boolean(window.__sl_deferred_prompt));
  }, []);

  useEffect(() => {
    checkState();

    const onPromptReady = () => checkState();
    const onInstalled = () => {
      setCanInstall(false);
      setIsStandalone(true);
    };

    window.addEventListener('sl_pwa_prompt_ready', onPromptReady);
    window.addEventListener('sl_pwa_installed', onInstalled);

    return () => {
      window.removeEventListener('sl_pwa_prompt_ready', onPromptReady);
      window.removeEventListener('sl_pwa_installed', onInstalled);
    };
  }, [checkState]);

  const triggerInstall = async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false;
    const promptEvent = window.__sl_deferred_prompt;
    if (!promptEvent) return false;

    audio.haptic('tap');
    try {
      await promptEvent.prompt();
      const choiceResult = await promptEvent.userChoice;
      if (choiceResult.outcome === 'accepted') {
        window.__sl_deferred_prompt = null;
        setCanInstall(false);
        setIsStandalone(true);
        return true;
      }
    } catch (err) {
      console.warn('[PWA] Native install prompt error:', err);
    }
    return false;
  };

  return {
    isStandalone,
    canInstall,
    platform,
    isIOS: platform === 'ios',
    isAndroid: platform === 'android',
    isDesktop: platform === 'desktop',
    triggerInstall,
  };
}

export function PWAInstallPrompt() {
  const [dismissed, setDismissed] = useState(true);
  const [showGuide, setShowGuide] = useState(false);
  const { isStandalone, canInstall, platform, triggerInstall } = usePWAStatus();
  const [guideTab, setGuideTab] = useState<SupportedPlatform>(platform);

  useEffect(() => {
    setGuideTab(platform);
  }, [platform]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if dismissed previously within 3 days
    const dismissedAt = localStorage.getItem('shuttlelions_pwa_dismissed');
    if (dismissedAt) {
      const daysSinceDismissed = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 3) {
        setDismissed(true);
        return;
      }
    }

    if (!isStandalone) {
      const timer = setTimeout(() => {
        setDismissed(false);
      }, 2500);
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
    if (canInstall) {
      const accepted = await triggerInstall();
      if (accepted) {
        setDismissed(true);
      }
    } else {
      setShowGuide(true);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed bottom-20 sm:bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 pointer-events-auto"
      >
        <div className="bg-[#121812] border-2 border-sl-green text-white p-4 sm:p-5 rounded-2xl shadow-2xl backdrop-blur-md relative">
          <button
            onClick={handleDismiss}
            aria-label="Dismiss install banner"
            className="absolute top-3 right-3 p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-3.5 pr-6">
            <div className="w-10 h-10 rounded-xl bg-sl-green/20 border border-sl-green/40 flex items-center justify-center shrink-0 text-sl-green-glow">
              <Smartphone className="w-5 h-5" />
            </div>

            <div className="flex-1 space-y-2">
              <div>
                <h4 className="text-sm font-black tracking-wide text-white uppercase">
                  Install ShuttleLions PWA
                </h4>
                <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                  Add to your home screen or desktop for offline schedules, court check-in, and instant game alerts.
                </p>
              </div>

              {showGuide ? (
                <div className="mt-3 p-3 rounded-xl bg-black/50 border border-white/10 space-y-2.5">
                  {/* Platform tabs */}
                  <div className="flex items-center gap-1 border-b border-white/10 pb-2">
                    <button
                      type="button"
                      onClick={() => setGuideTab('android')}
                      className={`px-2 py-0.5 text-[10px] font-black uppercase rounded cursor-pointer ${
                        guideTab === 'android' ? 'bg-sl-green text-white' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Android
                    </button>
                    <button
                      type="button"
                      onClick={() => setGuideTab('ios')}
                      className={`px-2 py-0.5 text-[10px] font-black uppercase rounded cursor-pointer ${
                        guideTab === 'ios' ? 'bg-sl-green text-white' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Apple iOS
                    </button>
                    <button
                      type="button"
                      onClick={() => setGuideTab('desktop')}
                      className={`px-2 py-0.5 text-[10px] font-black uppercase rounded cursor-pointer ${
                        guideTab === 'desktop' ? 'bg-sl-green text-white' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Desktop
                    </button>
                  </div>

                  {guideTab === 'android' && (
                    <div className="space-y-1.5 text-xs text-zinc-200">
                      <div className="flex items-center gap-2">
                        <MoreVertical className="w-3.5 h-3.5 text-sl-green-glow shrink-0" />
                        <span>1. Tap Chrome&apos;s menu (three vertical dots ⋮).</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Download className="w-3.5 h-3.5 text-sl-green-glow shrink-0" />
                        <span>2. Select <strong>Install app</strong> or <strong>Add to Home screen</strong>.</span>
                      </div>
                    </div>
                  )}

                  {guideTab === 'ios' && (
                    <div className="space-y-1.5 text-xs text-zinc-200">
                      <div className="flex items-center gap-2">
                        <Share className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span>1. Tap the <strong>Share</strong> icon in Safari toolbar.</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <PlusSquare className="w-3.5 h-3.5 text-sl-green-glow shrink-0" />
                        <span>2. Scroll down and select <strong>Add to Home Screen</strong>.</span>
                      </div>
                    </div>
                  )}

                  {guideTab === 'desktop' && (
                    <div className="space-y-1.5 text-xs text-zinc-200">
                      <div className="flex items-center gap-2">
                        <Monitor className="w-3.5 h-3.5 text-sl-green-glow shrink-0" />
                        <span>1. Click the <strong>Install</strong> icon in the address bar.</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MoreVertical className="w-3.5 h-3.5 text-sl-green-glow shrink-0" />
                        <span>2. Or click browser menu ⋮ &rarr; <strong>Install ShuttleLions</strong>.</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="pt-2 flex items-center gap-2.5">
                  <button
                    onClick={handleInstallClick}
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-sl-green hover:bg-sl-green-glow hover:text-black text-white text-xs font-black transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{canInstall ? 'Install App' : 'How to Install'}</span>
                  </button>

                  <button
                    onClick={handleDismiss}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-bold transition-colors cursor-pointer"
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
