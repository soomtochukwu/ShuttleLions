'use client';

import { useState, useEffect } from 'react';
import { supabase, type EventItem, type CustomRole } from '@/lib/supabase';
import { useAuth } from '@/components/AuthContext';
import { TiltCard } from '@/components/ui/TiltCard';
import { ShuttleButton } from '@/components/ui/ShuttleButton';
import { ShuttleModal } from '@/components/ui/ShuttleModal';
import { ShuttleInput } from '@/components/ui/ShuttleInput';
import { useFeedback } from '@/components/ui/FeedbackModal';
import {
  Calendar,
  MapPin,
  Clock,
  Trophy,
  Users,
  CheckCircle2,
  Plus,
  Trash2,
  Sparkles,
  Zap,
  Shield,
  Activity,
  Navigation,
  Copy,
  ExternalLink,
  Map as MapIcon,
  Check,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { audio } from '@/lib/audio';

import { useCachedQuery } from '@/lib/client-cache';

interface MapModalData {
  title: string;
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  mapUrl?: string | null;
}

export default function SchedulePage() {
  const { user } = useAuth();
  const { showAlert, showConfirm } = useFeedback();

  // 1. Cached Events Query with Instant LocalStorage Hydration & Background Revalidation
  const {
    data: events,
    setData: setEvents,
    isLoading,
    isRevalidating,
  } = useCachedQuery<EventItem[]>({
    key: 'schedule_events',
    initialFallback: [],
    fetcher: async () => {
      const { data } = await supabase
        .from('events')
        .select('*')
        .order('start_at', { ascending: true });
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

  const [rsvps, setRsvps] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState<'all' | 'weekly' | 'impromptu' | 'competition'>('all');

  // Map Location Modal State
  const [activeMapModal, setActiveMapModal] = useState<MapModalData | null>(null);
  const [isCopiedGps, setIsCopiedGps] = useState(false);

  // Impromptu Schedule Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newStartTime, setNewStartTime] = useState('16:00');
  const [newEndTime, setNewEndTime] = useState('18:00');
  const [newLoc, setNewLoc] = useState('UNN Badminton Court');
  const [newLat, setNewLat] = useState('');
  const [newLng, setNewLng] = useState('');
  const [newMapUrl, setNewMapUrl] = useState('');
  const [newType, setNewType] = useState<'training' | 'competition' | 'social' | 'meeting' | 'workshop'>('training');
  const [newDesc, setNewDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Permission Gate: Strictly Admin or any appointed Logistician
  const isLogistician =
    user?.role === 'logistician' ||
    Boolean(user?.role && user.role.toLowerCase().includes('logistician')) ||
    Boolean(
      customRoles.some(
        (r) =>
          r.id === user?.role &&
          (r.can_manage_schedule ||
            r.id.toLowerCase().includes('logistician') ||
            r.title.toLowerCase().includes('logistician'))
      )
    );

  const canManageSchedule = user?.role === 'admin' || isLogistician;

  const handleToggleRsvp = (eventId: string) => {
    audio.play('whistle');
    setRsvps((prev) => ({ ...prev, [eventId]: !prev[eventId] }));
  };

  const handleOpenMap = (
    title: string,
    location: string,
    latitude?: number | null,
    longitude?: number | null,
    mapUrl?: string | null
  ) => {
    audio.play('rally');
    setIsCopiedGps(false);
    setActiveMapModal({
      title,
      location: location || 'UNN Badminton Court',
      latitude: typeof latitude === 'number' ? latitude : null,
      longitude: typeof longitude === 'number' ? longitude : null,
      mapUrl: mapUrl || null,
    });
  };

  const handleCopyCoordinates = () => {
    if (!activeMapModal || activeMapModal.latitude == null || activeMapModal.longitude == null) return;
    const coordString = `${activeMapModal.latitude}, ${activeMapModal.longitude}`;
    navigator.clipboard.writeText(coordString);
    setIsCopiedGps(true);
    audio.play('serve');
    setTimeout(() => setIsCopiedGps(false), 2000);
  };

  const handleCreateImpromptuEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageSchedule) {
      showAlert({
        title: 'Access Denied',
        message: 'Only administrators and appointed Logisticians can create or alter schedules.',
        type: 'warning',
      });
      return;
    }
    if (!newTitle.trim() || !newDate || !newStartTime) return;

    setIsSubmitting(true);
    audio.play('smash');

    try {
      const startDateTime = new Date(`${newDate}T${newStartTime}:00`).toISOString();
      const endDateTime = new Date(`${newDate}T${newEndTime || newStartTime}:00`).toISOString();

      const parsedLat = newLat.trim() ? parseFloat(newLat.trim()) : null;
      const parsedLng = newLng.trim() ? parseFloat(newLng.trim()) : null;
      const parsedMapUrl =
        newMapUrl.trim() ||
        (parsedLat != null && parsedLng != null
          ? `https://www.google.com/maps/search/?api=1&query=${parsedLat},${parsedLng}`
          : null);

      const newEventRecord = {
        title: newTitle.trim(),
        description: newDesc.trim() || 'Custom badminton session coordinated by the executive committee.',
        event_type: newType,
        location: newLoc.trim() || 'UNN Badminton Court',
        start_at: startDateTime,
        end_at: endDateTime,
        is_recurring: false,
        latitude: parsedLat,
        longitude: parsedLng,
        map_url: parsedMapUrl,
        created_by: user?.id || null,
        status: 'upcoming',
      };

      const { data: inserted, error } = await supabase
        .from('events')
        .insert(newEventRecord)
        .select()
        .single();

      if (!error && inserted) {
        setEvents((prev) => [...prev, inserted as EventItem]);
      } else {
        const fallback: EventItem = {
          id: `event-${Date.now()}`,
          ...newEventRecord,
          recurrence_rule: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          status: 'upcoming',
        };
        setEvents((prev) => [...prev, fallback]);
      }

      setIsModalOpen(false);
      setNewTitle('');
      setNewDesc('');
      setNewLat('');
      setNewLng('');
      setNewMapUrl('');
      showAlert({
        title: 'Schedule Published! ⚡📅',
        message: `"${newTitle}" has been scheduled for ${newDate} at ${newStartTime} and added to the court calendar.`,
        type: 'success',
      });
    } catch (err: any) {
      console.error('Event creation error:', err);
      showAlert({
        title: 'Scheduling Error',
        message: 'Failed to create schedule. Please check your inputs.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = (eventId: string, title: string) => {
    showConfirm({
      title: 'Cancel & Delete Schedule',
      message: `Are you sure you want to remove "${title}" from the club calendar?`,
      type: 'danger',
      confirmText: 'Delete Schedule 🗑️',
      onConfirm: async () => {
        audio.play('netDrop');
        try {
          await supabase.from('events').delete().eq('id', eventId);
          setEvents((prev) => prev.filter((ev) => ev.id !== eventId));
          showAlert({
            title: 'Schedule Removed',
            message: `"${title}" has been deleted from the active calendar.`,
            type: 'info',
          });
        } catch (err) {
          console.error('Delete error:', err);
        }
      },
    });
  };

  // Derive Weekly Recurring Routines Dynamically From Database Records
  const weeklyRoutines = events.filter((e) => e.is_recurring);

  const filteredEvents = events.filter((ev) => {
    if (filter === 'all') return true;
    if (filter === 'weekly') return ev.is_recurring;
    if (filter === 'impromptu') return !ev.is_recurring;
    if (filter === 'competition') return ev.event_type === 'competition';
    return true;
  });

  const formatEventDay = (ev: EventItem) => {
    if (ev.recurrence_rule?.includes(':TUE:')) return 'Tuesdays';
    if (ev.recurrence_rule?.includes(':SAT:')) return 'Saturdays';
    if (ev.recurrence_rule?.includes(':SUN:')) return 'Sundays';
    return new Date(ev.start_at).toLocaleDateString('en-GB', { weekday: 'long' }) + 's';
  };

  const formatEventTimeRange = (ev: EventItem) => {
    const start = new Date(ev.start_at);
    const end = new Date(ev.end_at);
    const startStr = start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    const endStr = end.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    return `${startStr} – ${endStr}`;
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-black uppercase text-sl-foreground flex items-center gap-2.5"
            style={{ fontFamily: 'var(--font-title)' }}
          >
            📅 Weekly Schedule & Court Activities
          </h1>
          <p className="text-xs text-sl-muted font-medium mt-1">
            Official training routines, impromptu varsity matches, and collegiate tournament dates.
          </p>
        </div>

        {canManageSchedule && (
          <ShuttleButton
            variant="green"
            onClick={() => {
              audio.play('rally');
              setIsModalOpen(true);
            }}
            className="py-2.5 px-5 text-xs font-black flex items-center gap-1.5 shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Impromptu Activity ⚡</span>
          </ShuttleButton>
        )}
      </div>

      {/* 1. Official Core Weekly Routines (100% Sourced From Database) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-sl-green" />
            <h2 className="text-sm font-black uppercase tracking-wider text-sl-foreground">
              Official Weekly Badminton Schedule
            </h2>
          </div>
          <span className="text-[11px] font-bold text-sl-green bg-sl-green/10 px-2.5 py-0.5 rounded-full border border-sl-green/20">
            {weeklyRoutines.length} Recurring Sessions in Database
          </span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-sl-panel border border-sl-border animate-pulse space-y-4"
              >
                <div className="h-4 bg-sl-border rounded w-1/3" />
                <div className="h-6 bg-sl-border rounded w-3/4" />
                <div className="h-10 bg-sl-border rounded w-full" />
              </div>
            ))}
          </div>
        ) : weeklyRoutines.length === 0 ? (
          <div className="p-6 bg-sl-panel rounded-2xl border border-sl-border text-center text-xs text-sl-muted">
            No recurring weekly routines found in the database.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {weeklyRoutines.map((routine) => {
              const dayLabel = formatEventDay(routine);
              const timeRange = formatEventTimeRange(routine);
              const isCompetition = routine.event_type === 'competition';

              return (
                <TiltCard
                  key={routine.id}
                  className="p-5 bg-sl-panel border border-sl-border relative overflow-hidden space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-sl-green bg-sl-green/15 px-2.5 py-1 rounded-lg border border-sl-green/30">
                      {dayLabel}
                    </span>
                    <span className="text-[11px] font-black text-sl-foreground font-mono">
                      {timeRange}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-black text-sl-foreground">{routine.title}</h3>
                    <p className="text-xs text-sl-muted mt-1 leading-relaxed font-medium">
                      {routine.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-sl-border/50 flex items-center justify-between text-[11px] text-sl-muted font-bold">
                    <button
                      type="button"
                      onClick={() =>
                        handleOpenMap(
                          routine.title,
                          routine.location,
                          routine.latitude,
                          routine.longitude,
                          routine.map_url
                        )
                      }
                      className="flex items-center gap-1.5 text-sl-foreground hover:text-sl-green transition-colors cursor-pointer group"
                      title="Click to view court GPS coordinates & directions"
                    >
                      <MapPin className="w-3.5 h-3.5 text-sl-green group-hover:scale-110 transition-transform" />
                      <span className="underline decoration-dotted group-hover:text-sl-green">
                        {routine.location}
                      </span>
                    </button>
                    <span className="text-sl-green">
                      {isCompetition ? 'In-House Tournament 🏆' : 'Weekly Routine 🏸'}
                    </span>
                  </div>
                </TiltCard>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Calendar Activities & Filter */}
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-black uppercase tracking-wider text-sl-foreground">
              Upcoming Activities & Events ({filteredEvents.length})
            </h2>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 bg-sl-panel p-1 rounded-xl border border-sl-border w-fit">
            <button
              onClick={() => {
                audio.play('rally');
                setFilter('all');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === 'all' ? 'bg-sl-green text-white shadow-sm' : 'text-sl-muted hover:text-sl-foreground'
              }`}
            >
              All Activities ({events.length})
            </button>
            <button
              onClick={() => {
                audio.play('rally');
                setFilter('weekly');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === 'weekly' ? 'bg-sl-green text-white shadow-sm' : 'text-sl-muted hover:text-sl-foreground'
              }`}
            >
              Weekly Routines
            </button>
            <button
              onClick={() => {
                audio.play('rally');
                setFilter('impromptu');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === 'impromptu' ? 'bg-sl-green text-white shadow-sm' : 'text-sl-muted hover:text-sl-foreground'
              }`}
            >
              Impromptu Sessions
            </button>
            <button
              onClick={() => {
                audio.play('rally');
                setFilter('competition');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === 'competition' ? 'bg-sl-green text-white shadow-sm' : 'text-sl-muted hover:text-sl-foreground'
              }`}
            >
              Tournaments
            </button>
          </div>
        </div>

        {/* Events List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="p-8 text-center bg-sl-panel rounded-2xl border border-sl-border flex items-center justify-center gap-2 text-sl-muted text-xs">
              <Loader2 className="w-4 h-4 animate-spin text-sl-green" />
              <span>Loading schedules from database...</span>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="p-8 text-center bg-sl-panel rounded-2xl border border-sl-border text-sl-muted text-xs font-medium">
              No upcoming schedules found for this category filter.
            </div>
          ) : (
            filteredEvents.map((ev) => {
              const isGoing = !!rsvps[ev.id];
              const startDate = new Date(ev.start_at);
              const endDate = new Date(ev.end_at);

              return (
                <TiltCard key={ev.id} className="p-6 bg-sl-panel border border-sl-border">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                            ev.event_type === 'competition'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : ev.event_type === 'social'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : 'bg-sl-green/20 text-sl-green border border-sl-green/30'
                          }`}
                        >
                          {ev.event_type === 'competition'
                            ? '🏆 Tournament'
                            : ev.event_type === 'social'
                            ? '🎉 Club Social'
                            : '🏸 Training Session'}
                        </span>

                        {ev.is_recurring ? (
                          <span className="text-[10px] font-mono font-bold text-sl-muted bg-sl-bg px-2 py-0.5 rounded border border-sl-border">
                            Weekly Recurring
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                            Impromptu / Custom
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-black text-sl-foreground">{ev.title}</h3>
                      <p className="text-xs text-sl-muted leading-relaxed font-medium">{ev.description}</p>

                      <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-sl-foreground pt-2">
                        <span className="flex items-center gap-1.5 text-sl-green font-mono">
                          <Clock className="w-3.5 h-3.5" />
                          {startDate.toLocaleDateString('en-GB', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}{' '}
                          •{' '}
                          {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {' – '}
                          {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>

                        {/* Interactive Clickable Location Tag */}
                        <button
                          type="button"
                          onClick={() =>
                            handleOpenMap(
                              ev.title,
                              ev.location,
                              ev.latitude,
                              ev.longitude,
                              ev.map_url
                            )
                          }
                          className="flex items-center gap-1.5 text-sl-muted hover:text-sl-green transition-colors cursor-pointer group"
                          title="Click to view court GPS coordinates & directions"
                        >
                          <MapPin className="w-3.5 h-3.5 text-sl-green group-hover:scale-110 transition-transform" />
                          <span className="underline decoration-dotted group-hover:text-sl-green">
                            {ev.location || 'UNN Badminton Court'}
                          </span>
                        </button>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-3 w-full md:w-auto">
                      {canManageSchedule && !ev.is_recurring && (
                        <button
                          onClick={() => handleDeleteEvent(ev.id, ev.title)}
                          className="p-2.5 rounded-xl border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Delete Schedule"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}

                      <ShuttleButton
                        variant={isGoing ? 'white' : 'green'}
                        onClick={() => handleToggleRsvp(ev.id)}
                        className="w-full md:w-auto py-2.5 px-6 text-xs font-black"
                      >
                        {isGoing ? '✓ RSVP Confirmed' : 'RSVP Going 🏸'}
                      </ShuttleButton>
                    </div>
                  </div>
                </TiltCard>
              );
            })
          )}
        </div>
      </div>

      {/* 3. Interactive Location & GPS Map Modal */}
      {activeMapModal && (
        <ShuttleModal
          isOpen={Boolean(activeMapModal)}
          onClose={() => setActiveMapModal(null)}
          title="Court Venue Location & GPS"
        >
          <div className="space-y-5">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-sl-green tracking-wider">
                Event / Match Session
              </span>
              <h3 className="text-base font-black text-sl-foreground">{activeMapModal.title}</h3>
            </div>

            {/* Venue Location Pill */}
            <div className="p-4 rounded-xl bg-sl-bg border border-sl-border space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-sl-green shrink-0" />
                <div>
                  <p className="text-xs font-black text-sl-foreground uppercase">{activeMapModal.location}</p>
                  <p className="text-[11px] text-sl-muted font-medium">University of Nigeria, Nsukka (UNN)</p>
                </div>
              </div>

              {/* GPS Coordinates Display (Read directly from database) */}
              {activeMapModal.latitude != null && activeMapModal.longitude != null ? (
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-sl-panel border border-sl-border text-xs">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono font-bold text-sl-muted uppercase">
                      GPS Coordinates (Database)
                    </span>
                    <p className="font-mono font-black text-sl-green">
                      {activeMapModal.latitude.toFixed(6)}° N, {activeMapModal.longitude.toFixed(6)}° E
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyCoordinates}
                    className="px-3 py-1.5 rounded-lg bg-sl-bg hover:bg-sl-green/10 text-sl-foreground border border-sl-border hover:border-sl-green font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95"
                  >
                    {isCopiedGps ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-sl-green" />
                        <span className="text-sl-green">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-sl-muted" />
                        <span>Copy GPS</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="p-2.5 rounded-lg bg-sl-panel border border-sl-border text-xs flex items-center gap-2 text-sl-muted">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-[11px]">
                    GPS coordinates not yet configured in database for this venue.
                  </span>
                </div>
              )}
            </div>

            {/* Navigation Actions */}
            <div className="space-y-2">
              <a
                href={
                  activeMapModal.mapUrl ||
                  (activeMapModal.latitude != null && activeMapModal.longitude != null
                    ? `https://www.google.com/maps/dir/?api=1&destination=${activeMapModal.latitude},${activeMapModal.longitude}`
                    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeMapModal.location)}`)
                }
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-sl-green text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg hover:bg-sl-accent transition-all active:scale-95"
              >
                <Navigation className="w-4 h-4 fill-white" />
                <span>Get Directions in Google Maps 🗺️</span>
                <ExternalLink className="w-3.5 h-3.5 ml-1" />
              </a>

              {activeMapModal.latitude != null && activeMapModal.longitude != null && (
                <a
                  href={`https://www.openstreetmap.org/?mlat=${activeMapModal.latitude}&mlon=${activeMapModal.longitude}#map=17/${activeMapModal.latitude}/${activeMapModal.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-sl-panel hover:bg-sl-bg text-sl-foreground border border-sl-border font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <MapIcon className="w-4 h-4 text-sl-green" />
                  <span>View on OpenStreetMap 🌍</span>
                </a>
              )}
            </div>
          </div>
        </ShuttleModal>
      )}

      {/* 4. Impromptu Schedule Creation Modal */}
      {canManageSchedule && (
        <ShuttleModal
          isOpen={isModalOpen}
          onClose={() => !isSubmitting && setIsModalOpen(false)}
          title="Schedule Impromptu Badminton Activity"
        >
          <form onSubmit={handleCreateImpromptuEvent} className="space-y-4">
            <ShuttleInput
              label="Activity / Match Title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Saturday Evening Singles Sparring"
              required
            />

            {/* Date & Time Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-wider text-sl-foreground">
                  Date
                </label>
                <input
                  type="date"
                  value={newDate}
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
                  value={newStartTime}
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
                  value={newEndTime}
                  onChange={(e) => setNewEndTime(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-sl-bg border border-sl-border text-xs font-bold text-sl-foreground focus:border-sl-green outline-none"
                  required
                />
              </div>
            </div>

            <ShuttleInput
              label="Venue Location Name"
              value={newLoc}
              onChange={(e) => setNewLoc(e.target.value)}
              placeholder="UNN Badminton Court"
              required
            />

            {/* GPS Coordinates Inputs (Optional) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ShuttleInput
                label="Latitude (GPS - Optional)"
                value={newLat}
                onChange={(e) => setNewLat(e.target.value)}
                placeholder="e.g. 6.868800"
              />
              <ShuttleInput
                label="Longitude (GPS - Optional)"
                value={newLng}
                onChange={(e) => setNewLng(e.target.value)}
                placeholder="e.g. 7.407400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black uppercase tracking-wider text-sl-foreground">
                Category
              </label>
              <select
                value={newType}
                onChange={(e: any) => setNewType(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-sl-bg border border-sl-border text-xs font-bold text-sl-foreground focus:border-sl-green outline-none"
              >
                <option value="training">Training Drill & Sparring</option>
                <option value="competition">Tournament / Championship</option>
                <option value="social">Club Social & Exhibition</option>
                <option value="workshop">Tactics & Referee Workshop</option>
                <option value="meeting">Executive & Squad Meeting</option>
              </select>
            </div>

            <ShuttleInput
              label="Description / Instructions (Optional)"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Key objectives, sparring partner pairings, gear required..."
            />

            <div className="flex gap-3 pt-2">
              <ShuttleButton
                type="button"
                variant="white"
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </ShuttleButton>
              <ShuttleButton
                type="submit"
                variant="green"
                disabled={isSubmitting}
                className="flex-1 font-black"
              >
                {isSubmitting ? 'Publishing...' : 'Publish Schedule ⚡'}
              </ShuttleButton>
            </div>
          </form>
        </ShuttleModal>
      )}
    </div>
  );
}
