import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ESTADOS_BRASILEIROS, EventCategory } from '../types';
import { createEvent, checkDuplicateEvent } from '../lib/events';
import { Info, CheckCircle2, AlertCircle, Upload, X } from 'lucide-react';

const CATEGORIAS: EventCategory[] = [
  'Música', 'Teatro', 'Dança', 'Literatura', 'Cinema', 
  'Artes visuais', 'Cultura popular', 'Oficina', 
  'Feira cultural', 'Gastronomia cultural', 'Outro'
];

const RECURSOS = [
  'Intérprete de Libras', 'Audiodescrição', 'Rampa de acesso', 
  'Banheiro acessível', 'Linguagem simples', 'Outro'
];

const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        let scaleSize = 1;
        if (img.width > MAX_WIDTH) {
          scaleSize = MAX_WIDTH / img.width;
        }
        canvas.width = img.width * scaleSize;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
    };
    reader.onerror = error => reject(error);
  });
};

export default function CreateEvent() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  const [hasAcessibilidade, setHasAcessibilidade] = useState('nao');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      alert("A imagem é muito grande (máx: 5MB).");
      return;
    }
    
    setIsCompressing(true);
    try {
      const base64 = await compressImage(file);
      setCoverImage(base64);
    } catch (err) {
      console.error(err);
      alert("Erro ao processar imagem.");
    } finally {
      setIsCompressing(false);
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    
    try {
      const nomeEvento = (formData.get('nomeEvento') as string)?.trim();
      const localEvento = (formData.get('localEvento') as string)?.trim();
      const dataEvento = formData.get('dataEvento') as string;
      if (!dataEvento) throw new Error('A data do evento é obrigatória.');

      const isDuplicate = await checkDuplicateEvent(nomeEvento, dataEvento, localEvento);
      if (isDuplicate) {
        throw new Error('Já existe um evento cadastrado com este mesmo nome, data e local.');
      }

      const eventData = {
        nomeEvento,
        descricaoCurta: (formData.get('descricaoCurta') as string)?.trim(),
        cidade: (formData.get('cidade') as string)?.trim().toLowerCase(),
        estado: formData.get('estado') as string,
        bairro: (formData.get('bairro') as string)?.trim().toLowerCase(),
        localEvento,
        dataEvento,
        horaEvento: (formData.get('horaEvento') as string)?.trim() || undefined,
        dataFim: (formData.get('dataFim') as string)?.trim() || undefined,
        horaFim: (formData.get('horaFim') as string)?.trim() || undefined,
        imagemCapa: coverImage || undefined,
        preco: formData.get('preco') as 'gratuito' | 'pago',
        valorIngresso: (formData.get('valorIngresso') as string)?.trim() || undefined,
        categoria: formData.get('categoria') as EventCategory,
        acessivel: hasAcessibilidade === 'sim',
        recursosAcessibilidade: hasAcessibilidade === 'sim' ? formData.getAll('recursos') as string[] : [],
        contatoOrganizador: (formData.get('contatoOrganizador') as string)?.trim() || undefined,
        instagramOuWhatsapp: (formData.get('instagramOuWhatsapp') as string)?.trim() || undefined,
        linkInformacoes: (formData.get('linkInformacoes') as string)?.trim() || undefined,
      };

      await createEvent(eventData);
      setSuccess(true);
      setTimeout(() => navigate('/eventos'), 2000);
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao cadastrar o evento. Tente novamente.');
      window.scrollTo(0, 0);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="max-w-xl mx-auto mt-20 text-center animate-in fade-in zoom-in duration-300">
        <div className="bg-emerald-50 text-emerald-600 rounded-full w-24 h-24 mx-auto flex items-center justify-center mb-6">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Evento cadastrado com sucesso!</h2>
        <p className="text-gray-600">Redirecionando para a lista de eventos...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Cadastrar evento</h1>
        <p className="text-gray-600">Preencha os dados abaixo para divulgar um evento cultural na sua região.</p>
      </div>

      {error && (
        <div className="mb-8 bg-red-50 text-red-700 p-4 rounded-lg flex gap-3 items-start border border-red-100">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Imagem de Capa */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">Imagem de Capa</h2>
          <div className="space-y-4">
            <p className="text-sm font-medium text-gray-700">Adicione uma imagem para destacar seu evento (opcional)</p>
            {coverImage ? (
              <div className="relative inline-block">
                <img src={coverImage} alt="Capa" className="h-48 rounded-lg object-cover border border-gray-200" />
                <button
                  type="button"
                  onClick={() => setCoverImage(null)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-md"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  ref={fileInputRef}
                  className="hidden" 
                />
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isCompressing}
                  className="inline-flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <Upload className="w-5 h-5" />
                  {isCompressing ? 'Processando imagem...' : 'Escolher Imagem'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Informações Principais */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">Informações Principais</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="nomeEvento" className="block text-sm font-medium text-gray-700 mb-1">Nome do evento *</label>
              <input required type="text" id="nomeEvento" name="nomeEvento" maxLength={80} className="w-full rounded-lg border-gray-300 border p-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" placeholder="Ex: Roda de Samba da Praça" />
            </div>

            <div>
              <label htmlFor="descricaoCurta" className="block text-sm font-medium text-gray-700 mb-1">Descrição curta *</label>
              <textarea required id="descricaoCurta" name="descricaoCurta" maxLength={280} rows={3} className="w-full rounded-lg border-gray-300 border p-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none" placeholder="Resuma o evento em até 280 caracteres..."></textarea>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-1">Categoria *</label>
                <select required id="categoria" name="categoria" className="w-full rounded-lg border-gray-300 border p-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white">
                  <option value="">Selecione...</option>
                  {CATEGORIAS.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="dataEvento" className="block text-sm font-medium text-gray-700 mb-1">Data de início *</label>
                <input required type="date" id="dataEvento" name="dataEvento" className="w-full rounded-lg border-gray-300 border p-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="horaEvento" className="block text-sm font-medium text-gray-700 mb-1">Horário início <span className="text-gray-400 font-normal">(Opcional)</span></label>
                <input type="time" id="horaEvento" name="horaEvento" className="w-full rounded-lg border-gray-300 border p-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" />
              </div>
              <div>
                <label htmlFor="dataFim" className="block text-sm font-medium text-gray-700 mb-1">Data fim <span className="text-gray-400 font-normal">(Opcional)</span></label>
                <input type="date" id="dataFim" name="dataFim" className="w-full rounded-lg border-gray-300 border p-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" />
              </div>
              <div>
                <label htmlFor="horaFim" className="block text-sm font-medium text-gray-700 mb-1">Horário fim <span className="text-gray-400 font-normal">(Opcional)</span></label>
                <input type="time" id="horaFim" name="horaFim" className="w-full rounded-lg border-gray-300 border p-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="preco" className="block text-sm font-medium text-gray-700 mb-1">Preço *</label>
                <select required id="preco" name="preco" className="w-full rounded-lg border-gray-300 border p-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white">
                  <option value="gratuito">Gratuito</option>
                  <option value="pago">Pago</option>
                </select>
              </div>
              <div>
                <label htmlFor="valorIngresso" className="block text-sm font-medium text-gray-700 mb-1">Valor do ingresso <span className="text-gray-400 font-normal">(Opcional, se for pago)</span></label>
                <input type="text" id="valorIngresso" name="valorIngresso" className="w-full rounded-lg border-gray-300 border p-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" placeholder="Ex: R$ 20,00 ou Contribuição voluntária" />
              </div>
            </div>
          </div>
        </div>

        {/* Localização */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">Localização</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="localEvento" className="block text-sm font-medium text-gray-700 mb-1">Nome do local *</label>
              <input required type="text" id="localEvento" name="localEvento" className="w-full rounded-lg border-gray-300 border p-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" placeholder="Ex: Praça Central" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="cidade" className="block text-sm font-medium text-gray-700 mb-1">Cidade *</label>
                <input required type="text" id="cidade" name="cidade" className="w-full rounded-lg border-gray-300 border p-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" />
              </div>
              <div>
                <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
                <select required id="estado" name="estado" className="w-full rounded-lg border-gray-300 border p-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white">
                  <option value="">Selecione...</option>
                  {ESTADOS_BRASILEIROS.map(uf => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="bairro" className="block text-sm font-medium text-gray-700 mb-1">Bairro *</label>
              <input required type="text" id="bairro" name="bairro" className="w-full rounded-lg border-gray-300 border p-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" />
            </div>
          </div>
        </div>

        {/* Acessibilidade */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">Acessibilidade</h2>
          
          <div className="space-y-4">
            <div>
              <p className="block text-sm font-medium text-gray-700 mb-3">O evento possui recursos de acessibilidade?</p>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="acessivel" value="sim" checked={hasAcessibilidade === 'sim'} onChange={() => setHasAcessibilidade('sim')} className="w-4 h-4 text-emerald-600 focus:ring-emerald-500" />
                  <span>Sim</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="acessivel" value="nao" checked={hasAcessibilidade === 'nao'} onChange={() => setHasAcessibilidade('nao')} className="w-4 h-4 text-emerald-600 focus:ring-emerald-500" />
                  <span>Não</span>
                </label>
              </div>
            </div>

            {hasAcessibilidade === 'sim' && (
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <p className="block text-sm font-medium text-gray-700 mb-3">Selecione os recursos disponíveis:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {RECURSOS.map(recurso => (
                    <label key={recurso} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" name="recursos" value={recurso} className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300" />
                      <span className="text-gray-700">{recurso}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contato (Opcional) */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">Contato <span className="text-gray-400 font-normal text-base">(Opcionais)</span></h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="contatoOrganizador" className="block text-sm font-medium text-gray-700 mb-1">Nome do organizador</label>
              <input type="text" id="contatoOrganizador" name="contatoOrganizador" className="w-full rounded-lg border-gray-300 border p-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="instagramOuWhatsapp" className="block text-sm font-medium text-gray-700 mb-1">Instagram ou WhatsApp</label>
                <input type="text" id="instagramOuWhatsapp" name="instagramOuWhatsapp" className="w-full rounded-lg border-gray-300 border p-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" placeholder="@usuario ou (11) 99999-9999" />
              </div>
              <div>
                <label htmlFor="linkInformacoes" className="block text-sm font-medium text-gray-700 mb-1">Link para mais informações</label>
                <input type="url" id="linkInformacoes" name="linkInformacoes" className="w-full rounded-lg border-gray-300 border p-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" placeholder="https://..." />
              </div>
            </div>
          </div>
        </div>

        {/* Termo e Envio */}
        <div className="pt-6 border-t">
          <div className="bg-blue-50 text-blue-800 p-4 rounded-lg flex gap-3 items-start mb-6">
            <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm">Ao enviar, você declara que as informações do evento são verdadeiras e que possui autorização para divulgá-las.</p>
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto inline-flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Cadastrando...' : 'Cadastrar evento'}
          </button>
        </div>
      </form>
    </div>
  );
}
