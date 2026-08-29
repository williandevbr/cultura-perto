/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import CreateEvent from './pages/CreateEvent';
import EventList from './pages/EventList';
import EventDetails from './pages/EventDetails';
import Indicators from './pages/Indicators';
import About from './pages/About';
import { seedDemoEvents } from './lib/seed';

export default function App() {
  useEffect(() => {
    seedDemoEvents();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
        <Navbar />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cadastrar" element={<CreateEvent />} />
            <Route path="/eventos" element={<EventList />} />
            <Route path="/eventos/:id" element={<EventDetails />} />
            <Route path="/indicadores" element={<Indicators />} />
            <Route path="/sobre" element={<About />} />
          </Routes>
        </main>
        
        <footer className="w-full bg-white border-t border-gray-200 py-6 mt-auto">
          <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
            {/* Footer content removed per user request */}
          </div>
        </footer>
      </div>
    </Router>
  );
}
