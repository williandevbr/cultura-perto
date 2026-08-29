import { Link } from 'react-router-dom';
import { Compass, PlusCircle } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center max-w-3xl mx-auto space-y-12 animate-in fade-in duration-500">
      <div className="space-y-6">
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-gray-900">
          Cultura Perto
        </h1>
        <p className="text-xl sm:text-2xl text-gray-600 font-medium leading-relaxed">
          Descubra e divulgue eventos culturais perto de você
        </p>
      </div>

      <p className="text-lg text-gray-500 italic max-w-lg">
        "A cultura local ganha força quando a comunidade sabe onde ela acontece."
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mt-8">
        <Link
          to="/eventos"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-sm hover:shadow-md"
        >
          <Compass className="w-5 h-5" />
          Ver eventos
        </Link>
        <Link
          to="/cadastrar"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 px-8 py-4 rounded-xl font-semibold text-lg transition-all"
        >
          <PlusCircle className="w-5 h-5" />
          Cadastrar evento
        </Link>
      </div>
    </div>
  );
}
