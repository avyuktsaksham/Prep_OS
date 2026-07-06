import React, { useState, useEffect } from 'react';

export interface LectureData {
  title: string;
  url?: string;
  durationMinutes: number;
  watchedMinutes: number;
  completed: boolean;
}

interface LectureModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: LectureData) => void;
  initialData?: {
  title: string;
  url: string;
  durationMinutes: number;
  watchedMinutes: number;
  completed: boolean;
};
}

export default function LectureModal({ open, onClose, onSave, initialData }: LectureModalProps) {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [duration, setDuration] = useState('');
  const [watchedMinutes, setWatchedMinutes] = useState('0');
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (open) {
      if (initialData) {
  setTitle(initialData.title);
  setUrl(initialData.url);
  setDuration(initialData.durationMinutes.toString());

  setWatchedMinutes(initialData.watchedMinutes.toString());
  setCompleted(initialData.completed);
} else {
  setTitle('');
  setUrl('');
  setDuration('');

  setWatchedMinutes('0');
  setCompleted(false);
}
    }
  }, [open, initialData]);

  if (!open) return null;
  const durationNum = Number(duration) || 0;
const watchedNum = Number(watchedMinutes) || 0;

const isValid =
  durationNum > 0 &&
  watchedNum >= 0 &&
  watchedNum <= durationNum;

  const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();

  if (!isValid) return;

  onSave({
    title,
    url,
    durationMinutes: durationNum,
    watchedMinutes: watchedNum,
    completed,
  });
};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden scale-in-95 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {initialData ? 'Edit Lecture' : 'Add Lecture'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors rounded-full p-1 hover:bg-gray-100"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-5">
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Lecture Title
              </label>
              <input
                id="title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Process Scheduling Algorithms"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400"
              />
            </div>

            <div>
              <label htmlFor="url" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Lecture URL
              </label>
              <input
                id="url"
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400"
              />
            </div>

            <div>
              <label htmlFor="duration" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Duration (minutes)
              </label>
              <input
                id="duration"
                type="number"
                required
                min="1"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="45"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400"
              />
            </div>
            <div>
  <label
    htmlFor="watchedMinutes"
    className="block text-sm font-semibold text-gray-700 mb-1.5"
  >
    Watched Minutes
  </label>

  <input
    id="watchedMinutes"
    type="number"
    min="0"
    max={duration || ""}
    value={watchedMinutes}
    onChange={(e) => {
      const value = e.target.value;

      setWatchedMinutes(value);

      if (value === "") {
  setCompleted(false);
  return;
}
      const watched = Number(value);
      const total = Number(duration);

      if (total > 0 && watched >= total) {
  setCompleted(true);
} else {
  setCompleted(false);
}
    }}
    placeholder="0"
    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
  />
</div>
<p className="text-xs text-gray-500 mt-1">
  Remaining: {Math.max(0, durationNum - watchedNum)} min
</p>
<div className="flex items-center">
  <input
    id="completed"
    type="checkbox"
    checked={completed}
    onChange={(e) => {
      const checked = e.target.checked;

      setCompleted(checked);

      if (checked) {
  setWatchedMinutes(duration);
}
    }}
    className="mr-3"
  />

  <label
    htmlFor="completed"
    className="text-sm font-semibold text-gray-700"
  >
    Mark as Completed
  </label>
</div>
{!isValid && (
  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm font-semibold text-red-600">
    Watched minutes cannot exceed lecture duration.
  </div>
)}
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all shadow-sm"
            >
              Cancel
            </button>
            <button
  type="submit"
  disabled={!isValid}
              className={`px-5 py-2.5 text-sm font-semibold text-white border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-sm ${
  isValid
    ? "bg-blue-600 hover:bg-blue-700"
    : "bg-blue-300 cursor-not-allowed"
}`}
            >
              {initialData ? 'Update Lecture' : 'Save Lecture'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}