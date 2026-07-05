// src/components/modals/NotesModal.tsx
import { useState, useEffect } from 'react';

export interface NotesData {
  title: string;
  markdown: string;
}

interface NotesModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: NotesData) => void;
  initialData?: {
    title: string;
    markdown: string;
  };
}

export default function NotesModal({ open, onClose, onSave, initialData }: NotesModalProps) {
  const [title, setTitle] = useState('');
  const [markdown, setMarkdown] = useState('');

  useEffect(() => {
    if (open) {
      if (initialData) {
        setTitle(initialData.title);
        setMarkdown(initialData.markdown);
      } else {
        setTitle('');
        setMarkdown('');
      }
    }
  }, [open, initialData]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      markdown,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden scale-in-95 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {initialData ? 'Edit Notes' : 'Add Notes'}
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

        <form onSubmit={handleSubmit} className="flex flex-col h-[70vh] max-h-[600px]">
          <div className="p-6 space-y-5 flex-grow flex flex-col">
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Note Title
              </label>
              <input
                id="title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Operating System Basics"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400"
              />
            </div>

            <div className="flex-grow flex flex-col">
              <label htmlFor="markdown" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Content (Markdown supported)
              </label>
              <textarea
                id="markdown"
                required
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                placeholder="Start typing your notes here..."
                className="w-full h-full min-h-[200px] resize-none px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400 font-mono"
              ></textarea>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 border border-transparent rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-sm"
            >
              {initialData ? 'Update Notes' : 'Save Notes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}