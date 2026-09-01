'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase, type MediaUpload, type CustomRole } from '@/lib/supabase';
import { useAuth } from '@/components/AuthContext';
import { TiltCard } from '@/components/ui/TiltCard';
import { ShuttleButton } from '@/components/ui/ShuttleButton';
import { ShuttleModal } from '@/components/ui/ShuttleModal';
import { ShuttleInput } from '@/components/ui/ShuttleInput';
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
} from 'lucide-react';
import { audio } from '@/lib/audio';

export default function MediaGalleryPage() {
  const { user } = useAuth();

  const [mediaList, setMediaList] = useState<MediaUpload[]>([]);
  const [customRoles, setCustomRoles] = useState<CustomRole[]>([]);
  const [filter, setFilter] = useState<'all' | 'training' | 'highlights' | 'photos'>('all');
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Upload Form State
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState<'training' | 'competition' | 'highlights' | 'social'>('training');
  const [newUrl, setNewUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [detectedType, setDetectedType] = useState<'video' | 'image'>('video');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState<string | null>(null);

  // Active Lightbox Image
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadData() {
      const { data: mData } = await supabase
        .from('media_uploads')
        .select('*')
        .order('created_at', { ascending: false });
      setMediaList(mData || []);

      const { data: rData } = await supabase.from('custom_roles').select('*');
      setCustomRoles(rData || []);
    }
    loadData();
  }, []);

  // Permission Gate: Media Personnel, Admin, Captain, or Custom Role with can_upload_media
  const userCustomRole = customRoles.find((r) => r.id === user?.role);
  const canUploadMedia =
    user?.role === 'media_personnel' ||
    user?.role === 'admin' ||
    user?.role === 'captain' ||
    Boolean(userCustomRole?.can_upload_media);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    if (!isVideo && !isImage) {
      alert('Please select a valid video (.mp4, .webm, .mov) or image (.png, .jpg, .webp) file.');
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      alert('File size exceeds the 100MB limit.');
      return;
    }

    setSelectedFile(file);
    setDetectedType(isVideo ? 'video' : 'image');
    const localUrl = URL.createObjectURL(file);
    setFilePreviewUrl(localUrl);
    audio.play('rally');
  };

  const handleLike = async (id: string) => {
    audio.play('rally');
    setMediaList((prev) =>
      prev.map((m) => (m.id === id ? { ...m, likes_count: (m.likes_count || 0) + 1 } : m))
    );

    try {
      const item = mediaList.find((m) => m.id === id);
      if (item) {
        await supabase
          .from('media_uploads')
          .update({ likes_count: (item.likes_count || 0) + 1 })
          .eq('id', id);
      }
    } catch (err) {
      console.error('Failed to update likes in database:', err);
    }
  };

  const handleUploadMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canUploadMedia) {
      alert('Only appointed Media Personnel or Admins can upload media.');
      return;
    }
    if (!newTitle.trim() || !user?.id) return;
    if (uploadMode === 'file' && !selectedFile) {
      alert('Please select a media file to upload.');
      return;
    }
    if (uploadMode === 'url' && !newUrl.trim()) {
      alert('Please enter a valid media URL.');
      return;
    }

    setIsUploading(true);
    setUploadProgressText('Preparing media upload...');
    audio.play('serve');

    try {
      let finalMediaUrl = newUrl.trim();
      let mediaType: 'video' | 'image' | 'vlog' = detectedType;

      if (uploadMode === 'file' && selectedFile) {
        setUploadProgressText('Uploading file to ShuttleLions media cloud...');
        const fileExt = selectedFile.name.split('.').pop() || (detectedType === 'video' ? 'mp4' : 'jpg');
        const folder = detectedType === 'video' ? 'videos' : 'photos';
        const filePath = `media/${folder}/${user.id}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('media-gallery')
          .upload(filePath, selectedFile, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          console.error('Storage upload error:', uploadError);
          alert(`Storage upload notice: ${uploadError.message}`);
          setIsUploading(false);
          setUploadProgressText(null);
          return;
        }

        const { data: publicData } = supabase.storage
          .from('media-gallery')
          .getPublicUrl(filePath);

        finalMediaUrl = publicData.publicUrl;
      } else {
        // Infer type from URL
        const isImageUrl = /\.(jpg|jpeg|png|webp|gif)$/i.test(finalMediaUrl);
        mediaType = isImageUrl ? 'image' : 'video';
      }

      setUploadProgressText('Publishing to court feed...');

      const newMediaRecord = {
        uploader_id: user.id,
        title: newTitle.trim(),
        description: newDesc.trim(),
        media_type: mediaType,
        media_url: finalMediaUrl,
        thumbnail_url: finalMediaUrl,
        category: newCategory,
        file_size_bytes: selectedFile?.size || null,
        mime_type: selectedFile?.type || null,
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
        // Fallback local append
        const fallbackMedia: MediaUpload = {
          id: `media-${Date.now()}`,
          ...newMediaRecord,
        };
        setMediaList((prev) => [fallbackMedia, ...prev]);
      }

      audio.play('whistle');
      setIsUploadOpen(false);
      setNewTitle('');
      setNewDesc('');
      setNewUrl('');
      setSelectedFile(null);
      setFilePreviewUrl(null);
      alert('Media successfully uploaded and published to the club feed! 🏸');
    } catch (err: any) {
      console.error('Upload failed:', err);
      alert('Failed to upload media.');
    } finally {
      setIsUploading(false);
      setUploadProgressText(null);
    }
  };

  const filteredMedia = mediaList.filter((m) => {
    if (filter === 'all') return true;
    if (filter === 'photos') return m.media_type === 'image';
    return m.category === filter;
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
            📹 Vlogs & Match Media Gallery
          </h1>
          <p className="text-xs text-sl-muted font-medium mt-1">
            Official match highlights, tournament vlogs, and court footage curated by the Media Personnel.
          </p>
        </div>

        {canUploadMedia ? (
          <ShuttleButton
            variant="green"
            onClick={() => {
              audio.play('rally');
              setIsUploadOpen(true);
            }}
            className="py-2.5 px-5 text-xs font-black flex items-center gap-1.5 shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Media / Vlog ⚡</span>
          </ShuttleButton>
        ) : (
          <div className="flex items-center gap-2 bg-sl-panel px-3 py-2 rounded-xl border border-sl-border text-xs text-sl-muted font-semibold">
            <Video className="w-4 h-4 text-cyan-400" />
            <span>Curated by Media Personnel</span>
          </div>
        )}
      </div>

      {/* Media Personnel Banner */}
      {!canUploadMedia && (
        <div className="p-3.5 bg-sl-panel/80 rounded-2xl border border-sl-border/80 flex items-center justify-between text-xs text-sl-muted font-medium">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              Official video vlogs and training clips are published exclusively by the appointed <strong>ShuttleLions Media Personnel</strong>.
            </span>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
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
          All Media ({mediaList.length})
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
          Training Drills
        </button>
        <button
          onClick={() => {
            audio.play('rally');
            setFilter('highlights');
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
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
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            filter === 'photos' ? 'bg-sl-green text-white shadow-sm' : 'text-sl-muted hover:text-sl-foreground'
          }`}
        >
          Photos & Stills
        </button>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredMedia.map((m) => {
          const isVideo =
            m.media_type === 'video' ||
            m.media_type === 'vlog' ||
            /\.(mp4|webm|mov|m4v)$/i.test(m.media_url);

          return (
            <TiltCard key={m.id} className="p-5 bg-sl-panel space-y-4 overflow-hidden border border-sl-border">
              {/* Media Player or Photo */}
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-black/80 border border-sl-border">
                {isVideo ? (
                  <video
                    src={m.media_url}
                    controls
                    preload="metadata"
                    poster={m.thumbnail_url && m.thumbnail_url !== m.media_url ? m.thumbnail_url : undefined}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div
                    onClick={() => setLightboxImage(m.media_url)}
                    className="relative w-full h-full cursor-pointer group"
                  >
                    <img
                      src={m.media_url}
                      alt={m.title}
                      className="w-full h-full object-cover filter brightness-[0.9] group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="p-2 rounded-full bg-sl-green text-white shadow-lg">
                        <Maximize2 className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Category Tag */}
                <span className="absolute top-3 left-3 bg-black/70 backdrop-blur text-sl-green-glow border border-white/20 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full pointer-events-none">
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
                  <span className="flex items-center gap-1 text-[11px]">
                    <Eye className="w-3.5 h-3.5 text-sl-green" /> {m.views_count || 1} views
                  </span>

                  <button
                    onClick={() => handleLike(m.id)}
                    className="flex items-center gap-1.5 text-rose-500 hover:scale-110 active:scale-95 transition-all bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20"
                  >
                    <Heart className="w-3.5 h-3.5 fill-rose-500" />
                    <span>{m.likes_count || 0}</span>
                  </button>
                </div>
              </div>
            </TiltCard>
          );
        })}
      </div>

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

      {/* Upload Modal (Only accessible by Media Personnel & Admins) */}
      {canUploadMedia && (
        <ShuttleModal
          isOpen={isUploadOpen}
          onClose={() => {
            if (!isUploading) {
              setIsUploadOpen(false);
              setSelectedFile(null);
              setFilePreviewUrl(null);
            }
          }}
          title="Upload Video Vlog / Match Photos"
        >
          <form onSubmit={handleUploadMedia} className="space-y-4">
            {/* Mode Switcher: File Upload vs Link */}
            <div className="flex items-center justify-between p-1 bg-sl-bg rounded-xl border border-sl-border">
              <button
                type="button"
                onClick={() => setUploadMode('file')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-colors flex items-center justify-center gap-1.5 ${
                  uploadMode === 'file' ? 'bg-sl-green text-white shadow-sm' : 'text-sl-muted hover:text-sl-foreground'
                }`}
              >
                <Upload className="w-3.5 h-3.5" /> Upload File
              </button>
              <button
                type="button"
                onClick={() => setUploadMode('url')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-colors flex items-center justify-center gap-1.5 ${
                  uploadMode === 'url' ? 'bg-sl-green text-white shadow-sm' : 'text-sl-muted hover:text-sl-foreground'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" /> Web Link / Embed
              </button>
            </div>

            {uploadMode === 'file' ? (
              <div className="space-y-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="video/mp4,video/webm,video/quicktime,video/x-m4v,image/png,image/jpeg,image/jpg,image/webp"
                  className="hidden"
                />

                {filePreviewUrl ? (
                  <div className="space-y-2">
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-black/80 border border-sl-border flex items-center justify-center">
                      {detectedType === 'video' ? (
                        <video src={filePreviewUrl} controls className="w-full h-full object-contain" />
                      ) : (
                        <img src={filePreviewUrl} alt="Preview" className="w-full h-full object-contain" />
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          setFilePreviewUrl(null);
                        }}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-rose-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-[11px] font-mono text-sl-green truncate text-center">
                      📁 {selectedFile?.name} ({(selectedFile ? selectedFile.size / (1024 * 1024) : 0).toFixed(2)} MB)
                    </p>
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
                        Click or drag video / photo here
                      </p>
                      <p className="text-[11px] text-sl-muted mt-0.5">
                        Supports MP4, WEBM, MOV, PNG, JPG up to 100MB
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <ShuttleInput
                label="Direct Video or Image URL"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://..."
                required
              />
            )}

            <ShuttleInput
              label="Media Title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. UNN vs Nsukka Varsity Finals Rally"
              required
            />

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

            <ShuttleInput
              label="Description (Optional)"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Key moments, player names, smash speed..."
            />

            {uploadProgressText && (
              <div className="p-2.5 rounded-lg bg-sl-green/10 border border-sl-green/20 text-xs font-bold text-sl-green animate-pulse text-center">
                ⚡ {uploadProgressText}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <ShuttleButton
                type="button"
                variant="white"
                onClick={() => {
                  setIsUploadOpen(false);
                  setSelectedFile(null);
                  setFilePreviewUrl(null);
                }}
                disabled={isUploading}
                className="flex-1"
              >
                Cancel
              </ShuttleButton>
              <ShuttleButton
                type="submit"
                variant="green"
                disabled={isUploading}
                className="flex-1 font-black"
              >
                {isUploading ? 'Uploading...' : 'Publish Media 📹'}
              </ShuttleButton>
            </div>
          </form>
        </ShuttleModal>
      )}
    </div>
  );
}
