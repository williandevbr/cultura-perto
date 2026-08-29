import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ESTADOS_BRASILEIROS, EventCategory } from '../types';
import { createEvent, checkDuplicateEvent } from '../lib/events';
import { Info, CheckCircle2, AlertCircle, Upload, X, ArrowRight } from 'lucide-react';

const CATEGORIAS: EventCategory[] = ['Música','Teatro','Dança','Literatura','Cinema','Artes visuais','Cultura popular','Oficina','Feira cultural','Gastronomia cultural','Outro'];
const RECURSOS = ['Intérprete de Libras','Audiodescrição','Rampa de acesso','Banheiro acessível','Linguagem simples','Outro'];

const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX = 800;
        let scale = 1;
        if (img.width > MAX) scale = MAX / img.width;
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
    };
    reader.onerror = error => reject(error);
  });
};

const inputCls = 'w-full rounded-xl border border-stone-200 bg-stone-50 p-3 text-sm focus:bg-white focus:border-brand-400 focus:ring-2 focus:ring-brand-500/10 outline-none transition-all';
const labelCls = 'block text-sm font-medium text-stone-700 mb-1.5';

export default function CreateEvent() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [hasAcessibilidade, setHasAcessibilidade] = useState('nao');
  const [step, setStep] = useState(0);
  const steps = ['Imagem', 'Informações', 'Localização', 'Acessibilidade', 'Contato'];

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert("A imagem é muito grande (máx: 5MB)."); return; }
    setIsCompressing(true);
    try { setCoverImage(await compressImage(file)); }
    catch { alert("Erro ao processar imagem."); }
    finally { setIsCompressing(false); }
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
      if (await checkDuplicateEvent(nomeEvento, dataEvento, localEvento)) throw new Error('Já existe um evento com este mesmo nome, data e local.');
      await createEvent({
        nomeEvento, descricaoCurta: (formData.get('descricaoCurta') as string)?.trim(),
        cidade: (formData.get('cidade') as string)?.trim().toLowerCase(), estado: formData.get('estado') as string,
        bairro: (formData.get('bairro') as string)?.trim().toLowerCase(), localEvento, dataEvento,
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
      });
      setSuccess(true);
      setTimeout(() => navigate('/eventos'), 2000);
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao cadastrar o evento.');
      window.scrollTo(0, 0);
    } finally { setIsSubmitting(false); }
  }

  if (success) return (
    <div className="max-w-xl mx-auto mt-20 text-center animate-scale-in">
      <div className="w-20 h-20 bg-emerald-50 rounded-full mx-auto flex items-center justify-center mb-5">
        <CheckCircle2 className="w-10 h-10 text-emerald-500" />
      </div>
      <h2 className="text-3xl font-display font-bold text-stone-900 mb-3">Evento cadastrado!</h2>
      <p className="text-stone-500">Redirecionando para a lista de eventos...</p>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto animate-fade-in" role="form" aria-label="Formulário de cadastro de evento">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-stone-900 mb-2">Cadastrar evento</h1>
        <p className="text-stone-500">Preencha os dados para divulgar um evento cultural na sua região.</p>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-1 mb-8" role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={steps.length} aria-label={`Etapa ${step + 1} de ${steps.length}`}>
        {steps.map((s, i) => (
          <div key={s} className="flex-1 flex flex-col items-center gap-1.5">
            <div className={`w-full h-1.5 rounded-full transition-colors duration-300 ${i <= step ? 'bg-brand-500' : 'bg-stone-200'}`} />
            <span className={`text-[11px] font-medium hidden sm:block ${i === step ? 'text-brand-600' : 'text-stone-400'}`}>{s}</span>
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-xl flex gap-3 items-start border border-red-100" role="alert">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" /> <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 0: Imagem */}
        <div className={`bg-white rounded-2xl border border-stone-100 shadow-card p-6 sm:p-8 transition-all ${step === 0 ? '' : 'hidden'}`}>
          <h2 className="text-lg font-display font-bold text-stone-900 mb-4 flex items-center gap-2">
            <span className="w-7 h-7 bg-brand-100 text-brand-600 rounded-lg flex items-center justify-center text-xs font-bold">1</span>
            Imagem de Capa
          </h2>
          <p className="text-sm text-stone-500 mb-4">Adicione uma imagem para destacar seu evento (opcional).</p>
          {coverImage ? (
            <div className="relative inline-block">
              <img src={coverImage} alt="Capa do evento" className="h-48 rounded-xl object-cover border border-stone-200" />
              <button type="button" onClick={() => setCoverImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-md transition-colors" aria-label="Remover imagem">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div>
              <input type="file" accept="image/*" onChange={handleImageUpload} ref={fileInputRef} className="hidden" aria-label="Selecionar imagem" />
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isCompressing}
                className="inline-flex items-center gap-2 bg-stone-50 border border-dashed border-stone-300 text-stone-600 px-5 py-3 rounded-xl hover:bg-stone-100 transition-colors disabled:opacity-50">
                <Upload className="w-5 h-5" /> {isCompressing ? 'Processando...' : 'Escolher imagem'}
              </button>
            </div>
          )}
          <div className="mt-6 flex justify-end">
            <button type="button" onClick={() => setStep(1)} className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-all">
              Próximo <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Step 1: Informações */}
        <div className={`bg-white rounded-2xl border border-stone-100 shadow-card p-6 sm:p-8 space-y-5 ${step === 1 ? '' : 'hidden'}`}>
          <h2 className="text-lg font-display font-bold text-stone-900 mb-4 flex items-center gap-2">
            <span className="w-7 h-7 bg-brand-100 text-brand-600 rounded-lg flex items-center justify-center text-xs font-bold">2</span>
            Informações Principais
          </h2>
          <div>
            <label htmlFor="nomeEvento" className={labelCls}>Nome do evento *</label>
            <input required type="text" id="nomeEvento" name="nomeEvento" maxLength={80} className={inputCls} placeholder="Ex: Roda de Samba da Praça" />
          </div>
          <div>
            <label htmlFor="descricaoCurta" className={labelCls}>Descrição curta *</label>
            <textarea required id="descricaoCurta" name="descricaoCurta" maxLength={280} rows={3} className={`${inputCls} resize-none`} placeholder="Resuma o evento em até 280 caracteres..." />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="categoria" className={labelCls}>Categoria *</label>
              <select required id="categoria" name="categoria" className={`${inputCls} bg-white`}>
                <option value="">Selecione...</option>
                {CATEGORIAS.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="dataEvento" className={labelCls}>Data de início *</label>
              <input required type="date" id="dataEvento" name="dataEvento" className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="horaEvento" className={labelCls}>Horário início <span className="text-stone-400 font-normal">(opc.)</span></label>
              <input type="time" id="horaEvento" name="horaEvento" className={inputCls} />
            </div>
            <div>
              <label htmlFor="dataFim" className={labelCls}>Data fim <span className="text-stone-400 font-normal">(opc.)</span></label>
              <input type="date" id="dataFim" name="dataFim" className={inputCls} />
            </div>
            <div>
              <label htmlFor="horaFim" className={labelCls}>Horário fim <span className="text-stone-400 font-normal">(opc.)</span></label>
              <input type="time" id="horaFim" name="horaFim" className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="preco" className={labelCls}>Preço *</label>
              <select required id="preco" name="preco" className={`${inputCls} bg-white`}>
                <option value="gratuito">Gratuito</option>
                <option value="pago">Pago</option>
              </select>
            </div>
            <div>
              <label htmlFor="valorIngresso" className={labelCls}>Valor do ingresso <span className="text-stone-400 font-normal">(opc.)</span></label>
              <input type="text" id="valorIngresso" name="valorIngresso" className={inputCls} placeholder="Ex: R$ 20,00" />
            </div>
          </div>
          <div className="flex justify-between pt-2">
            <button type="button" onClick={() => setStep(0)} className="text-stone-500 hover:text-stone-700 font-medium text-sm transition-colors">← Voltar</button>
            <button type="button" onClick={() => setStep(2)} className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-all">
              Próximo <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Step 2: Localização */}
        <div className={`bg-white rounded-2xl border border-stone-100 shadow-card p-6 sm:p-8 space-y-5 ${step === 2 ? '' : 'hidden'}`}>
          <h2 className="text-lg font-display font-bold text-stone-900 mb-4 flex items-center gap-2">
            <span className="w-7 h-7 bg-brand-100 text-brand-600 rounded-lg flex items-center justify-center text-xs font-bold">3</span>
            Localização
          </h2>
          <div>
            <label htmlFor="localEvento" className={labelCls}>Nome do local *</label>
            <input required type="text" id="localEvento" name="localEvento" className={inputCls} placeholder="Ex: Praça Central" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="cidade" className={labelCls}>Cidade *</label>
              <input required type="text" id="cidade" name="cidade" className={inputCls} />
            </div>
            <div>
              <label htmlFor="estado" className={labelCls}>Estado *</label>
              <select required id="estado" name="estado" className={`${inputCls} bg-white`}>
                <option value="">Selecione...</option>
                {ESTADOS_BRASILEIROS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="bairro" className={labelCls}>Bairro *</label>
            <input required type="text" id="bairro" name="bairro" className={inputCls} />
          </div>
          <div className="flex justify-between pt-2">
            <button type="button" onClick={() => setStep(1)} className="text-stone-500 hover:text-stone-700 font-medium text-sm transition-colors">← Voltar</button>
            <button type="button" onClick={() => setStep(3)} className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-all">
              Próximo <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Step 3: Acessibilidade */}
        <div className={`bg-white rounded-2xl border border-stone-100 shadow-card p-6 sm:p-8 space-y-5 ${step === 3 ? '' : 'hidden'}`}>
          <h2 className="text-lg font-display font-bold text-stone-900 mb-4 flex items-center gap-2">
            <span className="w-7 h-7 bg-brand-100 text-brand-600 rounded-lg flex items-center justify-center text-xs font-bold">4</span>
            Acessibilidade
          </h2>
          <div>
            <p className="text-sm font-medium text-stone-700 mb-3">O evento possui recursos de acessibilidade?</p>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="acessivel" value="sim" checked={hasAcessibilidade === 'sim'} onChange={() => setHasAcessibilidade('sim')} className="w-4 h-4 text-brand-500 focus:ring-brand-500" /><span className="text-sm">Sim</span></label>
              <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="acessivel" value="nao" checked={hasAcessibilidade === 'nao'} onChange={() => setHasAcessibilidade('nao')} className="w-4 h-4 text-brand-500 focus:ring-brand-500" /><span className="text-sm">Não</span></label>
            </div>
          </div>
          {hasAcessibilidade === 'sim' && (
            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 animate-fade-in">
              <p className="text-sm font-medium text-stone-700 mb-3">Recursos disponíveis:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {RECURSOS.map(r => (
                  <label key={r} className="flex items-center gap-2 cursor-pointer text-sm text-stone-600">
                    <input type="checkbox" name="recursos" value={r} className="w-4 h-4 rounded text-brand-500 focus:ring-brand-500 border-stone-300" /> {r}
                  </label>
                ))}
              </div>
            </div>
          )}
          <div className="flex justify-between pt-2">
            <button type="button" onClick={() => setStep(2)} className="text-stone-500 hover:text-stone-700 font-medium text-sm transition-colors">← Voltar</button>
            <button type="button" onClick={() => setStep(4)} className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-all">
              Próximo <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Step 4: Contato */}
        <div className={`bg-white rounded-2xl border border-stone-100 shadow-card p-6 sm:p-8 space-y-5 ${step === 4 ? '' : 'hidden'}`}>
          <h2 className="text-lg font-display font-bold text-stone-900 mb-4 flex items-center gap-2">
            <span className="w-7 h-7 bg-brand-100 text-brand-600 rounded-lg flex items-center justify-center text-xs font-bold">5</span>
            Contato <span className="text-stone-400 font-normal text-base ml-1">(Opcionais)</span>
          </h2>
          <div>
            <label htmlFor="contatoOrganizador" className={labelCls}>Nome do organizador</label>
            <input type="text" id="contatoOrganizador" name="contatoOrganizador" className={inputCls} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="instagramOuWhatsapp" className={labelCls}>Instagram ou WhatsApp</label>
              <input type="text" id="instagramOuWhatsapp" name="instagramOuWhatsapp" className={inputCls} placeholder="@usuario ou (11) 99999-9999" />
            </div>
            <div>
              <label htmlFor="linkInformacoes" className={labelCls}>Link para mais informações</label>
              <input type="url" id="linkInformacoes" name="linkInformacoes" className={inputCls} placeholder="https://..." />
            </div>
          </div>
          <div className="pt-4 border-t border-stone-100">
            <div className="bg-brand-50 text-brand-700 p-4 rounded-xl flex gap-3 items-start mb-5 border border-brand-100">
              <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm">Ao enviar, você declara que as informações são verdadeiras e que possui autorização para divulgá-las.</p>
            </div>
            <div className="flex justify-between items-center">
              <button type="button" onClick={() => setStep(3)} className="text-stone-500 hover:text-stone-700 font-medium text-sm transition-colors">← Voltar</button>
              <button type="submit" disabled={isSubmitting}
                className="inline-flex items-center justify-center bg-brand-500 hover:bg-brand-600 text-white px-8 py-3 rounded-xl font-semibold transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-brand-500/20">
                {isSubmitting ? 'Cadastrando...' : 'Cadastrar evento'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
