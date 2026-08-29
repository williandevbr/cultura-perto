import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getEvent } from '../lib/events';
import { EventData } from '../types';
import { MapPin, Calendar, Clock, Accessibility, DollarSign, Info, Navigation, Share2, ArrowLeft, ExternalLink, MessageCircle, CalendarDays } from 'lucide-react';
import { capitalizeWords, CATEGORY_COLORS, daysUntil, formatDateBR } from '../lib/utils';

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const [evento, setEvento] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadEvent() {
      if (!id) return;
      try { setEvento(await getEvent(id)); }
      catch { console.error('Erro ao carregar evento'); }
      finally { setLoading(false); }
    }
    loadEvent();
  }, [id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    if (!evento) return;
    const text = `Evento cultural: ${evento.nomeEvento}\nData: ${formatDateBR(evento.dataEvento)}\nLocal: ${evento.localEvento}\nBairro: ${capitalizeWords(evento.bairro)}\nCidade: ${capitalizeWords(evento.cidade)}\nPreço: ${evento.preco === 'gratuito' ? 'Gratuito' : (evento.valorIngresso || 'Pago')}\nCategoria: ${evento.categoria}\nSaiba mais: ${window.location.href}`;
    if (navigator.share) {
      navigator.share({ title: evento.nomeEvento, text }).catch(() => {
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
      });
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  if (loading) return (
    <div className="max-w-4xl mx-auto">
      <div className="h-6 w-32 shimmer-bg rounded-lg mb-6" />
      <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
        <div className="h-64 sm:h-96 shimmer-bg" />
        <div className="p-8 sm:p-10 space-y-4">
          <div className="h-6 w-24 shimmer-bg rounded-full" />
          <div className="h-10 w-3/4 shimmer-bg rounded-xl" />
          <div className="h-4 w-full shimmer-bg rounded-lg" />
          <div className="h-4 w-2/3 shimmer-bg rounded-lg" />
        </div>
      </div>
    </div>
  );

  if (!evento) return (
    <div className="text-center mt-20 animate-fade-in">
      <div className="w-20 h-20 bg-stone-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <CalendarDays className="w-10 h-10 text-stone-300" />
      </div>
      <h2 className="text-2xl font-display font-bold text-stone-900 mb-3">Evento não encontrado</h2>
      <p className="text-stone-500 mb-4">Este evento pode ter sido removido ou não existe.</p>
      <Link to="/eventos" className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 font-semibold transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar para eventos
      </Link>
    </div>
  );

  const mapsQuery = encodeURIComponent(`${evento.localEvento}, ${evento.bairro}, ${evento.cidade}, ${evento.estado}`);
  const badge = daysUntil(evento.dataEvento);
  const catColor = CATEGORY_COLORS[evento.categoria] || CATEGORY_COLORS['Outro'];

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <Link to="/eventos" className="inline-flex items-center text-stone-400 hover:text-brand-600 mb-6 font-medium transition-colors group">
        <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
        Voltar para eventos
      </Link>

      <article className="bg-white rounded-2xl shadow-card border border-stone-100 overflow-hidden">
        {evento.imagemCapa && (
          <div className="w-full h-64 sm:h-80 bg-stone-100 relative overflow-hidden">
            <img src={evento.imagemCapa} alt={evento.nomeEvento} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        )}

        <div className="p-6 sm:p-10 border-b border-stone-100">
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <span className={`px-3 py-1 ${catColor.bg} ${catColor.text} rounded-full text-sm font-semibold`}>
              {catColor.icon} {evento.categoria}
            </span>
            {evento.preco === 'gratuito' ? (
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold">Gratuito</span>
            ) : (
              <span className="px-3 py-1 bg-brand-100 text-brand-700 rounded-full text-sm font-semibold">{evento.valorIngresso || 'Pago'}</span>
            )}
            {badge && <span className="px-3 py-1 bg-brand-500 text-white rounded-full text-sm font-bold">{badge}</span>}
            {evento.demonstracao && (
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">Demonstração</span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-display font-bold text-stone-900 mb-4 leading-tight">{evento.nomeEvento}</h1>
          <p className="text-lg text-stone-600 leading-relaxed mb-8">{evento.descricaoCurta}</p>

          <div className="flex flex-wrap gap-3">
            <a href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5">
              <Navigation className="w-5 h-5" /> Como chegar
            </a>
            <button onClick={handleShare}
              className="inline-flex items-center justify-center gap-2 bg-white border border-stone-200 hover:border-stone-300 hover:bg-stone-50 text-stone-700 px-6 py-3 rounded-xl font-semibold transition-all">
              <Share2 className="w-5 h-5" /> {copied ? 'Link copiado!' : 'Compartilhar'}
            </button>
            <button onClick={handleWhatsAppShare}
              className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-sm">
              <MessageCircle className="w-5 h-5" /> WhatsApp
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-stone-100">
          <div className="p-6 sm:p-8 space-y-6">
            <h2 className="text-lg font-display font-bold text-stone-900 flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center"><Calendar className="w-4 h-4 text-brand-500" /></div>
              Onde e Quando
            </h2>
            <div className="space-y-5 ml-1">
              <div className="flex gap-3">
                <div className="bg-stone-50 p-2.5 rounded-xl h-fit"><Calendar className="w-5 h-5 text-brand-500" /></div>
                <div>
                  <h3 className="font-semibold text-stone-900 text-sm">Data</h3>
                  <p className="text-stone-600">
                    {formatDateBR(evento.dataEvento)}
                    {evento.dataFim && evento.dataFim !== evento.dataEvento && ` até ${formatDateBR(evento.dataFim)}`}
                  </p>
                </div>
              </div>
              {(evento.horaEvento || evento.horaFim) && (
                <div className="flex gap-3">
                  <div className="bg-stone-50 p-2.5 rounded-xl h-fit"><Clock className="w-5 h-5 text-brand-500" /></div>
                  <div>
                    <h3 className="font-semibold text-stone-900 text-sm">Horário</h3>
                    <p className="text-stone-600">
                      {evento.horaEvento || ''}{evento.horaEvento && evento.horaFim ? ' às ' : ''}{evento.horaFim || ''}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <div className="bg-stone-50 p-2.5 rounded-xl h-fit"><MapPin className="w-5 h-5 text-brand-500" /></div>
                <div>
                  <h3 className="font-semibold text-stone-900 text-sm">Local</h3>
                  <p className="text-stone-900 font-medium">{evento.localEvento}</p>
                  <p className="text-stone-500">{capitalizeWords(evento.bairro)}</p>
                  <p className="text-stone-500">{capitalizeWords(evento.cidade)} – {evento.estado}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <h2 className="text-lg font-display font-bold text-stone-900 flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center"><Info className="w-4 h-4 text-brand-500" /></div>
              Informações Adicionais
            </h2>
            <div className="space-y-5 ml-1">
              <div className="flex gap-3">
                <div className="bg-stone-50 p-2.5 rounded-xl h-fit"><DollarSign className="w-5 h-5 text-brand-500" /></div>
                <div>
                  <h3 className="font-semibold text-stone-900 text-sm">Ingressos</h3>
                  <p className="text-stone-600 capitalize">{evento.preco}</p>
                  {evento.valorIngresso && <p className="text-stone-600">{evento.valorIngresso}</p>}
                </div>
              </div>
              <div className="flex gap-3">
                <div className="bg-stone-50 p-2.5 rounded-xl h-fit"><Accessibility className="w-5 h-5 text-brand-500" /></div>
                <div>
                  <h3 className="font-semibold text-stone-900 text-sm">Acessibilidade</h3>
                  {evento.acessivel ? (
                    <>
                      <p className="text-emerald-600 font-medium text-sm mb-1">Evento acessível</p>
                      {evento.recursosAcessibilidade && evento.recursosAcessibilidade.length > 0 && (
                        <ul className="list-disc pl-4 text-stone-600 text-sm space-y-0.5">
                          {evento.recursosAcessibilidade.map(r => <li key={r}>{r}</li>)}
                        </ul>
                      )}
                    </>
                  ) : (
                    <p className="text-stone-500 text-sm">Não informado</p>
                  )}
                </div>
              </div>
              {(evento.contatoOrganizador || evento.instagramOuWhatsapp || evento.linkInformacoes) && (
                <div className="flex gap-3">
                  <div className="bg-stone-50 p-2.5 rounded-xl h-fit"><Info className="w-5 h-5 text-brand-500" /></div>
                  <div className="w-full">
                    <h3 className="font-semibold text-stone-900 text-sm mb-2">Contato / Mais Info</h3>
                    {evento.contatoOrganizador && <p className="text-stone-600 text-sm mb-1"><strong>Org:</strong> {evento.contatoOrganizador}</p>}
                    {evento.instagramOuWhatsapp && <p className="text-stone-600 text-sm flex items-center gap-1 mb-1"><MessageCircle className="w-4 h-4" /> {evento.instagramOuWhatsapp}</p>}
                    {evento.linkInformacoes && (
                      <a href={evento.linkInformacoes} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:text-brand-700 hover:underline text-sm inline-flex items-center gap-1 mt-1 transition-colors">
                        <ExternalLink className="w-4 h-4" /> Acessar link
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
