'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase, type MediaUpload, type CustomRole } from '@/lib/supabase';
import { useAuth } from '@/components/AuthContext';
import { TiltCard } from '@/components/ui/TiltCard';
import { ShuttleButton } from '@/components/ui/ShuttleButton';
import { ShuttleModal } from '@/components/ui/ShuttleModal';
import { ShuttleInput } from '@/components/ui/ShuttleInput';
import { useFeedback } from '@/components/ui/FeedbackModal';
import { parseMediaSource } from '@/lib/media-utils';
import {
 Video,
 Heart,
 Eye,
 Plus,
 Play,
 Sparkles,
 Shield,
 Upload,
 Image as ImageIcon,
 Link as LinkIcon,
 Film,
 X,
 Maximize2,
 Trash2,
 AlertCircle,
 ExternalLink,
 Layers,
 CheckCircle2,
 Loader2,
 CheckSquare,
 Square,
 ListChecks,
} from 'lucide-react';
import { audio } from '@/lib/audio';

interface StagedMediaItem {
 id: string;
 file: File;
 previewUrl: string;
 title: string;
 description: string;
 type: 'video' | 'image';
 size: number;
}

import { useCachedQuery } from '@/lib/client-cache';

export default function MediaGalleryPage() {
 const { user } = useAuth();
 const { showAlert, showConfirm } = useFeedback();

 // 1. Cached Media Gallery List
 const { data: mediaList, setData: setMediaList } = useCachedQuery<MediaUpload[]>({
 key: 'media_gallery_list',
 initialFallback: [],
 fetcher: async () => {
 const { data } = await supabase
 .from('media_uploads')
 .select('*')
 .order('created_at', { ascending: false });
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

 const [likedMediaIds, setLikedMediaIds] = useState<Set<string>>(new Set());
 const [filter, setFilter] = useState<'all' | 'training' | 'highlights' | 'photos'>('all');
 const [isUploadOpen, setIsUploadOpen] = useState(false);

 // Selection & Batch Delete State
 const [isSelectionMode, setIsSelectionMode] = useState(false);
 const [selectedMediaIds, setSelectedMediaIds] = useState<Set<string>>(new Set());
 const [isBatchDeleting, setIsBatchDeleting] = useState(false);

 // Upload Form State
 const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
 const [stagedFiles, setStagedFiles] = useState<StagedMediaItem[]>([]);
 const [newCategory, setNewCategory] = useState<'training' | 'competition' | 'highlights' | 'social'>('training');

 // Single URL Upload State
 const [newUrl, setNewUrl] = useState('');
 const [urlTitle, setUrlTitle] = useState('');
 const [urlDesc, setUrlDesc] = useState('');

 // Progress Tracking State
 const [isUploading, setIsUploading] = useState(false);
 const [uploadPercent, setUploadPercent] = useState<number>(0);
 const [currentUploadIndex, setCurrentUploadIndex] = useState<number>(0);
 const [currentUploadingName, setCurrentUploadingName] = useState<string>('');

 // Active Lightbox Image
 const [lightboxImage, setLightboxImage] = useState<string | null>(null);
 const [deletingId, setDeletingId] = useState<string | null>(null);

 const fileInputRef = useRef<HTMLInputElement>(null);
 const viewedMediaRef = useRef<Set<string>>(new Set());

 useEffect(() => {
 async function loadLikes() {
 if (user?.id) {
 const { data: likesData } = await supabase
 .from('media_likes')
 .select('media_id')
 .eq('profile_id', user.id);
 if (likesData) {
 setLikedMediaIds(new Set(likesData.map((l: any) => l.media_id)));
 }
 }
 }
 loadLikes();
 }, [user?.id]);

 // Permission Gate: Media Personnel, Admin, Captain, or Custom Role with can_upload_media
 const userCustomRole = customRoles.find((r) => r.id === user?.role);
 const canUploadMedia =
 user?.role === 'media_personnel' ||
 user?.role === 'admin' ||
 user?.role === 'captain' ||
 Boolean(userCustomRole?.can_upload_media);

 const filteredMedia = mediaList.filter((m) => {
 if (filter === 'all') return true;
 if (filter === 'photos') return m.media_type === 'image';
 return m.category === filter;
 });

 // Selection Mode Helpers
 const toggleSelectMedia = (id: string) => {
 audio.play('rally');
 setSelectedMediaIds((prev) => {
 const next = new Set(prev);
 if (next.has(id)) {
 next.delete(id);
 } else {
 next.add(id);
 }
 return next;
 });
 };

 const selectAllFiltered = () => {
 audio.play('rally');
 setSelectedMediaIds(new Set(filteredMedia.map((m) => m.id)));
 };

 const deselectAll = () => {
 audio.play('courtSqueak');
 setSelectedMediaIds(new Set());
 };

 const handleBatchDelete = () => {
 const toDelete = mediaList.filter((m) => selectedMediaIds.has(m.id));
 if (toDelete.length === 0) return;

 showConfirm({
 title: 'Batch Delete Media Clips',
 message: `Are you sure you want to permanently delete ${toDelete.length} selected media clip${
 toDelete.length === 1 ? '' : 's'
 }? This will remove them from both the court feed and cloud storage.`,
 type: 'danger',
 confirmText: `Delete ${toDelete.length} Clip${toDelete.length === 1 ? '' : 's'} `,
 onConfirm: async () => {
 setIsBatchDeleting(true);
 audio.play('netDrop');

 try {
 // 1. Delete storage files
 const storagePaths: string[] = [];
 for (const item of toDelete) {
 if (item.media_url.includes('/media-gallery/')) {
 const parts = item.media_url.split('/media-gallery/');
 if (parts[1]) {
 storagePaths.push(decodeURIComponent(parts[1]));
 }
 }
 }

 if (storagePaths.length > 0) {
 await supabase.storage.from('media-gallery').remove(storagePaths);
 }

 // 2. Delete database records in bulk
 const idsToDelete = Array.from(selectedMediaIds);
 await supabase.from('media_uploads').delete().in('id', idsToDelete);

 // 3. Update local state
 setMediaList((prev) => prev.filter((m) =>!selectedMediaIds.has(m.id)));
 setSelectedMediaIds(new Set());
 setIsSelectionMode(false);

 showAlert({
 title: 'Batch Delete Complete ',
 message: `Successfully removed ${toDelete.length} media item${toDelete.length === 1 ? '' : 's'} from the club gallery.`,
 type: 'info',
 });
 } catch (err: any) {
 console.error('Batch delete error:', err);
 showAlert({
 title: 'Batch Delete Failed',
 message: 'An error occurred while deleting selected clips. Please try again.',
 type: 'error',
 });
 } finally {
 setIsBatchDeleting(false);
 }
 },
 });
 };

 const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
 const files = e.target.files;
 if (!files || files.length === 0) return;

 const newStaged: StagedMediaItem[] = [];

 for (let i = 0; i < files.length; i++) {
 const file = files[i];
 const isVideo = file.type.startsWith('video/');
 const isImage = file.type.startsWith('image/');

 if (!isVideo &&!isImage) {
 showAlert({
 title: 'Unsupported File',
 message: `"${file.name}" is not a supported video (.mp4, .webm, .mov) or image (.png, .jpg, .webp).`,
 type: 'warning',
 });
 continue;
 }

 if (file.size > 100 * 1024 * 1024) {
 showAlert({
 title: 'File Too Large',
 message: `"${file.name}" exceeds the 100MB upload limit and was skipped.`,
 type: 'warning',
 });
 continue;
 }

 // Auto-generate clean title from filename
 const cleanTitle = file.name
 .replace(/\.[^/.]+$/, '')
 .replace(/[-_]+/g, ' ')
 .replace(/\b\w/g, (c) => c.toUpperCase());

 const previewUrl = URL.createObjectURL(file);

 newStaged.push({
 id: `staged-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
 file,
 previewUrl,
 title: cleanTitle,
 description: '',
 type: isVideo ? 'video' : 'image',
 size: file.size,
 });
 }

 if (newStaged.length > 0) {
 setStagedFiles((prev) => [...prev, ...newStaged]);
 audio.play('rally');
 }

 if (e.target) e.target.value = '';
 };

 const removeStagedFile = (id: string) => {
 setStagedFiles((prev) => prev.filter((f) => f.id!== id));
 audio.play('netDrop');
 };

 const updateStagedFileTitle = (id: string, title: string) => {
 setStagedFiles((prev) => prev.map((f) => (f.id === id ? { ...f, title } : f)));
 };

 const handleLike = async (id: string) => {
 if (!user?.id) {
 showAlert({
 title: 'Authentication Required',
 message: 'Please log in to like tournament matches and training drills.',
 type: 'info',
 });
 return;
 }

 const isCurrentlyLiked = likedMediaIds.has(id);
 audio.play(isCurrentlyLiked ? 'courtSqueak' : 'rally');

 // Optimistic state update
 setLikedMediaIds((prev) => {
 const next = new Set(prev);
 if (isCurrentlyLiked) {
 next.delete(id);
 } else {
 next.add(id);
 }
 return next;
 });

 setMediaList((prev) =>
 prev.map((m) =>
 m.id === id
 ? { ...m, likes_count: Math.max(0, (m.likes_count || 0) + (isCurrentlyLiked ? -1 : 1)) }
 : m
 )
 );

 try {
 const { data, error } = await supabase.rpc('toggle_media_like', {
 p_media_id: id,
 p_profile_id: user.id,
 });

 if (error) {
 console.error('Like toggle error:', error);
 } else if (data && typeof data.likes_count === 'number') {
 setMediaList((prev) =>
 prev.map((m) => (m.id === id ? { ...m, likes_count: data.likes_count } : m))
 );
 }
 } catch (err) {
 console.error('Failed to update likes:', err);
 }
 };

 const recordView = async (id: string) => {
 if (viewedMediaRef.current.has(id)) return;
 viewedMediaRef.current.add(id);

 // Optimistic increment
 setMediaList((prev) =>
 prev.map((m) => (m.id === id ? { ...m, views_count: (m.views_count || 0) + 1 } : m))
 );

 try {
 const { data, error } = await supabase.rpc('increment_media_views', {
 p_media_id: id,
 });

 if (!error && typeof data === 'number') {
 setMediaList((prev) =>
 prev.map((m) => (m.id === id ? { ...m, views_count: data } : m))
 );
 }
 } catch (err) {
 console.error('Failed to record view:', err);
 }
 };

 const handleDeleteMedia = (mediaItem: MediaUpload) => {
 showConfirm({
 title: 'Delete Media Clip',
 message: `Are you sure you want to permanently delete "${mediaItem.title}"? This action cannot be undone.`,
 type: 'danger',
 confirmText: 'Delete Clip ',
 onConfirm: async () => {
 setDeletingId(mediaItem.id);
 audio.play('netDrop');

 try {
 if (mediaItem.media_url.includes('/media-gallery/')) {
 const parts = mediaItem.media_url.split('/media-gallery/');
 if (parts[1]) {
 const storagePath = decodeURIComponent(parts[1]);
 await supabase.storage.from('media-gallery').remove([storagePath]);
 }
 }

 await supabase.from('media_uploads').delete().eq('id', mediaItem.id);

 setMediaList((prev) => prev.filter((m) => m.id!== mediaItem.id));
 showAlert({
 title: 'Media Deleted',
 message: `"${mediaItem.title}" has been removed from the court feed.`,
 type: 'info',
 });
 } catch (err: any) {
 console.error('Delete error:', err);
 showAlert({
 title: 'Deletion Failed',
 message: 'Failed to delete media clip. Please check your connection and permissions.',
 type: 'error',
 });
 } finally {
 setDeletingId(null);
 }
 },
 });
 };

 const handleUploadSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!canUploadMedia) {
 showAlert({
 title: 'Access Denied',
 message: 'Only appointed Media Personnel or Admins can upload media.',
 type: 'warning',
 });
 return;
 }
 if (!user?.id) return;

 if (uploadMode === 'url') {
 if (!newUrl.trim() ||!urlTitle.trim()) {
 showAlert({
 title: 'Missing URL or Title',
 message: 'Please provide both a media title and a valid URL.',
 type: 'warning',
 });
 return;
 }

 setIsUploading(true);
 setUploadPercent(40);
 audio.play('serve');

 try {
 const parsed = parseMediaSource(newUrl.trim());
 const mediaType: 'video' | 'image' | 'vlog' = parsed.kind === 'image' ? 'image' : 'video';
 const finalThumbnailUrl = parsed.thumbnailUrl || (parsed.kind === 'image' ? newUrl.trim() : null);

 setUploadPercent(85);

 const newMediaRecord = {
 uploader_id: user.id,
 title: urlTitle.trim(),
 description: urlDesc.trim(),
 media_type: mediaType,
 media_url: newUrl.trim(),
 thumbnail_url: finalThumbnailUrl,
 category: newCategory,
 likes_count: 0,
 views_count: 1,
 created_at: new Date().toISOString(),
 updated_at: new Date().toISOString(),
 };

 const { data: insertedData, error: dbError } = await supabase
 .from('media_uploads')
 .insert(newMediaRecord)
 .select()
 .single();

 if (!dbError && insertedData) {
 setMediaList((prev) => [insertedData as MediaUpload, ...prev]);
 } else {
 const fallbackMedia: MediaUpload = {
 id: `media-${Date.now()}`,
 ...newMediaRecord,
 };
 setMediaList((prev) => [fallbackMedia, ...prev]);
 }

 setUploadPercent(100);
 setIsUploadOpen(false);
 setNewUrl('');
 setUrlTitle('');
 setUrlDesc('');
 showAlert({
 title: 'Published to Club Feed! ',
 message: `"${urlTitle}" has been published to the ShuttleLions media feed.`,
 type: 'success',
 });
 } catch (err) {
 console.error('URL upload error:', err);
 showAlert({
 title: 'Upload Failed',
 message: 'Failed to publish media link.',
 type: 'error',
 });
 } finally {
 setIsUploading(false);
 setUploadPercent(0);
 }
 } else {
 // Multi-file batch upload
 if (stagedFiles.length === 0) {
 showAlert({
 title: 'No Files Selected',
 message: 'Please select one or more video/photo files to upload.',
 type: 'warning',
 });
 return;
 }

 setIsUploading(true);
 setUploadPercent(5);
 audio.play('serve');

 const totalItems = stagedFiles.length;
 const uploadedMediaList: MediaUpload[] = [];

 for (let i = 0; i < totalItems; i++) {
 const item = stagedFiles[i];
 setCurrentUploadIndex(i + 1);
 setCurrentUploadingName(item.file.name);

 const startPercent = Math.round((i / totalItems) * 100);
 setUploadPercent(Math.min(95, startPercent + 10));

 try {
 const fileExt = item.file.name.split('.').pop() || (item.type === 'video' ? 'mp4' : 'jpg');
 const folder = item.type === 'video' ? 'videos' : 'photos';
 const filePath = `media/${folder}/${user.id}-${Date.now()}-${i}.${fileExt}`;

 const { error: uploadError } = await supabase.storage
 .from('media-gallery')
 .upload(filePath, item.file, {
 cacheControl: '3600',
 upsert: false,
 });

 if (uploadError) {
 console.error(`Error uploading ${item.file.name}:`, uploadError);
 continue;
 }

 setUploadPercent(Math.min(95, startPercent + Math.round((0.85 / totalItems) * 100)));

 const { data: publicData } = supabase.storage
 .from('media-gallery')
 .getPublicUrl(filePath);

 const finalMediaUrl = publicData.publicUrl;

 const newMediaRecord = {
 uploader_id: user.id,
 title: item.title.trim() || 'Court Match Footage',
 description: item.description.trim(),
 media_type: item.type as 'video' | 'image' | 'vlog',
 media_url: finalMediaUrl,
 thumbnail_url: finalMediaUrl,
 category: newCategory,
 file_size_bytes: item.size,
 mime_type: item.file.type,
 likes_count: 0,
 views_count: 1,
 created_at: new Date().toISOString(),
 updated_at: new Date().toISOString(),
 };

 const { data: insertedData, error: dbError } = await supabase
 .from('media_uploads')
 .insert(newMediaRecord)
 .select()
 .single();

 if (!dbError && insertedData) {
 uploadedMediaList.push(insertedData as MediaUpload);
 } else {
 const fallbackMedia: MediaUpload = {
 id: `media-${Date.now()}-${i}`,
 ...newMediaRecord,
 };
 uploadedMediaList.push(fallbackMedia);
 }
 } catch (err) {
 console.error('Batch upload item error:', err);
 }
 }

 setUploadPercent(100);
 setMediaList((prev) => [...uploadedMediaList, ...prev]);
 setIsUploading(false);
 setIsUploadOpen(false);
 setStagedFiles([]);
 setUploadPercent(0);

 showAlert({
 title: 'Batch Upload Complete! ',
 message: `Successfully uploaded and published ${uploadedMediaList.length} media file(s) to the court gallery.`,
 type: 'success',
 });
 }
 };

  return (
    <div className="h-full flex flex-col min-h-0 space-y-3 sm:space-y-4">
      {/* Pinned Non-Scrolling Header Section */}
      <div className="shrink-0 space-y-3 sm:space-y-4 pb-3 sm:pb-4 border-b border-sl-border/40">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-4">
          <div>
            <h1
              className="text-lg sm:text-2xl md:text-3xl font-black uppercase text-sl-foreground"
              style={{ fontFamily: 'var(--font-title)' }}
            >
              Vlogs & Match Media Gallery
            </h1>
            <p className="text-[11px] sm:text-xs text-sl-muted font-medium mt-0.5">
              Official match highlights, tournament vlogs, and court footage curated by the Media Personnel.
            </p>
          </div>

          {canUploadMedia ? (
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {/* Batch Selection Toggle Button */}
              <button
                onClick={() => {
                  audio.play('rally');
                  setIsSelectionMode((prev) => !prev);
                  if (isSelectionMode) {
                    setSelectedMediaIds(new Set());
                  }
                }}
                className={`flex-1 sm:flex-initial py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                  isSelectionMode
                    ? 'bg-amber-400/20 text-amber-300 border-amber-400 shadow-sm'
                    : 'bg-sl-panel text-sl-foreground border-sl-border hover:border-sl-green'
                }`}
              >
                <ListChecks className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{isSelectionMode ? 'Exit Selection' : 'Select Multiple'}</span>
              </button>

              {/* Upload Button */}
              <ShuttleButton
                variant="green"
                onClick={() => {
                  audio.play('rally');
                  setIsUploadOpen(true);
                }}
                className="flex-1 sm:flex-initial py-2 sm:py-2.5 px-4 sm:px-5 text-xs font-black flex items-center justify-center gap-1.5 shadow-md"
              >
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Upload Media / Batch</span>
              </ShuttleButton>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-sl-panel px-3 py-1.5 sm:py-2 rounded-xl border border-sl-border text-xs text-sl-muted font-semibold">
              <Video className="w-3.5 h-3.5 text-cyan-400" />
              <span>Curated by Media Personnel</span>
            </div>
          )}
        </div>

        {/* Media Personnel Banner */}
        {!canUploadMedia && (
          <div className="p-3 bg-sl-panel/80 rounded-xl border border-sl-border/80 flex items-center justify-between text-xs text-sl-muted font-medium">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="text-[11px] sm:text-xs">
                Official video vlogs and training clips are published exclusively by the appointed <strong>ShuttleLions Media Personnel</strong>.
              </span>
            </div>
          </div>
        )}

        {/* Filter Tabs & Selection Mode Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
          <div className="flex items-center gap-1.5 bg-sl-panel p-1 rounded-xl border border-sl-border overflow-x-auto no-scrollbar max-w-full">
            <button
              onClick={() => {
                audio.play('rally');
                setFilter('all');
              }}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                filter === 'all' ? 'bg-sl-green text-white shadow-sm' : 'text-sl-muted hover:text-sl-foreground'
              }`}
            >
              All Media ({mediaList.length})
            </button>
            <button
              onClick={() => {
                audio.play('rally');
                setFilter('training');
              }}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                filter === 'training' ? 'bg-sl-green text-white shadow-sm' : 'text-sl-muted hover:text-sl-foreground'
              }`}
            >
              Training Drills
            </button>
            <button
              onClick={() => {
                audio.play('rally');
                setFilter('highlights');
              }}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                filter === 'highlights' ? 'bg-sl-green text-white shadow-sm' : 'text-sl-muted hover:text-sl-foreground'
              }`}
            >
              Match Highlights
            </button>
            <button
              onClick={() => {
                audio.play('rally');
                setFilter('photos');
              }}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                filter === 'photos' ? 'bg-sl-green text-white shadow-sm' : 'text-sl-muted hover:text-sl-foreground'
              }`}
            >
              Photos & Stills
            </button>
          </div>

          {isSelectionMode && (
            <div className="flex items-center gap-2 text-xs font-bold text-sl-muted">
              <span>{selectedMediaIds.size} of {filteredMedia.length} selected</span>
              <button
                onClick={selectedMediaIds.size === filteredMedia.length ? deselectAll : selectAllFiltered}
                className="text-sl-green hover:underline ml-1 cursor-pointer"
              >
                {selectedMediaIds.size === filteredMedia.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Scrollable Content Only */}
      <div className="flex-1 overflow-y-auto min-h-0 pr-1 pb-6 pt-1">
        {/* Media Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
 {filteredMedia.map((m) => {
 const parsed = parseMediaSource(m.media_url, m.thumbnail_url);
 const isOwnerOrAdmin = canUploadMedia || m.uploader_id === user?.id;
 const isLiked = likedMediaIds.has(m.id);
 const isSelected = selectedMediaIds.has(m.id);

 return (
 <TiltCard
 key={m.id}
 onClick={() => {
 if (isSelectionMode) {
 toggleSelectMedia(m.id);
 }
 }}
 className={`p-5 bg-sl-panel space-y-4 overflow-hidden border transition-all cursor-default ${
 isSelectionMode
 ? isSelected
 ? 'border-sl-green ring-2 ring-sl-green/40 shadow-[0_0_15px_rgba(0,230,118,0.25)] cursor-pointer'
 : 'border-sl-border opacity-70 hover:opacity-100 cursor-pointer'
 : 'border-sl-border'
 }`}
 >
 {/* Media Player Container */}
 <div className="relative aspect-video rounded-2xl overflow-hidden bg-black/90 border border-sl-border">
 {/* Selection Checkbox Badge */}
 {isSelectionMode && (
 <div
 onClick={(e) => {
 e.stopPropagation();
 toggleSelectMedia(m.id);
 }}
 className="absolute top-3 right-3 z-30 cursor-pointer p-1 rounded-lg bg-black/80 backdrop-blur border border-white/20 hover:scale-110 transition-transform"
 >
 {isSelected ? (
 <CheckSquare className="w-5 h-5 text-sl-green fill-sl-green/20" />
 ) : (
 <Square className="w-5 h-5 text-slate-400" />
 )}
 </div>
 )}

 {parsed.kind === 'youtube' && parsed.embedUrl ? (
 <iframe
 src={parsed.embedUrl}
 title={m.title}
 className="w-full h-full pointer-events-auto"
 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
 allowFullScreen
 onLoad={() => recordView(m.id)}
 />
 ) : parsed.kind === 'vimeo' && parsed.embedUrl ? (
 <iframe
 src={parsed.embedUrl}
 title={m.title}
 className="w-full h-full pointer-events-auto"
 allow="autoplay; fullscreen; picture-in-picture"
 allowFullScreen
 onLoad={() => recordView(m.id)}
 />
 ) : parsed.kind === 'direct_video' ? (
 <video
 src={m.media_url}
 controls={!isSelectionMode}
 preload="metadata"
 poster={m.thumbnail_url && m.thumbnail_url!== m.media_url ? m.thumbnail_url : undefined}
 onPlay={() => recordView(m.id)}
 className="w-full h-full object-contain"
 />
 ) : parsed.kind === 'image' ? (
 <div
 onClick={(e) => {
 if (!isSelectionMode) {
 setLightboxImage(m.media_url);
 recordView(m.id);
 }
 }}
 className="relative w-full h-full cursor-pointer group"
 >
 <img
 src={m.media_url}
 alt={m.title}
 className="w-full h-full object-cover filter brightness-[0.9] group-hover:scale-105 transition-transform duration-500"
 />
 {!isSelectionMode && (
 <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
 <div className="p-2 rounded-full bg-sl-green text-white shadow-lg">
 <Maximize2 className="w-5 h-5" />
 </div>
 </div>
 )}
 </div>
 ) : (
 <div className="relative w-full h-full flex items-center justify-center bg-black/70">
 <img
 src={m.thumbnail_url || m.media_url}
 alt={m.title}
 className="w-full h-full object-cover filter brightness-75"
 />
 {!isSelectionMode && (
 <a
 href={m.media_url}
 target="_blank"
 rel="noopener noreferrer"
 onClick={() => recordView(m.id)}
 className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/20 transition-colors"
 >
 <div className="p-3 rounded-2xl bg-sl-green text-white font-black text-xs flex items-center gap-2 shadow-xl">
 <Play className="w-4 h-4 fill-white" /> Watch Stream <ExternalLink className="w-3.5 h-3.5" />
 </div>
 </a>
 )}
 </div>
 )}

 {/* Category Tag */}
 <span className="absolute top-3 left-3 bg-black/75 backdrop-blur text-sl-green-glow border border-white/20 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full pointer-events-none z-10">
 {m.category || 'Match Media'}
 </span>
 </div>

 {/* Metadata & Actions */}
 <div className="space-y-2">
 <h3 className="text-base font-black text-sl-foreground">{m.title}</h3>
 {m.description && (
 <p className="text-xs text-sl-muted leading-relaxed font-medium line-clamp-2">
 {m.description}
 </p>
 )}

 <div className="flex items-center justify-between pt-3 border-t border-sl-border/40 text-xs font-bold text-sl-muted">
 <span className="flex items-center gap-1.5 text-xs text-sl-foreground font-mono">
 <Eye className="w-4 h-4 text-sl-green" />
 <span>{m.views_count || 1} {m.views_count === 1 ? 'view' : 'views'}</span>
 </span>

 <div className="flex items-center gap-2">
 {/* Delete Clip Button (Single Item) */}
 {isOwnerOrAdmin &&!isSelectionMode && (
 <button
 onClick={(e) => {
 e.stopPropagation();
 handleDeleteMedia(m);
 }}
 disabled={deletingId === m.id}
 className="flex items-center gap-1 text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
 title="Delete media clip"
 >
 <Trash2 className="w-4 h-4" />
 <span className="text-[11px] font-bold">
 {deletingId === m.id ? 'Deleting...' : 'Delete'}
 </span>
 </button>
 )}

 {/* Interactive Like / Unlike Button */}
 {!isSelectionMode && (
 <button
 onClick={(e) => {
 e.stopPropagation();
 handleLike(m.id);
 }}
 className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-bold text-xs transition-all ${
 isLiked
 ? 'bg-rose-500 text-white border-rose-600 shadow-[0_0_12px_rgba(244,63,94,0.45)] scale-105'
 : 'text-rose-500 hover:scale-110 active:scale-95 bg-rose-500/10 border-rose-500/25 hover:bg-rose-500/20'
 }`}
 title={isLiked ? 'Unlike' : 'Like'}
 >
 <Heart className={`w-4 h-4 transition-transform ${isLiked ? 'fill-white text-white scale-110' : 'fill-rose-500 text-rose-500'}`} />
 <span>{m.likes_count || 0}</span>
 </button>
 )}
 </div>
 </div>
 </div>
 </TiltCard>
 );
 })}
 </div>
 </div>

 {/* Floating Batch Action Toolbar */}
 {isSelectionMode && (
 <div className="fixed bottom-6 inset-x-0 z-40 max-w-xl mx-auto px-4 pointer-events-auto">
 <div className="p-3.5 bg-black/90 backdrop-blur-xl border-2 border-sl-green rounded-2xl shadow-2xl flex items-center justify-between gap-3 text-xs text-white">
 <div className="flex items-center gap-2">
 <span className="p-1.5 rounded-lg bg-sl-green text-black font-black text-xs">
 {selectedMediaIds.size}
 </span>
 <span className="font-bold">
 {selectedMediaIds.size === 1 ? 'item selected' : 'items selected'}
 </span>
 </div>

 <div className="flex items-center gap-2">
 <button
 onClick={selectedMediaIds.size === filteredMedia.length ? deselectAll : selectAllFiltered}
 className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors"
 >
 {selectedMediaIds.size === filteredMedia.length ? 'Deselect All' : 'Select All'}
 </button>

 <button
 onClick={handleBatchDelete}
 disabled={selectedMediaIds.size === 0 || isBatchDeleting}
 className={`px-4 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
 selectedMediaIds.size > 0
 ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-lg scale-105 active:scale-95'
 : 'bg-white/10 text-white/40 cursor-not-allowed'
 }`}
 >
 <Trash2 className="w-4 h-4" />
 <span>{isBatchDeleting ? 'Deleting...' : `Delete (${selectedMediaIds.size})`}</span>
 </button>

 <button
 onClick={() => {
 setIsSelectionMode(false);
 setSelectedMediaIds(new Set());
 }}
 className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
 title="Exit selection mode"
 >
 <X className="w-4 h-4" />
 </button>
 </div>
 </div>
 </div>
 )}

 {/* Lightbox Modal for Full Image View */}
 {lightboxImage && (
 <div
 onClick={() => setLightboxImage(null)}
 className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
 >
 <div className="relative max-w-4xl max-h-[90vh] w-full flex items-center justify-center">
 <button
 onClick={() => setLightboxImage(null)}
 className="absolute top-2 right-2 p-2 rounded-full bg-black/70 text-white hover:bg-sl-green transition-colors"
 >
 <X className="w-6 h-6" />
 </button>
 <img
 src={lightboxImage}
 alt="Full view"
 className="max-w-full max-h-[85vh] rounded-xl object-contain shadow-2xl border border-white/20"
 />
 </div>
 </div>
 )}

 {/* Batch Upload Modal (Only accessible by Media Personnel & Admins) */}
 {canUploadMedia && (
 <ShuttleModal
 isOpen={isUploadOpen}
 onClose={() => {
 if (!isUploading) {
 setIsUploadOpen(false);
 setStagedFiles([]);
 setUploadPercent(0);
 }
 }}
 title="Upload Video Vlogs & Match Photos (Batch Supported)"
 >
 <form onSubmit={handleUploadSubmit} className="space-y-4">
 {/* Mode Switcher: File Upload vs Link */}
 <div className="flex items-center justify-between p-1 bg-sl-bg rounded-xl border border-sl-border">
 <button
 type="button"
 onClick={() => setUploadMode('file')}
 className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-colors flex items-center justify-center gap-1.5 ${
 uploadMode === 'file' ? 'bg-sl-green text-white shadow-sm' : 'text-sl-muted hover:text-sl-foreground'
 }`}
 >
 <Upload className="w-3.5 h-3.5" /> Batch File Upload ({stagedFiles.length})
 </button>
 <button
 type="button"
 onClick={() => setUploadMode('url')}
 className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-colors flex items-center justify-center gap-1.5 ${
 uploadMode === 'url' ? 'bg-sl-green text-white shadow-sm' : 'text-sl-muted hover:text-sl-foreground'
 }`}
 >
 <LinkIcon className="w-3.5 h-3.5" /> Web Link / YouTube
 </button>
 </div>

 {uploadMode === 'file' ? (
 <div className="space-y-3">
 <input
 type="file"
 ref={fileInputRef}
 onChange={handleFileSelect}
 multiple
 accept="video/mp4,video/webm,video/quicktime,video/x-m4v,image/png,image/jpeg,image/jpg,image/webp"
 className="hidden"
 />

 {/* Staged File List */}
 {stagedFiles.length > 0 ? (
 <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
 <div className="flex items-center justify-between">
 <span className="text-[11px] font-black uppercase text-sl-green tracking-wider flex items-center gap-1.5">
 <Layers className="w-3.5 h-3.5" /> Staged Queue ({stagedFiles.length} files)
 </span>
 <button
 type="button"
 onClick={() => fileInputRef.current?.click()}
 className="text-xs font-bold text-sl-green hover:underline flex items-center gap-1"
 >
 <Plus className="w-3 h-3" /> Add More
 </button>
 </div>

 <div className="space-y-2">
 {stagedFiles.map((item, idx) => (
 <div
 key={item.id}
 className="flex items-center gap-3 p-2.5 rounded-xl bg-sl-bg border border-sl-border"
 >
 {/* Thumbnail Preview */}
 <div className="w-12 h-12 rounded-lg bg-black/80 shrink-0 overflow-hidden flex items-center justify-center border border-sl-border">
 {item.type === 'video' ? (
 <Film className="w-5 h-5 text-sl-green" />
 ) : (
 <img src={item.previewUrl} alt="Preview" className="w-full h-full object-cover" />
 )}
 </div>

 {/* Title Input */}
 <div className="flex-1 min-w-0 space-y-1">
 <input
 type="text"
 value={item.title}
 onChange={(e) => updateStagedFileTitle(item.id, e.target.value)}
 placeholder="Clip title..."
 className="w-full text-xs font-bold text-sl-foreground bg-sl-panel px-2.5 py-1 rounded-lg border border-sl-border outline-none focus:border-sl-green"
 />
 <div className="flex items-center gap-2 text-[10px] text-sl-muted font-mono">
 <span className="uppercase font-bold text-sl-green">{item.type}</span>
 <span>•</span>
 <span>{(item.size / (1024 * 1024)).toFixed(1)} MB</span>
 </div>
 </div>

 {/* Remove button */}
 <button
 type="button"
 onClick={() => removeStagedFile(item.id)}
 disabled={isUploading}
 className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg transition-colors"
 >
 <X className="w-4 h-4" />
 </button>
 </div>
 ))}
 </div>
 </div>
 ) : (
 <div
 onClick={() => fileInputRef.current?.click()}
 className="cursor-pointer border-2 border-dashed border-sl-border hover:border-sl-green rounded-2xl p-6 text-center transition-all bg-sl-panel hover:bg-sl-green/5 flex flex-col items-center justify-center gap-2"
 >
 <div className="w-12 h-12 rounded-2xl bg-sl-green/10 text-sl-green flex items-center justify-center">
 <Film className="w-6 h-6" />
 </div>
 <div>
 <p className="text-sm font-black text-sl-foreground">
 Click or drag multiple videos / photos here
 </p>
 <p className="text-[11px] text-sl-muted mt-0.5">
 Supports batch uploads (MP4, WEBM, MOV, PNG, JPG up to 100MB each)
 </p>
 </div>
 </div>
 )}
 </div>
 ) : (
 <div className="space-y-3">
 <div className="space-y-2">
 <ShuttleInput
 label="Direct Video, YouTube, Vimeo or Image URL"
 value={newUrl}
 onChange={(e) => setNewUrl(e.target.value)}
 placeholder="https://www.youtube.com/watch?v=... or https://..."
 required
 />
 <ShuttleInput
 label="Media Title"
 value={urlTitle}
 onChange={(e) => setUrlTitle(e.target.value)}
 placeholder="e.g. UNN Semi-Final Highlights"
 required
 />
 <ShuttleInput
 label="Description (Optional)"
 value={urlDesc}
 onChange={(e) => setUrlDesc(e.target.value)}
 placeholder="Key rally details..."
 />
 </div>

 {/* Live Media URL Preview Box */}
 {newUrl.trim() && (() => {
 const parsedPreview = parseMediaSource(newUrl.trim());
 return (
 <div className="space-y-1.5 p-3 rounded-xl bg-sl-bg border border-sl-border">
 <div className="flex items-center justify-between">
 <span className="text-[11px] font-black uppercase text-sl-green tracking-wider flex items-center gap-1.5">
 <Sparkles className="w-3.5 h-3.5" /> Live Preview ({parsedPreview.kind.replace('_', ' ').toUpperCase()})
 </span>
 <span className="text-[10px] text-sl-muted font-mono">Format Detected</span>
 </div>

 <div className="relative aspect-video rounded-xl overflow-hidden bg-black/90 border border-sl-border flex items-center justify-center">
 {parsedPreview.kind === 'youtube' && parsedPreview.embedUrl ? (
 <iframe
 src={parsedPreview.embedUrl}
 title="YouTube Preview"
 className="w-full h-full"
 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
 />
 ) : parsedPreview.kind === 'vimeo' && parsedPreview.embedUrl ? (
 <iframe
 src={parsedPreview.embedUrl}
 title="Vimeo Preview"
 className="w-full h-full"
 allow="autoplay; fullscreen; picture-in-picture"
 />
 ) : parsedPreview.kind === 'direct_video' ? (
 <video
 src={newUrl.trim()}
 controls
 className="w-full h-full object-contain"
 />
 ) : parsedPreview.kind === 'image' ? (
 <img
 src={newUrl.trim()}
 alt="Preview"
 className="w-full h-full object-contain"
 />
 ) : (
 <div className="text-center p-4 space-y-1 text-xs text-sl-muted">
 <Film className="w-8 h-8 mx-auto text-sl-green opacity-80 animate-pulse" />
 <p className="font-bold text-sl-foreground">Direct Web Stream Link</p>
 <p className="text-[10px] text-sl-muted truncate max-w-xs">{newUrl.trim()}</p>
 </div>
 )}
 </div>
 </div>
 );
 })()}
 </div>
 )}

 {/* Global Category Selector */}
 <div className="space-y-1">
 <label className="text-xs font-black uppercase tracking-wider text-sl-foreground">
 Category
 </label>
 <select
 value={newCategory}
 onChange={(e: any) => setNewCategory(e.target.value)}
 className="w-full p-2.5 rounded-xl bg-sl-bg border border-sl-border text-xs font-bold text-sl-foreground focus:border-sl-green outline-none"
 >
 <option value="training">Training Drills</option>
 <option value="highlights">Match Highlights</option>
 <option value="competition">Tournament Matches</option>
 <option value="social">Club Events & Photos</option>
 </select>
 </div>

 {/* Upload Status & Percentage Bar */}
 {isUploading && (
 <div className="space-y-2 p-3.5 rounded-xl bg-sl-bg border border-sl-green/30">
 <div className="flex items-center justify-between text-xs font-bold">
 <span className="text-sl-green flex items-center gap-1.5 animate-pulse">
 <Loader2 className="w-3.5 h-3.5 animate-spin" />
 {uploadMode === 'file'
 ? `Uploading item ${currentUploadIndex} of ${stagedFiles.length}: ${currentUploadingName}`
 : 'Publishing stream link...'}
 </span>
 <span className="font-mono text-sl-green text-xs font-black">{uploadPercent}%</span>
 </div>

 {/* Animated Progress Bar */}
 <div className="w-full h-3 bg-sl-panel rounded-full overflow-hidden border border-sl-border p-0.5">
 <div
 className="h-full bg-gradient-to-r from-sl-green to-sl-green-glow rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(0,230,118,0.5)]"
 style={{ width: `${uploadPercent}%` }}
 />
 </div>
 </div>
 )}

 <div className="flex gap-3 pt-2">
 <ShuttleButton
 type="button"
 variant="white"
 onClick={() => {
 setIsUploadOpen(false);
 setStagedFiles([]);
 setUploadPercent(0);
 }}
 disabled={isUploading}
 className="flex-1"
 >
 Cancel
 </ShuttleButton>
 <ShuttleButton
 type="submit"
 variant="green"
 disabled={isUploading || (uploadMode === 'file' && stagedFiles.length === 0)}
 className="flex-1 font-black"
 >
 {isUploading
 ? `Uploading (${uploadPercent}%)...`
 : uploadMode === 'file'
 ? `Publish ${stagedFiles.length > 0 ? `(${stagedFiles.length} Files)` : ''} `
 : 'Publish Media '}
 </ShuttleButton>
 </div>
 </form>
 </ShuttleModal>
 )}
 </div>
 );
}
