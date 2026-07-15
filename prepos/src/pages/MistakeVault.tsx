// src/pages/MistakeVault.tsx
import { useMemo, useState } from 'react';
import { AlertOctagon, Clock3, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useMistakes } from '../hooks/useMistakes';
import { formatDate } from "../utils/date";
import ReviewMistakeModal from "../components/mistakes/ReviewMistakeModal";
import type { ExtractedMistake } from "../engine/mistakeEngine";
import { processMistakeReview } from "../engine/mistakeEngine";
import { updatePyqResource, getPyq } from "../db/pyqService";
import MistakePatternCard from '../components/mistakes/MistakePatternCard';

type TabType = 'DUE' | 'PENDING' | 'RESOLVED';

const DIFFICULTY_STYLE: Record<string, string> = {
  HARD: 'bg-stop/15 text-stop',
  MEDIUM: 'bg-warn/15 text-warn',
  EASY: 'bg-go/15 text-go',
};

export default function MistakeVault() {
  const mistakes = useMistakes();
  const [activeTab, setActiveTab] = useState<TabType>('DUE');
  const [selectedMistake, setSelectedMistake] = useState<ExtractedMistake | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const handleReview = async (confidence: "AGAIN" | "HARD" | "GOOD" | "EASY") => {
    if (!selectedMistake) return;
    try {
      const pyq = await getPyq(selectedMistake.topicId);
      if (!pyq) return;

      const updatedMistakes = (pyq.mistakeItems || []).map((m) =>
        m.id === selectedMistake.id ? processMistakeReview(m, confidence) : m
      );

      await updatePyqResource({ ...pyq, mistakeItems: updatedMistakes });
      setIsReviewModalOpen(false);
      setSelectedMistake(null);
    } catch (err) {
      console.error(err);
    }
  };

  const { totalMistakes, pendingMistakes, resolvedMistakes, displayedMistakes } = useMemo(() => {
    const now = Date.now();
    const totalMistakes = mistakes.length;
    const pendingMistakes = mistakes.filter((m) => m.status === 'PENDING').length;
    const resolvedMistakes = mistakes.filter((m) => m.status === 'RESOLVED').length;

    const displayedMistakes = mistakes.filter((m) => {
      switch (activeTab) {
        case 'DUE': return m.status === 'PENDING' && m.nextReviewDate <= now;
        case 'PENDING': return m.status === 'PENDING';
        case 'RESOLVED': return m.status === 'RESOLVED';
        default: return false;
      }
    });

    return { totalMistakes, pendingMistakes, resolvedMistakes, displayedMistakes };
  }, [mistakes, activeTab]);

  const dueToday = mistakes.filter((m) => m.status === 'PENDING' && m.nextReviewDate <= Date.now()).length;

  const tabs: { key: TabType; label: string }[] = [
    { key: 'DUE', label: 'Due Review' },
    { key: 'PENDING', label: 'Pending' },
    { key: 'RESOLVED', label: 'Resolved' },
  ];

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-ink tracking-tight">Mistake Vault</h1>
        <p className="text-sm text-ink-muted mt-1">
          {totalMistakes} mistakes tracked · {dueToday} due for review today
        </p>
      </div>

      <MistakePatternCard mistakes={mistakes} />

      {/* Top Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="panel p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-ink-faint uppercase tracking-wider mb-1 block">Total Mistakes</span>
            <span className="font-mono text-2xl font-bold text-ink">{totalMistakes}</span>
          </div>
          <AlertOctagon className="w-6 h-6 text-ink-faint" />
        </div>

        <div className="panel p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-ink-faint uppercase tracking-wider mb-1 block">Pending</span>
            <span className="font-mono text-2xl font-bold text-warn">{pendingMistakes}</span>
          </div>
          <Clock3 className="w-6 h-6 text-warn/60" />
        </div>

        <div className="panel p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-ink-faint uppercase tracking-wider mb-1 block">Resolved</span>
            <span className="font-mono text-2xl font-bold text-go">{resolvedMistakes}</span>
          </div>
          <CheckCircle2 className="w-6 h-6 text-go/60" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-edge">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-colors border-b-2 -mb-px ${
              activeTab === t.key
                ? 'border-signal text-signal-bright bg-panel'
                : 'border-transparent text-ink-faint hover:text-ink-muted hover:bg-panel'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content Grid */}
      {displayedMistakes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedMistakes.map((mistake) => (
            <div key={mistake.id} className="panel panel-hover p-5 flex flex-col hover:shadow-md">
              <div className="flex justify-between items-start mb-3">
                <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${DIFFICULTY_STYLE[mistake.difficulty || 'MEDIUM']}`}>
                  {mistake.difficulty || 'MEDIUM'}
                </span>
                <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                  mistake.status === 'RESOLVED' ? 'bg-go/15 text-go' : 'bg-warn/15 text-warn'
                }`}>
                  {mistake.status}
                </span>
              </div>

              <h3 className="text-base font-bold text-ink mb-1 line-clamp-2">
                {mistake.questionReference}
              </h3>
              <p className="text-xs text-ink-faint mb-4 font-mono truncate" title={mistake.topicId}>
                {mistake.topicId}
              </p>

              <div className="mt-auto space-y-2.5">
                <div className="flex items-center justify-between text-sm bg-panel-raised p-2.5 rounded-lg">
                  <span className="font-medium text-ink-faint">Attempts</span>
                  <span className="font-bold text-ink font-mono">{mistake.attempts}</span>
                </div>

                <div className="flex items-center justify-between text-sm bg-panel-raised p-2.5 rounded-lg">
                  <span className="font-medium text-ink-faint">Next Review</span>
                  <span className={`font-bold font-mono ${
                    mistake.nextReviewDate <= Date.now() && mistake.status === 'PENDING' ? 'text-stop' : 'text-ink'
                  }`}>
                    {formatDate(mistake.nextReviewDate)}
                  </span>
                </div>

                <button
                  onClick={() => {
                    setSelectedMistake(mistake);
                    setIsReviewModalOpen(true);
                  }}
                  className="w-full mt-2 py-2.5 px-4 bg-gradient-to-r from-signal to-pulse text-white font-bold text-sm rounded-lg hover:opacity-90 transition-opacity"
                >
                  Review Mistake
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-4 panel border-dashed">
          <div className="w-16 h-16 bg-panel-raised rounded-full flex items-center justify-center mb-4">
            <ShieldCheck className="w-8 h-8 text-ink-faint" />
          </div>
          <h3 className="text-lg font-bold text-ink mb-1">No mistakes found</h3>
          <p className="text-sm text-ink-faint text-center max-w-sm">
            {activeTab === 'DUE' ? "You're all caught up! There are no mistakes due for review today." :
             activeTab === 'PENDING' ? "Great job! You don't have any pending mistakes right now." :
             "You haven't resolved any mistakes yet. Keep reviewing!"}
          </p>
        </div>
      )}

      <ReviewMistakeModal
        isOpen={isReviewModalOpen}
        mistake={selectedMistake}
        onClose={() => {
          setIsReviewModalOpen(false);
          setSelectedMistake(null);
        }}
        onReview={handleReview}
      />
    </div>
  );
}
