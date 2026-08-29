import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getEvents } from '../lib/events';
import { EventData, ESTADOS_BRASILEIROS, EventCategory } from '../types';
import { Search, Calendar, MapPin, Accessibility, AlertCircle } from 'lucide-react';

import { capitalizeWords } from '../lib/utils';

const CATEGORIAS: EventCategory[] = [
  'Música', 'Teatro', 'Dança', 'Literatura', 'Cinema', 
  'Artes visuais', 'Cultura popular', 'Oficina', 
  'Feira cultural', 'Gastronomia cultural', 'Outro'
];

export default function EventList() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  
  // Filtros
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [categoria, setCategoria] = useState('');
  const [preco, setPreco] = useState('');
  const [acessivel, setAcessivel] = useState(false);
  const [filtroData, setFiltroData] = useState('todos');

  useEffect(() => {
    async function loadEvents() {
      try {
        const data = await getEvents();
        setEvents(data);
      } catch (err) {
        console.error("Erro ao buscar eventos", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, []);

  const filteredEvents = events.filter(evento => {
    // Busca por texto
    if (search) {
      const s = search.toLowerCase();
      const match = 
        evento.nomeEvento.toLowerCase().includes(s) ||
        evento.descricaoCurta.toLowerCase().includes(s) ||
        evento.cidade.toLowerCase().includes(s) ||
        evento.bairro.toLowerCase().includes(s) ||
        evento.localEvento.toLowerCase().includes(s);
      if (!match) return false;
    }

    // Filtros exatos
    if (cidade && evento.cidade.toLowerCase() !== cidade.toLowerCase()) return false;
    if (estado && evento.estado !== estado) return false;
    if (categoria && evento.categoria !== categoria) return false;
    if (preco && evento.preco !== preco) return false;
    if (acessivel && !evento.acessivel) return false;

    // Filtro de data
    if (filtroData !== 'todos' && evento.dataEvento) {
      const dataEvento = new Date(evento.dataEvento + 'T00:00:00'); // Trata timezone local
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      const msPorDia = 24 * 60 * 60 * 1000;
      const diffDias = Math.round((dataEvento.getTime() - hoje.getTime()) / msPorDia);

      if (!isNaN(diffDias)) {
        if (filtroData === 'hoje' && diffDias !== 0) return false;
        if (filtroData === '7dias' && (diffDias < 0 || diffDias > 7)) return false;
        if (filtroData === '30dias' && (diffDias < 0 || diffDias > 30)) return false;
      }
    }

    return true;
  }).sort((a, b) => {
    const dataA = a.dataEvento ? new Date(a.dataEvento + 'T00:00:00').getTime() : Infinity;
    const dataB = b.dataEvento ? new Date(b.dataEvento + 'T00:00:00').getTime() : Infinity;
    return dataA - dataB;
  });

  const hasDemo = events.some(e => e.demonstracao);

  if (loading) {
    return <div className="text-center mt-20 text-gray-500">Carregando eventos...</div>;
  }

  if (error) {
    return <div className="text-center mt-20 text-red-500">Erro ao carregar eventos. Tente recarregar a página.</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Eventos Culturais</h1>
          <p className="text-gray-600">Descubra o que está acontecendo perto de você.</p>
        </div>
        
        {hasDemo && (
          <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>Alguns eventos são de demonstração.</span>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="relative mb-6">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome, cidade, bairro, local..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <select value={estado} onChange={e => setEstado(e.target.value)} className="w-full rounded-lg border-gray-300 border p-2.5 text-sm bg-white">
            <option value="">Todos os estados</option>
            {ESTADOS_BRASILEIROS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
          </select>
          <input type="text" placeholder="Cidade" value={cidade} onChange={e => setCidade(e.target.value)} className="w-full rounded-lg border-gray-300 border p-2.5 text-sm" />
          <select value={categoria} onChange={e => setCategoria(e.target.value)} className="w-full rounded-lg border-gray-300 border p-2.5 text-sm bg-white">
            <option value="">Todas categorias</option>
            {CATEGORIAS.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <select value={preco} onChange={e => setPreco(e.target.value)} className="w-full rounded-lg border-gray-300 border p-2.5 text-sm bg-white">
            <option value="">Qualquer preço</option>
            <option value="gratuito">Gratuito</option>
            <option value="pago">Pago</option>
          </select>
          <select value={filtroData} onChange={e => setFiltroData(e.target.value)} className="w-full rounded-lg border-gray-300 border p-2.5 text-sm bg-white">
            <option value="todos">Qualquer data</option>
            <option value="hoje">Hoje</option>
            <option value="7dias">Próximos 7 dias</option>
            <option value="30dias">Próximos 30 dias</option>
          </select>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer bg-gray-50 border border-gray-200 rounded-lg p-2.5 justify-center hover:bg-gray-100">
            <input type="checkbox" checked={acessivel} onChange={e => setAcessivel(e.target.checked)} className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300" />
            <span>Acessíveis</span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-gray-100">
            <p className="text-gray-500 text-lg">
              Nenhum evento encontrado.{' '}
              <Link to="/cadastrar" className="text-emerald-600 font-medium hover:underline">
                Cadastre o primeiro evento cultural da sua região.
              </Link>
            </p>
          </div>
        ) : (
          filteredEvents.map(evento => (
            <div key={evento.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
              {evento.imagemCapa && (
                <div className="w-full h-48 bg-gray-100">
                  <img src={evento.imagemCapa} alt={evento.nomeEvento} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
                    {evento.categoria}
                  </span>
                  {evento.preco === 'gratuito' ? (
                    <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">
                      Gratuito
                    </span>
                  ) : (
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                      Pago
                    </span>
                  )}
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{evento.nomeEvento}</h3>
                
                <div className="space-y-2 mt-4 flex-1">
                  <div className="flex items-center text-sm text-gray-600 gap-2">
                    <Calendar className="w-4 h-4 shrink-0" />
                    <span>
                      {evento.dataEvento ? new Date(evento.dataEvento + 'T00:00:00').toLocaleDateString('pt-BR') : 'Data não informada'} 
                      {evento.dataFim && evento.dataFim !== evento.dataEvento && ` a ${new Date(evento.dataFim + 'T00:00:00').toLocaleDateString('pt-BR')}`}
                      {evento.horaEvento ? ` às ${evento.horaEvento}` : ''}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 gap-2">
                    <MapPin className="w-4 h-4 shrink-0" />
                    <span className="truncate">{capitalizeWords(evento.cidade)} - {evento.estado}</span>
                  </div>
                  {evento.acessivel && (
                    <div className="flex items-center text-sm text-emerald-600 gap-2 font-medium mt-2">
                      <Accessibility className="w-4 h-4 shrink-0" />
                      <span>Acessível</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-4 border-t border-gray-50 bg-gray-50/50">
                <Link to={`/eventos/${evento.id}`} className="block w-full text-center bg-white border border-gray-200 hover:border-emerald-600 hover:text-emerald-700 text-gray-800 font-medium py-2 rounded-lg transition-colors">
                  Ver detalhes
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
