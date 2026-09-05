'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { useTheme } from '@/components/ThemeProvider';
import { useFeedback } from '@/components/ui/FeedbackModal';
import { ShuttleButton } from '@/components/ui/ShuttleButton';
import { ShuttleInput } from '@/components/ui/ShuttleInput';
import { ShuttleSelect } from '@/components/ui/ShuttleSelect';
import { FACULTIES_AND_DEPARTMENTS, LEVELS } from '@/lib/constants';
import { supabase } from '@/lib/supabase';
import { audio } from '@/lib/audio';
import {
  isNotificationSupported,
  requestNotificationPermission,
} from '@/lib/notifications';
import { usePWAStatus, type SupportedPlatform } from '@/components/pwa/PWAInstallPrompt';
import { triggerSimulatedNotification } from '@/components/notifications/RealtimeNotificationListener';
import { LegalModal } from '@/components/legal/LegalModal';
import {
  User,
  Camera,
  Upload,
  Palette,
  Sun,
  Moon,
  Laptop,
  Volume2,
  VolumeX,
  Smartphone,
  Vibrate,
  Bell,
  BellRing,
  Mail,
  Clock,
  Download,
  Check,
  RefreshCw,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Share,
  PlusSquare,
  Play,
  MoreVertical,
  Monitor,
  FileText,
  Lock,
} from 'lucide-react';

export default function SettingsPage() {
  const { user, refreshProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  const { showAlert } = useFeedback();
  const { isStandalone, canInstall, platform, isIOS, isAndroid, isDesktop, triggerInstall } = usePWAStatus();

  // Athlete Profile State
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [faculty, setFaculty] = useState(user?.faculty || Object.keys(FACULTIES_AND_DEPARTMENTS)[0]);
  const [department, setDepartment] = useState(user?.department || '');
  const [level, setLevel] = useState(user?.level || '100');
  const [phone, setPhone] = useState(user?.phone || '');
  const [regNumber, setRegNumber] = useState(user?.reg_number || '');

  // Avatar customizer
  const [avatarMode, setAvatarMode] = useState<'file' | 'url'>('file');
  const [avatarUrlInput, setAvatarUrlInput] = useState(user?.avatar_url || '');
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar_url || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Notification Preferences State
  const [notifyEmail, setNotifyEmail] = useState(user?.notify_email ?? true);
  const [notifyDevice, setNotifyDevice] = useState(user?.notify_device ?? false);
  const [notify1hBefore, setNotify1hBefore] = useState(user?.notify_1h_before ?? true);
  const [notify30mBefore, setNotify30mBefore] = useState(user?.notify_30m_before ?? true);

  // Audio & Haptics State
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [volume, setVolume] = useState(35); // 0 - 100

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [activeGuideTab, setActiveGuideTab] = useState<SupportedPlatform>(platform);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);

  useEffect(() => {
    setActiveGuideTab(platform);
  }, [platform]);

  // Load state on mount & sync with user
  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setFaculty(user.faculty || Object.keys(FACULTIES_AND_DEPARTMENTS)[0]);
      setDepartment(user.department || '');
      setLevel(user.level || '100');
      setPhone(user.phone || '');
      setRegNumber(user.reg_number || '');
      setNotifyEmail(user.notify_email ?? true);
      setNotifyDevice(user.notify_device ?? false);
      setNotify1hBefore(user.notify_1h_before ?? true);
      setNotify30mBefore(user.notify_30m_before ?? true);
      setAvatarPreview(user.avatar_url || null);
    }
    setSoundEnabled(audio.isEnabled());
    setHapticsEnabled(audio.isHapticsEnabled());
    setVolume(Math.round(audio.getVolume() * 100));
  }, [user]);

  const availableDepts = FACULTIES_AND_DEPARTMENTS[faculty] || [];

  const handleFacultyChange = (newFac: string) => {
    setFaculty(newFac);
    const depts = FACULTIES_AND_DEPARTMENTS[newFac] || [];
    setDepartment(depts[0] || '');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showAlert({
        title: 'Unsupported Image',
        message: 'Please select a valid image file (PNG, JPG, WEBP, GIF).',
        type: 'warning',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showAlert({
        title: 'Image Too Large',
        message: 'Athlete photo must be under 5MB.',
        type: 'warning',
      });
      return;
    }

    setSelectedAvatarFile(file);
    const localPreviewUrl = URL.createObjectURL(file);
    setAvatarPreview(localPreviewUrl);
    audio.play('rally');
  };

  const handleUrlChange = (url: string) => {
    setAvatarUrlInput(url);
    setSelectedAvatarFile(null);
    setAvatarPreview(url.trim() || user?.avatar_url || null);
  };

  // Sound & Haptic Controls
  const handleToggleSound = (enabled: boolean) => {
    setSoundEnabled(enabled);
    audio.setEnabled(enabled);
    audio.haptic('tap');
    if (enabled) audio.play('rally');
  };

  const handleVolumeChange = (newVolPercent: number) => {
    setVolume(newVolPercent);
    audio.setVolume(newVolPercent / 100);
  };

  const handleToggleHaptics = (enabled: boolean) => {
    setHapticsEnabled(enabled);
    audio.setHapticsEnabled(enabled);
    if (enabled) audio.haptic('success');
  };

  const handleTestAudioAndTap = () => {
    audio.haptic('success');
    audio.play('serve');
    showAlert({
      title: 'Sound & Haptic Check',
      message: 'Soft button acoustics and haptic vibration pattern played successfully.',
      type: 'success',
    });
  };

  // Notification Push Toggle
  const handleToggleDevicePush = async () => {
    if (!notifyDevice) {
      if (!isNotificationSupported()) {
        showAlert({
          title: 'Not Supported',
          message: 'Your browser or device does not support Web Notifications.',
          type: 'warning',
        });
        return;
      }
      const perm = await requestNotificationPermission();
      if (perm === 'granted') {
        setNotifyDevice(true);
        audio.play('rally');
        showAlert({
          title: 'On-Device Alerts Enabled',
          message: 'This device will receive real-time match countdown alerts and announcements.',
          type: 'success',
        });
      } else {
        showAlert({
          title: 'Permission Denied',
          message: 'Please allow notification permissions in your browser address bar.',
          type: 'warning',
        });
      }
    } else {
      setNotifyDevice(false);
      audio.play('netDrop');
    }
  };

  const handleTestRealtimeAlert = () => {
    audio.haptic('tap');
    triggerSimulatedNotification({
      title: 'Game Starts in 30 Minutes',
      message: 'Court 1 Indoor Gym • Session starts at 4:00 PM WAT. Racket and shoes ready!',
      type: 'game_reminder',
    });
  };

  // Save All Profile Details and Preferences
  const handleSaveAll = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user?.id) return;

    setIsSaving(true);
    setSaveStatus('Saving changes...');
    audio.play('serve');

    try {
      let finalAvatarUrl = avatarPreview;

      // Cloud storage upload if file chosen
      if (selectedAvatarFile) {
        setSaveStatus('Uploading athlete photo...');
        const fileExt = selectedAvatarFile.name.split('.').pop() || 'jpg';
        const filePath = `avatars/${user.id}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('media-gallery')
          .upload(filePath, selectedAvatarFile, {
            cacheControl: '3600',
            upsert: true,
          });

        if (!uploadError) {
          const { data: publicData } = supabase.storage
            .from('media-gallery')
            .getPublicUrl(filePath);
          if (publicData?.publicUrl) {
            finalAvatarUrl = publicData.publicUrl;
          }
        }
      } else if (avatarMode === 'url' && avatarUrlInput.trim()) {
        finalAvatarUrl = avatarUrlInput.trim();
      }

      setSaveStatus('Saving athlete profile details...');
      const { error: updateErr } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim(),
          avatar_url: finalAvatarUrl,
          faculty,
          department,
          level,
          phone: phone.trim() || null,
          reg_number: regNumber.trim() || null,
          notify_email: notifyEmail,
          notify_device: notifyDevice,
          notify_1h_before: notify1hBefore,
          notify_30m_before: notify30mBefore,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateErr) throw updateErr;

      await refreshProfile();
      audio.haptic('success');
      showAlert({
        title: 'Settings Saved',
        message: 'Your athlete profile, preferences, and notification channels have been updated.',
        type: 'success',
      });
    } catch (err: any) {
      console.error(err);
      audio.haptic('error');
      showAlert({
        title: 'Save Error',
        message: err.message || 'Failed to save settings. Please try again.',
        type: 'error',
      });
    } finally {
      setIsSaving(false);
      setSaveStatus(null);
    }
  };

  // Cache purge & resync
  const handlePurgeCache = async () => {
    audio.haptic('warning');
    try {
      localStorage.removeItem('shuttlelions_cached_profile');
      sessionStorage.clear();
      await refreshProfile();
      showAlert({
        title: 'Cache Resynced',
        message: 'Local session cache cleared and freshly verified against the database.',
        type: 'success',
      });
    } catch (e) {
      console.error('Purge error:', e);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="border-b border-sl-border/40 pb-5">
        <h1
          className="text-2xl sm:text-3xl font-black uppercase text-sl-foreground"
          style={{ fontFamily: 'var(--font-title)' }}
        >
          Universal Settings
        </h1>
        <p className="text-xs sm:text-sm text-sl-muted font-medium mt-1">
          Customize your athlete profile, audio acoustics, notification alerts, display theme, and mobile PWA installation.
        </p>
      </div>

      <form onSubmit={handleSaveAll} className="space-y-8">
        {/* ========================================================================= */}
        {/* SECTION 1: ATHLETE PROFILE & PHOTO                                        */}
        {/* ========================================================================= */}
        <div className="shuttle-panel p-6 sm:p-7 bg-sl-panel space-y-6">
          <div className="flex items-center justify-between border-b border-sl-border/30 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-sl-green/15 text-sl-green flex items-center justify-center font-bold">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-black text-sl-foreground uppercase">
                  Athlete Profile & Photo
                </h3>
                <p className="text-[11px] text-sl-muted">
                  Information displayed on your Digital Lion ID Pass and tournament roster.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-sl-green bg-sl-green/10 border border-sl-green/30 px-2 py-0.5 rounded-full">
              Live Sync
            </span>
          </div>

          {/* Photo Customizer */}
          <div className="p-4 rounded-xl bg-sl-bg border border-sl-border space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase text-sl-foreground flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-sl-green" /> Athlete Portrait Photo
              </label>
              <div className="flex items-center gap-1 bg-sl-panel p-1 rounded-lg border border-sl-border text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => {
                    audio.haptic('tap');
                    setAvatarMode('file');
                  }}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    avatarMode === 'file'
                      ? 'bg-sl-green text-white shadow-sm'
                      : 'text-sl-muted hover:text-sl-foreground'
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => {
                    audio.haptic('tap');
                    setAvatarMode('url');
                  }}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    avatarMode === 'url'
                      ? 'bg-sl-green text-white shadow-sm'
                      : 'text-sl-muted hover:text-sl-foreground'
                  }`}
                >
                  Image Link
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Photo Preview */}
              <div className="relative shrink-0">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt={fullName || 'Athlete Photo'}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-sl-green shadow-md"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-sl-green/20 border-2 border-sl-green text-sl-green font-black text-2xl flex items-center justify-center shadow-md">
                    {fullName?.charAt(0) || 'L'}
                  </div>
                )}
              </div>

              {/* Upload Input */}
              <div className="flex-1 w-full">
                {avatarMode === 'file' ? (
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                      className="hidden"
                    />
                    <div
                      onClick={() => {
                        audio.haptic('tap');
                        fileInputRef.current?.click();
                      }}
                      className="cursor-pointer border-2 border-dashed border-sl-border hover:border-sl-green rounded-xl p-3 text-center transition-all bg-sl-panel hover:bg-sl-green/5 flex items-center justify-center gap-3"
                    >
                      <Upload className="w-4 h-4 text-sl-green shrink-0" />
                      <div className="text-left">
                        <p className="text-xs font-bold text-sl-foreground truncate">
                          {selectedAvatarFile ? selectedAvatarFile.name : 'Choose image from device'}
                        </p>
                        <p className="text-[10px] text-sl-muted">JPG, PNG, WEBP (up to 5MB)</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <ShuttleInput
                    value={avatarUrlInput}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    placeholder="Paste public image link (https://...)"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <ShuttleInput
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Okeke Chukwudi Emmanuel"
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ShuttleSelect
                label="Faculty"
                value={faculty}
                onChange={(e) => handleFacultyChange(e.target.value)}
                options={Object.keys(FACULTIES_AND_DEPARTMENTS).map((fac) => ({
                  value: fac,
                  label: fac,
                }))}
              />

              <ShuttleSelect
                label="Department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                options={availableDepts.map((dept) => ({
                  value: dept,
                  label: dept,
                }))}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <ShuttleSelect
                label="Academic Level"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                options={LEVELS.map((lvl) => ({
                  value: lvl,
                  label: `${lvl} Level`,
                }))}
              />

              <ShuttleInput
                label="Registration Number"
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value)}
                placeholder="e.g. 2021/174932"
              />

              <ShuttleInput
                label="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+234..."
              />
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 2: APPEARANCE & THEME                                             */}
        {/* ========================================================================= */}
        <div className="shuttle-panel p-6 sm:p-7 bg-sl-panel space-y-5">
          <div className="flex items-center gap-2.5 border-b border-sl-border/30 pb-4">
            <div className="w-8 h-8 rounded-xl bg-sl-green/15 text-sl-green flex items-center justify-center font-bold">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-sl-foreground uppercase">
                Display Theme & Contrast
              </h3>
              <p className="text-[11px] text-sl-muted">
                Select your preferred visual style across all club dashboards.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'light', label: 'Light', icon: Sun, desc: 'Clean Court White' },
              { id: 'dark', label: 'Dark', icon: Moon, desc: 'Deep Night Green' },
              { id: 'system', label: 'System', icon: Laptop, desc: 'Device Match' },
            ].map((t) => {
              const Icon = t.icon;
              const isSelected = theme === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    audio.haptic('tap');
                    setTheme(t.id as any);
                    audio.play('rally');
                  }}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center text-center gap-2 relative ${
                    isSelected
                      ? 'border-sl-green bg-sl-green/10 text-sl-foreground shadow-sm'
                      : 'border-sl-border/60 bg-sl-bg text-sl-muted hover:border-sl-border'
                  }`}
                >
                  {isSelected && (
                    <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-sl-green text-white flex items-center justify-center text-[10px]">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  )}
                  <Icon className={`w-5 h-5 ${isSelected ? 'text-sl-green' : 'text-sl-muted'}`} />
                  <div>
                    <span className="text-xs font-black uppercase block">{t.label}</span>
                    <span className="text-[10px] text-sl-muted block mt-0.5">{t.desc}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 3: AUDIO ACOUSTICS & HAPTIC FEEDBACK                             */}
        {/* ========================================================================= */}
        <div className="shuttle-panel p-6 sm:p-7 bg-sl-panel space-y-6">
          <div className="flex items-center justify-between border-b border-sl-border/30 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-sl-green/15 text-sl-green flex items-center justify-center font-bold">
                <Volume2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-black text-sl-foreground uppercase">
                  Audio Acoustics & Haptics
                </h3>
                <p className="text-[11px] text-sl-muted">
                  Subtle synthetic court sound effects and tactile touchscreen vibration.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleTestAudioAndTap}
              className="px-3 py-1.5 rounded-lg border border-sl-border bg-sl-bg hover:bg-sl-green hover:text-white text-sl-foreground text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Play className="w-3 h-3" />
              <span>Test Audio & Tap</span>
            </button>
          </div>

          <div className="space-y-4">
            {/* Audio Toggle & Volume Slider */}
            <div className="p-4 rounded-xl bg-sl-bg border border-sl-border space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {soundEnabled ? (
                    <Volume2 className="w-4 h-4 text-sl-green" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-sl-muted" />
                  )}
                  <div>
                    <span className="text-xs font-black uppercase text-sl-foreground">
                      Button Sound Effects
                    </span>
                    <p className="text-[10px] text-sl-muted">
                      Synthesized smash, rally, and whistle sound alerts
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={soundEnabled}
                    onChange={(e) => handleToggleSound(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-sl-panel peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sl-green border border-sl-border"></div>
                </label>
              </div>

              {soundEnabled && (
                <div className="pt-2 border-t border-sl-border/40 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[11px] font-bold text-sl-muted uppercase">Sound Volume</span>
                    <span className="text-xs font-mono font-bold text-sl-green">{volume}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    value={volume}
                    onChange={(e) => handleVolumeChange(parseInt(e.target.value, 10))}
                    className="w-full accent-sl-green cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* Haptic Vibration Toggle */}
            <div className="p-4 rounded-xl bg-sl-bg border border-sl-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Vibrate className="w-4 h-4 text-sl-green" />
                <div>
                  <span className="text-xs font-black uppercase text-sl-foreground">
                    Haptic Touch Vibration
                  </span>
                  <p className="text-[10px] text-sl-muted">
                    Subtle physical vibration on button taps and event alerts (mobile devices)
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={hapticsEnabled}
                  onChange={(e) => handleToggleHaptics(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-sl-panel peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sl-green border border-sl-border"></div>
              </label>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 4: PRE-GAME RSVP ALERTS & NOTIFICATIONS                           */}
        {/* ========================================================================= */}
        <div className="shuttle-panel p-6 sm:p-7 bg-sl-panel space-y-6">
          <div className="flex items-center justify-between border-b border-sl-border/30 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-sl-green/15 text-sl-green flex items-center justify-center font-bold">
                <BellRing className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-black text-sl-foreground uppercase">
                  Notifications & Pre-Game Reminders
                </h3>
                <p className="text-[11px] text-sl-muted">
                  Control how and when you are notified about your RSVPed badminton sessions.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleTestRealtimeAlert}
              className="px-3 py-1.5 rounded-lg border border-sl-border bg-sl-bg hover:bg-sl-green hover:text-white text-sl-foreground text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Bell className="w-3 h-3" />
              <span>Test Realtime Alert</span>
            </button>
          </div>

          {/* Delivery Channels */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Email Delivery */}
            <div
              onClick={() => {
                setNotifyEmail(!notifyEmail);
                audio.haptic('tap');
                audio.play('rally');
              }}
              className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex items-start gap-3 select-none ${
                notifyEmail
                  ? 'bg-sl-green/10 border-sl-green text-sl-foreground shadow-sm'
                  : 'bg-sl-bg border-sl-border/60 text-sl-muted hover:border-sl-border'
              }`}
            >
              <div
                className={`mt-0.5 w-5 h-5 rounded-lg flex items-center justify-center text-xs font-black shrink-0 transition-colors ${
                  notifyEmail ? 'bg-sl-green text-white' : 'border border-sl-border bg-sl-panel'
                }`}
              >
                {notifyEmail && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-sl-green" />
                  <span className="text-xs font-black uppercase">Email Delivery</span>
                </div>
                <p className="text-[10px] text-sl-muted leading-relaxed">
                  Transactional SMTP dispatch to your student or personal email address.
                </p>
              </div>
            </div>

            {/* On-Device Web Push */}
            <div
              onClick={handleToggleDevicePush}
              className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex items-start gap-3 select-none ${
                notifyDevice
                  ? 'bg-sl-green/10 border-sl-green text-sl-foreground shadow-sm'
                  : 'bg-sl-bg border-sl-border/60 text-sl-muted hover:border-sl-border'
              }`}
            >
              <div
                className={`mt-0.5 w-5 h-5 rounded-lg flex items-center justify-center text-xs font-black shrink-0 transition-colors ${
                  notifyDevice ? 'bg-sl-green text-white' : 'border border-sl-border bg-sl-panel'
                }`}
              >
                {notifyDevice && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-sl-green" />
                  <span className="text-xs font-black uppercase">On-Device Push</span>
                </div>
                <p className="text-[10px] text-sl-muted leading-relaxed">
                  Real-time alerts directly on your phone/browser lockscreen and desktop.
                </p>
              </div>
            </div>
          </div>

          {/* Countdown Timing Checkboxes */}
          <div className="p-4 rounded-xl bg-sl-bg border border-sl-border space-y-3">
            <span className="text-[11px] font-black uppercase tracking-wider text-sl-muted flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-sl-green" /> Automated Countdown Alert Timing
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-center gap-2.5 p-2.5 rounded-lg bg-sl-panel border border-sl-border cursor-pointer text-xs font-bold text-sl-foreground hover:bg-sl-green/5 transition-colors">
                <input
                  type="checkbox"
                  checked={notify1hBefore}
                  onChange={(e) => {
                    audio.haptic('tap');
                    setNotify1hBefore(e.target.checked);
                  }}
                  className="accent-sl-green w-4 h-4 rounded cursor-pointer"
                />
                <span>1 Hour Before Game Starts</span>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 rounded-lg bg-sl-panel border border-sl-border cursor-pointer text-xs font-bold text-sl-foreground hover:bg-sl-green/5 transition-colors">
                <input
                  type="checkbox"
                  checked={notify30mBefore}
                  onChange={(e) => {
                    audio.haptic('tap');
                    setNotify30mBefore(e.target.checked);
                  }}
                  className="accent-sl-green w-4 h-4 rounded cursor-pointer"
                />
                <span>30 Minutes Before Game Starts</span>
              </label>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 5: PROGRESSIVE WEB APP (PWA) INSTALLATION                         */}
        {/* ========================================================================= */}
        <div className="shuttle-panel p-6 sm:p-7 bg-sl-panel space-y-5">
          <div className="flex items-center justify-between border-b border-sl-border/30 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-sl-green/15 text-sl-green flex items-center justify-center font-bold">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-black text-sl-foreground uppercase">
                  Mobile Application & PWA
                </h3>
                <p className="text-[11px] text-sl-muted">
                  Install ShuttleLions as an application on Android, iOS, or macOS/Windows.
                </p>
              </div>
            </div>

            <span
              className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                isStandalone
                  ? 'bg-sl-green/20 text-sl-green border-sl-green/40'
                  : 'bg-zinc-800/40 text-zinc-400 border-zinc-700'
              }`}
            >
              {isStandalone ? 'Installed (Standalone App)' : 'Running in Web Browser'}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-sl-bg border border-sl-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-xs font-black uppercase text-sl-foreground">
                App Installation Status
              </h4>
              <p className="text-[11px] text-sl-muted max-w-md">
                {isStandalone
                  ? 'ShuttleLions is running in full-screen standalone application mode.'
                  : 'Install the web app to your device for instant launch, offline caching, and native notifications.'}
              </p>
            </div>

            {!isStandalone && (
              <button
                type="button"
                onClick={async () => {
                  audio.haptic('tap');
                  if (canInstall) {
                    await triggerInstall();
                  } else {
                    setShowInstallGuide(!showInstallGuide);
                  }
                }}
                className="px-4 py-2 rounded-xl bg-sl-green hover:bg-sl-green-glow hover:text-black text-white text-xs font-black transition-all flex items-center gap-2 shadow-md shrink-0 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{canInstall ? 'Install to Device' : (showInstallGuide ? 'Hide Instructions' : 'Installation Guide')}</span>
              </button>
            )}
          </div>

          {showInstallGuide && !isStandalone && (
            <div className="p-4 rounded-xl bg-sl-bg border border-sl-border space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-sl-border/40 pb-2">
                <h5 className="font-bold text-sl-foreground uppercase text-[11px] flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-sl-green" /> Select Your Operating System:
                </h5>

                <div className="flex items-center gap-1 bg-sl-panel p-1 rounded-lg border border-sl-border text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => {
                      audio.haptic('tap');
                      setActiveGuideTab('android');
                    }}
                    className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                      activeGuideTab === 'android' ? 'bg-sl-green text-white' : 'text-sl-muted hover:text-sl-foreground'
                    }`}
                  >
                    Android
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      audio.haptic('tap');
                      setActiveGuideTab('ios');
                    }}
                    className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                      activeGuideTab === 'ios' ? 'bg-sl-green text-white' : 'text-sl-muted hover:text-sl-foreground'
                    }`}
                  >
                    Apple iOS
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      audio.haptic('tap');
                      setActiveGuideTab('desktop');
                    }}
                    className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                      activeGuideTab === 'desktop' ? 'bg-sl-green text-white' : 'text-sl-muted hover:text-sl-foreground'
                    }`}
                  >
                    Desktop
                  </button>
                </div>
              </div>

              {activeGuideTab === 'android' && (
                <div className="space-y-2 text-sl-muted">
                  <div className="flex items-center gap-2">
                    <MoreVertical className="w-4 h-4 text-sl-green shrink-0" />
                    <span>1. Tap Chrome&apos;s menu icon (three vertical dots in top-right).</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Download className="w-4 h-4 text-sl-green shrink-0" />
                    <span>2. Tap <strong>Install app</strong> or <strong>Add to Home screen</strong>.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-sl-green shrink-0" />
                    <span>3. Confirm the install dialog; the app icon will appear on your device launcher.</span>
                  </div>
                </div>
              )}

              {activeGuideTab === 'ios' && (
                <div className="space-y-2 text-sl-muted">
                  <div className="flex items-center gap-2">
                    <Share className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>1. Tap the <strong>Share</strong> button in the Safari bottom toolbar.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <PlusSquare className="w-4 h-4 text-sl-green shrink-0" />
                    <span>2. Scroll down and select <strong>Add to Home Screen</strong>.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-sl-green shrink-0" />
                    <span>3. Tap <strong>Add</strong> in the top-right corner to complete installation.</span>
                  </div>
                </div>
              )}

              {activeGuideTab === 'desktop' && (
                <div className="space-y-2 text-sl-muted">
                  <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-sl-green shrink-0" />
                    <span>1. Click the <strong>Install</strong> icon in the address bar (next to the bookmark star).</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MoreVertical className="w-4 h-4 text-sl-green shrink-0" />
                    <span>2. Or open the browser menu &rarr; <strong>Save and share</strong> &rarr; <strong>Install ShuttleLions</strong>.</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* SECTION 6: LOCAL SESSION & STORAGE CACHING                                */}
        {/* ========================================================================= */}
        <div className="shuttle-panel p-6 sm:p-7 bg-sl-panel space-y-5">
          <div className="flex items-center justify-between border-b border-sl-border/30 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-sl-green/15 text-sl-green flex items-center justify-center font-bold">
                <RefreshCw className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-black text-sl-foreground uppercase">
                  Session & Storage Cache
                </h3>
                <p className="text-[11px] text-sl-muted">
                  Client-side caching ensures 0ms auth delays on page refresh and offline responsiveness.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePurgeCache}
              className="px-3 py-1.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Purge Cache & Resync</span>
            </button>
          </div>

          <div className="p-3.5 rounded-xl bg-sl-bg border border-sl-border text-xs text-sl-muted leading-relaxed">
            Your athlete profile and preferences are cached locally in secure browser storage. If you ever experience desynchronized data or want a hard refresh from Supabase servers, click &quot;Purge Cache & Resync&quot;.
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 7: CLUB GOVERNANCE & PRIVACY COMPLIANCE                           */}
        {/* ========================================================================= */}
        <div className="shuttle-panel p-6 sm:p-7 bg-sl-panel space-y-5">
          <div className="flex items-center justify-between border-b border-sl-border/30 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-sl-green/15 text-sl-green flex items-center justify-center font-bold">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-black text-sl-foreground uppercase">
                  Club Governance & Privacy
                </h3>
                <p className="text-[11px] text-sl-muted">
                  Official data protection statements and varsity terms of service for UNN athletes.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                audio.haptic('tap');
                setIsLegalModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-lg border border-sl-border bg-sl-bg hover:bg-sl-green hover:text-white text-sl-foreground text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>View Legal Documents</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-sl-bg border border-sl-border space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-sl-foreground uppercase">
                <Lock className="w-3.5 h-3.5 text-sl-green" /> Privacy Guarantee
              </div>
              <p className="text-[11px] text-sl-muted">
                Zero password harvesting. OAuth2 token security via Supabase and student profile confidentiality.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-sl-bg border border-sl-border space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-sl-foreground uppercase">
                <FileText className="w-3.5 h-3.5 text-sl-green" /> Student Club Charter
              </div>
              <p className="text-[11px] text-sl-muted">
                Non-commercial varsity sports society operated for University of Nigeria badminton players.
              </p>
            </div>
          </div>
        </div>

        {/* Save Bar Footer */}
        <div className="sticky bottom-4 z-20 shuttle-panel p-4 bg-sl-panel border-2 border-sl-green flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xl">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sl-green shrink-0" />
            <span className="text-xs text-sl-muted">
              {saveStatus || 'All profile preferences are validated before saving.'}
            </span>
          </div>

          <ShuttleButton
            type="submit"
            variant="green"
            disabled={isSaving}
            className="py-2.5 px-8 text-xs font-black shadow-lg"
          >
            {isSaving ? 'Saving All Settings...' : 'Save All Settings'}
          </ShuttleButton>
        </div>
      </form>

      {/* Privacy Policy & Terms of Service Modal */}
      <LegalModal
        isOpen={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
      />
    </div>
  );
}
