import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getEvents } from '../lib/events';
import { EventData, ESTADOS_BRASILEIROS, EventCategory } from '../types';
import { Search, Calendar, MapPin, Accessibility, AlertCircle, X, CalendarDays } from 'lucide-react';
import { capitalizeWords, daysUntil, CATEGORY_COLORS } from '../lib/utils';
import { useLocation } from '../context/LocationContext';

const CATEGORIAS: EventCategory[] = [
  'Música', 'Teatro', 'Dança', 'Literatura', 'Cinema',
  'Artes visuais', 'Cultura popular', 'Oficina',
  'Feira cultural', 'Gastronomia cultural', 'Outro'
];

export default function EventList() {
  const { location } = useLocation();
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [categoria, setCategoria] = useState('');
  const [preco, setPreco] = useState('');
  const [acessivel, setAcessivel] = useState(false);
  const [filtroData, setFiltroData] = useState('todos');
  const [locationFilterActive, setLocationFilterActive] = useState(false);

  useEffect(() => {
    if (location) {
      setEstado(location.estado);
      setCidade(location.cidade);
      setLocationFilterActive(true);
    }
  }, [location]);

  useEffect(() => {
    async function loadEvents() {
      try { setEvents(await getEvents()); }
      catch { setError(true); }
      finally { setLoading(false); }
    }
    loadEvents();
  }, []);

  const clearLocationFilter = () => { setEstado(''); setCidade(''); setLocationFilterActive(false); };

  const filteredEvents = events.filter(evento => {
    if (search) {
      const s = search.toLowerCase();
      if (!evento.nomeEvento.toLowerCase().includes(s) && !evento.descricaoCurta.toLowerCase().includes(s) && !evento.cidade.toLowerCase().includes(s) && !evento.bairro.toLowerCase().includes(s) && !evento.localEvento.toLowerCase().includes(s)) return false;
    }
    if (cidade && evento.cidade.toLowerCase() !== cidade.toLowerCase()) return false;
    if (estado && evento.estado !== estado) return false;
    if (categoria && evento.categoria !== categoria) return false;
    if (preco && evento.preco !== preco) return false;
    if (acessivel && !evento.acessivel) return false;
    if (filtroData !== 'todos' && evento.dataEvento) {
      const d = new Date(evento.dataEvento + 'T00:00:00');
      const h = new Date(); h.setHours(0,0,0,0);
      const diff = Math.round((d.getTime() - h.getTime()) / (86400000));
      if (!isNaN(diff)) {
        if (filtroData === 'hoje' && diff !== 0) return false;
        if (filtroData === '7dias' && (diff < 0 || diff > 7)) return false;
        if (filtroData === '30dias' && (diff < 0 || diff > 30)) return false;
      }
    }
    return true;
  }).sort((a, b) => {
    const da = a.dataEvento ? new Date(a.dataEvento + 'T00:00:00').getTime() : Infinity;
    const db = b.dataEvento ? new Date(b.dataEvento + 'T00:00:00').getTime() : Infinity;
    return da - db;
  });

  const hasDemo = events.some(e => e.demonstracao);

  if (loading) return (
    <div className="space-y-8">
      <div>
        <div className="h-8 w-64 shimmer-bg rounded-xl mb-2" />
        <div className="h-4 w-48 shimmer-bg rounded-lg" />
      </div>
      <div className="bg-white p-6 rounded-2xl border border-stone-100">
        <div className="h-12 shimmer-bg rounded-xl mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-10 shimmer-bg rounded-lg" />)}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1,2,3].map(i => (
          <div key={i} className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
            <div className="h-44 shimmer-bg" />
            <div className="p-5 space-y-3">
              <div className="h-4 w-20 shimmer-bg rounded-full" />
              <div className="h-6 w-3/4 shimmer-bg rounded-lg" />
              <div className="h-4 w-full shimmer-bg rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (error) return (
    <div className="text-center mt-20">
      <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-8 h-8 text-red-400" />
      </div>
      <p className="text-stone-600 text-lg font-medium mb-1">Erro ao carregar eventos</p>
      <p className="text-stone-400 text-sm">Tente recarregar a página.</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in" role="region" aria-label="Lista de eventos culturais">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-stone-900 mb-2">Eventos Culturais</h1>
          <p className="text-stone-500">Descubra o que está acontecendo perto de você.</p>
        </div>
        {hasDemo && (
          <div className="bg-amber-50 text-amber-700 px-4 py-2 rounded-xl text-sm flex items-center gap-2 border border-amber-100">
            <AlertCircle className="w-4 h-4" />
            <span>Alguns eventos são de demonstração.</span>
          </div>
        )}
      </div>

      {locationFilterActive && location && (
        <div className="bg-brand-50 border border-brand-100 rounded-2xl px-5 py-4 flex items-center justify-between flex-wrap gap-3 animate-fade-up">
          <div className="flex items-center gap-2 text-brand-800">
            <MapPin className="w-5 h-5 text-brand-500" />
            <span className="font-medium">
              Mostrando eventos de <strong>{capitalizeWords(location.cidade)} – {location.estado}</strong>
            </span>
          </div>
          <button onClick={clearLocationFilter} className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-800 underline underline-offset-2 transition-colors" aria-label="Limpar filtro de localização e ver todos os eventos">
            <X className="w-3.5 h-3.5" /> Ver todos
          </button>
        </div>
      )}

      <div className="bg-white p-6 rounded-2xl shadow-card border border-stone-100">
        <div className="relative mb-5">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" aria-hidden="true" />
          <input
            type="search"
            placeholder="Buscar por nome, cidade, bairro ou local..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:border-brand-400 focus:ring-2 focus:ring-brand-500/10 outline-none transition-all text-sm"
            aria-label="Buscar eventos"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3" role="group" aria-label="Filtros de busca">
          <select value={estado} onChange={e => { setEstado(e.target.value); setLocationFilterActive(false); }} className="rounded-xl border-stone-200 border p-2.5 text-sm bg-stone-50 focus:bg-white focus:border-brand-400 focus:ring-2 focus:ring-brand-500/10 outline-none transition-all" aria-label="Filtrar por estado">
            <option value="">Todos os estados</option>
            {ESTADOS_BRASILEIROS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
          </select>
          <input type="text" placeholder="Cidade" value={cidade} onChange={e => { setCidade(e.target.value); setLocationFilterActive(false); }} className="rounded-xl border-stone-200 border p-2.5 text-sm bg-stone-50 focus:bg-white focus:border-brand-400 focus:ring-2 focus:ring-brand-500/10 outline-none transition-all" aria-label="Filtrar por cidade" />
          <select value={categoria} onChange={e => setCategoria(e.target.value)} className="rounded-xl border-stone-200 border p-2.5 text-sm bg-stone-50 focus:bg-white focus:border-brand-400 focus:ring-2 focus:ring-brand-500/10 outline-none transition-all" aria-label="Filtrar por categoria">
            <option value="">Todas categorias</option>
            {CATEGORIAS.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <select value={preco} onChange={e => setPreco(e.target.value)} className="rounded-xl border-stone-200 border p-2.5 text-sm bg-stone-50 focus:bg-white focus:border-brand-400 focus:ring-2 focus:ring-brand-500/10 outline-none transition-all" aria-label="Filtrar por preço">
            <option value="">Qualquer preço</option>
            <option value="gratuito">Gratuito</option>
            <option value="pago">Pago</option>
          </select>
          <select value={filtroData} onChange={e => setFiltroData(e.target.value)} className="rounded-xl border-stone-200 border p-2.5 text-sm bg-stone-50 focus:bg-white focus:border-brand-400 focus:ring-2 focus:ring-brand-500/10 outline-none transition-all" aria-label="Filtrar por data">
            <option value="todos">Qualquer data</option>
            <option value="hoje">Hoje</option>
            <option value="7dias">Próximos 7 dias</option>
            <option value="30dias">Próximos 30 dias</option>
          </select>
          <label className="flex items-center gap-2 text-sm text-stone-600 cursor-pointer bg-stone-50 border border-stone-200 rounded-xl p-2.5 justify-center hover:bg-stone-100 transition-colors">
            <input type="checkbox" checked={acessivel} onChange={e => setAcessivel(e.target.checked)} className="w-4 h-4 rounded text-brand-500 focus:ring-brand-500 border-stone-300" />
            <Accessibility className="w-4 h-4" /> Acessíveis
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="list" aria-label="Eventos encontrados">
        {filteredEvents.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-stone-100">
            <div className="w-16 h-16 bg-stone-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CalendarDays className="w-8 h-8 text-stone-300" />
            </div>
            <p className="text-stone-500 text-lg font-medium mb-1">Nenhum evento encontrado</p>
            <p className="text-stone-400 text-sm mb-4">
              <Link to="/cadastrar" className="text-brand-600 font-semibold hover:underline">Cadastre o primeiro evento</Link> da sua região.
            </p>
          </div>
        ) : (
          filteredEvents.map((evento, i) => {
            const catColor = CATEGORY_COLORS[evento.categoria] || CATEGORY_COLORS['Outro'];
            const badge = daysUntil(evento.dataEvento);
            return (
              <Link
                key={evento.id}
                to={`/eventos/${evento.id}`}
                role="listitem"
                className="group bg-white rounded-2xl border border-stone-100 shadow-card hover:shadow-card-hover overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1"
                style={{animationDelay:`${i * 0.05}s`}}
              >
                <div className="w-full h-48 bg-stone-100 relative overflow-hidden">
                  {evento.imagemCapa ? (
                    <img src={evento.imagemCapa} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gradient-to-br from-brand-50 to-amber-50">
                      <span className="text-5xl opacity-40">{catColor.icon}</span>
                    </div>
                  )}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className={`px-2.5 py-1 ${catColor.bg} ${catColor.text} rounded-full text-xs font-semibold`}>{evento.categoria}</span>
                  </div>
                  <div className="absolute top-3 right-3">
                    {badge && (
                      <span className="px-2.5 py-1 bg-brand-500 text-white rounded-full text-xs font-bold shadow-md">{badge}</span>
                    )}
                  </div>
                  <div className="absolute bottom-3 right-3">
                    {evento.preco === 'gratuito' ? (
                      <span className="px-2.5 py-1 bg-emerald-500 text-white rounded-full text-xs font-bold">Grátis</span>
                    ) : (
                      <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm text-stone-700 rounded-full text-xs font-semibold">{evento.valorIngresso || 'Pago'}</span>
                    )}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-stone-900 mb-1.5 line-clamp-2 group-hover:text-brand-600 transition-colors">{evento.nomeEvento}</h3>
                  <p className="text-sm text-stone-500 line-clamp-2 mb-4 flex-1">{evento.descricaoCurta}</p>

                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-stone-500 gap-2">
                      <Calendar className="w-4 h-4 text-stone-400 shrink-0" aria-hidden="true" />
                      <span>
                        {evento.dataEvento ? new Date(evento.dataEvento + 'T00:00:00').toLocaleDateString('pt-BR') : 'Data não informada'}
                        {evento.dataFim && evento.dataFim !== evento.dataEvento && ` a ${new Date(evento.dataFim + 'T00:00:00').toLocaleDateString('pt-BR')}`}
                        {evento.horaEvento ? ` às ${evento.horaEvento}` : ''}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-stone-500 gap-2">
                      <MapPin className="w-4 h-4 text-stone-400 shrink-0" aria-hidden="true" />
                      <span className="truncate">{capitalizeWords(evento.bairro)}, {capitalizeWords(evento.cidade)} – {evento.estado}</span>
                    </div>
                    {evento.acessivel && (
                      <div className="flex items-center text-sm text-emerald-600 gap-1.5 font-medium">
                        <Accessibility className="w-4 h-4 shrink-0" aria-hidden="true" />
                        <span>Acessível</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 border-t border-stone-50">
                  <span className="block w-full text-center bg-stone-50 group-hover:bg-brand-50 group-hover:text-brand-600 group-hover:border-brand-200 text-stone-600 font-medium py-2.5 rounded-xl border border-stone-100 transition-all text-sm">
                    Ver detalhes
                  </span>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
