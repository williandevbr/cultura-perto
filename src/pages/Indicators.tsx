import { useEffect, useState, useMemo } from 'react';
import { getEvents } from '../lib/events';
import { EventData } from '../types';
import { Download, PieChart as PieChartIcon, MapPin, AlertTriangle, Calendar, Ticket, Accessibility, Activity, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Link } from 'react-router-dom';
import { capitalizeWords } from '../lib/utils';

const COLORS = ['#f97316','#10b981','#8b5cf6','#0ea5e9','#f59e0b','#ec4899','#14b8a6','#6366f1'];

export default function Indicators() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEvents().then(setEvents).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const total = events.length;
    const gratuitos = events.filter(e => e.preco === 'gratuito').length;
    const pagos = total - gratuitos;
    const acessiveis = events.filter(e => e.acessivel).length;
    const catMap: Record<string, number> = {};
    const cityMap: Record<string, number> = {};
    const bairroMap: Record<string, number> = {};
    const monthMap: Record<string, number> = {};
    events.forEach(e => {
      const cat = e.categoria || 'Outro'; catMap[cat] = (catMap[cat] || 0) + 1;
      const city = e.cidade ? capitalizeWords(e.cidade) : 'Desconhecido'; cityMap[city] = (cityMap[city] || 0) + 1;
      if (e.bairro) { const b = capitalizeWords(e.bairro) + (e.cidade ? ` (${capitalizeWords(e.cidade)})` : ''); bairroMap[b] = (bairroMap[b] || 0) + 1; }
      const m = e.dataEvento ? e.dataEvento.substring(0, 7) : 'Desconhecido'; monthMap[m] = (monthMap[m] || 0) + 1;
    });
    const sort = (m: Record<string, number>) => Object.entries(m).map(([name, value]) => ({ name, value })).sort((a, b) => (b.value as number) - (a.value as number));
    return { total, gratuitos, pagos, acessiveis, catData: sort(catMap), cityData: sort(cityMap), bairroData: sort(bairroMap), monthData: Object.entries(monthMap).map(([name, value]) => ({ name, value })).sort((a, b) => a.name.localeCompare(b.name)) };
  }, [events]);

  const downloadCSV = () => {
    const headers = ['nomeEvento','cidade','estado','bairro','dataEvento','preco','categoria','acessivel','criadoEm'];
    const rows = events.map(e => {
      const name = '"' + (e.nomeEvento||'').replace(/"/g,'""') + '"';
      const city = '"' + capitalizeWords(e.cidade||'') + '"';
      const bairro = '"' + capitalizeWords(e.bairro||'') + '"';
      return [name, city, e.estado||'', bairro, e.dataEvento||'', e.preco||'', e.categoria||'', e.acessivel?'Sim':'Não', new Date(e.criadoEm).toISOString()];
    });
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = 'cultura_perto_eventos.csv'; document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  if (loading) return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-2xl border border-stone-100">
        <div className="h-8 w-64 shimmer-bg rounded-xl mb-2" /><div className="h-4 w-48 shimmer-bg rounded-lg" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="bg-white p-6 rounded-2xl border border-stone-100"><div className="h-10 w-10 shimmer-bg rounded-xl mb-3" /><div className="h-4 w-24 shimmer-bg rounded-lg mb-2" /><div className="h-8 w-12 shimmer-bg rounded-lg" /></div>)}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-white p-8 rounded-2xl border border-stone-100 shadow-card">
        <div>
          <h1 className="text-3xl font-display font-bold text-stone-900 tracking-tight mb-2">Indicadores Culturais</h1>
          <p className="text-stone-500">Visão geral do impacto cultural e distribuição de eventos.</p>
        </div>
        <button onClick={downloadCSV} className="inline-flex items-center gap-2 bg-stone-900 text-white hover:bg-stone-800 px-6 py-3 rounded-xl font-semibold transition-all shadow-sm" aria-label="Baixar relatório em formato CSV">
          <Download className="w-4 h-4" /> Baixar CSV
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total de Eventos', value: stats.total, icon: Activity, color: 'text-blue-600 bg-blue-50' },
          { label: 'Gratuitos', value: stats.gratuitos, icon: Ticket, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Pagos', value: stats.pagos, icon: Calendar, color: 'text-orange-600 bg-orange-50' },
          { label: 'Acessíveis', value: stats.acessiveis, icon: Accessibility, color: 'text-purple-600 bg-purple-50' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white p-6 rounded-2xl border border-stone-100 shadow-card flex flex-col">
            <div className={`w-11 h-11 ${color} rounded-xl flex items-center justify-center mb-3`}><Icon className="w-5 h-5" /></div>
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">{label}</p>
            <p className="text-3xl font-black text-stone-900 tracking-tight">{value}</p>
          </div>
        ))}
      </div>

      {/* Vazio Cultural */}
      <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-brand-50 p-8 rounded-2xl border border-orange-100 shadow-card relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-[0.06]" aria-hidden="true"><MapPin className="w-48 h-48 text-orange-900" /></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white p-2 rounded-xl shadow-sm text-orange-600"><AlertTriangle className="w-5 h-5" /></div>
            <h2 className="text-xl font-display font-bold text-orange-900">Mapa do Vazio Cultural</h2>
          </div>
          <p className="text-orange-800/80 mb-6 font-medium max-w-2xl">
            A plataforma registra atividades em <strong className="text-orange-900">{stats.bairroData.length} {stats.bairroData.length === 1 ? 'bairro' : 'bairros'}</strong> diferentes.
          </p>
          {stats.bairroData.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6 max-w-4xl">
              {stats.bairroData.map(b => (
                <span key={b.name} className="px-3 py-1.5 bg-white/80 backdrop-blur text-orange-900 rounded-full text-sm font-medium border border-orange-200/60">
                  {b.name} <span className="text-orange-500 ml-1">({b.value})</span>
                </span>
              ))}
            </div>
          )}
          <div className="bg-white rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 border border-orange-100 max-w-4xl">
            <div>
              <h3 className="font-bold text-stone-900 mb-1">Seu bairro não está no mapa?</h3>
              <p className="text-stone-500 text-sm">Cadastre o primeiro evento da sua região e mude essa realidade.</p>
            </div>
            <Link to="/cadastrar" className="shrink-0 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2.5 px-6 rounded-xl transition-all shadow-sm">
              Cadastrar Evento
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-100 shadow-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-brand-50 text-brand-600 p-2 rounded-xl"><PieChartIcon className="w-5 h-5" /></div>
            <h2 className="text-lg font-display font-bold text-stone-900">Categorias</h2>
          </div>
          {stats.catData.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.catData} cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={4} dataKey="value" stroke="none">
                    {stats.catData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => [`${v} eventos`]} contentStyle={{ borderRadius:'12px', border:'none', boxShadow:'0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : <p className="text-stone-400 text-center py-10">Dados insuficientes</p>}
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-100 shadow-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-50 text-blue-600 p-2 rounded-xl"><MapPin className="w-5 h-5" /></div>
            <h2 className="text-lg font-display font-bold text-stone-900">Cidades Ativas</h2>
          </div>
          {stats.cityData.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.cityData} layout="vertical" margin={{ top:5, right:30, left:20, bottom:5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f5f5f4" />
                  <XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fill:'#78716c', fontSize:13 }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill:'#fafaf9'}} contentStyle={{ borderRadius:'12px', border:'none', boxShadow:'0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="value" fill="#f97316" radius={[0,6,6,0]} name="Eventos" barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : <p className="text-stone-400 text-center py-10">Dados insuficientes</p>}
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-100 shadow-card lg:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-purple-50 text-purple-600 p-2 rounded-xl"><TrendingUp className="w-5 h-5" /></div>
            <h2 className="text-lg font-display font-bold text-stone-900">Cronograma Mensal</h2>
          </div>
          {stats.monthData.length > 0 ? (
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.monthData} margin={{ top:10, right:30, left:0, bottom:0 }}>
                  <defs>
                    <linearGradient id="colorMonth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                  <XAxis dataKey="name" tick={{ fill:'#78716c', fontSize:13 }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis allowDecimals={false} tick={{ fill:'#78716c', fontSize:13 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius:'12px', border:'none', boxShadow:'0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorMonth)" name="Eventos" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : <p className="text-stone-400 text-center py-10">Dados insuficientes</p>}
        </div>
      </div>
    </div>
  );
}
