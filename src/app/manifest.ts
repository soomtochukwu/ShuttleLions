import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ShuttleLions - UNN Badminton Club',
    short_name: 'ShuttleLions',
    description:
      'Official Badminton Club of University of Nigeria, Nsukka. Training schedules, court RSVPs, tournaments, equipment shop, and athlete digital ID pass.',
    id: '/?source=pwa',
    start_url: '/?source=pwa',
    scope: '/',
    display: 'standalone',
    display_override: ['standalone', 'minimal-ui', 'window-controls-overlay'],
    background_color: '#0A0F0A',
    theme_color: '#00875A',
    orientation: 'portrait',
    categories: ['sports', 'lifestyle', 'education'],
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-maskable-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    screenshots: [
      {
        src: '/icons/screenshot-narrow.png',
        sizes: '540x960',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'ShuttleLions Athlete Hub Mobile View',
      },
      {
        src: '/icons/screenshot-wide.png',
        sizes: '1280x720',
        type: 'image/png',
        form_factor: 'wide',
        label: 'ShuttleLions Desktop Command Center',
      },
    ],
  };
}
