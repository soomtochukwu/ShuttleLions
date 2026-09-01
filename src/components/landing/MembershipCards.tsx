'use client';

import { motion } from 'framer-motion';
import { TiltCard } from '@/components/ui/TiltCard';
import { ShuttleButton } from '@/components/ui/ShuttleButton';
import { formatKobo, REGISTRATION_FEE, MONTHLY_FEE } from '@/lib/constants';
import { Zap, Calendar, ShoppingBag, Check } from 'lucide-react';

interface MembershipCardsProps {
 onSelectTier: (type: 'registration' | 'monthly' | 'racket') => void;
}

export function MembershipCards({ onSelectTier }: MembershipCardsProps) {
 return (
 <section className="relative w-full py-20 px-4 sm:px-8 select-none z-10">
 <div className="max-w-6xl mx-auto space-y-12">
 {/* Header */}
 <div className="text-center space-y-3">
 <span className="text-xs font-black uppercase tracking-widest text-sl-green">
 TRANSPARENT ATHLETIC MEMBERSHIP
 </span>
 <h2
 className="text-3xl sm:text-5xl font-black uppercase text-sl-foreground"
 style={{ fontFamily: 'var(--font-title)' }}
 >
 REGISTRATION & <span className="text-sl-green">DUES</span>
 </h2>
 <p className="text-xs sm:text-sm text-sl-muted max-w-xl mx-auto font-medium">
 Affordable collegiate pricing covering indoor hall lighting, tournament entry, and gear logistics.
 </p>
 </div>

 {/* 3-Tier Grid */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
 {/* Card 1: One-Time Registration */}
 <motion.div
 initial={{ opacity: 0, y: 30 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true }}
 transition={{ delay: 0.1 }}
 >
 <TiltCard className="p-8 bg-sl-panel h-full flex flex-col justify-between space-y-6 border-2 border-sl-green/40">
 <div className="space-y-4">
 <div className="flex items-center justify-between">
 <div className="p-2.5 rounded-xl bg-sl-green/10 text-sl-green border border-sl-green/30">
 <Zap className="w-5 h-5" />
 </div>
 <span className="text-[10px] font-black uppercase bg-sl-green text-white px-2.5 py-0.5 rounded-full">
 Mandatory Once
 </span>
 </div>

 <div>
 <h3 className="text-xl font-black text-sl-foreground uppercase">
 Registration Fee
 </h3>
 <div className="mt-2 flex items-baseline gap-1">
 <span className="text-4xl font-black text-sl-green font-mono">
 {formatKobo(REGISTRATION_FEE)}
 </span>
 <span className="text-xs text-sl-muted font-bold">one-time</span>
 </div>
 </div>

 <ul className="space-y-2.5 text-xs text-sl-foreground font-semibold pt-2">
 <li className="flex items-center gap-2">
 <Check className="w-4 h-4 text-sl-green shrink-0" />
 <span>Official UNN Student Athlete Profile</span>
 </li>
 <li className="flex items-center gap-2">
 <Check className="w-4 h-4 text-sl-green shrink-0" />
 <span>Digital Verified Member ID Card</span>
 </li>
 <li className="flex items-center gap-2">
 <Check className="w-4 h-4 text-sl-green shrink-0" />
 <span>Starter Shuttlecock Tube (Feathers)</span>
 </li>
 <li className="flex items-center gap-2">
 <Check className="w-4 h-4 text-sl-green shrink-0" />
 <span>Community Chat & Voting Access</span>
 </li>
 </ul>
 </div>

 <ShuttleButton
 variant="green"
 onClick={() => onSelectTier('registration')}
 className="w-full py-3 text-xs font-black"
 >
 Pay Registration Fee 
 </ShuttleButton>
 </TiltCard>
 </motion.div>

 {/* Card 2: Monthly Dues */}
 <motion.div
 initial={{ opacity: 0, y: 30 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true }}
 transition={{ delay: 0.2 }}
 >
 <TiltCard className="p-8 bg-sl-panel h-full flex flex-col justify-between space-y-6">
 <div className="space-y-4">
 <div className="flex items-center justify-between">
 <div className="p-2.5 rounded-xl bg-sl-bg text-sl-green border border-sl-border">
 <Calendar className="w-5 h-5" />
 </div>
 <span className="text-[10px] font-black uppercase bg-sl-bg text-sl-muted px-2.5 py-0.5 rounded-full border border-sl-border">
 Active Members
 </span>
 </div>

 <div>
 <h3 className="text-xl font-black text-sl-foreground uppercase">
 Monthly Dues
 </h3>
 <div className="mt-2 flex items-baseline gap-1">
 <span className="text-4xl font-black text-sl-green font-mono">
 {formatKobo(MONTHLY_FEE)}
 </span>
 <span className="text-xs text-sl-muted font-bold">/month</span>
 </div>
 </div>

 <ul className="space-y-2.5 text-xs text-sl-foreground font-semibold pt-2">
 <li className="flex items-center gap-2">
 <Check className="w-4 h-4 text-sl-green shrink-0" />
 <span>Indoor Sports Hall Court Maintenance</span>
 </li>
 <li className="flex items-center gap-2">
 <Check className="w-4 h-4 text-sl-green shrink-0" />
 <span>High-power Night Lighting & Power</span>
 </li>
 <li className="flex items-center gap-2">
 <Check className="w-4 h-4 text-sl-green shrink-0" />
 <span>Tournament Net Stringing & Upkeep</span>
 </li>
 <li className="flex items-center gap-2">
 <Check className="w-4 h-4 text-sl-green shrink-0" />
 <span>Entry to Weekly Open Rally Matches</span>
 </li>
 </ul>
 </div>

 <ShuttleButton
 variant="white"
 onClick={() => onSelectTier('monthly')}
 className="w-full py-3 text-xs font-black border-2 border-sl-border"
 >
 Pay Monthly Dues 
 </ShuttleButton>
 </TiltCard>
 </motion.div>

 {/* Card 3: Impromptu Contributions & Pro Gear */}
 <motion.div
 initial={{ opacity: 0, y: 30 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true }}
 transition={{ delay: 0.3 }}
 >
 <TiltCard className="p-8 bg-sl-panel h-full flex flex-col justify-between space-y-6">
 <div className="space-y-4">
 <div className="flex items-center justify-between">
 <div className="p-2.5 rounded-xl bg-sl-bg text-amber-500 border border-sl-border">
 <ShoppingBag className="w-5 h-5" />
 </div>
 <span className="text-[10px] font-black uppercase bg-sl-bg text-sl-muted px-2.5 py-0.5 rounded-full border border-sl-border">
 Equipment / Voluntary
 </span>
 </div>

 <div>
 <h3 className="text-xl font-black text-sl-foreground uppercase">
 Pro Gear & Impromptu
 </h3>
 <div className="mt-2 flex items-baseline gap-1">
 <span className="text-4xl font-black text-sl-green font-mono">
 Custom
 </span>
 <span className="text-xs text-sl-muted font-bold">as needed</span>
 </div>
 </div>

 <ul className="space-y-2.5 text-xs text-sl-foreground font-semibold pt-2">
 <li className="flex items-center gap-2">
 <Check className="w-4 h-4 text-sl-green shrink-0" />
 <span>Order Professional Yonex / Li-Ning Rackets</span>
 </li>
 <li className="flex items-center gap-2">
 <Check className="w-4 h-4 text-sl-green shrink-0" />
 <span>Executive Court Procurement Assistance</span>
 </li>
 <li className="flex items-center gap-2">
 <Check className="w-4 h-4 text-sl-green shrink-0" />
 <span>Tournament Jersey & Grip Packs</span>
 </li>
 <li className="flex items-center gap-2">
 <Check className="w-4 h-4 text-sl-green shrink-0" />
 <span>Voluntary Team Tour Contribution</span>
 </li>
 </ul>
 </div>

 <ShuttleButton
 variant="white"
 onClick={() => onSelectTier('racket')}
 className="w-full py-3 text-xs font-black border-2 border-sl-border"
 >
 Browse Equipment Shop 
 </ShuttleButton>
 </TiltCard>
 </motion.div>
 </div>
 </div>
 </section>
 );
}
