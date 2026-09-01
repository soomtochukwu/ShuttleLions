'use client';

import { motion } from 'framer-motion';
import { TiltCard } from '@/components/ui/TiltCard';
import { Users, Trophy, Clock, CheckCircle2 } from 'lucide-react';

const STATS = [
  {
    icon: <Users className="w-6 h-6 text-sl-green" />,
    value: '250+',
    label: 'UNN Student Athletes',
    desc: 'Across 15 faculties and all academic levels.',
  },
  {
    icon: <Trophy className="w-6 h-6 text-amber-500" />,
    value: '18',
    label: 'Collegiate Medals Won',
    desc: 'NUGA & Inter-University tournament honors.',
  },
  {
    icon: <Clock className="w-6 h-6 text-sl-green" />,
    value: '3x',
    label: 'Weekly Club Activities',
    desc: 'Tuesday (4PM Training), Saturday (7AM In-House Tournament) & Sunday (4PM Training).',
  },
  {
    icon: <CheckCircle2 className="w-6 h-6 text-sl-green-glow" />,
    value: '100%',
    label: 'Transparent Logistics',
    desc: 'Direct racket procurement & fee auditing.',
  },
];

export function StatsRally() {
  return (
    <section className="relative w-full py-20 px-4 sm:px-8 select-none z-10">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-3">
          <span className="text-xs font-black uppercase tracking-widest text-sl-green">
            ATHLETIC EXCELLENCE IN NUMBERS
          </span>
          <h2
            className="text-3xl sm:text-5xl font-black uppercase text-sl-foreground"
            style={{ fontFamily: 'var(--font-title)' }}
          >
            THE SHUTTLE<span className="text-sl-green">LIONS</span> RECORD
          </h2>
          <p className="text-xs sm:text-sm text-sl-muted max-w-xl mx-auto font-medium">
            Building collegiate champions with modern athletic training and seamless community operations.
          </p>
        </div>

        {/* 4-Card Stats Grid with 3D Tilt */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, type: 'spring', damping: 20 }}
            >
              <TiltCard className="p-6 bg-sl-panel h-full flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-sl-bg border border-sl-border">
                    {stat.icon}
                  </div>
                  <span className="text-3xl sm:text-4xl font-black text-sl-green font-mono">
                    {stat.value}
                  </span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-sl-foreground uppercase">
                    {stat.label}
                  </h3>
                  <p className="text-xs text-sl-muted leading-relaxed font-medium">
                    {stat.desc}
                  </p>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
