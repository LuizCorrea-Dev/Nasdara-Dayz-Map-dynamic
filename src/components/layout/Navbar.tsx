import React from 'react';
import styled from 'styled-components';
import {
  Sun,
  Moon,
  Wind,
  Search,
  BookOpen,
  Filter,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useAppTheme } from '../../theme/ThemeContext';
import { IconButton } from '../ui/IconButton';
import { Input } from '../ui/Input';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isSandstormActive: boolean;
  onToggleSandstorm: () => void;
  onOpenGuide: () => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

const NavHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background-color: ${props => props.theme.colors.surface};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  min-height: 56px;
  box-sizing: border-box;
  gap: ${props => props.theme.spacing.sm};
  z-index: 30;
`;

const BrandSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  flex-shrink: 0;
`;

const LogoIcon = styled.div`
  width: 38px;
  height: 38px;
  border-radius: ${props => props.theme.borderRadius.md};
  background-color: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.primaryText};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 16px;
  letter-spacing: -0.05em;
  cursor: pointer;
`;

const BrandText = styled.div`
  display: flex;
  flex-direction: column;

  @media (max-width: 640px) {
    display: none;
  }
`;

const AppTitle = styled.h1`
  margin: 0;
  font-size: 15px;
  font-weight: 800;
  line-height: 1.1;
  color: ${props => props.theme.colors.text};
  letter-spacing: -0.02em;
`;

const AppSubtitle = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: ${props => props.theme.colors.textMuted};
`;

const SearchContainer = styled.div`
  flex: 1;
  max-width: 420px;
  min-width: 140px;
`;

const ActionsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  flex-shrink: 0;
`;

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  isSandstormActive,
  onToggleSandstorm,
  onOpenGuide,
  isSidebarOpen,
  onToggleSidebar,
}) => {
  const { mode, toggleTheme } = useAppTheme();

  return (
    <NavHeader>
      <BrandSection>
        {/* Toggle button for sidebar */}
        <IconButton
          variant={isSidebarOpen ? 'primary' : 'default'}
          size="md"
          onClick={onToggleSidebar}
          aria-label={isSidebarOpen ? 'Recolher filtros' : 'Abrir filtros'}
          title={isSidebarOpen ? 'Recolher barra lateral' : 'Expandir barra lateral'}
        >
          {isSidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
        </IconButton>

        <LogoIcon onClick={onToggleSidebar} title="Nasdara Badlands">
          NZ
        </LogoIcon>
        <BrandText>
          <AppTitle>NASDARA • DAYZ BADLANDS</AppTitle>
          <AppSubtitle>Mapa Dinâmico Oficial 267 km² (PT-BR)</AppSubtitle>
        </BrandText>
      </BrandSection>

      <SearchContainer>
        <Input
          placeholder="Buscar cidade (ex: Dashtabad, Kamar Zir, poço)..."
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          onClear={() => onSearchChange('')}
          leftIcon={<Search size={16} />}
        />
      </SearchContainer>

      <ActionsContainer>
        {/* Sandstorm dynamic trigger */}
        <IconButton
          variant={isSandstormActive ? 'primary' : 'default'}
          active={isSandstormActive}
          size="md"
          onClick={onToggleSandstorm}
          aria-label="Simular Tempestade de Areia"
          title="Simular Tempestade de Areia"
        >
          <Wind size={18} />
        </IconButton>

        {/* Survival guide */}
        <IconButton
          variant="default"
          size="md"
          onClick={onOpenGuide}
          aria-label="Abrir Guia de Sobrevivência"
          title="Guia Nasdara 1.30"
        >
          <BookOpen size={18} />
        </IconButton>

        {/* Light / Dark Mode Toggle */}
        <IconButton
          variant="default"
          size="md"
          onClick={toggleTheme}
          aria-label={`Alternar para tema ${mode === 'dark' ? 'claro' : 'escuro'}`}
          title={`Tema: ${mode === 'dark' ? 'Escuro' : 'Claro'}`}
        >
          {mode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </IconButton>
      </ActionsContainer>
    </NavHeader>
  );
};
