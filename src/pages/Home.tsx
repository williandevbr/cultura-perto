import { Link } from 'react-router-dom';
import { Compass, PlusCircle, MapPin, CalendarDays, Sparkles, ArrowRight, Music, Theater, Palette } from 'lucide-react';
import { useLocation } from '../context/LocationContext';
import { capitalizeWords } from '../lib/utils';
import { useEffect, useState } from 'react';
import { getEvents } from '../lib/events';
import { EventData } from '../types';

const CATEGORY_ICONS: Record<string, typeof Music> = {
  'Música': Music, 'Teatro': Theater, 'Artes visuais': Palette,
};

export default function Home() {
  const { location } = useLocation();
  const [events, setEvents] = useState<EventData[]>([]);

  useEffect(() => {
    getEvents().then(setEvents).catch(() => {});
  }, []);

  const filtered = location
    ? events.filter(e => e.cidade?.toLowerCase() === location.cidade.toLowerCase())
    : events;
  const upcoming = filtered.slice(0, 3);
  const totalCities = new Set(events.map(e => e.cidade?.toLowerCase())).size;

  return (
    <div>
      {/* Hero - claro como nos prints */}
      <section className="flex flex-col items-center justify-center text-center max-w-3xl mx-auto space-y-8 py-8">
        {location && (
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-5 py-2.5 rounded-full text-sm font-medium">
            <MapPin className="w-4 h-4" />
            Eventos em <strong>{capitalizeWords(location.cidade)} – {location.estado}</strong>
          </div>
        )}

        <div className="space-y-6">
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-gray-900">
            Cultura Perto
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 font-medium leading-relaxed">
            Descubra e divulgue eventos culturais perto de você
          </p>
        </div>

        <p className="text-lg text-gray-500 italic max-w-lg">
          "A cultura local ganha força quando a comunidade sabe onde ela acontece."
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link
            to="/eventos"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-sm hover:shadow-md"
          >
            <Compass className="w-5 h-5" />
            Ver eventos
          </Link>
          <Link
            to="/cadastrar"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 px-8 py-4 rounded-xl font-semibold text-lg transition-all"
          >
            <PlusCircle className="w-5 h-5" />
            Cadastrar evento
          </Link>
        </div>

        {filtered.length > 0 && (
          <div className="flex flex-wrap justify-center gap-8 sm:gap-12 pt-8 border-t border-gray-200 w-full">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{filtered.length}</div>
              <div className="text-sm text-gray-500 font-medium">Eventos ativos</div>
            </div>
            {location ? (
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">1</div>
                <div className="text-sm text-gray-500 font-medium">Cidade</div>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">{totalCities}</div>
                <div className="text-sm text-gray-500 font-medium">Cidades</div>
              </div>
            )}
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{filtered.filter(e => e.preco === 'gratuito').length}</div>
              <div className="text-sm text-gray-500 font-medium">Gratuitos</div>
            </div>
          </div>
        )}
      </section>

      {/* Próximos eventos */}
      {upcoming.length > 0 && (
        <section className="mt-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {location ? `Eventos em ${capitalizeWords(location.cidade)}` : 'Próximos eventos'}
              </h2>
              <p className="text-gray-500 mt-1">
                {location ? 'O que acontece na sua região' : 'Não perca o que acontece perto de você'}
              </p>
            </div>
            <Link to="/eventos" className="hidden sm:inline-flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 font-semibold text-sm">
              Ver todos <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcoming.map((evento) => {
              const CatIcon = CATEGORY_ICONS[evento.categoria] || Sparkles;
              return (
                <Link
                  key={evento.id}
                  to={`/eventos/${evento.id}`}
                  className="group block bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 overflow-hidden"
                >
                  <div className="h-44 bg-emerald-50 relative overflow-hidden">
                    {evento.imagemCapa ? (
                      <img src={evento.imagemCapa} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <CatIcon className="w-16 h-16 text-emerald-300" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-700 shadow-sm">{evento.categoria}</span>
                    </div>
                    <div className="absolute top-3 right-3">
                      {evento.preco === 'gratuito' ? (
                        <span className="px-3 py-1 bg-emerald-500 text-white rounded-full text-xs font-bold shadow-sm">Grátis</span>
                      ) : (
                        <span className="px-3 py-1 bg-gray-900 text-white rounded-full text-xs font-bold shadow-sm">{evento.valorIngresso || 'Pago'}</span>
                      )}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">{evento.nomeEvento}</h3>
                    <p className="text-gray-500 text-sm line-clamp-2 mb-3">{evento.descricaoCurta}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      {evento.dataEvento && (
                        <span className="flex items-center gap-1.5">
                          <CalendarDays className="w-4 h-4" />
                          {new Date(evento.dataEvento + 'T00:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        {capitalizeWords(evento.cidade)}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
          <Link to="/eventos" className="sm:hidden mt-6 w-full inline-flex items-center justify-center gap-2 text-emerald-600 hover:text-emerald-700 font-semibold py-3 border border-emerald-200 rounded-xl hover:bg-emerald-50">
            Ver todos os eventos <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      )}


    </div>
  );
}
