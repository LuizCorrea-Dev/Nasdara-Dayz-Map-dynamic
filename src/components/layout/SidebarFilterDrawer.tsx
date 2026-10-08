import React, { useState } from 'react';
import styled from 'styled-components';
import {
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  Filter,
  Shield,
  Crosshair,
  Package,
  Flame,
  HeartPulse,
  Landmark,
  Hammer,
  Factory,
  Disc,
  Wrench,
  Car,
  CarFront,
  Compass,
  Truck,
  Bike,
  Wheat,
  Home,
  Building2,
  Briefcase,
  Droplets,
  Fuel,
  Biohazard,
  Skull,
  Dog,
  PawPrint,
  Mountain,
  UserCheck,
  UserPlus,
  Star,
  MapPin,
  ShieldAlert,
  RotateCcw,
} from 'lucide-react';
import {
  DAYZ_FILTER_GROUPS,
  FilterGroupDef,
  FilterItemDef,
} from '../../data/dayzFilterSchema';

interface SidebarFilterDrawerProps {
  isOpen: boolean;
  onToggle: () => void;
  activeFilterKeys: Set<string>;
  onToggleFilterKey: (key: string) => void;
  onToggleCategoryGroup?: (keys: string[], makeVisible: boolean) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  onResetDefaults?: () => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  showCityNames: boolean;
  onToggleCityNames: () => void;
}

const DrawerWrapper = styled.aside<{ $isOpen: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 1010;
  display: flex;
  transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
  transform: translateX(${props => (props.$isOpen ? '0' : '-100%')});

  @media (min-width: 1024px) {
    position: relative;
    transform: none;
    width: ${props => (props.$isOpen ? 'auto' : '0px')};
    overflow: hidden;
    transition: width 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }
`;

const Backdrop = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.75);
  z-index: 1009;
  opacity: ${props => (props.$isOpen ? 1 : 0)};
  pointer-events: ${props => (props.$isOpen ? 'auto' : 'none')};
  transition: opacity 0.25s ease;

  @media (min-width: 1024px) {
    display: none;
  }
`;

// Floating toggle handle when drawer is collapsed
const FloatingExpandTab = styled.button<{ $isVisible: boolean }>`
  position: absolute;
  top: ${props => props.theme.spacing.sm};
  left: ${props => props.theme.spacing.sm};
  z-index: 1008;
  display: ${props => (props.$isVisible ? 'flex' : 'none')};
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  min-height: 44px;
  padding: 0 ${props => props.theme.spacing.md};
  background-color: #0e0d0d;
  color: #f1f5f9;
  border: 1px solid #8b1e1e;
  border-radius: 2px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.6);
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
  touch-action: manipulation;
  transition: all 0.15s ease;

  &:hover {
    background-color: #1a1515;
    border-color: #dc2626;
  }

  &:active {
    transform: scale(0.96);
  }

  @media (max-width: 640px) {
    top: auto;
    bottom: 80px;
    left: ${props => props.theme.spacing.sm};
  }
`;

const DrawerContent = styled.div<{ $isOpen: boolean }>`
  max-width: 86vw;
  height: 100%;
  background-color: #0d0c0c;
  border-right: 1px solid #222020;
  display: flex;
  flex-direction: column;
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.6);
  overflow: hidden;
  box-sizing: border-box;
  user-select: none;
`;

const HeaderBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid #1f1d1d;
  background-color: #0d0c0c;
  flex-shrink: 0;
`;

const HeaderTitle = styled.div`
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #e5e5e5;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const HeaderRightIcons = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const HeaderIconButton = styled.button`
  background: transparent;
  border: none;
  color: #a3a3a3;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.15s ease;

  &:hover {
    color: #ffffff;
  }
`;

const ScrollableList = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  scrollbar-width: thin;
  scrollbar-color: #333 #111;

  &::-webkit-scrollbar {
    width: 5px;
  }
  &::-webkit-scrollbar-thumb {
    background: #2a2a2a;
    border-radius: 2px;
  }
`;

// Dropdown Map Selector (Nasdara)
const MapSelectButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 42px;
  padding: 0 14px;
  background-color: #141313;
  border: 1px solid #262424;
  border-radius: 2px;
  color: #ffffff;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  margin-bottom: 4px;

  &:hover {
    border-color: #3d3a3a;
  }
`;

// Toggle switch row: DayZ style
const ToggleRowButton = styled.button<{ $isActive: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 42px;
  padding: 0 14px;
  background-color: ${props => (props.$isActive ? '#180e0e' : '#141313')};
  border: 1px solid ${props => (props.$isActive ? '#8b1e1e' : '#262424')};
  border-radius: 2px;
  color: #ffffff;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    border-color: ${props => (props.$isActive ? '#a82222' : '#3d3a3a')};
  }
`;

// The exact DayZ toggle switch component (sliding square)
// Contains exact class gyTjpe and translateX(-15px) as requested
export const DayZSwitch = styled.div.attrs<{ $checked: boolean }>({
  className: 'gyTjpe dayz-switch',
})<{ $checked: boolean }>`
  width: 36px;
  height: 20px;
  border-radius: 2px;
  border: 1px solid ${props => (props.$checked ? '#7f1d1d' : '#333333')};
  background-color: ${props => (props.$checked ? '#8b1e1e' : '#1c1c1c')};
  position: relative;
  transition: background-color 0.15s ease, border-color 0.15s ease;
  flex-shrink: 0;

  &::after {
    content: '';
    position: absolute;
    top: 2px;
    right: 3px;
    width: 14px;
    height: 14px;
    background-color: ${props => (props.$checked ? '#ffffff' : '#6b7280')};
    border-radius: 1px;
    transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1);
    transform: ${props => (props.$checked ? 'translateX(0px)' : 'translateX(-15px)')};
  }
`;

// Accordion Group
const AccordionGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 4px;
`;

const AccordionHeader = styled.button<{ $isOpen: boolean; $hasActiveItems?: boolean; $groupColor?: string }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 42px;
  padding: 0 12px;
  background-color: ${props => (props.$isOpen ? '#180e0e' : '#141313')};
  border: 1px solid ${props => (props.$isOpen ? '#8b1e1e' : '#262424')};
  border-left: 3px solid ${props => props.$groupColor || '#8b1e1e'};
  border-radius: 2px;
  color: #ffffff;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    border-color: ${props => (props.$isOpen ? '#a82222' : '#3d3a3a')};
    border-left-color: ${props => props.$groupColor || '#dc2626'};
  }
`;

const GroupHeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const GroupHeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const CategoryEyeButton = styled.span<{ $isActive: boolean; $color?: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 2px;
  background-color: ${props => (props.$isActive ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.35)')};
  border: 1px solid ${props => (props.$isActive ? (props.$color ? `${props.$color}66` : '#8b1e1e') : '#333333')};
  color: ${props => (props.$isActive ? (props.$color || '#ffffff') : '#666666')};
  transition: all 0.15s ease;
  cursor: pointer;

  &:hover {
    background-color: ${props => (props.$color ? `${props.$color}33` : 'rgba(255, 255, 255, 0.15)')};
    color: #ffffff;
    border-color: ${props => props.$color || '#ffffff'};
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const GroupBadge = styled.span<{ $color?: string }>`
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 2px;
  font-weight: 800;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  background-color: ${props => (props.$color ? `${props.$color}22` : '#222')};
  color: ${props => props.$color || '#fff'};
  border: 1px solid ${props => (props.$color ? `${props.$color}55` : '#333')};
`;

const AccordionContent = styled.div<{ $isOpen: boolean }>`
  display: ${props => (props.$isOpen ? 'flex' : 'none')};
  flex-direction: column;
  gap: 4px;
  padding: 6px 0 6px 0;
`;

// Filter item row inside accordion
const FilterItemRow = styled.button<{ $isActive: boolean; $color?: string }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 42px;
  padding: 4px 10px;
  background-color: ${props => (props.$isActive ? '#180e0e' : '#131212')};
  border: 1px solid ${props => (props.$isActive ? '#8b1e1e' : '#222020')};
  border-left: ${props => (props.$isActive && props.$color ? `3px solid ${props.$color}` : '1px solid #222020')};
  border-radius: 2px;
  color: ${props => (props.$isActive ? '#ffffff' : '#b0b0b0')};
  font-family: inherit;
  cursor: pointer;
  transition: all 0.12s ease;
  box-sizing: border-box;

  &:hover {
    border-color: ${props => (props.$isActive ? '#b91c1c' : '#3a3a3a')};
    color: #ffffff;
    background-color: #1a1616;
  }

  &:active {
    transform: scale(0.99);
  }
`;

const ItemLeftWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1;
`;

const ItemIconBadge = styled.div<{ $color: string; $isActive: boolean }>`
  width: 26px;
  height: 26px;
  border-radius: 4px;
  background-color: ${props => (props.$isActive ? `${props.$color}22` : '#181717')};
  border: 1px solid ${props => (props.$isActive ? props.$color : '#333131')};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: ${props => (props.$isActive ? props.$color : '#9ca3af')};
  box-shadow: ${props => (props.$isActive ? `0 0 8px ${props.$color}33` : 'none')};
  transition: all 0.15s ease;

  svg {
    stroke-width: 2.2px;
  }
`;

const ItemTextInfo = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 1px;
`;

const ItemLabelText = styled.span`
  text-align: left;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12.5px;
  font-weight: 600;
`;

const ItemCategoryTag = styled.span<{ $color: string }>`
  font-size: 9.5px;
  text-align: left;
  color: ${props => props.$color};
  opacity: 0.9;
  font-weight: 700;
  letter-spacing: 0.4px;
  text-transform: uppercase;
`;

// Helper icon component
const RenderCategoryIcon: React.FC<{ iconName: string; size?: number }> = ({ iconName, size = 15 }) => {
  switch (iconName) {
    case 'Shield':
      return <Shield size={size} />;
    case 'Crosshair':
      return <Crosshair size={size} />;
    case 'Package':
      return <Package size={size} />;
    case 'Flame':
      return <Flame size={size} />;
    case 'HeartPulse':
      return <HeartPulse size={size} />;
    case 'Landmark':
      return <Landmark size={size} />;
    case 'Hammer':
      return <Hammer size={size} />;
    case 'Factory':
      return <Factory size={size} />;
    case 'Disc':
      return <Disc size={size} />;
    case 'Wrench':
      return <Wrench size={size} />;
    case 'Car':
      return <Car size={size} />;
    case 'CarFront':
      return <CarFront size={size} />;
    case 'Compass':
      return <Compass size={size} />;
    case 'Truck':
      return <Truck size={size} />;
    case 'Bike':
      return <Bike size={size} />;
    case 'Wheat':
      return <Wheat size={size} />;
    case 'Home':
      return <Home size={size} />;
    case 'Building2':
      return <Building2 size={size} />;
    case 'Briefcase':
      return <Briefcase size={size} />;
    case 'ShieldAlert':
      return <ShieldAlert size={size} />;
    case 'Droplets':
      return <Droplets size={size} />;
    case 'Fuel':
      return <Fuel size={size} />;
    case 'Biohazard':
      return <Biohazard size={size} />;
    case 'Skull':
      return <Skull size={size} />;
    case 'Dog':
      return <Dog size={size} />;
    case 'PawPrint':
      return <PawPrint size={size} />;
    case 'Mountain':
      return <Mountain size={size} />;
    case 'UserCheck':
      return <UserCheck size={size} />;
    case 'UserPlus':
      return <UserPlus size={size} />;
    case 'MapPin':
      return <MapPin size={size} />;
    case 'Star':
    default:
      return <Star size={size} />;
  }
};

export const SidebarFilterDrawer: React.FC<SidebarFilterDrawerProps> = ({
  isOpen,
  onToggle,
  activeFilterKeys,
  onToggleFilterKey,
  onToggleCategoryGroup,
  onSelectAll,
  onClearAll,
  onResetDefaults,
  showGrid,
  onToggleGrid,
  showCityNames,
  onToggleCityNames,
}) => {
  // Track open/collapsed accordions; open militar, carros, pecas, medico by default
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    militar: true,
    medico: true,
    construcao: true,
    industrial: true,
    pecas: true,
    carros: true,
    motos: true,
    caminhoes: true,
    bicicletas: true,
    rural: true,
    emergencia: true,
    recursos: true,
    contaminadas: true,
    animais: true,
    locais: true,
    spawns: true,
    custom: true,
  });

  const toggleGroup = (groupId: string) => {
    setOpenGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const handleToggleCategoryVisibility = (
    e: React.MouseEvent,
    groupItems: FilterItemDef[]
  ) => {
    e.stopPropagation(); // Don't trigger accordion toggle
    const keys = groupItems.map(item => item.key);
    const hasAnyActive = keys.some(k => activeFilterKeys.has(k));
    const targetState = !hasAnyActive; // if some/all active -> turn off; if none active -> turn on

    if (onToggleCategoryGroup) {
      onToggleCategoryGroup(keys, targetState);
    } else {
      // Fallback if prop not provided
      keys.forEach(k => {
        const currentlyActive = activeFilterKeys.has(k);
        if (targetState !== currentlyActive) {
          onToggleFilterKey(k);
        }
      });
    }
  };

  const isAllActive = activeFilterKeys.size > 0;
  const handleToggleAll = () => {
    if (isAllActive) {
      onClearAll();
    } else {
      onSelectAll();
    }
  };

  return (
    <>
      {/* Floating expand button shown when drawer is hidden */}
      <FloatingExpandTab
        $isVisible={!isOpen}
        onClick={onToggle}
        aria-label="Abrir filtros de mapa"
      >
        <Filter size={15} />
        <span>Filtros</span>
      </FloatingExpandTab>

      {/* Backdrop for mobile */}
      <Backdrop $isOpen={isOpen} onClick={onToggle} />

      {/* Main Drawer */}
      <DrawerWrapper $isOpen={isOpen}>
        <DrawerContent $isOpen={isOpen}>
          <HeaderBar>
            <HeaderTitle>
              <Filter size={16} />
              <span>Filtros Táticos</span>
            </HeaderTitle>
            <HeaderRightIcons>
              {onResetDefaults && (
                <HeaderIconButton
                  onClick={onResetDefaults}
                  title="Restaurar filtros padrão (Cidades, Vilarejos, Motos, Delegacias, Poços)"
                  aria-label="Restaurar filtros padrão"
                >
                  <RotateCcw size={16} />
                </HeaderIconButton>
              )}
              <HeaderIconButton
                onClick={handleToggleAll}
                title={isAllActive ? 'Ocultar todas as camadas' : 'Mostrar todas as camadas'}
                aria-label="Alternar todas as camadas"
              >
                {isAllActive ? <Eye size={18} /> : <EyeOff size={18} />}
              </HeaderIconButton>
              <HeaderIconButton
                onClick={onToggle}
                title="Recolher barra lateral"
                aria-label="Recolher barra lateral"
              >
                <ChevronLeft size={20} />
              </HeaderIconButton>
            </HeaderRightIcons>
          </HeaderBar>

          <ScrollableList>
            {/* 1. Map selector: Nasdara */}
            <MapSelectButton type="button">
              <span>Nasdara</span>
              <ChevronDown size={16} />
            </MapSelectButton>

            {/* 2. Coordenadas da grade toggle */}
            <ToggleRowButton
              type="button"
              $isActive={showGrid}
              onClick={onToggleGrid}
              aria-pressed={showGrid}
            >
              <span>Coordenadas da grade</span>
              <DayZSwitch $checked={showGrid} />
            </ToggleRowButton>

            {/* 2.1. Nomes das cidades toggle */}
            <ToggleRowButton
              type="button"
              $isActive={showCityNames}
              onClick={onToggleCityNames}
              aria-pressed={showCityNames}
            >
              <span>Nomes das cidades</span>
              <DayZSwitch $checked={showCityNames} />
            </ToggleRowButton>

            {/* 3. Filter Groups categorized with unique icons and colors */}
            {DAYZ_FILTER_GROUPS.map(group => {
              const isGroupOpen = Boolean(openGroups[group.id]);
              const groupActiveCount = group.items.filter(i =>
                activeFilterKeys.has(i.key)
              ).length;

              return (
                <AccordionGroup key={group.id}>
                  <AccordionHeader
                    type="button"
                    $isOpen={isGroupOpen}
                    $hasActiveItems={groupActiveCount > 0}
                    $groupColor={group.groupColor}
                    onClick={() => toggleGroup(group.id)}
                    aria-expanded={isGroupOpen}
                  >
                    <GroupHeaderLeft>
                      <span>{group.title}</span>
                      <GroupBadge $color={group.groupColor}>
                        {group.categoryBadge} ({groupActiveCount}/{group.items.length})
                      </GroupBadge>
                    </GroupHeaderLeft>

                    <GroupHeaderRight>
                      <CategoryEyeButton
                        role="button"
                        tabIndex={0}
                        $isActive={groupActiveCount > 0}
                        $color={group.groupColor}
                        onClick={e => handleToggleCategoryVisibility(e, group.items)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleToggleCategoryVisibility(e as any, group.items);
                          }
                        }}
                        title={
                          groupActiveCount > 0
                            ? `Ocultar marcadores de ${group.title}`
                            : `Exibir marcadores de ${group.title}`
                        }
                        aria-label={
                          groupActiveCount > 0
                            ? `Ocultar marcadores de ${group.title}`
                            : `Exibir marcadores de ${group.title}`
                        }
                      >
                        {groupActiveCount > 0 ? <Eye size={15} /> : <EyeOff size={15} />}
                      </CategoryEyeButton>
                      {isGroupOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </GroupHeaderRight>
                  </AccordionHeader>

                  <AccordionContent $isOpen={isGroupOpen}>
                    {group.items.map(item => {
                      const isActive = activeFilterKeys.has(item.key);
                      return (
                        <FilterItemRow
                          key={item.key}
                          type="button"
                          $isActive={isActive}
                          $color={item.color}
                          onClick={() => onToggleFilterKey(item.key)}
                          aria-pressed={isActive}
                        >
                          <ItemLeftWrapper>
                            <ItemIconBadge $color={item.color} $isActive={isActive}>
                              <RenderCategoryIcon iconName={item.iconName} size={15} />
                            </ItemIconBadge>
                            <ItemTextInfo>
                              <ItemLabelText>{item.label}</ItemLabelText>
                              <ItemCategoryTag $color={item.color}>
                                {item.categoryLabel}
                              </ItemCategoryTag>
                            </ItemTextInfo>
                          </ItemLeftWrapper>
                          <DayZSwitch $checked={isActive} />
                        </FilterItemRow>
                      );
                    })}
                  </AccordionContent>
                </AccordionGroup>
              );
            })}
          </ScrollableList>
        </DrawerContent>
      </DrawerWrapper>
    </>
  );
};
