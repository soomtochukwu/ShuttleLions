'use client';

import { useEffect } from 'react';

// Global reference declaration
declare global {
  interface Window {
    __sl_deferred_prompt?: any;
  }
}

export function PWARegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Reliable Service Worker Registration
    if ('serviceWorker' in navigator) {
      const registerSW = () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            // Check for updates periodically
            reg.onupdatefound = () => {
              const installingWorker = reg.installing;
              if (installingWorker) {
                installingWorker.onstatechange = () => {
                  if (
                    installingWorker.state === 'installed' &&
                    navigator.serviceWorker.controller
                  ) {
                    console.info('[PWA] New version available.');
                  }
                };
              }
            };
          })
          .catch((err) => {
            console.warn('[PWA] Service worker registration error:', err);
          });
      };

      if (document.readyState === 'complete') {
        registerSW();
      } else {
        window.addEventListener('load', registerSW);
      }
    }

    // 2. Global beforeinstallprompt listener
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      window.__sl_deferred_prompt = e;
      window.dispatchEvent(new CustomEvent('sl_pwa_prompt_ready'));
    };

    const handleAppInstalled = () => {
      window.__sl_deferred_prompt = null;
      window.dispatchEvent(new CustomEvent('sl_pwa_installed'));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  return null;
}
