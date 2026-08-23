// src/components/cards/StudyTimer.tsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, Square, Coffee, Repeat } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

type TechniqueKey = 'stopwatch' | 'pomodoro' | 'fiftytwo' | 'deepwork';
type Phase = 'work' | 'break' | 'longbreak';

interface Technique {
  key: TechniqueKey;
  label: string;
  workMin: number | null; // null = freeform, counts up with no fixed length
  breakMin: number;
  longBreakMin?: number;
  cyclesForLongBreak?: number;
}

const TECHNIQUES: Technique[] = [
  { key: 'stopwatch', label: 'Freeform', workMin: null, breakMin: 0 },
  { key: 'pomodoro', label: 'Pomodoro', workMin: 25, breakMin: 5, longBreakMin: 15, cyclesForLongBreak: 4 },
  { key: 'fiftytwo', label: '52 / 17', workMin: 52, breakMin: 17 },
  { key: 'deepwork', label: 'Deep Work', workMin: 90, breakMin: 20 },
];

const STORAGE_KEYS = {
  technique: 'prepos_technique',
  phase: 'prepos_phase',
  secondsLeft: 'prepos_seconds_left',
  workAccum: 'prepos_work_accum',
  cycles: 'prepos_cycles',
  running: 'prepos_timer_running',
};

function formatTime(totalSeconds: number) {
  const s = Math.max(0, totalSeconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0
    ? `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
    : `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

function getTechnique(key: TechniqueKey): Technique {
  return TECHNIQUES.find((t) => t.key === key) ?? TECHNIQUES[0];
}

function playChime() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 660;
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch {
    // Audio not available — silently skip, notification still fires
  }
}

function notify(title: string, body: string) {
  playChime();
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/icon-192.png' });
  }
}

interface StudyTimerProps {
  onSessionSave: () => void;
}

export default function StudyTimer({ onSessionSave }: StudyTimerProps) {
  const [technique, setTechnique] = useState<TechniqueKey>(
    () => (localStorage.getItem(STORAGE_KEYS.technique) as TechniqueKey) || 'stopwatch'
  );
  const [phase, setPhase] = useState<Phase>(
    () => (localStorage.getItem(STORAGE_KEYS.phase) as Phase) || 'work'
  );
  const [secondsLeft, setSecondsLeft] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.secondsLeft);
    return saved ? parseInt(saved, 10) : 0;
  });
  const [workAccum, setWorkAccum] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.workAccum);
    return saved ? parseInt(saved, 10) : 0;
  });
  const [cycles, setCycles] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.cycles);
    return saved ? parseInt(saved, 10) : 0;
  });
  const [isRunning, setIsRunning] = useState<boolean>(
    () => localStorage.getItem(STORAGE_KEYS.running) === 'true'
  );
  const [isSaving, setIsSaving] = useState(false);

  const currentTechnique = getTechnique(technique);
  const isFreeform = currentTechnique.workMin === null;

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.technique, technique);
    localStorage.setItem(STORAGE_KEYS.phase, phase);
    localStorage.setItem(STORAGE_KEYS.secondsLeft, secondsLeft.toString());
    localStorage.setItem(STORAGE_KEYS.workAccum, workAccum.toString());
    localStorage.setItem(STORAGE_KEYS.cycles, cycles.toString());
    localStorage.setItem(STORAGE_KEYS.running, isRunning.toString());
  }, [technique, phase, secondsLeft, workAccum, cycles, isRunning]);

  const advancePhase = useCallback(() => {
    const t = getTechnique(technique);
    if (t.workMin === null) return;

    if (phase === 'work') {
      const nextCycles = cycles + 1;
      setCycles(nextCycles);

      const shouldLongBreak =
        t.longBreakMin && t.cyclesForLongBreak && nextCycles % t.cyclesForLongBreak === 0;

      if (shouldLongBreak) {
        setPhase('longbreak');
        setSecondsLeft((t.longBreakMin ?? t.breakMin) * 60);
        notify('Long break time! ☕', `Great work — take ${t.longBreakMin} minutes off.`);
      } else {
        setPhase('break');
        setSecondsLeft(t.breakMin * 60);
        notify('Break time! ☕', `Nice focus block — take ${t.breakMin} minutes off.`);
      }
    } else {
      setPhase('work');
      setSecondsLeft((t.workMin ?? 25) * 60);
      notify('Back to work 🎯', `Break's over — next focus block is ${t.workMin} minutes.`);
    }
  }, [technique, phase, cycles]);

  const tickRef = useRef(advancePhase);
  tickRef.current = advancePhase;

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      if (isFreeform) {
        setWorkAccum((prev) => prev + 1);
        return;
      }

      setSecondsLeft((prev) => {
        if (prev <= 1) {
          tickRef.current();
          return 0;
        }
        return prev - 1;
      });

      setPhase((currentPhase) => {
        if (currentPhase === 'work') {
          setWorkAccum((prev) => prev + 1);
        }
        return currentPhase;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, isFreeform]);

  const handleStart = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    if (!isFreeform && secondsLeft === 0) {
      setSecondsLeft((currentTechnique.workMin ?? 25) * 60);
      setPhase('work');
    }
    setIsRunning(true);
  };

  const handlePause = () => setIsRunning(false);

  const handleTechniqueChange = (key: TechniqueKey) => {
    if (isRunning) return;
    const t = getTechnique(key);
    setTechnique(key);
    setPhase('work');
    setSecondsLeft(t.workMin ? t.workMin * 60 : 0);
  };

  const handleFinish = async () => {
    setIsRunning(false);
    const totalToSave = workAccum;

    if (totalToSave > 0) {
      setIsSaving(true);
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) console.error('Auth Error:', authError);

        const { error: dbError } = await supabase.from('prepos_sessions').insert([
          { user_email: user?.email || 'unknown', duration_seconds: totalToSave },
        ]);
        if (dbError) throw dbError;

        setTimeout(() => {
          alert(`🔥 Session Saved! You focused for ${formatTime(totalToSave)}.`);
        }, 100);

        window.dispatchEvent(new Event('prepos:session-saved'));
        onSessionSave();
      } catch (error) {
        console.error('Error saving session:', error);
        alert(`⚠️ Could not save to cloud, but you focused for ${formatTime(totalToSave)}.`);
      } finally {
        setIsSaving(false);
      }
    }

    setWorkAccum(0);
    setCycles(0);
    setPhase('work');
    setSecondsLeft(currentTechnique.workMin ? currentTechnique.workMin * 60 : 0);
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
  };

  const displaySeconds = isFreeform ? workAccum : secondsLeft;
  const hasProgress = workAccum > 0 || (isRunning && !isFreeform);

  const phaseLabel = phase === 'work' ? 'Work' : phase === 'longbreak' ? 'Long Break' : 'Break';
  const isBreakPhase = phase !== 'work';

  return (
    <div className="panel grid-texture p-6 md:p-8 relative overflow-hidden">
      <div className="flex flex-wrap gap-1.5 mb-5">
        {TECHNIQUES.map((t) => (
          <button
            key={t.key}
            onClick={() => handleTechniqueChange(t.key)}
            disabled={isRunning}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
              technique === t.key
                ? 'bg-gradient-to-r from-signal to-pulse text-white'
                : 'bg-panel-raised text-ink-muted hover:bg-edge'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2.5 mb-1">
        {isRunning ? (
          <span className="relative flex h-2.5 w-2.5">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isBreakPhase ? 'bg-go' : 'bg-stop'}`} />
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isBreakPhase ? 'bg-go' : 'bg-stop'}`} />
          </span>
        ) : (
          <span className="h-2.5 w-2.5 rounded-full bg-ink-faint" />
        )}
        <span className="text-xs font-bold tracking-widest uppercase text-ink-muted">
          {!isRunning ? 'Session Idle' : isFreeform ? 'Live Session' : phaseLabel}
        </span>

        {!isFreeform && cycles > 0 && (
          <span className="flex items-center gap-1 text-xs font-mono font-semibold text-ink-faint ml-auto">
            <Repeat className="w-3 h-3" /> {cycles} done
          </span>
        )}
      </div>

      <div
        className={`font-mono tabular-readout text-5xl md:text-7xl font-bold tracking-tight text-center py-6 flex items-center justify-center gap-3 ${
          isBreakPhase ? 'text-go' : isRunning ? 'text-signal-bright' : 'text-ink'
        }`}
        style={
          isRunning
            ? {
                textShadow: `0 0 30px color-mix(in srgb, ${isBreakPhase ? 'var(--color-go)' : 'var(--color-signal)'} 55%, transparent)`,
              }
            : undefined
        }
      >
        {isBreakPhase && <Coffee className="w-10 h-10 md:w-12 md:h-12" />}
        {formatTime(displaySeconds)}
      </div>

      <div className="flex items-center justify-center gap-3">
        {!isRunning ? (
          <button
            onClick={handleStart}
            disabled={isSaving}
            className="flex items-center gap-2 bg-gradient-to-r from-signal to-pulse text-white px-6 py-2.5 rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-current" />
            {hasProgress ? 'Resume' : 'Start'}
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="flex items-center gap-2 bg-warn text-void px-6 py-2.5 rounded-xl font-bold hover:opacity-90 transition-opacity"
          >
            <Pause className="w-4 h-4 fill-current" />
            Pause
          </button>
        )}

        {(workAccum > 0 || isRunning) && (
          <button
            onClick={handleFinish}
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
