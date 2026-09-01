'use client';

import { useState, useEffect } from 'react';
import { supabase, type Poll, type PollOption } from '@/lib/supabase';
import { useAuth } from '@/components/AuthContext';
import { TiltCard } from '@/components/ui/TiltCard';
import { ShuttleButton } from '@/components/ui/ShuttleButton';
import { ShuttleModal } from '@/components/ui/ShuttleModal';
import { ShuttleInput } from '@/components/ui/ShuttleInput';
import { Vote, CheckCircle2, Plus, Clock, BarChart3 } from 'lucide-react';
import { audio } from '@/lib/audio';

export default function CommunityVotesPage() {
  const { user } = useAuth();

  const [polls, setPolls] = useState<Poll[]>([]);
  const [userVotes, setUserVotes] = useState<Record<string, string>>({});
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newOptions, setNewOptions] = useState(['', '', '']);

  useEffect(() => {
    async function loadPolls() {
      const { data } = await supabase.from('polls').select('*').order('created_at', { ascending: false });
      setPolls(data || []);
    }
    loadPolls();
  }, []);

  const handleVote = async (pollId: string, optionId: string) => {
    if (!user?.id) return;
    audio.play('whistle');

    setUserVotes((prev) => ({ ...prev, [pollId]: optionId }));

    setPolls((prev) =>
      prev.map((p) => {
        if (p.id === pollId && p.options) {
          const updated = p.options.map((opt) =>
            opt.id === optionId ? { ...opt, vote_count: opt.vote_count + 1 } : opt
          );
          return { ...p, options: updated };
        }
        return p;
      })
    );
  };

  const handleCreatePoll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !user?.id) return;

    audio.play('serve');
    const validOptions = newOptions.filter((o) => o.trim().length > 0);

    const newPoll: Poll = {
      id: `poll-${Date.now()}`,
      title: newTitle.trim(),
      description: newDesc.trim(),
      poll_type: 'single',
      status: 'active',
      closes_at: new Date(Date.now() + 86400000 * 7).toISOString(),
      created_by: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      options: validOptions.map((text, idx) => ({
        id: `opt-${Date.now()}-${idx}`,
        poll_id: `poll-${Date.now()}`,
        option_text: text,
        vote_count: 0,
        display_order: idx + 1,
      })),
    };

    setPolls((prev) => [newPoll, ...prev]);
    setIsCreateOpen(false);
    setNewTitle('');
    setNewDesc('');
    setNewOptions(['', '', '']);
    alert('Community poll created successfully!');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-black uppercase text-sl-foreground"
            style={{ fontFamily: 'var(--font-title)' }}
          >
            🗳️ Community Votes & Polls
          </h1>
          <p className="text-xs text-sl-muted font-medium mt-1">
            Democratic club decision-making for tournament dates, training drills, and court logistics.
          </p>
        </div>

        {(user?.role === 'admin' || user?.role === 'captain') && (
          <ShuttleButton
            variant="green"
            onClick={() => {
              audio.play('rally');
              setIsCreateOpen(true);
            }}
            className="py-2.5 px-5 text-xs font-black flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Poll</span>
          </ShuttleButton>
        )}
      </div>

      {/* Polls Grid */}
      <div className="space-y-6">
        {polls.map((poll) => {
          const totalVotes = poll.options?.reduce((sum, opt) => sum + opt.vote_count, 0) || 0;
          const userVotedOptId = userVotes[poll.id];

          return (
            <TiltCard key={poll.id} className="p-6 sm:p-8 bg-sl-panel space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase bg-sl-green/20 text-sl-green px-2.5 py-0.5 rounded-full border border-sl-green/30">
                    Active Poll
                  </span>
                  <span className="text-xs text-sl-muted font-mono font-bold">
                    {totalVotes} total votes cast
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-sl-foreground">{poll.title}</h3>
                {poll.description && (
                  <p className="text-xs text-sl-muted font-medium leading-relaxed">{poll.description}</p>
                )}
              </div>

              {/* Options */}
              <div className="space-y-3">
                {poll.options?.map((opt) => {
                  const percent = totalVotes > 0 ? Math.round((opt.vote_count / totalVotes) * 100) : 0;
                  const isSelected = userVotedOptId === opt.id;

                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleVote(poll.id, opt.id)}
                      disabled={!!userVotedOptId}
                      className={`relative w-full p-4 rounded-xl border-2 text-left transition-all overflow-hidden ${
                        isSelected
                          ? 'border-sl-green bg-sl-green/15'
                          : 'border-sl-border bg-sl-bg hover:border-sl-green/50'
                      }`}
                    >
                      {/* Live Percent Progress Bar */}
                      <div
                        className="absolute inset-y-0 left-0 bg-sl-green/20 transition-all duration-500 pointer-events-none"
                        style={{ width: `${percent}%` }}
                      />

                      <div className="relative z-10 flex items-center justify-between gap-4">
                        <span className="text-xs font-bold text-sl-foreground flex items-center gap-2">
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-sl-green shrink-0" />}
                          <span>{opt.option_text}</span>
                        </span>
                        <span className="text-xs font-black font-mono text-sl-green shrink-0">
                          {percent}% ({opt.vote_count})
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </TiltCard>
          );
        })}
      </div>

      {/* Create Poll Modal */}
      <ShuttleModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Community Poll"
      >
        <form onSubmit={handleCreatePoll} className="space-y-4">
          <ShuttleInput
            label="Poll Question / Title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="e.g. Where should we host the 2026 Inter-Faculty Finals?"
            required
          />

          <ShuttleInput
            label="Description (Optional)"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="Brief context for student athletes..."
          />

          <div className="space-y-2">
            <label className="text-xs font-bold text-sl-foreground uppercase">Options</label>
            {newOptions.map((opt, i) => (
              <ShuttleInput
                key={i}
                placeholder={`Option ${i + 1}`}
                value={opt}
                onChange={(e) => {
                  const updated = [...newOptions];
                  updated[i] = e.target.value;
                  setNewOptions(updated);
                }}
                required={i < 2}
              />
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <ShuttleButton
              type="button"
              variant="white"
              onClick={() => setIsCreateOpen(false)}
              className="flex-1"
            >
              Cancel
            </ShuttleButton>
            <ShuttleButton type="submit" variant="green" className="flex-1">
              Publish Poll 🗳️
            </ShuttleButton>
          </div>
        </form>
      </ShuttleModal>
    </div>
  );
}
