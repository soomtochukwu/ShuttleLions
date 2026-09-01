'use client';

import { useState, useEffect } from 'react';
import { supabase, type EventItem, type CustomRole } from '@/lib/supabase';
import { useAuth } from '@/components/AuthContext';
import { TiltCard } from '@/components/ui/TiltCard';
import { ShuttleButton } from '@/components/ui/ShuttleButton';
import { ShuttleModal } from '@/components/ui/ShuttleModal';
import { ShuttleInput } from '@/components/ui/ShuttleInput';
import { ShuttleSelect } from '@/components/ui/ShuttleSelect';
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
} from 'lucide-react';
import { audio } from '@/lib/audio';

const CORE_WEEKLY_ROUTINES = [
  {
    day: 'Tuesdays',
    time: '4:00 PM – 6:00 PM',
    title: 'Varsity Training & Footwork Conditioning',
    location: 'UNN Indoor Sports Hall (Courts 1–3)',
    category: 'Training Drill',
    description: 'High-intensity tactical footwork, multi-shuttle smash-and-net drills, and singles matchplay conditioning.',
    badge: 'Weekly Drill 🏸',
    color: 'emerald',
  },
  {
    day: 'Saturdays',
    time: '7:00 AM – 10:00 AM',
    title: 'In-House Tournament & Doubles Championship',
    location: 'UNN Indoor Sports Hall',
    category: 'In-House Tournament',
    description: 'Weekly club tournament brackets, competitive singles & doubles points league, and varsity match sparring.',
    badge: 'In-House Tournament 🏆',
    color: 'amber',
  },
  {
    day: 'Sundays',
    time: '4:00 PM – 6:30 PM',
    title: 'Afternoon Open Rallies & Club Matchplay',
    location: 'UNN Main Gymnasium',
    category: 'Club Matchplay',
    description: 'Casual and competitive open club matchplay, tactical doubles rotations, and umpire practice.',
    badge: 'Open Matchplay 🏆',
    color: 'amber',
  },
];

export default function SchedulePage() {
  const { user } = useAuth();
  const { showAlert, showConfirm } = useFeedback();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [customRoles, setCustomRoles] = useState<CustomRole[]>([]);
  const [rsvps, setRsvps] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState<'all' | 'weekly' | 'impromptu' | 'competition'>('all');

  // Impromptu Schedule Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newStartTime, setNewStartTime] = useState('16:00');
  const [newEndTime, setNewEndTime] = useState('18:00');
  const [newLoc, setNewLoc] = useState('UNN Indoor Sports Hall');
  const [newType, setNewType] = useState<'training' | 'competition' | 'social' | 'meeting' | 'workshop'>('training');
  const [newDesc, setNewDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      const { data: evData } = await supabase
        .from('events')
        .select('*')
        .order('start_at', { ascending: true });
      setEvents(evData || []);

      const { data: rData } = await supabase.from('custom_roles').select('*');
      setCustomRoles(rData || []);
    }
    loadData();
  }, []);

  // Permission Gate: Admin, Captain, Logistician, or any custom role with can_manage_schedule / executive appointment
  const userCustomRole = customRoles.find((r) => r.id === user?.role);
  const canManageSchedule =
    user?.role === 'admin' ||
    user?.role === 'captain' ||
    Boolean(userCustomRole?.can_manage_schedule) ||
    (Boolean(user?.role) && user?.role !== 'member');

  const handleToggleRsvp = (eventId: string) => {
    audio.play('whistle');
    setRsvps((prev) => {
      const next = { ...prev, [eventId]: !prev[eventId] };
      return next;
    });
  };

  const handleCreateImpromptuEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageSchedule) {
      showAlert({
        title: 'Access Denied',
        message: 'Only club executives and appointed coordinators can publish custom schedules.',
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

      const newEventRecord = {
        title: newTitle.trim(),
        description: newDesc.trim() || 'Custom badminton session coordinated by the executive committee.',
        event_type: newType,
        location: newLoc.trim() || 'UNN Indoor Sports Hall',
        start_at: startDateTime,
        end_at: endDateTime,
        is_recurring: false,
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

  const filteredEvents = events.filter((ev) => {
    if (filter === 'all') return true;
    if (filter === 'weekly') return ev.is_recurring;
    if (filter === 'impromptu') return !ev.is_recurring;
    if (filter === 'competition') return ev.event_type === 'competition';
    return true;
  });

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

      {/* 1. Official Core Weekly Routines */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-sl-green" />
            <h2 className="text-sm font-black uppercase tracking-wider text-sl-foreground">
              Official Weekly Training Sessions
            </h2>
          </div>
          <span className="text-[11px] font-bold text-sl-green bg-sl-green/10 px-2.5 py-0.5 rounded-full border border-sl-green/20">
            3 Fixed Sessions / Week
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {CORE_WEEKLY_ROUTINES.map((routine) => (
            <TiltCard
              key={routine.day}
              className="p-5 bg-sl-panel border border-sl-border relative overflow-hidden space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-sl-green bg-sl-green/15 px-2.5 py-1 rounded-lg border border-sl-green/30">
                  {routine.day}
                </span>
                <span className="text-[11px] font-black text-sl-foreground font-mono">
                  {routine.time}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-black text-sl-foreground">{routine.title}</h3>
                <p className="text-xs text-sl-muted mt-1 leading-relaxed font-medium">
                  {routine.description}
                </p>
              </div>

              <div className="pt-2 border-t border-sl-border/50 flex items-center justify-between text-[11px] text-sl-muted font-bold">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-sl-green" /> {routine.location}
                </span>
                <span className="text-sl-green">{routine.badge}</span>
              </div>
            </TiltCard>
          ))}
        </div>
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
          {filteredEvents.length === 0 ? (
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
                        <span className="flex items-center gap-1.5 text-sl-muted">
                          <MapPin className="w-3.5 h-3.5 text-sl-green" /> {ev.location}
                        </span>
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

      {/* Impromptu Schedule Creation Modal */}
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
              label="Location"
              value={newLoc}
              onChange={(e) => setNewLoc(e.target.value)}
              placeholder="UNN Indoor Sports Hall (Courts 1–3)"
              required
            />

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
