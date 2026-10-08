export type RealMarkerCategory =
  | 'locais'
  | 'marcadores'
  | 'transporte'
  | 'contaminadas'
  | 'animais'
  | 'eventos'
  | 'city'
  | 'military'
  | 'water'
  | 'vehicle'
  | 'medical'
  | 'police'
  | 'fuel'
  | 'event'
  | 'custom'
  | string;

export interface CategoryLabelInfo {
  label: string;
  color: string;
  description?: string;
}

export const REAL_CATEGORY_LABELS: Record<string, CategoryLabelInfo> = {
  // Primary groups
  locais: { label: 'Locais & Cidades', color: '#EA580C' },
  marcadores: { label: 'Instalações & POIs', color: '#DC2626' },
  transporte: { label: 'Veículos & Transporte', color: '#CA8A04' },
  contaminadas: { label: 'Zonas Contaminadas', color: '#E11D48' },
  animais: { label: 'Fauna & Animais', color: '#10B981' },
  eventos: { label: 'Eventos Dinâmicos', color: '#DC2626' },

  // Specific types
  'loc-city': { label: 'Cidade Principal', color: '#EA580C' },
  'loc-village': { label: 'Vilarejo', color: '#F97316' },
  'loc-hamlet': { label: 'Povoado', color: '#FB923C' },
  'loc-hill': { label: 'Colina / Pico', color: '#78716C' },
  'loc-ruin': { label: 'Ruínas Antigas', color: '#A8A29E' },
  'loc-local': { label: 'Localidade', color: '#CBD5E1' },

  military: { label: 'Instalação Militar', color: '#DC2626' },
  bunker: { label: 'Bunker Subterrâneo', color: '#B91C1C' },
  'locked-container': { label: 'Recipiente Fechado', color: '#991B1B' },
  police: { label: 'Delegacia de Polícia', color: '#2563EB' },
  hospital: { label: 'Hospital / Posto Médico', color: '#059669' },
  well: { label: 'Poço de Água', color: '#0284C7' },
  coastal: { label: 'Litoral', color: '#0891B2' },
  firestation: { label: 'Quartel de Bombeiros', color: '#EF4444' },
  castle: { label: 'Castelo Medieval', color: '#D97706' },
  garage: { label: 'Garagem', color: '#64748B' },
  industrial: { label: 'Complexo Industrial', color: '#475569' },
  'irrigation-tunnel': { label: 'Túnel de Irrigação', color: '#7C3AED' },
  fuelstation: { label: 'Posto de Gasolina', color: '#D97706' },
  'village-houses': { label: 'Casas de Vilarejo', color: '#71717A' },
  'city-houses': { label: 'Casas Urbanas', color: '#52525B' },
  office: { label: 'Edifício de Escritório', color: '#78716C' },
  farm: { label: 'Fazenda / Celeiro', color: '#65A30D' },
  'player-spawn-safe': { label: 'Ponto de Surgimento Seguro', color: '#8B5CF6' },
  'player-spawn-fresh': { label: 'Spawn de Jogador Novo', color: '#A855F7' },
  'player-spawn-hop': { label: 'Troca de Servidor', color: '#C084FC' },

  vehicleciviliansedan: { label: 'Sarka 120', color: '#EAB308' },
  vehiclehatchback02: { label: 'Gunter 2', color: '#CA8A04' },
  vehicleoffroad02: { label: 'M1025', color: '#16A34A' },
  vehicleoffroadhatchback: { label: 'Ada 4x4', color: '#F59E0B' },
  vehiclesedan02: { label: 'Olga 24', color: '#D97706' },
  vehicletruck01: { label: 'Caminhão M3S', color: '#B45309' },
  vehiclemotorbike: { label: 'Motocicleta 1.30', color: '#EF4444' },

  'contamination-static': { label: 'Zona Estática de Gás', color: '#E11D48' },
  'contamination-dynamic': { label: 'Zona Dinâmica de Gás', color: '#BE123C' },

  statichelicrash: { label: 'Helicóptero Acidentado (Crash)', color: '#DC2626' },
  staticmilitaryconvoy: { label: 'Comboio Militar', color: '#B91C1C' },
  staticpolicecar: { label: 'Comboio Policial', color: '#2563EB' },
  staticwatertruck: { label: 'Caminhão Pipa (Água)', color: '#0284C7' },

  custom: { label: 'Marcador Pessoal', color: '#F59E0B' },
};

export interface RealNasdaraMarker {
  id: string;
  name: string;
  filterKey: string;
  group?: string;
  subKey?: string;
  category?: string;
  subCategory?: string;
  lat: number;
  lng: number;
  x: number;
  z: number;
  grid: string;
  title: string;
  desc: string;
  note?: string;
}

