# 🏸 ShuttleLions: UNN Badminton Varsity & Athlete Platform

**ShuttleLions** is the official digital platform and athlete management portal for the University of Nigeria, Nsukka (UNN) Badminton Club. It powers student athlete registration, digital barcode membership passes, court training schedules, interactive match RSVPs, pre-game notifications, and club executive governance.

---

## Key Features

### 1. 3D Parallax Landing Arena & Motion Physics

- **Scroll-Driven Court Experience:** Immersive 3D court entrance, serving sequence, and perspective floor markings powered by Framer Motion and modern CSS View Transitions.
- **Synthesized Court Soundscape:** Custom Web Audio API sound effects (rallies, smashes, net drops, whistles, and court squeaks) with zero external MP3 latency.
- **Dual Theme Engine:** High-contrast Neo-Green and Dark mode design systems with halftone dot patterns and crisp borders.

### 2. Digital Lion ID & Athlete Directory

- **Digital Pass Verification:** Scannable athlete passes with unique registration barcodes for gymnasium entry.
- **UNN Faculty & Department Taxonomy:** Complete directory coverage across all 15 UNN faculties and academic departments.
- **Membership Directory:** Searchable athlete registry with role badges (_Executive Council_, _Committee Leads_, _Athletes_).

### 3. Court Schedules, Activities & GPS Navigation

- **Official Weekly Badminton Schedule:** Pinned core training routines (Tuesdays, Saturdays, and Sundays) with an interactive mobile collapsible fold.
- **Impromptu Matches & Tournaments:** Dynamic match coordination with custom categories (_Tournaments_, _Next Routine_, _Impromptu_, _Socials_).
- **WAT Time Standardization & GPS Map Modals:** Accurate West Africa Time (WAT) scheduling with embedded Google Maps directions and coordinate links.

### 4. Interactive Match RSVPs & Realtime Notifications

- **Pre-Game Reminders:** Automated reminders dispatched **1 hour** and **30 minutes** before court sessions.
- **Multi-Channel Delivery:** In-app heads-up notification banners, Supabase Realtime WebSocket broadcasts, and Nodemailer SMTP email dispatches.
- **Notification Preferences:** Customizable athlete alert settings with device haptic vibration feedback.

### 5. Match Media Gallery & Vlogs

- **Curated Footage:** Match highlights, training drill videos, and high-resolution court stills.
- **Role-Protected Publishing:** Content creation permissions restricted to the appointed **Media Personnel** and Club Executives.
- **Batch Operations:** Multi-file selection, batch deletion, and direct image/video preview players.

### 6. Executive Council & Governance

- **Role Permissions Matrix:** Role-Based Access Control (RBAC) governing schedule management, media publishing, and financial auditing.
- **Custom Executive Roles:** Dynamic appointment tools for administrative leads (_Logistics_, _Media Personnel_, _Captains_).

### 7. Progressive Web App (PWA) & Offline Caching

- **Instant Hydration:** Client memory caching with local storage persistence for near-zero loading times.
- **Service Worker Caching:** PWA manifest with background asset pre-caching and home screen installation support.

---

## Technology Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS, CSS Custom Properties, Lucide React (Zero UI emojis)
- **Animation & Audio:** Framer Motion, Web Audio API Synthesizer
- **Backend & Database:** Supabase (PostgreSQL, Row Level Security, Realtime, Storage, Auth)
- **Email & Notifications:** Nodemailer SMTP, Web Notifications API
- **PWA:** Service Worker Cache, Web App Manifest

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/ShuttleLions.git
cd ShuttleLions
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the template configuration:

```bash
cp .env.local.example .env.local
```

Fill in your Supabase credentials and Nodemailer SMTP details:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Nodemailer SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-app-password
SMTP_FROM="ShuttleLions UNN" <your-email@gmail.com>
```

### 4. Apply Database Migrations

Apply the PostgreSQL migrations located in [`supabase/migrations/`](./supabase/migrations/) to your Supabase project:

```bash
npx supabase db push
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Verify Production Build

```bash
npm run build
```

---
