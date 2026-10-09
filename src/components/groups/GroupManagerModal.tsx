import React, { useState } from 'react';
import styled from 'styled-components';
import {
  X,
  Users,
  Plus,
  Link,
  Copy,
  Check,
  MapPin,
  Lock,
  Package,
  Trash2,
  Eye,
  EyeOff,
  UserCheck,
  Shield,
  Compass,
  KeyRound,
} from 'lucide-react';
import { useGroup, GroupTenant, GroupLocation } from '../../context/GroupContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';

interface GroupManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocationOnMap?: (loc: GroupLocation) => void;
  onOpenAddLocation?: () => void;
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: ${props => props.theme.colors.overlay};
  backdrop-filter: blur(6px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing.md};

  @media (max-width: 640px) {
    padding: ${props => props.theme.spacing.xs};
  }
`;

const ModalContainer = styled.div`
  background-color: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  width: 95%;
  max-width: 960px;
  height: 85vh;
  max-height: 850px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);

  @media (max-width: 640px) {
    width: 100%;
    height: 94vh;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  background-color: ${props => props.theme.colors.surfaceVariant};
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};

  h2 {
    font-size: 18px;
    font-weight: 700;
    color: ${props => props.theme.colors.text};
    margin: 0;
  }
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: ${props => props.theme.colors.textMuted};
  cursor: pointer;
  padding: 8px;
  border-radius: ${props => props.theme.borderRadius.md};
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: ${props => props.theme.colors.text};
    background-color: ${props => props.theme.colors.surfaceHover};
  }
`;

const Body = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

// Sidebar with Tenants / Groups
const TenantSidebar = styled.div`
  width: 280px;
  background-color: ${props => props.theme.colors.background};
  border-right: 1px solid ${props => props.theme.colors.border};
  display: flex;
  flex-direction: column;
  padding: ${props => props.theme.spacing.md};
  gap: ${props => props.theme.spacing.md};

  @media (max-width: 768px) {
    width: 100%;
    max-height: 180px;
    border-right: none;
    border-bottom: 1px solid ${props => props.theme.colors.border};
  }
`;

const SidebarTitle = styled.div`
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${props => props.theme.colors.textMuted};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const GroupList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
  overflow-y: auto;
  flex: 1;
`;

const GroupItemButton = styled.button<{ $isActive: boolean }>`
  width: 100%;
  text-align: left;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  background-color: ${props =>
    props.$isActive ? props.theme.colors.surfaceVariant : 'transparent'};
  border: 1px solid
    ${props =>
      props.$isActive ? props.theme.colors.primary : 'transparent'};
  color: ${props =>
    props.$isActive ? props.theme.colors.primary : props.theme.colors.text};
  font-size: 14px;
  font-weight: ${props => (props.$isActive ? '700' : '500')};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 44px;
  transition: all 0.15s ease;

  &:hover {
    background-color: ${props => props.theme.colors.surfaceHover};
  }
`;

// Main area of the active group
const MainArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: ${props => props.theme.spacing.lg};
  gap: ${props => props.theme.spacing.lg};

  @media (max-width: 640px) {
    padding: ${props => props.theme.spacing.md};
    gap: ${props => props.theme.spacing.md};
  }
`;

const InviteBanner = styled.div`
  background-color: ${props => props.theme.colors.surfaceVariant};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.md};
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.md};
`;

const InviteDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  span.label {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    color: ${props => props.theme.colors.textMuted};
  }

  span.code {
    font-family: ui-monospace, monospace;
    font-size: 16px;
    font-weight: 800;
    color: ${props => props.theme.colors.primary};
    letter-spacing: 1px;
  }
`;

const InviteActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  align-items: center;
`;

const ActionBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  min-height: 44px;
  border-radius: ${props => props.theme.borderRadius.md};
  background-color: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  color: ${props => props.theme.colors.text};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.primary};
  }
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  gap: ${props => props.theme.spacing.md};
`;

const TabButton = styled.button<{ $active: boolean }>`
  background: transparent;
  border: none;
  border-bottom: 2px solid ${props => (props.$active ? props.theme.colors.primary : 'transparent')};
  color: ${props => (props.$active ? props.theme.colors.text : props.theme.colors.textMuted)};
  font-size: 14px;
  font-weight: 700;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.xs};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  transition: all 0.2s;

  &:hover {
    color: ${props => props.theme.colors.text};
  }
`;

// Members Table
const MembersTable = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
`;

const MemberRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background-color: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: 14px;
`;

const MemberInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};

  .id-tag {
    font-family: ui-monospace, monospace;
    font-size: 11px;
    background-color: ${props => props.theme.colors.surfaceVariant};
    padding: 2px 6px;
    border-radius: 4px;
    color: ${props => props.theme.colors.textMuted};
  }

  .name {
    font-weight: 600;
    color: ${props => props.theme.colors.text};
  }

  .email {
    font-size: 12px;
    color: ${props => props.theme.colors.textMuted};
  }
`;

const RoleBadge = styled.span<{ $role: string }>`
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 12px;
  background-color: ${props =>
    props.$role === 'owner' ? props.theme.colors.primary : props.theme.colors.surfaceHover};
  color: ${props =>
    props.$role === 'owner' ? props.theme.colors.primaryText : props.theme.colors.textSecondary};
`;

// Location Cards Grid
const LocationsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: ${props => props.theme.spacing.md};
`;

const LocationCard = styled.div`
  background-color: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.md};
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
  transition: border-color 0.2s;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
  }
`;

const LocationHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${props => props.theme.spacing.xs};

  .title {
    font-size: 15px;
    font-weight: 700;
    color: ${props => props.theme.colors.text};
  }

  .id-badge {
    font-family: ui-monospace, monospace;
    font-size: 11px;
    color: ${props => props.theme.colors.textMuted};
  }
`;

const CoordinatesBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  background-color: ${props => props.theme.colors.surface};
  padding: 6px 10px;
  border-radius: ${props => props.theme.borderRadius.sm};
  border: 1px solid ${props => props.theme.colors.border};
  font-family: ui-monospace, monospace;
  font-size: 12px;

  .grid {
    color: ${props => props.theme.colors.primary};
    font-weight: 700;
  }

  .coords {
    color: ${props => props.theme.colors.textSecondary};
  }
`;

const CodeLockBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: ${props => props.theme.colors.surfaceVariant};
  padding: 6px 10px;
  border-radius: ${props => props.theme.borderRadius.sm};
  border: 1px solid ${props => props.theme.colors.border};
  font-size: 13px;

  .label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 600;
    color: ${props => props.theme.colors.warning};
  }

  .value {
    font-family: ui-monospace, monospace;
    font-weight: 800;
    letter-spacing: 2px;
    color: ${props => props.theme.colors.text};
  }
`;

const LootNotesBox = styled.div`
  font-size: 12px;
  color: ${props => props.theme.colors.textSecondary};
  background-color: ${props => props.theme.colors.surface};
  padding: 6px 10px;
  border-radius: ${props => props.theme.borderRadius.sm};
  border: 1px solid ${props => props.theme.colors.border};
  display: flex;
  align-items: flex-start;
  gap: 6px;

  svg {
    color: ${props => props.theme.colors.success};
    flex-shrink: 0;
    margin-top: 2px;
  }
`;

const LocationActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: ${props => props.theme.spacing.xs};
`;

const InputGroup = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  align-items: center;
`;

const StyledInput = styled.input`
  flex: 1;
  min-height: 44px;
  padding: 0 12px;
  background-color: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  color: ${props => props.theme.colors.text};
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

export const GroupManagerModal: React.FC<GroupManagerModalProps> = ({
  isOpen,
  onClose,
  onSelectLocationOnMap,
  onOpenAddLocation,
}) => {
  const { user } = useAuth();
  const {
    groups,
    activeGroup,
    setActiveGroup,
    members,
    locations,
    createGroup,
    joinGroup,
    deleteLocation,
    getInviteLink,
    pendingInviteCode,
    setPendingInviteCode,
  } = useGroup();

  const [activeTab, setActiveTab] = useState<'locations' | 'members'>('locations');
  const [newGroupName, setNewGroupName] = useState('');
  const [joinCodeInput, setJoinCodeInput] = useState(pendingInviteCode || '');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showCodeLockMap, setShowCodeLockMap] = useState<Record<number, boolean>>({});
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    if (!activeGroup) return;
    const link = getInviteLink(activeGroup);
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    if (!activeGroup) return;
    navigator.clipboard.writeText(activeGroup.inviteCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    try {
      setActionError(null);
      setIsCreating(true);
      await createGroup(newGroupName.trim());
      setNewGroupName('');
    } catch (err: any) {
      setActionError(err.message || 'Erro ao criar grupo');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinGroup = async () => {
    if (!joinCodeInput.trim()) return;
    try {
      setActionError(null);
      setIsJoining(true);
      await joinGroup(joinCodeInput.trim());
      setJoinCodeInput('');
      setPendingInviteCode(null);
    } catch (err: any) {
      setActionError(err.message || 'Erro ao ingressar no grupo');
    } finally {
      setIsJoining(false);
    }
  };

  const toggleShowCodeLock = (locId: number) => {
    setShowCodeLockMap(prev => ({
      ...prev,
      [locId]: !prev[locId],
    }));
  };

  return (
    <Overlay onClick={onClose}>
      <ModalContainer onClick={e => e.stopPropagation()}>
        <Header>
          <HeaderTitle>
            <Shield size={22} color="#EA580C" />
            <h2>Gerenciar Grupos & Esquadrão</h2>
          </HeaderTitle>
          <CloseButton onClick={onClose} aria-label="Fechar">
            <X size={20} />
          </CloseButton>
        </Header>

        <Body>
          {/* Sidebar */}
          <TenantSidebar>
            <SidebarTitle>
              <span>Seus Grupos / Listas ({groups.length})</span>
            </SidebarTitle>

            <GroupList>
              {groups.map(g => (
                <GroupItemButton
                  key={g.id}
                  $isActive={activeGroup?.id === g.id}
                  onClick={() => setActiveGroup(g)}
                >
                  <span>{g.name}</span>
                  <RoleBadge $role={g.role}>{g.role === 'owner' ? 'Líder' : 'Membro'}</RoleBadge>
                </GroupItemButton>
              ))}

              {groups.length === 0 && (
                <div style={{ fontSize: '13px', color: '#94A3B8', padding: '8px 0' }}>
                  Nenhum grupo cadastrado. Crie um novo grupo ou ingresse com um código de convite abaixo.
                </div>
              )}
            </GroupList>

            {/* Create group form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <SidebarTitle>Criar Novo Grupo</SidebarTitle>
              <InputGroup>
                <StyledInput
                  placeholder="Nome do esquadrão..."
                  value={newGroupName}
                  onChange={e => setNewGroupName(e.target.value)}
                  disabled={isCreating}
                />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleCreateGroup}
                  disabled={!newGroupName.trim() || isCreating}
                >
                  <Plus size={16} />
                </Button>
              </InputGroup>
            </div>

            {/* Join group form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <SidebarTitle>Ingressar com Convite</SidebarTitle>
              <InputGroup>
                <StyledInput
                  placeholder="Código: NSD-XXXX"
                  value={joinCodeInput}
                  onChange={e => setJoinCodeInput(e.target.value)}
                  disabled={isJoining}
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleJoinGroup}
                  disabled={!joinCodeInput.trim() || isJoining}
                >
                  <UserCheck size={16} />
                </Button>
              </InputGroup>
            </div>

            {actionError && (
              <div style={{ color: '#EF4444', fontSize: '12px', padding: '4px 0' }}>
                {actionError}
              </div>
            )}
          </TenantSidebar>

          {/* Main Area */}
          <MainArea>
            {activeGroup ? (
              <>
                {/* Invite Link Banner */}
                <InviteBanner>
                  <InviteDetails>
                    <span className="label">Link de Convite do Grupo: {activeGroup.name}</span>
                    <span className="code">{activeGroup.inviteCode}</span>
                  </InviteDetails>
                  <InviteActions>
                    <ActionBtn onClick={handleCopyCode}>
                      {copiedCode ? <Check size={16} color="#10B981" /> : <KeyRound size={16} />}
                      {copiedCode ? 'Código Copiado!' : 'Copiar Código'}
                    </ActionBtn>
                    <ActionBtn onClick={handleCopyLink}>
                      {copiedLink ? <Check size={16} color="#10B981" /> : <Link size={16} />}
                      {copiedLink ? 'Link Copiado!' : 'Copiar Link de Convite'}
                    </ActionBtn>
                  </InviteActions>
                </InviteBanner>

                {/* Tabs */}
                <TabContainer>
                  <TabButton
                    $active={activeTab === 'locations'}
                    onClick={() => setActiveTab('locations')}
                  >
                    <MapPin size={18} />
                    Locais do Grupo ({locations.length})
                  </TabButton>
                  <TabButton
                    $active={activeTab === 'members'}
                    onClick={() => setActiveTab('members')}
                  >
                    <Users size={18} />
                    Membros do Esquadrão ({members.length})
                  </TabButton>

                  <div style={{ marginLeft: 'auto' }}>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={onOpenAddLocation}
                    >
                      <Plus size={16} />
                      Salvar Local neste Grupo
                    </Button>
                  </div>
                </TabContainer>

                {/* Tab: Locations */}
                {activeTab === 'locations' && (
                  <>
                    {locations.length === 0 ? (
                      <div
                        style={{
                          textAlign: 'center',
                          padding: '32px 16px',
                          color: '#94A3B8',
                          fontSize: '14px',
                        }}
                      >
                        Nenhum local cadastrado neste esquadrão ainda. Clique em "Salvar Local neste Grupo" ou clique em qualquer ponto do mapa para marcar bases, stashes e cadeados.
                      </div>
                    ) : (
                      <LocationsGrid>
                        {locations.map(loc => {
                          const isCodeVisible = showCodeLockMap[loc.id];
                          return (
                            <LocationCard key={loc.id}>
                              <LocationHeader>
                                <span className="title">{loc.name}</span>
                                <span className="id-badge">ID #{loc.id}</span>
                              </LocationHeader>

                              {/* Military Grid + In-game coords */}
                              <CoordinatesBox>
                                <div className="grid">Grade: {loc.militaryGrid}</div>
                                <div className="coords">
                                  X: {Math.round(loc.inGameX)} | Z: {Math.round(loc.inGameZ)}
                                </div>
                              </CoordinatesBox>

                              {/* Code Lock if present */}
                              {loc.codeLock && (
                                <CodeLockBox>
                                  <div className="label">
                                    <Lock size={14} />
                                    <span>Code Lock:</span>
                                  </div>
                                  <div className="value">
                                    {isCodeVisible ? loc.codeLock : '••••'}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => toggleShowCodeLock(loc.id)}
                                    style={{
                                      background: 'transparent',
                                      border: 'none',
                                      cursor: 'pointer',
                                      color: '#94A3B8',
                                      padding: '2px',
                                      display: 'flex',
                                    }}
                                    title={isCodeVisible ? 'Ocultar senha' : 'Ver senha'}
                                  >
                                    {isCodeVisible ? <EyeOff size={15} /> : <Eye size={15} />}
                                  </button>
                                </CodeLockBox>
                              )}

                              {/* Loot notes if present */}
                              {loc.lootNotes && (
                                <LootNotesBox>
                                  <Package size={14} />
                                  <span><strong>Loot:</strong> {loc.lootNotes}</span>
                                </LootNotesBox>
                              )}

                              <LocationActions>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => {
                                    if (onSelectLocationOnMap) {
                                      onSelectLocationOnMap(loc);
                                    }
                                    onClose();
                                  }}
                                >
                                  <Compass size={14} />
                                  Ver no Mapa
                                </Button>

                                <button
                                  type="button"
                                  onClick={() => deleteLocation(loc.id)}
                                  style={{
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: '#EF4444',
                                    padding: '6px',
                                    borderRadius: '4px',
                                    display: 'flex',
                                  }}
                                  title="Excluir local"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </LocationActions>
                            </LocationCard>
                          );
                        })}
                      </LocationsGrid>
                    )}
                  </>
                )}

                {/* Tab: Members */}
                {activeTab === 'members' && (
                  <MembersTable>
                    {members.map(m => (
                      <MemberRow key={m.id}>
                        <MemberInfo>
                          <span className="id-tag">ID #{m.id}</span>
                          <div>
                            <div className="name">{m.name}</div>
                            <div className="email">{m.email}</div>
                          </div>
                        </MemberInfo>
                        <RoleBadge $role={m.role}>
                          {m.role === 'owner' ? 'Líder / Criador' : 'Membro'}
                        </RoleBadge>
                      </MemberRow>
                    ))}
                  </MembersTable>
                )}
              </>
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  color: '#94A3B8',
                  gap: '16px',
                }}
              >
                <Users size={48} strokeWidth={1.5} />
                <p>Selecione um grupo ao lado ou crie um novo para começar.</p>
              </div>
            )}
          </MainArea>
        </Body>
      </ModalContainer>
    </Overlay>
  );
};
