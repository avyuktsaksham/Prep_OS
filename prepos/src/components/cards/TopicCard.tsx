import { useState, useEffect } from "react";
import LectureModal from '../modals/LectureModal';
import NotesModal from '../modals/NotesModal';
import PyqModal from '../modals/PyqModal';
import RevisionModal from '../modals/RevisionModal';
import { saveLecture, getLecture, updateLecture, deleteLecture } from '../../db/lectureService';
import { saveNotes, getNotes, updateNotes, deleteNotes } from '../../db/notesService';
import { savePyq, getPyq, updatePyq, deletePyq } from '../../db/pyqService';
import { saveRevision, getRevision, updateRevision, deleteRevision } from '../../db/revisionService';
import type { Resource, Revision } from '../../types';
import { useTopicProgress } from '../../hooks/useTopicProgress';

interface Topic {
  id: string;
  name: string;
}

interface TopicCardProps {
  topic: Topic;
}

export default function TopicCard({ topic }: TopicCardProps) {
  const { progress, confidence } = useTopicProgress(topic.id);

  const [isLectureModalOpen, setIsLectureModalOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [isPyqModalOpen, setIsPyqModalOpen] = useState(false);
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);

  const [lecture, setLecture] = useState<Resource | null>(null);
  const [notes, setNotes] = useState<Resource | null>(null);
  const [pyq, setPyq] = useState<(Resource & { totalQuestions?: number }) | null>(null);
  const [revision, setRevision] = useState<Revision | null>(null);

  const loadResources = async () => {
    try {
      const [lectureData, notesData, pyqData, revisionData] = await Promise.all([
        getLecture(topic.id),
        getNotes(topic.id),
        getPyq(topic.id),
        getRevision(topic.id)
      ]);
      setLecture(lectureData || null);
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
    if (lecture) {
      await updateLecture(topic.id, {
        title: data.title,
        url: data.url,
        durationMinutes: data.durationMinutes,
        watchedMinutes: data.watchedMinutes,
        completed: data.completed,
        lastWatchedAt:
  data.watchedMinutes > 0 ? Date.now() : undefined,
      });
    } else {
      await saveLecture(topic.id, {
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
  } catch (error) {
    console.error('Failed to save lecture:', error);
  }
};

  const handleDeleteLecture = async () => {
    if (window.confirm('Are you sure you want to delete this lecture?')) {
      try {
        await deleteLecture(topic.id);
await loadResources();
      } catch (error) {
        console.error('Failed to delete lecture:', error);
      }
    }
  };

  const handleContinueLecture = () => {
    if (lecture?.url) {
      window.open(lecture.url, '_blank', 'noopener,noreferrer');
    }
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

  const duration = lecture?.durationMinutes || 0;
  const watched = lecture?.watchedMinutes || 0;
  const progressPercent =
  lecture?.completed
    ? 100
    : duration > 0
      ? Math.min(100, Math.round((watched / duration) * 100))
      : 0;

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
        {/* Top Row: Name & Badge */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-5">
          <h3 className="text-xl font-bold text-gray-900 leading-tight">
            {topic.name}
          </h3>
          <span className="inline-flex shrink-0 items-center px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-100">
            Confidence: {confidence}%
          </span>
        </div>

        {/* Overall Topic Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-semibold text-gray-600">Completion</span>
            <span className="font-bold text-gray-900">{progress}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        {/* Active Lecture Details */}
        {lecture && (
          <div className="mb-4 bg-blue-50 border border-blue-100 rounded-xl p-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <div>
                <h4 className="font-bold text-gray-900 text-sm">{lecture.title}</h4>
                <p className="text-xs font-medium text-gray-500 mt-1">
  {watched} / {duration} mins watched
</p>

{lecture.completed && (
  <p className="text-xs font-semibold text-green-600 mt-1">
    ✓ Completed
  </p>
)}
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsLectureModalOpen(true)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-wider"
                >
                  Edit
                </button>
                <button 
                  onClick={handleDeleteLecture}
                  className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors uppercase tracking-wider"
                >
                  Delete
                </button>
              </div>
            </div>
            
            <div className="w-full bg-blue-200/50 rounded-full h-2 mb-5">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all" 
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>

            <button 
              onClick={handleContinueLecture}
              className="w-full flex items-center justify-center py-2.5 px-4 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
            >
              Continue Lecture
            </button>
          </div>
        )}

        {/* Active Notes Details */}
        {notes && (
          <div className="mb-4 bg-yellow-50 border border-yellow-100 rounded-xl p-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <div>
                <h4 className="font-bold text-gray-900 text-sm">Notes</h4>
                <p className="text-sm font-medium text-gray-700 mt-1">{notes.title}</p>
                <p className="text-xs font-medium text-gray-500 mt-1">
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
                  className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-xs font-bold hover:bg-red-50 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Active PYQ Details */}
        {pyq && (
          <div className="mb-4 bg-purple-50 border border-purple-100 rounded-xl p-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <div>
                <h4 className="font-bold text-gray-900 text-sm">{pyq.title || 'PYQs'}</h4>
                <p className="text-xs font-medium text-gray-500 mt-1">
                  Total Questions: {pyq.totalQuestions || 0}
                </p>
                <p className="text-xs font-medium text-gray-500">
                  Accuracy: {pyq.accuracy || 0}%
                </p>
              </div>
              <div className="flex items-center gap-3 mt-3 sm:mt-0">
                <button 
                  onClick={() => setIsPyqModalOpen(true)}
                  className="px-4 py-2 bg-purple-100 text-purple-800 rounded-lg text-xs font-bold hover:bg-purple-200 transition-colors"
                >
                  Open PYQ
                </button>
                <button 
                  onClick={handleDeletePyq}
                  className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-xs font-bold hover:bg-red-50 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
            
            <div className="w-full bg-purple-200/50 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all" 
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
                <h4 className="font-bold text-gray-900 text-sm">Spaced Repetition</h4>
                <p className="text-xs font-medium text-gray-500 mt-1">
                  Next Review: {new Date(revision.nextReviewDate).toLocaleDateString()}
                </p>
                <p className="text-xs font-medium text-gray-500">
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
                  className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-xs font-bold hover:bg-red-50 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-8">
          {!lecture && (
            <button 
              onClick={() => setIsLectureModalOpen(true)}
              className="flex-1 min-w-[140px] flex items-center justify-center py-2.5 px-4 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors shadow-sm"
            >
              Start Lecture
            </button>
          )}
          {!notes && (
            <button 
              onClick={() => setIsNotesModalOpen(true)}
              className="flex-1 min-w-[140px] flex items-center justify-center py-2.5 px-4 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
            >
              Add Notes
            </button>
          )}
          {!pyq && (
            <button 
              onClick={() => setIsPyqModalOpen(true)}
              className="flex-1 min-w-[140px] flex items-center justify-center py-2.5 px-4 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
            >
              PYQs
            </button>
          )}
          {!revision && (
            <button 
              onClick={() => setIsRevisionModalOpen(true)}
              className="flex-1 min-w-[140px] flex items-center justify-center py-2.5 px-4 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
            >
              Revision
            </button>
          )}
        </div>

        {/* Bottom Section: Status Timeline */}
        <div className="pt-6 border-t border-gray-100">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6">
            Learning Pipeline
          </div>
          
          <div className="relative px-4">
            {/* Connecting Track */}
            <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1 bg-gray-100 rounded-full z-0"></div>
            
            {/* Timeline Nodes */}
            <div className="relative z-10 flex items-center justify-between">
              
              {/* Node: Lecture (Active/Pending) */}
              <div className="flex flex-col items-center gap-2">
                <div className={`w-8 h-8 rounded-full border-4 border-white flex items-center justify-center transition-all ${lecture ? 'bg-blue-600 shadow-sm' : 'bg-gray-100'}`}>
                  {lecture && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
                </div>
                <span className={`text-xs font-bold ${lecture ? 'text-blue-700' : 'text-gray-400'}`}>Lecture</span>
              </div>

              {/* Node: PYQ (Active/Pending) */}
              <div className="flex flex-col items-center gap-2">
                <div className={`w-8 h-8 rounded-full border-4 border-white flex items-center justify-center transition-all ${pyq ? 'bg-purple-600 shadow-sm' : 'bg-gray-100'}`}>
                  {pyq && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
                </div>
                <span className={`text-xs font-medium ${pyq ? 'text-purple-700' : 'text-gray-400'}`}>PYQ</span>
              </div>

              {/* Node: Revision (Active/Pending) */}
              <div className="flex flex-col items-center gap-2">
                <div className={`w-8 h-8 rounded-full border-4 border-white flex items-center justify-center transition-all ${revision ? 'bg-teal-600 shadow-sm' : 'bg-gray-100'}`}>
                  {revision && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
                </div>
                <span className={`text-xs font-medium ${revision ? 'text-teal-700' : 'text-gray-400'}`}>Revision</span>
              </div>

              {/* Node: Mastered (Pending) */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-100 border-4 border-white flex items-center justify-center transition-all">
                </div>
                <span className="text-xs font-medium text-gray-400">Mastered</span>
              </div>

            </div>
          </div>
        </div>
      </div>

      <LectureModal
  open={isLectureModalOpen}
  onClose={() => setIsLectureModalOpen(false)}
  onSave={handleSaveLecture}
  initialData={
    lecture
      ? {
          title: lecture.title,
          url: lecture.url || '',
          durationMinutes: lecture.durationMinutes || 0,
          watchedMinutes: lecture.watchedMinutes || 0,
          completed: lecture.completed || false,
        }
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
    </>
  );
}