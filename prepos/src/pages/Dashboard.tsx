// src/pages/Dashboard.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, Brain, Sigma, Binary, CircuitBoard, Cpu, Code2,
  GitBranch, Layers, Terminal, Server, Database, Network,
  Flame, Clock, Target, CalendarClock,
} from 'lucide-react';
import gateData from '../data/gate.json';
import { useSubjectProgress } from '../hooks/useSubjectProgress';
import { useTodayTasks } from '../hooks/useTodayTasks';
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
import StudyTimer from '../components/cards/StudyTimer';

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
          <StudyTimer onSessionSave={handleSessionSave} />
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
