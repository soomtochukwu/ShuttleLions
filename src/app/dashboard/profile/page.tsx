'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/components/AuthContext';
import { TiltCard } from '@/components/ui/TiltCard';
import { ShuttleButton } from '@/components/ui/ShuttleButton';
import { ShuttleInput } from '@/components/ui/ShuttleInput';
import { ShuttleSelect } from '@/components/ui/ShuttleSelect';
import { useFeedback } from '@/components/ui/FeedbackModal';
import { FACULTIES_AND_DEPARTMENTS, LEVELS } from '@/lib/constants';
import { supabase } from '@/lib/supabase';
import { audio } from '@/lib/audio';
import {
 ShieldCheck,
 User,
 QrCode,
 Sparkles,
 Camera,
 Upload,
 Link as LinkIcon,
 RefreshCw,
 Image as ImageIcon,
} from 'lucide-react';

export default function ProfilePage() {
 const { user, refreshProfile } = useAuth();
 const { showAlert } = useFeedback();

 const [fullName, setFullName] = useState(user?.full_name || '');
 const [faculty, setFaculty] = useState(user?.faculty || Object.keys(FACULTIES_AND_DEPARTMENTS)[0]);
 const [department, setDepartment] = useState(user?.department || '');
 const [level, setLevel] = useState(user?.level || '100');
 const [phone, setPhone] = useState(user?.phone || '');
 const [regNumber, setRegNumber] = useState(user?.reg_number || '');

 // Avatar customizer state
 const [avatarMode, setAvatarMode] = useState<'file' | 'url'>('file');
 const [avatarUrlInput, setAvatarUrlInput] = useState(user?.avatar_url || '');
 const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
 const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar_url || null);
 const [isSaving, setIsSaving] = useState(false);
 const [uploadProgress, setUploadProgress] = useState<string | null>(null);

 const fileInputRef = useRef<HTMLInputElement>(null);

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

 const handleSave = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!user?.id) return;
 setIsSaving(true);
 setUploadProgress('Updating profile...');
 audio.play('serve');

 try {
 let finalAvatarUrl = avatarPreview;

 // If a new image file was selected, upload it to Supabase Storage
 if (selectedAvatarFile) {
 setUploadProgress('Uploading athlete photo to cloud storage...');
 const fileExt = selectedAvatarFile.name.split('.').pop() || 'jpg';
 const filePath = `avatars/${user.id}-${Date.now()}.${fileExt}`;

 const { error: uploadError } = await supabase.storage
 .from('media-gallery')
 .upload(filePath, selectedAvatarFile, {
 cacheControl: '3600',
 upsert: true,
 });

 if (uploadError) {
 console.error('Storage upload notice:', uploadError);
 // If storage upload fails, fallback to existing or data preview
 } else {
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

 setUploadProgress('Saving credentials to database...');

 await supabase
 .from('profiles')
 .update({
 full_name: fullName.trim(),
 avatar_url: finalAvatarUrl,
 faculty,
 department,
 level,
 phone: phone.trim() || null,
 reg_number: regNumber.trim() || null,
 updated_at: new Date().toISOString(),
 })
 .eq('id', user.id);

 await refreshProfile();
 showAlert({
 title: 'Profile Updated! ',
 message: 'Your athlete credentials and Digital Lion ID Pass have been saved successfully.',
 type: 'success',
 });
 } catch (err: any) {
 console.error(err);
 showAlert({
 title: 'Update Failed',
 message: 'Failed to update profile. Please try again.',
 type: 'error',
 });
 } finally {
 setIsSaving(false);
 setUploadProgress(null);
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
 Athlete Profile & Digital ID
 </h1>
 <p className="text-xs text-sl-muted font-medium mt-1">
 Customize your photo, manage student athlete credentials, and present your verified pass for court entry.
 </p>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
 {/* Left: Digital Member ID Card (3D Tilt with Live Preview) */}
 <div className="lg:col-span-5 space-y-4">
 <TiltCard className="p-6 bg-gradient-to-br from-[#0a2012] via-[#041006] to-[#010803] text-white border-2 border-sl-green shadow-2xl relative overflow-hidden">
 {/* Hologram Corner Accent */}
 <div className="absolute top-0 right-0 w-32 h-32 bg-sl-green/20 blur-3xl pointer-events-none" />

 <div className="space-y-6">
 {/* ID Header */}
 <div className="flex items-center justify-between border-b border-white/10 pb-4">
 <div className="flex items-center gap-2">
 <span className="text-2xl"></span>
 <div>
 <h3 className="text-sm font-black tracking-widest text-sl-green-glow uppercase">
 SHUTTLELIONS
 </h3>
 <p className="text-[9px] text-white/60 tracking-wider">UNN ATHLETICS PASS</p>
 </div>
 </div>
 <span className="text-[10px] font-black uppercase bg-sl-green text-white px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
 <ShieldCheck className="w-3 h-3" /> VERIFIED
 </span>
 </div>

 {/* Lion Avatar & Info (Live Real-Time Preview) */}
 <div className="flex items-center gap-4">
 {avatarPreview ? (
 <img
 src={avatarPreview}
 alt={fullName || 'Athlete Photo'}
 className="w-16 h-16 rounded-2xl object-cover border-2 border-sl-green-glow shadow-[0_0_15px_rgba(0,230,118,0.4)]"
 />
 ) : (
 <div className="w-16 h-16 rounded-2xl bg-sl-green/30 border-2 border-sl-green-glow text-white font-black text-3xl flex items-center justify-center shadow-lg">
 {fullName?.charAt(0) || 'L'}
 </div>
 )}
 <div className="space-y-0.5 flex-1 min-w-0">
 <h4 className="text-base font-black text-white truncate">
 {fullName || user?.full_name || 'UNN Student'}
 </h4>
 <p className="text-xs text-sl-green-glow font-mono font-bold">
 {regNumber || user?.reg_number || '2024/UNN-SL/89'}
 </p>
 <p className="text-[11px] text-white/70 truncate">
 {department || user?.department || 'Department pending'}
 </p>
 </div>
 </div>

 {/* Faculty & Level Specs */}
 <div className="grid grid-cols-2 gap-2 bg-white/5 p-3 rounded-xl border border-white/10 text-xs">
 <div>
 <span className="text-[10px] text-white/50 uppercase font-bold">Faculty</span>
 <p className="font-bold text-white truncate">{faculty || 'Faculty of Education'}</p>
 </div>
 <div>
 <span className="text-[10px] text-white/50 uppercase font-bold">Level</span>
 <p className="font-bold text-sl-green-glow">{level} Level</p>
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
 The Digital ID card reflects your live photo and details in real-time.
 </p>
 </div>

 {/* Right: Profile Edit Form */}
 <div className="lg:col-span-7 space-y-6">
 <form onSubmit={handleSave} className="shuttle-panel p-6 sm:p-8 bg-sl-panel space-y-6">
 <h3 className="text-lg font-black text-sl-foreground uppercase flex items-center gap-2">
 <User className="w-4 h-4 text-sl-green" /> Edit Information & Photo
 </h3>

 {/* Profile Picture Upload Section */}
 <div className="p-4 rounded-xl bg-sl-bg border border-sl-border space-y-3">
 <div className="flex items-center justify-between">
 <label className="text-xs font-black uppercase text-sl-foreground flex items-center gap-1.5">
 <Camera className="w-3.5 h-3.5 text-sl-green" /> Athlete Profile Picture
 </label>
 <div className="flex items-center gap-1 bg-sl-panel p-1 rounded-lg border border-sl-border text-[11px] font-bold">
 <button
 type="button"
 onClick={() => setAvatarMode('file')}
 className={`px-2.5 py-1 rounded transition-colors ${
 avatarMode === 'file' ? 'bg-sl-green text-white shadow-sm' : 'text-sl-muted hover:text-sl-foreground'
 }`}
 >
 Upload File
 </button>
 <button
 type="button"
 onClick={() => setAvatarMode('url')}
 className={`px-2.5 py-1 rounded transition-colors ${
 avatarMode === 'url' ? 'bg-sl-green text-white shadow-sm' : 'text-sl-muted hover:text-sl-foreground'
 }`}
 >
 Image Link
 </button>
 </div>
 </div>

 {avatarMode === 'file' ? (
 <div className="space-y-2">
 <input
 type="file"
 ref={fileInputRef}
 onChange={handleFileSelect}
 accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
 className="hidden"
 />
 <div
 onClick={() => fileInputRef.current?.click()}
 className="cursor-pointer border-2 border-dashed border-sl-border hover:border-sl-green rounded-xl p-4 text-center transition-all bg-sl-panel hover:bg-sl-green/5 flex flex-col items-center justify-center gap-2"
 >
 <div className="w-10 h-10 rounded-full bg-sl-green/10 text-sl-green flex items-center justify-center">
 <Upload className="w-5 h-5" />
 </div>
 <div>
 <p className="text-xs font-bold text-sl-foreground">
 {selectedAvatarFile ? selectedAvatarFile.name : 'Click to select photo from device'}
 </p>
 <p className="text-[10px] text-sl-muted mt-0.5">
 Supports JPG, PNG, WEBP up to 5MB
 </p>
 </div>
 </div>
 </div>
 ) : (
 <div className="space-y-1">
 <div className="relative">
 <ShuttleInput
 value={avatarUrlInput}
 onChange={(e) => handleUrlChange(e.target.value)}
 placeholder="Paste image link (https://...)"
 />
 </div>
 <p className="text-[10px] text-sl-muted">
 Paste any public image URL (Google Drive photo, Cloudinary, Imgur, etc.)
 </p>
 </div>
 )}
 </div>

 {/* General Info Fields */}
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

 <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
 {uploadProgress && (
 <span className="text-xs font-bold text-sl-green animate-pulse">
 {uploadProgress}
 </span>
 )}
 <div className="ml-auto">
 <ShuttleButton
 type="submit"
 variant="green"
 disabled={isSaving}
 className="py-3 px-8 text-xs font-black shadow-md"
 >
 {isSaving ? 'Saving Profile...' : 'Save Profile Changes '}
 </ShuttleButton>
 </div>
 </div>
 </form>
 </div>
 </div>
 </div>
 );
}
