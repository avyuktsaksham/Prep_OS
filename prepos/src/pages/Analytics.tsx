// src/pages/Analytics.tsx
import { BookOpen, Clock, PenLine, Target, RotateCw, Award, AlertCircle, Compass, EyeOff } from 'lucide-react';
import { useAnalytics } from '../hooks/useAnalytics';
import WeeklyReviewCard from '../components/cards/WeeklyReviewCard';

function accuracyPill(accuracy: number): { label: string; color: string } {
  if (accuracy >= 80) return { label: 'Strong', color: 'bg-go/15 text-go' };
  if (accuracy >= 65) return { label: 'Good', color: 'bg-signal/15 text-signal-bright' };
  if (accuracy >= 50) return { label: 'Moderate', color: 'bg-warn/15 text-warn' };
  if (accuracy >= 35) return { label: 'Weak', color: 'bg-orange-500/15 text-orange-400' };
  return { label: 'Critical', color: 'bg-stop/15 text-stop' };
}

export default function Analytics() {
  const data = useAnalytics();

  if (!data) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-edge border-t-signal rounded-full animate-spin mb-4" />
          <p className="text-ink-faint font-medium text-sm">Crunching numbers...</p>
        </div>
      </div>
    );
  }

  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = Math.round(minutes % 60);
    return `${h}h ${m}m`;
  };

  const sortedSubjectsByProgress = [...data.subjectMetrics].sort((a, b) => b.subjectProgress - a.subjectProgress);

  const statCards = [
    { icon: BookOpen, label: 'Overall', value: `${data.overallProgress}%`, accent: 'text-ink' },
    { icon: Award, label: 'Topics Done', value: `${data.completedTopics}/${data.totalTopics}`, accent: 'text-ink' },
    { icon: Clock, label: 'Study Time', value: formatTime(data.totalStudyTimeMinutes), accent: 'text-signal-bright' },
    { icon: PenLine, label: 'PYQs Solved', value: `${data.totalPyqsSolved}`, accent: 'text-go' },
    { icon: Target, label: 'Accuracy', value: `${data.overallAccuracy}%`, accent: 'text-pulse-bright' },
    { icon: RotateCw, label: 'Due Revisions', value: `${data.dueRevisionsCount}`, accent: data.dueRevisionsCount > 0 ? 'text-warn' : 'text-ink' },
  ];

  const insightCards = [
    { icon: Award, label: 'Strongest Subject', value: data.insights.strongestSubject, color: 'bg-go/15 text-go' },
    { icon: AlertCircle, label: 'Weakest Subject', value: data.insights.weakestSubject, color: 'bg-stop/15 text-stop' },
    { icon: Compass, label: 'Most Studied', value: data.insights.mostStudiedSubject, color: 'bg-signal/15 text-signal-bright' },
    { icon: EyeOff, label: 'Least Studied', value: data.insights.leastStudiedSubject, color: 'bg-panel-raised text-ink-muted' },
  ];

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-ink tracking-tight">Analytics</h1>
        <p className="text-sm text-ink-muted mt-1">Performance deep-dive across your prep</p>
      </div>

      <WeeklyReviewCard snapshot={data} />

      {/* Top Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {statCards.map((s) => (
          <div key={s.label} className="panel p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-ink-faint uppercase tracking-widest">{s.label}</span>
              <s.icon className="w-3.5 h-3.5 text-ink-faint" />
            </div>
            <span className={`font-mono text-xl font-bold ${s.accent}`}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Middle Section: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="panel p-6 flex flex-col h-[420px]">
          <h2 className="text-lg font-display font-bold text-ink mb-4 shrink-0">Subject Progress</h2>
          <div className="overflow-y-auto pr-2 flex-grow space-y-4">
            {sortedSubjectsByProgress.map((subject) => {
              const pill = accuracyPill(subject.accuracy);
              return (
                <div key={subject.subjectId} className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-sm gap-2">
                    <span className="font-semibold text-ink-muted truncate flex items-center gap-2" title={subject.subjectName}>
                      {subject.subjectName}
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${pill.color} shrink-0`}>
                        {pill.label}
                      </span>
                    </span>
                    <span className="font-bold text-ink font-mono shrink-0">{subject.subjectProgress}%</span>
                  </div>
                  <div className="w-full bg-panel-raised rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-signal to-signal-bright h-2 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${subject.subjectProgress}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {sortedSubjectsByProgress.length === 0 && (
              <p className="text-sm text-ink-faint text-center py-8">No subjects available.</p>
            )}
          </div>
        </div>

        <div className="panel p-6 flex flex-col h-[420px]">
          <div className="flex items-center justify-between mb-4 shrink-0">
            <h2 className="text-lg font-display font-bold text-ink">Accuracy vs Progress</h2>
            <div className="flex items-center gap-3 text-xs font-semibold text-ink-faint">
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-signal" /> Progress</div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-pulse" /> Accuracy</div>
            </div>
          </div>
          <div className="overflow-y-auto pr-2 flex-grow space-y-5">
            {sortedSubjectsByProgress.map((subject) => (
              <div key={`weightage-${subject.subjectId}`} className="flex flex-col gap-1.5">
                <div className="text-sm font-semibold text-ink-muted truncate" title={subject.subjectName}>
                  {subject.subjectName}
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-panel-raised rounded-full h-1.5 flex-grow overflow-hidden">
                      <div className="bg-signal h-1.5 rounded-full transition-all duration-500 ease-out" style={{ width: `${subject.subjectProgress}%` }} />
                    </div>
                    <span className="text-[10px] font-bold text-ink-faint font-mono w-8 text-right">{subject.subjectProgress}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-panel-raised rounded-full h-1.5 flex-grow overflow-hidden">
                      <div className="bg-pulse h-1.5 rounded-full transition-all duration-500 ease-out" style={{ width: `${subject.accuracy}%` }} />
                    </div>
                    <span className="text-[10px] font-bold text-ink-faint font-mono w-8 text-right">{subject.accuracy}%</span>
                  </div>
                </div>
              </div>
            ))}
            {sortedSubjectsByProgress.length === 0 && (
              <p className="text-sm text-ink-faint text-center py-8">No subjects available.</p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section: Insights */}
      <h2 className="text-lg font-display font-bold text-ink mb-4">Key Insights</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {insightCards.map((c) => (
          <div key={c.label} className="panel p-5 flex items-center gap-4">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full shrink-0 ${c.color}`}>
              <c.icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-ink-faint uppercase tracking-wider mb-0.5">{c.label}</p>
              <p className="text-sm font-bold text-ink truncate" title={c.value || 'N/A'}>
                {c.value || 'N/A'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
