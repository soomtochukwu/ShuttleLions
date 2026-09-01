'use client';

import { useState, useEffect } from 'react';
import { supabase, type Profile, type Payment, type CustomRole } from '@/lib/supabase';
import { useAuth } from '@/components/AuthContext';
import { TiltCard } from '@/components/ui/TiltCard';
import { ShuttleInput } from '@/components/ui/ShuttleInput';
import { ShuttleButton } from '@/components/ui/ShuttleButton';
import { PaymentWidgetPlaceholder } from '@/components/PaymentWidgetPlaceholder';
import { Users, Shield, Search, Sparkles, Lock, CheckCircle2, Crown, Video, DollarSign, Zap } from 'lucide-react';
import { audio } from '@/lib/audio';
import { useFeedback } from '@/components/ui/FeedbackModal';

import { useCachedQuery } from '@/lib/client-cache';

export default function CommunityMembersPage() {
  const { user } = useAuth();
  const { showAlert } = useFeedback();

  // 1. Cached Athlete Profiles
  const { data: profiles } = useCachedQuery<Profile[]>({
    key: 'community_profiles',
    initialFallback: [],
    fetcher: async () => {
      const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      return data || [];
    },
  });

  // 2. Cached Custom Roles
  const { data: customRoles } = useCachedQuery<CustomRole[]>({
    key: 'custom_roles',
    initialFallback: [],
    fetcher: async () => {
      const { data } = await supabase.from('custom_roles').select('*');
      return data || [];
    },
  });

  const [payments, setPayments] = useState<Payment[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'executives' | 'members'>('all');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    async function loadPayments() {
      if (!user?.id) return;
      const { data: payData } = await supabase
        .from('payments')
        .select('*')
        .eq('profile_id', user.id);
      setPayments(payData || []);
    }
    loadPayments();
  }, [user]);

  // Executive Role Determination (Any role appointment other than plain 'member')
  const isExecutiveRole = (role: string | null | undefined) => {
    if (!role) return false;
    return role !== 'member';
  };

  // Paid Access Gate Check (Registration paid or any executive appointment)
  const hasPaidReg = payments.some((p) => p.type === 'registration' && p.status === 'success');
  const isExecutiveUser = isExecutiveRole(user?.role);
  const isPaidMember = hasPaidReg || isExecutiveUser;

  const filteredProfiles = profiles.filter((p) => {
    const matchesSearch =
      p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.department?.toLowerCase().includes(search.toLowerCase()) ||
      p.faculty?.toLowerCase().includes(search.toLowerCase()) ||
      p.role?.toLowerCase().includes(search.toLowerCase());

    const isExec = isExecutiveRole(p.role);

    const matchesRole =
      roleFilter === 'all'
        ? true
        : roleFilter === 'executives'
        ? isExec
        : !isExec;

    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: string | null | undefined) => {
    if (!role || role === 'member') {
      return {
        label: '🦁 Student Athlete',
        colorClass: 'bg-sl-green/10 text-sl-green border-sl-green/20',
        avatarColor: 'bg-sl-green/20 border-sl-green text-sl-green',
      };
    }
    if (role === 'admin') {
      return {
        label: '🛡️ Executive Coach & Admin',
        colorClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        avatarColor: 'bg-amber-500/20 border-amber-400 text-amber-400',
      };
    }
    if (role === 'captain') {
      return {
        label: '👑 Team Captain',
        colorClass: 'bg-sl-green/25 text-sl-green-glow border-sl-green/50',
        avatarColor: 'bg-sl-green/20 border-sl-green text-sl-green',
      };
    }
    if (role === 'media_personnel') {
      return {
        label: '📹 Official Media Personnel',
        colorClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
        avatarColor: 'bg-cyan-500/20 border-cyan-400 text-cyan-400',
      };
    }
    if (role === 'treasurer') {
      return {
        label: '💰 Club Treasurer',
        colorClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        avatarColor: 'bg-emerald-500/20 border-emerald-400 text-emerald-400',
      };
    }

    // Dynamic Custom Role Match (e.g. Logistician)
    const custom = customRoles.find((r) => r.id === role);
    const title = custom ? custom.title : role.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

    return {
      label: `⚡ ${title}`,
      colorClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      avatarColor: 'bg-purple-500/20 border-purple-400 text-purple-400',
    };
  };

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
      showAlert({
        title: 'Membership Unlocked! 🏸',
        message: 'Your athlete registration fee has been verified. Welcome to the full community directory.',
        type: 'success',
        onConfirm: () => window.location.reload(),
      });
    } catch (err) {
      console.error(err);
      showAlert({
        title: 'Verification Error',
        message: 'Could not record membership payment.',
        type: 'error',
      });
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
            Browse registered student athletes, club executives, and appointed committee leads.
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
            All Athletes ({profiles.length})
          </button>
          <button
            onClick={() => {
              audio.play('rally');
              setRoleFilter('executives');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              roleFilter === 'executives' ? 'bg-amber-400 text-black shadow-sm font-black' : 'text-sl-muted hover:text-sl-foreground'
            }`}
          >
            🛡️ Appointed Executives ({profiles.filter((p) => isExecutiveRole(p.role)).length})
          </button>
          <button
            onClick={() => {
              audio.play('rally');
              setRoleFilter('members');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              roleFilter === 'members' ? 'bg-sl-green text-white shadow-sm' : 'text-sl-muted hover:text-sl-foreground'
            }`}
          >
            🦁 Athletes Only
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="max-w-md">
        <ShuttleInput
          placeholder="Search by student name, faculty, department, or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="py-2.5 text-xs"
        />
      </div>

      {/* Members Grid with 3D Tilt */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProfiles.map((p) => {
          const badgeInfo = getRoleBadge(p.role);
          const isExec = isExecutiveRole(p.role);

          return (
            <TiltCard key={p.id} className="p-5 bg-sl-panel space-y-4 border border-sl-border">
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black border-2 ${badgeInfo.avatarColor}`}
                >
                  {p.avatar_url ? (
                    <img src={p.avatar_url} alt={p.full_name || 'Athlete'} className="w-full h-full rounded-lg object-cover" />
                  ) : (
                    p.full_name?.charAt(0) || 'L'
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-black text-sl-foreground truncate">{p.full_name}</h3>
                  </div>
                  <span
                    className={`inline-block text-[9px] font-black uppercase px-2 py-0.5 rounded border mt-0.5 ${badgeInfo.colorClass}`}
                  >
                    {badgeInfo.label}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-sl-bg rounded-xl border border-sl-border text-[11px] space-y-1 font-semibold text-sl-muted">
                <p className="truncate text-sl-foreground font-bold">{p.department || 'Department pending'}</p>
                <p className="truncate">{p.faculty || 'Faculty of Physical Sciences'}</p>
                <p className="font-mono text-sl-green">{p.level ? `${p.level} Level` : ''}</p>
              </div>
            </TiltCard>
          );
        })}
      </div>
    </div>
  );
}
