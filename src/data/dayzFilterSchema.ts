export type MarkerCategoryType =
  | 'construcao'
  | 'militar'
  | 'medico'
  | 'rural'
  | 'industrial'
  | 'pecas'
  | 'carros'
  | 'motos'
  | 'caminhoes'
  | 'bicicletas'
  | 'policia'
  | 'bombeiros'
  | 'agua'
  | 'combustivel'
  | 'contaminada'
  | 'animais'
  | 'locais'
  | 'spawns'
  | 'custom';

export interface FilterItemDef {
  key: string;
  label: string;
  defaultActive?: boolean;
  color: string;
  category: MarkerCategoryType;
  categoryLabel: string;
  iconName: string;
}

export interface FilterGroupDef {
  id: string;
  title: string;
  category: MarkerCategoryType;
  categoryBadge: string;
  groupColor: string;
  items: FilterItemDef[];
}

// Category palette configuration
export const CATEGORY_METADATA: Record<
  MarkerCategoryType,
  { label: string; primaryColor: string; bgBadge: string }
> = {
  militar: { label: 'Militar', primaryColor: '#DC2626', bgBadge: '#450a0a' },
  medico: { label: 'Médico', primaryColor: '#10B981', bgBadge: '#064e3b' },
  construcao: { label: 'Construção', primaryColor: '#F59E0B', bgBadge: '#451a03' },
  industrial: { label: 'Industrial', primaryColor: '#64748B', bgBadge: '#0f172a' },
  pecas: { label: 'Peças & Mecânica', primaryColor: '#EA580C', bgBadge: '#431407' },
  carros: { label: 'Carros', primaryColor: '#3B82F6', bgBadge: '#172554' },
  motos: { label: 'Motos', primaryColor: '#E11D48', bgBadge: '#4c0519' },
  caminhoes: { label: 'Caminhões', primaryColor: '#B45309', bgBadge: '#451a03' },
  bicicletas: { label: 'Bicicletas', primaryColor: '#06B6D4', bgBadge: '#083344' },
  rural: { label: 'Rural', primaryColor: '#65A30D', bgBadge: '#1a2e05' },
  policia: { label: 'Polícia', primaryColor: '#2563EB', bgBadge: '#1e1b4b' },
  bombeiros: { label: 'Bombeiros', primaryColor: '#EF4444', bgBadge: '#450a0a' },
  agua: { label: 'Água / Poços', primaryColor: '#0EA5E9', bgBadge: '#082f49' },
  combustivel: { label: 'Combustível', primaryColor: '#CA8A04', bgBadge: '#422006' },
  contaminada: { label: 'Zonas Tóxicas', primaryColor: '#A855F7', bgBadge: '#3b0764' },
  animais: { label: 'Animais / Caça', primaryColor: '#14B8A6', bgBadge: '#042f2e' },
  locais: { label: 'Cidades & Locais', primaryColor: '#EA580C', bgBadge: '#431407' },
  spawns: { label: 'Spawns', primaryColor: '#8B5CF6', bgBadge: '#2e1065' },
  custom: { label: 'Personalizado', primaryColor: '#F59E0B', bgBadge: '#451a03' },
};

export const DAYZ_FILTER_GROUPS: FilterGroupDef[] = [
  // 1. Militar
  {
    id: 'militar',
    title: 'Militar & Defesa',
    category: 'militar',
    categoryBadge: 'Militar',
    groupColor: '#DC2626',
    items: [
      { key: 'military', label: 'Instalações militares', defaultActive: false, color: '#DC2626', category: 'militar', categoryLabel: 'Militar', iconName: 'Shield' },
      { key: 'bunker', label: 'Bunkers subterrâneos', defaultActive: false, color: '#B91C1C', category: 'militar', categoryLabel: 'Militar', iconName: 'Crosshair' },
      { key: 'staticmilitaryconvoy', label: 'Comboios militares', defaultActive: false, color: '#991B1B', category: 'militar', categoryLabel: 'Militar', iconName: 'ShieldAlert' },
      { key: 'statichelicrash', label: 'Helicópteros acidentados (Crash)', defaultActive: false, color: '#EF4444', category: 'militar', categoryLabel: 'Militar', iconName: 'Flame' },
      { key: 'locked-container', label: 'Recipientes & Caixas Militares', defaultActive: false, color: '#7F1D1D', category: 'militar', categoryLabel: 'Militar', iconName: 'Package' },
    ],
  },

  // 2. Médico & Saúde
  {
    id: 'medico',
    title: 'Médico & Saúde',
    category: 'medico',
    categoryBadge: 'Médico',
    groupColor: '#10B981',
    items: [
      { key: 'hospital', label: 'Hospitais & Clínicas', defaultActive: false, color: '#10B981', category: 'medico', categoryLabel: 'Médico', iconName: 'HeartPulse' },
    ],
  },

  // 3. Construção & Obras
  {
    id: 'construcao',
    title: 'Construção & Obras',
    category: 'construcao',
    categoryBadge: 'Construção',
    groupColor: '#F59E0B',
    items: [
      { key: 'castle', label: 'Castelos & Fortificações', defaultActive: false, color: '#D97706', category: 'construcao', categoryLabel: 'Construção', iconName: 'Landmark' },
      { key: 'loc-ruin', label: 'Ruínas & Estruturas Antigas', defaultActive: false, color: '#B45309', category: 'construcao', categoryLabel: 'Construção', iconName: 'Hammer' },
    ],
  },

  // 4. Industrial & Infraestrutura
  {
    id: 'industrial',
    title: 'Industrial & Infraestrutura',
    category: 'industrial',
    categoryBadge: 'Industrial',
    groupColor: '#64748B',
    items: [
      { key: 'industrial', label: 'Zonas Industriais & Galpões', defaultActive: false, color: '#64748B', category: 'industrial', categoryLabel: 'Industrial', iconName: 'Factory' },
      { key: 'irrigation-tunnel', label: 'Túneis & Aquedutos', defaultActive: false, color: '#475569', category: 'industrial', categoryLabel: 'Industrial', iconName: 'Disc' },
    ],
  },

  // 5. Peças de Veículos & Mecânica
  {
    id: 'pecas',
    title: 'Peças de Veículos & Mecânica',
    category: 'pecas',
    categoryBadge: 'Peças & Mecânica',
    groupColor: '#EA580C',
    items: [
      { key: 'garage', label: 'Garagens & Oficinas de Peças', defaultActive: false, color: '#EA580C', category: 'pecas', categoryLabel: 'Peças', iconName: 'Wrench' },
    ],
  },

  // 6. Carros
  {
    id: 'carros',
    title: 'Carros Civis & 4x4',
    category: 'carros',
    categoryBadge: 'Carros',
    groupColor: '#3B82F6',
    items: [
      { key: 'vehicleciviliansedan', label: 'Sedan Sarka 120', defaultActive: false, color: '#EAB308', category: 'carros', categoryLabel: 'Carro', iconName: 'Car' },
      { key: 'vehiclesedan02', label: 'Sedan Olga 24', defaultActive: false, color: '#F59E0B', category: 'carros', categoryLabel: 'Carro', iconName: 'Car' },
      { key: 'vehiclehatchback02', label: 'Hatchback Gunter 2', defaultActive: false, color: '#0284C7', category: 'carros', categoryLabel: 'Carro', iconName: 'CarFront' },
      { key: 'vehicleoffroadhatchback', label: 'Ada 4x4 (Jeep)', defaultActive: false, color: '#65A30D', category: 'carros', categoryLabel: '4x4', iconName: 'Compass' },
      { key: 'vehicleoffroad02', label: 'M1025 Humvee Tático', defaultActive: false, color: '#16A34A', category: 'carros', categoryLabel: '4x4', iconName: 'Shield' },
    ],
  },

  // 7. Motos
  {
    id: 'motos',
    title: 'Motos & Duas Rodas',
    category: 'motos',
    categoryBadge: 'Motos',
    groupColor: '#E11D48',
    items: [
      { key: 'vehiclemotorbike', label: 'Motocicleta 1.30', defaultActive: true, color: '#E11D48', category: 'motos', categoryLabel: 'Moto', iconName: 'Bike' },
    ],
  },

  // 8. Caminhões
  {
    id: 'caminhoes',
    title: 'Caminhões & Veículos Pesados',
    category: 'caminhoes',
    categoryBadge: 'Caminhões',
    groupColor: '#B45309',
    items: [
      { key: 'vehicletruck01', label: 'Caminhão M3S Pesado', defaultActive: false, color: '#B45309', category: 'caminhoes', categoryLabel: 'Caminhão', iconName: 'Truck' },
      { key: 'staticwatertruck', label: 'Caminhão Pipa (Aguadeiro)', defaultActive: false, color: '#0284C7', category: 'caminhoes', categoryLabel: 'Caminhão', iconName: 'Truck' },
    ],
  },

  // 9. Bicicletas & Transporte Leve
  {
    id: 'bicicletas',
    title: 'Bicicletas & Transporte Leve',
    category: 'bicicletas',
    categoryBadge: 'Bicicletas',
    groupColor: '#06B6D4',
    items: [
      { key: 'bicycle', label: 'Bicicletas & Ciclos', defaultActive: false, color: '#06B6D4', category: 'bicicletas', categoryLabel: 'Bicicleta', iconName: 'Bike' },
    ],
  },

  // 10. Rural & Residencial
  {
    id: 'rural',
    title: 'Rural & Agricultura',
    category: 'rural',
    categoryBadge: 'Rural',
    groupColor: '#65A30D',
    items: [
      { key: 'farm', label: 'Fazendas & Celeiros', defaultActive: false, color: '#65A30D', category: 'rural', categoryLabel: 'Rural', iconName: 'Wheat' },
      { key: 'village-houses', label: 'Casas de Aldeões', defaultActive: false, color: '#4D7C0F', category: 'rural', categoryLabel: 'Rural', iconName: 'Home' },
      { key: 'city-houses', label: 'Casas da Cidade', defaultActive: false, color: '#52525B', category: 'rural', categoryLabel: 'Residencial', iconName: 'Home' },
      { key: 'office', label: 'Prédios & Escritórios', defaultActive: false, color: '#78716C', category: 'rural', categoryLabel: 'Comercial', iconName: 'Briefcase' },
    ],
  },

  // 11. Polícia & Bombeiros
  {
    id: 'emergencia',
    title: 'Polícia & Bombeiros',
    category: 'policia',
    categoryBadge: 'Emergência',
    groupColor: '#2563EB',
    items: [
      { key: 'police', label: 'Delegacias de Polícia', defaultActive: true, color: '#2563EB', category: 'policia', categoryLabel: 'Polícia', iconName: 'ShieldAlert' },
      { key: 'staticpolicecar', label: 'Carros & Comboios Policiais', defaultActive: false, color: '#1D4ED8', category: 'policia', categoryLabel: 'Polícia', iconName: 'CarFront' },
      { key: 'firestation', label: 'Quartéis de Bombeiros', defaultActive: false, color: '#EF4444', category: 'bombeiros', categoryLabel: 'Bombeiros', iconName: 'Flame' },
    ],
  },

  // 12. Água & Combustível
  {
    id: 'recursos',
    title: 'Água & Combustível',
    category: 'agua',
    categoryBadge: 'Recursos',
    groupColor: '#0EA5E9',
    items: [
      { key: 'well', label: 'Poços de Água Potável', defaultActive: true, color: '#0EA5E9', category: 'agua', categoryLabel: 'Água', iconName: 'Droplets' },
      { key: 'coastal', label: 'Litoral & Fontes Costeiras', defaultActive: false, color: '#0284C7', category: 'agua', categoryLabel: 'Água', iconName: 'Droplets' },
      { key: 'fuelstation', label: 'Postos de Gasolina', defaultActive: false, color: '#CA8A04', category: 'combustivel', categoryLabel: 'Combustível', iconName: 'Fuel' },
    ],
  },

  // 13. Áreas Contaminadas
  {
    id: 'contaminadas',
    title: 'Áreas Contaminadas (Gás)',
    category: 'contaminada',
    categoryBadge: 'Tóxico',
    groupColor: '#A855F7',
    items: [
      { key: 'contamination-static', label: 'Zonas Tóxicas Estáticas', defaultActive: false, color: '#E11D48', category: 'contaminada', categoryLabel: 'Tóxico', iconName: 'Biohazard' },
      { key: 'contamination-dynamic', label: 'Zonas Tóxicas Dinâmicas', defaultActive: false, color: '#9333EA', category: 'contaminada', categoryLabel: 'Tóxico', iconName: 'Skull' },
    ],
  },

  // 14. Animais & Caça
  {
    id: 'animais',
    title: 'Animais & Caça',
    category: 'animais',
    categoryBadge: 'Animais',
    groupColor: '#14B8A6',
    items: [
      { key: 'dog', label: 'Cães de guarda', defaultActive: false, color: '#6366F1', category: 'animais', categoryLabel: 'Animal', iconName: 'Dog' },
      { key: 'wildboar', label: 'Javalis selvagens', defaultActive: false, color: '#84CC16', category: 'animais', categoryLabel: 'Animal', iconName: 'PawPrint' },
      { key: 'mouflon', label: 'Muflões (Carneiros)', defaultActive: false, color: '#14B8A6', category: 'animais', categoryLabel: 'Animal', iconName: 'PawPrint' },
      { key: 'hare', label: 'Lebres & Coelhos', defaultActive: false, color: '#A3E635', category: 'animais', categoryLabel: 'Animal', iconName: 'PawPrint' },
      { key: 'fox', label: 'Raposas', defaultActive: false, color: '#F97316', category: 'animais', categoryLabel: 'Animal', iconName: 'PawPrint' },
      { key: 'goat', label: 'Cabras', defaultActive: false, color: '#10B981', category: 'animais', categoryLabel: 'Animal', iconName: 'PawPrint' },
      { key: 'sheep', label: 'Ovelhas', defaultActive: false, color: '#059669', category: 'animais', categoryLabel: 'Animal', iconName: 'PawPrint' },
      { key: 'hen', label: 'Galinhas', defaultActive: false, color: '#FACC15', category: 'animais', categoryLabel: 'Animal', iconName: 'PawPrint' },
      { key: 'monitor', label: 'Lagartos Monitores', defaultActive: false, color: '#06B6D4', category: 'animais', categoryLabel: 'Animal', iconName: 'PawPrint' },
    ],
  },

  // 15. Cidades & Locais
  {
    id: 'locais',
    title: 'Cidades & Localidades',
    category: 'locais',
    categoryBadge: 'Cidades',
    groupColor: '#EA580C',
    items: [
      { key: 'loc-city', label: 'Cidades Principais', defaultActive: true, color: '#EA580C', category: 'locais', categoryLabel: 'Cidade', iconName: 'Building2' },
      { key: 'loc-village', label: 'Vilarejos', defaultActive: true, color: '#FB923C', category: 'locais', categoryLabel: 'Vilarejo', iconName: 'Home' },
      { key: 'loc-hamlet', label: 'Povoados', defaultActive: false, color: '#FDBA74', category: 'locais', categoryLabel: 'Povoado', iconName: 'Home' },
      { key: 'loc-hill', label: 'Colinas e Picos', defaultActive: false, color: '#78716C', category: 'locais', categoryLabel: 'Colina', iconName: 'Mountain' },
      { key: 'loc-local', label: 'Localidades Gerais', defaultActive: false, color: '#94A3B8', category: 'locais', categoryLabel: 'Local', iconName: 'MapPin' },
    ],
  },

  // 16. Spawns do Jogador
  {
    id: 'spawns',
    title: 'Spawns do Jogador',
    category: 'spawns',
    categoryBadge: 'Spawn',
    groupColor: '#8B5CF6',
    items: [
      { key: 'player-spawn-safe', label: 'Pontos de surgimento seguros', defaultActive: false, color: '#8B5CF6', category: 'spawns', categoryLabel: 'Spawn', iconName: 'UserCheck' },
      { key: 'player-spawn-fresh', label: 'Pontos de novo sobrevivente (Fresh)', defaultActive: false, color: '#A855F7', category: 'spawns', categoryLabel: 'Spawn', iconName: 'UserPlus' },
      { key: 'player-spawn-hop', label: 'Pontos de troca de servidor', defaultActive: false, color: '#C084FC', category: 'spawns', categoryLabel: 'Spawn', iconName: 'UserCheck' },
    ],
  },

  // 17. Meus Marcadores
  {
    id: 'custom',
    title: 'Meus Marcadores',
    category: 'custom',
    categoryBadge: 'Custom',
    groupColor: '#F59E0B',
    items: [
      { key: 'custom', label: 'Marcadores Pessoais Criados', defaultActive: true, color: '#F59E0B', category: 'custom', categoryLabel: 'Custom', iconName: 'Star' },
    ],
  },
];

// Helper to get initial active set
export const getInitialActiveFilterKeys = (): Set<string> => {
  const set = new Set<string>();
  DAYZ_FILTER_GROUPS.forEach(g => {
    g.items.forEach(item => {
      if (item.defaultActive) {
        set.add(item.key);
      }
    });
  });
  return set;
};

// Map each filterKey to its color
export const FILTER_KEY_COLORS: Record<string, string> = {};
export const FILTER_KEY_ICONS: Record<string, string> = {};
export const FILTER_KEY_CATEGORIES: Record<string, MarkerCategoryType> = {};
export const FILTER_KEY_CATEGORY_LABELS: Record<string, string> = {};

DAYZ_FILTER_GROUPS.forEach(g => {
  g.items.forEach(i => {
    FILTER_KEY_COLORS[i.key] = i.color;
    FILTER_KEY_ICONS[i.key] = i.iconName;
    FILTER_KEY_CATEGORIES[i.key] = i.category;
    FILTER_KEY_CATEGORY_LABELS[i.key] = i.categoryLabel;
  });
});

/**
 * Returns inline SVG icon path markup for rendering Leaflet divIcon markers
 */
export const getMarkerSvgContent = (filterKey: string, size = 12): string => {
  const icon = FILTER_KEY_ICONS[filterKey] || 'Star';
  const s = size;

  switch (icon) {
    case 'Shield':
      return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;
    case 'Crosshair':
      return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 3v4M12 17v4M3 12h4M17 12h4"/></svg>`;
    case 'Package':
      return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16.5 9.4 7.55 4.24M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" y1="22" x2="12" y2="12"/></svg>`;
    case 'Flame':
      return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`;
    case 'HeartPulse':
      return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l1.5-3 2 6.5 1.5-3.5h6.28"/></svg>`;
    case 'Landmark':
      return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg>`;
    case 'Hammer':
      return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 12-8.5 8.5a2.12 2.12 0 1 1-3-3L12 9"/><path d="M17.64 15 22 10.64l-4.24-4.24-4.36 4.36"/></svg>`;
    case 'Factory':
      return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/></svg>`;
    case 'Disc':
      return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>`;
    case 'Wrench':
      return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`;
    case 'Car':
    case 'CarFront':
      return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10l-2.4-4.2C13.2 5.3 12.6 5 12 5H6c-.6 0-1.2.3-1.6.8L2 10s-2.7.6-4.5 1.1C-3.3 11.3-4 12.1-4 13v3c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>`;
    case 'Compass':
      return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>`;
    case 'Truck':
      return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 17h4V5H2v12h3"/><path d="M14 8h5l3 4v5h-4"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>`;
    case 'Bike':
      return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg>`;
    case 'Wheat':
      return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 22 16 8"/><path d="M3.47 12.53 5 11l1.53 1.53a3.5 3.5 0 0 1 0 4.94L5 19l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"/><path d="M7.47 8.53 9 7l1.53 1.53a3.5 3.5 0 0 1 0 4.94L9 15l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"/><path d="M11.47 4.53 13 3l1.53 1.53a3.5 3.5 0 0 1 0 4.94L13 11l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"/><path d="M20 2h2v2a4 4 0 0 1-4 4h-2V6a4 4 0 0 1 4-4Z"/><path d="M11.47 17.47 13 19l1.53-1.53a3.5 3.5 0 0 0 0-4.94L13 11l-1.53 1.53a3.5 3.5 0 0 0 0 4.94Z"/></svg>`;
    case 'Home':
      return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;
    case 'Building2':
      return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>`;
    case 'Briefcase':
      return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`;
    case 'ShieldAlert':
      return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
    case 'Droplets':
      return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"/><path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97"/></svg>`;
    case 'Fuel':
      return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="22" x2="15" y2="22"/><path d="M4 9h10"/><path d="M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18"/><path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2a2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 5"/></svg>`;
    case 'Biohazard':
      return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="11.9" r="2"/><path d="M6.7 3.4a6.5 6.5 0 0 1 10.6 0"/><path d="M3.4 17.3a6.5 6.5 0 0 1 5.3-9.2"/><path d="M15.3 8.1a6.5 6.5 0 0 1 5.3 9.2"/><path d="M9.9 14.5a6.5 6.5 0 0 1-6.5-6.4"/><path d="M14.1 14.5a6.5 6.5 0 0 0 6.5-6.4"/></svg>`;
    case 'Skull':
      return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><path d="M8 20v2h8v-2"/><path d="m12.5 17-.5-1-.5 1h1z"/><path d="M16 20a2 2 0 0 0 1.56-3.25 8 8 0 1 0-11.12 0A2 2 0 0 0 8 20"/></svg>`;
    case 'Dog':
    case 'PawPrint':
      return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="20" cy="16" r="2"/><path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z"/></svg>`;
    case 'Mountain':
      return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></svg>`;
    case 'UserCheck':
    case 'UserPlus':
      return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
    case 'Star':
    default:
      return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
  }
};
