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
import { getFirebaseReady } from './lib/firebase';
import { LocationProvider } from './context/LocationContext';
import { MapPin, Home as HomeIcon } from 'lucide-react';

function NotFound() {
  return (
    <div className="text-center mt-20 animate-fade-in">
      <div className="w-20 h-20 bg-stone-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
        <span className="text-4xl font-display font-bold text-stone-300">404</span>
      </div>
      <h2 className="text-2xl font-display font-bold text-stone-900 mb-3">Página não encontrada</h2>
      <p className="text-stone-500 mb-6">O que você procura não existe ou foi movido.</p>
      <Link to="/" className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-sm">
        <HomeIcon className="w-4 h-4" /> Voltar ao início
      </Link>
    </div>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getFirebaseReady().then(() => {
      seedDemoEvents().then(() => setReady(true)).catch(() => setReady(true));
    });
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 bg-gradient-to-br from-brand-400 to-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-500/20">
            <MapPin className="w-8 h-8 text-white animate-pulse" />
          </div>
          <p className="text-stone-500 font-medium">Carregando Cultura Perto...</p>
        </div>
      </div>
    );
  }

  return (
    <LocationProvider>
      <Router>
        <div className="min-h-screen bg-stone-50 flex flex-col font-body text-stone-900">
          <LocationModal />
          <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[300] focus:bg-brand-500 focus:text-white focus:px-4 focus:py-2 focus:rounded-xl focus:font-semibold">
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

          <footer className="w-full bg-white border-t border-stone-200 mt-auto" role="contentinfo">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                <div>
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-display font-bold text-stone-900">Cultura Perto</span>
                  </div>
                  <p className="text-stone-500 text-sm leading-relaxed">Conectando pessoas a eventos culturais nas suas comunidades.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-stone-900 mb-3 text-sm">Navegação</h3>
                  <ul className="space-y-2 text-sm text-stone-500">
                    <li><Link to="/" className="hover:text-brand-600 transition-colors">Início</Link></li>
                    <li><Link to="/eventos" className="hover:text-brand-600 transition-colors">Eventos</Link></li>
                    <li><Link to="/cadastrar" className="hover:text-brand-600 transition-colors">Cadastrar evento</Link></li>
                    <li><Link to="/indicadores" className="hover:text-brand-600 transition-colors">Indicadores</Link></li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-stone-900 mb-3 text-sm">Sobre</h3>
                  <ul className="space-y-2 text-sm text-stone-500">
                    <li><Link to="/sobre" className="hover:text-brand-600 transition-colors">Sobre o projeto</Link></li>
                    <li><span className="text-stone-400">Desafio dos Dados 2026</span></li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-stone-900 mb-3 text-sm">Tema</h3>
                  <p className="text-stone-500 text-sm leading-relaxed">Ampliação do Acesso à Cultura — Tema 2 do Desafio dos Dados 2026.</p>
                </div>
              </div>
              <div className="border-t border-stone-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-stone-400 text-sm">&copy; 2026 Cultura Perto. Projeto open source.</p>
                <div className="flex items-center gap-4 text-sm text-stone-400">
                  <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer" className="hover:text-brand-500 transition-colors">CC BY 4.0</a>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </Router>
    </LocationProvider>
  );
}
