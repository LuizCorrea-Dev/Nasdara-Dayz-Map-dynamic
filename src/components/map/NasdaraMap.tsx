import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import {
  Shield,
  Droplet,
  Compass,
  Building,
  Radio,
  Flame,
  AlertTriangle,
  Eye,
  Cross,
  MapPin,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Ruler,
  Wind,
  Layers,
  Search,
  Plus,
  Navigation,
  Info,
} from 'lucide-react';
import {
  MapLocation,
  MarkerCategory,
  NASDARA_LOCATIONS,
  CATEGORY_INFO,
} from '../../data/nasdaraData';
import { IconButton } from '../ui/IconButton';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export interface CustomMarker {
  id: string;
  name: string;
  x: number;
  y: number;
  category: 'custom';
  note?: string;
  gridCoord: string;
}

export type MapLayerStyle = 'topo' | 'satellite' | 'nvg';

interface NasdaraMapProps {
  selectedLocation: MapLocation | null;
  onSelectLocation: (loc: MapLocation | null) => void;
  activeCategories: Set<MarkerCategory>;
  searchQuery: string;
  customMarkers: CustomMarker[];
  onAddCustomMarker: (marker: CustomMarker) => void;
  isSandstormActive: boolean;
  mapLayer: MapLayerStyle;
  onOpenSurvivalGuide: () => void;
}

// STYLED COMPONENTS SEPARATION (Agnostic layout, strictly themed)
const MapWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 480px;
  overflow: hidden;
  background-color: ${props => props.theme.colors.mapBg};
  touch-action: none;
  user-select: none;
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
`;

const SvgCanvas = styled.svg<{ $layer: MapLayerStyle }>`
  width: 100%;
  height: 100%;
  display: block;
  filter: ${props => {
    if (props.$layer === 'nvg') {
      return 'brightness(0.9) contrast(1.3) hue-rotate(85deg) saturate(2.5)';
    }
    return 'none';
  }};
`;

const ControlsFloatingBar = styled.div`
  position: absolute;
  top: ${props => props.theme.spacing.md};
  right: ${props => props.theme.spacing.md};
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
  z-index: 20;

  @media (max-width: 640px) {
    top: ${props => props.theme.spacing.sm};
    right: ${props => props.theme.spacing.sm};
  }
`;

const CoordinateHud = styled.div`
  position: absolute;
  top: ${props => props.theme.spacing.md};
  left: ${props => props.theme.spacing.md};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  background-color: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.md};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  z-index: 15;
  pointer-events: none;
  font-family: monospace;
  font-size: 13px;
  font-weight: 700;
  color: ${props => props.theme.colors.text};

  @media (max-width: 640px) {
    top: ${props => props.theme.spacing.sm};
    left: ${props => props.theme.spacing.sm};
    font-size: 11px;
    padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  }
`;

const RulerMeasureHud = styled.div`
  position: absolute;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
  background-color: ${props => props.theme.colors.surface};
  border: 2px solid ${props => props.theme.colors.primary};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.md};
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  z-index: 25;
  width: calc(100% - 32px);
  max-width: 420px;
  box-sizing: border-box;

  @media (min-width: 768px) {
    bottom: ${props => props.theme.spacing.lg};
  }
`;

const RulerTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 700;
  font-size: 14px;
  color: ${props => props.theme.colors.text};
`;

const RulerStatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${props => props.theme.spacing.sm};
  margin-top: ${props => props.theme.spacing.xs};
`;

const RulerStatItem = styled.div`
  display: flex;
  flex-direction: column;
  background-color: ${props => props.theme.colors.surfaceVariant};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.sm};
  border: 1px solid ${props => props.theme.colors.border};
`;

const StatLabel = styled.span`
  font-size: 10px;
  text-transform: uppercase;
  color: ${props => props.theme.colors.textMuted};
  font-weight: 600;
`;

const StatValue = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
`;

const SandstormEffectOverlay = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(
      ellipse at center,
      rgba(217, 119, 6, 0.28) 0%,
      rgba(180, 83, 9, 0.52) 80%
    );
  backdrop-filter: blur(1.5px);
  z-index: 10;
  animation: sandWindPulse 4s ease-in-out infinite alternate;

  @keyframes sandWindPulse {
    0% {
      opacity: 0.65;
    }
    100% {
      opacity: 0.95;
    }
  }
`;

const MarkerPinGroup = styled.g`
  cursor: pointer;
  transition: transform 0.15s ease-out;

  &:hover {
    transform: scale(1.2);
  }
`;

export const NasdaraMap: React.FC<NasdaraMapProps> = ({
  selectedLocation,
  onSelectLocation,
  activeCategories,
  searchQuery,
  customMarkers,
  onAddCustomMarker,
  isSandstormActive,
  mapLayer,
  onOpenSurvivalGuide,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Pan & Zoom Transform State
  // Initial center on Al-Nasir capital (480, 520)
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 1000, height: 1000 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoverCoord, setHoverCoord] = useState<{ x: number; y: number; grid: string }>({
    x: 480,
    y: 520,
    grid: '048 052',
  });

  // Ruler mode state
  const [rulerActive, setRulerActive] = useState(false);
  const [rulerPoints, setRulerPoints] = useState<{ x: number; y: number }[]>([]);

  // Add custom marker mode
  const [addPinMode, setAddPinMode] = useState(false);

  // Calculate measured distance
  // 1000 map units = 16.34 km side (approx 267 km² area) => 1 unit = 16.34 meters
  const measureStats = useMemo(() => {
    if (rulerPoints.length < 2) return null;
    let totalUnits = 0;
    for (let i = 0; i < rulerPoints.length - 1; i++) {
      const dx = rulerPoints[i + 1].x - rulerPoints[i].x;
      const dy = rulerPoints[i + 1].y - rulerPoints[i].y;
      totalUnits += Math.sqrt(dx * dx + dy * dy);
    }
    const distanceMeters = Math.round(totalUnits * 16.34);
    const distanceKm = (distanceMeters / 1000).toFixed(2);

    // Speed estimates: Running = 18 km/h (300 m/min), Walking = 5 km/h, Enduro Motorcycle = 85 km/h
    const timeRunMinutes = Math.max(1, Math.round(distanceMeters / 300));
    const timeEnduroMinutes = Math.max(1, Math.round((distanceMeters / 1416)));
    const waterLiters = ((distanceMeters / 1000) * 0.45).toFixed(1); // 0.45L per km in desert heat

    return {
      distanceMeters,
      distanceKm,
      timeRunMinutes,
      timeEnduroMinutes,
      waterLiters,
    };
  }, [rulerPoints]);

  // Zoom controls
  const handleZoom = useCallback((factor: number) => {
    setViewBox(prev => {
      const newWidth = Math.max(120, Math.min(1000, prev.width * factor));
      const newHeight = Math.max(120, Math.min(1000, prev.height * factor));
      const deltaX = (prev.width - newWidth) / 2;
      const deltaY = (prev.height - newHeight) / 2;
      return {
        x: Math.max(0, Math.min(1000 - newWidth, prev.x + deltaX)),
        y: Math.max(0, Math.min(1000 - newHeight, prev.y + deltaY)),
        width: newWidth,
        height: newHeight,
      };
    });
  }, []);

  const resetView = useCallback(() => {
    setViewBox({ x: 0, y: 0, width: 1000, height: 1000 });
    setRulerPoints([]);
    setRulerActive(false);
    setAddPinMode(false);
  }, []);

  // Center on location
  const centerOnCoord = useCallback((x: number, y: number) => {
    const w = 300;
    const h = 300;
    setViewBox({
      x: Math.max(0, Math.min(700, x - w / 2)),
      y: Math.max(0, Math.min(700, y - h / 2)),
      width: w,
      height: h,
    });
  }, []);

  // When selected location changes externally, center map
  useEffect(() => {
    if (selectedLocation) {
      centerOnCoord(selectedLocation.x, selectedLocation.y);
    }
  }, [selectedLocation, centerOnCoord]);

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 0.85 : 1.15;
    handleZoom(factor);
  };

  // Convert client point to SVG viewBox coordinates
  const clientToSvgCoord = useCallback(
    (clientX: number, clientY: number) => {
      if (!containerRef.current) return { x: 0, y: 0 };
      const rect = containerRef.current.getBoundingClientRect();
      const relX = (clientX - rect.left) / rect.width;
      const relY = (clientY - rect.top) / rect.height;
      return {
        x: Math.round(viewBox.x + relX * viewBox.width),
        y: Math.round(viewBox.y + relY * viewBox.height),
      };
    },
    [viewBox]
  );

  // Mouse down / Touch start
  const handlePointerDown = (e: React.PointerEvent) => {
    // Only drag with primary pointer
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  // Pointer move
  const handlePointerMove = (e: React.PointerEvent) => {
    const coords = clientToSvgCoord(e.clientX, e.clientY);
    const gridX = String(Math.floor(coords.x / 10)).padStart(3, '0');
    const gridY = String(Math.floor(coords.y / 10)).padStart(3, '0');
    setHoverCoord({ x: coords.x, y: coords.y, grid: `${gridX} ${gridY}` });

    if (!isDragging || !containerRef.current) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setDragStart({ x: e.clientX, y: e.clientY });

    const rect = containerRef.current.getBoundingClientRect();
    const scaleX = viewBox.width / rect.width;
    const scaleY = viewBox.height / rect.height;

    setViewBox(prev => ({
      ...prev,
      x: Math.max(0, Math.min(1000 - prev.width, prev.x - dx * scaleX)),
      y: Math.max(0, Math.min(1000 - prev.height, prev.y - dy * scaleY)),
    }));
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // Map click for ruler or add pin
  const handleMapClick = (e: React.MouseEvent) => {
    if (isDragging) return;
    const coords = clientToSvgCoord(e.clientX, e.clientY);

    if (rulerActive) {
      setRulerPoints(prev => [...prev, coords]);
      return;
    }

    if (addPinMode) {
      const gridX = String(Math.floor(coords.x / 10)).padStart(3, '0');
      const gridY = String(Math.floor(coords.y / 10)).padStart(3, '0');
      const newMarker: CustomMarker = {
        id: `custom-${Date.now()}`,
        name: `Marcador [${gridX} ${gridY}]`,
        x: coords.x,
        y: coords.y,
        category: 'custom',
        gridCoord: `${gridX} ${gridY}`,
        note: 'Ponto salvo de sobrevivência em Nasdara.',
      };
      onAddCustomMarker(newMarker);
      setAddPinMode(false);
    }
  };

  // Filtered locations
  const filteredLocations = useMemo(() => {
    return NASDARA_LOCATIONS.filter(loc => {
      // Category filter
      if (!activeCategories.has(loc.category)) return false;
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = loc.name.toLowerCase().includes(q);
        const matchesDesc = loc.shortDesc.toLowerCase().includes(q);
        const matchesGrid = loc.gridCoord.includes(q);
        const matchesRu = loc.nameRu?.toLowerCase().includes(q);
        return matchesName || matchesDesc || matchesGrid || matchesRu;
      }
      return true;
    });
  }, [activeCategories, searchQuery]);

  // Helper for marker icon
  const renderCategoryIcon = (cat: MarkerCategory) => {
    switch (cat) {
      case 'military':
        return <Shield size={14} color="#FFF" />;
      case 'water':
        return <Droplet size={14} color="#FFF" />;
      case 'vehicle':
        return <Compass size={14} color="#FFF" />;
      case 'cities':
        return <Building size={14} color="#FFF" />;
      case 'radio':
        return <Radio size={14} color="#FFF" />;
      case 'crash':
        return <Flame size={14} color="#FFF" />;
      case 'danger':
        return <AlertTriangle size={14} color="#FFF" />;
      case 'fauna':
        return <Eye size={14} color="#FFF" />;
      case 'medical':
        return <Cross size={14} color="#FFF" />;
      case 'custom':
      default:
        return <MapPin size={14} color="#FFF" />;
    }
  };

  // Helper for marker color
  const getMarkerColor = (cat: MarkerCategory) => {
    switch (cat) {
      case 'military':
        return '#DC2626';
      case 'water':
        return '#0284C7';
      case 'vehicle':
        return '#D97706';
      case 'cities':
        return '#C2410C';
      case 'radio':
        return '#7C3AED';
      case 'crash':
        return '#EA580C';
      case 'danger':
        return '#EAB308';
      case 'fauna':
        return '#10B981';
      case 'medical':
        return '#059669';
      case 'custom':
      default:
        return '#F59E0B';
    }
  };

  return (
    <MapWrapper
      ref={containerRef}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onClick={handleMapClick}
    >
      {/* Top Left HUD: Coordinates & Compass */}
      <CoordinateHud>
        <Navigation size={14} />
        <span>GRADE NASDARA: {hoverCoord.grid}</span>
        <span>•</span>
        <span>X:{hoverCoord.x} Y:{hoverCoord.y}</span>
      </CoordinateHud>

      {/* Floating Action Controls on Top Right (Thumb-zone and quick tools) */}
      <ControlsFloatingBar onClick={e => e.stopPropagation()}>
        <IconButton
          size="md"
          variant={rulerActive ? 'primary' : 'default'}
          active={rulerActive}
          onClick={() => {
            setRulerActive(!rulerActive);
            if (!rulerActive) setRulerPoints([]);
          }}
          aria-label="Ferramenta de Régua e Medição"
          title="Medir distância e tempo de viagem"
        >
          <Ruler size={20} />
        </IconButton>

        <IconButton
          size="md"
          variant={addPinMode ? 'primary' : 'default'}
          active={addPinMode}
          onClick={() => setAddPinMode(!addPinMode)}
          aria-label="Adicionar Marcador Pessoal"
          title="Adicionar ponto no mapa"
        >
          <Plus size={20} />
        </IconButton>

        <IconButton
          size="md"
          variant="default"
          onClick={() => handleZoom(0.8)}
          aria-label="Aumentar Zoom"
          title="Zoom +"
        >
          <ZoomIn size={20} />
        </IconButton>

        <IconButton
          size="md"
          variant="default"
          onClick={() => handleZoom(1.25)}
          aria-label="Diminuir Zoom"
          title="Zoom -"
        >
          <ZoomOut size={20} />
        </IconButton>

        <IconButton
          size="md"
          variant="default"
          onClick={resetView}
          aria-label="Resetar Visão do Mapa"
          title="Redefinir Visão"
        >
          <RotateCcw size={18} />
        </IconButton>

        <IconButton
          size="md"
          variant="default"
          onClick={onOpenSurvivalGuide}
          aria-label="Abrir Guia de Sobrevivência Nasdara"
          title="Guia Nasdara 1.30"
        >
          <Info size={20} />
        </IconButton>
      </ControlsFloatingBar>

      {/* Sandstorm Dynamic Particle Overlay */}
      {isSandstormActive && <SandstormEffectOverlay />}

      {/* Distance Measurement Result HUD */}
      {rulerActive && (
        <RulerMeasureHud onClick={e => e.stopPropagation()}>
          <RulerTitle>
            <span>RÉGUA DE MEDIÇÃO NASDARA (1.30)</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setRulerPoints([])}
            >
              Limpar ({rulerPoints.length} pts)
            </Button>
          </RulerTitle>
          {rulerPoints.length === 0 ? (
            <span style={{ fontSize: '12px', opacity: 0.8 }}>
              Toque ou clique em 2 ou mais locais no mapa para traçar uma rota.
            </span>
          ) : rulerPoints.length === 1 ? (
            <span style={{ fontSize: '12px', opacity: 0.8 }}>
              Primeiro ponto marcado em [{rulerPoints[0].x}, {rulerPoints[0].y}]. Clique no próximo destino.
            </span>
          ) : (
            measureStats && (
              <RulerStatsGrid>
                <RulerStatItem>
                  <StatLabel>Distância</StatLabel>
                  <StatValue>{measureStats.distanceKm} km</StatValue>
                </RulerStatItem>
                <RulerStatItem>
                  <StatLabel>Moto Enduro</StatLabel>
                  <StatValue>~{measureStats.timeEnduroMinutes} min</StatValue>
                </RulerStatItem>
                <RulerStatItem>
                  <StatLabel>Água Necessária</StatLabel>
                  <StatValue>{measureStats.waterLiters} Litros</StatValue>
                </RulerStatItem>
              </RulerStatsGrid>
            )
          )}
        </RulerMeasureHud>
      )}

      {/* SVG Canvas Map Engine */}
      <SvgCanvas
        $layer={mapLayer}
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Topographic and Dune Hatching Patterns */}
          <pattern
            id="sand-dunes-pattern"
            width="40"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M0,10 Q10,0 20,10 T40,10"
              fill="none"
              stroke="#D8C4A0"
              strokeWidth="0.8"
              opacity="0.5"
            />
          </pattern>
          <pattern
            id="rock-ridge-pattern"
            width="30"
            height="30"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M0,15 L15,0 L30,15 L15,30 Z"
              fill="none"
              stroke="#B39D7E"
              strokeWidth="0.75"
              opacity="0.35"
            />
          </pattern>
          <filter id="marker-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.45" />
          </filter>
        </defs>

        {/* 1. Base Desert Terrain Background */}
        <rect
          x="0"
          y="0"
          width="1000"
          height="1000"
          fill={mapLayer === 'satellite' ? '#172233' : '#E8DCBF'}
        />

        {/* Dune Field Zones */}
        <rect
          x="300"
          y="600"
          width="450"
          height="350"
          fill="url(#sand-dunes-pattern)"
          opacity="0.75"
        />
        <rect
          x="60"
          y="400"
          width="350"
          height="300"
          fill="url(#sand-dunes-pattern)"
          opacity="0.5"
        />

        {/* Mountain Ridge Formations (Elevation contours) */}
        <path
          d="M600,100 Q750,180 850,250 T950,420 L1000,400 L1000,0 L600,0 Z"
          fill={mapLayer === 'satellite' ? '#222F44' : '#D0BE9D'}
          opacity="0.7"
        />
        <path
          d="M660,140 Q770,220 840,280 T920,400 L1000,380 L1000,50 L660,100 Z"
          fill={mapLayer === 'satellite' ? '#2B3B55' : '#C2AE8B'}
          opacity="0.8"
        />
        <path
          d="M740,180 Q810,240 880,300 L950,260 L900,150 Z"
          fill="url(#rock-ridge-pattern)"
          opacity="0.6"
        />

        {/* Western Ridge */}
        <path
          d="M0,150 Q120,220 180,320 T150,550 L0,500 Z"
          fill={mapLayer === 'satellite' ? '#222F44' : '#D2C1A2'}
          opacity="0.65"
        />

        {/* Wadis (Dry Riverbeds / Canyons) */}
        <path
          d="M150,900 Q300,820 480,780 T680,680 T800,520"
          fill="none"
          stroke={mapLayer === 'satellite' ? '#1B3149' : '#CBB48C'}
          strokeWidth="14"
          strokeLinecap="round"
          opacity="0.65"
        />
        <path
          d="M150,900 Q300,820 480,780 T680,680 T800,520"
          fill="none"
          stroke={mapLayer === 'satellite' ? '#0E4461' : '#BFA679'}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="8 6"
          opacity="0.8"
        />

        {/* Major Highways & Road Network */}
        {/* Main Paved Highway (East-West through Al-Nasir) */}
        <path
          d="M0,520 Q240,510 480,520 T720,530 T1000,560"
          fill="none"
          stroke={mapLayer === 'satellite' ? '#685A48' : '#6A543A'}
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M0,520 Q240,510 480,520 T720,530 T1000,560"
          fill="none"
          stroke="#E5C378"
          strokeWidth="1"
          strokeDasharray="6 6"
        />

        {/* North-South Axis Road */}
        <path
          d="M520,0 Q500,260 480,520 T520,780 T560,1000"
          fill="none"
          stroke={mapLayer === 'satellite' ? '#685A48' : '#6A543A'}
          strokeWidth="5"
          strokeLinecap="round"
        />

        {/* Secondary Dirt Roads / Desert Trails */}
        <path
          d="M210,380 L370,220 L520,90 L640,190 L810,230"
          fill="none"
          stroke={mapLayer === 'satellite' ? '#534638' : '#9E8565'}
          strokeWidth="3"
          strokeDasharray="4 4"
        />
        <path
          d="M480,520 L290,670 L440,840 L580,750 L820,620 L710,310"
          fill="none"
          stroke={mapLayer === 'satellite' ? '#534638' : '#9E8565'}
          strokeWidth="3"
          strokeDasharray="4 4"
        />

        {/* Soviet Military Airbase Runway (Al-Quds) */}
        <g transform="translate(370, 220) rotate(-22)">
          <rect
            x="-120"
            y="-14"
            width="240"
            height="28"
            fill="#3B4252"
            rx="4"
          />
          <line
            x1="-110"
            y1="0"
            x2="110"
            y2="0"
            stroke="#ECEFF4"
            strokeWidth="2"
            strokeDasharray="8 6"
          />
          {/* Hangars */}
          <rect x="-80" y="-36" width="22" height="18" fill="#4C566A" />
          <rect x="-40" y="-36" width="22" height="18" fill="#4C566A" />
          <rect x="0" y="-36" width="22" height="18" fill="#4C566A" />
          <rect x="40" y="-36" width="22" height="18" fill="#4C566A" />
        </g>

        {/* Urban Footprint Zones (Buildings Clusters) */}
        {/* Al-Nasir Capital Area */}
        <circle
          cx="480"
          cy="520"
          r="48"
          fill="#D2BA96"
          stroke="#A88E68"
          strokeWidth="2"
          opacity="0.8"
        />
        <rect x="455" y="495" width="16" height="14" fill="#8C7352" />
        <rect x="480" y="490" width="20" height="18" fill="#8C7352" />
        <rect x="460" y="525" width="22" height="16" fill="#8C7352" />
        <rect x="495" y="522" width="18" height="20" fill="#8C7352" />

        {/* Bir Hasan Oasis Palm Area */}
        <circle
          cx="290"
          cy="670"
          r="34"
          fill="#94A87C"
          opacity="0.65"
        />
        <circle cx="295" cy="665" r="9" fill="#3B82F6" opacity="0.6" />

        {/* Sandstorm Zone Area on Map */}
        <circle
          cx="620"
          cy="460"
          r="75"
          fill="rgba(217, 119, 6, 0.2)"
          stroke="#D97706"
          strokeWidth="2"
          strokeDasharray="6 4"
        />

        {/* Tactical Grid Overlay (100x100 increments) */}
        {Array.from({ length: 11 }).map((_, i) => {
          const pos = i * 100;
          return (
            <React.Fragment key={`grid-${pos}`}>
              {/* Vertical line */}
              <line
                x1={pos}
                y1="0"
                x2={pos}
                y2="1000"
                stroke={mapLayer === 'satellite' ? '#2A3C59' : '#C7B594'}
                strokeWidth="1"
                opacity="0.75"
              />
              {/* Horizontal line */}
              <line
                x1="0"
                y1={pos}
                x2="1000"
                y2={pos}
                stroke={mapLayer === 'satellite' ? '#2A3C59' : '#C7B594'}
                strokeWidth="1"
                opacity="0.75"
              />
              {/* Grid coordinate labels */}
              <text
                x={pos + 4}
                y="14"
                fill={mapLayer === 'satellite' ? '#64748B' : '#786C5A'}
                fontSize="10"
                fontFamily="monospace"
                fontWeight="bold"
              >
                {String(i * 10).padStart(3, '0')}
              </text>
              <text
                x="4"
                y={pos - 4}
                fill={mapLayer === 'satellite' ? '#64748B' : '#786C5A'}
                fontSize="10"
                fontFamily="monospace"
                fontWeight="bold"
              >
                {String(i * 10).padStart(3, '0')}
              </text>
            </React.Fragment>
          );
        })}

        {/* Ruler Line & Distance Measurements */}
        {rulerPoints.length > 0 && (
          <g>
            {rulerPoints.map((pt, idx) => (
              <circle
                key={`ruler-pt-${idx}`}
                cx={pt.x}
                cy={pt.y}
                r="6"
                fill="#F59E0B"
                stroke="#FFF"
                strokeWidth="2"
              />
            ))}
            {rulerPoints.length > 1 && (
              <polyline
                points={rulerPoints.map(p => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke="#F59E0B"
                strokeWidth="3.5"
                strokeDasharray="6 4"
              />
            )}
          </g>
        )}

        {/* Interactive POI Markers */}
        {filteredLocations.map(loc => {
          const isSelected = selectedLocation?.id === loc.id;
          const color = getMarkerColor(loc.category);

          return (
            <MarkerPinGroup
              key={loc.id}
              transform={`translate(${loc.x}, ${loc.y})`}
              onClick={e => {
                e.stopPropagation();
                if (rulerActive) {
                  setRulerPoints(prev => [...prev, { x: loc.x, y: loc.y }]);
                  return;
                }
                onSelectLocation(loc);
              }}
            >
              {/* Selection pulse halo */}
              {isSelected && (
                <circle
                  cx="0"
                  cy="0"
                  r="24"
                  fill="none"
                  stroke={color}
                  strokeWidth="3"
                  opacity="0.8"
                >
                  <animate
                    attributeName="r"
                    values="16;28;16"
                    dur="1.8s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.9;0.2;0.9"
                    dur="1.8s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}

              {/* Marker pin background circle */}
              <circle
                cx="0"
                cy="0"
                r={isSelected ? 16 : 13}
                fill={color}
                stroke="#FFFFFF"
                strokeWidth={isSelected ? 3 : 2}
                filter="url(#marker-glow)"
              />

              {/* Icon inside marker */}
              <g transform="translate(-7, -7)">
                {renderCategoryIcon(loc.category)}
              </g>

              {/* Marker Label text (visible on moderate zoom or when selected) */}
              {(viewBox.width < 550 || isSelected) && (
                <g transform="translate(0, 24)">
                  <rect
                    x={-loc.name.length * 3.4 - 8}
                    y="-12"
                    width={loc.name.length * 6.8 + 16}
                    height="18"
                    rx="4"
                    fill="rgba(15, 23, 42, 0.88)"
                    stroke={isSelected ? color : '#334155'}
                    strokeWidth="1"
                  />
                  <text
                    x="0"
                    y="1"
                    textAnchor="middle"
                    fill="#F8FAFC"
                    fontSize="10"
                    fontWeight="700"
                    fontFamily="system-ui, sans-serif"
                  >
                    {loc.name}
                  </text>
                </g>
              )}
            </MarkerPinGroup>
          );
        })}

        {/* Custom User Markers */}
        {customMarkers.map(cm => (
          <MarkerPinGroup
            key={cm.id}
            transform={`translate(${cm.x}, ${cm.y})`}
            onClick={e => {
              e.stopPropagation();
              onSelectLocation({
                id: cm.id,
                name: cm.name,
                category: 'custom',
                x: cm.x,
                y: cm.y,
                gridCoord: cm.gridCoord,
                elevation: 250,
                tier: 'Especial',
                shortDesc: cm.note || 'Marcador do jogador gravado.',
                details: `Marcador personalizado salvo na memória local. Coordenadas: [${cm.gridCoord}].`,
                keyFeatures: ['Marcador pessoal do sobrevivente'],
                lootHighlights: ['Base ou Esconderijo'],
                threatLevel: 'Baixo',
              });
            }}
          >
            <circle
              cx="0"
              cy="0"
              r="14"
              fill="#F59E0B"
              stroke="#FFFFFF"
              strokeWidth="2.5"
            />
            <g transform="translate(-7, -7)">
              <MapPin size={14} color="#FFF" />
            </g>
          </MarkerPinGroup>
        ))}
      </SvgCanvas>
    </MapWrapper>
  );
};
