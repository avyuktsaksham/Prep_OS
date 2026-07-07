import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import SubjectPage from './pages/SubjectPage';
import Analytics from './pages/Analytics';
import MistakeVault from './pages/MistakeVault';

export default function App() {
  return (
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
  );
}