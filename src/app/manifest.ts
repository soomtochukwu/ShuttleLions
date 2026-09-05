import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ShuttleLions UNN | Badminton Club',
    short_name: 'ShuttleLions',
    description: 'Official Badminton Club of University of Nigeria, Nsukka. Training schedules, RSVPs, tournaments, and athlete ID pass.',
    start_url: '/dashboard',
    scope: '/',
    display: 'standalone',
    background_color: '#0A0F0A',
    theme_color: '#00875A',
    orientation: 'portrait',
    icons: [
      {
        src: '/favicon.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/favicon.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
