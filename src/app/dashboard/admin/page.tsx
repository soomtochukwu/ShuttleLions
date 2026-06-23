'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/AuthContext';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { ShuttleInput } from '@/components/ui/ShuttleInput';
import { ShuttleSelect } from '@/components/ui/ShuttleSelect';
import { ShuttleButton } from '@/components/ui/ShuttleButton';
import { supabase, type Profile, type Payment, type RacketOrder } from '@/lib/supabase';
import { RACKET_STATUSES, RACKET_STATUS_LABELS, formatKobo } from '@/lib/constants';
import { audio } from '@/lib/audio';

type AdminTab = 'members' | 'payments' | 'rackets';

export default function AdminPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  // Tabs state
  const [activeTab, setActiveTab] = useState<AdminTab>('members');

  // Query states
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [orders, setOrders] = useState<RacketOrder[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Filter/Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [paymentTypeFilter, setPaymentTypeFilter] = useState<string>('all');
  const [racketStatusFilter, setRacketStatusFilter] = useState<string>('all');

  // Edit states for racket orders
  const [editingNotesOrderId, setEditingNotesOrderId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState('');
  const [isUpdatingOrder, setIsUpdatingOrder] = useState<string | null>(null);

  // Route guarding: only admin or captain allowed
  useEffect(() => {
    if (!isAuthLoading && (!user || (user.role !== 'admin' && user.role !== 'captain'))) {
      router.push('/dashboard');
    }
  }, [user, isAuthLoading, router]);

  // Data fetching
  const fetchAllData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      // 1. Fetch profiles
      const { data: profData, error: profErr } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (profErr) throw profErr;
      setProfiles(profData || []);

      // 2. Fetch payments
      const { data: payData, error: payErr } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });
      if (payErr) throw payErr;
      setPayments(payData || []);

      // 3. Fetch racket orders
      const { data: ordData, error: ordErr } = await supabase
        .from('racket_orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (ordErr) throw ordErr;
      setOrders(ordData || []);
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'captain')) {
      fetchAllData();
    }
  }, [user, fetchAllData]);

  const handleTabChange = (tab: AdminTab) => {
    audio.play('rally');
    setActiveTab(tab);
    setSearchQuery('');
  };

  // Update racket status database trigger
  const handleUpdateRacketStatus = async (orderId: string, newStatus: any) => {
    setIsUpdatingOrder(orderId);
    audio.play('serve');
    try {
      const { error } = await supabase
        .from('racket_orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      
      audio.play('whistle');
      setOrders(prev =>
        prev.map(o => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err: any) {
      audio.play('courtSqueak');
      alert(`Failed to update status: ${err.message}`);
    } finally {
      setIsUpdatingOrder(null);
    }
  };

  // Update racket notes database trigger
  const handleSaveRacketNotes = async (orderId: string) => {
    setIsUpdatingOrder(orderId);
    audio.play('serve');
    try {
      const { error } = await supabase
        .from('racket_orders')
        .update({ notes: tempNotes.trim() || null })
        .eq('id', orderId);

      if (error) throw error;

      audio.play('whistle');
      setOrders(prev =>
        prev.map(o => (o.id === orderId ? { ...o, notes: tempNotes.trim() || null } : o))
      );
      setEditingNotesOrderId(null);
    } catch (err: any) {
      audio.play('courtSqueak');
      alert(`Failed to update notes: ${err.message}`);
    } finally {
      setIsUpdatingOrder(null);
    }
  };

  const handleStartEditingNotes = (orderId: string, currentNotes: string | null) => {
    audio.play('rally');
    setEditingNotesOrderId(orderId);
    setTempNotes(currentNotes || '');
  };

  // Filters logic
  const filteredProfiles = profiles.filter(p => {
    const matchesSearch =
      p.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.faculty?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || p.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const filteredPayments = payments.filter(pay => {
    // Lookup associated profile
    const profile = profiles.find(p => p.id === pay.profile_id);
    const name = profile?.full_name || '';
    const email = profile?.email || '';

    const matchesSearch =
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pay.reference.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = paymentTypeFilter === 'all' || pay.type === paymentTypeFilter;
    return matchesSearch && matchesType;
  });

  const filteredOrders = orders.filter(ord => {
    const profile = profiles.find(p => p.id === ord.profile_id);
    const name = profile?.full_name || '';
    const email = profile?.email || '';

    const matchesSearch =
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.racket_model.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = racketStatusFilter === 'all' || ord.status === racketStatusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col min-h-screen w-full bg-sl-bg">
      <Navbar onOpenAuth={() => {}} />

      <div className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 z-10 space-y-6 pb-20">
        
        {/* Header Title */}
        <section className="shuttle-panel p-6 bg-sl-panel flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-sl-foreground flex items-center gap-2" style={{ fontFamily: 'Bangers, cursive' }}>
              🛡️ Admin Command Room
            </h1>
            <p className="text-xs text-sl-muted font-bold">
              Manage ShuttleLions students, membership records, and racket order processing.
            </p>
          </div>
          <ShuttleButton
            variant="white"
            onClick={() => {
              audio.play('netDrop');
              window.location.href = '/dashboard';
            }}
            className="py-1.5 px-4 text-xs font-bold border-2 border-sl-border"
          >
            ← Back to Student Dashboard
          </ShuttleButton>
        </section>

        {/* Admin Tabs */}
        <div className="flex gap-2 sm:gap-4 border-b-2 border-sl-border/20 pb-1">
          <button
            onClick={() => handleTabChange('members')}
            className={`py-2 px-4 font-bold text-xs sm:text-sm uppercase rounded-t border-t-3 border-x-3 border-sl-border relative top-[2px] transition-all ${
              activeTab === 'members'
                ? 'bg-sl-panel text-sl-green border-sl-border shadow-[0_2px_0_var(--sl-panel)] z-10'
                : 'bg-sl-panel/40 text-sl-muted border-transparent hover:text-sl-foreground hover:bg-sl-panel/60'
            }`}
          >
            🦁 Member Profiles ({profiles.length})
          </button>
          <button
            onClick={() => handleTabChange('payments')}
            className={`py-2 px-4 font-bold text-xs sm:text-sm uppercase rounded-t border-t-3 border-x-3 border-sl-border relative top-[2px] transition-all ${
              activeTab === 'payments'
                ? 'bg-sl-panel text-sl-green border-sl-border shadow-[0_2px_0_var(--sl-panel)] z-10'
                : 'bg-sl-panel/40 text-sl-muted border-transparent hover:text-sl-foreground hover:bg-sl-panel/60'
            }`}
          >
            💳 Club Dues & Payments ({payments.length})
          </button>
          <button
            onClick={() => handleTabChange('rackets')}
            className={`py-2 px-4 font-bold text-xs sm:text-sm uppercase rounded-t border-t-3 border-x-3 border-sl-border relative top-[2px] transition-all ${
              activeTab === 'rackets'
                ? 'bg-sl-panel text-sl-green border-sl-border shadow-[0_2px_0_var(--sl-panel)] z-10'
                : 'bg-sl-panel/40 text-sl-muted border-transparent hover:text-sl-foreground hover:bg-sl-panel/60'
            }`}
          >
            🏸 Racket Shipments ({orders.length})
          </button>
        </div>

        {/* Search & Filters Row */}
        <div className="shuttle-panel p-4 bg-sl-panel flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="w-full md:max-w-xs">
            <ShuttleInput
              placeholder={
                activeTab === 'members'
                  ? 'Search by name, email, department...'
                  : activeTab === 'payments'
                  ? 'Search user name, reference...'
                  : 'Search user name, racket model...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="py-2 text-xs"
            />
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            {activeTab === 'members' && (
              <ShuttleSelect
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Roles' },
                  { value: 'member', label: 'Members Only' },
                  { value: 'admin', label: 'Admins Only' },
                  { value: 'captain', label: 'Captains Only' },
                ]}
                className="py-2 text-xs"
              />
            )}

            {activeTab === 'payments' && (
              <ShuttleSelect
                value={paymentTypeFilter}
                onChange={(e) => setPaymentTypeFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Payment Types' },
                  { value: 'registration', label: 'Registration' },
                  { value: 'monthly', label: 'Monthly dues' },
                  { value: 'racket', label: 'Rackets' },
                ]}
                className="py-2 text-xs"
              />
            )}

            {activeTab === 'rackets' && (
              <ShuttleSelect
                value={racketStatusFilter}
                onChange={(e) => setRacketStatusFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Statuses' },
                  ...RACKET_STATUSES.map(st => ({ value: st, label: RACKET_STATUS_LABELS[st] })),
                ]}
                className="py-2 text-xs"
              />
            )}

            <ShuttleButton
              variant="white"
              onClick={fetchAllData}
              className="py-2 px-4 border-2 border-sl-border text-xs"
              disabled={isLoadingData}
            >
              🔄 Refresh
            </ShuttleButton>
          </div>
        </div>

        {/* Tab Contents */}
        {isLoadingData ? (
          <div className="text-center py-16 space-y-4 shuttle-panel bg-sl-panel">
            <div className="text-4xl animate-bounce">🏸</div>
            <p className="text-sm font-bold text-sl-muted font-mono">RETRIEVING RECORDS...</p>
          </div>
        ) : (
          <div className="shuttle-panel bg-sl-panel overflow-hidden">
            
            {/* Tab 1: Member Profiles Table */}
            {activeTab === 'members' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b-3 border-sl-border bg-sl-green/10 font-bold uppercase">
                      <th className="p-3">Lion Name</th>
                      <th className="p-3">UNN Email</th>
                      <th className="p-3">Department & Faculty</th>
                      <th className="p-3">Reg No</th>
                      <th className="p-3">Level</th>
                      <th className="p-3">Phone</th>
                      <th className="p-3">Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProfiles.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-6 text-center text-sl-muted font-bold">
                          No matching student profiles found.
                        </td>
                      </tr>
                    ) : (
                      filteredProfiles.map((p) => (
                        <tr key={p.id} className="border-b-2 border-sl-border/10 hover:bg-sl-bg/20">
                          <td className="p-3 font-extrabold">{p.full_name || 'Incomplete Profile'}</td>
                          <td className="p-3 font-mono text-sl-muted">{p.email}</td>
                          <td className="p-3 font-bold text-sl-muted">
                            {p.department ? `${p.department} (${p.faculty})` : '—'}
                          </td>
                          <td className="p-3 font-mono text-sl-muted">{p.reg_number || '—'}</td>
                          <td className="p-3 font-bold">{p.level ? `${p.level} Level` : '—'}</td>
                          <td className="p-3 font-bold text-sl-muted">{p.phone || '—'}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded font-extrabold border ${
                              p.role === 'admin' || p.role === 'captain'
                                ? 'bg-sl-warning/20 border-sl-warning text-sl-warning-dark'
                                : 'bg-sl-green/10 border-sl-green/30 text-sl-green'
                            }`}>
                              {p.role}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tab 2: Payments Table */}
            {activeTab === 'payments' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b-3 border-sl-border bg-sl-green/10 font-bold uppercase">
                      <th className="p-3">Lion Name</th>
                      <th className="p-3">Reference ID</th>
                      <th className="p-3">Payment Type</th>
                      <th className="p-3">Month Period</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Gateway Status</th>
                      <th className="p-3">Transaction Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-6 text-center text-sl-muted font-bold">
                          No matching payment records found.
                        </td>
                      </tr>
                    ) : (
                      filteredPayments.map((pay) => {
                        const prof = profiles.find(p => p.id === pay.profile_id);
                        const period = (pay.metadata as any)?.period || '—';
                        return (
                          <tr key={pay.id} className="border-b-2 border-sl-border/10 hover:bg-sl-bg/20">
                            <td className="p-3 font-extrabold">{prof?.full_name || 'Unknown student'}</td>
                            <td className="p-3 font-mono text-sl-muted">{pay.reference}</td>
                            <td className="p-3 font-bold uppercase text-sl-green">{pay.type}</td>
                            <td className="p-3 font-bold text-sl-muted">{period}</td>
                            <td className="p-3 font-extrabold">{formatKobo(pay.amount_kobo)}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded font-black border uppercase ${
                                pay.status === 'success'
                                  ? 'bg-sl-green text-white border-sl-border'
                                  : 'bg-sl-error/20 border-sl-error text-sl-error'
                              }`}>
                                {pay.status}
                              </span>
                            </td>
                            <td className="p-3 font-mono text-sl-muted">
                              {new Date(pay.created_at).toLocaleString()}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tab 3: Racket Orders Manager */}
            {activeTab === 'rackets' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b-3 border-sl-border bg-sl-green/10 font-bold uppercase">
                      <th className="p-3">Lion Name</th>
                      <th className="p-3">Racket Specs</th>
                      <th className="p-3">Total Paid</th>
                      <th className="p-3">Order Status</th>
                      <th className="p-3">Notes & Comments</th>
                      <th className="p-3">Order Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-sl-muted font-bold">
                          No matching racket orders found.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((ord) => {
                        const prof = profiles.find(p => p.id === ord.profile_id);
                        const isNotesEditing = editingNotesOrderId === ord.id;
                        const isProcessing = isUpdatingOrder === ord.id;

                        return (
                          <tr key={ord.id} className="border-b-2 border-sl-border/10 hover:bg-sl-bg/20">
                            <td className="p-3 font-extrabold">{prof?.full_name || 'Unknown student'}</td>
                            <td className="p-3 font-bold">
                              {ord.racket_model} <span className="text-[10px] text-sl-muted">({ord.quantity}x)</span>
                            </td>
                            <td className="p-3 font-extrabold text-sl-green">
                              {formatKobo(ord.total_price_kobo)}
                            </td>
                            <td className="p-3">
                              <select
                                value={ord.status}
                                onChange={(e) => handleUpdateRacketStatus(ord.id, e.target.value)}
                                disabled={isProcessing}
                                className="border-2 border-sl-border p-1 bg-sl-panel font-bold rounded shadow-[1px_1px_0_var(--sl-shadow)] focus:border-sl-green outline-none"
                              >
                                {RACKET_STATUSES.map(st => (
                                  <option key={st} value={st}>
                                    {RACKET_STATUS_LABELS[st]}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="p-3 min-w-[200px]">
                              {isNotesEditing ? (
                                <div className="flex gap-2">
                                  <textarea
                                    value={tempNotes}
                                    onChange={(e) => setTempNotes(e.target.value)}
                                    className="border-2 border-sl-border p-1 bg-sl-panel flex-1 rounded font-sans text-xs focus:border-sl-green outline-none"
                                    rows={1}
                                  />
                                  <ShuttleButton
                                    variant="green"
                                    onClick={() => handleSaveRacketNotes(ord.id)}
                                    className="py-1 px-2 text-[10px]"
                                    disabled={isProcessing}
                                  >
                                    Save
                                  </ShuttleButton>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-sl-muted italic">{ord.notes || '—'}</span>
                                  <button
                                    onClick={() => handleStartEditingNotes(ord.id, ord.notes)}
                                    className="text-[10px] text-sl-green font-bold hover:underline"
                                    disabled={isProcessing}
                                  >
                                    Edit
                                  </button>
                                </div>
                              )}
                            </td>
                            <td className="p-3 font-mono text-sl-muted">
                              {new Date(ord.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
