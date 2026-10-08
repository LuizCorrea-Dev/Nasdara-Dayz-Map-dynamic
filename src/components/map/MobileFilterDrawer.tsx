import React from 'react';
import styled from 'styled-components';
import {
  Shield,
  Droplet,
  Compass,
  Building,
  Flame,
  Eye,
  Cross,
  MapPin,
  Check,
  Fuel,
  Users,
} from 'lucide-react';
import { RealMarkerCategory, REAL_CATEGORY_LABELS } from '../../data/nasdaraTypes';
import { BottomSheet } from '../ui/BottomSheet';
import { Button } from '../ui/Button';

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeCategories: Set<RealMarkerCategory>;
  onToggleCategory: (cat: RealMarkerCategory) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
}

const FilterList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.xs} 0;
`;

const FilterItemButton = styled.button<{ $isActive: boolean; $color: string }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 48px; /* Strict 48px touch target */
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  background-color: ${props =>
    props.$isActive
      ? props.theme.colors.surfaceVariant
      : props.theme.colors.surface};
  border: 1px solid
    ${props =>
      props.$isActive ? props.$color : props.theme.colors.border};
  color: ${props =>
    props.$isActive ? props.theme.colors.text : props.theme.colors.textSecondary};
  cursor: pointer;
  touch-action: manipulation;
  transition: all 0.15s ease;

  &:active {
    transform: scale(0.98);
  }
`;

const LeftItemContent = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  font-size: 14px;
  font-weight: 600;
`;

const ActionButtonsRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${props => props.theme.spacing.sm};
  margin-top: ${props => props.theme.spacing.md};
  padding-top: ${props => props.theme.spacing.md};
  border-top: 1px solid ${props => props.theme.colors.border};
`;

export const MobileFilterDrawer: React.FC<MobileFilterDrawerProps> = ({
  isOpen,
  onClose,
  activeCategories,
  onToggleCategory,
  onSelectAll,
  onClearAll,
}) => {
  const getIcon = (cat: RealMarkerCategory) => {
    switch (cat) {
      case 'city':
        return <Building size={18} />;
      case 'military':
        return <Shield size={18} />;
      case 'water':
        return <Droplet size={18} />;
      case 'vehicle':
        return <Compass size={18} />;
      case 'medical':
        return <Cross size={18} />;
      case 'police':
        return <Shield size={18} />;
      case 'fire':
        return <Flame size={18} />;
      case 'fuel':
        return <Fuel size={18} />;
      case 'event':
        return <Flame size={18} />;
      case 'fauna':
        return <Eye size={18} />;
      case 'spawn':
        return <Users size={18} />;
      case 'custom':
      default:
        return <MapPin size={18} />;
    }
  };

  const categories = Object.keys(REAL_CATEGORY_LABELS) as RealMarkerCategory[];

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Filtro de Camadas de Nasdara"
      subtitle="Selecione os pontos oficiais visíveis no mapa (DayZ Badlands)"
    >
      <FilterList>
        {categories.map(cat => {
          const info = REAL_CATEGORY_LABELS[cat];
          const isActive = activeCategories.has(cat);
          return (
            <FilterItemButton
              key={cat}
              $isActive={isActive}
              $color={info.color}
              onClick={() => onToggleCategory(cat)}
            >
              <LeftItemContent>
                {getIcon(cat)}
                <span>{info.label}</span>
              </LeftItemContent>
              {isActive && <Check size={18} color="currentColor" />}
            </FilterItemButton>
          );
        })}
      </FilterList>

      <ActionButtonsRow>
        <Button variant="outline" size="md" onClick={onSelectAll}>
          Marcar Todos
        </Button>
        <Button variant="outline" size="md" onClick={onClearAll}>
          Desmarcar Todos
        </Button>
      </ActionButtonsRow>

      <div style={{ marginTop: '12px' }}>
        <Button variant="primary" size="md" fullWidth onClick={onClose}>
          Aplicar Filtros
        </Button>
      </div>
    </BottomSheet>
  );
};
