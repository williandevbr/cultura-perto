import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import LocationModal from './components/LocationModal';
import Home from './pages/Home';
import CreateEvent from './pages/CreateEvent';
import EventList from './pages/EventList';
import EventDetails from './pages/EventDetails';
import Indicators from './pages/Indicators';
import About from './pages/About';
import { seedDemoEvents } from './lib/seed';
import { LocationProvider } from './context/LocationContext';
import { MapPin, Home as HomeIcon } from 'lucide-react';

function NotFound() {
  return (
    <div className="text-center mt-20">
      <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
        <span className="text-4xl font-bold text-emerald-300">404</span>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-3">Página não encontrada</h2>
      <p className="text-gray-500 mb-6">O que você procura não existe ou foi movido.</p>
      <Link to="/" className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-all">
        <HomeIcon className="w-4 h-4" /> Voltar ao início
      </Link>
    </div>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    seedDemoEvents().then(() => setReady(true)).catch(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-white animate-pulse" />
          </div>
          <p className="text-gray-500 font-medium">Carregando Cultura Perto...</p>
        </div>
      </div>
    );
  }

  return (
    <LocationProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
          <LocationModal />
          <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[300] focus:bg-emerald-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-xl focus:font-semibold">
            Pular para o conteúdo
          </a>
          <Navbar />
          <main id="main-content" className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/cadastrar" element={<CreateEvent />} />
              <Route path="/eventos" element={<EventList />} />
              <Route path="/eventos/:id" element={<EventDetails />} />
              <Route path="/indicadores" element={<Indicators />} />
              <Route path="/sobre" element={<About />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <footer className="w-full bg-white border-t border-gray-200 py-6 mt-auto">
            <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
              Cultura Perto — Conectando pessoas a eventos culturais
            </div>
          </footer>
        </div>
      </Router>
    </LocationProvider>
  );
}
