export interface ParallaxLayerConfig {
 id: string;
 name: string;
 src: string; // Local path in /public or remote image URL
 alt: string;
 depthMultiplier: number; // Negative = slower/farther, Positive = faster/closer
 scaleRange: [number, number]; // [initialScale, targetScale]
 opacityRange?: [number, number];
 position: 'center' | 'left' | 'right' | 'full';
 fallbackTitle: string;
 fallbackSubtitle: string;
}

export const PARALLAX_ASSETS_CONFIG: Record<string, ParallaxLayerConfig> = {
  courtEntrance: {
    id: 'courtEntrance',
    name: 'Badminton Court Arena Entrance',
    src: '/images/parallax/court-entrance.jpg',
    alt: 'UNN Indoor Badminton Arena Court Entrance',
    depthMultiplier: -0.25,
    scaleRange: [1.15, 1.0],
    position: 'full',
    fallbackTitle: 'UNN INDOOR SPORTS HALL',
    fallbackSubtitle: 'Championship Badminton Arena • Nsukka Campus',
  },
  playerServer: {
    id: 'playerServer',
    name: 'Serving Badminton Athlete',
    src: '/images/parallax/player-server.png',
    alt: 'ShuttleLions varsity athlete preparing explosive service',
    depthMultiplier: 0.15,
    scaleRange: [0.95, 1.05],
    position: 'left',
    fallbackTitle: 'THE SERVE',
    fallbackSubtitle: 'Forehand High Lift & Backhand Flick Drill',
  },
  playerReceiver: {
    id: 'playerReceiver',
    name: 'Receiving Badminton Athlete',
    src: '/images/parallax/player-receiver.png',
    alt: 'ShuttleLions varsity athlete in ready stance to smash return',
    depthMultiplier: 0.18,
    scaleRange: [0.95, 1.05],
    position: 'right',
    fallbackTitle: 'THE RECEIVE',
    fallbackSubtitle: 'Smash Return & Court Coverage',
  },
  courtFloorOverlay: {
    id: 'courtFloorOverlay',
    name: 'Perspective Court Markings',
    src: '/images/parallax/court-floor.png',
    alt: 'Standard BWF Badminton Court Green Mat & Boundary Lines',
    depthMultiplier: -0.1,
    scaleRange: [1.0, 1.0],
    position: 'center',
    fallbackTitle: 'BWF REGULATION COURT',
    fallbackSubtitle: 'Standard Singles & Doubles Boundaries',
  },
};

import { useCachedQuery } from '@/lib/client-cache';
import { supabase } from '@/lib/supabase';

export function useParallaxConfig() {
  const { data: config, setData: setConfig, isLoading, refetch } = useCachedQuery<Record<string, ParallaxLayerConfig>>({
    key: 'parallax_settings',
    initialFallback: PARALLAX_ASSETS_CONFIG,
    fetcher: async () => {
      const { data, error } = await supabase.from('site_assets').select('*');
      if (error || !data || data.length === 0) return PARALLAX_ASSETS_CONFIG;

      const merged = { ...PARALLAX_ASSETS_CONFIG };
      data.forEach((row: any) => {
        if (merged[row.id]) {
          merged[row.id] = {
            ...merged[row.id],
            name: row.name || merged[row.id].name,
            src: row.asset_url || merged[row.id].src,
            alt: row.alt_text || merged[row.id].alt,
            depthMultiplier: typeof row.depth_multiplier === 'number' ? Number(row.depth_multiplier) : merged[row.id].depthMultiplier,
            scaleRange: [
              typeof row.scale_min === 'number' ? Number(row.scale_min) : merged[row.id].scaleRange[0],
              typeof row.scale_max === 'number' ? Number(row.scale_max) : merged[row.id].scaleRange[1],
            ],
          };
        }
      });
      return merged;
    },
  });

  return { config, setConfig, isLoading, refetch };
}
