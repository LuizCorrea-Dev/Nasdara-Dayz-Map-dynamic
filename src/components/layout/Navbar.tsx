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
  Users,
  Shield,
  LogIn,
  LogOut,
} from 'lucide-react';
import { useAppTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useGroup } from '../../context/GroupContext';
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
  onOpenLogin: () => void;
  onOpenGroupManager: () => void;
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

const SquadButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  padding: 0 12px;
  background-color: ${props => props.theme.colors.surfaceVariant};
  border: 1px solid ${props => props.theme.colors.primary};
  border-radius: ${props => props.theme.borderRadius.md};
  color: ${props => props.theme.colors.text};
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${props => props.theme.colors.surfaceHover};
    transform: translateY(-1px);
  }

  .squad-name {
    color: ${props => props.theme.colors.primary};
  }

  @media (max-width: 640px) {
    padding: 0 8px;
    font-size: 11px;
    .label-full {
      display: none;
    }
  }
`;

const LoginButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 40px;
  padding: 0 12px;
  background-color: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  color: ${props => props.theme.colors.text};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.primary};
  }

  @media (max-width: 640px) {
    padding: 0 8px;
    font-size: 11px;
  }
`;

const UserBadgeButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 40px;
  padding: 0 8px;
  background-color: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  color: ${props => props.theme.colors.text};
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    background-color: ${props => props.theme.colors.surfaceHover};
  }

  .user-avatar-mini {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background-color: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.primaryText};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 700;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .user-name-label {
    max-width: 110px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    @media (max-width: 768px) {
      display: none;
    }
  }
`;


export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  isSandstormActive,
  onToggleSandstorm,
  onOpenGuide,
  isSidebarOpen,
  onToggleSidebar,
  onOpenLogin,
  onOpenGroupManager,
}) => {
  const { mode, toggleTheme } = useAppTheme();
  const { user, signOut } = useAuth();
  const { activeGroup } = useGroup();

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
        {/* Squad management & Login */}
        {user ? (
          <>
            <SquadButton onClick={onOpenGroupManager} title="Gerenciar Esquadrão e Grupos">
              <Shield size={16} color="#EA580C" />
              <span className="label-full">Esquadrão:</span>
              <span className="squad-name">{activeGroup ? activeGroup.name : 'Selecionar'}</span>
            </SquadButton>

            <UserBadgeButton onClick={onOpenLogin} title={`Conectado como ${user.name} (${user.email})`}>
              <div className="user-avatar-mini">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
              <span className="user-name-label">{user.name}</span>
            </UserBadgeButton>
          </>
        ) : (
          <LoginButton onClick={onOpenLogin} title="Entrar para sincronizar seu grupo">
            <LogIn size={15} />
            <span>Login / Esquadrão</span>
          </LoginButton>
        )}

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

        {/* Logout button if logged in */}
        {user && (
          <IconButton
            variant="default"
            size="md"
            onClick={signOut}
            aria-label="Desconectar"
            title={`Sair da conta (${user.email})`}
          >
            <LogOut size={16} />
          </IconButton>
        )}
      </ActionsContainer>
    </NavHeader>
  );
};
