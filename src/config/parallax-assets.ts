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
    id: 'court-entrance',
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
    id: 'player-server',
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
    id: 'player-receiver',
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
    id: 'court-floor',
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
