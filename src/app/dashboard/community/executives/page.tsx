'use client';

import { useState, useEffect } from 'react';
import { supabase, type Profile, type CustomRole } from '@/lib/supabase';
import { useAuth } from '@/components/AuthContext';
import { TiltCard } from '@/components/ui/TiltCard';
import { ShuttleButton } from '@/components/ui/ShuttleButton';
import { ShuttleModal } from '@/components/ui/ShuttleModal';
import { ShuttleInput } from '@/components/ui/ShuttleInput';
import { ShuttleSelect } from '@/components/ui/ShuttleSelect';
import {
  Shield,
  Video,
  DollarSign,
  Crown,
  Sparkles,
  Plus,
  UserCheck,
  RotateCcw,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { audio } from '@/lib/audio';
import { useFeedback } from '@/components/ui/FeedbackModal';

const ROLE_ICONS: Record<string, any> = {
  admin: <Shield className="w-4 h-4 text-amber-400" />,
  captain: <Crown className="w-4 h-4 text-sl-green" />,
  media_personnel: <Video className="w-4 h-4 text-cyan-400" />,
  treasurer: <DollarSign className="w-4 h-4 text-emerald-400" />,
};

const ROLE_LABELS: Record<string, string> = {
  admin: 'Executive Admin & Coach',
  captain: 'Team Captain',
  media_personnel: 'Official Media Personnel',
  treasurer: 'Club Treasurer',
  member: 'Student Athlete',
};

export default function ExecutivesBoardPage() {
  const { user } = useAuth();
  const { showAlert, showConfirm } = useFeedback();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [customRoles, setCustomRoles] = useState<CustomRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isAppointModalOpen, setIsAppointModalOpen] = useState(false);
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);

  // Appoint Form state
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [targetRoleId, setTargetRoleId] = useState('media_personnel');

  // Custom Role Form state
  const [newRoleTitle, setNewRoleTitle] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [newRoleBadgeColor, setNewRoleBadgeColor] = useState('cyan');
  const [canUploadMedia, setCanUploadMedia] = useState(false);
  const [canAuditFinances, setCanAuditFinances] = useState(false);
  const [canManageSchedule, setCanManageSchedule] = useState(false);

  const isAdmin = user?.role === 'admin' || user?.role === 'captain';

  const loadData = async () => {
    setIsLoading(true);
    try {
      const { data: pData } = await supabase.from('profiles').select('*');
      setProfiles(pData || []);

      const { data: rData } = await supabase.from('custom_roles').select('*');
      setCustomRoles(rData || []);

      if (pData && pData.length > 0) {
        setSelectedMemberId(pData[0].id);
      }
    } catch (err) {
      console.error('Failed to load executives data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAppointRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId || !targetRoleId) return;

    audio.play('serve');
    try {
      await supabase
        .from('profiles')
        .update({ role: targetRoleId })
        .eq('id', selectedMemberId);

      audio.play('whistle');
      setIsAppointModalOpen(false);
      loadData();
      showAlert({
        title: 'Appointment Confirmed! 🎖️',
        message: `Member has been officially appointed to executive role "${ROLE_LABELS[targetRoleId] || targetRoleId}".`,
        type: 'success',
      });
    } catch (err) {
      console.error('Failed to update role:', err);
      showAlert({
        title: 'Appointment Failed',
        message: 'Failed to assign role. Please try again.',
        type: 'error',
      });
    }
  };

  const handleRevokeRole = (memberId: string, memberName: string) => {
    showConfirm({
      title: 'Revoke Executive Appointment',
      message: `Are you sure you want to revoke executive privileges for ${memberName} back to Student Athlete?`,
      type: 'warning',
      confirmText: 'Revoke Appointment',
      onConfirm: async () => {
        audio.play('courtSqueak');
        try {
          await supabase
            .from('profiles')
            .update({ role: 'member' })
            .eq('id', memberId);

          audio.play('whistle');
          loadData();
          showAlert({
            title: 'Role Revoked',
            message: `${memberName} has been returned to Student Athlete status.`,
            type: 'info',
          });
        } catch (err) {
          console.error('Failed to revoke role:', err);
          showAlert({
            title: 'Action Failed',
            message: 'Failed to revoke role.',
            type: 'error',
          });
        }
      },
    });
  };

  const handleCreateCustomRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleTitle.trim()) return;

    audio.play('serve');
    const roleId = newRoleTitle.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_');

    try {
      const newRoleObj: CustomRole = {
        id: roleId,
        title: newRoleTitle.trim(),
        description: newRoleDesc.trim(),
        badge_color: newRoleBadgeColor,
        can_upload_media: canUploadMedia,
        can_audit_finances: canAuditFinances,
        can_manage_schedule: canManageSchedule,
        is_system: false,
        created_at: new Date().toISOString(),
      };

      await supabase.from('custom_roles').insert(newRoleObj);
      audio.play('whistle');
      setIsCreateRoleOpen(false);
      setNewRoleTitle('');
      setNewRoleDesc('');
      setCanUploadMedia(false);
      setCanAuditFinances(false);
      setCanManageSchedule(false);
      loadData();
      showAlert({
        title: 'Custom Role Created! ⚡',
        message: `Executive role "${newRoleTitle}" with selected permissions is now active.`,
        type: 'success',
      });
    } catch (err) {
      console.error('Failed to create custom role:', err);
      showAlert({
        title: 'Creation Failed',
        message: 'Failed to create custom role.',
        type: 'error',
      });
    }
  };

  const executiveProfiles = profiles.filter((p) => p.role !== 'member');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="shuttle-panel p-6 sm:p-8 bg-gradient-to-r from-sl-panel via-sl-green/10 to-sl-panel border border-sl-border flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase text-sl-green bg-sl-green/15 px-3 py-1 rounded-full flex items-center gap-1.5 font-mono">
              <Crown className="w-3.5 h-3.5" /> OFFICIAL CLUB HIERARCHY
            </span>
          </div>
          <h1
            className="text-2xl sm:text-4xl font-black uppercase text-sl-foreground"
            style={{ fontFamily: 'var(--font-title)' }}
          >
            🏛️ Executive Board & Roles
          </h1>
          <p className="text-xs sm:text-sm text-sl-muted font-medium max-w-xl">
            Meet the official leadership council of ShuttleLions. Appointed executives govern media publications, tournament scheduling, and club finances.
          </p>
        </div>

        {isAdmin && (
          <div className="flex flex-wrap items-center gap-3">
            <ShuttleButton
              variant="green"
              onClick={() => {
                audio.play('rally');
                setIsAppointModalOpen(true);
              }}
              className="py-2.5 px-5 text-xs font-black flex items-center gap-1.5 shadow-md"
            >
              <UserCheck className="w-4 h-4" />
              <span>Appoint Executive</span>
            </ShuttleButton>

            <ShuttleButton
              variant="white"
              onClick={() => {
                audio.play('rally');
                setIsCreateRoleOpen(true);
              }}
              className="py-2.5 px-5 text-xs font-black border-2 border-sl-border flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create Custom Role</span>
            </ShuttleButton>
          </div>
        )}
      </div>

      {/* Section 1: Executive Board Grid */}
      <div className="space-y-4">
        <h2 className="text-sm font-black text-sl-muted uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-sl-green" /> Appointed Executive Council ({executiveProfiles.length})
        </h2>

        {executiveProfiles.length === 0 ? (
          <div className="shuttle-panel p-8 text-center text-sl-muted text-xs font-semibold">
            No executive appointments yet. Use the button above to assign roles to athletes.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {executiveProfiles.map((exec) => {
              const customRoleInfo = customRoles.find((r) => r.id === exec.role);
              const displayRoleTitle = customRoleInfo?.title || ROLE_LABELS[exec.role] || exec.role;
              const icon = ROLE_ICONS[exec.role] || <Sparkles className="w-4 h-4 text-sl-green" />;

              return (
                <TiltCard key={exec.id} className="p-6 bg-sl-panel space-y-5 border-2 border-sl-green/30">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-sl-green/20 border-2 border-sl-green text-sl-green font-black text-2xl flex items-center justify-center shadow-md shrink-0">
                      {exec.full_name?.charAt(0) || 'E'}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-1.5">
                        {icon}
                        <h3 className="text-base font-black text-sl-foreground truncate">{exec.full_name}</h3>
                      </div>
                      <span className="inline-block text-[10px] font-black uppercase bg-sl-green/15 text-sl-green px-2.5 py-0.5 rounded-full border border-sl-green/20 truncate">
                        {displayRoleTitle}
                      </span>
                    </div>
                  </div>

                  {/* Description & Responsibilities */}
                  <div className="p-3 bg-sl-bg rounded-xl border border-sl-border text-xs space-y-1.5 font-medium">
                    <p className="text-sl-muted truncate">🏛️ {exec.department || 'Department pending'}</p>
                    <p className="text-sl-muted truncate">🎓 {exec.faculty}</p>
                    {customRoleInfo?.description && (
                      <p className="text-[11px] text-sl-foreground/80 italic pt-1 border-t border-sl-border/40">
                        "{customRoleInfo.description}"
                      </p>
                    )}
                  </div>

                  {/* Admin Actions */}
                  {isAdmin && (
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => handleRevokeRole(exec.id, exec.full_name || 'Member')}
                        className="text-[11px] font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Revoke Appointment</span>
                      </button>
                    </div>
                  )}
                </TiltCard>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 2: Roles Registry & Permission Overview */}
      <div className="space-y-4 pt-6">
        <h2 className="text-sm font-black text-sl-muted uppercase tracking-wider flex items-center gap-2">
          <Shield className="w-4 h-4 text-sl-green" /> Role Permissions Matrix
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {customRoles.map((role) => (
            <div key={role.id} className="shuttle-panel p-5 bg-sl-panel space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-sl-green">{role.title}</span>
                {role.is_system && (
                  <span className="text-[9px] font-mono text-sl-muted bg-sl-bg px-2 py-0.5 rounded">System</span>
                )}
              </div>
              <p className="text-[11px] text-sl-muted leading-relaxed">{role.description}</p>
              <div className="space-y-1 pt-2 border-t border-sl-border/30 text-[10px] font-bold">
                <div className="flex items-center gap-1.5">
                  <span className={role.can_upload_media ? 'text-sl-green' : 'text-sl-muted opacity-40'}>
                    {role.can_upload_media ? '✓' : '✗'} Media Uploads
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={role.can_audit_finances ? 'text-sl-green' : 'text-sl-muted opacity-40'}>
                    {role.can_audit_finances ? '✓' : '✗'} Financial Auditing
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={role.can_manage_schedule ? 'text-sl-green' : 'text-sl-muted opacity-40'}>
                    {role.can_manage_schedule ? '✓' : '✗'} Schedule Manager
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal 1: Appoint Member Role */}
      <ShuttleModal
        isOpen={isAppointModalOpen}
        onClose={() => setIsAppointModalOpen(false)}
        title="Appoint Club Executive"
      >
        <form onSubmit={handleAppointRole} className="space-y-4">
          <ShuttleSelect
            label="Select Athlete"
            value={selectedMemberId}
            onChange={(e) => setSelectedMemberId(e.target.value)}
            options={profiles.map((p) => ({
              value: p.id,
              label: `${p.full_name} (${p.department || 'Student'}) — Current: ${p.role}`,
            }))}
          />

          <ShuttleSelect
            label="Assign Executive Role"
            value={targetRoleId}
            onChange={(e) => setTargetRoleId(e.target.value)}
            options={customRoles.map((r) => ({
              value: r.id,
              label: `${r.title} ${r.id === 'media_personnel' ? '(Upload Media Lead)' : ''}`,
            }))}
          />

          <div className="flex gap-3 pt-2">
            <ShuttleButton
              type="button"
              variant="white"
              onClick={() => setIsAppointModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </ShuttleButton>
            <ShuttleButton type="submit" variant="green" className="flex-1 font-black">
              Confirm Appointment 👑
            </ShuttleButton>
          </div>
        </form>
      </ShuttleModal>

      {/* Modal 2: Create Custom Role */}
      <ShuttleModal
        isOpen={isCreateRoleOpen}
        onClose={() => setIsCreateRoleOpen(false)}
        title="Create Custom Executive Role"
      >
        <form onSubmit={handleCreateCustomRole} className="space-y-4">
          <ShuttleInput
            label="Role Title"
            value={newRoleTitle}
            onChange={(e) => setNewRoleTitle(e.target.value)}
            placeholder="e.g. Public Relations Officer, Match Umpire"
            required
          />

          <ShuttleInput
            label="Role Description"
            value={newRoleDesc}
            onChange={(e) => setNewRoleDesc(e.target.value)}
            placeholder="Brief responsibilities of this executive role..."
          />

          {/* Permissions Checkboxes */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-bold text-sl-foreground uppercase">Role Permissions</label>
            <div className="space-y-2 bg-sl-bg p-3 rounded-xl border border-sl-border text-xs font-semibold">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={canUploadMedia}
                  onChange={(e) => setCanUploadMedia(e.target.checked)}
                  className="rounded text-sl-green focus:ring-sl-green"
                />
                <span>Can upload match vlogs & community media</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={canAuditFinances}
                  onChange={(e) => setCanAuditFinances(e.target.checked)}
                  className="rounded text-sl-green focus:ring-sl-green"
                />
                <span>Can audit finances & view payment ledger</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={canManageSchedule}
                  onChange={(e) => setCanManageSchedule(e.target.checked)}
                  className="rounded text-sl-green focus:ring-sl-green"
                />
                <span>Can schedule drills & tournaments</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <ShuttleButton
              type="button"
              variant="white"
              onClick={() => setIsCreateRoleOpen(false)}
              className="flex-1"
            >
              Cancel
            </ShuttleButton>
            <ShuttleButton type="submit" variant="green" className="flex-1 font-black">
              Save Role ⚡
            </ShuttleButton>
          </div>
        </form>
      </ShuttleModal>
    </div>
  );
}
