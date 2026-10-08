import React from 'react';
import styled from 'styled-components';
import {
  Map,
  Filter,
  Ruler,
  BookOpen,
  Wind,
  Plus,
} from 'lucide-react';

interface MobileThumbDockProps {
  onOpenFilters: () => void;
  onOpenGuide: () => void;
  onToggleSandstorm: () => void;
  isSandstormActive: boolean;
  onAddMarker: () => void;
  activeFilterCount: number;
}

const DockContainer = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-around;
  background-color: ${props => props.theme.colors.surface};
  border-top: 1px solid ${props => props.theme.colors.border};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.2);
  z-index: 25;
  box-sizing: border-box;

  @media (min-width: 1024px) {
    display: none; /* Only on mobile and tablet viewport */
  }
`;

const DockButton = styled.button<{ $active?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  background: transparent;
  border: none;
  min-width: 56px;
  min-height: 48px; /* Strict 48px Thumb Zone Touch Target */
  padding: ${props => props.theme.spacing.xs};
  border-radius: ${props => props.theme.borderRadius.md};
  cursor: pointer;
  touch-action: manipulation;
  user-select: none;
  color: ${props =>
    props.$active ? props.theme.colors.primary : props.theme.colors.textMuted};

  &:hover {
    color: ${props => props.theme.colors.text};
  }

  &:active {
    transform: scale(0.92);
  }
`;

const DockLabel = styled.span`
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em;
`;

const BadgeCount = styled.span`
  position: absolute;
  top: 4px;
  right: 12px;
  background-color: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.primaryText};
  font-size: 10px;
  font-weight: 800;
  width: 16px;
  height: 16px;
  border-radius: ${props => props.theme.borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const MobileThumbDock: React.FC<MobileThumbDockProps> = ({
  onOpenFilters,
  onOpenGuide,
  onToggleSandstorm,
  isSandstormActive,
  onAddMarker,
  activeFilterCount,
}) => {
  return (
    <DockContainer>
      <DockButton onClick={onOpenFilters} style={{ position: 'relative' }}>
        <Filter size={20} />
        <DockLabel>Filtros</DockLabel>
        {activeFilterCount > 0 && <BadgeCount>{activeFilterCount}</BadgeCount>}
      </DockButton>

      <DockButton onClick={onAddMarker}>
        <Plus size={20} />
        <DockLabel>Novo Ponto</DockLabel>
      </DockButton>

      <DockButton onClick={onToggleSandstorm} $active={isSandstormActive}>
        <Wind size={20} />
        <DockLabel>Areia</DockLabel>
      </DockButton>

      <DockButton onClick={onOpenGuide}>
        <BookOpen size={20} />
        <DockLabel>Guia 1.30</DockLabel>
      </DockButton>
    </DockContainer>
  );
};
