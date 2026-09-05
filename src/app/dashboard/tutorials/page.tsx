'use client';

import { useState, useEffect } from 'react';
import { supabase, type Tutorial } from '@/lib/supabase';
import { useCachedQuery } from '@/lib/client-cache';
import { TiltCard } from '@/components/ui/TiltCard';
import { BookOpen, Video, Clock, CheckCircle2, Sparkles } from 'lucide-react';
import { audio } from '@/lib/audio';

export default function TutorialsPage() {
 const { data: tutorials } = useCachedQuery<Tutorial[]>({
   key: 'tutorials_list',
   initialFallback: [],
   fetcher: async () => {
     const { data } = await supabase.from('tutorials').select('*').order('created_at', { ascending: true });
     return data || [];
   },
 });
 const [activeTutorial, setActiveTutorial] = useState<Tutorial | null>(null);

 useEffect(() => {
   if (tutorials && tutorials.length > 0 && !activeTutorial) {
     setActiveTutorial(tutorials[0]);
   }
 }, [tutorials, activeTutorial]);

 return (
 <div className="space-y-8">
 {/* Header */}
 <div>
 <h1
 className="text-2xl sm:text-3xl font-black uppercase text-sl-foreground"
 style={{ fontFamily: 'var(--font-title)' }}
 >
 Badminton Drill Tutorials & Theory
 </h1>
 <p className="text-xs text-sl-muted font-medium mt-1">
 Master the biomechanics of power smashes, 6-corner footwork, and doubles court rotation.
 </p>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
 {/* Left: Tutorials List */}
 <div className="lg:col-span-5 space-y-4">
 <span className="text-[10px] font-black text-sl-muted uppercase tracking-widest px-2">
 Drill Guides
 </span>
 <div className="space-y-3">
 {tutorials.map((tut) => {
 const isActive = activeTutorial?.id === tut.id;

 return (
 <button
 key={tut.id}
 onClick={() => {
 audio.play('rally');
 setActiveTutorial(tut);
 }}
 className={`w-full text-left p-4 rounded-2xl border-2 transition-all space-y-2 ${
 isActive
 ? 'bg-sl-panel border-sl-green shadow-lg'
 : 'bg-sl-panel/60 border-sl-border hover:border-sl-green/40'
 }`}
 >
 <div className="flex items-center justify-between">
 <span
 className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
 tut.difficulty === 'beginner'
 ? 'bg-sl-green/15 text-sl-green'
 : 'bg-amber-500/15 text-amber-500'
 }`}
 >
 {tut.category} • {tut.difficulty}
 </span>
 <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-sl-muted">
 <Clock className="w-3 h-3 text-sl-green" /> {tut.read_time_min}m read
 </span>
 </div>

 <h3 className="text-sm font-black text-sl-foreground">{tut.title}</h3>
 <p className="text-xs text-sl-muted line-clamp-2 font-medium">{tut.summary}</p>
 </button>
 );
 })}
 </div>
 </div>

 {/* Right: Active Tutorial Viewer with Embedded Video */}
 <div className="lg:col-span-7">
 {activeTutorial ? (
 <TiltCard className="p-6 sm:p-8 bg-sl-panel space-y-6">
 <div className="space-y-2">
 <span className="text-[10px] font-black uppercase bg-sl-green/20 text-sl-green px-2.5 py-0.5 rounded-full border border-sl-green/30">
 {activeTutorial.category} • {activeTutorial.difficulty}
 </span>
 <h2 className="text-xl sm:text-2xl font-black text-sl-foreground">
 {activeTutorial.title}
 </h2>
 </div>

 {/* Video Embed */}
 {activeTutorial.video_url && (
 <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-sl-border">
 <iframe
 src={activeTutorial.video_url}
 title={activeTutorial.title}
 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
 allowFullScreen
 className="w-full h-full border-0"
 />
 </div>
 )}

 {/* Markdown Content */}
 <div className="prose prose-invert max-w-none text-xs sm:text-sm text-sl-foreground/90 space-y-3 font-medium leading-relaxed bg-sl-bg p-6 rounded-2xl border border-sl-border">
 <div className="whitespace-pre-line">{activeTutorial.content_md}</div>
 </div>
 </TiltCard>
 ) : (
 <div className="shuttle-panel p-12 text-center text-sl-muted">
 Select a tutorial to begin studying.
 </div>
 )}
 </div>
 </div>
 </div>
 );
}
