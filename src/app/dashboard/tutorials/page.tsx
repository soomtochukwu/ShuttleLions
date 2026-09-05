'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { supabase, type Tutorial } from '@/lib/supabase';
import { useCachedQuery } from '@/lib/client-cache';
import { BADMINTON_TUTORIALS, type BadmintonTutorial } from '@/data/badminton-tutorials-data';
import { CourtBoundaryVisualizer } from '@/components/tutorials/CourtBoundaryVisualizer';
import { ShotTrajectoryVisualizer } from '@/components/tutorials/ShotTrajectoryVisualizer';
import { TiltCard } from '@/components/ui/TiltCard';
import { audio } from '@/lib/audio';
import {
  BookOpen,
  Clock,
  CheckCircle2,
  Sparkles,
  Search,
  Filter,
  Maximize2,
  Activity,
  ChevronRight,
  Shield,
  Zap,
  Target,
  Trophy,
  Dumbbell,
  Lightbulb,
  Award,
} from 'lucide-react';

type VisualToolTab = 'none' | 'court_boundaries' | 'shot_trajectories';

export default function TutorialsPage() {
  // 1. Dual-layer SWR query with instant fallback to comprehensive local curriculum
  const { data: dbTutorials } = useCachedQuery<Tutorial[]>({
    key: 'tutorials_list',
    initialFallback: [],
    fetcher: async () => {
      const { data } = await supabase
        .from('tutorials')
        .select('*')
        .order('created_at', { ascending: true });
      return data || [];
    },
  });

  // Combine database rows if available with canonical rich dataset
  const allTutorials: BadmintonTutorial[] = useMemo(() => {
    if (!dbTutorials || dbTutorials.length === 0) {
      return BADMINTON_TUTORIALS;
    }
    // If database has tutorials, merge any missing ones from canonical list
    const dbIds = new Set(dbTutorials.map((t) => t.id));
    const merged: BadmintonTutorial[] = dbTutorials.map((d) => {
      const match = BADMINTON_TUTORIALS.find((b) => b.id === d.id || b.title === d.title);
      return {
        id: d.id,
        title: d.title,
        subtitle: match?.subtitle || d.summary,
        category: (d.category as any) || 'basics',
        difficulty: (d.difficulty as any) || 'beginner',
        read_time_min: d.read_time_min || 5,
        summary: d.summary || '',
        hero_image: match?.hero_image || d.thumbnail_url || undefined,
        secondary_image: match?.secondary_image,
        video_url: d.video_url || undefined,
        key_takeaways: match?.key_takeaways || [
          'Read through each technical section thoroughly before testing on court.',
          'Execute drills with proper footwork recovery.',
        ],
        coaching_drills: match?.coaching_drills || ['Perform 20 repetitions on court with a training partner.'],
        sections: match?.sections || [
          {
            heading: 'Technical Breakdown',
            content: d.content_md,
          },
        ],
      };
    });

    // Add any canonical tutorials not in the DB
    BADMINTON_TUTORIALS.forEach((item) => {
      if (!dbIds.has(item.id)) {
        merged.push(item);
      }
    });

    return merged;
  }, [dbTutorials]);

  const [activeTutorialId, setActiveTutorialId] = useState<string>(BADMINTON_TUTORIALS[0].id);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeVisualTool, setActiveVisualTool] = useState<VisualToolTab>('court_boundaries');

  // Filtered tutorials
  const filteredTutorials = useMemo(() => {
    return allTutorials.filter((tut) => {
      const matchesCategory =
        selectedCategory === 'all' ? true : tut.category === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        tut.title.toLowerCase().includes(q) ||
        tut.subtitle.toLowerCase().includes(q) ||
        tut.summary.toLowerCase().includes(q) ||
        tut.key_takeaways.some((k) => k.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [allTutorials, selectedCategory, searchQuery]);

  const activeTutorial = useMemo(() => {
    return (
      allTutorials.find((t) => t.id === activeTutorialId) ||
      filteredTutorials[0] ||
      allTutorials[0]
    );
  }, [allTutorials, activeTutorialId, filteredTutorials]);

  const handleSelectTutorial = (tut: BadmintonTutorial) => {
    audio.haptic('tap');
    audio.play('rally');
    setActiveTutorialId(tut.id);
  };

  const handleToggleVisualTool = (tool: VisualToolTab) => {
    audio.haptic('tap');
    audio.play('netDrop');
    setActiveVisualTool((prev) => (prev === tool ? 'none' : tool));
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="shuttle-panel p-6 sm:p-8 bg-sl-panel border border-sl-border relative overflow-hidden">
        <div className="max-w-3xl space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase text-sl-green bg-sl-green/15 border border-sl-green/30 px-3 py-0.5 rounded-full font-mono tracking-wider">
              UNN Varsity Academy
            </span>
            <span className="text-[10px] font-mono text-sl-muted">BWF Standardized Curriculum</span>
          </div>

          <h1
            className="text-2xl sm:text-4xl font-black uppercase text-sl-foreground"
            style={{ fontFamily: 'var(--font-title)' }}
          >
            Badminton Mastery & BWF Rules Masterclass
          </h1>
          <p className="text-xs sm:text-sm text-sl-muted font-medium leading-relaxed">
            Step-by-step technical guides, biomechanical stroke breakdowns, official 21-point rally scoring laws, and interactive court simulators featuring ShuttleLions varsity athletes.
          </p>
        </div>

        {/* Visual Tools Launcher Bar */}
        <div className="pt-6 border-t border-sl-border/40 mt-6 flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold text-sl-foreground uppercase flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-sl-green" /> Interactive Tools:
          </span>

          <button
            type="button"
            onClick={() => handleToggleVisualTool('court_boundaries')}
            className={`px-3.5 py-1.5 rounded-xl border text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
              activeVisualTool === 'court_boundaries'
                ? 'bg-sl-green text-white border-sl-green shadow-md'
                : 'bg-sl-bg text-sl-muted hover:text-sl-foreground border-sl-border hover:border-sl-green/40'
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Court Boundary Visualizer</span>
          </button>

          <button
            type="button"
            onClick={() => handleToggleVisualTool('shot_trajectories')}
            className={`px-3.5 py-1.5 rounded-xl border text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
              activeVisualTool === 'shot_trajectories'
                ? 'bg-sl-green text-white border-sl-green shadow-md'
                : 'bg-sl-bg text-sl-muted hover:text-sl-foreground border-sl-border hover:border-sl-green/40'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Shot Trajectory Simulator</span>
          </button>
        </div>
      </div>

      {/* Active Interactive Visual Tool Viewer */}
      {activeVisualTool === 'court_boundaries' && (
        <div className="transition-all duration-300">
          <CourtBoundaryVisualizer />
        </div>
      )}

      {activeVisualTool === 'shot_trajectories' && (
        <div className="transition-all duration-300">
          <ShotTrajectoryVisualizer />
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {[
            { id: 'all', label: 'All Modules' },
            { id: 'rules', label: 'BWF Rules & Scoring' },
            { id: 'basics', label: 'Grips & Stance' },
            { id: 'strokes', label: 'Core Strokes' },
            { id: 'footwork', label: 'Footwork Engine' },
            { id: 'tactics', label: 'Match Tactics' },
          ].map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  audio.haptic('tap');
                  setSelectedCategory(cat.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-sl-green text-white shadow-sm'
                    : 'bg-sl-panel border border-sl-border text-sl-muted hover:text-sl-foreground'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-sl-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search rules, smashes, grips..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-sl-panel border border-sl-border text-xs text-sl-foreground placeholder:text-sl-muted focus:outline-none focus:border-sl-green"
          />
        </div>
      </div>

      {/* Main Instructional Content Area: 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Module Index List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-black text-sl-muted uppercase tracking-wider">
              Curriculum Lessons ({filteredTutorials.length})
            </span>
            <span className="text-[10px] text-sl-green font-bold">UNN Official Series</span>
          </div>

          <div className="space-y-3">
            {filteredTutorials.map((tut) => {
              const isActive = activeTutorial?.id === tut.id;
              return (
                <div
                  key={tut.id}
                  onClick={() => handleSelectTutorial(tut)}
                  className={`cursor-pointer p-4 sm:p-5 rounded-2xl border-2 transition-all space-y-2.5 relative select-none ${
                    isActive
                      ? 'bg-sl-panel border-sl-green shadow-xl'
                      : 'bg-sl-panel/60 border-sl-border hover:border-sl-green/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                        tut.category === 'rules'
                          ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                          : tut.category === 'strokes'
                          ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                          : tut.category === 'tactics'
                          ? 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                          : 'bg-sl-green/15 text-sl-green border-sl-green/30'
                      }`}
                    >
                      {tut.category} • {tut.difficulty}
                    </span>

                    <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-sl-muted">
                      <Clock className="w-3 h-3 text-sl-green" /> {tut.read_time_min}m study
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-black text-sl-foreground line-clamp-1">
                      {tut.title}
                    </h3>
                    <p className="text-xs text-sl-muted line-clamp-2 mt-0.5 font-medium leading-relaxed">
                      {tut.subtitle || tut.summary}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-sl-border/40 text-[11px]">
                    <span className="text-sl-muted font-bold">
                      {tut.sections.length} Technical Sections
                    </span>
                    <span
                      className={`font-black uppercase flex items-center gap-1 ${
                        isActive ? 'text-sl-green' : 'text-sl-muted'
                      }`}
                    >
                      <span>Study Guide</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}

            {filteredTutorials.length === 0 && (
              <div className="shuttle-panel p-8 text-center text-sl-muted text-xs space-y-2">
                <Search className="w-6 h-6 mx-auto text-sl-muted" />
                <p>No tutorials found matching &quot;{searchQuery}&quot;.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="text-sl-green font-bold hover:underline cursor-pointer"
                >
                  Clear search filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Active Tutorial Master Reader */}
        <div className="lg:col-span-7">
          {activeTutorial ? (
            <div className="shuttle-panel p-6 sm:p-8 bg-sl-panel border border-sl-border space-y-6">
              {/* Module Header */}
              <div className="space-y-3 border-b border-sl-border/40 pb-5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase bg-sl-green/20 text-sl-green px-3 py-1 rounded-full border border-sl-green/30 font-mono">
                    {activeTutorial.category} • {activeTutorial.difficulty}
                  </span>
                  <span className="text-xs text-sl-muted font-mono flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-sl-green" /> {activeTutorial.read_time_min} min read
                  </span>
                </div>

                <h2
                  className="text-xl sm:text-2xl font-black uppercase text-sl-foreground"
                  style={{ fontFamily: 'var(--font-title)' }}
                >
                  {activeTutorial.title}
                </h2>
                <p className="text-xs sm:text-sm text-sl-muted font-medium leading-relaxed">
                  {activeTutorial.subtitle}
                </p>
              </div>

              {/* Hero Instructional Image (featuring ShuttleLions Varsity Athletes) */}
              {activeTutorial.hero_image && (
                <div className="space-y-2">
                  <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden border-2 border-sl-border bg-black shadow-lg">
                    <img
                      src={activeTutorial.hero_image}
                      alt={activeTutorial.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-md px-3 py-1 rounded-lg border border-white/20 text-[10px] font-black uppercase text-sl-green-glow flex items-center gap-1.5">
                      <Shield className="w-3 h-3 text-sl-green" />
                      <span>ShuttleLions Varsity Demonstration</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Key Takeaways Card */}
              {activeTutorial.key_takeaways && activeTutorial.key_takeaways.length > 0 && (
                <div className="p-4 sm:p-5 rounded-2xl bg-sl-green/10 border border-sl-green/30 space-y-2.5">
                  <h4 className="text-xs font-black uppercase text-sl-green flex items-center gap-2 tracking-wide">
                    <Target className="w-4 h-4 text-sl-green" /> Core Tactical Rules & Takeaways
                  </h4>
                  <ul className="space-y-1.5 text-xs text-sl-foreground font-medium">
                    {activeTutorial.key_takeaways.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-sl-green shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Technical Sections */}
              <div className="space-y-6">
                {activeTutorial.sections.map((section, idx) => (
                  <div
                    key={idx}
                    className="p-5 sm:p-6 rounded-2xl bg-sl-bg border border-sl-border space-y-3"
                  >
                    <h3 className="text-sm sm:text-base font-black uppercase text-sl-foreground flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-sl-green/20 text-sl-green font-mono text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span>{section.heading}</span>
                    </h3>

                    <p className="text-xs sm:text-sm text-sl-muted font-medium leading-relaxed">
                      {section.content}
                    </p>

                    {section.bullet_points && (
                      <ul className="space-y-2 pt-1 border-t border-sl-border/40">
                        {section.bullet_points.map((bullet, bIdx) => (
                          <li key={bIdx} className="text-xs text-sl-foreground/90 flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-sl-green shrink-0 mt-1.5" />
                            <span className="leading-relaxed">{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {section.coach_tip && (
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-300">
                        <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="uppercase font-mono text-[10px] text-amber-400 block">
                            Coach&apos;s Pro Tip:
                          </strong>
                          <span>{section.coach_tip}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Secondary Visual Image (when available) */}
              {activeTutorial.secondary_image && (
                <div className="space-y-2">
                  <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden border-2 border-sl-border bg-black shadow-lg">
                    <img
                      src={activeTutorial.secondary_image}
                      alt="Supplemental Biomechanics"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-md px-3 py-1 rounded-lg border border-white/20 text-[10px] font-black uppercase text-sl-green-glow flex items-center gap-1.5">
                      <Shield className="w-3 h-3 text-sl-green" />
                      <span>Ready Stance & Reaction Mechanics</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Practice Coaching Drills */}
              {activeTutorial.coaching_drills && activeTutorial.coaching_drills.length > 0 && (
                <div className="p-5 rounded-2xl bg-sl-panel border border-sl-border space-y-3">
                  <h4 className="text-xs font-black uppercase text-sl-foreground flex items-center gap-2">
                    <Dumbbell className="w-4 h-4 text-sl-green" /> Recommended Court Practice Drills
                  </h4>
                  <div className="space-y-2">
                    {activeTutorial.coaching_drills.map((drill, dIdx) => (
                      <div
                        key={dIdx}
                        className="p-3 rounded-xl bg-sl-bg border border-sl-border/60 flex items-start gap-2.5 text-xs text-sl-muted"
                      >
                        <div className="w-5 h-5 rounded-md bg-sl-green/20 text-sl-green flex items-center justify-center shrink-0 font-bold text-[10px] mt-0.5">
                          {dIdx + 1}
                        </div>
                        <span className="leading-relaxed font-medium">{drill}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="shuttle-panel p-12 text-center text-sl-muted">
              Select a tutorial from the left curriculum to begin studying.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
