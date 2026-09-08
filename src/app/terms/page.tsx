'use client';

import React from 'react';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/components/AuthContext';
import { Footer } from '@/components/Footer';
import { audio } from '@/lib/audio';
import {
  FileText,
  ShieldCheck,
  Scale,
  CheckCircle2,
  AlertTriangle,
  Award,
  HeartPulse,
  Camera,
  ArrowLeft,
  Sun,
  Moon,
  Laptop,
  Home,
  LayoutDashboard,
  Shield,
  Clock,
  ExternalLink,
  Users,
  Coins,
} from 'lucide-react';

export default function TermsAndConditionsPage() {
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
              Governance &amp; Terms
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Switch to Privacy */}
            <Link
              href="/privacy"
              onClick={() => audio.play('rally')}
              className="px-3 py-1.5 rounded-lg border border-sl-border bg-sl-bg hover:bg-sl-panel text-sl-muted hover:text-sl-foreground text-xs font-black uppercase transition-all hidden md:flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-sl-green" />
              <span>Privacy Policy</span>
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
              <Scale className="w-3.5 h-3.5" /> Club Code &amp; Governance
            </span>
            <span className="text-xs font-mono text-sl-muted flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-sl-green" /> Last Updated: September 2026
            </span>
          </div>

          <h1
            className="text-2xl sm:text-4xl font-black uppercase text-sl-foreground tracking-tight"
            style={{ fontFamily: 'var(--font-title)' }}
          >
            Terms &amp; Conditions of Membership
          </h1>

          <p className="text-xs sm:text-sm text-sl-muted leading-relaxed font-medium">
            Rules, court etiquette, equipment accountability, and sportsmanship standards governing athletes and guests of ShuttleLions at the University of Nigeria, Nsukka (UNN).
          </p>

          {/* Quick Nav Pills */}
          <div className="pt-2 flex flex-wrap items-center gap-2">
            <a
              href="#court-rules"
              className="px-2.5 py-1 rounded-md text-[11px] sm:text-xs font-bold bg-sl-panel border border-sl-border hover:border-sl-green text-sl-muted hover:text-sl-foreground transition-all"
            >
              Court Etiquette &amp; Shoes
            </a>
            <a
              href="#equipment"
              className="px-2.5 py-1 rounded-md text-[11px] sm:text-xs font-bold bg-sl-panel border border-sl-border hover:border-sl-green text-sl-muted hover:text-sl-foreground transition-all"
            >
              Equipment Care
            </a>
            <a
              href="#rsvps"
              className="px-2.5 py-1 rounded-md text-[11px] sm:text-xs font-bold bg-sl-panel border border-sl-border hover:border-sl-green text-sl-muted hover:text-sl-foreground transition-all"
            >
              RSVP &amp; Attendance
            </a>
            <a
              href="#dues"
              className="px-2.5 py-1 rounded-md text-[11px] sm:text-xs font-bold bg-sl-panel border border-sl-border hover:border-sl-green text-sl-muted hover:text-sl-foreground transition-all"
            >
              Club Dues Policy
            </a>
            <Link
              href="/privacy"
              className="px-2.5 py-1 rounded-md text-[11px] sm:text-xs font-bold bg-sl-green/10 border border-sl-green/30 text-sl-green hover:bg-sl-green/20 transition-all ml-auto flex items-center gap-1"
            >
              <span>View Privacy Policy</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Section 1: Acceptance of Terms */}
        <section className="p-5 sm:p-6 rounded-2xl bg-sl-panel border border-sl-border space-y-3">
          <div className="flex items-center gap-2 text-sl-green">
            <Shield className="w-4.5 h-4.5 shrink-0" />
            <h2 className="text-sm sm:text-base font-black uppercase">
              1. Acceptance &amp; Club Eligibility
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-sl-muted leading-relaxed">
            By accessing the ShuttleLions portal, registering an athlete profile, or stepping onto the badminton courts at the UNN indoor gymnasium during official sessions, you agree to be bound by these Terms and Conditions.
          </p>
          <p className="text-xs sm:text-sm text-sl-muted leading-relaxed">
            Membership is open to undergraduate and postgraduate students, alumni, staff of the University of Nigeria, Nsukka, as well as approved guest sparring partners. All participants are expected to uphold the prestige of UNN athletics.
          </p>
        </section>

        {/* Section 2: Court Etiquette & Non-Marking Footwear */}
        <section id="court-rules" className="p-5 sm:p-6 rounded-2xl bg-sl-green/10 border border-sl-green/30 space-y-3">
          <div className="flex items-center gap-2.5 text-sl-green">
            <Award className="w-5 h-5 shrink-0" />
            <h2 className="text-base sm:text-lg font-black uppercase tracking-wide">
              2. Mandatory Court Etiquette &amp; Footwear Policy
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-sl-foreground leading-relaxed font-medium">
            To preserve the wooden indoor courts at the UNN Gymnasium and guarantee athlete safety, strict footwear regulations are enforced:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-sl-panel border border-sl-border/60 space-y-1">
              <h3 className="text-xs sm:text-sm font-bold text-sl-foreground flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-sl-green" /> Non-Marking Gum Rubber Soles Only
              </h3>
              <p className="text-xs text-sl-muted leading-relaxed">
                Athletes must wear specialized badminton or indoor court shoes with non-marking gum soles. Running shoes with black carbon soles, spikes, or outdoor gravel soles are strictly prohibited.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-sl-panel border border-sl-border/60 space-y-1">
              <h3 className="text-xs sm:text-sm font-bold text-sl-foreground flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-sl-green" /> Appropriate Athletic Attire
              </h3>
              <p className="text-xs text-sl-muted leading-relaxed">
                Breathable sportswear (shorts/track pants and varsity jersey or t-shirt) must be worn. Jeans, flip-flops, sandals, or street clothing are not permitted on the playing surface.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: BWF Standard Play & Sportsmanship */}
        <section className="p-5 sm:p-6 rounded-2xl bg-sl-panel border border-sl-border space-y-3">
          <div className="flex items-center gap-2 text-sl-green">
            <Scale className="w-4.5 h-4.5 shrink-0" />
            <h2 className="text-sm sm:text-base font-black uppercase">
              3. BWF Laws &amp; Fair Play Sportsmanship
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-sl-muted leading-relaxed">
            All training sessions, league games, and intra-faculty tournaments follow the official <strong>Badminton World Federation (BWF)</strong> Laws of Badminton:
          </p>
          <ul className="space-y-1.5 text-xs sm:text-sm text-sl-muted">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sl-green shrink-0 mt-2" />
              <span><strong>Line Calling:</strong> When no umpire is appointed, players make line calls on their own side of the net fairly. In case of doubt, a &quot;let&quot; is played.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sl-green shrink-0 mt-2" />
              <span><strong>Zero Tolerance for Aggression:</strong> Verbal harassment, racket throwing, deliberate net kicking, or unsporting conduct will result in immediate suspension from sessions.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sl-green shrink-0 mt-2" />
              <span><strong>Rally Scoring System:</strong> Matches are standard best of 3 sets to 21 rally points (with 30-point ceiling in deuce), unless a time-restricted format is announced by the coach.</span>
            </li>
          </ul>
        </section>

        {/* Section 4: Session RSVPs & Court Rotation */}
        <section id="rsvps" className="p-5 sm:p-6 rounded-2xl bg-sl-panel border border-sl-border space-y-3">
          <div className="flex items-center gap-2 text-sl-green">
            <Users className="w-4.5 h-4.5 shrink-0" />
            <h2 className="text-sm sm:text-base font-black uppercase">
              4. Session RSVPs, Court Rotation &amp; Attendance
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-sl-muted leading-relaxed">
            Because gymnasium court capacity is shared among all varsity athletes, the following rotation policies apply:
          </p>
          <div className="space-y-2 text-xs sm:text-sm text-sl-muted">
            <p>
              • <strong>RSVP Requirement:</strong> Athletes should RSVP on the <Link href="/dashboard/schedule" className="text-sl-green underline font-bold">Games &amp; Schedules</Link> page at least 2 hours before weekly practice routines so coaches can plan court drills and shuttlecock allocations.
            </p>
            <p>
              • <strong>Cancellation Etiquette:</strong> If your schedule changes and you cannot attend, cancel your RSVP immediately to surrender your court slot to waitlisted athletes.
            </p>
            <p>
              • <strong>Peak-Hour Rotation:</strong> During high-attendance sessions (10+ athletes per court), doubles matches take precedence over singles matches, and court rotation occurs every 1 set or 15 minutes of play.
            </p>
          </div>
        </section>

        {/* Section 5: Equipment Care & Property Accountability */}
        <section id="equipment" className="p-5 sm:p-6 rounded-2xl bg-sl-panel border border-sl-border space-y-3">
          <div className="flex items-center gap-2 text-sl-green">
            <ShieldCheck className="w-4.5 h-4.5 shrink-0" />
            <h2 className="text-sm sm:text-base font-black uppercase">
              5. Equipment Borrowing &amp; Club Property
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-sl-muted leading-relaxed">
            Club equipment represents community investments funded through dues and alumni sponsorship:
          </p>
          <ul className="space-y-2 text-xs sm:text-sm text-sl-muted">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sl-green shrink-0 mt-2" />
              <span><strong>Loaner Rackets:</strong> Athletes borrowing club rackets must sign out with the logistician on duty and return the equipment undamaged at the end of the session.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sl-green shrink-0 mt-2" />
              <span><strong>Feather Shuttlecocks:</strong> Goose feather shuttlecocks are reserved for structured match play and advanced drills; nylon training shuttles are provided for warmup and beginner rallies to conserve supplies.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sl-green shrink-0 mt-2" />
              <span><strong>Net &amp; Post Set-Up:</strong> Athletes are expected to participate cooperatively in setting up and taking down net posts before and after sessions.</span>
            </li>
          </ul>
        </section>

        {/* Section 6: Club Dues & Financial Contributions */}
        <section id="dues" className="p-5 sm:p-6 rounded-2xl bg-sl-panel border border-sl-border space-y-3">
          <div className="flex items-center gap-2 text-sl-green">
            <Coins className="w-4.5 h-4.5 shrink-0" />
            <h2 className="text-sm sm:text-base font-black uppercase">
              6. Membership Dues &amp; Financial Transparency
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-sl-muted leading-relaxed">
            ShuttleLions operates as a self-sustaining student sports society:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
            <div className="p-3 rounded-xl bg-sl-bg border border-sl-border/60 space-y-1">
              <span className="font-mono font-bold text-sl-green uppercase text-[11px]">One-Time Registration</span>
              <p className="text-base font-black text-sl-foreground">₦5,000</p>
              <p className="text-sl-muted leading-relaxed">
                Covers official digital player ID card generation, club induction, and subsidizes initial varsity gear procurement.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-sl-bg border border-sl-border/60 space-y-1">
              <span className="font-mono font-bold text-sl-green uppercase text-[11px]">Monthly Session Dues</span>
              <p className="text-base font-black text-sl-foreground">₦1,000 / month</p>
              <p className="text-sl-muted leading-relaxed">
                Funds ongoing weekly consumption of feather shuttlecocks, gymnasium lighting/cleaning dues, and court maintenance.
              </p>
            </div>
          </div>
          <p className="text-xs text-sl-muted leading-relaxed">
            • <strong>Non-Refundability:</strong> Dues contributed are committed immediately to non-refundable club operations (shuttlecock batches and court bookings). In exceptional medical circumstances, credit may be deferred to future months upon review by the club treasurer.
          </p>
        </section>

        {/* Section 7: Media, Photography & Varsity Coverage */}
        <section className="p-5 sm:p-6 rounded-2xl bg-sl-panel border border-sl-border space-y-3">
          <div className="flex items-center gap-2 text-sl-green">
            <Camera className="w-4.5 h-4.5 shrink-0" />
            <h2 className="text-sm sm:text-base font-black uppercase">
              7. Media, Photography &amp; Match Highlights
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-sl-muted leading-relaxed">
            By attending public training sessions and tournaments, you acknowledge that photography, video recordings, and highlight reels may be captured by designated club media personnel.
          </p>
          <p className="text-xs sm:text-sm text-sl-muted leading-relaxed">
            Footage is used exclusively for coaching tactical analysis, social media match recaps, and university sports publicity. Athletes who prefer not to appear in promotional materials may notify the media lead in writing to have their likeness excluded from public posts.
          </p>
        </section>

        {/* Section 8: Health, Safety & Liability Waiver */}
        <section className="p-5 sm:p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
          <div className="flex items-center gap-2 text-amber-400">
            <AlertTriangle className="w-4.5 h-4.5 shrink-0" />
            <h2 className="text-sm sm:text-base font-black uppercase">
              8. Physical Fitness &amp; Assumption of Athletic Risk
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-sl-foreground leading-relaxed font-medium">
            Badminton is an intensive racquet sport requiring rapid lunges, high-speed lateral pivots, jumps, and sustained aerobic effort:
          </p>
          <ul className="space-y-1.5 text-xs sm:text-sm text-sl-muted">
            <li className="flex items-start gap-2">
              <HeartPulse className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span><strong>Medical Clearance:</strong> Athletes certify they are physically fit to participate in sports and possess no undisclosed cardiovascular or orthopedic conditions that would make high-intensity athletics unsafe.</span>
            </li>
            <li className="flex items-start gap-2">
              <HeartPulse className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span><strong>Voluntary Assumption of Risk:</strong> Athletes voluntarily assume standard risks associated with court sports, including muscle strains, ankle twists, or accidental collisions.</span>
            </li>
            <li className="flex items-start gap-2">
              <HeartPulse className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span><strong>Hydration &amp; Warmup:</strong> Athletes are responsible for their own pre-match warm-ups, adequate water intake, and personal first-aid items (e.g. knee braces or ankle tape).</span>
            </li>
          </ul>
        </section>

        {/* Section 9: Governance & Jurisdiction */}
        <section className="p-5 sm:p-6 rounded-2xl bg-sl-panel border border-sl-border space-y-3">
          <div className="flex items-center gap-2 text-sl-green">
            <Scale className="w-4.5 h-4.5 shrink-0" />
            <h2 className="text-sm sm:text-base font-black uppercase">
              9. University Authority &amp; Dispute Resolution
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-sl-muted leading-relaxed">
            These terms operate under the overarching authority of the <strong>University of Nigeria Nsukka Sports Council</strong> and the laws of the Federal Republic of Nigeria.
          </p>
          <p className="text-xs sm:text-sm text-sl-muted leading-relaxed">
            Any grievances or disputes between club members shall first be addressed amicably through the ShuttleLions Executive Committee. Matters not resolved internally will be escalated to the UNN Director of Sports.
          </p>
        </section>

        {/* Section 10: Amendments & Contact */}
        <section className="p-5 sm:p-6 rounded-2xl bg-sl-panel border border-sl-border space-y-3">
          <div className="flex items-center gap-2 text-sl-green">
            <FileText className="w-4.5 h-4.5 shrink-0" />
            <h2 className="text-sm sm:text-base font-black uppercase">
              10. Amendments &amp; Executive Board Inquiries
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-sl-muted leading-relaxed">
            The Executive Committee reserves the right to amend these guidelines to reflect changes in university policies or BWF rule updates. Any substantial changes will be posted on this portal and announced on the club WhatsApp channel.
          </p>
          <div className="p-3.5 rounded-xl bg-sl-bg border border-sl-border/60 text-xs sm:text-sm space-y-1 text-sl-muted">
            <p><strong className="text-sl-foreground">Governing Body:</strong> ShuttleLions Executive Committee</p>
            <p><strong className="text-sl-foreground">Court Facility:</strong> UNN Indoor Sports Gymnasium, Nsukka Campus</p>
            <p><strong className="text-sl-foreground">Contact:</strong> Reach out via the official community channels</p>
          </div>
        </section>

        {/* Bottom Navigation Link Back to Privacy & Home */}
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
            href="/privacy"
            onClick={() => audio.play('serve')}
            className="shuttle-btn shuttle-btn-green text-xs uppercase py-2 px-4 flex items-center gap-1.5 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Read Privacy Policy</span>
          </Link>
        </div>
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
