import { BookOpen, Target, Globe, Heart, ExternalLink } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="bg-white rounded-2xl shadow-card border border-stone-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-brand-500 to-brand-700 p-8 sm:p-12 text-white relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" aria-hidden="true" />
          <div className="relative flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-display font-bold">Sobre o Cultura Perto</h1>
          </div>
          <p className="text-white/80 text-lg leading-relaxed relative">
            Uma plataforma colaborativa para descobrir, acessar e participar de atividades culturais em sua comunidade.
          </p>
        </div>

        <div className="p-8 sm:p-12 space-y-8">
          {/* Missão */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center"><Target className="w-5 h-5 text-brand-500" /></div>
              <h2 className="text-xl font-display font-bold text-stone-900">Nossa Missão</h2>
            </div>
            <p className="text-stone-600 leading-relaxed">
              Muitas vezes, existem eventos culturais acontecendo perto das pessoas, mas falta divulgação, informação centralizada e acesso fácil.
            </p>
            <div className="bg-stone-50 p-6 rounded-xl border border-stone-100">
              <p className="italic text-stone-600 leading-relaxed">
                "Como podemos empregar conhecimentos de dados e tecnologia para que a população possa descobrir, acessar e participar de atividades culturais em suas comunidades, fortalecendo a circulação cultural para além dos grandes centros?"
              </p>
            </div>
          </div>

          {/* ODS */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center"><Globe className="w-5 h-5 text-emerald-500" /></div>
              <h2 className="text-xl font-display font-bold text-stone-900">Impacto Social</h2>
            </div>
            <p className="text-stone-600">Este projeto contribui para os Objetivos de Desenvolvimento Sustentável (ODS) da ONU:</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { ods: 'ODS 4', label: 'Educação de Qualidade', color: 'bg-red-50 text-red-700 border-red-100' },
                { ods: 'ODS 10', label: 'Redução das Desigualdades', color: 'bg-pink-50 text-pink-700 border-pink-100' },
                { ods: 'ODS 11', label: 'Cidades Sustentáveis', color: 'bg-amber-50 text-amber-700 border-amber-100' },
              ].map(({ ods, label, color }) => (
                <div key={ods} className={`${color} border rounded-xl p-4 text-center`}>
                  <p className="font-bold text-lg">{ods}</p>
                  <p className="text-sm font-medium">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Fontes */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center"><Heart className="w-5 h-5 text-purple-500" /></div>
              <h2 className="text-xl font-display font-bold text-stone-900">Fontes de Dados</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {['IBGE SIIC Cultura','Mapa da Cultura','TIC Cultura','Observatório Itaú Cultural','DataViva'].map(fonte => (
                <div key={fonte} className="flex items-center gap-2 text-stone-600 text-sm bg-stone-50 px-4 py-2.5 rounded-xl border border-stone-100">
                  <ExternalLink className="w-3.5 h-3.5 text-stone-400 shrink-0" /> {fonte}
                </div>
              ))}
            </div>
          </div>

          {/* Tema */}
          <div className="bg-brand-50 border border-brand-100 rounded-xl p-5 text-center">
            <p className="text-stone-600 text-sm">
              Este projeto está relacionado ao <strong className="text-brand-700">Tema 2 do Desafio dos Dados 2026: Ampliação do Acesso à Cultura</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
