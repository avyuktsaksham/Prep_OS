// src/App.tsx
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import SubjectPage from './pages/SubjectPage';
import Analytics from './pages/Analytics';
import MistakeVault from './pages/MistakeVault';
import AuthGate from './components/auth/AuthGate';
import { db } from './db/index';
import { supabase } from './lib/supabaseClient';

export default function App() {

  // Dev-only: expose db/supabase on window for debugging via browser console.
  useEffect(() => {
    if (import.meta.env.DEV) {
      (window as unknown as { db: typeof db }).db = db;
      (window as unknown as { supabase: typeof supabase }).supabase = supabase;
    }

    db.open()
      .then(() => console.log("PrepOS DB initialized successfully!"))
      .catch((err) => console.error("DB Initialization failed:", err));
  }, []);

  return (
    <AuthGate>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/subject/:id" element={<SubjectPage />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/mistakes" element={<MistakeVault />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthGate>
  );
}