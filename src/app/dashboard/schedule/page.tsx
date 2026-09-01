'use client';

import { useState, useEffect } from 'react';
import { supabase, type EventItem } from '@/lib/supabase';
import { TiltCard } from '@/components/ui/TiltCard';
import { ShuttleButton } from '@/components/ui/ShuttleButton';
import { Calendar, MapPin, Clock, Trophy, Users, CheckCircle2 } from 'lucide-react';
import { audio } from '@/lib/audio';

export default function SchedulePage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [rsvps, setRsvps] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState<'all' | 'training' | 'competition'>('all');

  useEffect(() => {
    async function loadEvents() {
      const { data } = await supabase
        .from('events')
        .select('*')
        .order('start_at', { ascending: true });
      setEvents(data || []);
    }
    loadEvents();
  }, []);

  const handleToggleRsvp = (eventId: string) => {
    audio.play('whistle');
    setRsvps((prev) => ({ ...prev, [eventId]: !prev[eventId] }));
  };

  const filteredEvents = events.filter((ev) => {
    if (filter === 'all') return true;
    return ev.event_type === filter;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-black uppercase text-sl-foreground"
            style={{ fontFamily: 'var(--font-title)' }}
          >
            📅 Games & Weekly Activities
          </h1>
          <p className="text-xs text-sl-muted font-medium mt-1">
            Weekly drill schedules, tactical doubles, and upcoming university tournaments.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 bg-sl-panel p-1 rounded-xl border border-sl-border">
          <button
            onClick={() => {
              audio.play('rally');
              setFilter('all');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === 'all' ? 'bg-sl-green text-white shadow-sm' : 'text-sl-muted hover:text-sl-foreground'
            }`}
          >
            All Events
          </button>
          <button
            onClick={() => {
              audio.play('rally');
              setFilter('training');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === 'training' ? 'bg-sl-green text-white shadow-sm' : 'text-sl-muted hover:text-sl-foreground'
            }`}
          >
            Drills Only
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
            Competitions
          </button>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {filteredEvents.map((ev) => {
          const isGoing = !!rsvps[ev.id];
          const startDate = new Date(ev.start_at);

          return (
            <TiltCard key={ev.id} className="p-6 bg-sl-panel">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                        ev.event_type === 'competition'
                          ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                          : 'bg-sl-green/20 text-sl-green border border-sl-green/30'
                      }`}
                    >
                      {ev.event_type === 'competition' ? '🏆 Tournament' : '🏸 Weekly Drill'}
                    </span>
                    {ev.is_recurring && (
                      <span className="text-[10px] font-mono font-bold text-sl-muted bg-sl-bg px-2 py-0.5 rounded border border-sl-border">
                        Recurring
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-black text-sl-foreground">{ev.title}</h3>
                  <p className="text-xs text-sl-muted leading-relaxed font-medium">{ev.description}</p>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-sl-foreground pt-2">
                    <span className="flex items-center gap-1.5 text-sl-green">
                      <Clock className="w-3.5 h-3.5" />
                      {startDate.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })} •{' '}
                      {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="flex items-center gap-1.5 text-sl-muted">
                      <MapPin className="w-3.5 h-3.5 text-sl-green" /> {ev.location}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-3 w-full md:w-auto">
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
        })}
      </div>
    </div>
  );
}
