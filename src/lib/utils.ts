export function capitalizeWords(str: string): string {
  if (!str) return '';
  const prepositions = new Set(['da','de','do','das','dos','e','a','o','as','os','em','no','na','nos','nas','para','por','com','sem']);
  return str.split(' ').map((word, i) => {
    if (i > 0 && prepositions.has(word.toLowerCase())) return word.toLowerCase();
    if (word.length === 0) return '';
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join(' ');
}

export function normalizeText(str: string): string {
  if (!str) return '';
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

export function escapeHtml(str: string): string {
  if (!str) return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}

export function formatDateBR(dateStr: string): string {
  if (!dateStr) return '';
  try {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR');
  } catch { return dateStr; }
}

export function daysUntil(dateStr: string): string | null {
  if (!dateStr) return null;
  const event = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0,0,0,0);
  const diff = Math.round((event.getTime() - today.getTime()) / (1000*60*60*24));
  if (diff < 0) return null;
  if (diff === 0) return 'Hoje';
  if (diff === 1) return 'Amanhã';
  if (diff <= 7) return `Daqui ${diff} dias`;
  return null;
}

export const CATEGORY_COLORS: Record<string, { bg: string; text: string; icon: string }> = {
  'Música': { bg: 'bg-violet-100', text: 'text-violet-700', icon: '🎶' },
  'Teatro': { bg: 'bg-rose-100', text: 'text-rose-700', icon: '🎭' },
  'Dança': { bg: 'bg-pink-100', text: 'text-pink-700', icon: '💃' },
  'Literatura': { bg: 'bg-sky-100', text: 'text-sky-700', icon: '📚' },
  'Cinema': { bg: 'bg-slate-100', text: 'text-slate-700', icon: '🎬' },
  'Artes visuais': { bg: 'bg-amber-100', text: 'text-amber-700', icon: '🎨' },
  'Cultura popular': { bg: 'bg-orange-100', text: 'text-orange-700', icon: '🎪' },
  'Oficina': { bg: 'bg-teal-100', text: 'text-teal-700', icon: '🛠' },
  'Feira cultural': { bg: 'bg-lime-100', text: 'text-lime-700', icon: '🏪' },
  'Gastronomia cultural': { bg: 'bg-red-100', text: 'text-red-700', icon: '🍽' },
  'Outro': { bg: 'bg-stone-100', text: 'text-stone-600', icon: '✨' },
};
