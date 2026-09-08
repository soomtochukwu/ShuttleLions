'use client';

import React from 'react';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/components/AuthContext';
import { Footer } from '@/components/Footer';
import { audio } from '@/lib/audio';
import {
  ShieldCheck,
  Lock,
  Database,
  UserCheck,
  Server,
  Cookie,
  Mail,
  ArrowLeft,
  Sun,
  Moon,
  Laptop,
  CheckCircle2,
  FileText,
  Home,
  LayoutDashboard,
  Shield,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export default function PrivacyPolicyPage() {
  const { theme, setTheme } = useTheme();
  const { isAuthenticated } = useAuth();

  const toggleTheme = () => {
    audio.play('netDrop');
    if (theme === 'system') setTheme('light');
    else if (theme === 'light') setTheme('dark');
    else setTheme('system');
  };

  return (
    <div className="relative min-h-screen bg-sl-bg text-sl-foreground flex flex-col justify-between selection:bg-sl-green selection:text-white">
      {/* Top Sticky Header */}
      <header className="sticky top-0 z-40 w-full bg-sl-panel/80 backdrop-blur-md border-b border-sl-border/40 py-3.5 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              onClick={() => audio.play('rally')}
              className="flex items-center gap-2 group"
            >
              <div className="w-8 h-8 rounded-lg bg-sl-green/20 text-sl-green border border-sl-green/30 flex items-center justify-center font-black transition-transform group-hover:scale-105">
                SL
              </div>
              <span
                className="text-lg sm:text-xl font-bold tracking-wider text-sl-green text-stroke"
                style={{ fontFamily: 'var(--font-title)' }}
              >
                SHUTTLELIONS
              </span>
            </Link>
            <span className="hidden sm:inline-block text-xs font-mono text-sl-muted border-l border-sl-border/40 pl-3">
              Governance &amp; Privacy
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Switch to Terms */}
            <Link
              href="/terms"
              onClick={() => audio.play('rally')}
              className="px-3 py-1.5 rounded-lg border border-sl-border bg-sl-bg hover:bg-sl-panel text-sl-muted hover:text-sl-foreground text-xs font-black uppercase transition-all hidden md:flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-sl-green" />
              <span>Terms &amp; Conditions</span>
            </Link>

            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-sl-border bg-sl-panel hover:bg-sl-bg text-sl-muted hover:text-sl-foreground transition-all cursor-pointer"
              title="Toggle theme"
            >
              {theme === 'system' ? (
                <Laptop className="w-4 h-4" />
              ) : theme === 'dark' ? (
                <Moon className="w-4 h-4 text-sl-green" />
              ) : (
                <Sun className="w-4 h-4 text-amber-500" />
              )}
            </button>

            {/* Home / Dashboard CTA */}
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                onClick={() => audio.play('serve')}
                className="shuttle-btn shuttle-btn-green text-xs uppercase py-1.5 px-3 flex items-center gap-1.5 cursor-pointer"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Athlete Portal</span>
                <span className="sm:hidden">Portal</span>
              </Link>
            ) : (
              <Link
                href="/"
                onClick={() => audio.play('rally')}
                className="shuttle-btn shuttle-btn-white text-xs uppercase py-1.5 px-3 flex items-center gap-1.5 cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Home</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* Page Hero Header */}
        <div className="space-y-3 border-b border-sl-border/40 pb-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-black uppercase text-sl-green bg-sl-green/15 border border-sl-green/30 px-2.5 py-0.5 rounded-full font-mono flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Official Club Policy
            </span>
            <span className="text-xs font-mono text-sl-muted flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-sl-green" /> Last Updated: September 2026
            </span>
          </div>

          <h1
            className="text-2xl sm:text-4xl font-black uppercase text-sl-foreground tracking-tight"
            style={{ fontFamily: 'var(--font-title)' }}
          >
            Privacy Policy &amp; Athlete Data Protection
          </h1>

          <p className="text-xs sm:text-sm text-sl-muted leading-relaxed font-medium">
            How ShuttleLions (University of Nigeria, Nsukka Badminton Club) safeguards your student identity, court training data, and membership records with industry-standard encryption and zero commercial data sharing.
          </p>

          {/* Quick Nav Pills */}
          <div className="pt-2 flex flex-wrap items-center gap-2">
            <a
              href="#zero-credentials"
              className="px-2.5 py-1 rounded-md text-[11px] sm:text-xs font-bold bg-sl-panel border border-sl-border hover:border-sl-green text-sl-muted hover:text-sl-foreground transition-all"
            >
              Zero-Password Pledge
            </a>
            <a
              href="#data-collection"
              className="px-2.5 py-1 rounded-md text-[11px] sm:text-xs font-bold bg-sl-panel border border-sl-border hover:border-sl-green text-sl-muted hover:text-sl-foreground transition-all"
            >
              Data Collected
            </a>
            <a
              href="#data-usage"
              className="px-2.5 py-1 rounded-md text-[11px] sm:text-xs font-bold bg-sl-panel border border-sl-border hover:border-sl-green text-sl-muted hover:text-sl-foreground transition-all"
            >
              How We Use Data
            </a>
            <a
              href="#athlete-rights"
              className="px-2.5 py-1 rounded-md text-[11px] sm:text-xs font-bold bg-sl-panel border border-sl-border hover:border-sl-green text-sl-muted hover:text-sl-foreground transition-all"
            >
              Your Rights &amp; Erasure
            </a>
            <Link
              href="/terms"
              className="px-2.5 py-1 rounded-md text-[11px] sm:text-xs font-bold bg-sl-green/10 border border-sl-green/30 text-sl-green hover:bg-sl-green/20 transition-all ml-auto flex items-center gap-1"
            >
              <span>View Terms of Service</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Highlight Callout: Zero Password & Credential Harvesting Pledge */}
        <section id="zero-credentials" className="p-4 sm:p-6 rounded-2xl bg-sl-green/10 border border-sl-green/30 space-y-2.5">
          <div className="flex items-center gap-2.5 text-sl-green">
            <Lock className="w-5 h-5 shrink-0" />
            <h2 className="text-base sm:text-lg font-black uppercase tracking-wide">
              1. Our Zero-Password &amp; Credential Harvesting Pledge
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-sl-foreground leading-relaxed font-medium">
            ShuttleLions <strong>never</strong> collects, asks for, intercepts, or stores your Google account password, email account password, or personal financial credentials.
          </p>
          <ul className="space-y-1.5 text-xs sm:text-sm text-sl-muted pt-1">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-sl-green shrink-0 mt-0.5" />
              <span>
                <strong>OAuth 2.0 Direct Delegation:</strong> All authentication is conducted through industry-standard Supabase Auth and official Google OAuth 2.0 endpoints.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-sl-green shrink-0 mt-0.5" />
              <span>
                <strong>Restricted Token Scopes:</strong> We only request basic identification tokens (your full name, verified email address, and avatar image) needed to create your student athlete identity.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-sl-green shrink-0 mt-0.5" />
              <span>
                <strong>No Password Storage:</strong> There is zero local password database that could ever be compromised or leaked.
              </span>
            </li>
          </ul>
        </section>

        {/* Section 2: Non-Commercial Student Club Scope */}
        <section className="p-5 sm:p-6 rounded-2xl bg-sl-panel border border-sl-border space-y-3">
          <div className="flex items-center gap-2 text-sl-green">
            <Shield className="w-4.5 h-4.5 shrink-0" />
            <h2 className="text-sm sm:text-base font-black uppercase">
              2. Non-Commercial University Student Society
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-sl-muted leading-relaxed">
            ShuttleLions is the recognized student sports club representing badminton athletes at the <strong>University of Nigeria, Nsukka (UNN)</strong>. This digital platform exists exclusively to streamline court scheduling, training session RSVPs, match ladder records, tutorial drills, and equipment logistics at the UNN indoor gymnasium.
          </p>
          <p className="text-xs sm:text-sm text-sl-muted leading-relaxed">
            We are not a commercial enterprise or advertising network. We do not monetize your data, run behavioral retargeting campaigns, or sell student records to any third-party marketing companies.
          </p>
        </section>

        {/* Section 3: Information We Collect */}
        <section id="data-collection" className="p-5 sm:p-6 rounded-2xl bg-sl-panel border border-sl-border space-y-4">
          <div className="flex items-center gap-2 text-sl-green">
            <Database className="w-4.5 h-4.5 shrink-0" />
            <h2 className="text-sm sm:text-base font-black uppercase">
              3. Information We Collect
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-sl-muted leading-relaxed">
            To provide legitimate varsity services, the platform stores only the minimum necessary information:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
            <div className="p-3.5 rounded-xl bg-sl-bg border border-sl-border/60 space-y-1.5">
              <h3 className="text-xs sm:text-sm font-bold text-sl-foreground flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-sl-green" /> Athlete Profile Information
              </h3>
              <p className="text-xs text-sl-muted leading-relaxed">
                Full name, student matriculation number, faculty, department, academic year (100–500/PG), university email address, and optional phone number for court communications.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-sl-bg border border-sl-border/60 space-y-1.5">
              <h3 className="text-xs sm:text-sm font-bold text-sl-foreground flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-sl-green" /> Athletic &amp; Training Records
              </h3>
              <p className="text-xs text-sl-muted leading-relaxed">
                Playing hand (right or left-handed), preferred discipline (singles, doubles, mixed), practice drill checklist completions, and match game statistics.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-sl-bg border border-sl-border/60 space-y-1.5">
              <h3 className="text-xs sm:text-sm font-bold text-sl-foreground flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-sl-green" /> Session RSVPs &amp; Schedules
              </h3>
              <p className="text-xs text-sl-muted leading-relaxed">
                Training session sign-ups, impromptu match schedules, and court attendance status to ensure the UNN gymnasium does not exceed safe player capacity.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-sl-bg border border-sl-border/60 space-y-1.5">
              <h3 className="text-xs sm:text-sm font-bold text-sl-foreground flex items-center gap-1.5">
                <Server className="w-4 h-4 text-sl-green" /> Membership &amp; Equipment Dues
              </h3>
              <p className="text-xs text-sl-muted leading-relaxed">
                Transaction references, fee categories (registration or monthly session dues), and racket rental status used exclusively for club transparency and accounting.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: How We Use Your Information */}
        <section id="data-usage" className="p-5 sm:p-6 rounded-2xl bg-sl-panel border border-sl-border space-y-3">
          <div className="flex items-center gap-2 text-sl-green">
            <Mail className="w-4.5 h-4.5 shrink-0" />
            <h2 className="text-sm sm:text-base font-black uppercase">
              4. How We Use Your Information
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-sl-muted leading-relaxed">
            All stored athlete data is used strictly for internal club administration:
          </p>
          <ul className="space-y-2 text-xs sm:text-sm text-sl-muted">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sl-green shrink-0 mt-2" />
              <span><strong>Game Day Reminders:</strong> Sending automated email alerts (via Nodemailer) and browser notifications prior to scheduled training sessions so you never miss court time.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sl-green shrink-0 mt-2" />
              <span><strong>Court Capacity &amp; Logistics:</strong> Calculating active athlete headcount for each training session to allocate sufficient feather shuttlecocks and court access.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sl-green shrink-0 mt-2" />
              <span><strong>Varsity Team Selection:</strong> Enabling club captains and coaches to evaluate department representation and seed players for inter-faculty games and NUGA trials.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sl-green shrink-0 mt-2" />
              <span><strong>Member Directory:</strong> Providing a secure directory for registered athletes to discover training partners and doubles teammates across UNN campuses.</span>
            </li>
          </ul>
        </section>

        {/* Section 5: Data Storage, Security & RLS */}
        <section className="p-5 sm:p-6 rounded-2xl bg-sl-panel border border-sl-border space-y-3">
          <div className="flex items-center gap-2 text-sl-green">
            <Lock className="w-4.5 h-4.5 shrink-0" />
            <h2 className="text-sm sm:text-base font-black uppercase">
              5. Database Security &amp; Row Level Security (RLS)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-sl-muted leading-relaxed">
            Our PostgreSQL database infrastructure is hosted via Supabase with strict cryptographic standards:
          </p>
          <div className="space-y-2 text-xs sm:text-sm text-sl-muted">
            <p>
              • <strong>Row Level Security (RLS):</strong> Granular database policies enforce that athletes can only update their own records and cannot modify other players&apos; profiles or payments.
            </p>
            <p>
              • <strong>Transport Encryption:</strong> All client-to-server and database communications are encrypted using Transport Layer Security (TLS 1.3 / HTTPS).
            </p>
            <p>
              • <strong>Role-Based Administrative Control:</strong> Access to club management utilities (such as schedule adjustments or role appointments) is cryptographically gated to verified executive administrators.
            </p>
          </div>
        </section>

        {/* Section 6: Cookies & Local Storage */}
        <section className="p-5 sm:p-6 rounded-2xl bg-sl-panel border border-sl-border space-y-3">
          <div className="flex items-center gap-2 text-sl-green">
            <Cookie className="w-4.5 h-4.5 shrink-0" />
            <h2 className="text-sm sm:text-base font-black uppercase">
              6. Cookies, Caching &amp; Offline Storage
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-sl-muted leading-relaxed">
            ShuttleLions operates as an installable Progressive Web App (PWA). We utilize local browser storage strictly for functional, performance-enhancing purposes:
          </p>
          <div className="p-3.5 rounded-xl bg-sl-bg border border-sl-border/60 text-xs font-mono space-y-1.5 text-sl-muted">
            <p><strong className="text-sl-green">shuttlelions_theme:</strong> Stores your light / dark visual appearance preference.</p>
            <p><strong className="text-sl-green">schedule_events:</strong> Caches court schedules locally so you can view training hours without an active network connection.</p>
            <p><strong className="text-sl-green">sb-*-auth-token:</strong> Ephemeral session tokens issued directly by Supabase to maintain your login state.</p>
          </div>
          <p className="text-xs text-sl-muted">
            We do not employ third-party tracking pixels, advertising beacons, or cross-site tracking cookies.
          </p>
        </section>

        {/* Section 7: Athlete Rights, Data Deletion & NDPR */}
        <section id="athlete-rights" className="p-5 sm:p-6 rounded-2xl bg-sl-panel border border-sl-border space-y-3">
          <div className="flex items-center gap-2 text-sl-green">
            <UserCheck className="w-4.5 h-4.5 shrink-0" />
            <h2 className="text-sm sm:text-base font-black uppercase">
              7. Your Rights, Data Portability &amp; Account Erasure
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-sl-muted leading-relaxed">
            In compliance with the <strong>Nigeria Data Protection Regulation (NDPR)</strong> and general data protection standards, athletes maintain complete sovereignty over their data:
          </p>
          <ul className="space-y-2 text-xs sm:text-sm text-sl-muted">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-sl-green shrink-0 mt-0.5" />
              <span><strong>Right to Inspect:</strong> You can inspect all information attached to your athlete profile at any time in your <Link href="/dashboard/profile" className="text-sl-green underline font-bold">Digital Lion ID</Link>.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-sl-green shrink-0 mt-0.5" />
              <span><strong>Right to Rectify:</strong> Update your faculty, department, or phone number anytime via <Link href="/dashboard/settings" className="text-sl-green underline font-bold">Dashboard Settings</Link>.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-sl-green shrink-0 mt-0.5" />
              <span><strong>Right to Erasure (Forget Me):</strong> If you graduate or choose to leave the club, you can delete your account and revoke all stored data immediately under Account Deletion in Settings or by submitting a formal request to the executive board.</span>
            </li>
          </ul>
        </section>

        {/* Section 8: Contact & Inquiries */}
        <section className="p-5 sm:p-6 rounded-2xl bg-sl-panel border border-sl-border space-y-3">
          <div className="flex items-center gap-2 text-sl-green">
            <Mail className="w-4.5 h-4.5 shrink-0" />
            <h2 className="text-sm sm:text-base font-black uppercase">
              8. Contact the Club Data Officer
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-sl-muted leading-relaxed">
            For privacy inquiries, data deletion requests, or questions regarding club governance, please reach out directly to the Executive Committee:
          </p>
          <div className="p-3.5 rounded-xl bg-sl-bg border border-sl-border/60 text-xs sm:text-sm space-y-1 text-sl-muted">
            <p><strong className="text-sl-foreground">Organization:</strong> ShuttleLions UNN Badminton Club</p>
            <p><strong className="text-sl-foreground">Location:</strong> UNN Indoor Sports Gymnasium, University of Nigeria, Nsukka, Enugu State, Nigeria</p>
            <p><strong className="text-sl-foreground">Official WhatsApp:</strong> Available via the community link on the landing page</p>
            <p><strong className="text-sl-foreground">Affiliation:</strong> University of Nigeria Nsukka Sports Council</p>
          </div>
        </section>

        {/* Bottom Navigation Link Back to Terms & Home */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-sl-border/40">
          <Link
            href="/"
            onClick={() => audio.play('rally')}
            className="flex items-center gap-2 text-xs sm:text-sm font-black text-sl-muted hover:text-sl-green transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Landing Page</span>
          </Link>

          <Link
            href="/terms"
            onClick={() => audio.play('serve')}
            className="shuttle-btn shuttle-btn-green text-xs uppercase py-2 px-4 flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Read Terms &amp; Conditions</span>
          </Link>
        </div>
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
