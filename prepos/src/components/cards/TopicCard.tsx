import { useState, useEffect } from "react";
import LectureModal from '../modals/LectureModal';
import NotesModal from '../modals/NotesModal';
import PyqModal from '../modals/PyqModal';
import RevisionModal from '../modals/RevisionModal';
import { addLecture, getLecturesByTopic, updateLectureById, deleteLectureById } from '../../db/lectureService';
import { saveNotes, getNotes, updateNotes, deleteNotes } from '../../db/notesService';
import { savePyq, getPyq, updatePyq, deletePyq } from '../../db/pyqService';
import { saveRevision, getRevision, updateRevision, deleteRevision } from '../../db/revisionService';
import type { Resource, Revision } from '../../types';
import { useTopicProgress } from '../../hooks/useTopicProgress';
import LogMistakeModal from "../mistakes/LogMistakeModal";
import { updatePyqResource } from "../../db/pyqService";
import type { MistakeItem } from "../../types";
import { getLectureCompletionPercent } from '../../engine/lectureProgress';
import { explainConcept } from '../../engine/conceptExplainEngine';

interface Topic {
  id: string;
  name: string;
}

interface TopicCardProps {
  topic: Topic;
  subjectName: string;
}

export default function TopicCard({ topic, subjectName }: TopicCardProps) {
  const { progress, confidence } = useTopicProgress(topic.id);

  const [explanation, setExplanation] = useState<string | null>(null);
  const [explainLoading, setExplainLoading] = useState(false);
  const [explainError, setExplainError] = useState<string | null>(null);

  const handleExplain = async () => {
    setExplainLoading(true);
    setExplainError(null);
    try {
      const result = await explainConcept(topic.name, subjectName);
      setExplanation(result);
    } catch (err) {
      setExplainError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setExplainLoading(false);
    }
  };

  const [isLectureModalOpen, setIsLectureModalOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [isPyqModalOpen, setIsPyqModalOpen] = useState(false);
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [isMistakeModalOpen, setIsMistakeModalOpen] = useState(false);

const [activePyq, setActivePyq] =
  useState<(Resource & { totalQuestions?: number }) | null>(null);

  const [lectures, setLectures] = useState<Resource[]>([]);
  const [editingLectureId, setEditingLectureId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Resource | null>(null);
  const [pyq, setPyq] = useState<(Resource & { totalQuestions?: number }) | null>(null);
  const [revision, setRevision] = useState<Revision | null>(null);

  const loadResources = async () => {
    try {
      const [lectureData, notesData, pyqData, revisionData] = await Promise.all([
        getLecturesByTopic(topic.id),
        getNotes(topic.id),
        getPyq(topic.id),
        getRevision(topic.id)
      ]);
      setLectures(lectureData || []);
      setNotes(notesData || null);
      setPyq(pyqData || null);
      setRevision(revisionData || null);
    } catch (error) {
      console.error('Failed to load resources:', error);
    }
  };

  useEffect(() => {
    loadResources();
  }, [topic.id]);

  // Lecture Handlers
  const handleSaveLecture = async (data: {
  title: string;
  url?: string;
  durationMinutes: number;
  watchedMinutes: number;
  completed: boolean;
}) => {
  try {
    if (editingLectureId) {
      await updateLectureById(editingLectureId, {
        title: data.title,
        url: data.url,
        durationMinutes: data.durationMinutes,
        watchedMinutes: data.watchedMinutes,
        completed: data.completed,
        lastWatchedAt:
  data.watchedMinutes > 0 ? Date.now() : undefined,
      });
    } else {
      await addLecture(topic.id, {
        title: data.title,
        url: data.url,
        durationMinutes: data.durationMinutes,
        watchedMinutes: data.watchedMinutes,
        completed: data.completed,
        lastWatchedAt:
  data.watchedMinutes > 0 ? Date.now() : undefined,
      });
    }

    await loadResources();
    setIsLectureModalOpen(false);
    setEditingLectureId(null);
  } catch (error) {
    console.error('Failed to save lecture:', error);
  }
};

  const handleDeleteLecture = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this lecture?')) {
      try {
        await deleteLectureById(id);
await loadResources();
      } catch (error) {
        console.error('Failed to delete lecture:', error);
      }
    }
  };

  const handleContinueLecture = (targetLecture: Resource) => {
  if (!targetLecture.url) {
    alert("Lecture URL not available.");
    return;
  }

  window.open(
    targetLecture.url,
    "_blank",
    "noopener,noreferrer"
  );
};

  // Notes Handlers
  const handleSaveNotes = async (data: { title: string; markdown: string }) => {
    try {
      if (notes) {
        await updateNotes(topic.id, {
          title: data.title,
          markdown: data.markdown,
        });
      } else {
        await saveNotes(topic.id, {
          title: data.title,
          markdown: data.markdown,
        });
      }
      await loadResources();
      setIsNotesModalOpen(false);
    } catch (error) {
      console.error('Failed to save notes:', error);
    }
  };

  const handleDeleteNotes = async () => {
    if (window.confirm('Are you sure you want to delete these notes?')) {
      try {
        await deleteNotes(topic.id);
await loadResources();
      } catch (error) {
        console.error('Failed to delete notes:', error);
      }
    }
  };

  // PYQ Handlers
  const handleSavePyq = async (data: { title: string; totalQuestions: number; correct: number; incorrect: number }) => {
    try {
      if (pyq) {
        await updatePyq(topic.id, {
          title: data.title,
          totalQuestions: data.totalQuestions,
          correct: data.correct,
          incorrect: data.incorrect,
        });
      } else {
        await savePyq(topic.id, {
          title: data.title,
          totalQuestions: data.totalQuestions,
          correct: data.correct,
          incorrect: data.incorrect,
        });
      }
      await loadResources();
      setIsPyqModalOpen(false);
    } catch (error) {
      console.error('Failed to save PYQs:', error);
    }
  };

  const handleDeletePyq = async () => {
    if (window.confirm('Are you sure you want to delete this PYQ progress?')) {
      try {
        await deletePyq(topic.id);
await loadResources();
      } catch (error) {
        console.error('Failed to delete PYQs:', error);
      }
    }
  };

  // Revision Handlers
  const handleSaveRevision = async (qualityRating: number) => {
    try {
      if (!revision) {
        await saveRevision(topic.id);
      }
      await updateRevision(topic.id, qualityRating);
      await loadResources();
      setIsRevisionModalOpen(false);
    } catch (error) {
      console.error('Failed to log revision:', error);
    }
  };

  const handleSaveMistake = async (data: {
  questionReference: string;
  notes: string;
  difficulty: "HARD" | "MEDIUM" | "EASY";
}) => {
  if (!activePyq) return;

  const newMistake: MistakeItem = {
    id: crypto.randomUUID(),
    questionReference: data.questionReference,
    notes: data.notes,
    difficulty: data.difficulty,
    status: "PENDING",
    attempts: 0,
    confidenceHistory: [],
    nextReviewDate: Date.now(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  await updatePyqResource({
  ...activePyq,
  mistakeItems: [
    ...(activePyq.mistakeItems || []),
    newMistake,
  ],
});

await loadResources();

setIsMistakeModalOpen(false);
setActivePyq(null);
};

  const handleDeleteRevision = async () => {
    if (window.confirm('Are you sure you want to delete this topic\'s revision schedule?')) {
      try {
        await deleteRevision(topic.id);
await loadResources();
      } catch (error) {
        console.error('Failed to delete revision:', error);
      }
    }
  };


  return (
    <>
      <div className="bg-void-raised rounded-2xl shadow-sm border border-edge p-6 hover:shadow-md transition-shadow duration-200">
        {/* Top Row: Name & Badge */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-5">
          <h3 className="text-xl font-bold text-ink leading-tight">
            {topic.name}
          </h3>
          <span className="inline-flex shrink-0 items-center px-3 py-1 rounded-full text-xs font-bold bg-go/10 text-go border border-green-100">
            Confidence: {confidence}%
          </span>
        </div>

        {/* Overall Topic Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-semibold text-ink-muted">Completion</span>
            <span className="font-bold text-ink">{progress}%</span>
          </div>
          <div className="w-full bg-panel-raised rounded-full h-2">
            <div className="bg-signal h-2 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        {confidence < 50 && (
          <div className="mb-6">
            <button
              onClick={handleExplain}
              disabled={explainLoading}
              className="text-xs font-bold text-pulse-bright hover:text-pulse-bright transition-colors disabled:opacity-50"
            >
              {explainLoading ? 'Explaining...' : '✦ Explain this concept'}
            </button>

            {explainError && (
              <div className="mt-2 p-3 bg-stop/10 border border-stop/30 rounded-lg text-xs font-medium text-stop">
                {explainError}
              </div>
            )}

            {explanation && !explainError && (
              <div className="mt-2 p-4 bg-pulse/10 border border-pulse/25 rounded-lg text-sm text-ink-muted whitespace-pre-wrap leading-relaxed">
                {explanation}
              </div>
            )}
          </div>
        )}

        {/* Active Lecture Details */}
        {lectures.length > 0 && (
          <div className="mb-4 space-y-3">
            {lectures.map((lec) => {
              const lecDuration = lec.durationMinutes || 0;
              const lecWatched = lec.watchedMinutes || 0;
              const lecProgressPercent = getLectureCompletionPercent(lec);

              return (
                <div key={lec.id} className="bg-signal/10 border border-signal/25 rounded-xl p-5">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                    <div>
                      <h4 className="font-bold text-ink text-sm">{lec.title}</h4>
                      <p className="text-xs font-medium text-ink-faint mt-1">
                        {lecWatched} / {lecDuration} mins watched
                      </p>

                      {lec.completed && (
                        <p className="text-xs font-semibold text-go mt-1">
                          ✓ Completed
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          setEditingLectureId(lec.id);
                          setIsLectureModalOpen(true);
                        }}
                        className="text-xs font-bold text-signal-bright hover:text-signal-bright transition-colors uppercase tracking-wider"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteLecture(lec.id)}
                        className="text-xs font-bold text-stop hover:text-stop transition-colors uppercase tracking-wider"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="w-full bg-signal/20 rounded-full h-2 mb-5">
                    <div
                      className="bg-signal h-2 rounded-full transition-all"
                      style={{ width: `${lecProgressPercent}%` }}
                    ></div>
                  </div>

                  <button
                    onClick={() => handleContinueLecture(lec)}
                    className="w-full flex items-center justify-center py-2.5 px-4 bg-signal text-ink rounded-lg text-sm font-semibold hover:bg-signal-bright transition-colors shadow-sm"
                  >
                    Continue Lecture
                  </button>
                </div>
              );
            })}

            <button
              onClick={() => {
                setEditingLectureId(null);
                setIsLectureModalOpen(true);
              }}
              className="w-full flex items-center justify-center py-2 px-4 bg-void-raised border border-dashed border-signal/30 text-signal-bright rounded-lg text-xs font-bold hover:bg-signal/10 transition-colors"
            >
              + Add Another Lecture
            </button>
          </div>
        )}

        {/* Active Notes Details */}
        {notes && (
          <div className="mb-4 bg-warn/10 border border-yellow-100 rounded-xl p-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <div>
                <h4 className="font-bold text-ink text-sm">Notes</h4>
                <p className="text-sm font-medium text-ink-muted mt-1">{notes.title}</p>
                <p className="text-xs font-medium text-ink-faint mt-1">
                  Last Updated: {new Date(notes.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-3 mt-3 sm:mt-0">
                <button 
                  onClick={() => setIsNotesModalOpen(true)}
                  className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-xs font-bold hover:bg-yellow-200 transition-colors"
                >
                  Open Notes
                </button>
                <button 
                  onClick={handleDeleteNotes}
                  className="px-4 py-2 bg-void-raised border border-stop/30 text-stop rounded-lg text-xs font-bold hover:bg-stop/10 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Active PYQ Details */}
        {pyq && (
          <div className="mb-4 bg-pulse/10 border border-pulse/25 rounded-xl p-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <div>
                <h4 className="font-bold text-ink text-sm">{pyq.title || 'PYQs'}</h4>
                <p className="text-xs font-medium text-ink-faint mt-1">
                  Total Questions: {pyq.totalQuestions || 0}
                </p>
                <p className="text-xs font-medium text-ink-faint">
                  Accuracy: {pyq.accuracy || 0}%
                </p>
              </div>
              <div className="flex items-center gap-3 mt-3 sm:mt-0">
                <button 
                  onClick={() => setIsPyqModalOpen(true)}
                  className="px-4 py-2 bg-purple-100 text-pulse-bright rounded-lg text-xs font-bold hover:bg-purple-200 transition-colors"
                >
                  Open PYQ
                </button>
                <button
                onClick={() => {
                  setActivePyq(pyq);
                  setIsMistakeModalOpen(true);
                }}
                className="px-4 py-2 bg-warn/15 text-warn rounded-lg text-xs font-bold hover:bg-warn/25 transition-colors">
                   Log Mistake
                   </button>
                <button 
                  onClick={handleDeletePyq}
                  className="px-4 py-2 bg-void-raised border border-stop/30 text-stop rounded-lg text-xs font-bold hover:bg-stop/10 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
            
            <div className="w-full bg-purple-200/50 rounded-full h-2">
              <div 
                className="bg-pulse h-2 rounded-full transition-all" 
                style={{ width: `${pyq.accuracy || 0}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Active Revision Details */}
        {revision && (
          <div className="mb-6 bg-teal-50 border border-teal-100 rounded-xl p-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <div>
                <h4 className="font-bold text-ink text-sm">Spaced Repetition</h4>
                <p className="text-xs font-medium text-ink-faint mt-1">
                  Next Review: {new Date(revision.nextReviewDate).toLocaleDateString()}
                </p>
                <p className="text-xs font-medium text-ink-faint">
                  Interval: {revision.interval} days | Reviews: {revision.reviewCount}
                </p>
              </div>
              <div className="flex items-center gap-3 mt-3 sm:mt-0">
                <button 
                  onClick={() => setIsRevisionModalOpen(true)}
                  className="px-4 py-2 bg-teal-100 text-teal-800 rounded-lg text-xs font-bold hover:bg-teal-200 transition-colors"
                >
                  Log Review
                </button>
                <button 
                  onClick={handleDeleteRevision}
                  className="px-4 py-2 bg-void-raised border border-stop/30 text-stop rounded-lg text-xs font-bold hover:bg-stop/10 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-8">
          {lectures.length === 0 && (
            <button 
              onClick={() => {
                setEditingLectureId(null);
                setIsLectureModalOpen(true);
              }}
              className="flex-1 min-w-[140px] flex items-center justify-center py-2.5 px-4 bg-void-raised text-ink rounded-lg text-sm font-semibold hover:bg-edge transition-colors shadow-sm"
            >
              Start Lecture
            </button>
          )}
          {!notes && (
            <button 
              onClick={() => setIsNotesModalOpen(true)}
              className="flex-1 min-w-[140px] flex items-center justify-center py-2.5 px-4 bg-void-raised border border-edge text-ink-muted rounded-lg text-sm font-semibold hover:bg-panel-raised hover:border-edge-bright transition-all shadow-sm"
            >
              Add Notes
            </button>
          )}
          {!pyq && (
            <button 
              onClick={() => setIsPyqModalOpen(true)}
              className="flex-1 min-w-[140px] flex items-center justify-center py-2.5 px-4 bg-void-raised border border-edge text-ink-muted rounded-lg text-sm font-semibold hover:bg-panel-raised hover:border-edge-bright transition-all shadow-sm"
            >
              PYQs
            </button>
          )}
          {!revision && (
            <button 
              onClick={() => setIsRevisionModalOpen(true)}
              className="flex-1 min-w-[140px] flex items-center justify-center py-2.5 px-4 bg-void-raised border border-edge text-ink-muted rounded-lg text-sm font-semibold hover:bg-panel-raised hover:border-edge-bright transition-all shadow-sm"
            >
              Revision
            </button>
          )}
        </div>

        {/* Bottom Section: Status Timeline */}
        <div className="pt-6 border-t border-edge">
          <div className="text-xs font-bold text-ink-faint uppercase tracking-wider mb-6">
            Learning Pipeline
          </div>
          
          <div className="relative px-4">
            {/* Connecting Track */}
            <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1 bg-panel-raised rounded-full z-0"></div>
            
            {/* Timeline Nodes */}
            <div className="relative z-10 flex items-center justify-between">
              
              {/* Node: Lecture (Active/Pending) */}
              <div className="flex flex-col items-center gap-2">
                <div className={`w-8 h-8 rounded-full border-4 border-void-raised flex items-center justify-center transition-all ${lectures.length > 0 ? 'bg-signal shadow-sm' : 'bg-panel-raised'}`}>
                  {lectures.length > 0 && <div className="w-2.5 h-2.5 bg-void-raised rounded-full"></div>}
                </div>
                <span className={`text-xs font-bold ${lectures.length > 0 ? 'text-signal-bright' : 'text-ink-faint'}`}>Lecture</span>
              </div>

              {/* Node: PYQ (Active/Pending) */}
              <div className="flex flex-col items-center gap-2">
                <div className={`w-8 h-8 rounded-full border-4 border-void-raised flex items-center justify-center transition-all ${pyq ? 'bg-pulse shadow-sm' : 'bg-panel-raised'}`}>
                  {pyq && <div className="w-2.5 h-2.5 bg-void-raised rounded-full"></div>}
                </div>
                <span className={`text-xs font-medium ${pyq ? 'text-purple-700' : 'text-ink-faint'}`}>PYQ</span>
              </div>

              {/* Node: Revision (Active/Pending) */}
              <div className="flex flex-col items-center gap-2">
                <div className={`w-8 h-8 rounded-full border-4 border-void-raised flex items-center justify-center transition-all ${revision ? 'bg-teal-500 shadow-sm' : 'bg-panel-raised'}`}>
                  {revision && <div className="w-2.5 h-2.5 bg-void-raised rounded-full"></div>}
                </div>
                <span className={`text-xs font-medium ${revision ? 'text-teal-700' : 'text-ink-faint'}`}>Revision</span>
              </div>

              {/* Node: Mastered */}
<div className="flex flex-col items-center gap-2">
  <div
    className={`w-8 h-8 rounded-full border-4 border-void-raised flex items-center justify-center transition-all ${
      progress === 100
        ? "bg-go shadow-sm"
        : "bg-panel-raised"
    }`}
  >
    {progress === 100 && (
      <div className="w-2.5 h-2.5 bg-void-raised rounded-full" />
    )}
  </div>

  <span
    className={`text-xs font-medium ${
      progress === 100
        ? "text-go"
        : "text-ink-faint"
    }`}
  >
    Mastered
  </span>
</div>

            </div>
          </div>
        </div>
      </div>

      <LectureModal
  open={isLectureModalOpen}
  onClose={() => {
    setIsLectureModalOpen(false);
    setEditingLectureId(null);
  }}
  onSave={handleSaveLecture}
  initialData={
    editingLectureId
      ? (() => {
          const editing = lectures.find((l) => l.id === editingLectureId);
          return editing
            ? {
                title: editing.title,
                url: editing.url || '',
                durationMinutes: editing.durationMinutes || 0,
                watchedMinutes: editing.watchedMinutes || 0,
                completed: editing.completed || false,
              }
            : undefined;
        })()
      : undefined
  }
/>

      <NotesModal
        open={isNotesModalOpen}
        onClose={() => setIsNotesModalOpen(false)}
        onSave={handleSaveNotes}
        initialData={notes ? {
          title: notes.title,
          markdown: notes.markdown || ''
        } : undefined}
      />

      <PyqModal
        open={isPyqModalOpen}
        onClose={() => setIsPyqModalOpen(false)}
        onSave={handleSavePyq}
        initialData={pyq ? {
          title: pyq.title,
          totalQuestions: pyq.totalQuestions || 0,
          correct: pyq.correct || 0,
          incorrect: pyq.incorrect || 0
        } : undefined}
      />

      <RevisionModal
        open={isRevisionModalOpen}
        onClose={() => setIsRevisionModalOpen(false)}
        onSave={handleSaveRevision}
      />

      <LogMistakeModal
  isOpen={isMistakeModalOpen}
  onClose={() => {
    setIsMistakeModalOpen(false);
    setActivePyq(null);
  }}
  onSave={handleSaveMistake}
/>
    </>
  );
}