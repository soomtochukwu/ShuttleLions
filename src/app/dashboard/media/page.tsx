'use client';

import { useState, useEffect } from 'react';
import { supabase, type MediaUpload, type CustomRole } from '@/lib/supabase';
import { useAuth } from '@/components/AuthContext';
import { TiltCard } from '@/components/ui/TiltCard';
import { ShuttleButton } from '@/components/ui/ShuttleButton';
import { ShuttleModal } from '@/components/ui/ShuttleModal';
import { ShuttleInput } from '@/components/ui/ShuttleInput';
import { Video, Heart, Eye, Plus, Play, Sparkles, Shield, Lock } from 'lucide-react';
import { audio } from '@/lib/audio';

export default function MediaGalleryPage() {
  const { user } = useAuth();

  const [mediaList, setMediaList] = useState<MediaUpload[]>([]);
  const [customRoles, setCustomRoles] = useState<CustomRole[]>([]);
  const [filter, setFilter] = useState<'all' | 'training' | 'highlights'>('all');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newCategory, setNewCategory] = useState<'training' | 'competition' | 'highlights'>('training');

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

  const handleLike = (id: string) => {
    audio.play('rally');
    setMediaList((prev) =>
      prev.map((m) => (m.id === id ? { ...m, likes_count: m.likes_count + 1 } : m))
    );
  };

  const handleUploadMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canUploadMedia) {
      alert('Only appointed Media Personnel or Admins can upload media.');
      return;
    }
    if (!newTitle.trim() || !newUrl.trim() || !user?.id) return;

    audio.play('serve');
    const newMedia: MediaUpload = {
      id: `media-${Date.now()}`,
      uploader_id: user.id,
      title: newTitle.trim(),
      description: newDesc.trim(),
      media_type: 'video',
      media_url: newUrl.trim(),
      thumbnail_url: newUrl.trim(),
      category: newCategory,
      likes_count: 0,
      views_count: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setMediaList((prev) => [newMedia, ...prev]);
    setIsUploadOpen(false);
    setNewTitle('');
    setNewDesc('');
    setNewUrl('');
    alert('Vlog/Media uploaded to community feed!');
  };

  const filteredMedia = mediaList.filter((m) => {
    if (filter === 'all') return true;
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
            <span>Upload Vlog / Clip ⚡</span>
          </ShuttleButton>
        ) : (
          <div className="flex items-center gap-2 bg-sl-panel px-3 py-2 rounded-xl border border-sl-border text-xs text-sl-muted font-semibold">
            <Video className="w-4 h-4 text-cyan-400" />
            <span>Curated by Media Personnel</span>
          </div>
        )}
      </div>

      {/* Non-Media Notice if regular member */}
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
      <div className="flex items-center gap-2 bg-sl-panel p-1 rounded-xl border border-sl-border w-fit">
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
      </div>

      {/* Media Grid with 3D Tilt */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredMedia.map((m) => (
          <TiltCard key={m.id} className="p-5 bg-sl-panel space-y-4 overflow-hidden">
            {/* Media Image / Video Poster */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-black/60 border border-sl-border group">
              <img
                src={m.thumbnail_url || m.media_url}
                alt={m.title}
                className="w-full h-full object-cover filter brightness-[0.85] group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

              {/* Play Badge Icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-sl-green/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Play className="w-5 h-5 fill-white ml-0.5" />
                </div>
              </div>

              {/* Category Tag */}
              <span className="absolute top-3 left-3 bg-black/60 backdrop-blur text-sl-green-glow border border-white/20 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                {m.category}
              </span>
            </div>

            {/* Metadata & Actions */}
            <div className="space-y-2">
              <h3 className="text-base font-black text-sl-foreground">{m.title}</h3>
              <p className="text-xs text-sl-muted leading-relaxed font-medium line-clamp-2">
                {m.description}
              </p>

              <div className="flex items-center justify-between pt-3 border-t border-sl-border/40 text-xs font-bold text-sl-muted">
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-sl-green" /> {m.views_count} views
                </span>

                <button
                  onClick={() => handleLike(m.id)}
                  className="flex items-center gap-1.5 text-rose-500 hover:scale-110 active:scale-95 transition-all bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20"
                >
                  <Heart className="w-3.5 h-3.5 fill-rose-500" />
                  <span>{m.likes_count}</span>
                </button>
              </div>
            </div>
          </TiltCard>
        ))}
      </div>

      {/* Upload Modal (Only accessible if permitted) */}
      {canUploadMedia && (
        <ShuttleModal
          isOpen={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
          title="Upload Vlog or Match Highlight (Media Personnel)"
        >
          <form onSubmit={handleUploadMedia} className="space-y-4">
            <ShuttleInput
              label="Title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. UNN Semi-Final Rally Highlights"
              required
            />

            <ShuttleInput
              label="Media / Video / Image URL"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://..."
              required
            />

            <ShuttleInput
              label="Description"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Short description of the match rally..."
            />

            <div className="flex gap-3 pt-2">
              <ShuttleButton
                type="button"
                variant="white"
                onClick={() => setIsUploadOpen(false)}
                className="flex-1"
              >
                Cancel
              </ShuttleButton>
              <ShuttleButton type="submit" variant="green" className="flex-1 font-black">
                Publish Media 📹
              </ShuttleButton>
            </div>
          </form>
        </ShuttleModal>
      )}
    </div>
  );
}
