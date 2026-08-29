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

  const upcoming = events.slice(0, 3);
  const totalCities = new Set(events.map(e => e.cidade?.toLowerCase())).size;

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative -mx-4 sm:-mx-6 lg:-mx-8 -mt-8 mb-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900 via-amber-950 to-stone-900" />
        <div className="absolute inset-0 opacity-[0.07]" style={{backgroundImage:'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'}} />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
          <div className="flex flex-col items-center text-center space-y-8">
            {location && (
              <div className="animate-fade-up inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 px-5 py-2.5 rounded-full text-sm font-medium" style={{animationDelay:'0.1s'}}>
                <MapPin className="w-4 h-4 text-brand-400" />
                Eventos em <strong>{capitalizeWords(location.cidade)} – {location.estado}</strong>
              </div>
            )}

            <h1
              className="animate-fade-up font-display text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]"
              style={{animationDelay:'0.2s'}}
            >
              Cultura{' '}
              <span className="bg-gradient-to-r from-brand-400 via-amber-300 to-orange-300 bg-clip-text text-transparent">
                Perto
              </span>
              <br className="hidden sm:block" />
              <span className="text-2xl sm:text-3xl lg:text-5xl font-bold text-white/70">de você.</span>
            </h1>

            <p
              className="animate-fade-up text-lg sm:text-xl text-white/60 max-w-xl leading-relaxed"
              style={{animationDelay:'0.35s'}}
            >
              Descubra eventos culturais na sua região. Música, teatro, dança, artes visuais — tudo acontecendo perto de onde você está.
            </p>

            <div
              className="animate-fade-up flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
              style={{animationDelay:'0.5s'}}
            >
              <Link
                to="/eventos"
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-brand-500 hover:bg-brand-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg shadow-brand-500/25 hover:shadow-xl hover:shadow-brand-500/30 hover:-translate-y-0.5"
              >
                <Compass className="w-5 h-5" />
                Explorar eventos
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/cadastrar"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200"
              >
                <PlusCircle className="w-5 h-5" />
                Cadastrar evento
              </Link>
            </div>

            {/* Stats */}
            {events.length > 0 && (
              <div
                className="animate-fade-up flex flex-wrap justify-center gap-8 sm:gap-12 pt-8 border-t border-white/10"
                style={{animationDelay:'0.65s'}}
              >
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{events.length}</div>
                  <div className="text-sm text-white/50 font-medium">Eventos ativos</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{totalCities}</div>
                  <div className="text-sm text-white/50 font-medium">Cidades</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{events.filter(e => e.preco === 'gratuito').length}</div>
                  <div className="text-sm text-white/50 font-medium">Gratuitos</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Próximos eventos */}
      {upcoming.length > 0 && (
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-stone-900">Próximos eventos</h2>
              <p className="text-stone-500 mt-1">Não perca o que acontece na sua região</p>
            </div>
            <Link to="/eventos" className="hidden sm:inline-flex items-center gap-1.5 text-brand-600 hover:text-brand-700 font-semibold text-sm transition-colors">
              Ver todos <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcoming.map((evento, i) => {
              const CatIcon = CATEGORY_ICONS[evento.categoria] || Sparkles;
              return (
                <Link
                  key={evento.id}
                  to={`/eventos/${evento.id}`}
                  className="group block bg-white rounded-2xl border border-stone-100 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                  style={{animationDelay:`${i * 0.1}s`}}
                >
                  <div className="h-44 bg-gradient-to-br from-brand-100 via-amber-50 to-orange-50 relative overflow-hidden">
                    {evento.imagemCapa ? (
                      <img src={evento.imagemCapa} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <CatIcon className="w-16 h-16 text-brand-300/60" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-stone-700 shadow-sm">{evento.categoria}</span>
                    </div>
                    <div className="absolute top-3 right-3">
                      {evento.preco === 'gratuito' ? (
                        <span className="px-3 py-1 bg-emerald-500 text-white rounded-full text-xs font-bold shadow-sm">Grátis</span>
                      ) : (
                        <span className="px-3 py-1 bg-brand-500 text-white rounded-full text-xs font-bold shadow-sm">{evento.valorIngresso || 'Pago'}</span>
                      )}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-stone-900 text-lg mb-2 line-clamp-2 group-hover:text-brand-600 transition-colors">{evento.nomeEvento}</h3>
                    <p className="text-stone-500 text-sm line-clamp-2 mb-3">{evento.descricaoCurta}</p>
                    <div className="flex items-center gap-4 text-sm text-stone-400">
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
          <Link to="/eventos" className="sm:hidden mt-6 w-full inline-flex items-center justify-center gap-2 text-brand-600 hover:text-brand-700 font-semibold py-3 border border-brand-200 rounded-xl hover:bg-brand-50 transition-all">
            Ver todos os eventos <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      )}

      {/* CTA */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-amber-50 to-orange-50 rounded-3xl border border-brand-100 p-8 sm:p-12 mb-8">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-brand-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-amber-200/30 rounded-full blur-3xl" />
        <div className="relative flex flex-col sm:flex-row items-center gap-8">
          <div className="flex-1">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-stone-900 mb-3">Sua comunidade precisa de você</h2>
            <p className="text-stone-600 text-lg leading-relaxed">
              Tem um evento cultural acontecendo? Divulgue aqui e conecte sua comunidade à cultura local.
            </p>
          </div>
          <Link
            to="/cadastrar"
            className="shrink-0 inline-flex items-center gap-2.5 bg-brand-600 hover:bg-brand-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg shadow-brand-600/20 hover:shadow-xl hover:-translate-y-0.5"
          >
            <PlusCircle className="w-5 h-5" />
            Cadastrar agora
          </Link>
        </div>
      </section>
    </div>
  );
}
