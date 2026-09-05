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
 Edit3,
 ChevronDown,
 ChevronUp,
} from 'lucide-react';
import { audio } from '@/lib/audio';

import { useCachedQuery } from '@/lib/client-cache';
import {
  formatTimeRangeWAT,
  formatFullDateTimeRangeWAT,
  createIsoWAT,
  getNextEventOccurrence,
} from '@/lib/date-utils';

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

  // Mobile collapsible state for Official Weekly Routines (collapsed by default on mobile)
  const [isWeeklyMobileOpen, setIsWeeklyMobileOpen] = useState(false);

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

  // RSVP state maps (keyed by `${event_id}_${session_date}`)
  const [userRsvps, setUserRsvps] = useState<Record<string, boolean>>({});
  const [attendeeCounts, setAttendeeCounts] = useState<Record<string, number>>({});
  const [filter, setFilter] = useState<'all' | 'weekly' | 'impromptu' | 'competition'>('all');

  // Load RSVPs from database
  useEffect(() => {
    async function loadRsvps() {
      try {
        const { data: allRsvps } = await supabase
          .from('event_rsvps')
          .select('event_id, session_date, profile_id, status')
          .eq('status', 'going');

        if (allRsvps) {
          const countMap: Record<string, number> = {};
          const userMap: Record<string, boolean> = {};

          allRsvps.forEach((r) => {
            const key = `${r.event_id}_${r.session_date}`;
            countMap[key] = (countMap[key] || 0) + 1;
            if (user?.id && r.profile_id === user.id) {
              userMap[key] = true;
            }
          });

          setAttendeeCounts(countMap);
          setUserRsvps(userMap);
        }
      } catch (err) {
        console.error('Error loading RSVPs:', err);
      }
    }
    loadRsvps();
  }, [user?.id, events]);

 // Map Location Modal State
 const [activeMapModal, setActiveMapModal] = useState<MapModalData | null>(null);
 const [isCopiedGps, setIsCopiedGps] = useState(false);

 // Derive default court event from database records
 const defaultCourtEvent =
 events.find((e) => e.is_recurring && e.latitude!= null && e.longitude!= null) ||
 events.find((e) => e.latitude!= null && e.longitude!= null) ||
 events.find((e) => e.is_recurring);

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
 const [isDetectingGps, setIsDetectingGps] = useState(false);
 const [gpsDetectedSource, setGpsDetectedSource] = useState<'device' | 'database' | null>(null);

 // Auto-sync initial default coordinates from database once events are fetched
 useEffect(() => {
 if (defaultCourtEvent) {
 if (defaultCourtEvent.location) setNewLoc(defaultCourtEvent.location);
 if (defaultCourtEvent.latitude!= null) setNewLat(String(defaultCourtEvent.latitude));
 if (defaultCourtEvent.longitude!= null) setNewLng(String(defaultCourtEvent.longitude));
 if (defaultCourtEvent.map_url) setNewMapUrl(defaultCourtEvent.map_url);
 setGpsDetectedSource('database');
 }
 }, [defaultCourtEvent]);

 const handleOpenCreateModal = () => {
 audio.play('rally');
 if (defaultCourtEvent) {
 if (defaultCourtEvent.location) setNewLoc(defaultCourtEvent.location);
 if (defaultCourtEvent.latitude!= null) setNewLat(String(defaultCourtEvent.latitude));
 if (defaultCourtEvent.longitude!= null) setNewLng(String(defaultCourtEvent.longitude));
 if (defaultCourtEvent.map_url) setNewMapUrl(defaultCourtEvent.map_url);
 setGpsDetectedSource('database');
 }
 setIsModalOpen(true);
 };

 // Live Device Geolocation Detection
 const handleUseCurrentLocation = () => {
 if (typeof window === 'undefined' ||!navigator.geolocation) {
 showAlert({
 title: 'Geolocation Unsupported',
 message: 'Your browser or device does not support GPS geolocation.',
 type: 'warning',
 });
 return;
 }

 setIsDetectingGps(true);
 audio.play('rally');

 navigator.geolocation.getCurrentPosition(
 (pos) => {
 const { latitude, longitude } = pos.coords;
 setNewLat(latitude.toFixed(6));
 setNewLng(longitude.toFixed(6));
 setNewMapUrl(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`);
 setGpsDetectedSource('device');
 setIsDetectingGps(false);
 audio.play('smash');
 showAlert({
 title: 'Current GPS Acquired! ',
 message: `Live coordinates captured: ${latitude.toFixed(6)}° N, ${longitude.toFixed(6)}° E`,
 type: 'success',
 });
 },
 (err) => {
 setIsDetectingGps(false);
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

 // Edit Schedule Modal State
 const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
 const [editTitle, setEditTitle] = useState('');
 const [editDate, setEditDate] = useState('');
 const [editStartTime, setEditStartTime] = useState('');
 const [editEndTime, setEditEndTime] = useState('');
 const [editLoc, setEditLoc] = useState('');
 const [editLat, setEditLat] = useState('');
 const [editLng, setEditLng] = useState('');
 const [editMapUrl, setEditMapUrl] = useState('');
 const [editType, setEditType] = useState<'training' | 'competition' | 'social' | 'meeting' | 'workshop'>('training');
 const [editDesc, setEditDesc] = useState('');
 const [isEditSubmitting, setIsEditSubmitting] = useState(false);
 const [isDetectingEditGps, setIsDetectingEditGps] = useState(false);
 const [editGpsSource, setEditGpsSource] = useState<'device' | 'database' | null>(null);

 const handleOpenEditModal = (ev: EventItem) => {
 audio.play('rally');
 setEditingEvent(ev);
 setEditTitle(ev.title);

 const startD = new Date(ev.start_at);
 setEditDate(startD.toLocaleDateString('en-CA', { timeZone: 'Africa/Lagos' }));
 setEditStartTime(startD.toLocaleTimeString('en-GB', { timeZone: 'Africa/Lagos', hour: '2-digit', minute: '2-digit' }));

 const endD = new Date(ev.end_at);
 setEditEndTime(endD.toLocaleTimeString('en-GB', { timeZone: 'Africa/Lagos', hour: '2-digit', minute: '2-digit' }));

 setEditLoc(ev.location || 'UNN Badminton Court');
 setEditLat(ev.latitude!= null ? String(ev.latitude) : '');
 setEditLng(ev.longitude!= null ? String(ev.longitude) : '');
 setEditMapUrl(ev.map_url || '');
 setEditType(ev.event_type);
 setEditDesc(ev.description || '');
 setEditGpsSource(null);
 };

 const handleUseCurrentLocationEdit = () => {
 if (typeof window === 'undefined' ||!navigator.geolocation) {
 showAlert({
 title: 'Geolocation Unsupported',
 message: 'Your browser or device does not support GPS geolocation.',
 type: 'warning',
 });
 return;
 }

 setIsDetectingEditGps(true);
 audio.play('rally');

 navigator.geolocation.getCurrentPosition(
 (pos) => {
 const { latitude, longitude } = pos.coords;
 setEditLat(latitude.toFixed(6));
 setEditLng(longitude.toFixed(6));
 setEditMapUrl(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`);
 setEditGpsSource('device');
 setIsDetectingEditGps(false);
 audio.play('smash');
 showAlert({
 title: 'Current GPS Acquired! ',
 message: `Live coordinates captured: ${latitude.toFixed(6)}° N, ${longitude.toFixed(6)}° E`,
 type: 'success',
 });
 },
 (err) => {
 setIsDetectingEditGps(false);
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

 const handleSaveEditedEvent = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!editingEvent) return;
 if (!canManageSchedule && editingEvent.created_by!== user?.id) {
 showAlert({
 title: 'Access Denied',
 message: 'Only administrators, logisticians, or the schedule creator can edit this activity.',
 type: 'warning',
 });
 return;
 }
 if (!editTitle.trim() ||!editDate ||!editStartTime) return;

 setIsEditSubmitting(true);
 audio.play('smash');

 try {
 const startDateTime = createIsoWAT(editDate, editStartTime);
 const endDateTime = createIsoWAT(editDate, editEndTime || editStartTime);

 const parsedLat = editLat.trim() ? parseFloat(editLat.trim()) : null;
 const parsedLng = editLng.trim() ? parseFloat(editLng.trim()) : null;
 const parsedMapUrl =
 editMapUrl.trim() ||
 (parsedLat!= null && parsedLng!= null
 ? `https://www.google.com/maps/search/?api=1&query=${parsedLat},${parsedLng}`
 : null);

 const updatedFields = {
 title: editTitle.trim(),
 description: editDesc.trim() || 'Custom badminton session coordinated by the executive committee.',
 event_type: editType,
 location: editLoc.trim() || 'UNN Badminton Court',
 start_at: startDateTime,
 end_at: endDateTime,
 latitude: parsedLat,
 longitude: parsedLng,
 map_url: parsedMapUrl,
 updated_at: new Date().toISOString(),
 };

 const { error } = await supabase
 .from('events')
 .update(updatedFields)
 .eq('id', editingEvent.id);

 if (error) throw error;

 setEvents((prev) =>
 prev.map((ev) =>
 ev.id === editingEvent.id
 ? { ...ev, ...updatedFields }
 : ev
 )
 );

 setEditingEvent(null);
 showAlert({
 title: 'Schedule Updated! ',
 message: `"${editTitle}" has been updated successfully on the court calendar.`,
 type: 'success',
 });
 } catch (err: any) {
 console.error('Update event error:', err);
 showAlert({
 title: 'Update Failed',
 message: err.message || 'Could not update schedule details. Please check your inputs.',
 type: 'error',
 });
 } finally {
 setIsEditSubmitting(false);
 }
 };

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

  const handleToggleRsvp = async (eventItem: EventItem) => {
    if (!user?.id) {
      showAlert({
        title: 'Sign In Required',
        message: 'Please sign in to RSVP for badminton games and receive pre-game notifications.',
        type: 'warning',
      });
      return;
    }

    audio.play('serve');
    const occ = getNextEventOccurrence(eventItem);
    const sessionDate = occ.sessionDate;
    const rsvpKey = `${eventItem.id}_${sessionDate}`;
    const currentlyGoing = Boolean(userRsvps[rsvpKey]);

    // Optimistic UI update
    setUserRsvps((prev) => ({ ...prev, [rsvpKey]: !currentlyGoing }));
    setAttendeeCounts((prev) => ({
      ...prev,
      [rsvpKey]: Math.max(0, (prev[rsvpKey] || 0) + (currentlyGoing ? -1 : 1)),
    }));

    try {
      if (currentlyGoing) {
        // Remove RSVP
        const { error } = await supabase
          .from('event_rsvps')
          .delete()
          .eq('event_id', eventItem.id)
          .eq('profile_id', user.id)
          .eq('session_date', sessionDate);

        if (error) throw error;
        audio.play('netDrop');
        showAlert({
          title: 'RSVP Cancelled',
          message: `Your RSVP for "${eventItem.title}" on ${sessionDate} has been removed.`,
          type: 'info',
        });
      } else {
        // Add RSVP
        const { error } = await supabase.from('event_rsvps').upsert({
          event_id: eventItem.id,
          profile_id: user.id,
          session_date: sessionDate,
          status: 'going',
          created_at: new Date().toISOString(),
        });

        if (error) throw error;
        audio.play('smash');
        showAlert({
          title: 'RSVP Confirmed!',
          message: `You're confirmed for "${eventItem.title}" on ${sessionDate}! You'll receive reminders 1 hour and 30 minutes before start.`,
          type: 'success',
        });
      }
    } catch (err: any) {
      console.error('RSVP toggle error:', err);
      // Revert optimistic update
      setUserRsvps((prev) => ({ ...prev, [rsvpKey]: currentlyGoing }));
      setAttendeeCounts((prev) => ({
        ...prev,
        [rsvpKey]: Math.max(0, (prev[rsvpKey] || 0) + (currentlyGoing ? 1 : -1)),
      }));
      showAlert({
        title: 'RSVP Error',
        message: 'Could not update RSVP status. Please try again.',
        type: 'error',
      });
    }
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
 if (!newTitle.trim() ||!newDate ||!newStartTime) return;

 setIsSubmitting(true);
 audio.play('smash');

 try {
 const startDateTime = createIsoWAT(newDate, newStartTime);
 const endDateTime = createIsoWAT(newDate, newEndTime || newStartTime);

 const parsedLat = newLat.trim() ? parseFloat(newLat.trim()) : null;
 const parsedLng = newLng.trim() ? parseFloat(newLng.trim()) : null;
 const parsedMapUrl =
 newMapUrl.trim() ||
 (parsedLat!= null && parsedLng!= null
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
 title: 'Schedule Published! ',
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
 confirmText: 'Delete Schedule ',
 onConfirm: async () => {
 audio.play('netDrop');
 try {
 await supabase.from('events').delete().eq('id', eventId);
 setEvents((prev) => prev.filter((ev) => ev.id!== eventId));
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

 // 1. Official Core Weekly Routines (Rendered in Section 1)
 const weeklyRoutines = events.filter((e) => e.is_recurring);

 // 2. Compute Next Immediate Occurrence for Each Weekly Routine
 const recurringOccurrences = weeklyRoutines
 .map((routine) => {
 const occ = getNextEventOccurrence(routine);
 return {
 ...routine,
 session_date: occ.sessionDate,
 start_at: occ.startAtIso,
 end_at: occ.endAtIso,
 is_next_routine: true,
 };
 })
 .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());

 // Single earliest next immediate weekly routine
 const nextImmediateWeeklyRoutine = recurringOccurrences[0] || null;

 // 3. Custom / Impromptu / Competition Sessions
 const customEvents = events
 .filter((e) => !e.is_recurring)
 .map((ev) => {
 const occ = getNextEventOccurrence(ev);
 return {
 ...ev,
 session_date: occ.sessionDate,
 start_at: occ.startAtIso,
 end_at: occ.endAtIso,
 is_next_routine: false,
 is_past: occ.isPast,
 };
 })
 .filter((ev) => !ev.is_past);

 // 4. Combined Streamlined Upcoming Activities (1 Next Routine + All Custom/Impromptu)
 const upcomingStreamlinedEvents = [
 ...(nextImmediateWeeklyRoutine ? [nextImmediateWeeklyRoutine] : []),
 ...customEvents,
 ].sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());

 // 5. Filtered Streamlined Events
 const filteredEvents = upcomingStreamlinedEvents.filter((ev) => {
 if (filter === 'all') return true;
 if (filter === 'weekly') return ev.is_recurring;
 if (filter === 'impromptu') return!ev.is_recurring;
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
 return formatTimeRangeWAT(ev.start_at, ev.end_at);
 };

  return (
    <div className="h-full flex flex-col min-h-0 space-y-3 sm:space-y-4">
      {/* Pinned Stationary Section: Header & Official Weekly Badminton Schedule */}
      <div className="shrink-0 space-y-3 sm:space-y-4 pb-3 sm:pb-4 border-b border-sl-border/40">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-4">
          <div>
            <h1
              className="text-lg sm:text-2xl md:text-3xl font-black uppercase text-sl-foreground flex items-center gap-2"
              style={{ fontFamily: 'var(--font-title)' }}
            >
              Weekly Schedule & Court Activities
            </h1>
            <p className="text-[11px] sm:text-xs text-sl-muted font-medium mt-0.5">
              Official training routines, impromptu varsity matches, and collegiate tournament dates.
            </p>
          </div>

          {canManageSchedule && (
            <ShuttleButton
              variant="green"
              onClick={handleOpenCreateModal}
              className="w-full sm:w-auto py-2 sm:py-2.5 px-4 sm:px-5 text-xs font-black flex items-center justify-center gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Impromptu Activity</span>
            </ShuttleButton>
          )}
        </div>

        {/* 1. Official Core Weekly Routines (Collapsible by default on mobile, always open on sm/md+) */}
        <div className="space-y-2 sm:space-y-3">
          <button
            type="button"
            onClick={() => {
              audio.play('rally');
              setIsWeeklyMobileOpen((prev) => !prev);
            }}
            className="w-full flex items-center justify-between p-1.5 sm:p-0 rounded-lg hover:bg-sl-panel/60 sm:hover:bg-transparent transition-colors cursor-pointer text-left"
          >
            <div className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sl-green shrink-0" />
              <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-sl-foreground">
                Official Weekly Badminton Schedule
              </h2>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-[11px] font-bold text-sl-green bg-sl-green/10 px-2 py-0.5 rounded-full border border-sl-green/20">
                {weeklyRoutines.length} Recurring Sessions
              </span>
              {/* Mobile collapse/expand chevron */}
              <div className="sm:hidden text-sl-muted p-0.5">
                {isWeeklyMobileOpen ? (
                  <ChevronUp className="w-4 h-4 text-sl-green" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-sl-muted" />
                )}
              </div>
            </div>
          </button>

          {/* Routine Cards: Collapsed by default on mobile, always visible on tablet/desktop */}
          <div className={`${isWeeklyMobileOpen ? 'block' : 'hidden sm:block'}`}>
            {isLoading ? (
              <div className="flex md:grid md:grid-cols-3 gap-3 overflow-x-auto no-scrollbar pb-1 snap-x">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="min-w-[250px] max-w-[280px] md:min-w-0 md:max-w-none snap-start shrink-0 md:shrink p-3.5 sm:p-4 rounded-xl bg-sl-panel border border-sl-border animate-pulse space-y-2.5"
                  >
                    <div className="h-4 bg-sl-border rounded w-1/3" />
                    <div className="h-4 bg-sl-border rounded w-3/4" />
                    <div className="h-6 bg-sl-border rounded w-full" />
                  </div>
                ))}
              </div>
            ) : weeklyRoutines.length === 0 ? (
              <div className="p-4 bg-sl-panel rounded-xl border border-sl-border text-center text-xs text-sl-muted">
                No recurring weekly routines found in the database.
              </div>
            ) : (
              <div className="flex md:grid md:grid-cols-3 gap-3 overflow-x-auto no-scrollbar pb-1 snap-x">
                {weeklyRoutines.map((routine) => {
                  const dayLabel = formatEventDay(routine);
                  const timeRange = formatEventTimeRange(routine);
                  const isCompetition = routine.event_type === 'competition';

                  return (
                    <TiltCard
                      key={routine.id}
                      className="min-w-[250px] max-w-[280px] sm:max-w-[320px] md:min-w-0 md:max-w-none snap-start shrink-0 md:shrink p-3.5 sm:p-4 bg-sl-panel border border-sl-border relative overflow-hidden space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] sm:text-xs font-black uppercase text-sl-green bg-sl-green/15 px-2 py-0.5 rounded-lg border border-sl-green/30">
                          {dayLabel}
                        </span>
                        <span className="text-[10px] sm:text-[11px] font-black text-sl-foreground font-mono">
                          {timeRange}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-xs sm:text-sm font-black text-sl-foreground truncate">{routine.title}</h3>
                        <p className="text-[11px] sm:text-xs text-sl-muted mt-0.5 leading-snug font-medium line-clamp-2">
                          {routine.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-sl-border/50 flex items-center justify-between text-[10px] sm:text-[11px] text-sl-muted font-bold">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenMap(
                              routine.title,
                              routine.location,
                              routine.latitude,
                              routine.longitude,
                              routine.map_url
                            );
                          }}
                          className="flex items-center gap-1.5 text-sl-foreground hover:text-sl-green transition-colors cursor-pointer group truncate mr-2"
                          title="Click to view court GPS coordinates & directions"
                        >
                          <MapPin className="w-3.5 h-3.5 text-sl-green group-hover:scale-110 transition-transform shrink-0" />
                          <span className="underline decoration-dotted group-hover:text-sl-green truncate max-w-[130px]">
                            {routine.location}
                          </span>
                        </button>
                        <span className="text-sl-green shrink-0">
                          {isCompetition ? 'Tournament' : 'Weekly Routine'}
                        </span>
                      </div>
                    </TiltCard>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stationary Section: Upcoming Activities Header & Filter Controls */}
      <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 pt-1">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-cyan-400 shrink-0" />
          <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-sl-foreground">
            Upcoming Activities & Events ({filteredEvents.length})
          </h2>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-sl-panel p-1 rounded-xl border border-sl-border overflow-x-auto no-scrollbar max-w-full">
          <button
            onClick={() => {
              audio.play('rally');
              setFilter('all');
            }}
            className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
              filter === 'all'
                ? 'bg-sl-green text-white shadow-sm'
                : 'text-sl-muted hover:text-sl-foreground'
            }`}
          >
            All Upcoming ({upcomingStreamlinedEvents.length})
          </button>
          <button
            onClick={() => {
              audio.play('rally');
              setFilter('weekly');
            }}
            className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
              filter === 'weekly'
                ? 'bg-sl-green text-white shadow-sm'
                : 'text-sl-muted hover:text-sl-foreground'
            }`}
          >
            Next Routine
          </button>
          <button
            onClick={() => {
              audio.play('rally');
              setFilter('impromptu');
            }}
            className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              filter === 'impromptu'
                ? 'bg-sl-green text-white shadow-sm'
                : 'text-sl-muted hover:text-sl-foreground'
            }`}
          >
            Impromptu ({customEvents.length})
          </button>
          <button
            onClick={() => {
              audio.play('rally');
              setFilter('competition');
            }}
            className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              filter === 'competition'
                ? 'bg-sl-green text-white shadow-sm'
                : 'text-sl-muted hover:text-sl-foreground'
            }`}
          >
            Tournaments
          </button>
        </div>
      </div>

      {/* Scrollable Section: Events Cards List Only */}
      <div className="flex-1 overflow-y-auto min-h-0 pr-1 pb-6 space-y-3 sm:space-y-4 pt-1">
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
            const sessionDate = ev.session_date || getNextEventOccurrence(ev).sessionDate;
            const rsvpKey = `${ev.id}_${sessionDate}`;
            const isGoing = Boolean(userRsvps[rsvpKey]);
            const attendeeCount = attendeeCounts[rsvpKey] || 0;

            return (
              <TiltCard key={`${ev.id}-${sessionDate}`} className="p-4 sm:p-6 bg-sl-panel border border-sl-border">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
                  <div className="space-y-2 flex-1 w-full min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
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
                          ? 'Tournament'
                          : ev.event_type === 'social'
                          ? 'Club Social'
                          : 'Training Session'}
                      </span>

                      {ev.is_recurring ? (
                        <span className="text-[10px] font-mono font-bold text-sl-green bg-sl-green/10 px-2 py-0.5 rounded border border-sl-green/30">
                          Next Up Routine
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                          Impromptu / Custom
                        </span>
                      )}

                      {/* Confirmed Attendees Counter Badge */}
                      <span className="text-[11px] font-bold text-sl-muted flex items-center gap-1.5 pl-1 sm:pl-2 font-mono">
                        <Users className="w-3.5 h-3.5 text-sl-green" />
                        <span>{attendeeCount} Athlete{attendeeCount === 1 ? '' : 's'} Going</span>
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-black text-sl-foreground break-words">{ev.title}</h3>
                    <p className="text-xs text-sl-muted leading-relaxed font-medium">{ev.description}</p>

                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-semibold text-sl-foreground pt-1 sm:pt-2">
                      <span className="flex items-center gap-1.5 text-sl-green font-mono text-[11px] sm:text-xs">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        {formatFullDateTimeRangeWAT(ev.start_at, ev.end_at)}
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
                        className="flex items-center gap-1.5 text-sl-muted hover:text-sl-green transition-colors cursor-pointer group text-[11px] sm:text-xs"
                        title="Click to view court GPS coordinates & directions"
                      >
                        <MapPin className="w-3.5 h-3.5 text-sl-green group-hover:scale-110 transition-transform shrink-0" />
                        <span className="underline decoration-dotted group-hover:text-sl-green truncate max-w-[180px]">
                          {ev.location || 'UNN Badminton Court'}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2.5 w-full md:w-auto pt-2 md:pt-0">
                    {(canManageSchedule || ev.created_by === user?.id) && !ev.is_recurring && (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(ev)}
                          className="p-2 sm:p-2.5 rounded-xl border border-sl-green/30 text-sl-green hover:bg-sl-green/10 transition-colors cursor-pointer"
                          title="Edit Schedule Details"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteEvent(ev.id, ev.title)}
                          className="p-2 sm:p-2.5 rounded-xl border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Delete Schedule"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {/* Interactive RSVP Action Button */}
                    {isGoing ? (
                      <button
                        type="button"
                        onClick={() => handleToggleRsvp(ev)}
                        className="flex-1 md:flex-initial py-2 sm:py-2.5 px-4 sm:px-5 rounded-xl border border-sl-green/60 bg-sl-green/15 text-sl-green font-black text-xs flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(0,200,83,0.25)] hover:bg-rose-500/15 hover:text-rose-400 hover:border-rose-500/40 transition-all cursor-pointer group"
                        title="Click to cancel your RSVP for this game"
                      >
                        <CheckCircle2 className="w-4 h-4 text-sl-green group-hover:hidden" />
                        <span className="group-hover:hidden">RSVPed (Going)</span>
                        <span className="hidden group-hover:inline">Cancel RSVP</span>
                      </button>
                    ) : (
                      <ShuttleButton
                        variant="green"
                        onClick={() => handleToggleRsvp(ev)}
                        className="flex-1 md:flex-initial py-2 sm:py-2.5 px-4 sm:px-6 text-xs font-black shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>RSVP Going</span>
                      </ShuttleButton>
                    )}
                  </div>
                </div>
              </TiltCard>
            );
          })
        )}
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
 {activeMapModal.latitude!= null && activeMapModal.longitude!= null ? (
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
 (activeMapModal.latitude!= null && activeMapModal.longitude!= null
 ? `https://www.google.com/maps/dir/?api=1&destination=${activeMapModal.latitude},${activeMapModal.longitude}`
 : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeMapModal.location)}`)
 }
 target="_blank"
 rel="noopener noreferrer"
 className="w-full py-3 px-4 rounded-xl bg-sl-green text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg hover:bg-sl-accent transition-all active:scale-95"
 >
 <Navigation className="w-4 h-4 fill-white" />
 <span>Get Directions in Google Maps </span>
 <ExternalLink className="w-3.5 h-3.5 ml-1" />
 </a>

 {activeMapModal.latitude!= null && activeMapModal.longitude!= null && (
 <a
 href={`https://www.openstreetmap.org/?mlat=${activeMapModal.latitude}&mlon=${activeMapModal.longitude}#map=17/${activeMapModal.latitude}/${activeMapModal.longitude}`}
 target="_blank"
 rel="noopener noreferrer"
 className="w-full py-2.5 px-4 rounded-xl bg-sl-panel hover:bg-sl-bg text-sl-foreground border border-sl-border font-bold text-xs flex items-center justify-center gap-2 transition-colors"
 >
 <MapIcon className="w-4 h-4 text-sl-green" />
 <span>View on OpenStreetMap </span>
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
 onClose={() =>!isSubmitting && setIsModalOpen(false)}
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
 <div className="space-y-2">
 <div className="flex items-center justify-between">
 <label className="text-xs font-black uppercase tracking-wider text-sl-foreground flex items-center gap-1.5">
 <MapPin className="w-3.5 h-3.5 text-sl-green" />
 <span>Venue GPS Coordinates</span>
 </label>
 <button
 type="button"
 onClick={handleUseCurrentLocation}
 disabled={isDetectingGps}
 className="px-2.5 py-1 rounded-lg bg-sl-green/15 hover:bg-sl-green text-sl-green hover:text-white border border-sl-green/30 text-[11px] font-bold flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
 >
 {isDetectingGps ? (
 <>
 <Loader2 className="w-3 h-3 animate-spin text-sl-green" />
 <span>Detecting GPS...</span>
 </>
 ) : (
 <>
 <Navigation className="w-3 h-3" />
 <span>Use My Current GPS Position </span>
 </>
 )}
 </button>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <ShuttleInput
 label="Latitude (GPS - Optional)"
 value={newLat}
 onChange={(e) => {
 setNewLat(e.target.value);
 setGpsDetectedSource(null);
 }}
 placeholder="e.g. 6.868800"
 />
 <ShuttleInput
 label="Longitude (GPS - Optional)"
 value={newLng}
 onChange={(e) => {
 setNewLng(e.target.value);
 setGpsDetectedSource(null);
 }}
 placeholder="e.g. 7.407400"
 />
 </div>

 {gpsDetectedSource === 'device' ? (
 <div className="flex items-center justify-between text-[11px] p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
 <span className="font-medium flex items-center gap-1.5">
 <Navigation className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
 Detected from current device GPS position ({newLat}, {newLng})
 </span>
 {defaultCourtEvent?.latitude!= null && (
 <button
 type="button"
 onClick={() => {
 setNewLat(String(defaultCourtEvent.latitude));
 setNewLng(String(defaultCourtEvent.longitude));
 if (defaultCourtEvent.map_url) setNewMapUrl(defaultCourtEvent.map_url);
 setGpsDetectedSource('database');
 audio.play('serve');
 }}
 className="text-[10px] font-bold text-sl-foreground hover:text-sl-green underline underline-offset-2 shrink-0 ml-2 cursor-pointer"
 >
 Reset to DB Default
 </button>
 )}
 </div>
 ) : defaultCourtEvent?.latitude!= null && defaultCourtEvent?.longitude!= null ? (
 <div className="flex items-center justify-between text-[11px] p-2 rounded-lg bg-sl-green/10 border border-sl-green/20">
 <span className="text-sl-green font-medium flex items-center gap-1.5">
 <Sparkles className="w-3.5 h-3.5 text-sl-green shrink-0" />
 Auto-prefilled from database default coordinates ({defaultCourtEvent.latitude.toFixed(4)}, {defaultCourtEvent.longitude.toFixed(4)})
 </span>
 <button
 type="button"
 onClick={() => {
 setNewLoc(defaultCourtEvent.location || 'UNN Badminton Court');
 setNewLat(String(defaultCourtEvent.latitude));
 setNewLng(String(defaultCourtEvent.longitude));
 if (defaultCourtEvent.map_url) setNewMapUrl(defaultCourtEvent.map_url);
 setGpsDetectedSource('database');
 audio.play('serve');
 }}
 className="text-[10px] font-bold text-sl-foreground hover:text-sl-green underline underline-offset-2 shrink-0 ml-2 cursor-pointer"
 >
 Reset to DB GPS
 </button>
 </div>
 ) : (
 <p className="text-[11px] text-sl-muted flex items-center gap-1.5">
 <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
 Default GPS coordinates not yet configured in DB. Click &quot;Use My Current GPS Position&quot; above to capture coordinates live.
 </p>
 )}
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
 {isSubmitting ? 'Publishing...' : 'Publish Schedule '}
 </ShuttleButton>
 </div>
 </form>
 </ShuttleModal>
 )}

 {/* 5. Edit Schedule Modal */}
 {editingEvent && (
 <ShuttleModal
 isOpen={Boolean(editingEvent)}
 onClose={() =>!isEditSubmitting && setEditingEvent(null)}
 title="Edit Custom Badminton Schedule "
 >
 <form onSubmit={handleSaveEditedEvent} className="space-y-4">
 <ShuttleInput
 label="Activity / Match Title"
 value={editTitle}
 onChange={(e) => setEditTitle(e.target.value)}
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
 value={editDate}
 onChange={(e) => setEditDate(e.target.value)}
 className="w-full p-2.5 rounded-xl bg-sl-bg border border-sl-border text-xs font-bold text-sl-foreground focus:border-sl-green outline-none"
 required
 />
 </div>

 <div className="space-y-1">
 <label className="text-xs font-black uppercase tracking-wider text-sl-foreground">
 Start Time (WAT)
 </label>
 <input
 type="time"
 value={editStartTime}
 onChange={(e) => setEditStartTime(e.target.value)}
 className="w-full p-2.5 rounded-xl bg-sl-bg border border-sl-border text-xs font-bold text-sl-foreground focus:border-sl-green outline-none"
 required
 />
 </div>

 <div className="space-y-1">
 <label className="text-xs font-black uppercase tracking-wider text-sl-foreground">
 End Time (WAT)
 </label>
 <input
 type="time"
 value={editEndTime}
 onChange={(e) => setEditEndTime(e.target.value)}
 className="w-full p-2.5 rounded-xl bg-sl-bg border border-sl-border text-xs font-bold text-sl-foreground focus:border-sl-green outline-none"
 required
 />
 </div>
 </div>

 <ShuttleInput
 label="Venue Location Name"
 value={editLoc}
 onChange={(e) => setEditLoc(e.target.value)}
 placeholder="UNN Badminton Court"
 required
 />

 {/* GPS Coordinates Inputs (Optional) */}
 <div className="space-y-2">
 <div className="flex items-center justify-between">
 <label className="text-xs font-black uppercase tracking-wider text-sl-foreground flex items-center gap-1.5">
 <MapPin className="w-3.5 h-3.5 text-sl-green" />
 <span>Venue GPS Coordinates</span>
 </label>
 <button
 type="button"
 onClick={handleUseCurrentLocationEdit}
 disabled={isDetectingEditGps}
 className="px-2.5 py-1 rounded-lg bg-sl-green/15 hover:bg-sl-green text-sl-green hover:text-white border border-sl-green/30 text-[11px] font-bold flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
 >
 {isDetectingEditGps ? (
 <>
 <Loader2 className="w-3 h-3 animate-spin text-sl-green" />
 <span>Detecting GPS...</span>
 </>
 ) : (
 <>
 <Navigation className="w-3 h-3" />
 <span>Use My Current GPS Position </span>
 </>
 )}
 </button>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <ShuttleInput
 label="Latitude (GPS - Optional)"
 value={editLat}
 onChange={(e) => {
 setEditLat(e.target.value);
 setEditGpsSource(null);
 }}
 placeholder="e.g. 6.868800"
 />
 <ShuttleInput
 label="Longitude (GPS - Optional)"
 value={editLng}
 onChange={(e) => {
 setEditLng(e.target.value);
 setEditGpsSource(null);
 }}
 placeholder="e.g. 7.407400"
 />
 </div>

 {editGpsSource === 'device' ? (
 <div className="flex items-center justify-between text-[11px] p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
 <span className="font-medium flex items-center gap-1.5">
 <Navigation className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
 Detected from device live GPS position ({editLat}, {editLng})
 </span>
 {defaultCourtEvent?.latitude!= null && (
 <button
 type="button"
 onClick={() => {
 setEditLat(String(defaultCourtEvent.latitude));
 setEditLng(String(defaultCourtEvent.longitude));
 if (defaultCourtEvent.map_url) setEditMapUrl(defaultCourtEvent.map_url);
 setEditGpsSource('database');
 audio.play('serve');
 }}
 className="text-[10px] font-bold text-sl-foreground hover:text-sl-green underline underline-offset-2 shrink-0 ml-2 cursor-pointer"
 >
 Reset to DB Default
 </button>
 )}
 </div>
 ) : defaultCourtEvent?.latitude!= null && defaultCourtEvent?.longitude!= null ? (
 <div className="flex items-center justify-between text-[11px] p-2 rounded-lg bg-sl-green/10 border border-sl-green/20">
 <span className="text-sl-green font-medium flex items-center gap-1.5">
 <Sparkles className="w-3.5 h-3.5 text-sl-green shrink-0" />
 Default database coordinates ({defaultCourtEvent.latitude.toFixed(4)}, {defaultCourtEvent.longitude.toFixed(4)})
 </span>
 <button
 type="button"
 onClick={() => {
 setEditLoc(defaultCourtEvent.location || 'UNN Badminton Court');
 setEditLat(String(defaultCourtEvent.latitude));
 setEditLng(String(defaultCourtEvent.longitude));
 if (defaultCourtEvent.map_url) setEditMapUrl(defaultCourtEvent.map_url);
 setEditGpsSource('database');
 audio.play('serve');
 }}
 className="text-[10px] font-bold text-sl-foreground hover:text-sl-green underline underline-offset-2 shrink-0 ml-2 cursor-pointer"
 >
 Reset to DB GPS
 </button>
 </div>
 ) : (
 <p className="text-[11px] text-sl-muted flex items-center gap-1.5">
 <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
 Default GPS not set in DB. You can click &quot;Use My Current GPS Position&quot; to auto-fill.
 </p>
 )}
 </div>

 <div className="space-y-1">
 <label className="text-xs font-black uppercase tracking-wider text-sl-foreground">
 Category
 </label>
 <select
 value={editType}
 onChange={(e: any) => setEditType(e.target.value)}
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
 value={editDesc}
 onChange={(e) => setEditDesc(e.target.value)}
 placeholder="Key objectives, sparring partner pairings, gear required..."
 />

 <div className="flex gap-3 pt-2">
 <ShuttleButton
 type="button"
 variant="white"
 onClick={() => setEditingEvent(null)}
 disabled={isEditSubmitting}
 className="flex-1"
 >
 Cancel
 </ShuttleButton>
 <ShuttleButton
 type="submit"
 variant="green"
 disabled={isEditSubmitting}
 className="flex-1 font-black"
 >
 {isEditSubmitting ? 'Saving Changes...' : 'Save Changes '}
 </ShuttleButton>
 </div>
 </form>
 </ShuttleModal>
 )}
 </div>
 );
}
