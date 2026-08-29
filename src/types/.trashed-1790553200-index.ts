export type EventCategory = 
  | 'Música'
  | 'Teatro'
  | 'Dança'
  | 'Literatura'
  | 'Cinema'
  | 'Artes visuais'
  | 'Cultura popular'
  | 'Oficina'
  | 'Feira cultural'
  | 'Gastronomia cultural'
  | 'Outro';

export interface EventData {
  id?: string;
  nomeEvento: string;
  descricaoCurta: string;
  cidade: string;
  estado: string;
  bairro: string;
  localEvento: string;
  dataEvento: string;
  horaEvento?: string;
  dataFim?: string;
  horaFim?: string;
  imagemCapa?: string;
  preco: 'gratuito' | 'pago';
  valorIngresso?: string;
  categoria: EventCategory;
  acessivel: boolean;
  recursosAcessibilidade?: string[];
  contatoOrganizador?: string;
  instagramOuWhatsapp?: string;
  linkInformacoes?: string;
  criadoEm: number;
  atualizadoEm: number;
  status: 'publicado';
  demonstracao?: boolean;
}

export const ESTADOS_BRASILEIROS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];
