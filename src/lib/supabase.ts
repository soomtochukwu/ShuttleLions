import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// ---- Types ----

export type Profile = {
  id: string;
  auth_user_id: string;
  email: string;
  full_name: string;
  phone: string | null;
  faculty: string;
  department: string;
  level: string;
  reg_number: string | null;
  avatar_url: string | null;
  role: 'member' | 'admin' | 'captain';
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Payment = {
  id: string;
  profile_id: string;
  type: 'registration' | 'monthly' | 'racket';
  amount_kobo: number;
  status: 'pending' | 'success' | 'failed' | 'refunded';
  reference: string;
  provider: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

export type RacketOrder = {
  id: string;
  profile_id: string;
  racket_model: string;
  quantity: number;
  unit_price_kobo: number;
  total_price_kobo: number;
  status: 'pending' | 'confirmed' | 'ordered' | 'shipped' | 'delivered' | 'cancelled';
  payment_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type EventItem = {
  id: string;
  title: string;
  description: string;
  event_type: 'training' | 'competition' | 'social' | 'meeting' | 'workshop';
  location: string;
  start_at: string;
  end_at: string;
  is_recurring: boolean;
  recurrence_rule: string | null;
  created_by: string | null;
  status: 'upcoming' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
};

export type EventRSVP = {
  id: string;
  event_id: string;
  profile_id: string;
  status: 'going' | 'maybe' | 'not_going';
  created_at: string;
  updated_at: string;
};

export type ChatChannel = {
  id: string;
  name: string;
  description: string;
  is_default: boolean;
  icon: string;
  created_by: string | null;
  created_at: string;
};

export type ChatMessage = {
  id: string;
  channel_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'system' | 'announcement';
  media_url: string | null;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  sender?: Profile;
};

export type Poll = {
  id: string;
  title: string;
  description: string;
  poll_type: 'single' | 'multi';
  status: 'active' | 'closed';
  closes_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  options?: PollOption[];
  has_voted?: boolean;
  voted_option_id?: string;
};

export type PollOption = {
  id: string;
  poll_id: string;
  option_text: string;
  vote_count: number;
  display_order: number;
};

export type PollVote = {
  id: string;
  poll_id: string;
  option_id: string;
  voter_id: string;
  created_at: string;
};

export type MediaUpload = {
  id: string;
  uploader_id: string;
  title: string;
  description: string;
  media_type: 'video' | 'image' | 'vlog';
  media_url: string;
  thumbnail_url: string | null;
  category: 'training' | 'competition' | 'social' | 'highlights' | 'drills';
  likes_count: number;
  views_count: number;
  created_at: string;
  updated_at: string;
  uploader?: Profile;
  has_liked?: boolean;
};

export type MediaComment = {
  id: string;
  media_id: string;
  commenter_id: string;
  content: string;
  created_at: string;
  commenter?: Profile;
};

export type ShopProduct = {
  id: string;
  name: string;
  description: string;
  category: 'racket' | 'shuttlecock' | 'grip' | 'string' | 'shoes' | 'bag' | 'apparel';
  brand: string;
  price_kobo: number;
  image_url: string | null;
  stock_status: 'in_stock' | 'pre_order' | 'out_of_stock';
  specs: Record<string, string> | null;
  created_at: string;
  updated_at: string;
};

export type ShopOrder = {
  id: string;
  profile_id: string;
  product_id: string;
  quantity: number;
  total_price_kobo: number;
  assigned_executive_id: string | null;
  status: 'pending' | 'confirmed' | 'procuring' | 'ready_for_pickup' | 'delivered' | 'cancelled';
  payment_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  product?: ShopProduct;
};

export type Tutorial = {
  id: string;
  author_id: string | null;
  title: string;
  summary: string;
  content_md: string;
  video_url: string | null;
  thumbnail_url: string | null;
  category: 'basics' | 'footwork' | 'strokes' | 'tactics' | 'rules' | 'conditioning';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  read_time_min: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type NotificationItem = {
  id: string;
  profile_id: string;
  type: 'general' | 'payment' | 'event' | 'poll' | 'order' | 'chat';
  title: string;
  body: string;
  link_url: string | null;
  is_read: boolean;
  created_at: string;
};

export type SiteAsset = {
  id: string;
  name: string;
  asset_url: string;
  alt_text: string;
  depth_multiplier: number;
  scale_min: number;
  scale_max: number;
  updated_by: string | null;
  updated_at: string;
};

// ---- Mock Data for Seamless Demo / Offline Mode ----

const STORAGE_PREFIX = 'shuttlelions_mock_';

const MOCK_PROFILES: Profile[] = [
  {
    id: 'student-1',
    auth_user_id: 'auth-student-1',
    email: 'okeke.chukwudi.1234@unn.edu.ng',
    full_name: 'Okeke Chukwudi Emmanuel',
    phone: '+2348031234567',
    faculty: 'Faculty of Engineering',
    department: 'Electrical Engineering',
    level: '300',
    reg_number: '2021/174932',
    avatar_url: null,
    role: 'captain',
    is_active: true,
    created_at: '2026-05-10T14:32:00Z',
    updated_at: '2026-05-10T14:32:00Z',
  },
  {
    id: 'student-2',
    auth_user_id: 'auth-student-2',
    email: 'nwachukwu.chioma.89@unn.edu.ng',
    full_name: 'Nwachukwu Chioma Mary',
    phone: '+2347055556677',
    faculty: 'Faculty of Biological Sciences',
    department: 'Biochemistry',
    level: '200',
    reg_number: '2022/245890',
    avatar_url: null,
    role: 'admin',
    is_active: true,
    created_at: '2026-06-01T09:15:00Z',
    updated_at: '2026-06-01T09:15:00Z',
  },
  {
    id: 'student-3',
    auth_user_id: 'auth-student-3',
    email: 'eze.kingsley.42@unn.edu.ng',
    full_name: 'Eze Kingsley',
    phone: '+2348123456789',
    faculty: 'Faculty of Physical Sciences',
    department: 'Computer Science',
    level: '400',
    reg_number: '2020/198754',
    avatar_url: null,
    role: 'member',
    is_active: true,
    created_at: '2026-04-15T11:45:00Z',
    updated_at: '2026-04-15T11:45:00Z',
  },
];

const MOCK_PAYMENTS: Payment[] = [
  {
    id: 'pay-1',
    profile_id: 'student-1',
    type: 'registration',
    amount_kobo: 500000,
    status: 'success',
    reference: 'SL-PAY-REG-01',
    provider: 'simulated',
    metadata: null,
    created_at: '2026-05-10T14:35:00Z',
    updated_at: '2026-05-10T14:35:00Z',
  },
  {
    id: 'pay-2',
    profile_id: 'student-2',
    type: 'registration',
    amount_kobo: 500000,
    status: 'success',
    reference: 'SL-PAY-REG-02',
    provider: 'simulated',
    metadata: null,
    created_at: '2026-06-01T09:20:00Z',
    updated_at: '2026-06-01T09:20:00Z',
  },
  {
    id: 'pay-3',
    profile_id: 'student-2',
    type: 'monthly',
    amount_kobo: 100000,
    status: 'success',
    reference: 'SL-PAY-MONTH-02',
    provider: 'simulated',
    metadata: { period: '2026-09' },
    created_at: '2026-09-01T10:00:00Z',
    updated_at: '2026-09-01T10:00:00Z',
  },
];

const MOCK_EVENTS: EventItem[] = [
  {
    id: 'event-1',
    title: 'Beginners & Footwork Fundamentals',
    description: 'Master corner recovery, scissor jumps, and grip transitions on court 1 & 2.',
    event_type: 'training',
    location: 'UNN Indoor Sports Hall (Court A)',
    start_at: new Date(Date.now() + 86400000 * 2).toISOString(),
    end_at: new Date(Date.now() + 86400000 * 2 + 7200000).toISOString(),
    is_recurring: true,
    recurrence_rule: 'WEEKLY:MON',
    created_by: 'student-1',
    status: 'upcoming',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'event-2',
    title: 'Tactical Doubles Drills & Net Play',
    description: 'Rotational play, defensive lifts, and front-court attacking combos.',
    event_type: 'training',
    location: 'UNN Indoor Sports Hall (Court B)',
    start_at: new Date(Date.now() + 86400000 * 4).toISOString(),
    end_at: new Date(Date.now() + 86400000 * 4 + 7200000).toISOString(),
    is_recurring: true,
    recurrence_rule: 'WEEKLY:WED',
    created_by: 'student-1',
    status: 'upcoming',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'event-3',
    title: 'Lion Den Inter-Faculty Open Championship 🏆',
    description: 'Single elimination singles & doubles knockout tournament. Medals + Yonex prizes.',
    event_type: 'competition',
    location: 'UNN Main Gymnasium & Sports Arena',
    start_at: new Date(Date.now() + 86400000 * 14).toISOString(),
    end_at: new Date(Date.now() + 86400000 * 14 + 18000000).toISOString(),
    is_recurring: false,
    recurrence_rule: null,
    created_by: 'student-2',
    status: 'upcoming',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const MOCK_CHANNELS: ChatChannel[] = [
  { id: 'chan-1', name: 'general', description: 'General badminton chit-chat, tips & rally talks', is_default: true, icon: '🏸', created_by: null, created_at: new Date().toISOString() },
  { id: 'chan-2', name: 'training-schedule', description: 'Official court session updates & coach announcements', is_default: false, icon: '📢', created_by: null, created_at: new Date().toISOString() },
  { id: 'chan-3', name: 'equipment-gear', description: 'Racket recommendations, string tension tips & grip swaps', is_default: false, icon: '🛒', created_by: null, created_at: new Date().toISOString() },
  { id: 'chan-4', name: 'tournament-hype', description: 'Inter-faculty matchups, score predictions & celebrations', is_default: false, icon: '🏆', created_by: null, created_at: new Date().toISOString() },
];

const MOCK_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    channel_id: 'chan-1',
    sender_id: 'student-1',
    content: 'Welcome to the ShuttleLions Lion Den! Training this Saturday starts sharp at 8:00 AM. Bring your hydration and non-marking shoes!',
    message_type: 'announcement',
    media_url: null,
    is_pinned: true,
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'msg-2',
    channel_id: 'chan-1',
    sender_id: 'student-2',
    content: 'Who wants to play doubles warmups before the drills start? Let me know here! 🦁',
    message_type: 'text',
    media_url: null,
    is_pinned: false,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'msg-3',
    channel_id: 'chan-1',
    sender_id: 'student-3',
    content: 'Count me in Chioma! I just re-strung my Voltric racket at 26lbs tension, ready to smash! ⚡',
    message_type: 'text',
    media_url: null,
    is_pinned: false,
    created_at: new Date(Date.now() - 1800000).toISOString(),
    updated_at: new Date(Date.now() - 1800000).toISOString(),
  },
];

const MOCK_POLLS: Poll[] = [
  {
    id: 'poll-1',
    title: 'Which competition format do you prefer for the October Lion Cup?',
    description: 'Cast your vote so the executive committee can finalize court schedule slots.',
    poll_type: 'single',
    status: 'active',
    closes_at: new Date(Date.now() + 86400000 * 7).toISOString(),
    created_by: 'student-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    options: [
      { id: 'opt-1', poll_id: 'poll-1', option_text: 'Singles + Mixed Doubles Knockout', vote_count: 24, display_order: 1 },
      { id: 'opt-2', poll_id: 'poll-1', option_text: 'Round Robin Group Stages into Finals', vote_count: 38, display_order: 2 },
      { id: 'opt-3', poll_id: 'poll-1', option_text: 'Faculty vs Faculty Team Ties (3 matches)', vote_count: 45, display_order: 3 },
    ],
  },
];

const MOCK_PRODUCTS: ShopProduct[] = [
  {
    id: 'prod-1',
    name: 'Yonex Astrox 100ZZ (Kurenai)',
    description: 'Hyper-slim shaft, Namd graphite, ultra head-heavy balance for devastating smash velocity.',
    category: 'racket',
    brand: 'Yonex',
    price_kobo: 3800000,
    image_url: null,
    stock_status: 'in_stock',
    specs: { Weight: '4U (83g)', Balance: 'Head Heavy', Flex: 'Extra Stiff', MaxTension: '28 lbs' },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'prod-2',
    name: 'Yonex Nanoflare 800 Pro',
    description: 'Razor frame geometry with Sonic Flare System for rapid-fire drive rallies and lightning net defense.',
    category: 'racket',
    brand: 'Yonex',
    price_kobo: 3200000,
    image_url: null,
    stock_status: 'in_stock',
    specs: { Weight: '4U (83g)', Balance: 'Head Light', Flex: 'Stiff', MaxTension: '27 lbs' },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'prod-3',
    name: 'Yonex Aerosensa 30 Feather Shuttles (Tube of 12)',
    description: 'Tournament grade goose feather shuttlecocks with natural Portuguese cork base.',
    category: 'shuttlecock',
    brand: 'Yonex',
    price_kobo: 2800000,
    image_url: null,
    stock_status: 'in_stock',
    specs: { Speed: 'Speed 77', Feathers: '100% Goose', Quantity: '12 pcs per tube' },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'prod-4',
    name: 'Super Grap Overgrip 3-Pack (Neon Yellow & Green)',
    description: 'High moisture absorption, tacky grip texture for optimal racket control under intense sweat.',
    category: 'grip',
    brand: 'Yonex',
    price_kobo: 450000,
    image_url: null,
    stock_status: 'in_stock',
    specs: { Material: 'Polyurethane', Thickness: '0.6mm', Pack: '3 Grips' },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const MOCK_TUTORIALS: Tutorial[] = [
  {
    id: 'tut-1',
    author_id: 'student-1',
    title: 'The 6-Corner Footwork Mastery: Scissor Kick & Lunges',
    summary: 'Master smooth explosive recovery across the four court corners without wasting energy.',
    content_md: `### The Golden Rules of Badminton Footwork
1. **The Split Step:** Always execute a subtle micro-hop right as your opponent contacts the shuttlecock.
2. **Push with the non-dominant foot:** To reach the rear court, rotate your hips 90 degrees and push off your back foot.
3. **Heel-to-Toe Lunge:** For net recovery, always land heel first to protect your knee joints from excessive torque.`,
    video_url: 'https://www.youtube.com/embed/14d0o0pY4tE',
    thumbnail_url: null,
    category: 'footwork',
    difficulty: 'beginner',
    read_time_min: 4,
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'tut-2',
    author_id: 'student-2',
    title: 'Forehand Smash Biomechanics: Pronation & Whip Physics',
    summary: 'Unlock 300+ km/h smash speed by utilizing forearm pronation rather than shoulder strain.',
    content_md: `### Biomechanics of Maximum Smash Power
- **Grip Relaxation:** Keep fingers loose until 5 milliseconds before impact.
- **Forearm Pronation:** Rotate your forearm inward (like turning a doorknob quickly).
- **Contact Point:** Strike the shuttle slightly in front of your body at the highest reach point.`,
    video_url: 'https://www.youtube.com/embed/9BwYV7X1m8U',
    thumbnail_url: null,
    category: 'strokes',
    difficulty: 'intermediate',
    read_time_min: 6,
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const MOCK_MEDIA: MediaUpload[] = [
  {
    id: 'media-1',
    uploader_id: 'student-1',
    title: 'UNN Lions Open Smash Drills - Court Action',
    description: 'Highlights from our weekend training rally sessions at the Indoor Sports Hall.',
    media_type: 'video',
    media_url: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=1200&auto=format&fit=crop&q=80',
    thumbnail_url: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&auto=format&fit=crop&q=80',
    category: 'training',
    likes_count: 32,
    views_count: 145,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'media-2',
    uploader_id: 'student-2',
    title: 'Championship Trophy Ceremony & Squad Photo',
    description: 'The ShuttleLions varsity team celebrating our inter-collegiate badminton qualification.',
    media_type: 'image',
    media_url: 'https://images.unsplash.com/photo-1613918108466-292b78a8ef95?w=1200&auto=format&fit=crop&q=80',
    thumbnail_url: 'https://images.unsplash.com/photo-1613918108466-292b78a8ef95?w=600&auto=format&fit=crop&q=80',
    category: 'highlights',
    likes_count: 58,
    views_count: 230,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

function getLocalStorageDB<T>(key: string, initial: T[]): T[] {
  if (typeof window === 'undefined') return initial;
  const data = localStorage.getItem(STORAGE_PREFIX + key);
  if (!data) {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(initial));
    return initial;
  }
  try {
    return JSON.parse(data);
  } catch {
    return initial;
  }
}

function saveLocalStorageDB<T>(key: string, data: T[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
}

function getInitialData(table: string): any[] {
  switch (table) {
    case 'profiles': return MOCK_PROFILES;
    case 'payments': return MOCK_PAYMENTS;
    case 'events': return MOCK_EVENTS;
    case 'chat_channels': return MOCK_CHANNELS;
    case 'chat_messages': return MOCK_MESSAGES;
    case 'polls': return MOCK_POLLS;
    case 'shop_products': return MOCK_PRODUCTS;
    case 'tutorials': return MOCK_TUTORIALS;
    case 'media_uploads': return MOCK_MEDIA;
    default: return [];
  }
}

// ---- Client Singleton ----

let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  const isGuestAdmin = typeof window !== 'undefined' && localStorage.getItem('shuttlelions_guest_admin') === 'true';
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (isGuestAdmin || !supabaseUrl || !supabaseAnonKey) {
    return {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithOtp: async () => ({ data: null, error: { message: 'Bypassed in demo mode' } }),
        verifyOtp: async () => ({ data: null, error: { message: 'Bypassed in demo mode' } }),
        signInWithOAuth: async () => ({ data: null, error: { message: 'Bypassed in demo mode' } }),
        signOut: async () => ({ error: null }),
      },
      from: (table: string) => {
        return {
          insert: async (rows: any) => {
            const data = getLocalStorageDB(table, getInitialData(table));
            const items = Array.isArray(rows) ? rows : [rows];
            const added = items.map((item: any) => ({
              id: item.id || `mock-id-${Math.random().toString(36).substr(2, 9)}`,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              ...item,
            }));
            saveLocalStorageDB(table, [...data, ...added]);
            return { data: added[0], error: null, select: () => ({ single: async () => ({ data: added[0], error: null }) }) };
          },
          select: (fields = '*') => ({
            eq: (col: string, val: any) => {
              const data = getLocalStorageDB(table, getInitialData(table));
              const filtered = data.filter((item: any) => item[col] === val);
              return {
                single: async () => ({ data: filtered[0] || null, error: filtered[0] ? null : { message: 'Not found' } }),
                maybeSingle: async () => ({ data: filtered[0] || null, error: null }),
                order: (orderCol?: string, { ascending = true } = {}) => {
                  let sorted = [...filtered];
                  if (orderCol) {
                    sorted.sort((a, b) => (ascending ? (a[orderCol] > b[orderCol] ? 1 : -1) : (a[orderCol] < b[orderCol] ? 1 : -1)));
                  }
                  return {
                    limit: async () => ({ data: sorted, error: null }),
                    then: (cb: any) => cb({ data: sorted, error: null }),
                  };
                },
                then: (cb: any) => cb({ data: filtered, error: null }),
              };
            },
            order: (col: string, { ascending = true } = {}) => {
              let data = getLocalStorageDB(table, getInitialData(table));
              data = [...data].sort((a: any, b: any) => {
                const valA = a[col];
                const valB = b[col];
                if (valA < valB) return ascending ? -1 : 1;
                if (valA > valB) return ascending ? 1 : -1;
                return 0;
              });
              return {
                eq: (column: string, value: any) => {
                  const filtered = data.filter((item: any) => item[column] === value);
                  return { then: (cb: any) => cb({ data: filtered, error: null }) };
                },
                then: (cb: any) => cb({ data, error: null }),
              };
            },
            then: (cb: any) => {
              const data = getLocalStorageDB(table, getInitialData(table));
              return cb({ data, error: null });
            },
          }),
          update: (fields: any) => ({
            eq: async (col: string, val: any) => {
              const data = getLocalStorageDB(table, getInitialData(table));
              let updatedItem: any = null;
              const next = data.map((item: any) => {
                if (item[col] === val) {
                  updatedItem = { ...item, ...fields, updated_at: new Date().toISOString() };
                  return updatedItem;
                }
                return item;
              });
              saveLocalStorageDB(table, next);
              return { data: updatedItem, error: null };
            },
          }),
          upsert: async (rows: any) => {
            const data = getLocalStorageDB(table, getInitialData(table));
            const items = Array.isArray(rows) ? rows : [rows];
            let lastItem: any = null;
            const next = [...data];
            
            items.forEach((item: any) => {
              const idx = next.findIndex((x: any) => x.id === item.id || (item.auth_user_id && x.auth_user_id === item.auth_user_id));
              if (idx > -1) {
                next[idx] = { ...next[idx], ...item, updated_at: new Date().toISOString() };
                lastItem = next[idx];
              } else {
                const added = {
                  id: item.id || `mock-id-${Math.random().toString(36).substr(2, 9)}`,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  ...item,
                };
                next.push(added);
                lastItem = added;
              }
            });
            saveLocalStorageDB(table, next);
            return { data: lastItem, error: null };
          },
          delete: () => ({
            eq: async (col: string, val: any) => {
              const data = getLocalStorageDB(table, getInitialData(table));
              const next = data.filter((item: any) => item[col] !== val);
              saveLocalStorageDB(table, next);
              return { error: null };
            },
          }),
        };
      },
    } as unknown as SupabaseClient;
  }

  if (_supabase) return _supabase;
  _supabase = createClient(supabaseUrl, supabaseAnonKey);
  return _supabase;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    const client = getSupabase();
    const value = (client as unknown as Record<string | symbol, unknown>)[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});

let _serverSupabase: SupabaseClient | null = null;

export function createServerSupabase(): SupabaseClient {
  if (_serverSupabase) return _serverSupabase;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return getSupabase();
  }

  _serverSupabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return _serverSupabase;
}
