/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Routes, Route, BrowserRouter } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import Editorials from './pages/Editorials';
import Classics from './pages/Classics';
import Settings from './pages/Settings';

export default function App() {
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
