import { Link, useLocation } from 'react-router-dom';
import { MapPin, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Página Inicial', path: '/' },
    { name: 'Eventos', path: '/eventos' },
    { name: 'Cadastrar', path: '/cadastrar' },
    { name: 'Indicadores', path: '/indicadores' },
    { name: 'Sobre', path: '/sobre' },
  ];

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <MapPin className="h-6 w-6 text-emerald-600" />
              <span className="font-bold text-xl text-gray-900 tracking-tight">Cultura Perto</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors
                  ${location.pathname === link.path 
                    ? 'border-emerald-600 text-gray-900' 
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <span className="sr-only">Abrir menu</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="sm:hidden border-t border-gray-100 bg-white">
          <div className="pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium
                  ${location.pathname === link.path
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-700'
                    : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                  }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
