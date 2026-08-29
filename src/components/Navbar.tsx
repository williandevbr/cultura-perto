import { Link, useLocation } from 'react-router-dom';
import { MapPin, Menu, X, Navigation } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLocation as useUserLocation } from '../context/LocationContext';
import { capitalizeWords } from '../lib/utils';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { location: userLocation, clearLocation } = useUserLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setIsOpen(false); }, [location.pathname]);

  const navLinks = [
    { name: 'Início', path: '/' },
    { name: 'Eventos', path: '/eventos' },
    { name: 'Cadastrar', path: '/cadastrar' },
    { name: 'Indicadores', path: '/indicadores' },
    { name: 'Sobre', path: '/sobre' },
  ];

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-xl border-b border-stone-200/60 shadow-sm'
          : 'bg-white border-b border-stone-100'
      }`}
      role="navigation"
      aria-label="Menu principal"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2.5 group" aria-label="Cultura Perto — Página inicial">
              <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl text-stone-900 tracking-tight hidden sm:block">
                Cultura Perto
              </span>
            </Link>

            {userLocation && (
              <div className="hidden md:flex items-center gap-1.5 bg-brand-50 text-brand-700 px-3 py-1.5 rounded-full text-xs font-medium border border-brand-100">
                <Navigation className="w-3 h-3" />
                <span>{capitalizeWords(userLocation.cidade)} – {userLocation.estado}</span>
                <button
                  onClick={clearLocation}
                  className="ml-1 text-brand-400 hover:text-brand-600 transition-colors"
                  title="Alterar localização"
                  aria-label="Remover localização"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-1">
            {navLinks.map((link) => {
              const active = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ${
                    active
                      ? 'text-brand-600 bg-brand-50'
                      : 'text-stone-500 hover:text-stone-800 hover:bg-stone-50'
                  }`}
                  aria-current={active ? 'page' : undefined}
                >
                  {link.name}
                  {active && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-brand-500 rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-stone-500 hover:text-stone-700 hover:bg-stone-100 transition-colors"
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
              aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
            >
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div id="mobile-menu" className="sm:hidden border-t border-stone-100 bg-white animate-fade-in">
          <div className="pt-2 pb-3 space-y-1 px-3">
            {userLocation && (
              <div className="px-3 py-2.5 mb-2 flex items-center gap-2 bg-brand-50 rounded-xl text-sm text-brand-700 border border-brand-100">
                <Navigation className="w-4 h-4" />
                <span className="font-medium">{capitalizeWords(userLocation.cidade)} – {userLocation.estado}</span>
                <button onClick={clearLocation} className="ml-auto text-brand-400 hover:text-brand-600" aria-label="Remover localização">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            {navLinks.map((link) => {
              const active = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-2.5 rounded-xl text-base font-medium transition-colors ${
                    active
                      ? 'bg-brand-50 text-brand-700 border-l-4 border-brand-500'
                      : 'text-stone-600 hover:bg-stone-50'
                  }`}
                  aria-current={active ? 'page' : undefined}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
