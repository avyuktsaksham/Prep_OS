// src/pages/Dashboard.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, Brain, Sigma, Binary, CircuitBoard, Cpu, Code2,
  GitBranch, Layers, Terminal, Server, Database, Network,
  Play, Pause, Square, Flame, Clock, Target, CalendarClock,
} from 'lucide-react';
import gateData from '../data/gate.json';
import { useSubjectProgress } from '../hooks/useSubjectProgress';
import { useTodayTasks } from '../hooks/useTodayTasks';
import { supabase } from '../lib/supabaseClient';
import { useTodayFocusTime } from '../hooks/useTodayFocusTime';
import { useStreak } from '../hooks/useStreak';
import { useAnalytics } from '../hooks/useAnalytics';
import { formatFullDate, formatClockTime, getDaysUntilExam } from '../utils/date';
import RevisionLookahead from '../components/cards/RevisionLookahead';
import WeakSubjectAlerts from '../components/cards/WeakSubjectAlerts';
import DailyStudyChart from '../components/cards/DailyStudyChart';
import StudyHeatmap from '../components/cards/StudyHeatmap';
import FocusNextActions from '../components/cards/FocusNextActions';
import TodayRevisionReminder from '../components/cards/TodayRevisionReminder';

interface Topic { id: string; name: string; }
interface Subject { id: string; name: string; weightage: number; topics: Topic[]; }
interface GateData { exam: string; subjects: Subject[]; }

const typedGateData = gateData as GateData;

const SUBJECT_STYLE: Record<string, { icon: typeof Brain; text: string; bg: string; bar: string }> = {
  sub_aptitude:     { icon: Brain,        text: 'text-signal-bright', bg: 'bg-signal/15',  bar: 'from-signal to-signal-bright' },
  sub_eng_math:     { icon: Sigma,        text: 'text-pulse-bright',  bg: 'bg-pulse/15',    bar: 'from-pulse to-pulse-bright' },
  sub_discrete_math:{ icon: Binary,       text: 'text-violet-400',    bg: 'bg-violet-500/15', bar: 'from-violet-500 to-violet-400' },
  sub_digital_logic:{ icon: CircuitBoard, text: 'text-amber-400',     bg: 'bg-amber-500/15', bar: 'from-amber-500 to-amber-400' },
  sub_coa:          { icon: Cpu,          text: 'text-orange-400',    bg: 'bg-orange-500/15', bar: 'from-orange-500 to-orange-400' },
  sub_ds_prog:      { icon: Code2,        text: 'text-go',            bg: 'bg-go/15',        bar: 'from-go to-emerald-400' },
  sub_algorithms:   { icon: GitBranch,    text: 'text-cyan-400',      bg: 'bg-cyan-500/15',  bar: 'from-cyan-500 to-cyan-400' },
  sub_toc:          { icon: Layers,       text: 'text-rose-400',      bg: 'bg-rose-500/15',  bar: 'from-rose-500 to-rose-400' },
  sub_compiler:     { icon: Terminal,     text: 'text-indigo-400',    bg: 'bg-indigo-500/15', bar: 'from-indigo-500 to-indigo-400' },
  sub_os:           { icon: Server,       text: 'text-orange-400',    bg: 'bg-orange-500/15', bar: 'from-orange-500 to-amber-400' },
  sub_dbms:         { icon: Database,     text: 'text-warn',          bg: 'bg-warn/15',      bar: 'from-warn to-yellow-400' },
  sub_cn:           { icon: Network,      text: 'text-teal-400',      bg: 'bg-teal-500/15',  bar: 'from-teal-500 to-teal-400' },
};

const DEFAULT_STYLE = { icon: Sparkles, text: 'text-ink-muted', bg: 'bg-panel-raised', bar: 'from-signal to-pulse' };

function formatTime(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function FocusBanner({ onSessionSave }: { onSessionSave: () => void }) {
  const [time, setTime] = useState(() => {
    const savedTime = localStorage.getItem('prepos_timer');
    return savedTime ? parseInt(savedTime, 10) : 0;
  });

  const [isRunning, setIsRunning] = useState(() => {
    return localStorage.getItem('prepos_timer_running') === 'true';
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    localStorage.setItem('prepos_timer', time.toString());
    localStorage.setItem('prepos_timer_running', isRunning.toString());
  }, [time, isRunning]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRunning) {
      interval = setInterval(() => setTime((prev) => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const handleStop = async () => {
    setIsRunning(false);
    if (time > 0) {
      setIsSaving(true);
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) console.error('Auth Error:', authError);

        const { error: dbError } = await supabase.from('prepos_sessions').insert([
          { user_email: user?.email || 'unknown', duration_seconds: time },
        ]);
        if (dbError) throw dbError;

        setTimeout(() => {
          alert(`🔥 Session Saved! You focused for ${formatTime(time)}.`);
        }, 100);

        setTime(0);
        localStorage.removeItem('prepos_timer');
        localStorage.removeItem('prepos_timer_running');

        window.dispatchEvent(new Event('prepos:session-saved'));
        onSessionSave();
      } catch (error) {
        console.error('Error saving session:', error);
        alert(`⚠️ Could not save to cloud, but you focused for ${formatTime(time)}.`);
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <div className="panel grid-texture p-6 md:p-8 relative overflow-hidden">
      <div className="flex items-center gap-2.5 mb-1">
        {isRunning ? (
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-stop opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-stop" />
          </span>
        ) : (
          <span className="h-2.5 w-2.5 rounded-full bg-ink-faint" />
        )}
        <span className="text-xs font-bold tracking-widest uppercase text-ink-muted">
          {isRunning ? 'Live Session' : 'Session Idle'}
        </span>
      </div>

      <div
        className={`font-mono tabular-readout text-5xl md:text-7xl font-bold tracking-tight text-center py-6 ${
          isRunning ? 'text-signal-bright' : 'text-ink'
        }`}
        style={isRunning ? { textShadow: '0 0 30px color-mix(in srgb, var(--color-signal) 55%, transparent)' } : undefined}
      >
        {formatTime(time)}
      </div>

      <div className="flex items-center justify-center gap-3">
        {!isRunning ? (
          <button
            onClick={() => setIsRunning(true)}
            disabled={isSaving}
            className="flex items-center gap-2 bg-gradient-to-r from-signal to-pulse text-white px-6 py-2.5 rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-current" />
            {time > 0 ? 'Resume' : 'Start Grind'}
          </button>
        ) : (
          <button
            onClick={() => setIsRunning(false)}
            className="flex items-center gap-2 bg-warn text-void px-6 py-2.5 rounded-xl font-bold hover:opacity-90 transition-opacity"
          >
            <Pause className="w-4 h-4 fill-current" />
            Pause
          </button>
        )}

        {(time > 0 || isRunning) && (
          <button
            onClick={handleStop}
            disabled={isSaving}
            className="flex items-center gap-2 bg-panel-raised hover:bg-edge text-ink px-4 py-2.5 rounded-xl font-bold transition-colors disabled:opacity-50"
          >
            {isSaving ? (
              <span className="animate-spin h-4 w-4 border-2 border-ink border-t-transparent rounded-full" />
            ) : (
              <Square className="w-4 h-4 text-stop fill-current" />
            )}
            {isSaving ? 'Saving...' : 'Finish'}
          </button>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon, label, value, accent, sublabel,
}: {
  icon: typeof Flame; label: string; value: string; accent: string; sublabel: string;
}) {
  return (
    <div className="panel p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-bold text-ink-faint uppercase tracking-widest">{label}</span>
        <Icon className={`w-4 h-4 ${accent}`} />
      </div>
      <div className={`font-mono text-3xl font-bold ${accent}`}>{value}</div>
      <p className="text-xs text-ink-faint mt-1.5">{sublabel}</p>
    </div>
  );
}

function SubjectCard({ subject }: { subject: Subject }) {
  const { progress } = useSubjectProgress(subject.id);
  const style = SUBJECT_STYLE[subject.id] ?? DEFAULT_STYLE;
  const Icon = style.icon;

  return (
    <Link
      to={`/subject/${subject.id}`}
      className="panel panel-hover p-5 flex flex-col hover:shadow-lg"
    >
      <div className="flex items-start justify-between mb-4">
        <span className="text-xs font-mono font-semibold text-ink-faint">
          {subject.topics.length} topics
        </span>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${style.bg}`}>
          <Icon className={`w-[18px] h-[18px] ${style.text}`} />
        </div>
      </div>

      <h3 className="text-sm font-semibold text-ink-muted mb-2">{subject.name}</h3>

      <div className="flex items-end justify-between mb-3">
        <span className={`font-mono text-3xl font-bold ${style.text}`}>{progress}%</span>
        <span className="text-xs font-bold px-2 py-1 rounded-md bg-panel-raised text-ink-muted">
          {subject.weightage} Marks
        </span>
      </div>

      <div className="w-full bg-panel-raised rounded-full h-1.5 mt-auto">
        <div
          className={`h-1.5 rounded-full bg-gradient-to-r ${style.bar} transition-all duration-500`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const todayTasks = useTodayTasks();
  const { totalSeconds, refetch } = useTodayFocusTime();
  const { currentStreak, refetch: refetchStreak } = useStreak();
  const analytics = useAnalytics();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const handleSessionSave = () => {
    refetch();
    refetchStreak();
  };

  const formatTotalTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m`;
    return `${seconds}s`;
  };

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <header className="mb-8 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-ink tracking-tight">
            Dashboard
          </h1>
          <p className="text-ink-muted mt-2 font-mono text-sm">
            {formatFullDate(now)} · {formatClockTime(now)} · GATE 2027 in {getDaysUntilExam()} days
          </p>
        </div>
      </header>

      <FocusNextActions tasks={todayTasks} />

      <TodayRevisionReminder />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-10">
        <div className="lg:col-span-2">
          <FocusBanner onSessionSave={handleSessionSave} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <StatCard
            icon={Flame}
            label="Streak"
            value={`${currentStreak}`}
            accent="text-warn"
            sublabel="days in a row"
          />
          <StatCard
            icon={Clock}
            label="Today"
            value={formatTotalTime(totalSeconds)}
            accent="text-signal-bright"
            sublabel="focus time"
          />
          <StatCard
            icon={Target}
            label="Accuracy"
            value={analytics ? `${analytics.overallAccuracy}%` : '—'}
            accent="text-go"
            sublabel="overall PYQ"
          />
          <StatCard
            icon={CalendarClock}
            label="Exam"
            value={`${getDaysUntilExam()}d`}
            accent="text-pulse-bright"
            sublabel="GATE 2027"
          />
        </div>
      </div>

      <DailyStudyChart />

      <StudyHeatmap />

      <WeakSubjectAlerts />

      <section className="mb-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-display font-bold text-ink">Today's Tasks</h2>
          <span className="px-3 py-1 rounded-full bg-panel border border-edge text-ink-muted text-xs font-bold font-mono">
            {todayTasks.length} pending
          </span>
        </div>

        {todayTasks.length === 0 ? (
          <div className="panel p-8 text-center">
            <p className="text-ink-muted">🎉 No pending tasks for today.</p>
          </div>
        ) : (
          <div className="panel divide-y divide-edge overflow-hidden">
            {todayTasks.map((task, index) => (
              <Link
                key={task.id}
                to={`/subject/${task.subjectId}`}
                className="flex items-center gap-4 p-4 hover:bg-panel-raised transition-colors"
              >
                <div
                  className={`w-9 h-9 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    index === 0 ? 'border-warn bg-warn/10' : 'border-edge-bright'
                  }`}
                >
                  <span className="text-[10px] font-mono font-bold text-ink-muted">
                    {task.priority}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-ink text-sm truncate">{task.topicName}</h3>
                    {index === 0 && (
                      <span className="text-[10px] font-bold bg-gradient-to-r from-warn to-orange-400 text-void px-1.5 py-0.5 rounded shrink-0">
                        HIGH YIELD
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-ink-faint mt-0.5">
                    {task.subjectName} · {task.title}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-mono font-semibold text-ink-muted block">
                    ⏱ {task.estimatedMinutes}m
                  </span>
                  <span className="text-xs font-semibold text-signal-bright">{task.actionLabel} →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <RevisionLookahead />

      <section className="mb-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-display font-bold text-ink">Subject Coverage</h2>
          <span className="text-sm text-ink-faint font-mono">
            {typedGateData.subjects.length} subjects
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {typedGateData.subjects.map((subject) => (
            <SubjectCard key={subject.id} subject={subject} />
          ))}
        </div>
      </section>
    </div>
  );
}
