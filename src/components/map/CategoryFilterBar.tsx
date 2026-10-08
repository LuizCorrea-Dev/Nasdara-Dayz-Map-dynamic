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

interface CategoryFilterBarProps {
  activeCategories: Set<RealMarkerCategory>;
  onToggleCategory: (category: RealMarkerCategory) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
}

const FilterContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  overflow-x: auto;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background-color: ${props => props.theme.colors.surface};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const FilterChip = styled.button<{ $isActive: boolean; $color: string }>`
  display: inline-flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  min-height: 40px; /* Touch friendly */
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.full};
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
  touch-action: manipulation;
  user-select: none;
  border: 1px solid
    ${props =>
      props.$isActive ? props.$color : props.theme.colors.border};
  background-color: ${props =>
    props.$isActive
      ? props.theme.colors.surfaceVariant
      : props.theme.colors.surface};
  color: ${props =>
    props.$isActive ? props.theme.colors.text : props.theme.colors.textSecondary};

  &:hover {
    border-color: ${props => props.theme.colors.borderFocus};
    background-color: ${props => props.theme.colors.surfaceHover};
  }

  &:active {
    transform: scale(0.96);
  }
`;

const ActionChip = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.md};
  background: transparent;
  border: 1px dashed ${props => props.theme.colors.border};
  font-size: 12px;
  font-weight: 600;
  color: ${props => props.theme.colors.textMuted};
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    color: ${props => props.theme.colors.text};
    border-color: ${props => props.theme.colors.borderFocus};
  }
`;

export const CategoryFilterBar: React.FC<CategoryFilterBarProps> = ({
  activeCategories,
  onToggleCategory,
  onSelectAll,
  onClearAll,
}) => {
  const getIcon = (cat: RealMarkerCategory) => {
    switch (cat) {
      case 'city':
        return <Building size={14} />;
      case 'military':
        return <Shield size={14} />;
      case 'water':
        return <Droplet size={14} />;
      case 'vehicle':
        return <Compass size={14} />;
      case 'medical':
        return <Cross size={14} />;
      case 'police':
        return <Shield size={14} />;
      case 'fire':
        return <Flame size={14} />;
      case 'fuel':
        return <Fuel size={14} />;
      case 'event':
        return <Flame size={14} />;
      case 'fauna':
        return <Eye size={14} />;
      case 'spawn':
        return <Users size={14} />;
      case 'custom':
      default:
        return <MapPin size={14} />;
    }
  };

  const categories = Object.keys(REAL_CATEGORY_LABELS) as RealMarkerCategory[];

  return (
    <FilterContainer>
      <ActionChip onClick={onSelectAll} title="Mostrar todas as camadas">
        Ver Todos
      </ActionChip>
      <ActionChip onClick={onClearAll} title="Ocultar todas as camadas">
        Limpar
      </ActionChip>

      {categories.map(cat => {
        const info = REAL_CATEGORY_LABELS[cat];
        const isActive = activeCategories.has(cat);
        return (
          <FilterChip
            key={cat}
            $isActive={isActive}
            $color={info.color}
            onClick={() => onToggleCategory(cat)}
          >
            {getIcon(cat)}
            <span>{info.label}</span>
            {isActive && <Check size={12} />}
          </FilterChip>
        );
      })}
    </FilterContainer>
  );
};
