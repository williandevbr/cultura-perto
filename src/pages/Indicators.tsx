import { useEffect, useState, useMemo } from 'react';
import { getEvents } from '../lib/events';
import { EventData } from '../types';
import { Download, BarChart2, PieChart as PieChartIcon, MapPin, AlertTriangle, Calendar, Ticket, Accessibility, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Link } from 'react-router-dom';
import { capitalizeWords } from '../lib/utils';

const COLORS = ['#0ea5e9', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#14b8a6', '#6366f1', '#f43f5e'];

export default function Indicators() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getEvents();
        setEvents(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const stats = useMemo(() => {
    const total = events.length;
    const gratuitos = events.filter(e => e.preco === 'gratuito').length;
    const pagos = total - gratuitos;
    const acessiveis = events.filter(e => e.acessivel).length;

    const catMap = events.reduce((acc, e) => {
      const cat = e.categoria || 'Outro';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const catData = Object.entries(catMap).map(([name, value]) => ({ name, value })).sort((a, b) => (b.value as number) - (a.value as number));

    const cityMap = events.reduce((acc, e) => {
      const city = e.cidade ? capitalizeWords(e.cidade) : 'Desconhecido';
      acc[city] = (acc[city] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const cityData = Object.entries(cityMap).map(([name, value]) => ({ name, value })).sort((a, b) => (b.value as number) - (a.value as number));

    const bairroMap = events.reduce((acc, e) => {
      if (!e.bairro) return acc;
      const bairro = capitalizeWords(e.bairro) + (e.cidade ? ` (${capitalizeWords(e.cidade)})` : '');
      acc[bairro] = (acc[bairro] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const bairroData = Object.entries(bairroMap).map(([name, value]) => ({ name, value })).sort((a, b) => (b.value as number) - (a.value as number));

    const monthMap = events.reduce((acc, e) => {
      const month = e.dataEvento ? e.dataEvento.substring(0, 7) : 'Desconhecido';
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const monthData = Object.entries(monthMap).map(([name, value]) => ({ name, value })).sort((a, b) => a.name.localeCompare(b.name));

    return { total, gratuitos, pagos, acessiveis, catData, cityData, bairroData, monthData };
  }, [events]);

  const downloadCSV = () => {
    const headers = ['nomeEvento', 'cidade', 'estado', 'bairro', 'dataEvento', 'preco', 'categoria', 'acessivel', 'recursosAcessibilidade', 'criadoEm'];
    const rows = events.map(e => [
      `"${e.nomeEvento?.replace(/"/g, '""') || ''}"`,
      `"${capitalizeWords(e.cidade || '')}"`,
      e.estado || '',
      `"${capitalizeWords(e.bairro || '')}"`,
      e.dataEvento || '',
      e.preco || '',
      e.categoria || '',
      e.acessivel ? 'Sim' : 'Não',
      `"${e.recursosAcessibilidade ? e.recursosAcessibilidade.join(', ') : ''}"`,
      new Date(e.criadoEm).toISOString()
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'cultura_perto_eventos.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <div className="text-center mt-20 text-gray-500">Carregando indicadores...</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Indicadores Culturais</h1>
          <p className="text-gray-500 text-lg">Visão geral do impacto cultural e distribuição de eventos na plataforma.</p>
        </div>
        <button
          onClick={downloadCSV}
          className="inline-flex items-center justify-center gap-2 bg-gray-900 text-white hover:bg-gray-800 px-6 py-3 rounded-xl font-semibold transition-all shadow-sm"
        >
          <Download className="w-4 h-4" />
          Baixar relatório CSV
        </button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
            <Activity className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Total de Eventos</p>
          <p className="text-4xl font-black text-gray-900 tracking-tight">{stats.total}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
            <Ticket className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Eventos Gratuitos</p>
          <p className="text-4xl font-black text-emerald-600 tracking-tight">{stats.gratuitos}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-4">
            <Calendar className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Eventos Pagos</p>
          <p className="text-4xl font-black text-orange-600 tracking-tight">{stats.pagos}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-4">
            <Accessibility className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Locais Acessíveis</p>
          <p className="text-4xl font-black text-purple-600 tracking-tight">{stats.acessiveis}</p>
        </div>
      </div>

      {/* Vazio Cultural Section */}
      <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-8 rounded-3xl border border-orange-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <MapPin className="w-48 h-48 text-orange-900" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white p-2 rounded-xl shadow-sm text-orange-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-orange-900 tracking-tight">Mapa do Vazio Cultural</h2>
          </div>
          
          <p className="text-orange-800/80 mb-8 font-medium text-lg max-w-2xl">
            Acompanhamos a capilaridade da cultura. Atualmente, a plataforma registra atividades em <strong className="text-orange-900">{stats.bairroData.length} {stats.bairroData.length === 1 ? 'bairro' : 'bairros'}</strong> diferentes.
          </p>
          
          {stats.bairroData.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-10 max-w-4xl">
              {stats.bairroData.map(b => (
                <span key={b.name} className="px-4 py-2 bg-white/80 backdrop-blur text-orange-900 rounded-xl text-sm font-semibold border border-orange-200/60 shadow-sm">
                  {b.name} <span className="text-orange-500 ml-1">({b.value})</span>
                </span>
              ))}
            </div>
          )}
          
          <div className="bg-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 border border-orange-100 shadow-sm max-w-4xl">
            <div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">Seu bairro não está no mapa?</h3>
              <p className="text-gray-500">Ele pode estar sofrendo de um vazio cultural. Cadastre o primeiro evento da sua região e mude essa realidade.</p>
            </div>
            <Link to="/cadastrar" className="shrink-0 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-8 rounded-xl transition-all shadow-sm">
              Cadastrar Evento Local
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Gráfico Categorias */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-emerald-50 text-emerald-600 p-2 rounded-xl">
              <PieChartIcon className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Eventos por Categoria</h2>
          </div>
          {stats.catData.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.catData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {stats.catData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`${value} eventos`, 'Quantidade']}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-gray-400 text-center py-10 font-medium">Dados insuficientes</p>
          )}
        </div>

        {/* Gráfico Cidades */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-50 text-blue-600 p-2 rounded-xl">
              <MapPin className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Cidades Ativas</h2>
          </div>
          {stats.cityData.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.cityData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                  <XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fill: '#64748b', fontSize: 13 }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" fill="#0ea5e9" radius={[0, 6, 6, 0]} name="Eventos" barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-gray-400 text-center py-10 font-medium">Dados insuficientes</p>
          )}
        </div>

        {/* Gráfico Mês */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm lg:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-purple-50 text-purple-600 p-2 rounded-xl">
              <BarChart2 className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Cronograma de Eventos (Mensal)</h2>
          </div>
          {stats.monthData.length > 0 ? (
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.monthData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMonth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 13 }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 13 }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorMonth)" name="Eventos Agendados" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-gray-400 text-center py-10 font-medium">Dados insuficientes</p>
          )}
        </div>

      </div>
    </div>
  );
}
