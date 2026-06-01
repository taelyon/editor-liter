/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Application main route entry
// Trigger git modification for Sync to GitHub
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { useEffect } from 'react';
import BottomNav from './components/BottomNav';
import Editorials from './pages/Editorials';
import Classics from './pages/Classics';
import Settings from './pages/Settings';
import Movies from './pages/Movies';
import Books from './pages/Books';

export default function App() {
  useEffect(() => {
    // Touch event swipe prevention removed to avoid iframe side-effects.
  }, []);

  return (
    <BrowserRouter>
      <div className="font-sans antialiased text-[#1A1A1A] bg-[#FCFAF7] min-h-screen">
        <Routes>
          <Route path="/" element={<Editorials />} />
          <Route path="/classics" element={<Classics />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/books" element={<Books />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}
