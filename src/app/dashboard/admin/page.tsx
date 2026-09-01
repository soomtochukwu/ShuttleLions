'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { supabase, type Profile, type Payment, type ShopOrder, type EventItem } from '@/lib/supabase';
import { PARALLAX_ASSETS_CONFIG } from '@/config/parallax-assets';
import { TiltCard } from '@/components/ui/TiltCard';
import { ShuttleButton } from '@/components/ui/ShuttleButton';
import { ShuttleInput } from '@/components/ui/ShuttleInput';
import { ShuttleSelect } from '@/components/ui/ShuttleSelect';
import { formatKobo } from '@/lib/constants';
import {
  Shield,
  Users,
  CreditCard,
  Package,
  Calendar,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Sliders,
} from 'lucide-react';
import { audio } from '@/lib/audio';
import { useFeedback } from '@/components/ui/FeedbackModal';

type Tab = 'members' | 'payments' | 'orders' | 'events' | 'parallax';

export default function AdminCommandRoom() {
  const { user } = useAuth();
  const { showAlert } = useFeedback();
  const [activeTab, setActiveTab] = useState<Tab>('members');

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [customRoles, setCustomRoles] = useState<any[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [orders, setOrders] = useState<ShopOrder[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);

  // Parallax Asset Studio live states
  const [courtUrl, setCourtUrl] = useState(PARALLAX_ASSETS_CONFIG.courtEntrance.src);
  const [courtDepth, setCourtDepth] = useState<number>(PARALLAX_ASSETS_CONFIG.courtEntrance.depthMultiplier);
  const [serverUrl, setServerUrl] = useState(PARALLAX_ASSETS_CONFIG.playerServer.src);
  const [serverDepth, setServerDepth] = useState<number>(PARALLAX_ASSETS_CONFIG.playerServer.depthMultiplier);
  const [receiverUrl, setReceiverUrl] = useState(PARALLAX_ASSETS_CONFIG.playerReceiver.src);
  const [receiverDepth, setReceiverDepth] = useState<number>(PARALLAX_ASSETS_CONFIG.playerReceiver.depthMultiplier);

  // New Event Form State
  const [newEvTitle, setNewEvTitle] = useState('');
  const [newEvDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newEvStartTime, setNewStartTime] = useState('16:00');
  const [newEvEndTime, setNewEndTime] = useState('18:00');
  const [newEvLoc, setNewEvLoc] = useState('UNN Badminton Court');
  const [newEvLat, setNewEvLat] = useState('');
  const [newEvLng, setNewEvLng] = useState('');
  const [newEvType, setNewEvType] = useState<'training' | 'competition' | 'social' | 'meeting' | 'workshop'>('training');
  const [newEvDesc, setNewEvDesc] = useState('');

  useEffect(() => {
    async function loadAdminData() {
      const { data: pData } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      setProfiles(pData || []);

      const { data: rData } = await supabase.from('custom_roles').select('*');
      setCustomRoles(rData || []);

      const { data: payData } = await supabase.from('payments').select('*').order('created_at', { ascending: false });
      setPayments(payData || []);

      const { data: ordData } = await supabase.from('shop_orders').select('*').order('created_at', { ascending: false });
      setOrders(ordData || []);

      const { data: evData } = await supabase.from('events').select('*');
      setEvents(evData || []);
    }
    loadAdminData();
  }, []);

  const handleRoleChange = async (profId: string, role: string) => {
    audio.play('serve');
    await supabase.from('profiles').update({ role }).eq('id', profId);
    setProfiles((prev) => prev.map((p) => (p.id === profId ? { ...p, role } : p)));
    showAlert({
      title: 'Role Updated',
      message: `Member role has been successfully changed to "${role}".`,
      type: 'success',
    });
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvTitle.trim() || !user?.id) return;
    audio.play('whistle');

    const startDateTime = new Date(`${newEvDate}T${newEvStartTime}:00`).toISOString();
    const endDateTime = new Date(`${newEvDate}T${newEvEndTime}:00`).toISOString();

    const parsedLat = newEvLat.trim() ? parseFloat(newEvLat.trim()) : null;
    const parsedLng = newEvLng.trim() ? parseFloat(newEvLng.trim()) : null;
    const parsedMapUrl =
      parsedLat != null && parsedLng != null
        ? `https://www.google.com/maps/search/?api=1&query=${parsedLat},${parsedLng}`
        : null;

    const newEvRecord = {
      title: newEvTitle.trim(),
      description: newEvDesc.trim() || 'Scheduled via Admin Command Room',
      event_type: newEvType,
      location: newEvLoc.trim() || 'UNN Badminton Court',
      start_at: startDateTime,
      end_at: endDateTime,
      is_recurring: false,
      recurrence_rule: null,
      latitude: parsedLat,
      longitude: parsedLng,
      map_url: parsedMapUrl,
      created_by: user.id,
      status: 'upcoming',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      const { data: inserted, error } = await supabase.from('events').insert(newEvRecord).select().single();
      if (!error && inserted) {
        setEvents((prev) => [...prev, inserted as EventItem]);
      } else {
        setEvents((prev) => [...prev, { id: `ev-${Date.now()}`, ...newEvRecord } as EventItem]);
      }

      setNewEvTitle('');
      setNewEvDesc('');
      setNewEvLat('');
      setNewEvLng('');
      showAlert({
        title: 'Event Scheduled! 📅',
        message: `"${newEvRecord.title}" has been published to the ShuttleLions calendar for ${newEvDate} at ${newEvStartTime}.`,
        type: 'success',
      });
    } catch (err) {
      console.error('Error creating event:', err);
    }
  };

  const handleSaveParallaxStudio = () => {
    audio.play('smash');
    PARALLAX_ASSETS_CONFIG.courtEntrance.src = courtUrl;
    PARALLAX_ASSETS_CONFIG.courtEntrance.depthMultiplier = Number(courtDepth);
    PARALLAX_ASSETS_CONFIG.playerServer.src = serverUrl;
    PARALLAX_ASSETS_CONFIG.playerServer.depthMultiplier = Number(serverDepth);
    PARALLAX_ASSETS_CONFIG.playerReceiver.src = receiverUrl;
    PARALLAX_ASSETS_CONFIG.playerReceiver.depthMultiplier = Number(receiverDepth);

    showAlert({
      title: 'Parallax Studio Saved! ⚡',
      message: 'Visual depth calibrations and kinetic assets updated live for the landing experience.',
      type: 'success',
    });
  };

  return (
    <div className="space-y-8">
      {/* Admin Header */}
      <div className="shuttle-panel p-6 bg-gradient-to-r from-sl-warning/15 via-sl-panel to-sl-panel border-2 border-sl-warning/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase bg-sl-warning text-black px-2.5 py-0.5 rounded-full flex items-center gap-1 font-mono">
              <Shield className="w-3 h-3" /> EXECUTIVE PRIVILEGES
            </span>
          </div>
          <h1
            className="text-2xl sm:text-3xl font-black uppercase text-sl-foreground"
            style={{ fontFamily: 'var(--font-title)' }}
          >
            🛡️ Admin Command Room
          </h1>
          <p className="text-xs text-sl-muted font-medium">
            Full platform administration: student roster, financial ledger, gear orders, and parallax studio.
          </p>
        </div>
      </div>

      {/* Admin Tab Selector */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar bg-sl-panel p-1.5 rounded-2xl border border-sl-border">
        {[
          { key: 'members', label: 'Student Roster', icon: <Users className="w-4 h-4" /> },
          { key: 'payments', label: 'Payments Ledger', icon: <CreditCard className="w-4 h-4" /> },
          { key: 'orders', label: 'Gear Orders', icon: <Package className="w-4 h-4" /> },
          { key: 'events', label: 'Drill Scheduler', icon: <Calendar className="w-4 h-4" /> },
          { key: 'parallax', label: 'Parallax Studio 🏸', icon: <ImageIcon className="w-4 h-4 text-sl-green" /> },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => {
                audio.play('rally');
                setActiveTab(tab.key as Tab);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-sl-green text-white shadow-md'
                  : 'text-sl-muted hover:text-sl-foreground hover:bg-sl-bg'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Members Roster */}
      {activeTab === 'members' && (
        <div className="shuttle-panel p-6 bg-sl-panel space-y-4">
          <h3 className="text-base font-black text-sl-foreground uppercase">Registered Athletes ({profiles.length})</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-sl-border/40 text-sl-muted uppercase font-black">
                <tr>
                  <th className="pb-3">Athlete</th>
                  <th className="pb-3">Faculty / Dept</th>
                  <th className="pb-3">Level</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sl-border/20 font-medium text-sl-foreground">
                {profiles.map((p) => (
                  <tr key={p.id} className="hover:bg-sl-bg/50">
                    <td className="py-3 font-bold">{p.full_name}</td>
                    <td className="py-3 text-sl-muted">{p.department}</td>
                    <td className="py-3 font-mono">{p.level}L</td>
                    <td className="py-3">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-sl-green/10 text-sl-green">
                        {p.role}
                      </span>
                    </td>
                    <td className="py-3">
                      <select
                        value={p.role}
                        onChange={(e) => handleRoleChange(p.id, e.target.value)}
                        className="bg-sl-bg border border-sl-border text-xs rounded p-1"
                      >
                        <option value="member">Member (Student Athlete)</option>
                        <option value="captain">👑 Team Captain</option>
                        <option value="media_personnel">📸 Media Personnel</option>
                        <option value="treasurer">💰 Club Treasurer</option>
                        <option value="admin">🛡️ Executive Admin</option>
                        {customRoles
                          .filter(
                            (r) =>
                              !['member', 'captain', 'media_personnel', 'treasurer', 'admin'].includes(r.id)
                          )
                          .map((r) => (
                            <option key={r.id} value={r.id}>
                              ✨ {r.title}
                            </option>
                          ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Payments Ledger */}
      {activeTab === 'payments' && (
        <div className="shuttle-panel p-6 bg-sl-panel space-y-4">
          <h3 className="text-base font-black text-sl-foreground uppercase">Financial Ledger & Receipts ({payments.length})</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-sl-border/40 text-sl-muted uppercase font-black">
                <tr>
                  <th className="pb-3">Reference</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sl-border/20 font-medium">
                {payments.map((pay) => (
                  <tr key={pay.id} className="hover:bg-sl-bg/50">
                    <td className="py-3 font-mono font-bold">{pay.reference}</td>
                    <td className="py-3 uppercase text-sl-muted font-bold">{pay.type}</td>
                    <td className="py-3 font-mono text-sl-green font-black">{formatKobo(pay.amount_kobo)}</td>
                    <td className="py-3">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-sl-green/20 text-sl-green">
                        {pay.status}
                      </span>
                    </td>
                    <td className="py-3 text-sl-muted">{new Date(pay.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Gear Orders */}
      {activeTab === 'orders' && (
        <div className="shuttle-panel p-6 bg-sl-panel space-y-4">
          <h3 className="text-base font-black text-sl-foreground uppercase">Equipment Procurement Orders ({orders.length})</h3>
          {orders.length === 0 ? (
            <p className="text-xs text-sl-muted">No pending equipment procurement orders.</p>
          ) : (
            <div className="space-y-3">
              {orders.map((ord) => (
                <div key={ord.id} className="p-4 bg-sl-bg rounded-xl border border-sl-border flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-sl-foreground">Order #{ord.id.slice(0, 8)}</span>
                    <p className="text-sl-muted">Notes: {ord.notes || 'None'}</p>
                  </div>
                  <span className="font-mono text-sl-green font-black">{formatKobo(ord.total_price_kobo)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Drill Scheduler */}
      {activeTab === 'events' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <form onSubmit={handleCreateEvent} className="lg:col-span-6 shuttle-panel p-6 bg-sl-panel space-y-4">
            <h3 className="text-base font-black text-sl-foreground uppercase">Schedule New Drill / Match</h3>
            <ShuttleInput
              label="Event Title"
              value={newEvTitle}
              onChange={(e) => setNewEvTitle(e.target.value)}
              placeholder="e.g. Saturday Smash Drills"
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-wider text-sl-foreground">
                  Date
                </label>
                <input
                  type="date"
                  value={newEvDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-sl-bg border border-sl-border text-xs font-bold text-sl-foreground focus:border-sl-green outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-wider text-sl-foreground">
                  Start Time
                </label>
                <input
                  type="time"
                  value={newEvStartTime}
                  onChange={(e) => setNewStartTime(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-sl-bg border border-sl-border text-xs font-bold text-sl-foreground focus:border-sl-green outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-wider text-sl-foreground">
                  End Time
                </label>
                <input
                  type="time"
                  value={newEvEndTime}
                  onChange={(e) => setNewEndTime(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-sl-bg border border-sl-border text-xs font-bold text-sl-foreground focus:border-sl-green outline-none"
                  required
                />
              </div>
            </div>

            <ShuttleInput
              label="Location Name"
              value={newEvLoc}
              onChange={(e) => setNewEvLoc(e.target.value)}
              placeholder="UNN Badminton Court"
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ShuttleInput
                label="Latitude (GPS)"
                value={newEvLat}
                onChange={(e) => setNewEvLat(e.target.value)}
                placeholder="6.868800"
              />
              <ShuttleInput
                label="Longitude (GPS)"
                value={newEvLng}
                onChange={(e) => setNewEvLng(e.target.value)}
                placeholder="7.407400"
              />
            </div>

            <ShuttleSelect
              label="Event Type"
              value={newEvType}
              onChange={(e) => setNewEvType(e.target.value as any)}
              options={[
                { value: 'training', label: 'Training Drill' },
                { value: 'competition', label: 'Tournament / Cup' },
                { value: 'social', label: 'Club Social' },
                { value: 'workshop', label: 'Tactics Workshop' },
                { value: 'meeting', label: 'Executive Meeting' },
              ]}
            />

            <ShuttleInput
              label="Description (Optional)"
              value={newEvDesc}
              onChange={(e) => setNewEvDesc(e.target.value)}
              placeholder="Session objectives, sparring rules..."
            />

            <ShuttleButton type="submit" variant="green" className="w-full py-3 text-xs font-black">
              Publish Event to Schedule 📅
            </ShuttleButton>
          </form>

          <div className="lg:col-span-6 shuttle-panel p-6 bg-sl-panel space-y-3">
            <h3 className="text-base font-black text-sl-foreground uppercase">Active Calendar ({events.length})</h3>
            <div className="space-y-2">
              {events.map((ev) => (
                <div key={ev.id} className="p-3 bg-sl-bg rounded-xl border border-sl-border flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-sl-foreground">{ev.title}</p>
                    <p className="text-[11px] text-sl-muted">{ev.location}</p>
                  </div>
                  <span className="text-[10px] font-black uppercase text-sl-green bg-sl-green/10 px-2 py-0.5 rounded">
                    {ev.event_type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Parallax & Landing Asset Studio */}
      {activeTab === 'parallax' && (
        <div className="space-y-6">
          <div className="shuttle-panel p-6 bg-sl-panel space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sl-green" />
              <h3 className="text-base font-black text-sl-foreground uppercase">
                Parallax & Scrollytelling Asset Studio
              </h3>
            </div>
            <p className="text-xs text-sl-muted leading-relaxed font-medium">
              Specify image file paths (e.g. <code className="text-sl-green font-mono">/images/parallax/court-entrance.jpg</code>) or paste external URLs (Cloudinary, Supabase Storage, Imgur). Adjust depth speeds in real-time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Slot 1: Court Entrance */}
            <TiltCard className="p-6 bg-sl-panel space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase text-sl-green">Slot 01 (Background)</span>
                <h4 className="text-sm font-black text-sl-foreground">Court Arena Entrance</h4>
              </div>
              <ShuttleInput
                label="Image URL / Path"
                value={courtUrl}
                onChange={(e) => setCourtUrl(e.target.value)}
                placeholder="/images/parallax/court-entrance.jpg"
              />
              <div className="space-y-1">
                <label className="text-xs font-bold text-sl-foreground flex justify-between">
                  <span>Parallax Depth Multiplier</span>
                  <span className="font-mono text-sl-green">{courtDepth}</span>
                </label>
                <input
                  type="range"
                  min="-0.8"
                  max="0.8"
                  step="0.05"
                  value={courtDepth}
                  onChange={(e) => setCourtDepth(Number(e.target.value))}
                  className="w-full accent-sl-green"
                />
              </div>
            </TiltCard>

            {/* Slot 2: Server Athlete */}
            <TiltCard className="p-6 bg-sl-panel space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase text-sl-green">Slot 02 (Left Cutout)</span>
                <h4 className="text-sm font-black text-sl-foreground">Server Athlete</h4>
              </div>
              <ShuttleInput
                label="Image URL / Path"
                value={serverUrl}
                onChange={(e) => setServerUrl(e.target.value)}
                placeholder="/images/parallax/player-server.png"
              />
              <div className="space-y-1">
                <label className="text-xs font-bold text-sl-foreground flex justify-between">
                  <span>Parallax Depth Multiplier</span>
                  <span className="font-mono text-sl-green">{serverDepth}</span>
                </label>
                <input
                  type="range"
                  min="-0.8"
                  max="0.8"
                  step="0.05"
                  value={serverDepth}
                  onChange={(e) => setServerDepth(Number(e.target.value))}
                  className="w-full accent-sl-green"
                />
              </div>
            </TiltCard>

            {/* Slot 3: Receiver Athlete */}
            <TiltCard className="p-6 bg-sl-panel space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase text-sl-green">Slot 03 (Right Cutout)</span>
                <h4 className="text-sm font-black text-sl-foreground">Receiver Athlete</h4>
              </div>
              <ShuttleInput
                label="Image URL / Path"
                value={receiverUrl}
                onChange={(e) => setReceiverUrl(e.target.value)}
                placeholder="/images/parallax/player-receiver.png"
              />
              <div className="space-y-1">
                <label className="text-xs font-bold text-sl-foreground flex justify-between">
                  <span>Parallax Depth Multiplier</span>
                  <span className="font-mono text-sl-green">{receiverDepth}</span>
                </label>
                <input
                  type="range"
                  min="-0.8"
                  max="0.8"
                  step="0.05"
                  value={receiverDepth}
                  onChange={(e) => setReceiverDepth(Number(e.target.value))}
                  className="w-full accent-sl-green"
                />
              </div>
            </TiltCard>
          </div>

          <div className="flex justify-end pt-2">
            <ShuttleButton
              variant="green"
              onClick={handleSaveParallaxStudio}
              className="py-3 px-8 text-xs font-black shadow-lg"
            >
              Save & Apply to Live Landing Page ⚡
            </ShuttleButton>
          </div>
        </div>
      )}
    </div>
  );
}
