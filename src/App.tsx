/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { useEffect } from 'react';
import BottomNav from './components/BottomNav';
import Editorials from './pages/Editorials';
import Classics from './pages/Classics';
import Settings from './pages/Settings';

export default function App() {
  useEffect(() => {
    let startX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      
      const touch = e.touches[0];
      const deltaX = touch.clientX - startX;
      
      // Swipe from left edge (within 20px) triggers Safari's back navigation.
      // We only prevent it if it's a clear horizontal rightward swipe.
      if (startX < 20 && deltaX > 5) {
        e.preventDefault();
      }
      
      // Right edge swipe forward navigation
      const deltaXRight = startX - touch.clientX;
      if (window.innerWidth - startX < 20 && deltaXRight > 5) {
        e.preventDefault();
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true, capture: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false, capture: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart, { capture: true });
      document.removeEventListener('touchmove', handleTouchMove, { capture: true });
    };
  }, []);

  return (
    <BrowserRouter>
      <div className="font-sans antialiased text-[#1A1A1A] bg-[#FCFAF7] min-h-screen">
        <Routes>
          <Route path="/" element={<Editorials />} />
          <Route path="/classics" element={<Classics />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}
