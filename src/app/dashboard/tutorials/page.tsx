'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
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
  Eye,
  Check,
} from 'lucide-react';

type StageDisplayMode = 'photo' | 'court' | 'trajectory';
type MobileTabMode = 'visual' | 'steps' | 'drills';

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
            content: d.summary,
            bullet_points: ['Maintain active ready stance.', 'Follow through towards target.'],
            coach_tip: 'Keep your wrist relaxed before contact.',
          },
        ],
      };
    });

    const existingIds = new Set(merged.map((m) => m.id));
    const extraLocals = BADMINTON_TUTORIALS.filter((b) => !existingIds.has(b.id));
    return [...merged, ...extraLocals];
  }, [dbTutorials]);

  // State Management
  const [activeTutorialId, setActiveTutorialId] = useState<string>(BADMINTON_TUTORIALS[0].id);
  const [stageMode, setStageMode] = useState<StageDisplayMode>('photo');
  const [mobileTab, setMobileTab] = useState<MobileTabMode>('visual');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileCurriculumOpen, setIsMobileCurriculumOpen] = useState(false);
  
  // Local drill completion tracking for player satisfaction
  const [completedDrills, setCompletedDrills] = useState<Record<string, boolean>>({});

  // Filtered Tutorials
  const filteredTutorials = useMemo(() => {
    return allTutorials.filter((t) => {
      const matchesCat = selectedCategory === 'all' || t.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.subtitle.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.summary.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
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
    setStageMode('photo');
    setIsMobileCurriculumOpen(false);
  };

  const handleSwitchStage = (mode: StageDisplayMode) => {
    audio.haptic('tap');
    if (mode === 'court') audio.play('courtSqueak');
    else if (mode === 'trajectory') audio.play('smash');
    else audio.play('rally');
    setStageMode(mode);
  };

  const toggleDrill = (drillText: string) => {
    audio.haptic('tap');
    audio.play('rally');
    setCompletedDrills((prev) => ({
      ...prev,
      [drillText]: !prev[drillText],
    }));
  };

  return (
    <div className="h-full flex flex-col min-h-0 space-y-2 select-none font-google-sans">
      {/* ===================================================================== */}
      {/* 1. TOP BRAND & COMMAND BAR                                            */}
      {/* ===================================================================== */}
      <header className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-sl-border/40 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-sl-green/20 text-sl-green border border-sl-green/30 flex items-center justify-center shrink-0">
            <BookOpen className="w-4.5 h-4.5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-black uppercase text-sl-green font-mono tracking-wider">
                UNN Varsity Studio
              </span>
              <span className="text-xs sm:text-sm text-sl-muted font-mono hidden sm:inline">• BWF Masterclass</span>
            </div>
            <h1
              className="text-lg sm:text-xl lg:text-2xl font-black uppercase text-sl-foreground truncate"
              style={{ fontFamily: 'var(--font-title)' }}
            >
              Badminton Tactical & Biomechanical Cockpit
            </h1>
          </div>
        </div>

        {/* Desktop View Switcher Pills + Mobile Curriculum Button */}
        <div className="flex items-center gap-1.5 self-stretch sm:self-auto">
          {/* Stage View Toggles (Visible on all sizes) */}
          <div className="flex items-center bg-sl-panel p-1 rounded-xl border border-sl-border flex-1 sm:flex-initial">
            <button
              type="button"
              onClick={() => handleSwitchStage('photo')}
              className={`px-3 py-1.5 rounded-lg text-sm sm:text-base font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 flex-1 sm:flex-initial ${
                stageMode === 'photo'
                  ? 'bg-sl-green text-white shadow-xs'
                  : 'text-sl-muted hover:text-sl-foreground'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>Demonstration</span>
            </button>

            <button
              type="button"
              onClick={() => handleSwitchStage('court')}
              className={`px-3 py-1.5 rounded-lg text-sm sm:text-base font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 flex-1 sm:flex-initial ${
                stageMode === 'court'
                  ? 'bg-sl-green text-white shadow-xs'
                  : 'text-sl-muted hover:text-sl-foreground'
              }`}
            >
              <Maximize2 className="w-4 h-4" />
              <span>Court Simulator</span>
            </button>

            <button
              type="button"
              onClick={() => handleSwitchStage('trajectory')}
              className={`px-3 py-1.5 rounded-lg text-sm sm:text-base font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 flex-1 sm:flex-initial ${
                stageMode === 'trajectory'
                  ? 'bg-sl-green text-white shadow-xs'
                  : 'text-sl-muted hover:text-sl-foreground'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Flight Simulator</span>
            </button>
          </div>

          {/* Mobile Curriculum Trigger Button */}
          <button
            type="button"
            onClick={() => {
              audio.haptic('tap');
              setIsMobileCurriculumOpen(true);
            }}
            className="lg:hidden px-3 py-1.5 rounded-xl border border-sl-border bg-sl-panel hover:bg-sl-bg text-sl-foreground text-sm sm:text-base font-black uppercase flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <ListFilter className="w-4 h-4 text-sl-green" />
            <span>Modules ({filteredTutorials.length})</span>
          </button>
        </div>
      </header>

      {/* ===================================================================== */}
      {/* MOBILE SEGMENTED CONTROL (< 1280px / Tablet / Phone)                  */}
      {/* ===================================================================== */}
      <div className="xl:hidden shrink-0 flex items-center bg-sl-panel p-1 rounded-xl border border-sl-border gap-1">
        <button
          type="button"
          onClick={() => {
            audio.haptic('tap');
            setMobileTab('visual');
          }}
          className={`flex-1 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm md:text-base font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            mobileTab === 'visual'
              ? 'bg-sl-green text-white shadow-xs'
              : 'text-sl-muted hover:text-sl-foreground'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>1. Visual Arena</span>
        </button>

        <button
          type="button"
          onClick={() => {
            audio.haptic('tap');
            setMobileTab('steps');
          }}
          className={`flex-1 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm md:text-base font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            mobileTab === 'steps'
              ? 'bg-sl-green text-white shadow-xs'
              : 'text-sl-muted hover:text-sl-foreground'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>2. Technical Steps</span>
        </button>

        <button
          type="button"
          onClick={() => {
            audio.haptic('tap');
            setMobileTab('drills');
          }}
          className={`flex-1 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm md:text-base font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            mobileTab === 'drills'
              ? 'bg-sl-green text-white shadow-xs'
              : 'text-sl-muted hover:text-sl-foreground'
          }`}
        >
          <Dumbbell className="w-4 h-4" />
          <span>3. Modules & Drills</span>
        </button>
      </div>

      {/* ===================================================================== */}
      {/* 2. THREE-COLUMN ZERO-SCROLL PANORAMIC COCKPIT (Desktop xl: & Up)     */}
      {/* ===================================================================== */}
      <div className="flex-1 min-h-0 flex flex-row gap-2.5 sm:gap-3 overflow-hidden">
        {/* ------------------------------------------------------------------- */}
        {/* COLUMN 1: CURRICULUM & PRACTICE MISSION (Left ~24% on xl)          */}
        {/* ------------------------------------------------------------------- */}
        <aside
          className={`w-72 xl:w-80 shrink-0 h-full flex-col bg-sl-panel border border-sl-border rounded-2xl overflow-hidden ${
            mobileTab === 'drills' ? 'flex flex-1 xl:flex-none' : 'hidden lg:flex'
          }`}
        >
          {/* Rail Header: Search & Category Chips */}
          <div className="p-2.5 border-b border-sl-border/40 space-y-2 bg-sl-bg/40 shrink-0">
            <div className="relative">
              <Search className="w-4 h-4 text-sl-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search rules, smashes..."
                className="w-full pl-8 pr-7 py-2 rounded-lg bg-sl-panel border border-sl-border text-sm sm:text-base text-sl-foreground placeholder:text-sl-muted focus:outline-none focus:border-sl-green"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-sl-muted hover:text-sl-foreground p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Horizontal Category Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
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
                    className={`px-2.5 py-1 rounded-md text-xs sm:text-sm font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
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
          </div>

          {/* Module Selector List (Takes remaining height so all modules are clearly visible) */}
          <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-1.5">
            {filteredTutorials.map((tut, idx) => {
              const isActive = activeTutorial?.id === tut.id;
              return (
                <div
                  key={tut.id}
                  onClick={() => handleSelectTutorial(tut)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                    isActive
                      ? 'bg-sl-green/15 border-sl-green shadow-xs'
                      : 'bg-sl-bg/40 border-sl-border/60 hover:bg-sl-bg hover:border-sl-border'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-6 h-6 rounded-md font-mono text-xs sm:text-sm font-black flex items-center justify-center shrink-0 border ${
                        isActive
                          ? 'bg-sl-green text-white border-sl-green'
                          : 'bg-sl-panel text-sl-muted border-sl-border'
                      }`}
                    >
                      {String(idx + 1).padStart(2, '0')}
                    </span>

                    <div className="min-w-0">
                      <h4
                        className={`text-sm sm:text-base font-bold truncate leading-tight ${
                          isActive ? 'text-sl-green' : 'text-sl-foreground'
                        }`}
                      >
                        {tut.title}
                      </h4>
                      <div className="flex items-center gap-1.5 text-xs sm:text-sm text-sl-muted font-mono mt-0.5">
                        <span className="capitalize">{tut.category}</span>
                        <span>•</span>
                        <span>{tut.read_time_min}m</span>
                      </div>
                    </div>
                  </div>

                  <ChevronRight
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      isActive ? 'text-sl-green translate-x-0.5' : 'text-sl-muted/50'
                    }`}
                  />
                </div>
              );
            })}
          </div>

          {/* Practice Drills Checklist (Stuck to bottom, strictly content height) */}
          <div className="h-fit shrink-0 mt-auto border-t border-sl-border/40 p-2 bg-sl-green/5 space-y-1.5">
            <div className="flex items-center justify-between pb-1 border-b border-sl-border/30">
              <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-sl-green flex items-center gap-1.5 font-mono">
                <Dumbbell className="w-3.5 h-3.5 text-sl-green" /> Practice Missions
              </span>
              <span className="text-xs font-mono text-sl-muted">
                {activeTutorial?.coaching_drills.filter((d) => completedDrills[d]).length} /{' '}
                {activeTutorial?.coaching_drills.length || 0} Done
              </span>
            </div>

            <div className="space-y-1 max-h-36 overflow-y-auto pr-0.5">
              {activeTutorial?.coaching_drills.map((drill, idx) => {
                const isChecked = !!completedDrills[drill];
                return (
                  <div
                    key={idx}
                    onClick={() => toggleDrill(drill)}
                    className={`p-1.5 rounded-lg border transition-all cursor-pointer flex items-start gap-2 ${
                      isChecked
                        ? 'bg-sl-green/20 border-sl-green/60 text-sl-foreground'
                        : 'bg-sl-panel border-sl-border/70 hover:border-sl-green/40'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        isChecked
                          ? 'bg-sl-green border-sl-green text-white'
                          : 'border-sl-border bg-sl-bg'
                      }`}
                    >
                      {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                    <p
                      className={`text-xs sm:text-sm leading-tight font-medium select-none ${
                        isChecked ? 'line-through text-sl-muted' : 'text-sl-foreground'
                      }`}
                    >
                      {drill}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        {/* ------------------------------------------------------------------- */}
        {/* COLUMN 2: CENTER DEMONSTRATION ARENA (Visual Focus ~46% on xl)     */}
        {/* ------------------------------------------------------------------- */}
        <main
          className={`flex-1 h-full min-w-0 flex-col bg-sl-panel border border-sl-border rounded-2xl overflow-hidden shadow-xs ${
            mobileTab === 'visual' ? 'flex' : 'hidden xl:flex'
          }`}
        >
          {activeTutorial && (
            <div className="flex-1 flex flex-col min-h-0 p-2.5 sm:p-3 space-y-2.5 overflow-hidden">
              {/* Module Header Bar */}
              <div className="shrink-0 flex items-center justify-between gap-2 border-b border-sl-border/40 pb-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs sm:text-sm font-black uppercase bg-sl-green/20 text-sl-green px-2.5 py-0.5 rounded-full border border-sl-green/30 font-mono">
                      {activeTutorial.category} • {activeTutorial.difficulty}
                    </span>
                    <span className="text-xs sm:text-sm text-sl-muted font-mono flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-sl-green" /> {activeTutorial.read_time_min}m read
                    </span>
                  </div>
                  <h2
                    className="text-lg sm:text-xl lg:text-2xl font-black uppercase text-sl-foreground truncate"
                    style={{ fontFamily: 'var(--font-title)' }}
                  >
                    {activeTutorial.title}
                  </h2>
                </div>

                {/* Subtitle / Key Focus */}
                <div className="hidden md:flex items-center gap-1.5 text-right shrink-0">
                  <span className="text-xs sm:text-sm font-bold uppercase text-sl-muted font-mono">Focus:</span>
                  <span className="text-xs sm:text-sm md:text-base font-bold text-sl-foreground max-w-[280px] truncate">
                    {activeTutorial.subtitle}
                  </span>
                </div>
              </div>

              {/* Central Stage Canvas (Edge-to-Edge Dynamic View) */}
              <div className="flex-1 min-h-0 relative rounded-xl border border-sl-border bg-sl-bg overflow-hidden flex flex-col">
                {/* STAGE MODE 1: ATHLETE PHOTO DEMONSTRATION */}
                {stageMode === 'photo' && (
                  <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden group">
                    <Image
                      src={activeTutorial.hero_image || '/images/parallax/player-server.png'}
                      alt={activeTutorial.title}
                      fill
                      unoptimized
                      className="object-cover sm:object-contain transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Gradient Overlay for Legibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                    {/* Athlete Cue Tag */}
                    <div className="absolute bottom-2.5 left-2.5 bg-black/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20 text-xs sm:text-sm font-black uppercase text-sl-green-glow flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-sl-green" />
                      <span>ShuttleLions Varsity Execution</span>
                    </div>

                    {/* Quick Jump Shortcuts */}
                    <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleSwitchStage('court')}
                        className="px-2.5 py-1.5 rounded-lg bg-black/80 backdrop-blur-md border border-white/20 hover:border-sl-green text-xs sm:text-sm font-black uppercase text-white hover:text-sl-green-glow flex items-center gap-1 cursor-pointer transition-all"
                      >
                        <Maximize2 className="w-3.5 h-3.5 text-sl-green" />
                        <span>Court Lines</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSwitchStage('trajectory')}
                        className="px-2.5 py-1.5 rounded-lg bg-black/80 backdrop-blur-md border border-white/20 hover:border-sl-green text-xs sm:text-sm font-black uppercase text-white hover:text-sl-green-glow flex items-center gap-1 cursor-pointer transition-all"
                      >
                        <Activity className="w-3.5 h-3.5 text-sl-green" />
                        <span>Flight Arc</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* STAGE MODE 2: INTERACTIVE COURT BOUNDARY VISUALIZER */}
                {stageMode === 'court' && (
                  <div className="w-full h-full p-1 sm:p-2 overflow-y-auto">
                    <CourtBoundaryVisualizer />
                  </div>
                )}

                {/* STAGE MODE 3: INTERACTIVE SHOT TRAJECTORY VISUALIZER */}
                {stageMode === 'trajectory' && (
                  <div className="w-full h-full p-1 sm:p-2 overflow-y-auto">
                    <ShotTrajectoryVisualizer />
                  </div>
                )}
              </div>

              {/* Docked Core Tactical Rules & Takeaways Panel */}
              <div className="shrink-0 p-2.5 sm:p-3 rounded-xl bg-sl-green/10 border border-sl-green/30 space-y-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm sm:text-base font-black uppercase text-sl-green flex items-center gap-1.5 tracking-wider font-mono">
                    <Target className="w-4 h-4 text-sl-green" /> Core Tactical Rules & Laws
                  </h4>
                  <span className="text-xs sm:text-sm font-mono text-sl-muted hidden sm:inline">Essential Match Keys</span>
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 text-sl-foreground font-medium">
                  {activeTutorial.key_takeaways.slice(0, 4).map((point, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 text-xs sm:text-sm md:text-base leading-relaxed">
                      <CheckCircle2 className="w-4 h-4 text-sl-green shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Lesson Stepper Navigation Footer */}
              <div className="shrink-0 flex items-center justify-between pt-1 border-t border-sl-border/40 gap-2">
                <button
                  type="button"
                  disabled={!prevTutorial}
                  onClick={() => prevTutorial && handleSelectTutorial(prevTutorial)}
                  className={`px-3 py-2 rounded-xl border text-xs sm:text-sm md:text-base font-black uppercase flex items-center gap-1.5 transition-all ${
                    prevTutorial
                      ? 'bg-sl-bg border-sl-border text-sl-foreground hover:bg-sl-panel cursor-pointer'
                      : 'opacity-40 border-sl-border/40 text-sl-muted cursor-not-allowed'
                  }`}
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Prev Lesson</span>
                  <span className="sm:hidden">Prev</span>
                </button>

                <div className="text-xs sm:text-sm font-mono text-sl-muted">
                  Lesson {currentIndex + 1} of {filteredTutorials.length}
                </div>

                <button
                  type="button"
                  disabled={!nextTutorial}
                  onClick={() => nextTutorial && handleSelectTutorial(nextTutorial)}
                  className={`px-3 py-2 rounded-xl border text-xs sm:text-sm md:text-base font-black uppercase flex items-center gap-1.5 transition-all ${
                    nextTutorial
                      ? 'bg-sl-green text-white border-sl-green hover:brightness-110 shadow-xs cursor-pointer'
                      : 'opacity-40 border-sl-border/40 text-sl-muted cursor-not-allowed'
                  }`}
                >
                  <span className="hidden sm:inline">Next Lesson</span>
                  <span className="sm:hidden">Next</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </main>

        {/* ------------------------------------------------------------------- */}
        {/* COLUMN 3: BIOMECHANICAL PLAYBOOK (Right ~30% on xl)                */}
        {/* ------------------------------------------------------------------- */}
        <section
          className={`w-80 xl:w-96 shrink-0 h-full flex-col bg-sl-panel border border-sl-border rounded-2xl overflow-hidden ${
            mobileTab === 'steps' ? 'flex flex-1 xl:flex-none' : 'hidden xl:flex'
          }`}
        >
          {/* Column Header */}
          <div className="p-2.5 border-b border-sl-border/40 bg-sl-bg/40 flex items-center justify-between shrink-0">
            <span className="text-sm sm:text-base lg:text-lg font-black uppercase tracking-wider text-sl-foreground flex items-center gap-1.5 font-mono">
              <Zap className="w-4 h-4 text-sl-green" /> Biomechanical Steps
            </span>
            <span className="text-xs sm:text-sm font-mono text-sl-muted bg-sl-panel px-2.5 py-0.5 rounded-full border border-sl-border">
              {activeTutorial?.sections.length || 0} Phases
            </span>
          </div>

          {/* Vertical Step Breakdown Cards (Independent Sleek Scroll) */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-3">
            {activeTutorial?.sections.map((section, sIdx) => (
              <div
                key={sIdx}
                className="p-3.5 rounded-xl bg-sl-bg/60 border border-sl-border space-y-2 hover:border-sl-green/40 transition-colors"
              >
                {/* Phase Number & Title */}
                <div className="flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-md bg-sl-green/20 text-sl-green text-xs sm:text-sm font-black font-mono flex items-center justify-center shrink-0 mt-0.5">
                    {String(sIdx + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-sl-foreground leading-snug">
                      {section.heading}
                    </h3>
                  </div>
                </div>

                {/* Content Paragraph */}
                <p className="text-sm sm:text-base text-sl-muted leading-relaxed font-normal">
                  {section.content}
                </p>

                {/* Bullet Points */}
                {section.bullet_points && section.bullet_points.length > 0 && (
                  <ul className="space-y-1.5 pt-1.5 border-t border-sl-border/40">
                    {section.bullet_points.map((pt, pIdx) => (
                      <li key={pIdx} className="text-sm sm:text-base text-sl-foreground flex items-start gap-2 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-sl-green shrink-0 mt-2" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Coach Pro Tip */}
                {section.coach_tip && (
                  <div className="p-2.5 sm:p-3 rounded-lg bg-sl-panel border border-sl-green/30 flex items-start gap-2.5">
                    <Lightbulb className="w-4 h-4 text-sl-green shrink-0 mt-0.5" />
                    <div className="text-sm sm:text-base leading-snug">
                      <span className="font-bold text-sl-green uppercase font-mono">Coach Cue: </span>
                      <span className="text-sl-foreground">{section.coach_tip}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Bottom Card Summary */}
          <div className="p-2.5 border-t border-sl-border/40 bg-sl-bg/40 shrink-0 text-center">
            <span className="text-xs sm:text-sm font-mono text-sl-muted">
              Execute each phase with smooth kinetic chain deceleration.
            </span>
          </div>
        </section>
      </div>

      {/* ===================================================================== */}
      {/* 3. MOBILE SLIDE-OVER CURRICULUM DRAWER                                */}
      {/* ===================================================================== */}
      {isMobileCurriculumOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            onClick={() => setIsMobileCurriculumOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-xs cursor-pointer"
          />

          {/* Drawer Container */}
          <div className="relative w-full max-w-xs bg-sl-panel border-r border-sl-border h-full flex flex-col z-10 shadow-2xl">
            <div className="p-3.5 border-b border-sl-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4.5 h-4.5 text-sl-green" />
                <span className="text-base sm:text-lg font-black uppercase text-sl-foreground font-mono">
                  Masterclass Modules ({filteredTutorials.length})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileCurriculumOpen(false)}
                className="p-1.5 rounded-lg border border-sl-border text-sl-muted hover:text-sl-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
              {filteredTutorials.map((tut, idx) => {
                const isActive = activeTutorial?.id === tut.id;
                return (
                  <div
                    key={tut.id}
                    onClick={() => handleSelectTutorial(tut)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                      isActive
                        ? 'bg-sl-green/15 border-sl-green shadow-xs'
                        : 'bg-sl-bg/40 border-sl-border/60 hover:bg-sl-bg'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`w-6 h-6 rounded-md font-mono text-xs sm:text-sm font-black flex items-center justify-center shrink-0 border ${
                          isActive
                            ? 'bg-sl-green text-white border-sl-green'
                            : 'bg-sl-panel text-sl-muted border-sl-border'
                        }`}
                      >
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <div className="min-w-0">
                        <h4
                          className={`text-sm sm:text-base font-bold truncate ${
                            isActive ? 'text-sl-green' : 'text-sl-foreground'
                          }`}
                        >
                          {tut.title}
                        </h4>
                        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-sl-muted font-mono mt-0.5">
                          <span className="capitalize">{tut.category}</span>
                          <span>•</span>
                          <span>{tut.read_time_min}m</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-sl-muted shrink-0" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
