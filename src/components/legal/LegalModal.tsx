'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, FileText, X, Lock, CheckCircle2 } from 'lucide-react';
import { audio } from '@/lib/audio';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'privacy' | 'terms';
}

export function LegalModal({ isOpen, onClose, defaultTab = 'privacy' }: LegalModalProps) {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>(defaultTab);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="shuttle-panel bg-sl-panel border border-sl-border max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl rounded-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-sl-border/40 bg-sl-bg">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-sl-green/15 text-sl-green flex items-center justify-center font-bold">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-sl-foreground uppercase tracking-wider">
                  Club Governance & Athlete Data Protection
                </h3>
                <p className="text-[10px] text-sl-muted">
                  University of Nigeria, Nsukka (UNN) Badminton Club
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                audio.haptic('tap');
                onClose();
              }}
              className="p-1.5 rounded-lg text-sl-muted hover:text-sl-foreground hover:bg-sl-panel border border-transparent hover:border-sl-border transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tab Bar */}
          <div className="flex border-b border-sl-border/40 bg-sl-panel px-5 pt-3 gap-2">
            <button
              type="button"
              onClick={() => {
                audio.haptic('tap');
                setActiveTab('privacy');
              }}
              className={`pb-2.5 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'privacy'
                  ? 'border-sl-green text-sl-green'
                  : 'border-transparent text-sl-muted hover:text-sl-foreground'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Privacy Policy</span>
            </button>
            <button
              type="button"
              onClick={() => {
                audio.haptic('tap');
                setActiveTab('terms');
              }}
              className={`pb-2.5 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'terms'
                  ? 'border-sl-green text-sl-green'
                  : 'border-transparent text-sl-muted hover:text-sl-foreground'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Terms of Service</span>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto space-y-4 text-xs text-sl-muted leading-relaxed">
            {activeTab === 'privacy' ? (
              <>
                <div className="space-y-1.5">
                  <h4 className="font-black text-sl-foreground uppercase text-xs">
                    1. Non-Commercial Student Club
                  </h4>
                  <p>
                    ShuttleLions is the recognized varsity and student badminton club portal at the University of Nigeria, Nsukka (UNN). This platform is built solely for court scheduling, training sessions, equipment logistics, and varsity tournament organizing.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h4 className="font-black text-sl-foreground uppercase text-xs">
                    2. No Password Collection or Credential Harvesting
                  </h4>
                  <p>
                    ShuttleLions does not collect, ask for, store, or handle any external passwords or Google account credentials. Sign-in is handled securely via standard OAuth2 protocols mediated by Supabase Auth. We only receive standard profile identifiers (display name and student email) authorized directly by the user.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h4 className="font-black text-sl-foreground uppercase text-xs">
                    3. Athlete Data Usage
                  </h4>
                  <p>
                    Data collected (faculty, department, matriculation number, phone number) is used exclusively for verified club rosters, tournament seedings, and automated game session reminders via email or on-device push notifications.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h4 className="font-black text-sl-foreground uppercase text-xs">
                    4. Data Retention & Deletion
                  </h4>
                  <p>
                    Athletes retain full rights to update their profile settings or request complete removal from club rosters by contacting the club executive board or deleting their account in settings.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-1.5">
                  <h4 className="font-black text-sl-foreground uppercase text-xs">
                    1. Court Etiquette & Safety
                  </h4>
                  <p>
                    All registered athletes and guests must wear non-marking indoor court shoes when playing at the UNN indoor gymnasium. Respect for teammates, coaches, and sportsmanship is strictly required during training and tournament events.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h4 className="font-black text-sl-foreground uppercase text-xs">
                    2. Session RSVPs & Equipment Borrowing
                  </h4>
                  <p>
                    Athletes who RSVP for weekly training sessions are expected to arrive punctually. Club rackets and feather shuttlecocks remain the collective property of ShuttleLions and must be returned to the logistics manager after sessions.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h4 className="font-black text-sl-foreground uppercase text-xs">
                    3. Membership Dues
                  </h4>
                  <p>
                    Registration fees and monthly session subscriptions directly support court booking fees, shuttlecock procurement, racket restringing subsidies, and varsity travel.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-sl-border/40 bg-sl-bg flex items-center justify-between">
            <span className="text-[10px] text-sl-muted flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-sl-green" /> Verified UNN Sports Community
            </span>
            <button
              type="button"
              onClick={() => {
                audio.haptic('tap');
                onClose();
              }}
              className="px-4 py-1.5 bg-sl-green hover:bg-sl-green-glow hover:text-black text-white text-xs font-black rounded-lg transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
