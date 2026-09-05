export interface BadmintonTutorial {
  id: string;
  title: string;
  subtitle: string;
  category: 'basics' | 'footwork' | 'strokes' | 'rules' | 'tactics' | 'conditioning';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  read_time_min: number;
  summary: string;
  hero_image?: string;
  secondary_image?: string;
  video_url?: string;
  key_takeaways: string[];
  coaching_drills: string[];
  sections: {
    heading: string;
    content: string;
    bullet_points?: string[];
    coach_tip?: string;
  }[];
}

export const BADMINTON_TUTORIALS: BadmintonTutorial[] = [
  {
    id: 'tutorial-bwf-rules-boundaries',
    title: 'Official BWF Rules, Court Boundaries & 21-Point Scoring',
    subtitle: 'Everything you need to know about serving laws, deuce, boundary lines, and match regulations',
    category: 'rules',
    difficulty: 'beginner',
    read_time_min: 8,
    summary:
      'A complete breakdown of international Badminton World Federation (BWF) laws: the 21-point rally scoring system, 30-point sudden death cap, singles vs doubles boundaries, and the 1.15m serving rule.',
    hero_image: '/images/tutorials/tutorial_server_stance.jpg',
    key_takeaways: [
      'Points are scored on EVERY rally regardless of who served (Rally Point System).',
      'Matches are played best of 3 games to 21 points; at 20-20, you must win by 2 points up to a hard cap of 30.',
      'Singles serve is "Long & Narrow"; Doubles serve is "Short & Wide".',
      'The entire shuttlecock must be struck below 1.15m from the court surface during service.',
      'Touching the net with your racket, body, or clothing during play is an immediate fault.',
    ],
    coaching_drills: [
      'Service Box Precision: Place 3 shuttle tubes in the rear doubles service line corners; hit 20 low serves attempting to knock them over.',
      'Call the Line Drill: Partner hits random shots near lines; practice immediate "In" or "Out" vocal calls before the shuttle lands.',
    ],
    sections: [
      {
        heading: '1. The 21-Point Rally Scoring System & Deuce Rules',
        content:
          'Badminton uses the 3×21 rally points scoring system. A point is awarded on every rally, meaning you can score whether you are serving or receiving. A standard match is decided by the best of 3 games.',
        bullet_points: [
          'Standard Game: The first side to reach 21 points wins the game.',
          'Deuce (20–20): If the score reaches 20–20, play continues until one side gains a 2-point lead (e.g., 22–20, 24–22).',
          'The 30-Point Sudden Death Cap: If the score reaches 29–29, the side scoring the 30th point wins the game outright (30–29). There is no requirement for a 2-point lead at 29-all.',
          'Intervals: A 60-second break occurs when the leading score reaches 11 points. A 120-second break is allowed between games. In Game 3, players change ends when the leading score hits 11.',
        ],
        coach_tip:
          'At 20-all or 29-all, never rush your serve. Take your full 5 seconds to settle your heart rate and breathe.',
      },
      {
        heading: '2. Court Boundaries: Singles vs Doubles',
        content:
          'The badminton court measures 13.40 meters (44 feet) in total length and 6.10 meters (20 feet) in total width. The lines on court change depending on whether you are playing Singles or Doubles, and whether you are serving or in an active rally.',
        bullet_points: [
          'Singles Service: "Long & Narrow" — In-bounds area uses the inner sidelines and extends all the way back to the rear baseline. The side tramlines are out.',
          'Singles Rally: "Long & Narrow" — Same as the service area; the outer side alleys remain out-of-bounds for the entire game.',
          'Doubles Service: "Short & Wide" — In-bounds area uses the outer sidelines (side alleys are in!), but CANNOT pass the inside doubles long service line (0.76m in front of the baseline).',
          'Doubles Rally: "Full Court" — Once the serve is returned, the entire 6.10m × 13.40m perimeter is valid. Both side tramlines and back baseline are in.',
        ],
        coach_tip:
          'Remember the golden mantra: "Singles is long and thin; Doubles serve is wide and trimmed."',
      },
      {
        heading: '3. The 1.15-Meter Service Law & Server Positioning',
        content:
          'According to BWF Law 9.1.6, the entire shuttlecock must be below 1.15 meters from the surface of the court at the exact instant of being struck by the server’s racket.',
        bullet_points: [
          'Diagonal Service: The serve must always travel diagonally across the net into the opponent’s opposite service box.',
          'Even Scores (0, 2, 4, 6...): The server serves from the Right Service Court to the opponent’s right box.',
          'Odd Scores (1, 3, 5, 7...): The server serves from the Left Service Court to the opponent’s left box.',
          'Stationary Feet: Both server and receiver must have some part of both feet in a stationary contact with the court floor inside their respective service boxes until the racket strikes the shuttle.',
          'Continuous Motion: The backward-to-forward swinging motion of the server’s racket must be smooth and unbroken without feints or stops.',
        ],
        coach_tip:
          'Never step on any boundary line while serving or receiving — touching the white line before contact is an automatic line fault.',
      },
      {
        heading: '4. Faults and Lets (Replays)',
        content:
          'Understanding faults prevents giving away free points. If a fault occurs, the rally immediately ends and the opponent is awarded a point.',
        bullet_points: [
          'Net Touch: Touching the net or net posts with your racket, body, or shirt while the shuttle is in play is a fault.',
          'Over the Net: Striking the shuttle before it crosses your side of the net is a fault. However, following through across the net after hitting the shuttle on your own side is legal.',
          'Double Hit: Striking the shuttle twice in succession by the same player or both partners is a fault.',
          'Obstruction: Deliberately shouting, waving arms, or blocking an opponent’s racket when they are hitting near the net.',
          'Lets (Replays): A "Let" is called by the umpire to replay the point if the server serves before the receiver is ready, if a stray shuttle enters the court, or if the shuttle disintegrates in mid-air.',
        ],
      },
    ],
  },
  {
    id: 'tutorial-grip-and-stance',
    title: 'Grip Mechanics, Ready Stance & Racket Anatomy',
    subtitle: 'Master the V-grip, backhand thumb bevel, and the 150ms split-step reflex',
    category: 'basics',
    difficulty: 'beginner',
    read_time_min: 6,
    summary:
      'The racket handle is octagonal for a reason. Learn how to switch between forehand, backhand, and panhandle grips in a fraction of a second, and posture your body for explosive court coverage.',
    hero_image: '/images/tutorials/tutorial_forehand_grip.jpg',
    secondary_image: '/images/tutorials/tutorial_receiver_ready.jpg',
    key_takeaways: [
      'Never hold the racket with a clenched fist ("frying pan grip"); hold it like a gentle handshake with a V-channel.',
      'Use the wide flat bevel for the thumb in backhand strokes to generate push leverage.',
      'The split-step is a micro-hop executed the millisecond your opponent contacts the shuttlecock.',
      'Keep your non-racket arm raised for balance and court triangulation.',
    ],
    coaching_drills: [
      'Grip Switching Shadow Drill: Spin the racket in your fingers and alternate rapidly between forehand V-grip and backhand bevel grip (60 reps).',
      'Split-Step Reaction Drill: Partner drops a shuttlecock from shoulder height; you split-step and catch it before it bounces twice.',
    ],
    sections: [
      {
        heading: '1. The Forehand "V" Grip (Shakehand)',
        content:
          'The forehand grip is the fundamental foundation of all overhead clears, drops, smashes, and forehand drives. Hold the racket as if you are shaking hands with an old friend.',
        bullet_points: [
          'Forming the "V": The V-shaped ridge formed between your thumb and index finger should run directly down the top narrow bevel of the handle.',
          'Finger Spacing: Your index finger should be curled slightly higher up the handle (the "trigger finger"), providing tactile directional control.',
          'Grip Relaxation: Hold the racket with roughly 30% grip tension during preparation. Only tighten to 100% at the instant of impact.',
        ],
        coach_tip:
          'If your knuckles hurt after 20 minutes, you are squeezing the handle like a hammer. Relax your fingers; power comes from forearm whip, not grip squeeze.',
      },
      {
        heading: '2. The Backhand "Thumb" Grip',
        content:
          'For backhand lifts, net defense, and flat drives, the thumb is your primary power driver. Do not wrap your thumb around your fingers.',
        bullet_points: [
          'Thumb Placement: Place the flat pad of your thumb squarely against the widest flat bevel of the octagonal handle.',
          'Air Space in Palm: Maintain a pocket of air between your palm and the handle. The racket should be manipulated by the fingers, not the meat of your palm.',
          'Lever Action: Press the thumb forward like a lever while pulling the bottom fingers inward to generate sharp rotational speed.',
        ],
      },
      {
        heading: '3. The Neutral Ready Stance & The Split-Step Engine',
        content:
          'Standing flat-footed adds 300ms to your reaction time, which in badminton is the difference between a winning kill and missing the shuttle entirely.',
        bullet_points: [
          'Athletic Base: Feet shoulder-width apart, knees flexed and soft, weight resting on the balls of your feet.',
          'Racket Upright: Racket head held at chest/eye level, elbow pointing forward and away from your ribs.',
          'The Split-Step: A subtle 2-inch hop performed precisely when the opponent strikes the shuttle. As your feet land slightly wider than shoulder-width, your Achilles tendons act as loaded springs, firing you instantaneously in any of the 6 court directions.',
        ],
        coach_tip:
          'Watch the opponent’s racket head, not the shuttlecock in flight. The split-step timing must coincide with their racket contact sound.',
      },
    ],
  },
  {
    id: 'tutorial-6-core-strokes',
    title: 'The 6 Core Strokes & Biomechanical Power Chains',
    subtitle: 'High clear, drop shot, overhead smash, flat drive, tumbling net shot, and underhand lift',
    category: 'strokes',
    difficulty: 'intermediate',
    read_time_min: 10,
    summary:
      'Master the full arsenal of badminton strokes. Understand forearm pronation, steep racket face angles, and how the kinetic chain generates 400+ km/h smashes from a 85g racket.',
    hero_image: '/images/tutorials/tutorial_jump_smash.jpg',
    key_takeaways: [
      'The High Clear pushes opponents deep into their rear court to reset rally tempo.',
      'Smashes require contact 30cm in front of your body with full forearm pronation.',
      'Drop shots must mimic your smash preparation right up until the final millisecond of soft touch.',
      'Flat drives in doubles require compact racket strokes without excessive backswings.',
    ],
    coaching_drills: [
      'Clear-to-Clear Rally Drill: Two athletes rally baseline-to-baseline clears continuously, aiming to land inside the doubles long service box (target: 30 consecutive clears).',
      'Smash & Net Follow-up Drill: Feeder lifts to rear court; striker executes a jump smash down the line, follows the shot forward, and kills the loose net return.',
    ],
    sections: [
      {
        heading: '1. The Overhead Jump Smash (Terminal Attack)',
        content:
          'The badminton smash is the fastest projectile speed in all of racket sports, exceeding 400 km/h in elite competition. Generating power requires sequential kinetic chain activation.',
        bullet_points: [
          'Kinetic Chain: Legs drive upward $\\rightarrow$ hip rotates forward $\\rightarrow$ chest opens $\\rightarrow$ elbow leads $\\rightarrow$ forearm pronates vigorously $\\rightarrow$ wrist snaps downward.',
          'Apex Contact: Contact the shuttle at maximum reach, approximately 30cm in front of your racket-side shoulder.',
          'Follow-Through: Racket finishes diagonally across your body near your opposite hip to decelerate safely without shoulder strain.',
        ],
        coach_tip:
          'A steep smash at 250 km/h is far more dangerous than a flat smash at 350 km/h. Prioritize downward angle over raw speed.',
      },
      {
        heading: '2. The High Defensive Clear (Tempo Reset)',
        content:
          'When you are pushed out of position or under heavy pressure, the high clear is your lifeline. It sends the shuttlecock high toward the gym ceiling so it decelerates and falls vertically onto the opponent’s baseline.',
        bullet_points: [
          'Trajectory Apex: Aim for the highest allowable clearance under the gymnasium beams.',
          'Racket Angle: Flat contact face tilted slightly upward at 45 degrees.',
          'Recovery: While the shuttle is high in flight, you have 1.5 to 2 full seconds to recover to the central T-base position.',
        ],
      },
      {
        heading: '3. The Slice Drop Shot (Deceptive Soft Touch)',
        content:
          'The effectiveness of a drop shot depends 90% on disguise. Your preparation, footwork, and shoulder turn must be completely indistinguishable from a full power smash.',
        bullet_points: [
          'Disguised Preparation: Draw your elbow high and cock your racket exactly as if winding up for a smash.',
          'Soft Contact: At the final millisecond, decelerate the racket head or slice the outer edge of the feathers at a 30-degree bevel.',
          'Landing Zone: The shuttle should skim 2 inches over the white net tape and drop steeply before the opponent’s short service line.',
        ],
      },
      {
        heading: '4. Flat Drives & Net Play',
        content:
          'Drives are rapid, waist-height exchanges that skim parallel to the net. Net play involves tumbling hairpin shots that force the opponent to lift.',
        bullet_points: [
          'Drive Mechanics: Short, punchy forearm extension without a full looping backswing. Grip should be held in the neutral bevel position.',
          'Hairpin Net Shot: Lunge forward with your racket foot, extend your arm, and let the shuttle bounce gently off the horizontal strings with zero racket swing.',
          'Brush Net Kill: If the opponent leaves a loose shuttlecock floating above net height, swipe horizontally across the tape like a windshield wiper to kill it downward into the floor.',
        ],
      },
    ],
  },
  {
    id: 'tutorial-6-corner-footwork',
    title: '6-Corner Court Footwork & The Split-Step Engine',
    subtitle: 'Chassé steps, scissor kicks, lunges, and effortless court recovery',
    category: 'footwork',
    difficulty: 'intermediate',
    read_time_min: 7,
    summary:
      'Badminton is played with your feet, not your arms. Learn the classical 6-corner court movement system that guarantees you never get caught flat-footed or off-balance.',
    hero_image: '/images/tutorials/tutorial_receiver_ready.jpg',
    key_takeaways: [
      'Every movement pattern begins with the split-step pre-hop.',
      'Always lunge with your racket-side foot forward when striking in the front court.',
      'Use the scissor kick in the rear court to exchange feet in mid-air for instant forward momentum.',
      'Never run facing the back wall; rotate your hips and move with side-crossover steps.',
    ],
    coaching_drills: [
      '6-Corner Shadow Footwork: Coach calls random corner numbers (1 to 6); athlete split-steps and moves to that corner, executes a shadow stroke, and recovers to center in under 2.5 seconds (sets of 20).',
      'Continuous Lunge & Pushback: Perform 10 consecutive deep lunges to the front T, pushing back explosively off the front heel.',
    ],
    sections: [
      {
        heading: '1. The 6 Corners of the Badminton Court',
        content:
          'The court is divided into six distinct target zones from your central "T" base: Front-Left (Net), Front-Right (Net), Mid-Left (Defense), Mid-Right (Defense), Rear-Left (Round-the-Head), and Rear-Right (Forehead Deep).',
        bullet_points: [
          'Front Corners: 2 to 3 steps concluding in an extended lunge on your dominant heel.',
          'Midcourt Sides: 1 explosive lateral chassé step to defend against body smashes.',
          'Rear Corners: Pivot hip 90 degrees, crossover step, and launch into a rear scissor kick.',
        ],
        coach_tip:
          'Always land heel-first on your front lunge to protect your knee ligaments and absorb deceleration shock.',
      },
      {
        heading: '2. The Scissor Kick in the Rear Court',
        content:
          'When retreating to the back baseline for an overhead smash or clear, the scissor kick allows you to hit with full body weight behind the shuttle while simultaneously initiating your recovery.',
        bullet_points: [
          'Takeoff: Leap off your rear racket-side foot as your racket winds up.',
          'Mid-Air Exchange: In mid-air, kick your non-racket leg backward while your racket leg swings forward.',
          'Landing: Land on your non-racket foot first, with your racket foot already planting forward to propel you back toward the center T.',
        ],
      },
    ],
  },
  {
    id: 'tutorial-doubles-tactics-formations',
    title: 'Doubles Formations & Rotation Tactics',
    subtitle: 'Front-and-Back Attack vs Side-by-Side Defense, rotation triggers, and mixed doubles play',
    category: 'tactics',
    difficulty: 'advanced',
    read_time_min: 9,
    summary:
      'In doubles, individual skill matters far less than seamless court rotation. Master the attack-to-defense transitions and learn how to communicate without speaking a word.',
    hero_image: '/images/tutorials/tutorial_server_stance.jpg',
    secondary_image: '/images/tutorials/tutorial_jump_smash.jpg',
    key_takeaways: [
      'Attacking Formation: Front & Back — rear player hits downward smashes/drops; front player hunts net kills.',
      'Defensive Formation: Side by Side — when forced to lift, both players split side-by-side to cover downward smashes.',
      'Rotation Trigger 1: Whenever you lift the shuttle $\\rightarrow$ split Side-by-Side immediately.',
      'Rotation Trigger 2: Whenever the opponent lifts $\\rightarrow$ rotate Front-and-Back immediately.',
    ],
    coaching_drills: [
      'Attack vs Defense Half-Court Drill: Attacking pair attacks continuously with smashes/drops; defending pair must return flat or lift cross-court (5-minute non-stop rotation).',
      'Doubles Short Serve Return Rush: Server serves low; receiver rushes the tape to push flat into the deep alleys.',
    ],
    sections: [
      {
        heading: '1. The Golden Rule of Doubles: Downward Pressure',
        content:
          'The team that keeps the shuttlecock moving downward wins 80% of doubles rallies. If you hit downward, you attack; if you hit upward (lift), you must defend.',
        bullet_points: [
          'Front-and-Back (Attack): One player commands the rear 40% of the court, delivering steep smashes and slice drops. The front player crouches at the T with racket held high at eye level to intercept any weak block.',
          'Side-by-Side (Defense): When forced to lift the shuttle high, both partners immediately retreat side-by-side, each guarding half the court width (3.05m each) against the opponent’s smash.',
        ],
      },
      {
        heading: '2. The Rotation Triggers (When to Shift)',
        content:
          'Confusion between partners creates open spaces. Automatic rotation rules eliminate collision and hesitation.',
        bullet_points: [
          'If YOU play a high lift: Immediately shout or visually split into side-by-side defense.',
          'If YOU play a tight drop or smash: The non-hitting partner steps forward to clamp the net, forming the front-back attack.',
          'Middle Shuttle Priority: By international convention, shots traveling directly down the center line are taken by the player with their FOREHAND facing the middle.',
        ],
        coach_tip:
          'In mixed doubles, the female athlete typically commands the front T-zone, cutting off net shots, while the male athlete covers the rear baseline.',
      },
    ],
  },
  {
    id: 'tutorial-singles-court-geometry',
    title: 'Singles Strategy: 4-Corner Pinning & Rally Construction',
    subtitle: 'Diagonal pressure, exploiting the backhand corner, and pacing the rally',
    category: 'tactics',
    difficulty: 'advanced',
    read_time_min: 8,
    summary:
      'Singles is an endurance chess match. Learn how to stretch your opponent diagonally into the 4 corners, control the center T, and pounce on the loose reply.',
    hero_image: '/images/tutorials/tutorial_receiver_ready.jpg',
    key_takeaways: [
      'The "Center T" is your castle: whoever controls the T controls the rally.',
      'Alternate corners diagonally: high clear to rear-left, followed by a slice drop to front-right.',
      'Attack the opponent’s deep backhand corner (the weakest biomechanical strike in badminton).',
      'Vary your rally tempo between slow defensive lifts and sudden explosive punch clears.',
    ],
    coaching_drills: [
      'Cross-Court 4-Corner Drill: Player A hits only straight; Player B hits only cross-court (forces both players to cover the maximum 14-meter court diagonals).',
      'Restricted Area Game: Play 11-point singles where any shuttle landing in the midcourt is an automatic loss of point.',
    ],
    sections: [
      {
        heading: '1. The 4-Corner Pinning Strategy',
        content:
          'The longest distance on a badminton court is the diagonal (approx 14.2 meters from rear-left to front-right). Forcing your opponent to traverse this diagonal repeatedly drains their physical stamina and breaks their shot accuracy.',
        bullet_points: [
          'Pattern 1: Deep attacking clear to the opponent’s rear backhand corner $\\rightarrow$ anticipate their weak straight drop $\\rightarrow$ hairpin net shot cross-court.',
          'Pattern 2: Fast flat drive down the tramline $\\rightarrow$ split-step immediately to intercept their cross-court reply.',
        ],
        coach_tip:
          'Never hit two consecutive shots to the same corner unless your opponent is clearly out of position or falling over.',
      },
      {
        heading: '2. Deception and Delayed Timing',
        content:
          'Elite singles players do not just hit hard; they hold their shots for an extra 100 milliseconds to freeze the opponent before deciding the trajectory.',
        bullet_points: [
          'The Stop-Drop: Prepare for a massive jump smash, hold your racket back until the very last split-second, then tap softly over the net.',
          'Cross-Court Net Flick: Lunge to the net with a flat racket face as if playing a tumble, then flick your wrist at the last moment to hoist deep to the opposite baseline.',
        ],
      },
    ],
  },
];
