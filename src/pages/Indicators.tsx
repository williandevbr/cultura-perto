import { useEffect, useState, useMemo } from 'react';
import { getEvents } from '../lib/events';
import { EventData } from '../types';
import { Download, MapPin, AlertTriangle, Calendar, Ticket, Accessibility, Activity, PieChart as PieChartIcon, BarChart2, Users, Eye, Heart, AlertCircle } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Link } from 'react-router-dom';
import { capitalizeWords } from '../lib/utils';

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#14b8a6', '#6366f1', '#f43f5e', '#06b6d4', '#84cc16', '#f97316'];

const REGION_MAP: Record<string, string> = {
  'SP': 'Sudeste', 'RJ': 'Sudeste', 'MG': 'Sudeste', 'ES': 'Sudeste',
  'BA': 'Nordeste', 'PE': 'Nordeste', 'CE': 'Nordeste', 'MA': 'Nordeste',
  'PB': 'Nordeste', 'RN': 'Nordeste', 'SE': 'Nordeste', 'AL': 'Nordeste', 'PI': 'Nordeste',
  'DF': 'Centro-Oeste', 'GO': 'Centro-Oeste', 'MT': 'Centro-Oeste', 'MS': 'Centro-Oeste',
  'PR': 'Sul', 'SC': 'Sul', 'RS': 'Sul',
  'AM': 'Norte', 'PA': 'Norte', 'AP': 'Norte', 'RO': 'Norte', 'RR': 'Norte', 'TO': 'Norte', 'AC': 'Norte',
};

const ALL_CATEGORIES = ['Música', 'Teatro', 'Dança', 'Literatura', 'Cinema', 'Artes visuais', 'Cultura popular', 'Oficina', 'Feira cultural', 'Gastronomia cultural', 'Outro'];

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
    const naoAcessiveis = total - acessiveis;

    const usedCategories = new Set(events.map(e => e.categoria));
    const unusedCategories = ALL_CATEGORIES.filter(c => !usedCategories.has(c));

    const regionCount: Record<string, number> = {};
    events.forEach(e => {
      const region = REGION_MAP[e.estado] || 'Outro';
      regionCount[region] = (regionCount[region] || 0) + 1;
    });
    const regionData = [
      { name: 'Sudeste', value: regionCount['Sudeste'] || 0 },
      { name: 'Nordeste', value: regionCount['Nordeste'] || 0 },
      { name: 'Centro-Oeste', value: regionCount['Centro-Oeste'] || 0 },
      { name: 'Sul', value: regionCount['Sul'] || 0 },
      { name: 'Norte', value: regionCount['Norte'] || 0 },
    ];

    const catMap: Record<string, number> = {};
    events.forEach(e => { catMap[e.categoria] = (catMap[e.categoria] || 0) + 1; });
    const catData = Object.entries(catMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

    const bairroMap: Record<string, { count: number, cidade: string, estado: string }> = {};
    events.forEach(e => {
      if (!e.bairro) return;
      const key = `${e.bairro}-${e.cidade}`;
      if (!bairroMap[key]) bairroMap[key] = { count: 0, cidade: e.cidade, estado: e.estado };
      bairroMap[key].count++;
    });
    const bairroData = Object.entries(bairroMap).map(([name, data]) => ({
      name: capitalizeWords(name.split('-')[0]),
      cidade: capitalizeWords(data.cidade),
      estado: data.estado,
      count: data.count,
    }));

    const priceData = [
      { name: 'Gratuitos', value: gratuitos },
      { name: 'Pagos', value: pagos },
    ];

    const accessData = [
      { name: 'Acessíveis', value: acessiveis },
      { name: 'Não acessíveis', value: naoAcessiveis },
    ];

    const cityMap: Record<string, { count: number, estado: string }> = {};
    events.forEach(e => {
      const city = capitalizeWords(e.cidade || 'Desconhecido');
      if (!cityMap[city]) cityMap[city] = { count: 0, estado: e.estado };
      cityMap[city].count++;
    });
    const cityData = Object.entries(cityMap).map(([name, data]) => ({ name, value: data.count, estado: data.estado })).sort((a, b) => b.value - a.value);

    return { total, gratuitos, pagos, acessiveis, naoAcessiveis, unusedCategories, regionData, catData, bairroData, priceData, accessData, cityData };
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
      `"${e.recursosAcessibilidade ? e.recursosAcessibilidade.join('; ') : ''}"`,
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
    return (
      <div className="text-center mt-20">
        <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Activity className="w-6 h-6 text-white animate-pulse" />
        </div>
        <p className="text-gray-500 font-medium">Carregando indicadores...</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white px-4 py-3 rounded-xl shadow-lg border border-gray-100">
          <p className="font-semibold text-gray-900">{payload[0].name || payload[0].payload?.name}</p>
          <p className="text-sm text-gray-500">{payload[0].value} {payload[0].value === 1 ? 'evento' : 'eventos'}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Indicadores Culturais</h1>
          <p className="text-gray-500 text-lg">Análise completa dos dados de demonstração da plataforma.</p>
        </div>
        <button onClick={downloadCSV} className="inline-flex items-center gap-2 bg-gray-900 text-white hover:bg-gray-800 px-6 py-3 rounded-xl font-semibold transition-all">
          <Download className="w-4 h-4" />
          Baixar CSV
        </button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-3">
            <Activity className="w-5 h-5" />
          </div>
          <p className="text-3xl font-black text-gray-900">{stats.total}</p>
          <p className="text-sm text-gray-500 font-medium mt-1">Total de eventos</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-3">
            <Ticket className="w-5 h-5" />
          </div>
          <p className="text-3xl font-black text-blue-600">{stats.gratuitos}</p>
          <p className="text-sm text-gray-500 font-medium mt-1">Gratuitos ({stats.total > 0 ? Math.round(stats.gratuitos / stats.total * 100) : 0}%)</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center mb-3">
            <Calendar className="w-5 h-5" />
          </div>
          <p className="text-3xl font-black text-orange-600">{stats.pagos}</p>
          <p className="text-sm text-gray-500 font-medium mt-1">Pagos ({stats.total > 0 ? Math.round(stats.pagos / stats.total * 100) : 0}%)</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-3">
            <Accessibility className="w-5 h-5" />
          </div>
          <p className="text-3xl font-black text-purple-600">{stats.acessiveis}</p>
          <p className="text-sm text-gray-500 font-medium mt-1">Acessíveis ({stats.total > 0 ? Math.round(stats.acessiveis / stats.total * 100) : 0}%)</p>
        </div>
      </div>

      {/* Distribuição por Região */}
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-emerald-50 text-emerald-600 p-2 rounded-xl">
            <MapPin className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Distribuição por Região</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {stats.regionData.map(r => {
            const pct = stats.total > 0 ? Math.round(r.value / stats.total * 100) : 0;
            return (
              <div key={r.name} className="text-center p-4 bg-gray-50 rounded-2xl">
                <div className="text-2xl font-black text-gray-900">{r.value}</div>
                <div className="text-sm font-semibold text-gray-600 mt-1">{r.name}</div>
                <div className="text-xs text-gray-400 mt-1">{pct}%</div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-3">
                  <div className="bg-emerald-500 h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
        {stats.regionData.find(r => r.name === 'Norte')?.value === 0 && (
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <p className="text-sm text-amber-800">
              <strong>Região Norte zerada:</strong> exemplo de vazio cultural. A plataforma pode ajudar a preencher essa lacuna.
            </p>
          </div>
        )}
      </div>

      {/* Gráficos de Pizza: Preço e Acessibilidade */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-50 text-blue-600 p-2 rounded-xl">
              <PieChartIcon className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Distribuição por Preço</h2>
          </div>
          {stats.total > 0 ? (
            <>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={stats.priceData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value" stroke="none">
                      {stats.priceData.map((_, i) => <Cell key={i} fill={i === 0 ? '#3b82f6' : '#f97316'} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-sm text-gray-600">Gratuitos: {stats.gratuitos} ({Math.round(stats.gratuitos / stats.total * 100)}%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500" />
                  <span className="text-sm text-gray-600">Pagos: {stats.pagos} ({Math.round(stats.pagos / stats.total * 100)}%)</span>
                </div>
              </div>
            </>
          ) : (
            <p className="text-gray-400 text-center py-10">Sem dados</p>
          )}
        </div>

        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-purple-50 text-purple-600 p-2 rounded-xl">
              <Accessibility className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Acessibilidade</h2>
          </div>
          {stats.total > 0 ? (
            <>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={stats.accessData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value" stroke="none">
                      {stats.accessData.map((_, i) => <Cell key={i} fill={i === 0 ? '#10b981' : '#ef4444'} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-sm text-gray-600">Acessíveis: {stats.acessiveis} ({Math.round(stats.acessiveis / stats.total * 100)}%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-sm text-gray-600">Não: {stats.naoAcessiveis} ({Math.round(stats.naoAcessiveis / stats.total * 100)}%)</span>
                </div>
              </div>
              <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2">
                <span className="text-emerald-600 text-lg">✓</span>
                <p className="text-sm text-emerald-800">
                  {stats.acessiveis > stats.naoAcessiveis
                    ? 'Mais da metade dos eventos já pensam na inclusão!'
                    : 'A maioria dos eventos ainda não contempla acessibilidade.'}
                </p>
              </div>
            </>
          ) : (
            <p className="text-gray-400 text-center py-10">Sem dados</p>
          )}
        </div>
      </div>

      {/* Categorias */}
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-amber-50 text-amber-600 p-2 rounded-xl">
            <BarChart2 className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Categorias Culturais</h2>
          <span className="ml-auto text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-medium">
            {stats.catData.length} de {ALL_CATEGORIES.length} utilizadas
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {stats.catData.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.catData} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                  <XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fill: '#374151', fontSize: 13, fontWeight: 500 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={20}>
                    {stats.catData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-gray-400 text-center py-10">Sem dados</p>
          )}

          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Categorias utilizadas</h3>
            <div className="flex flex-wrap gap-2 mb-6">
              {stats.catData.map((c, i) => (
                <span key={c.name} className="px-3 py-1.5 rounded-lg text-sm font-medium border" style={{
                  backgroundColor: COLORS[i % COLORS.length] + '15',
                  color: COLORS[i % COLORS.length],
                  borderColor: COLORS[i % COLORS.length] + '30',
                }}>
                  {c.name} ({c.value})
                </span>
              ))}
            </div>

            {stats.unusedCategories.length > 0 && (
              <>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Ainda não utilizadas ({stats.unusedCategories.length})</h3>
                <div className="flex flex-wrap gap-2">
                  {stats.unusedCategories.map(c => (
                    <span key={c} className="px-3 py-1.5 bg-gray-100 text-gray-400 rounded-lg text-sm font-medium border border-gray-200">
                      {c}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bairros Mapeados */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-8 rounded-3xl border border-emerald-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <MapPin className="w-48 h-48 text-emerald-900" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white p-2 rounded-xl shadow-sm text-emerald-600">
              <MapPin className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-emerald-900">Bairros Mapeados</h2>
          </div>
          <p className="text-emerald-800/80 mb-6 font-medium text-lg max-w-2xl">
            A plataforma registra atividades em <strong className="text-emerald-900">{stats.bairroData.length}</strong> bairros diferentes em <strong className="text-emerald-900">{stats.cityData.length}</strong> cidades.
          </p>

          {stats.bairroData.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
              {stats.bairroData.map(b => (
                <div key={b.name} className="bg-white/80 backdrop-blur rounded-xl p-4 border border-emerald-200/60 shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-4 h-4 text-emerald-500" />
                    <span className="font-bold text-gray-900 text-sm">{b.name}</span>
                  </div>
                  <p className="text-xs text-gray-500">{b.cidade} – {b.estado}</p>
                  <p className="text-xs text-emerald-600 font-semibold mt-1">{b.count} {b.count === 1 ? 'evento' : 'eventos'}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-emerald-700/60 mb-8">Nenhum bairro mapeado ainda.</p>
          )}

          <div className="bg-white rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border border-emerald-100 shadow-sm">
            <div>
              <h3 className="font-bold text-gray-900 mb-1">Seu bairro não está no mapa?</h3>
              <p className="text-gray-500 text-sm">Cadastre o primeiro evento da sua região e mude essa realidade.</p>
            </div>
            <Link to="/cadastrar" className="shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-all">
              Cadastrar Evento
            </Link>
          </div>
        </div>
      </div>

      {/* Impacto */}
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Impacto que Queremos</h2>
        <p className="text-gray-500 text-center mb-8 max-w-xl mx-auto">Quando a informação chega, a cultura acontece!</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
            <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-7 h-7 text-emerald-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Mais acesso</h3>
            <p className="text-sm text-gray-600">Mais pessoas participando de eventos culturais</p>
          </div>
          <div className="text-center p-6 bg-blue-50 rounded-2xl border border-blue-100">
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Eye className="w-7 h-7 text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Mais visibilidade</h3>
            <p className="text-sm text-gray-600">Artistas, coletivos e espaços valorizados</p>
          </div>
          <div className="text-center p-6 bg-purple-50 rounded-2xl border border-purple-100">
            <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Heart className="w-7 h-7 text-purple-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Mais comunidade</h3>
            <p className="text-sm text-gray-600">Laços mais fortes e cidades mais vivas</p>
          </div>
        </div>
      </div>

      {/* Dados de demonstração */}
      <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-gray-600 font-medium">Dados de demonstração</p>
          <p className="text-sm text-gray-500 mt-1">Esta análise é baseada nos {stats.total} eventos de demonstração cadastrados na plataforma. Para dados reais, é necessário o cadastro de eventos pela comunidade.</p>
        </div>
      </div>
    </div>
  );
}
