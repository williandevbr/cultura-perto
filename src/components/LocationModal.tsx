import { useState } from 'react';
import { MapPin, Navigation, Loader2, X, ChevronDown, Globe } from 'lucide-react';
import { ESTADOS_BRASILEIROS } from '../types';
import { useLocation } from '../context/LocationContext';

const selectCls = 'w-full rounded-xl border border-gray-200 bg-white p-3 text-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all appearance-none pr-9';

export default function LocationModal() {
  const { isLocationDefined, isDetecting, error, detectLocation, setLocation } = useLocation();
  const [ufSel, setUfSel] = useState('');
  const [cidadeSel, setCidadeSel] = useState('');
  const [showManual, setShowManual] = useState(false);

  if (isLocationDefined) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4" role="dialog" aria-modal="true" aria-label="Selecionar localização">
      <div className="bg-white rounded-3xl shadow-xl max-w-lg w-full p-8 relative overflow-hidden">
        <div className="relative">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Globe className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Onde você está?</h2>
            <p className="text-gray-500">Ative sua localização para ver eventos pertinho de você, ou escolha manualmente.</p>
          </div>

          <div className="space-y-3 mb-6">
            <button onClick={detectLocation} disabled={isDetecting}
              className="w-full inline-flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70 text-white px-6 py-4 rounded-xl font-semibold text-lg transition-all">
              {isDetecting ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Detectando localização...</>
              ) : (
                <><Navigation className="w-5 h-5" /> Usar minha localização</>
              )}
            </button>
            <button onClick={() => setShowManual(!showManual)}
              className="w-full inline-flex items-center justify-center gap-3 bg-white border-2 border-gray-200 hover:border-emerald-300 text-gray-700 px-6 py-4 rounded-xl font-semibold text-lg transition-all">
              <MapPin className="w-5 h-5" />
              {showManual ? 'Fechar seleção' : 'Escolher estado e cidade'}
            </button>
          </div>

          {error && (
            <div className="mb-6 bg-amber-50 text-amber-700 p-4 rounded-xl text-sm border border-amber-100" role="alert">{error}</div>
          )}

          {showManual && (
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200 space-y-4">
              <div>
                <label htmlFor="uf-modal" className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <div className="relative">
                  <select id="uf-modal" value={ufSel} onChange={(e) => { setUfSel(e.target.value); setCidadeSel(''); }} className={selectCls}>
                    <option value="">Selecione o estado</option>
                    {ESTADOS_BRASILEIROS.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" aria-hidden="true" />
                </div>
              </div>
              <div>
                <label htmlFor="cidade-modal" className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                <input id="cidade-modal" type="text" value={cidadeSel} onChange={(e) => setCidadeSel(e.target.value)} placeholder="Digite o nome da cidade" disabled={!ufSel}
                  className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed" />
              </div>
              <button onClick={() => { if (ufSel && cidadeSel.trim()) setLocation(ufSel, cidadeSel.trim()); }} disabled={!ufSel || !cidadeSel.trim()}
                className="w-full inline-flex items-center justify-center bg-gray-900 hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-semibold transition-all">
                Confirmar localização
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
