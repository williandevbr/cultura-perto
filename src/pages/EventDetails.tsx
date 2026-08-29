import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getEvent } from '../lib/events';
import { EventData } from '../types';
import { MapPin, Calendar, Clock, Accessibility, DollarSign, Info, Navigation, Share2, ArrowLeft, ExternalLink, MessageCircle } from 'lucide-react';

import { capitalizeWords } from '../lib/utils';

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [evento, setEvento] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadEvent() {
      if (!id) return;
      try {
        const data = await getEvent(id);
        setEvento(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
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
    const dateStr = evento.dataEvento ? new Date(evento.dataEvento + 'T00:00:00').toLocaleDateString('pt-BR') : 'Data não informada';
    const text = `Evento cultural: ${evento.nomeEvento}
Data: ${dateStr}
Local: ${evento.localEvento}
Bairro: ${capitalizeWords(evento.bairro)}
Cidade: ${capitalizeWords(evento.cidade)}
Preço: ${evento.preco === 'gratuito' ? 'Gratuito' : (evento.valorIngresso || 'Pago')}
Categoria: ${evento.categoria}
Saiba mais: ${window.location.href}`;

    if (navigator.share) {
      navigator.share({
        title: evento.nomeEvento,
        text: text,
      }).catch(() => {
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
      });
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  if (loading) {
    return <div className="text-center mt-20 text-gray-500">Carregando detalhes do evento...</div>;
  }

  if (!evento) {
    return (
      <div className="text-center mt-20">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Evento não encontrado</h2>
        <Link to="/eventos" className="text-emerald-600 hover:underline">Voltar para eventos</Link>
      </div>
    );
  }

  const mapsQuery = encodeURIComponent(`${evento.localEvento}, ${evento.bairro}, ${evento.cidade}, ${evento.estado}`);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
      <Link to="/eventos" className="inline-flex items-center text-gray-500 hover:text-emerald-600 mb-6 font-medium transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar para eventos
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {evento.imagemCapa && (
          <div className="w-full h-64 sm:h-96 bg-gray-100">
            <img src={evento.imagemCapa} alt={evento.nomeEvento} className="w-full h-full object-cover" />
          </div>
        )}
        {/* Header */}
        <div className="p-8 sm:p-10 border-b border-gray-100">
          <div className="flex flex-wrap gap-3 mb-6">
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold">
              {evento.categoria}
            </span>
            {evento.preco === 'gratuito' ? (
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold">
                Gratuito
              </span>
            ) : (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                Pago
              </span>
            )}
            {evento.demonstracao && (
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                Demonstração
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 leading-tight">
            {evento.nomeEvento}
          </h1>

          <p className="text-lg text-gray-600 leading-relaxed mb-8">
            {evento.descricaoCurta}
          </p>

          <div className="flex flex-wrap gap-4">
            <a 
              href={mapsUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-sm"
            >
              <Navigation className="w-5 h-5" />
              Como chegar
            </a>
            
            <button 
              onClick={handleShare}
              className="inline-flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-xl font-semibold transition-all"
            >
              <Share2 className="w-5 h-5" />
              {copied ? 'Link copiado!' : 'Compartilhar'}
            </button>

            <button 
              onClick={handleWhatsAppShare}
              className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-sm"
            >
              <MessageCircle className="w-5 h-5" />
              Divulgar no WhatsApp
            </button>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
          
          <div className="p-8 sm:p-10 space-y-8">
            <h2 className="text-xl font-bold text-gray-900 border-b pb-2">Onde e Quando</h2>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="bg-gray-50 p-3 rounded-full h-fit">
                  <Calendar className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Data</h3>
                  <p className="text-gray-600">
                    {evento.dataEvento ? new Date(evento.dataEvento + 'T00:00:00').toLocaleDateString('pt-BR') : 'Data não informada'}
                    {evento.dataFim && evento.dataFim !== evento.dataEvento && ` até ${new Date(evento.dataFim + 'T00:00:00').toLocaleDateString('pt-BR')}`}
                  </p>
                </div>
              </div>

              {(evento.horaEvento || evento.horaFim) && (
                <div className="flex gap-4">
                  <div className="bg-gray-50 p-3 rounded-full h-fit">
                    <Clock className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Horário</h3>
                    <p className="text-gray-600">
                      {evento.horaEvento ? evento.horaEvento : ''}
                      {evento.horaEvento && evento.horaFim ? ' às ' : ''}
                      {evento.horaFim ? evento.horaFim : ''}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <div className="bg-gray-50 p-3 rounded-full h-fit">
                  <MapPin className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Local</h3>
                  <p className="text-gray-900 font-medium">{evento.localEvento}</p>
                  <p className="text-gray-600">{capitalizeWords(evento.bairro)}</p>
                  <p className="text-gray-600">{capitalizeWords(evento.cidade)} - {evento.estado}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 sm:p-10 space-y-8">
            <h2 className="text-xl font-bold text-gray-900 border-b pb-2">Informações Adicionais</h2>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="bg-gray-50 p-3 rounded-full h-fit">
                  <DollarSign className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Ingressos</h3>
                  <p className="text-gray-600 capitalize">{evento.preco}</p>
                  {evento.valorIngresso && <p className="text-gray-600">{evento.valorIngresso}</p>}
                </div>
              </div>

              <div className="flex gap-4">
                <div className="bg-gray-50 p-3 rounded-full h-fit">
                  <Accessibility className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Acessibilidade</h3>
                  {evento.acessivel ? (
                    <>
                      <p className="text-emerald-600 font-medium mb-1">Evento com recursos acessíveis</p>
                      {evento.recursosAcessibilidade && evento.recursosAcessibilidade.length > 0 && (
                        <ul className="list-disc pl-5 text-gray-600 text-sm space-y-1 mt-2">
                          {evento.recursosAcessibilidade.map(recurso => (
                            <li key={recurso}>{recurso}</li>
                          ))}
                        </ul>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-600">Não informado / Sem recursos específicos</p>
                  )}
                </div>
              </div>

              {(evento.contatoOrganizador || evento.instagramOuWhatsapp || evento.linkInformacoes) && (
                <div className="flex gap-4">
                  <div className="bg-gray-50 p-3 rounded-full h-fit">
                    <Info className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div className="w-full">
                    <h3 className="font-semibold text-gray-900 mb-2">Contato / Mais Info</h3>
                    {evento.contatoOrganizador && <p className="text-gray-600 text-sm mb-1"><strong>Org:</strong> {evento.contatoOrganizador}</p>}
                    {evento.instagramOuWhatsapp && (
                      <p className="text-gray-600 text-sm flex items-center gap-1 mb-1">
                        <MessageCircle className="w-4 h-4" /> {evento.instagramOuWhatsapp}
                      </p>
                    )}
                    {evento.linkInformacoes && (
                      <a href={evento.linkInformacoes} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline text-sm flex items-center gap-1 mt-2 inline-flex">
                        <ExternalLink className="w-4 h-4" /> Acessar link
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
