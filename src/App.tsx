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
      // Swipe from left edge (within 35px) triggers Safari's back navigation.
      if (startX < 35 && e.touches.length > 0 && e.touches[0].clientX > startX) {
        e.preventDefault();
      }
      
      // Also optionally block right edge swipe forward navigation
      if (window.innerWidth - startX < 35 && e.touches.length > 0 && e.touches[0].clientX < startX) {
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
