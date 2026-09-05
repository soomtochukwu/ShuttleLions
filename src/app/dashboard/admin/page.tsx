'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/AuthContext';
import { supabase, type Profile, type Payment, type ShopOrder, type EventItem } from '@/lib/supabase';
import { PARALLAX_ASSETS_CONFIG, useParallaxConfig } from '@/config/parallax-assets';
import { useCachedQuery } from '@/lib/client-cache';
import { TiltCard } from '@/components/ui/TiltCard';
import { ShuttleButton } from '@/components/ui/ShuttleButton';
import { ShuttleInput } from '@/components/ui/ShuttleInput';
import { ShuttleSelect } from '@/components/ui/ShuttleSelect';
import { formatKobo } from '@/lib/constants';
import { createIsoWAT } from '@/lib/date-utils';
import {
  Shield,
  ShieldAlert,
  Users,
  CreditCard,
  Package,
  Calendar,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Sliders,
  Navigation,
  Loader2,
  MapPin,
  Bell,
  Mail,
  Smartphone,
  Send,
  Radio,
  Check,
  Megaphone,
  ArrowLeft,
} from 'lucide-react';
import { audio } from '@/lib/audio';
import { useFeedback } from '@/components/ui/FeedbackModal';

type Tab = 'members' | 'payments' | 'orders' | 'events' | 'broadcast' | 'parallax';

export default function AdminCommandRoom() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading, isAuthenticated } = useAuth();
  const isAdmin = isAuthenticated && user?.role === 'admin';
  const { showAlert } = useFeedback();
  const [activeTab, setActiveTab] = useState<Tab>('members');

  // Automatic security eviction: redirect non-admin accounts to athlete dashboard
  useEffect(() => {
    if (!isAuthLoading && !isAdmin) {
      router.replace('/dashboard');
    }
  }, [isAuthLoading, isAdmin, router]);

  // Parallax live config from database with SWR cache
  const { config: parallaxConfig, setConfig: setParallaxConfig } = useParallaxConfig();

  // Cached Queries for Admin Data - strictly enabled ONLY for verified administrators
  const { data: profiles, setData: setProfiles } = useCachedQuery<Profile[]>({
    key: 'admin_profiles',
    initialFallback: [],
    enabled: isAdmin,
    fetcher: async () => {
      const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      return data || [];
    },
  });

  const { data: customRoles, setData: setCustomRoles } = useCachedQuery<any[]>({
    key: 'admin_custom_roles',
    initialFallback: [],
    enabled: isAdmin,
    fetcher: async () => {
      const { data } = await supabase.from('custom_roles').select('*');
      return data || [];
    },
  });

  const { data: payments } = useCachedQuery<Payment[]>({
    key: 'admin_payments',
    initialFallback: [],
    enabled: isAdmin,
    fetcher: async () => {
      const { data } = await supabase.from('payments').select('*').order('created_at', { ascending: false });
      return data || [];
    },
  });

  const { data: orders } = useCachedQuery<ShopOrder[]>({
    key: 'admin_orders',
    initialFallback: [],
    enabled: isAdmin,
    fetcher: async () => {
      const { data } = await supabase.from('shop_orders').select('*').order('created_at', { ascending: false });
      return data || [];
    },
  });

  const { data: events, setData: setEvents } = useCachedQuery<EventItem[]>({
    key: 'admin_events',
    initialFallback: [],
    enabled: isAdmin,
    fetcher: async () => {
      const { data } = await supabase.from('events').select('*');
      return data || [];
    },
  });

  // Broadcast Alert Form State
  const [broadcastAudience, setBroadcastAudience] = useState<'all' | 'executives' | 'rsvps'>('all');
  const [broadcastSelectedEventId, setBroadcastSelectedEventId] = useState<string>('');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastSendEmail, setBroadcastSendEmail] = useState(true);
  const [broadcastSendDevice, setBroadcastSendDevice] = useState(true);
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  // Parallax Asset Studio live states
  const [courtUrl, setCourtUrl] = useState(PARALLAX_ASSETS_CONFIG.courtEntrance?.src || '');
  const [courtDepth, setCourtDepth] = useState<number>(PARALLAX_ASSETS_CONFIG.courtEntrance?.depthMultiplier || -0.25);
  const [serverUrl, setServerUrl] = useState(PARALLAX_ASSETS_CONFIG.playerServer?.src || '');
  const [serverDepth, setServerDepth] = useState<number>(PARALLAX_ASSETS_CONFIG.playerServer?.depthMultiplier || 0.15);
  const [receiverUrl, setReceiverUrl] = useState(PARALLAX_ASSETS_CONFIG.playerReceiver?.src || '');
  const [receiverDepth, setReceiverDepth] = useState<number>(PARALLAX_ASSETS_CONFIG.playerReceiver?.depthMultiplier || 0.18);
  const [isSavingParallax, setIsSavingParallax] = useState(false);

  // Sync Parallax form when parallaxConfig changes
  useEffect(() => {
    if (parallaxConfig) {
      if (parallaxConfig.courtEntrance) {
        setCourtUrl(parallaxConfig.courtEntrance.src);
        setCourtDepth(parallaxConfig.courtEntrance.depthMultiplier);
      }
      if (parallaxConfig.playerServer) {
        setServerUrl(parallaxConfig.playerServer.src);
        setServerDepth(parallaxConfig.playerServer.depthMultiplier);
      }
      if (parallaxConfig.playerReceiver) {
        setReceiverUrl(parallaxConfig.playerReceiver.src);
        setReceiverDepth(parallaxConfig.playerReceiver.depthMultiplier);
      }
    }
  }, [parallaxConfig]);

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
  const [isDetectingAdminGps, setIsDetectingAdminGps] = useState(false);
  const [adminGpsSource, setAdminGpsSource] = useState<'device' | 'database' | null>(null);

  // Sync default coordinates if events change
  useEffect(() => {
    const defaultCourt = (events || []).find((e: EventItem) => e.latitude != null && e.longitude != null);
    if (defaultCourt && !newEvLat && !newEvLng) {
      if (defaultCourt.latitude != null) setNewEvLat(String(defaultCourt.latitude));
      if (defaultCourt.longitude != null) setNewEvLng(String(defaultCourt.longitude));
    }
  }, [events, newEvLat, newEvLng]);

  const handleRoleChange = async (profId: string, role: string) => {
    if (!isAdmin) {
      showAlert({
        title: 'Unauthorized Action',
        message: 'Only users with the admin role can modify athlete permissions.',
        type: 'error',
      });
      return;
    }
    audio.play('serve');
    await supabase.from('profiles').update({ role }).eq('id', profId);
    setProfiles((prev) => prev.map((p) => (p.id === profId ? { ...p, role } : p)));
    showAlert({
      title: 'Role Updated',
      message: `Member role has been successfully changed to "${role}".`,
      type: 'success',
    });
  };

  const handleUseCurrentLocationAdmin = () => {
    if (!isAdmin) return;
    if (typeof window === 'undefined' || !navigator.geolocation) {
      showAlert({
        title: 'Geolocation Unsupported',
        message: 'Your browser or device does not support GPS geolocation.',
        type: 'warning',
      });
      return;
    }

    setIsDetectingAdminGps(true);
    audio.play('rally');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setNewEvLat(latitude.toFixed(6));
        setNewEvLng(longitude.toFixed(6));
        setAdminGpsSource('device');
        setIsDetectingAdminGps(false);
        audio.play('smash');
        showAlert({
          title: 'Current GPS Acquired',
          message: `Live coordinates captured: ${latitude.toFixed(6)}° N, ${longitude.toFixed(6)}° E`,
          type: 'success',
        });
      },
      (err) => {
        setIsDetectingAdminGps(false);
        let errorMsg = 'Could not retrieve your physical location.';
        if (err.code === 1) {
          errorMsg = 'Location permission was denied. Please allow location access in your browser.';
        } else if (err.code === 2) {
          errorMsg = 'Position unavailable. Please check your device GPS sensor.';
        } else if (err.code === 3) {
          errorMsg = 'GPS detection request timed out. Please try again.';
        }
        showAlert({
          title: 'GPS Detection Failed',
          message: errorMsg,
          type: 'error',
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      showAlert({
        title: 'Unauthorized Action',
        message: 'Only users with the admin role can schedule events.',
        type: 'error',
      });
      return;
    }
    if (!newEvTitle.trim() || !user?.id) return;
    audio.play('whistle');

    const startDateTime = createIsoWAT(newEvDate, newEvStartTime);
    const endDateTime = createIsoWAT(newEvDate, newEvEndTime);

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
        title: 'Event Scheduled',
        message: `"${newEvRecord.title}" has been published to the ShuttleLions calendar for ${newEvDate} at ${newEvStartTime}.`,
        type: 'success',
      });
    } catch (err) {
      console.error('Error creating event:', err);
    }
  };

  const handleSaveParallaxStudio = async () => {
    if (!isAdmin) {
      showAlert({
        title: 'Unauthorized Action',
        message: 'Only users with the admin role can update parallax assets.',
        type: 'error',
      });
      return;
    }
    audio.play('smash');
    setIsSavingParallax(true);

    try {
      const updates = [
        {
          id: 'courtEntrance',
          name: 'Badminton Court Arena Entrance',
          asset_url: courtUrl.trim(),
          depth_multiplier: Number(courtDepth),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'playerServer',
          name: 'Serving Badminton Athlete',
          asset_url: serverUrl.trim(),
          depth_multiplier: Number(serverDepth),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'playerReceiver',
          name: 'Receiving Badminton Athlete',
          asset_url: receiverUrl.trim(),
          depth_multiplier: Number(receiverDepth),
          updated_at: new Date().toISOString(),
        },
      ];

      // 1. Dispatch via Server API to bypass client auth signal aborts
      let saveSuccessful = false;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const res = await fetch('/api/admin/site-assets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
          },
          body: JSON.stringify({
            updates,
            auth_user_id: user?.auth_user_id || user?.id,
          }),
        });

        if (res.ok) {
          saveSuccessful = true;
        } else {
          const errData = await res.json().catch(() => ({}));
          console.warn('Server site-assets API returned error, attempting direct client fallback:', errData);
        }
      } catch (fetchErr) {
        console.warn('Network error calling site-assets API, attempting direct client fallback:', fetchErr);
      }

      // 2. Client fallback if server route was unreachable
      if (!saveSuccessful) {
        const { error: clientErr } = await supabase.from('site_assets').upsert(updates);
        if (clientErr) throw clientErr;
      }

      // 3. Update local state and cached configuration
      setParallaxConfig((prev) => ({
        ...prev,
        courtEntrance: {
          ...prev.courtEntrance,
          src: courtUrl.trim(),
          depthMultiplier: Number(courtDepth),
        },
        playerServer: {
          ...prev.playerServer,
          src: serverUrl.trim(),
          depthMultiplier: Number(serverDepth),
        },
        playerReceiver: {
          ...prev.playerReceiver,
          src: receiverUrl.trim(),
          depthMultiplier: Number(receiverDepth),
        },
      }));

      showAlert({
        title: 'Parallax Settings Saved to Database',
        message: 'Visual depth calibrations and kinetic assets updated live in the cloud and cached for the landing experience.',
        type: 'success',
      });
    } catch (err: any) {
      console.error('Save parallax error:', err);
      showAlert({
        title: 'Save Failed',
        message: err.message || 'Could not save parallax assets to database.',
        type: 'error',
      });
    } finally {
      setIsSavingParallax(false);
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      showAlert({
        title: 'Unauthorized Action',
        message: 'Only users with the admin role can dispatch broadcasts.',
        type: 'error',
      });
      return;
    }
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) {
      showAlert({
        title: 'Missing Fields',
        message: 'Please enter both an alert title and broadcast message body.',
        type: 'warning',
      });
      return;
    }

    if (!broadcastSendEmail && !broadcastSendDevice) {
      showAlert({
        title: 'Select Delivery Channel',
        message: 'Please select at least one delivery channel (Email or On-Device Push).',
        type: 'warning',
      });
      return;
    }

    setIsBroadcasting(true);
    audio.play('serve');

    try {
      let recipientIds: string[] | undefined = undefined;
      let eventDetails: any = undefined;

      if (broadcastAudience === 'executives') {
        recipientIds = profiles
          .filter(
            (p) =>
              ['admin', 'captain', 'media_personnel', 'treasurer'].includes(p.role) ||
              customRoles.some((r) => r.id === p.role)
          )
          .map((p) => p.id);
      } else if (broadcastAudience === 'rsvps') {
        if (!broadcastSelectedEventId) {
          showAlert({
            title: 'Select Session',
            message: 'Please choose which scheduled session or game to target RSVPed athletes for.',
            type: 'warning',
          });
          setIsBroadcasting(false);
          return;
        }

        const selectedEv = events.find((ev) => ev.id === broadcastSelectedEventId);
        if (selectedEv) {
          eventDetails = {
            title: selectedEv.title,
            location: selectedEv.location,
            start_at: selectedEv.start_at,
            end_at: selectedEv.end_at,
            map_url: selectedEv.map_url,
          };
        }

        const { data: rsvpsData } = await supabase
          .from('event_rsvps')
          .select('profile_id')
          .eq('event_id', broadcastSelectedEventId)
          .eq('status', 'going');

        recipientIds = (rsvpsData || []).map((r) => r.profile_id);

        if (recipientIds.length === 0) {
          showAlert({
            title: 'No RSVP Attendees',
            message: 'There are currently 0 athletes RSVPed for this session.',
            type: 'warning',
          });
          setIsBroadcasting(false);
          return;
        }
      }

      const channels: ('email' | 'device' | 'in_app')[] = ['in_app'];
      if (broadcastSendEmail) channels.push('email');
      if (broadcastSendDevice) channels.push('device');

      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({
          recipient_ids: recipientIds,
          title: broadcastTitle.trim(),
          message: broadcastMessage.trim(),
          type: 'admin_broadcast',
          channels,
          event_details: eventDetails,
          sender_id: user?.auth_user_id || user?.id,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to dispatch broadcast');
      }

      audio.play('smash');
      setBroadcastTitle('');
      setBroadcastMessage('');
      showAlert({
        title: 'Broadcast Dispatched Successfully',
        message: `Notification transmitted to ${data.delivered_count} athletes (${data.email_dispatched} emails queued, ${data.device_dispatched} device alerts).`,
        type: 'success',
      });
    } catch (err: any) {
      console.error('Broadcast error:', err);
      showAlert({
        title: 'Broadcast Failed',
        message: err.message || 'An error occurred while transmitting notifications.',
        type: 'error',
      });
    } finally {
      setIsBroadcasting(false);
    }
  };

  // 1. Loading Authentication State Gate
  if (isAuthLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-sl-foreground space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-sl-green flex items-center justify-center shadow-[0_0_20px_rgba(0,200,83,0.5)] animate-bounce" />
        <p className="text-xs font-black uppercase text-sl-green tracking-widest font-mono">
          Verifying Administrative Clearance...
        </p>
      </div>
    );
  }

  // 2. Strict Access Control Gate: Non-admin users cannot open, visit, or interact
  if (!isAdmin) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="shuttle-panel p-8 bg-sl-panel max-w-md w-full text-center space-y-5 border border-rose-500/40 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert className="w-8 h-8 text-rose-500" />
          </div>
          <div className="space-y-2">
            <h2
              className="text-lg font-black uppercase text-sl-foreground tracking-wider"
              style={{ fontFamily: 'var(--font-title)' }}
            >
              Access Restricted
            </h2>
            <p className="text-xs text-sl-muted leading-relaxed">
              The Admin Command Room requires verified Administrator role permissions. Your account (<span className="text-sl-foreground font-mono">{user?.email || 'Guest'}</span>) with role <span className="text-sl-warning font-black uppercase font-mono">{user?.role || 'None'}</span> is not authorized to access or interact with administrative operations.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 w-full py-3 bg-sl-green text-white text-xs font-black rounded-xl uppercase tracking-wider hover:brightness-110 shadow-lg cursor-pointer transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Athlete Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

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
            Admin Command Room
          </h1>
          <p className="text-xs text-sl-muted font-medium">
            Full platform administration: student roster, financial ledger, gear orders, alerts broadcast, and parallax studio.
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
          { key: 'broadcast', label: 'Broadcast Alerts', icon: <Bell className="w-4 h-4 text-sl-green" /> },
          { key: 'parallax', label: 'Parallax Studio', icon: <ImageIcon className="w-4 h-4 text-sl-green" /> },
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
 <option value="captain"> Team Captain</option>
 <option value="media_personnel"> Media Personnel</option>
 <option value="treasurer"> Club Treasurer</option>
 <option value="admin"> Executive Admin</option>
 {customRoles
 .filter(
 (r) =>
!['member', 'captain', 'media_personnel', 'treasurer', 'admin'].includes(r.id)
 )
 .map((r) => (
 <option key={r.id} value={r.id}>
 {r.title}
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

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-sl-foreground flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-sl-green" /> GPS Court Coordinates (Optional)
                </label>
                <button
                  type="button"
                  onClick={handleUseCurrentLocationAdmin}
                  disabled={isDetectingAdminGps}
                  className="text-[10px] font-black uppercase tracking-wider text-sl-green hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {isDetectingAdminGps ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" /> Detecting...
                    </>
                  ) : (
                    <>
                      <Navigation className="w-3 h-3" /> Use My Current GPS Position
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <ShuttleInput
                  label="Latitude"
                  value={newEvLat}
                  onChange={(e) => {
                    setNewEvLat(e.target.value);
                    setAdminGpsSource(null);
                  }}
                  placeholder="e.g. 6.8654"
                />
                <ShuttleInput
                  label="Longitude"
                  value={newEvLng}
                  onChange={(e) => {
                    setNewEvLng(e.target.value);
                    setAdminGpsSource(null);
                  }}
                  placeholder="e.g. 7.4101"
                />
              </div>

              {adminGpsSource === 'device' ? (
                <div className="flex items-center justify-between text-[11px] p-2 rounded-lg bg-sl-green/10 border border-sl-green/20">
                  <span className="text-sl-green font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sl-green shrink-0" />
                    Live device GPS captured ({parseFloat(newEvLat || '0').toFixed(4)}, {parseFloat(newEvLng || '0').toFixed(4)})
                  </span>
                  {(() => {
                    const defaultCourt = events.find((e) => e.latitude != null && e.longitude != null);
                    if (defaultCourt?.latitude != null) {
                      return (
                        <button
                          type="button"
                          onClick={() => {
                            setNewEvLat(String(defaultCourt.latitude));
                            setNewEvLng(String(defaultCourt.longitude));
                            setAdminGpsSource('database');
                            audio.play('serve');
                          }}
                          className="text-[10px] font-bold text-sl-foreground hover:text-sl-green underline underline-offset-2 shrink-0 ml-2 cursor-pointer"
                        >
                          Reset to DB Default
                        </button>
                      );
                    }
                    return null;
                  })()}
                </div>
              ) : (() => {
                const defaultCourt = events.find((e) => e.latitude != null && e.longitude != null);
                if (defaultCourt?.latitude != null && defaultCourt?.longitude != null) {
                  return (
                    <div className="flex items-center justify-between text-[11px] p-2 rounded-lg bg-sl-green/10 border border-sl-green/20">
                      <span className="text-sl-green font-medium flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-sl-green shrink-0" />
                        Auto-prefilled from database ({defaultCourt.latitude.toFixed(4)}, {defaultCourt.longitude.toFixed(4)})
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setNewEvLoc(defaultCourt.location || 'UNN Badminton Court');
                          setNewEvLat(String(defaultCourt.latitude));
                          setNewEvLng(String(defaultCourt.longitude));
                          setAdminGpsSource('database');
                          audio.play('serve');
                        }}
                        className="text-[10px] font-bold text-sl-foreground hover:text-sl-green underline underline-offset-2 shrink-0 ml-2 cursor-pointer"
                      >
                        Reset to DB GPS
                      </button>
                    </div>
                  );
                }
                return (
                  <p className="text-[11px] text-sl-muted flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    Default GPS not configured in DB. Click &quot;Use My Current GPS Position&quot; to capture live coordinates.
                  </p>
                );
              })()}
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
              Publish Event to Schedule
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

      {/* Tab: Broadcast Alerts */}
      {activeTab === 'broadcast' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <form onSubmit={handleSendBroadcast} className="lg:col-span-7 shuttle-panel p-6 sm:p-8 bg-sl-panel space-y-6">
            <div className="flex items-center gap-2 border-b border-sl-border/40 pb-4">
              <Megaphone className="w-5 h-5 text-sl-green" />
              <div>
                <h3 className="text-base font-black text-sl-foreground uppercase">
                  Dispatch Broadcast Notification
                </h3>
                <p className="text-xs text-sl-muted font-medium">
                  Broadcast announcements and instant updates via Email and On-Device Web Push.
                </p>
              </div>
            </div>

            {/* 1. Target Audience */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-sl-foreground flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-sl-green" /> Target Audience
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { id: 'all', label: 'All Athletes', desc: `All ${profiles.length} registered members` },
                  { id: 'rsvps', label: 'Game RSVP Attendees', desc: 'Athletes RSVPed for a specific session' },
                  { id: 'executives', label: 'Club Executives', desc: 'Captains, Admins & Treasurers' },
                ].map((aud) => (
                  <div
                    key={aud.id}
                    onClick={() => {
                      setBroadcastAudience(aud.id as any);
                      audio.play('rally');
                    }}
                    className={`cursor-pointer p-3 rounded-xl border text-xs transition-all select-none ${
                      broadcastAudience === aud.id
                        ? 'bg-sl-green/10 border-sl-green text-sl-foreground font-bold shadow-sm'
                        : 'bg-sl-bg border-sl-border/60 text-sl-muted hover:border-sl-border'
                    }`}
                  >
                    <p className="font-black text-xs text-sl-foreground">{aud.label}</p>
                    <p className="text-[10px] text-sl-muted mt-0.5 leading-tight">{aud.desc}</p>
                  </div>
                ))}
              </div>

              {/* Session Selector if audience is 'rsvps' */}
              {broadcastAudience === 'rsvps' && (
                <div className="pt-2">
                  <ShuttleSelect
                    label="Select Scheduled Session"
                    value={broadcastSelectedEventId}
                    onChange={(e) => setBroadcastSelectedEventId(e.target.value)}
                    options={[
                      { value: '', label: '-- Select Event / Game Routine --' },
                      ...events.map((ev) => ({
                        value: ev.id,
                        label: `${ev.title} (${new Date(ev.start_at).toLocaleDateString()} ${new Date(ev.start_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
                      })),
                    ]}
                  />
                </div>
              )}
            </div>

            {/* 2. Delivery Channels */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-sl-foreground flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-sl-green" /> Delivery Channels
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => {
                    setBroadcastSendEmail(!broadcastSendEmail);
                    audio.play('rally');
                  }}
                  className={`cursor-pointer p-3 rounded-xl border transition-all flex items-center gap-3 select-none ${
                    broadcastSendEmail
                      ? 'bg-sl-green/10 border-sl-green text-sl-foreground'
                      : 'bg-sl-bg border-sl-border/60 text-sl-muted'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                      broadcastSendEmail ? 'bg-sl-green text-white shadow-sm' : 'border border-sl-border bg-sl-panel'
                    }`}
                  >
                    {broadcastSendEmail && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 font-black text-xs">
                      <Mail className="w-3.5 h-3.5 text-sl-green" /> Email Dispatch
                    </div>
                    <p className="text-[10px] text-sl-muted">Direct to athlete inbox</p>
                  </div>
                </div>

                <div
                  onClick={() => {
                    setBroadcastSendDevice(!broadcastSendDevice);
                    audio.play('rally');
                  }}
                  className={`cursor-pointer p-3 rounded-xl border transition-all flex items-center gap-3 select-none ${
                    broadcastSendDevice
                      ? 'bg-sl-green/10 border-sl-green text-sl-foreground'
                      : 'bg-sl-bg border-sl-border/60 text-sl-muted'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                      broadcastSendDevice ? 'bg-sl-green text-white shadow-sm' : 'border border-sl-border bg-sl-panel'
                    }`}
                  >
                    {broadcastSendDevice && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 font-black text-xs">
                      <Smartphone className="w-3.5 h-3.5 text-sl-green" /> On-Device Web Push
                    </div>
                    <p className="text-[10px] text-sl-muted">Banner to device screen</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Title & Content */}
            <div className="space-y-4">
              <ShuttleInput
                label="Alert Title / Headline"
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                placeholder="e.g. Schedule Update: Practice Starts at 3:30 PM Today"
                required
              />

              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-wider text-sl-foreground">
                  Broadcast Message Content
                </label>
                <textarea
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="Write clear instructions, court changes, equipment reminders, or weather updates..."
                  rows={4}
                  className="w-full p-3 rounded-xl bg-sl-bg border border-sl-border text-xs text-sl-foreground focus:border-sl-green outline-none resize-none font-medium leading-relaxed"
                  required
                />
              </div>
            </div>

            <ShuttleButton
              type="submit"
              variant="green"
              disabled={isBroadcasting}
              className="w-full py-3.5 text-xs font-black uppercase tracking-wider shadow-md flex items-center justify-center gap-2"
            >
              {isBroadcasting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Dispatching Broadcast...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Dispatch Broadcast Notification
                </>
              )}
            </ShuttleButton>
          </form>

          {/* Broadcast Preview & Guidelines Card */}
          <div className="lg:col-span-5 space-y-4">
            <div className="shuttle-panel p-6 bg-sl-panel space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-sl-foreground flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-sl-green" /> Notification Transmission Info
              </h4>
              <div className="space-y-3 text-xs text-sl-muted">
                <div className="p-3 rounded-xl bg-sl-bg border border-sl-border space-y-1">
                  <span className="font-black text-sl-foreground uppercase text-[10px]">Respect Athlete Preferences</span>
                  <p className="text-[11px] leading-relaxed">
                    Athletes control their notification delivery channels in their profile. Unsubscribed channels are automatically skipped.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-sl-bg border border-sl-border space-y-1">
                  <span className="font-black text-sl-foreground uppercase text-[10px]">Automated RSVP Reminders</span>
                  <p className="text-[11px] leading-relaxed">
                    You do not need to manually broadcast routine 1-hour and 30-minute game reminders. The background scheduler automatically dispatches them to athletes who clicked &quot;Going&quot;.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-sl-bg border border-sl-border space-y-1">
                  <span className="font-black text-sl-foreground uppercase text-[10px]">In-App Feed History</span>
                  <p className="text-[11px] leading-relaxed">
                    All broadcast alerts are also permanently recorded in the athlete&apos;s in-app notification feed.
                  </p>
                </div>
              </div>
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
              type="button"
              variant="green"
              disabled={isSavingParallax}
              onClick={handleSaveParallaxStudio}
              className="py-3 px-8 text-xs font-black shadow-lg flex items-center gap-2"
            >
              {isSavingParallax ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving to Database...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Save & Apply to Live Landing Page</span>
                </>
              )}
            </ShuttleButton>
          </div>
 </div>
 )}
 </div>
 );
}
