'use client';

import React, { useState, useMemo } from 'react';
import { supabase, type Tutorial } from '@/lib/supabase';
import { useCachedQuery } from '@/lib/client-cache';
import { BADMINTON_TUTORIALS, type BadmintonTutorial } from '@/data/badminton-tutorials-data';
import { CourtBoundaryVisualizer } from '@/components/tutorials/CourtBoundaryVisualizer';
import { ShotTrajectoryVisualizer } from '@/components/tutorials/ShotTrajectoryVisualizer';
import { audio } from '@/lib/audio';
import {
  BookOpen,
  Clock,
  CheckCircle2,
  Search,
  Maximize2,
  Activity,
  ChevronRight,
  Shield,
  Zap,
  Target,
  Dumbbell,
  Lightbulb,
  ArrowLeft,
  ArrowRight,
  X,
  ListFilter,
} from 'lucide-react';

type StudioViewMode = 'lesson' | 'court_boundaries' | 'shot_trajectories';

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
    const dbIds = new Set(dbTutorials.map((t) => t.id));
    const merged: BadmintonTutorial[] = dbTutorials.map((d) => {
      const match = BADMINTON_TUTORIALS.find((b) => b.id === d.id || b.title === d.title);
      return {
        id: d.id,
        title: d.title,
        subtitle: match?.subtitle || d.summary,
        category: (d.category as BadmintonTutorial['category']) || 'basics',
        difficulty: (d.difficulty as BadmintonTutorial['difficulty']) || 'beginner',
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
  const [studioView, setStudioView] = useState<StudioViewMode>('lesson');
  const [isMobileCurriculumOpen, setIsMobileCurriculumOpen] = useState(false);

  // Filtered tutorials list
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

  const currentIndex = filteredTutorials.findIndex((t) => t.id === activeTutorial?.id);
  const prevTutorial = currentIndex > 0 ? filteredTutorials[currentIndex - 1] : null;
  const nextTutorial =
    currentIndex >= 0 && currentIndex < filteredTutorials.length - 1
      ? filteredTutorials[currentIndex + 1]
      : null;

  const handleSelectTutorial = (tut: BadmintonTutorial) => {
    audio.haptic('tap');
    audio.play('rally');
    setActiveTutorialId(tut.id);
    setStudioView('lesson');
    setIsMobileCurriculumOpen(false);
  };

  const handleSwitchStudioView = (view: StudioViewMode) => {
    audio.haptic('tap');
    if (view === 'court_boundaries') audio.play('courtSqueak');
    else if (view === 'shot_trajectories') audio.play('smash');
    else audio.play('rally');
    setStudioView(view);
  };

  return (
    <div className="h-full flex flex-col min-h-0 space-y-2.5 sm:space-y-3.5">
      {/* 1. Sleek Studio Header Bar */}
      <div className="shrink-0 flex flex-col md:flex-row md:items-center justify-between pb-2.5 border-b border-sl-border/40 gap-2.5 select-none">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 rounded-xl bg-sl-green/20 text-sl-green border border-sl-green/30 flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-sl-green font-mono tracking-wider">
                UNN Badminton Studio
              </span>
              <span className="text-[10px] text-sl-muted font-mono hidden sm:inline">• BWF Curriculum</span>
            </div>
            <h1
              className="text-base sm:text-xl font-black uppercase text-sl-foreground leading-tight"
              style={{ fontFamily: 'var(--font-title)' }}
            >
              Badminton Masterclass & Tactical Training Studio
            </h1>
          </div>
        </div>

        {/* View Mode Switcher + Mobile Curriculum Toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2 self-stretch sm:self-auto">
          {/* Studio View Switcher Tabs */}
          <div className="flex items-center bg-sl-panel p-1 rounded-xl border border-sl-border flex-1 sm:flex-initial">
            <button
              type="button"
              onClick={() => handleSwitchStudioView('lesson')}
              className={`px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 flex-1 sm:flex-initial ${
                studioView === 'lesson'
                  ? 'bg-sl-green text-white shadow-sm'
                  : 'text-sl-muted hover:text-sl-foreground'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Lesson</span>
            </button>

            <button
              type="button"
              onClick={() => handleSwitchStudioView('court_boundaries')}
              className={`px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 flex-1 sm:flex-initial ${
                studioView === 'court_boundaries'
                  ? 'bg-sl-green text-white shadow-sm'
                  : 'text-sl-muted hover:text-sl-foreground'
              }`}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Court Simulator</span>
            </button>

            <button
              type="button"
              onClick={() => handleSwitchStudioView('shot_trajectories')}
              className={`px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 flex-1 sm:flex-initial ${
                studioView === 'shot_trajectories'
                  ? 'bg-sl-green text-white shadow-sm'
                  : 'text-sl-muted hover:text-sl-foreground'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Trajectory Simulator</span>
            </button>
          </div>

          {/* Mobile Curriculum Trigger Button */}
          <button
            type="button"
            onClick={() => {
              audio.haptic('tap');
              setIsMobileCurriculumOpen(true);
            }}
            className="lg:hidden px-3 py-1.5 rounded-xl border border-sl-border bg-sl-bg hover:bg-sl-panel text-sl-foreground text-xs font-black uppercase flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <ListFilter className="w-3.5 h-3.5 text-sl-green" />
            <span>Modules ({filteredTutorials.length})</span>
          </button>
        </div>
      </div>

      {/* 2. Main Studio Body: Full-Bleed 2-Panel Master-Detail Layout */}
      <div className="flex-1 min-h-0 flex flex-row gap-3 sm:gap-4 overflow-hidden">
        {/* ===================================================================== */}
        {/* LEFT COLUMN: Sleek Curriculum Navigation Rail (Desktop)              */}
        {/* ===================================================================== */}
        <aside className="w-72 xl:w-80 shrink-0 h-full hidden lg:flex flex-col bg-sl-panel border border-sl-border rounded-2xl overflow-hidden select-none">
          {/* Rail Header: Search & Category Chips */}
          <div className="p-3 border-b border-sl-border/40 space-y-2.5 bg-sl-bg/50">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-sl-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search rules, smashes..."
                className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-sl-panel border border-sl-border text-xs text-sl-foreground placeholder:text-sl-muted focus:outline-none focus:border-sl-green"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-sl-muted hover:text-sl-foreground p-0.5 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Horizontal Category Chips */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-0.5">
              {[
                { id: 'all', label: 'All' },
                { id: 'rules', label: 'Rules' },
                { id: 'basics', label: 'Grips' },
                { id: 'strokes', label: 'Strokes' },
                { id: 'footwork', label: 'Footwork' },
                { id: 'tactics', label: 'Tactics' },
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
                    className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                      isSelected
                        ? 'bg-sl-green text-white shadow-xs'
                        : 'bg-sl-panel border border-sl-border/70 text-sl-muted hover:text-sl-foreground'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-sl-muted px-0.5">
              <span>{filteredTutorials.length} Modules Available</span>
              <span className="text-sl-green font-bold">UNN Official</span>
            </div>
          </div>

          {/* Rail Curriculum Items List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {filteredTutorials.map((tut, idx) => {
              const isActive = activeTutorial?.id === tut.id && studioView === 'lesson';
              return (
                <div
                  key={tut.id}
                  onClick={() => handleSelectTutorial(tut)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 select-none ${
                    isActive
                      ? 'bg-sl-green/15 border-sl-green shadow-xs'
                      : 'bg-sl-bg/40 border-sl-border/60 hover:bg-sl-bg hover:border-sl-border'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-6 h-6 rounded-lg font-mono text-[10px] font-black flex items-center justify-center shrink-0 border ${
                        isActive
                          ? 'bg-sl-green text-white border-sl-green'
                          : 'bg-sl-panel text-sl-muted border-sl-border'
                      }`}
                    >
                      {String(idx + 1).padStart(2, '0')}
                    </span>

                    <div className="min-w-0">
                      <h4
                        className={`text-xs font-black truncate ${
                          isActive ? 'text-sl-green' : 'text-sl-foreground'
                        }`}
                      >
                        {tut.title}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[10px] text-sl-muted font-mono mt-0.5">
                        <span className="capitalize">{tut.category}</span>
                        <span>•</span>
                        <span>{tut.read_time_min}m</span>
                      </div>
                    </div>
                  </div>

                  <ChevronRight
                    className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                      isActive ? 'text-sl-green translate-x-0.5' : 'text-sl-muted/50'
                    }`}
                  />
                </div>
              );
            })}

            {filteredTutorials.length === 0 && (
              <div className="p-6 text-center text-xs text-sl-muted space-y-1.5">
                <Search className="w-5 h-5 mx-auto text-sl-muted" />
                <p>No modules match your query.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="text-sl-green text-[11px] font-bold hover:underline cursor-pointer"
                >
                  Reset filters
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* ===================================================================== */}
        {/* RIGHT COLUMN: Master Workspace (80% Full-Bleed Width)                */}
        {/* ===================================================================== */}
        <main className="flex-1 h-full min-w-0 flex flex-col bg-sl-panel border border-sl-border rounded-2xl overflow-hidden shadow-sm">
          {/* VIEW 1: ACTIVE LESSON GUIDE */}
          {studioView === 'lesson' && activeTutorial && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7 space-y-6">
              {/* SECTION A: Zero-Scroll Hero & Tactical Dock (Side-by-Side on XL) */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
                {/* Left Side: Athlete Demonstration Visual */}
                <div className="xl:col-span-6 flex flex-col space-y-2.5">
                  <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden border-2 border-sl-border bg-black shadow-md shrink-0">
                    <img
                      src={activeTutorial.hero_image || '/images/parallax/player-server.png'}
                      alt={activeTutorial.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2.5 left-2.5 bg-black/80 backdrop-blur-md px-3 py-1 rounded-lg border border-white/20 text-[10px] font-black uppercase text-sl-green-glow flex items-center gap-1.5">
                      <Shield className="w-3 h-3 text-sl-green" />
                      <span>ShuttleLions Varsity Demonstration</span>
                    </div>
                  </div>

                  {/* Fast Simulator Shortcuts */}
                  <div className="grid grid-cols-2 gap-2 mt-auto">
                    <button
                      type="button"
                      onClick={() => handleSwitchStudioView('court_boundaries')}
                      className="p-2 rounded-xl border border-sl-border bg-sl-bg hover:bg-sl-green/10 hover:border-sl-green/40 text-[11px] font-black uppercase text-sl-muted hover:text-sl-foreground transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Maximize2 className="w-3.5 h-3.5 text-sl-green" />
                      <span>Court Simulator</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSwitchStudioView('shot_trajectories')}
                      className="p-2 rounded-xl border border-sl-border bg-sl-bg hover:bg-sl-green/10 hover:border-sl-green/40 text-[11px] font-black uppercase text-sl-muted hover:text-sl-foreground transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Activity className="w-3.5 h-3.5 text-sl-green" />
                      <span>Flight Simulator</span>
                    </button>
                  </div>
                </div>

                {/* Right Side: Header Info & Tactical Takeaways Card */}
                <div className="xl:col-span-6 flex flex-col justify-between space-y-3.5">
                  {/* Module Header */}
                  <div className="space-y-2 border-b border-sl-border/40 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase bg-sl-green/20 text-sl-green px-2.5 py-0.5 rounded-full border border-sl-green/30 font-mono">
                        {activeTutorial.category} • {activeTutorial.difficulty}
                      </span>
                      <span className="text-xs text-sl-muted font-mono flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-sl-green" /> {activeTutorial.read_time_min} min read
                      </span>
                    </div>

                    <h2
                      className="text-xl sm:text-2xl font-black uppercase text-sl-foreground leading-tight"
                      style={{ fontFamily: 'var(--font-title)' }}
                    >
                      {activeTutorial.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-sl-muted font-medium leading-relaxed">
                      {activeTutorial.subtitle}
                    </p>
                  </div>

                  {/* Tactical Rules & Takeaways Panel */}
                  <div className="p-4 rounded-2xl bg-sl-green/10 border border-sl-green/30 space-y-2 flex-1 flex flex-col justify-center">
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
                </div>
              </div>

              {/* SECTION B: 2-Column Responsive Technical Step Breakdown */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-xs font-black uppercase tracking-wider text-sl-muted flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-sl-green" /> Step-by-Step Biomechanical Breakdown
                  </h3>
                  <span className="text-[10px] font-mono text-sl-muted">
                    {activeTutorial.sections.length} Technical Steps
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeTutorial.sections.map((section, idx) => (
                    <div
                      key={idx}
                      className="p-4 sm:p-5 rounded-2xl bg-sl-bg border border-sl-border space-y-2.5 flex flex-col justify-between shadow-xs"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-sl-green/20 text-sl-green font-mono text-xs font-black flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <h4 className="text-sm font-black uppercase text-sl-foreground">
                            {section.heading}
                          </h4>
                        </div>

                        <p className="text-xs text-sl-muted font-medium leading-relaxed">
                          {section.content}
                        </p>

                        {section.bullet_points && (
                          <ul className="space-y-1.5 pt-1.5 border-t border-sl-border/40 text-xs text-sl-foreground/90 font-medium">
                            {section.bullet_points.map((bullet, bIdx) => (
                              <li key={bIdx} className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-sl-green shrink-0 mt-1.5" />
                                <span className="leading-relaxed">{bullet}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      {section.coach_tip && (
                        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2 text-xs text-amber-300 mt-2">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <strong className="uppercase font-mono text-[10px] text-amber-400 block">
                              Coach Cue:
                            </strong>
                            <span className="text-[11px] leading-snug">{section.coach_tip}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION C: Supplemental Biomechanics & Drills (2-Column Grid) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                {/* Secondary Athlete Visual if available */}
                {activeTutorial.secondary_image ? (
                  <div className="relative aspect-[16/10] md:aspect-auto w-full rounded-2xl overflow-hidden border-2 border-sl-border bg-black shadow-md min-h-[180px]">
                    <img
                      src={activeTutorial.secondary_image}
                      alt="Supplemental Biomechanics"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2.5 left-2.5 bg-black/80 backdrop-blur-md px-3 py-1 rounded-lg border border-white/20 text-[10px] font-black uppercase text-sl-green-glow flex items-center gap-1.5">
                      <Shield className="w-3 h-3 text-sl-green" />
                      <span>Ready Stance & Reaction Dynamics</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-5 rounded-2xl bg-sl-bg border border-sl-border space-y-2 flex flex-col justify-center">
                    <span className="text-[10px] font-black uppercase text-sl-green font-mono">
                      UNN Varsity Training Standard
                    </span>
                    <h4 className="text-sm font-black uppercase text-sl-foreground">
                      Repeatable Muscle Memory
                    </h4>
                    <p className="text-xs text-sl-muted leading-relaxed font-medium">
                      Badminton movements rely on explosive tendon recoil and split-step anticipation. Practice the recovery pattern until returning to center becomes instinctive.
                    </p>
                  </div>
                )}

                {/* Recommended Practice Drills */}
                {activeTutorial.coaching_drills && activeTutorial.coaching_drills.length > 0 && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-sl-panel border border-sl-border space-y-3 flex flex-col justify-between">
                    <h4 className="text-xs font-black uppercase text-sl-foreground flex items-center gap-2">
                      <Dumbbell className="w-4 h-4 text-sl-green" /> Court Practice Drills
                    </h4>
                    <div className="space-y-2">
                      {activeTutorial.coaching_drills.map((drill, dIdx) => (
                        <div
                          key={dIdx}
                          className="p-2.5 rounded-xl bg-sl-bg border border-sl-border/60 flex items-start gap-2.5 text-xs text-sl-muted font-medium"
                        >
                          <span className="w-5 h-5 rounded-md bg-sl-green/20 text-sl-green flex items-center justify-center shrink-0 font-bold text-[10px] mt-0.5">
                            {dIdx + 1}
                          </span>
                          <span className="leading-relaxed">{drill}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION D: Sequential Lesson Navigation Stepper */}
              <div className="pt-4 border-t border-sl-border/40 flex flex-col sm:flex-row items-center justify-between gap-3">
                {prevTutorial ? (
                  <button
                    type="button"
                    onClick={() => handleSelectTutorial(prevTutorial)}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-sl-border bg-sl-bg hover:bg-sl-panel text-xs font-black uppercase text-sl-foreground flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <ArrowLeft className="w-4 h-4 text-sl-green" />
                    <span className="truncate">Prev: {prevTutorial.title}</span>
                  </button>
                ) : (
                  <div className="hidden sm:block" />
                )}

                {nextTutorial ? (
                  <button
                    type="button"
                    onClick={() => handleSelectTutorial(nextTutorial)}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-sl-green hover:bg-sl-green-glow text-white hover:text-black text-xs font-black uppercase flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md ml-auto"
                  >
                    <span className="truncate">Next: {nextTutorial.title}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-sl-green/40 bg-sl-green/10 text-sl-green text-xs font-black uppercase flex items-center justify-center gap-2 ml-auto">
                    <span>Curriculum Completed</span>
                    <CheckCircle2 className="w-4 h-4 text-sl-green" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VIEW 2: FULL-BLEED COURT BOUNDARY SIMULATOR */}
          {studioView === 'court_boundaries' && (
            <div className="flex-1 overflow-y-auto p-3 sm:p-5">
              <CourtBoundaryVisualizer />
            </div>
          )}

          {/* VIEW 3: FULL-BLEED SHOT TRAJECTORY SIMULATOR */}
          {studioView === 'shot_trajectories' && (
            <div className="flex-1 overflow-y-auto p-3 sm:p-5">
              <ShotTrajectoryVisualizer />
            </div>
          )}
        </main>
      </div>

      {/* 3. Mobile Curriculum Slide-Over Drawer (Accessible on small screens) */}
      {isMobileCurriculumOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileCurriculumOpen(false)}
          />
          <div className="relative w-80 max-w-[85vw] bg-sl-panel border-r border-sl-border h-full p-4 space-y-4 flex flex-col justify-between overflow-y-auto z-50 shadow-2xl">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-sl-border/40 pb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-sl-green" />
                  <h3 className="text-xs font-black uppercase text-sl-foreground">
                    Curriculum Modules
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileCurriculumOpen(false)}
                  className="p-1 rounded-lg border border-sl-border text-sl-muted hover:text-sl-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Mobile Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-sl-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search modules..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-sl-bg border border-sl-border text-xs text-sl-foreground placeholder:text-sl-muted focus:outline-none focus:border-sl-green"
                />
              </div>

              {/* Mobile Modules List */}
              <div className="space-y-2 pt-1">
                {filteredTutorials.map((tut, idx) => {
                  const isActive = activeTutorial?.id === tut.id && studioView === 'lesson';
                  return (
                    <div
                      key={tut.id}
                      onClick={() => handleSelectTutorial(tut)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                        isActive
                          ? 'bg-sl-green/15 border-sl-green'
                          : 'bg-sl-bg/60 border-sl-border hover:border-sl-green/40'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`w-6 h-6 rounded-lg font-mono text-[10px] font-black flex items-center justify-center shrink-0 border ${
                            isActive
                              ? 'bg-sl-green text-white border-sl-green'
                              : 'bg-sl-panel text-sl-muted border-sl-border'
                          }`}
                        >
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <div className="min-w-0">
                          <h4
                            className={`text-xs font-black truncate ${
                              isActive ? 'text-sl-green' : 'text-sl-foreground'
                            }`}
                          >
                            {tut.title}
                          </h4>
                          <span className="text-[10px] text-sl-muted font-mono capitalize">
                            {tut.category} • {tut.read_time_min}m read
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-sl-green shrink-0" />
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-sl-border/40">
              <button
                type="button"
                onClick={() => setIsMobileCurriculumOpen(false)}
                className="w-full py-2 bg-sl-bg border border-sl-border text-xs font-bold text-sl-foreground rounded-xl"
              >
                Close Curriculum
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
