import { BookOpen } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-3xl mx-auto bg-white p-8 sm:p-12 rounded-2xl shadow-sm border border-gray-100 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-emerald-100 p-3 rounded-full text-emerald-600">
          <BookOpen className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Sobre o Cultura Perto</h1>
      </div>

      <div className="space-y-6 text-gray-700 text-lg leading-relaxed">
        <p>
          O <strong>Cultura Perto</strong> é uma plataforma colaborativa criada para ajudar a população a descobrir, acessar e participar de atividades culturais em suas comunidades.
        </p>
        
        <p>
          Muitas vezes, existem eventos culturais acontecendo perto das pessoas, mas falta divulgação, informação centralizada e acesso fácil.
        </p>

        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 my-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">A Pergunta-chave</h2>
          <p className="italic text-gray-600">
            "Como podemos empregar conhecimentos de dados e tecnologia para que a população possa descobrir, acessar e participar de atividades culturais em suas comunidades, fortalecendo a circulação cultural para além dos grandes centros?"
          </p>
        </div>

        <p>
          Este projeto está relacionado ao <strong>Tema 2 do Desafio dos Dados 2026: Ampliação do Acesso à Cultura</strong>, e tem como objetivo contribuir diretamente para os seguintes Objetivos de Desenvolvimento Sustentável (ODS) da ONU:
        </p>

        <ul className="list-disc pl-6 space-y-2 mb-8">
          <li><strong>ODS 4:</strong> Educação de Qualidade;</li>
          <li><strong>ODS 10:</strong> Redução das Desigualdades;</li>
          <li><strong>ODS 11:</strong> Cidades e Comunidades Sustentáveis.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-900 mt-10 mb-4">Fontes de dados recomendadas para análise externa</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>IBGE SIIC Cultura</li>
          <li>Mapa da Cultura</li>
          <li>TIC Cultura</li>
          <li>Observatório Itaú Cultural</li>
          <li>DataViva</li>
        </ul>
      </div>
    </div>
  );
}
