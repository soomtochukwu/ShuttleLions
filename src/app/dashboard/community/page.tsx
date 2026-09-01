'use client';

import { useState, useEffect } from 'react';
import { supabase, type Profile, type Payment } from '@/lib/supabase';
import { useAuth } from '@/components/AuthContext';
import { TiltCard } from '@/components/ui/TiltCard';
import { ShuttleInput } from '@/components/ui/ShuttleInput';
import { ShuttleButton } from '@/components/ui/ShuttleButton';
import { PaymentWidgetPlaceholder } from '@/components/PaymentWidgetPlaceholder';
import { Users, Shield, Search, Sparkles, Lock, CheckCircle2 } from 'lucide-react';
import { audio } from '@/lib/audio';

export default function CommunityMembersPage() {
  const { user } = useAuth();

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'executives' | 'members'>('all');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!user?.id) return;
      const { data: profData } = await supabase.from('profiles').select('*');
      setProfiles(profData || []);

      const { data: payData } = await supabase
        .from('payments')
        .select('*')
        .eq('profile_id', user.id);
      setPayments(payData || []);
    }
    loadData();
  }, [user?.id]);

  // Paid Access Gate Check (Registration or current monthly dues paid)
  const isPaidMember = payments.some((p) => p.status === 'success');

  const filteredProfiles = profiles.filter((p) => {
    const matchesSearch =
      p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.department?.toLowerCase().includes(search.toLowerCase()) ||
      p.faculty?.toLowerCase().includes(search.toLowerCase());

    const matchesRole =
      roleFilter === 'all'
        ? true
        : roleFilter === 'executives'
        ? p.role === 'admin' || p.role === 'captain'
        : p.role === 'member';

    return matchesSearch && matchesRole;
  });

  const handleUnlockPayment = async (reference: string) => {
    if (!user?.id) return;
    try {
      await supabase.from('payments').insert({
        profile_id: user.id,
        type: 'registration',
        amount_kobo: 500000,
        status: 'success',
        reference,
        provider: 'simulated',
      });
      audio.play('whistle');
      alert('Community membership unlocked!');
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  if (!isPaidMember) {
    return (
      <div className="shuttle-panel p-8 sm:p-12 bg-sl-panel text-center max-w-xl mx-auto space-y-6">
        <div className="w-16 h-16 rounded-full bg-sl-green/20 text-sl-green flex items-center justify-center mx-auto text-3xl">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-black uppercase text-sl-green tracking-widest">
            MEMBER DIRECTORY GATE
          </span>
          <h2 className="text-2xl font-black text-sl-foreground uppercase">
            Paid Member Access Required
          </h2>
          <p className="text-xs text-sl-muted leading-relaxed font-medium">
            Active registration fee or monthly dues are required to access the full student athlete directory, chat channels, and community voting.
          </p>
        </div>

        <ShuttleButton
          variant="green"
          onClick={() => {
            audio.play('smash');
            setIsCheckoutOpen(true);
          }}
          className="py-3 px-8 text-xs font-black shadow-lg"
        >
          Pay Dues to Unlock Directory ⚡
        </ShuttleButton>

        <PaymentWidgetPlaceholder
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          amountKobo={500000}
          paymentType="registration"
          onSuccess={handleUnlockPayment}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-black uppercase text-sl-foreground"
            style={{ fontFamily: 'var(--font-title)' }}
          >
            👥 UNN Athlete Directory
          </h1>
          <p className="text-xs text-sl-muted font-medium mt-1">
            Browse registered student athletes, sort for club executives & team captains.
          </p>
        </div>

        {/* Role Filters */}
        <div className="flex items-center gap-2 bg-sl-panel p-1 rounded-xl border border-sl-border">
          <button
            onClick={() => {
              audio.play('rally');
              setRoleFilter('all');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              roleFilter === 'all' ? 'bg-sl-green text-white shadow-sm' : 'text-sl-muted hover:text-sl-foreground'
            }`}
          >
            All Members ({profiles.length})
          </button>
          <button
            onClick={() => {
              audio.play('rally');
              setRoleFilter('executives');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              roleFilter === 'executives' ? 'bg-sl-warning text-black shadow-sm font-black' : 'text-sl-muted hover:text-sl-foreground'
            }`}
          >
            🛡️ Executives Only
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="max-w-md">
        <ShuttleInput
          placeholder="Search by student name, faculty, or department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="py-2.5 text-xs"
        />
      </div>

      {/* Members Grid with 3D Tilt */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProfiles.map((p) => {
          const isExec = p.role === 'admin' || p.role === 'captain';

          return (
            <TiltCard key={p.id} className="p-5 bg-sl-panel space-y-4">
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black border-2 ${
                    isExec
                      ? 'bg-sl-warning/20 border-sl-warning text-sl-warning'
                      : 'bg-sl-green/20 border-sl-green text-sl-green'
                  }`}
                >
                  {p.full_name?.charAt(0) || 'L'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-black text-sl-foreground truncate">{p.full_name}</h3>
                  </div>
                  <span
                    className={`inline-block text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                      isExec
                        ? 'bg-sl-warning/20 text-sl-warning border border-sl-warning/30'
                        : 'bg-sl-green/10 text-sl-green'
                    }`}
                  >
                    {p.role === 'captain' ? '👑 Team Captain' : p.role === 'admin' ? '🛡️ Executive' : '🦁 Member'}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-sl-bg rounded-xl border border-sl-border text-[11px] space-y-1 font-semibold text-sl-muted">
                <p className="truncate text-sl-foreground font-bold">{p.department || 'Department pending'}</p>
                <p className="truncate">{p.faculty}</p>
                <p className="font-mono text-sl-green">{p.level ? `${p.level} Level` : ''}</p>
              </div>
            </TiltCard>
          );
        })}
      </div>
    </div>
  );
}
