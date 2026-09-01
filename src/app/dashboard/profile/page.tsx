'use client';

import { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { TiltCard } from '@/components/ui/TiltCard';
import { ShuttleButton } from '@/components/ui/ShuttleButton';
import { ShuttleInput } from '@/components/ui/ShuttleInput';
import { ShuttleSelect } from '@/components/ui/ShuttleSelect';
import { FACULTIES_AND_DEPARTMENTS, LEVELS } from '@/lib/constants';
import { supabase } from '@/lib/supabase';
import { audio } from '@/lib/audio';
import { ShieldCheck, User, QrCode, Sparkles, CheckCircle2 } from 'lucide-react';

export default function ProfilePage() {
  const { user, refreshProfile } = useAuth();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [faculty, setFaculty] = useState(user?.faculty || Object.keys(FACULTIES_AND_DEPARTMENTS)[0]);
  const [department, setDepartment] = useState(user?.department || '');
  const [level, setLevel] = useState(user?.level || '100');
  const [phone, setPhone] = useState(user?.phone || '');
  const [regNumber, setRegNumber] = useState(user?.reg_number || '');
  const [isSaving, setIsSaving] = useState(false);

  const availableDepts = FACULTIES_AND_DEPARTMENTS[faculty] || [];

  const handleFacultyChange = (newFac: string) => {
    setFaculty(newFac);
    const depts = FACULTIES_AND_DEPARTMENTS[newFac] || [];
    setDepartment(depts[0] || '');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    setIsSaving(true);
    audio.play('serve');

    try {
      await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim(),
          faculty,
          department,
          level,
          phone: phone.trim() || null,
          reg_number: regNumber.trim() || null,
        })
        .eq('id', user.id);

      audio.play('whistle');
      alert('Profile updated successfully!');
      refreshProfile();
    } catch (err: any) {
      console.error(err);
      alert('Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1
          className="text-2xl sm:text-3xl font-black uppercase text-sl-foreground"
          style={{ fontFamily: 'var(--font-title)' }}
        >
          👤 Athlete Profile & Digital ID
        </h1>
        <p className="text-xs text-sl-muted font-medium mt-1">
          Manage your student athlete credentials and present your verified badge for court entry.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Digital Member ID Card (3D Tilt) */}
        <div className="lg:col-span-5 space-y-4">
          <TiltCard className="p-6 bg-gradient-to-br from-[#0a2012] via-[#041006] to-[#010803] text-white border-2 border-sl-green shadow-2xl relative overflow-hidden">
            {/* Hologram Corner Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-sl-green/20 blur-3xl pointer-events-none" />

            <div className="space-y-6">
              {/* ID Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🏸</span>
                  <div>
                    <h3 className="text-sm font-black tracking-widest text-sl-green-glow uppercase">
                      SHUTTLELIONS
                    </h3>
                    <p className="text-[9px] text-white/60 tracking-wider">UNN ATHLETICS PASS</p>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase bg-sl-green text-white px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> VERIFIED
                </span>
              </div>

              {/* Lion Avatar & Info */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-sl-green/30 border-2 border-sl-green-glow text-white font-black text-3xl flex items-center justify-center shadow-lg">
                  {user?.full_name?.charAt(0) || 'L'}
                </div>
                <div className="space-y-0.5 flex-1 min-w-0">
                  <h4 className="text-base font-black text-white truncate">
                    {user?.full_name || 'UNN Student'}
                  </h4>
                  <p className="text-xs text-sl-green-glow font-mono font-bold">
                    {user?.reg_number || '2024/UNN-SL/89'}
                  </p>
                  <p className="text-[11px] text-white/70 truncate">
                    {user?.department || 'Department pending'}
                  </p>
                </div>
              </div>

              {/* Faculty & Level Specs */}
              <div className="grid grid-cols-2 gap-2 bg-white/5 p-3 rounded-xl border border-white/10 text-xs">
                <div>
                  <span className="text-[10px] text-white/50 uppercase font-bold">Faculty</span>
                  <p className="font-bold text-white truncate">{user?.faculty || 'Faculty of Engineering'}</p>
                </div>
                <div>
                  <span className="text-[10px] text-white/50 uppercase font-bold">Level</span>
                  <p className="font-bold text-sl-green-glow">{user?.level || '100'} Level</p>
                </div>
              </div>

              {/* QR Code Barcode Verification */}
              <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                <div className="flex items-center gap-2">
                  <QrCode className="w-8 h-8 text-white/80" />
                  <span className="text-[9px] font-mono text-white/50 leading-tight">
                    SCAN FOR COURT<br />ENTRY VALIDATION
                  </span>
                </div>
                <span className="text-[10px] font-mono text-sl-green-glow font-bold">
                  ACTIVE 2026/2027
                </span>
              </div>
            </div>
          </TiltCard>

          <p className="text-[11px] text-sl-muted text-center italic">
            💡 Show this screen to the team captain at the indoor hall during open sessions.
          </p>
        </div>

        {/* Right: Profile Edit Form */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSave} className="shuttle-panel p-6 sm:p-8 bg-sl-panel space-y-6">
            <h3 className="text-lg font-black text-sl-foreground uppercase flex items-center gap-2">
              <User className="w-4 h-4 text-sl-green" /> Edit Information
            </h3>

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

            <div className="pt-2 flex justify-end">
              <ShuttleButton
                type="submit"
                variant="green"
                disabled={isSaving}
                className="py-3 px-8 text-xs font-black shadow-md"
              >
                {isSaving ? 'Saving Updates...' : 'Save Profile Changes ⚡'}
              </ShuttleButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
