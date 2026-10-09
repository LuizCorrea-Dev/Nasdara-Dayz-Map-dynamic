import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Ruler,
  Navigation,
  Grid,
  Plus,
  Info,
  Check,
  X,
  Move,
  Type,
  Trash2,
  Shield,
  MapPin,
} from 'lucide-react';
import { RealNasdaraMarker } from '../../data/nasdaraTypes';
import { FILTER_KEY_COLORS, getMarkerSvgContent } from '../../data/dayzFilterSchema';
import rawMarkersData from '../../data/nasdaraRealMarkers.json';
import { GroupLocation } from '../../context/GroupContext';
import { IconButton } from '../ui/IconButton';
import { Button } from '../ui/Button';

const allRealMarkers = rawMarkersData as RealNasdaraMarker[];

export interface CustomUserMarker {
  id: string;
  name: string;
  lat: number;
  lng: number;
  x: number;
  z: number;
  grid: string;
  note?: string;
  category: 'custom';
}

interface NasdaraLeafletMapProps {
  selectedMarker: RealNasdaraMarker | null;
  onSelectMarker: (marker: RealNasdaraMarker | null) => void;
  activeCategories: Set<string>;
  searchQuery: string;
  customMarkers: CustomUserMarker[];
  onAddCustomMarker: (marker: CustomUserMarker) => void;
  isSandstormActive: boolean;
  onOpenSurvivalGuide: () => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  showCityNames: boolean;
  onToggleCityNames: () => void;
  onDeleteCustomMarker?: (markerId: string) => void;
  draggingMarkerId?: string | null;
  onConfirmDragMarker?: (
    markerId: string,
    newLat: number,
    newLng: number,
    newX: number,
    newZ: number,
    newGrid: string
  ) => void;
  onCancelDragMarker?: () => void;
  groupLocations?: GroupLocation[];
  activeGroupName?: string;
  onSaveLocationToGroup?: (coords: {
    lat: number;
    lng: number;
    inGameX: number;
    inGameZ: number;
    militaryGrid: string;
  }) => void;
  onDeleteGroupLocation?: (id: number) => void;
  isLoggedIn?: boolean;
  onRequireLogin?: () => void;
  isAddPinActive?: boolean;
  onSetAddPinActive?: (active: boolean) => void;
}

const AddPinHudNotification = styled.div`
  position: absolute;
  top: ${props => props.theme.spacing.lg};
  left: 50%;
  transform: translateX(-50%);
  z-index: 1010;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  background-color: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.primary};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: 8px 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
  font-size: 13px;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  white-space: nowrap;

  button {
    background: transparent;
    border: none;
    color: ${props => props.theme.colors.danger};
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    padding: 2px 6px;
    border-radius: ${props => props.theme.borderRadius.sm};
    margin-left: 8px;

    &:hover {
      text-decoration: underline;
    }
  }

  @media (max-width: 640px) {
    top: auto;
    bottom: 84px;
    max-width: 90%;
    white-space: normal;
    text-align: center;
  }
`;

const MapContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  background-color: #172233;
  overflow: hidden;

  /* Leaflet custom styling overrides */
  .leaflet-container {
    width: 100%;
    height: 100%;
    background-color: #172233;
    font-family: inherit;
    cursor: grab;
  }
  .leaflet-container:active {
    cursor: grabbing;
  }
  .leaflet-control-attribution {
    display: none !important;
  }
`;

const CoordinateHud = styled.div`
  position: absolute;
  top: ${props => props.theme.spacing.sm};
  left: ${props => props.theme.spacing.sm};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  background-color: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.md};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  z-index: 1000;
  pointer-events: none;
  font-family: monospace;
  font-size: 13px;
  font-weight: 700;
  color: ${props => props.theme.colors.text};

  @media (max-width: 640px) {
    font-size: 18px;
    padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  }
`;

const ControlsFloatingBar = styled.div`
  position: absolute;
  top: ${props => props.theme.spacing.sm};
  right: ${props => props.theme.spacing.sm};
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
  z-index: 1000;
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
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
  z-index: 1005;
  width: calc(100% - 32px);
  max-width: 440px;
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

const RepositionConfirmHud = styled.div`
  position: absolute;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
  background-color: ${props => props.theme.colors.surface};
  border: 2px solid ${props => props.theme.colors.primary};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.md};
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.45);
  z-index: 1015;
  width: calc(100% - 32px);
  max-width: 480px;
  box-sizing: border-box;

  @media (min-width: 768px) {
    bottom: ${props => props.theme.spacing.xl};
  }
`;

const RepositionTitle = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  font-weight: 800;
  font-size: 14px;
  color: ${props => props.theme.colors.primary};
`;

const RepositionInstruction = styled.div`
  font-size: 12px;
  color: ${props => props.theme.colors.textSecondary};
  line-height: 1.4;
`;

const CoordBadge = styled.div`
  background-color: ${props => props.theme.colors.surfaceVariant};
  border: 1px solid ${props => props.theme.colors.border};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.md};
  font-family: monospace;
  font-size: 12px;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
  text-align: center;
`;

const RepositionButtonsRow = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  margin-top: ${props => props.theme.spacing.xs};
  flex-wrap: wrap;

  & > * {
    flex: 1;
    min-width: 90px;
  }
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
  z-index: 999;
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

export const NasdaraLeafletMap: React.FC<NasdaraLeafletMapProps> = ({
  selectedMarker,
  onSelectMarker,
  activeCategories,
  searchQuery,
  customMarkers,
  onAddCustomMarker,
  isSandstormActive,
  onOpenSurvivalGuide,
  showGrid,
  onToggleGrid,
  showCityNames,
  onToggleCityNames,
  onDeleteCustomMarker,
  draggingMarkerId,
  onConfirmDragMarker,
  onCancelDragMarker,
  groupLocations = [],
  activeGroupName,
  onSaveLocationToGroup,
  onDeleteGroupLocation,
  isLoggedIn = false,
  onRequireLogin,
  isAddPinActive,
  onSetAddPinActive,
}) => {
  const mapElementRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const gridLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const rulerPointsLayerRef = useRef<L.LayerGroup | null>(null);

  const [hoverCoord, setHoverCoord] = useState<{ x: number; z: number; grid: string }>({
    x: 8192,
    z: 8192,
    grid: 'I-09',
  });

  const [rulerActive, setRulerActive] = useState(false);
  const [rulerPoints, setRulerPoints] = useState<L.LatLng[]>([]);
  const [internalAddPinActive, setInternalAddPinActive] = useState(false);

  const isAddPinControlled = typeof isAddPinActive === 'boolean';
  const effectiveAddPinActive = isAddPinControlled ? isAddPinActive : internalAddPinActive;
  const setAddPinActiveState = useCallback(
    (active: boolean) => {
      if (isAddPinControlled) {
        onSetAddPinActive?.(active);
      } else {
        setInternalAddPinActive(active);
      }
    },
    [isAddPinControlled, onSetAddPinActive]
  );

  // Live position during drag (ref for 60fps tracking without React re-render cancellation)
  const tempDragPosRef = useRef<L.LatLng | null>(null);
  const [tempDragPos, setTempDragPos] = useState<L.LatLng | null>(null);
  const repositionCoordBadgeRef = useRef<HTMLDivElement>(null);
  const repositionHudRef = useRef<HTMLDivElement>(null);

  const activeDragMarkerRef = useRef<L.Marker | null>(null);

  // Constants matching thedayz.ru Nasdara map
  const mapSize = 16384; // 16.384 km
  const cellSize = 1000; // 1000m grid cell

  // Convert map coordinates to in-game DayZ coordinates
  const latLngToInGame = useCallback(
    (latLng: L.LatLng) => {
      const x = Math.round((latLng.lng / 256.0) * mapSize);
      const z = Math.round((latLng.lat / 256.0 + 1.0) * mapSize);
      const safeX = Math.max(0, Math.min(mapSize, x));
      const safeZ = Math.max(0, Math.min(mapSize, z));

      const colIndex = Math.floor(safeX / cellSize);
      const rowIndex = Math.floor((mapSize - safeZ) / cellSize) + 1;

      let colLetter = '';
      let val = colIndex + 1;
      while (val > 0) {
        const rem = (val - 1) % 26;
        colLetter = String.fromCharCode(65 + rem) + colLetter;
        val = Math.floor((val - 1) / 26);
      }
      const grid = `${colLetter}-${String(rowIndex).padStart(2, '0')}`;

      return { x: safeX, z: safeZ, grid };
    },
    [mapSize, cellSize]
  );

  // When draggingMarkerId changes, initialize tempDragPos and ref
  useEffect(() => {
    if (draggingMarkerId) {
      const target = customMarkers.find(cm => cm.id === draggingMarkerId);
      if (target) {
        const initPos = L.latLng(target.lat, target.lng);
        tempDragPosRef.current = initPos;
        setTempDragPos(initPos);
      }
    } else {
      tempDragPosRef.current = null;
      setTempDragPos(null);
    }
  }, [draggingMarkerId, customMarkers]);

  // Calculate distance stats
  const measureStats = useMemo(() => {
    if (rulerPoints.length < 2) return null;
    let totalMeters = 0;
    for (let i = 0; i < rulerPoints.length - 1; i++) {
      const p1 = latLngToInGame(rulerPoints[i]);
      const p2 = latLngToInGame(rulerPoints[i + 1]);
      const dx = p2.x - p1.x;
      const dz = p2.z - p1.z;
      totalMeters += Math.sqrt(dx * dx + dz * dz);
    }
    const distanceMeters = Math.round(totalMeters);
    const distanceKm = (distanceMeters / 1000).toFixed(2);
    const timeRunMinutes = Math.max(1, Math.round(distanceMeters / 300)); // 18 km/h
    const timeEnduroMinutes = Math.max(1, Math.round(distanceMeters / 1416)); // 85 km/h
    const waterLiters = ((distanceMeters / 1000) * 0.45).toFixed(1);

    return {
      distanceMeters,
      distanceKm,
      timeRunMinutes,
      timeEnduroMinutes,
      waterLiters,
    };
  }, [rulerPoints, latLngToInGame]);

  // 1. Initialize Leaflet Map once
  useEffect(() => {
    if (!mapElementRef.current || mapInstanceRef.current) return;

    // Bounds: Top-Left (0, 0), Bottom-Right (-256, 256)
    const bounds = L.latLngBounds(L.latLng(0, 0), L.latLng(-256, 256));

    const map = L.map(mapElementRef.current, {
      attributionControl: false,
      boxZoom: false,
      crs: L.CRS.Simple,
      doubleClickZoom: true,
      maxBounds: bounds,
      maxBoundsViscosity: 1.0,
      maxZoom: 9,
      minZoom: 1,
      scrollWheelZoom: true,
      zoomControl: false,
    });

    const tileLayer = L.tileLayer(
      'https://thedayz.ru/templates/map/map/Nasdara/{z}/{x}/{y}.jpg?v=20261007-2',
      {
        bounds,
        maxNativeZoom: 7,
        maxZoom: 9,
        noWrap: true,
      }
    );
    tileLayer.addTo(map);

    map.fitBounds(bounds);
    map.setZoom(2);

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerGroupRef.current = markersGroup;

    const gridGroup = L.layerGroup().addTo(map);
    gridLayerGroupRef.current = gridGroup;

    const rulerGroup = L.layerGroup().addTo(map);
    rulerPointsLayerRef.current = rulerGroup;

    map.on('mousemove', (e: L.LeafletMouseEvent) => {
      const ingame = latLngToInGame(e.latlng);
      setHoverCoord(ingame);
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [latLngToInGame]);

  // 2. Render Tactical Coordinate Grid
  useEffect(() => {
    const gridGroup = gridLayerGroupRef.current;
    if (!gridGroup) return;
    gridGroup.clearLayers();

    if (!showGrid) return;

    const totalCells = Math.ceil(mapSize / cellSize);

    for (let i = 0; i <= totalCells; i++) {
      const xPos = Math.min(i * cellSize, mapSize);
      const lng = (xPos / mapSize) * 256;

      const vLine = L.polyline(
        [
          [0, lng],
          [-256, lng],
        ],
        {
          color: '#94A3B8',
          weight: 1,
          opacity: 0.35,
          interactive: false,
        }
      );
      gridGroup.addLayer(vLine);

      const zPos = Math.min(i * cellSize, mapSize);
      const lat = (zPos / mapSize - 1) * 256;

      const hLine = L.polyline(
        [
          [lat, 0],
          [lat, 256],
        ],
        {
          color: '#94A3B8',
          weight: 1,
          opacity: 0.35,
          interactive: false,
        }
      );
      gridGroup.addLayer(hLine);
    }
  }, [showGrid, mapSize, cellSize]);

  // 3. Map Click handler
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      // If currently dragging/repositioning a marker, ignore map clicks to prevent coordinate jumps
      if (draggingMarkerId) {
        return;
      }

      if (rulerActive) {
        setRulerPoints(prev => [...prev, e.latlng]);
        return;
      }

      if (effectiveAddPinActive) {
        if (!isLoggedIn) {
          onRequireLogin?.();
          setAddPinActiveState(false);
          return;
        }
        const ingame = latLngToInGame(e.latlng);
        const newPin: CustomUserMarker = {
          id: `pin-${Date.now()}`,
          name: `Marcador [${ingame.grid}]`,
          lat: e.latlng.lat,
          lng: e.latlng.lng,
          x: ingame.x,
          z: ingame.z,
          grid: ingame.grid,
          note: 'Ponto de interesse marcado pelo sobrevivente.',
          category: 'custom',
        };
        onAddCustomMarker(newPin);
        setAddPinActiveState(false);
      }
    };

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [
    rulerActive,
    effectiveAddPinActive,
    latLngToInGame,
    onAddCustomMarker,
    draggingMarkerId,
    isLoggedIn,
    onRequireLogin,
    setAddPinActiveState,
  ]);

  // 4. Update Ruler Polyline & Points
  useEffect(() => {
    const map = mapInstanceRef.current;
    const rulerGroup = rulerPointsLayerRef.current;
    if (!map || !rulerGroup) return;

    rulerGroup.clearLayers();

    if (rulerPoints.length > 0) {
      rulerPoints.forEach(pt => {
        const circle = L.circleMarker(pt, {
          radius: 3.5,
          color: '#FFFFFF',
          fillColor: '#F59E0B',
          fillOpacity: 1,
          weight: 1.5,
        });
        rulerGroup.addLayer(circle);
      });

      if (rulerPoints.length > 1) {
        const polyline = L.polyline(rulerPoints, {
          color: '#F59E0B',
          weight: 4,
          dashArray: '8, 8',
          opacity: 0.9,
        });
        rulerGroup.addLayer(polyline);
      }
    }
  }, [rulerPoints]);

  // 5. Filter markers
  const filteredMarkers = useMemo(() => {
    return allRealMarkers.filter(m => {
      const isCityOrVillage = m.filterKey === 'loc-city' || m.filterKey === 'loc-village';
      const isShownByName = showCityNames && isCityOrVillage;
      const isShownByFilter = activeCategories.has(m.filterKey);

      if (!isShownByName && !isShownByFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = m.name.toLowerCase().includes(q);
        const matchesTitle = m.title.toLowerCase().includes(q);
        const matchesGrid = m.grid.toLowerCase().includes(q);
        const matchesDesc = m.desc.toLowerCase().includes(q);
        return matchesName || matchesTitle || matchesGrid || matchesDesc;
      }
      return true;
    });
  }, [activeCategories, searchQuery, showCityNames]);

  // Effect to handle GPS coordinate search like "x0.64 y0.86"
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Remove any previous search pin
    if ((mapInstanceRef.current as any)._searchPin) {
      (mapInstanceRef.current as any)._searchPin.remove();
      delete (mapInstanceRef.current as any)._searchPin;
    }

    if (!searchQuery.trim()) return;

    // Match patterns like "x 0.64 y 0.86", "x=0.64, y=0.86", "x0.64 e y0.86", or z instead of y
    const coordMatch = searchQuery
      .toLowerCase()
      .match(/x\s*[:=]?\s*([0-9.]+)\s*(?:e\s+)?(?:[,;\s]+)?(?:y|z)\s*[:=]?\s*([0-9.]+)/);

    if (coordMatch) {
      let xVal = parseFloat(coordMatch[1]);
      let zVal = parseFloat(coordMatch[2]);

      // Se os valores forem <= 1, consideramos que é uma fração do tamanho total do mapa (16384)
      if (xVal <= 1.0 && xVal > 0) xVal = xVal * 16384;
      if (zVal <= 1.0 && zVal > 0) zVal = zVal * 16384;

      // Limitar aos bounds do mapa
      xVal = Math.max(0, Math.min(16384, xVal));
      zVal = Math.max(0, Math.min(16384, zVal));

      // inGameToLatLng converte x,z para lat,lng do leaflet
      const lng = (xVal / 16384) * 256.0;
      const lat = (zVal / 16384 - 1.0) * 256.0;

      const targetLatLng = L.latLng(lat, lng);
      
      // Criar um marcador temporário para o resultado da busca
      const searchIcon = L.divIcon({
        html: `
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            width: 24px;
            height: 24px;
            background-color: #ef4444;
            border: 2px solid #ffffff;
            border-radius: 50%;
            box-shadow: 0 0 15px rgba(239, 68, 68, 0.8), 0 4px 6px rgba(0, 0, 0, 0.5);
            animation: pulse 1.5s infinite;
          ">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <style>
            @keyframes pulse {
              0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
              70% { box-shadow: 0 0 0 15px rgba(239, 68, 68, 0); }
              100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
            }
          </style>
        `,
        className: '',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const searchPin = L.marker(targetLatLng, { icon: searchIcon, zIndexOffset: 9000 }).addTo(mapInstanceRef.current);
      (mapInstanceRef.current as any)._searchPin = searchPin;

      // Centraliza e dá zoom na coordenada
      mapInstanceRef.current.flyTo(targetLatLng, 5, { duration: 1.5 });
    }
  }, [searchQuery]);

  const getMarkerColor = (filterKey: string) => {
    return FILTER_KEY_COLORS[filterKey] || '#F59E0B';
  };

  // 6. Render Leaflet Markers
  useEffect(() => {
    const group = markersLayerGroupRef.current;
    if (!group) return;
    group.clearLayers();

    // Render compiled real markers
    filteredMarkers.forEach(marker => {
      if (
        !marker ||
        typeof marker.lat !== 'number' ||
        typeof marker.lng !== 'number' ||
        isNaN(marker.lat) ||
        isNaN(marker.lng)
      ) {
        return;
      }

      const isSelected = selectedMarker?.id === marker.id;
      const color = getMarkerColor(marker.filterKey);
      const isCity = marker.filterKey === 'loc-city';
      const isVillage = marker.filterKey === 'loc-village';
      const isCityOrVillage = isCity || isVillage;
      const isLocation = marker.filterKey.startsWith('loc-');

      // O ícone só é exibido quando ativado/setado nos filtros
      const showIcon = activeCategories.has(marker.filterKey);
      // Nomes de cidades e vilarejos (ou localidades) exibidos quando showCityNames estiver ativo
      const showLabel = showCityNames && (isCityOrVillage || isLocation);

      if (!showIcon && !showLabel) return;

      let iconHtml: string;

      if (!showIcon && showLabel) {
        // Exibe apenas os nomes das cidades e vilarejos, SEM ÍCONES
        iconHtml = `
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            transform: translate(-50%, -50%);
            pointer-events: auto;
            cursor: pointer;
          ">
            <div style="
              padding: ${isCity ? '2px 8px' : '1px 6px'};
              background-color: ${isCity ? 'rgba(15, 23, 42, 0.92)' : 'rgba(24, 24, 27, 0.85)'};
              border: 1px solid ${isSelected ? '#38BDF8' : isCity ? '#EA580C' : 'rgba(251, 146, 60, 0.45)'};
              border-radius: 4px;
              color: ${isCity ? '#FED7AA' : '#F1F5F9'};
              font-size: ${isCity ? '11px' : '9.5px'};
              font-weight: ${isCity ? '800' : '600'};
              font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace, sans-serif;
              text-transform: uppercase;
              letter-spacing: ${isCity ? '0.8px' : '0.4px'};
              white-space: nowrap;
              box-shadow: 0 2px 6px rgba(0,0,0,0.85);
              text-shadow: 0 1px 3px #000;
              user-select: none;
              transition: transform 0.15s ease, border-color 0.15s ease;
              ${isSelected ? 'outline: 2px solid #38BDF8; outline-offset: 1px; box-shadow: 0 0 10px rgba(56, 189, 248, 0.6);' : ''}
            ">
              ${marker.name}
            </div>
          </div>
        `;
      } else {
        // Exibe o ícone (pois está setado nos filtros) e opcionalmente o nome abaixo se showLabel for true
        const markerSize = isSelected ? 17 : isCity ? 14 : isLocation ? 16 : 18;
        const svgSize = isSelected ? 8 : isCity ? 7 : isLocation ? 12 : 12;
        const svgIconMarkup = getMarkerSvgContent(marker.filterKey, svgSize);

        iconHtml = `
          <div style="
            display: flex;
            flex-direction: column;
            align-items: center;
            transform: translate(-50%, -50%);
            pointer-events: auto;
          ">
            <div style="
              width: ${markerSize}px;
              height: ${markerSize}px;
              border-radius: 50%;
              background-color: ${color};
              border: ${isSelected ? '2px' : '1px'} solid #FFFFFF;
              box-shadow: 0 1px 4px rgba(0,0,0,0.65);
              display: flex;
              align-items: center;
              justify-content: center;
              color: #FFFFFF;
              cursor: pointer;
              transition: transform 0.15s ease;
            ">
              ${svgIconMarkup}
            </div>
            ${showLabel ? `
              <div style="
                margin-top: 2px;
                padding: 1px 5px;
                background-color: rgba(12, 11, 11, 0.9);
                border: 1px solid ${isCity ? '#EA580C' : 'rgba(255, 255, 255, 0.25)'};
                border-radius: 3px;
                color: ${isCity ? '#FDBA74' : '#F1F5F9'};
                font-size: ${isCity ? '10px' : '9px'};
                font-weight: ${isCity ? '800' : '600'};
                font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace, sans-serif;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                white-space: nowrap;
                pointer-events: none;
                box-shadow: 0 2px 5px rgba(0,0,0,0.85);
                text-shadow: 0 1px 2px #000;
                user-select: none;
              ">
                ${marker.name}
              </div>
            ` : ''}
          </div>
        `;
      }

      const divIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-dayz-marker',
        iconSize: [0, 0],
      });

      const leafletMarker = L.marker([marker.lat, marker.lng], { icon: divIcon });

      leafletMarker.on('click', (e: L.LeafletMouseEvent) => {
        L.DomEvent.stopPropagation(e);
        if (rulerActive) {
          setRulerPoints(prev => [...prev, e.latlng]);
          return;
        }
        onSelectMarker(marker);
      });

      group.addLayer(leafletMarker);
    });

    // Render custom user markers with drag support
    if (activeCategories.has('custom') && Array.isArray(customMarkers)) {
      customMarkers.forEach(cm => {
        if (!cm) return;

        const isCurrentlyDragging = draggingMarkerId === cm.id;
        const currentPos = isCurrentlyDragging && tempDragPos ? tempDragPos : L.latLng(cm.lat, cm.lng);

        let lat = Number(currentPos.lat);
        let lng = Number(currentPos.lng);

        if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
          return;
        }

        const iconHtml = `
          <div style="
            display: flex;
            flex-direction: column;
            align-items: center;
            transform: translate(-50%, -50%);
            pointer-events: auto;
          ">
            <div style="
              width: ${isCurrentlyDragging ? 19 : 15}px;
              height: ${isCurrentlyDragging ? 19 : 15}px;
              border-radius: 50%;
              background-color: ${isCurrentlyDragging ? '#EF4444' : '#F59E0B'};
              border: ${isCurrentlyDragging ? '2px solid #FFF' : '1px solid #FFFFFF'};
              box-shadow: 0 2px 8px ${isCurrentlyDragging ? 'rgba(239, 68, 68, 0.7)' : 'rgba(0,0,0,0.5)'};
              display: flex;
              align-items: center;
              justify-content: center;
              color: #000;
              font-size: ${isCurrentlyDragging ? 9 : 7}px;
              font-weight: bold;
              cursor: ${isCurrentlyDragging ? 'move' : 'pointer'};
              animation: ${isCurrentlyDragging ? 'pulseRing 1.5s infinite' : 'none'};
            ">
              ${isCurrentlyDragging ? '✋' : '📍'}
            </div>
            <div style="
              margin-top: 2px;
              padding: 1px 6px;
              background-color: rgba(12, 11, 11, 0.9);
              border: 1px solid #F59E0B;
              border-radius: 3px;
              color: #FDE68A;
              font-size: 10px;
              font-weight: 700;
              white-space: nowrap;
              pointer-events: none;
              box-shadow: 0 2px 6px rgba(0,0,0,0.8);
            ">
              ${cm.name}
            </div>
          </div>
        `;

        const divIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-user-marker',
          iconSize: [0, 0],
        });

        const marker = L.marker([lat, lng], {
          icon: divIcon,
          draggable: isCurrentlyDragging,
          autoPan: false,
        });

        if (isCurrentlyDragging) {
          activeDragMarkerRef.current = marker;

          // Disable map dragging while dragging marker so map doesn't steal pointer events
          marker.on('dragstart', () => {
            const map = mapInstanceRef.current;
            if (map) map.dragging.disable();
          });

          // Continuous 60fps mouse follow without triggering React component remount
          marker.on('drag', (e: L.LeafletEvent) => {
            const dragTarget = e.target as L.Marker;
            const newPos = dragTarget.getLatLng();
            tempDragPosRef.current = newPos;
            const ingame = latLngToInGame(newPos);
            if (repositionCoordBadgeRef.current) {
              repositionCoordBadgeRef.current.innerText = `Nova Posição: Grade [${ingame.grid}] • X: ${ingame.x} | Z: ${ingame.z}`;
            }
          });

          // When mouse button is released (soltar o mouse), update final position state and re-enable map dragging
          marker.on('dragend', (e: L.LeafletEvent) => {
            const map = mapInstanceRef.current;
            if (map) map.dragging.enable();
            const dragTarget = e.target as L.Marker;
            const finalPos = dragTarget.getLatLng();
            tempDragPosRef.current = finalPos;
            setTempDragPos(finalPos);
            const ingame = latLngToInGame(finalPos);
            if (repositionCoordBadgeRef.current) {
              repositionCoordBadgeRef.current.innerText = `Nova Posição: Grade [${ingame.grid}] • X: ${ingame.x} | Z: ${ingame.z}`;
            }
          });
        }

        marker.on('click', (e: L.LeafletMouseEvent) => {
          L.DomEvent.stopPropagation(e);
          if (isCurrentlyDragging) return;
          onSelectMarker({
            id: String(cm.id),
            name: cm.name,
            filterKey: 'custom',
            category: 'custom',
            lat: cm.lat,
            lng: cm.lng,
            x: cm.x ?? Math.round((cm.lng / 256) * 16384),
            z: cm.z ?? Math.round((cm.lat / 256 + 1) * 16384),
            grid: cm.grid || 'J-05',
            title: cm.name,
            desc: cm.note || 'Marcador pessoal salvo em Nasdara.',
            note: cm.note || '',
          });
        });

        group.addLayer(marker);
      });
    }

    // Render Group / Tenant SQL Locations
    if (Array.isArray(groupLocations)) {
      groupLocations.forEach(loc => {
        if (!loc || typeof loc.lat !== 'number' || typeof loc.lng !== 'number') return;

        const isSelected = selectedMarker?.id === `group-${loc.id}`;
        const hasCodeLock = Boolean(loc.codeLock);
        const hasLoot = Boolean(loc.lootNotes);

        const iconHtml = `
          <div style="
            display: flex;
            flex-direction: column;
            align-items: center;
            transform: translate(-50%, -50%);
            pointer-events: auto;
            cursor: pointer;
          ">
            <div style="
              width: ${isSelected ? 20 : 16}px;
              height: ${isSelected ? 20 : 16}px;
              border-radius: 50%;
              background-color: #0284C7;
              border: 2px solid ${isSelected ? '#38BDF8' : '#FFFFFF'};
              box-shadow: 0 2px 8px rgba(2, 132, 199, 0.7);
              display: flex;
              align-items: center;
              justify-content: center;
              color: #FFFFFF;
              font-size: 9px;
              font-weight: bold;
              transition: transform 0.15s ease;
            ">
              ${hasCodeLock ? '🔒' : hasLoot ? '📦' : '🛡️'}
            </div>
            <div style="
              margin-top: 2px;
              padding: 2px 6px;
              background-color: rgba(15, 23, 42, 0.94);
              border: 1px solid #38BDF8;
              border-radius: 3px;
              color: #E0F2FE;
              font-size: 10px;
              font-weight: 700;
              white-space: nowrap;
              pointer-events: none;
              box-shadow: 0 2px 6px rgba(0,0,0,0.8);
              display: flex;
              align-items: center;
              gap: 4px;
            ">
              <span>${loc.name}</span>
              ${hasCodeLock ? `<span style="color: #FBBF24; font-family: monospace;">[🔒 ${loc.codeLock}]</span>` : ''}
            </div>
          </div>
        `;

        const divIcon = L.divIcon({
          html: iconHtml,
          className: 'dayz-group-location-marker',
          iconSize: [0, 0],
        });

        const marker = L.marker([loc.lat, loc.lng], { icon: divIcon });

        marker.on('click', (e: L.LeafletMouseEvent) => {
          L.DomEvent.stopPropagation(e);
          onSelectMarker({
            id: `group-${loc.id}`,
            name: loc.name,
            filterKey: 'custom',
            category: 'custom',
            lat: loc.lat,
            lng: loc.lng,
            x: Math.round(loc.inGameX),
            z: Math.round(loc.inGameZ),
            grid: loc.militaryGrid,
            title: `${loc.name} (${activeGroupName || 'Esquadrão'})`,
            desc: `Local do Esquadrão. Grade Militar: [${loc.militaryGrid}] X:${Math.round(loc.inGameX)} Z:${Math.round(loc.inGameZ)}.${hasCodeLock ? ` Code Lock: ${loc.codeLock}.` : ''}${hasLoot ? ` Loot: ${loc.lootNotes}.` : ''}${loc.createdByName ? ` Salvo por: ${loc.createdByName}.` : ''}`,
            note: `${hasCodeLock ? `Code Lock: ${loc.codeLock}\n` : ''}${hasLoot ? `Loot: ${loc.lootNotes}\n` : ''}${loc.additionalNotes || ''}`,
          });
        });

        group.addLayer(marker);
      });
    }
  }, [
    filteredMarkers,
    customMarkers,
    groupLocations,
    selectedMarker,
    activeCategories,
    onSelectMarker,
    rulerActive,
    draggingMarkerId,
    latLngToInGame,
    showCityNames,
    activeGroupName,
  ]);

  // 7. Pan to selected marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedMarker) return;
    if (
      typeof selectedMarker.lat === 'number' &&
      typeof selectedMarker.lng === 'number' &&
      !isNaN(selectedMarker.lat) &&
      !isNaN(selectedMarker.lng)
    ) {
      map.flyTo([selectedMarker.lat, selectedMarker.lng], 6, {
        duration: 1.2,
      });
    }
  }, [selectedMarker]);

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  const handleReset = () => {
    const bounds = L.latLngBounds(L.latLng(0, 0), L.latLng(-256, 256));
    mapInstanceRef.current?.fitBounds(bounds);
    setRulerPoints([]);
    setRulerActive(false);
    setAddPinActiveState(false);
  };

  // Disable click propagation on reposition HUD so clicking buttons never registers as map clicks
  useEffect(() => {
    if (repositionHudRef.current) {
      L.DomEvent.disableClickPropagation(repositionHudRef.current);
      L.DomEvent.disableScrollPropagation(repositionHudRef.current);
    }
  }, [draggingMarkerId]);

  const draggingMarkerObj = useMemo(() => {
    if (!draggingMarkerId) return null;
    return customMarkers.find(cm => cm.id === draggingMarkerId) || null;
  }, [draggingMarkerId, customMarkers]);

  const activeRepositionInGame = useMemo(() => {
    if (!tempDragPos) return null;
    return latLngToInGame(tempDragPos);
  }, [tempDragPos, latLngToInGame]);

  return (
    <MapContainer ref={mapElementRef}>
      {/* Real-time In-Game Coordinate HUD */}
      <CoordinateHud>
        <Navigation size={14} />
        <span>GRADE NASDARA: [{hoverCoord.grid}]</span>
        <span>•</span>
        <span>
          X: {hoverCoord.x} | Z: {hoverCoord.z}
        </span>
      </CoordinateHud>

      {/* Floating Action Controls on Top Right */}
      <ControlsFloatingBar>
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
          variant={effectiveAddPinActive ? 'primary' : 'default'}
          active={effectiveAddPinActive}
          onClick={() => {
            if (!isLoggedIn) {
              onRequireLogin?.();
              return;
            }
            setAddPinActiveState(!effectiveAddPinActive);
          }}
          aria-label="Adicionar Marcador Pessoal"
          title={isLoggedIn ? 'Adicionar ponto no mapa' : 'Entre com sua conta para marcar no mapa'}
        >
          <Plus size={20} />
        </IconButton>

        <IconButton
          size="md"
          variant={showGrid ? 'primary' : 'default'}
          active={showGrid}
          onClick={onToggleGrid}
          aria-label="Alternar Grade Militar"
          title="Grade Tática A-01"
        >
          <Grid size={18} />
        </IconButton>

        <IconButton
          size="md"
          variant={showCityNames ? 'primary' : 'default'}
          active={showCityNames}
          onClick={onToggleCityNames}
          aria-label="Alternar Nomes das Cidades"
          title={showCityNames ? 'Ocultar Nomes das Cidades' : 'Exibir Nomes das Cidades'}
        >
          <Type size={18} />
        </IconButton>

        <IconButton
          size="md"
          variant="default"
          onClick={handleZoomIn}
          aria-label="Aumentar Zoom"
          title="Zoom +"
        >
          <ZoomIn size={20} />
        </IconButton>

        <IconButton
          size="md"
          variant="default"
          onClick={handleZoomOut}
          aria-label="Diminuir Zoom"
          title="Zoom -"
        >
          <ZoomOut size={20} />
        </IconButton>

        <IconButton
          size="md"
          variant="default"
          onClick={handleReset}
          aria-label="Redefinir Visão Geral"
          title="Resetar Visão"
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

      {/* Dynamic Sandstorm Overlay */}
      {isSandstormActive && <SandstormEffectOverlay />}

      {/* Floating Add Pin Guidance Banner */}
      {effectiveAddPinActive && (
        <AddPinHudNotification>
          <MapPin size={16} color="#3B82F6" />
          <span>Modo de Marcação Ativo: Toque em qualquer ponto do mapa para marcar</span>
          <button type="button" onClick={() => setAddPinActiveState(false)}>
            Cancelar
          </button>
        </AddPinHudNotification>
      )}

      {/* Distance Measurement Result HUD */}
      {rulerActive && (
        <RulerMeasureHud
          onMouseDown={e => e.stopPropagation()}
          onPointerDown={e => e.stopPropagation()}
          onTouchStart={e => e.stopPropagation()}
          onClick={e => e.stopPropagation()}
        >
          <RulerTitle>
            <span>RÉGUA DE MEDIÇÃO REAL (NASDARA 267 km²)</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setRulerPoints([])}
            >
              Limpar ({rulerPoints.length} pts)
            </Button>
          </RulerTitle>
          {rulerPoints.length === 0 ? (
            <span style={{ fontSize: '12px', opacity: 0.85 }}>
              Clique em 2 ou mais locais no mapa de Nasdara para calcular a distância e o tempo de rota.
            </span>
          ) : rulerPoints.length === 1 ? (
            <span style={{ fontSize: '12px', opacity: 0.85 }}>
              Ponto 1 selecionado. Clique no próximo destino.
            </span>
          ) : (
            measureStats && (
              <RulerStatsGrid>
                <RulerStatItem>
                  <StatLabel>Distância Total</StatLabel>
                  <StatValue>{measureStats.distanceKm} km</StatValue>
                </RulerStatItem>
                <RulerStatItem>
                  <StatLabel>Moto Enduro 1.30</StatLabel>
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

      {/* Reposition / Drag Confirmation HUD */}
      {draggingMarkerId && draggingMarkerObj && activeRepositionInGame && (
        <RepositionConfirmHud
          ref={repositionHudRef}
          onMouseDown={e => e.stopPropagation()}
          onPointerDown={e => e.stopPropagation()}
          onTouchStart={e => e.stopPropagation()}
          onClick={e => e.stopPropagation()}
        >
          <RepositionTitle>
            <Move size={18} />
            <span>Reposicionando: {draggingMarkerObj.name}</span>
          </RepositionTitle>

          <RepositionInstruction>
            Arraste o marcador com o dedo ou mouse até a nova posição no mapa.
          </RepositionInstruction>

          <CoordBadge ref={repositionCoordBadgeRef}>
            Nova Posição: Grade [{activeRepositionInGame.grid}] • X:{' '}
            {activeRepositionInGame.x} | Z: {activeRepositionInGame.z}
          </CoordBadge>

          <RepositionButtonsRow>
            <Button
              variant="outline"
              size="md"
              leftIcon={<X size={16} />}
              onMouseDown={(e: React.MouseEvent) => {
                e.stopPropagation();
              }}
              onPointerDown={(e: React.PointerEvent) => {
                e.stopPropagation();
              }}
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                const map = mapInstanceRef.current;
                if (map) map.dragging.enable();
                if (onCancelDragMarker) onCancelDragMarker();
              }}
            >
              Cancelar
            </Button>

            {onDeleteCustomMarker && draggingMarkerObj && (
              <Button
                variant="danger"
                size="md"
                leftIcon={<Trash2 size={16} />}
                onMouseDown={(e: React.MouseEvent) => {
                  e.stopPropagation();
                }}
                onPointerDown={(e: React.PointerEvent) => {
                  e.stopPropagation();
                }}
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  const map = mapInstanceRef.current;
                  if (map) map.dragging.enable();
                  onDeleteCustomMarker(draggingMarkerObj.id);
                }}
              >
                Excluir
              </Button>
            )}

            <Button
              variant="primary"
              size="md"
              leftIcon={<Check size={16} />}
              onMouseDown={(e: React.MouseEvent) => {
                e.stopPropagation();
              }}
              onPointerDown={(e: React.PointerEvent) => {
                e.stopPropagation();
              }}
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                const map = mapInstanceRef.current;
                if (map) map.dragging.enable();
                const finalPos =
                  activeDragMarkerRef.current?.getLatLng() ||
                  tempDragPosRef.current ||
                  tempDragPos;
                if (onConfirmDragMarker && finalPos && draggingMarkerObj) {
                  const ingame = latLngToInGame(finalPos);
                  onConfirmDragMarker(
                    draggingMarkerObj.id,
                    finalPos.lat,
                    finalPos.lng,
                    ingame.x,
                    ingame.z,
                    ingame.grid
                  );
                }
              }}
            >
              Confirmar Posição
            </Button>
          </RepositionButtonsRow>
        </RepositionConfirmHud>
      )}
    </MapContainer>
  );
};
