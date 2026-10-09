import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';

export interface GroupMember {
  id: number;
  name: string;
  email: string;
  avatarUrl?: string | null;
  role: string;
  joinedAt: string;
}

export interface GroupLocation {
  id: number;
  groupId: number;
  createdById: number | null;
  createdByName?: string | null;
  name: string;
  category: string;
  militaryGrid: string;
  inGameX: number;
  inGameZ: number;
  lat: number;
  lng: number;
  codeLock: string | null;
  lootNotes: string | null;
  additionalNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GroupTenant {
  id: number;
  name: string;
  inviteCode: string;
  ownerId: number;
  role: string;
  createdAt: string;
  joinedAt: string;
  members?: GroupMember[];
  locations?: GroupLocation[];
}

interface GroupContextType {
  groups: GroupTenant[];
  activeGroup: GroupTenant | null;
  setActiveGroup: (group: GroupTenant | null) => void;
  members: GroupMember[];
  locations: GroupLocation[];
  visibleGroupIds: Set<number>;
  toggleGroupVisibility: (groupId: number) => void;
  setGroupVisibility: (groupId: number, visible: boolean) => void;
  allVisibleGroupLocations: GroupLocation[];
  loading: boolean;
  pendingInviteCode: string | null;
  setPendingInviteCode: (code: string | null) => void;
  fetchGroups: () => Promise<void>;
  createGroup: (name: string) => Promise<GroupTenant>;
  joinGroup: (inviteCode: string) => Promise<GroupTenant>;
  addLocation: (data: {
    name: string;
    category?: string;
    militaryGrid: string;
    inGameX: number;
    inGameZ: number;
    lat: number;
    lng: number;
    codeLock?: string;
    lootNotes?: string;
    additionalNotes?: string;
  }) => Promise<GroupLocation>;
  deleteLocation: (locationId: number, targetGroupId?: number) => Promise<void>;
  getInviteLink: (group: GroupTenant) => string;
}

const GroupContext = createContext<GroupContextType | undefined>(undefined);

export const GroupProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, getIdToken } = useAuth();
  const [groups, setGroups] = useState<GroupTenant[]>([]);
  const [activeGroup, setActiveGroup] = useState<GroupTenant | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [locations, setLocations] = useState<GroupLocation[]>([]);
  const [visibleGroupIds, setVisibleGroupIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState<boolean>(false);
  const [pendingInviteCode, setPendingInviteCode] = useState<string | null>(null);

  // Check URL query params for ?invite=CODE on mount
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const invite = urlParams.get('invite');
      if (invite) {
        setPendingInviteCode(invite.trim().toUpperCase());
      }
    } catch {
      // Ignore URL parsing errors
    }
  }, []);

  const toggleGroupVisibility = useCallback((groupId: number) => {
    setVisibleGroupIds(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  }, []);

  const setGroupVisibility = useCallback((groupId: number, visible: boolean) => {
    setVisibleGroupIds(prev => {
      const next = new Set(prev);
      if (visible) {
        next.add(groupId);
      } else {
        next.delete(groupId);
      }
      return next;
    });
  }, []);

  const fetchGroups = useCallback(async () => {
    if (!user) {
      setGroups([]);
      setActiveGroup(null);
      setMembers([]);
      setLocations([]);
      setVisibleGroupIds(new Set());
      return;
    }

    try {
      setLoading(true);
      const token = await getIdToken();
      if (!token) return;

      const res = await fetch('/api/groups', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data: GroupTenant[] = await res.json();
        setGroups(data);

        // Make all groups visible by default if not set
        setVisibleGroupIds(prev => {
          const next = new Set(prev);
          data.forEach(g => {
            if (!prev.has(g.id)) {
              next.add(g.id);
            }
          });
          return next;
        });

        // Keep active group or select first
        setActiveGroup(prev => {
          if (!prev && data.length > 0) return data[0];
          if (prev) {
            const found = data.find(g => g.id === prev.id);
            return found || (data.length > 0 ? data[0] : null);
          }
          return null;
        });
      }
    } catch (err) {
      console.error('Erro ao carregar grupos do usuário:', err);
    } finally {
      setLoading(false);
    }
  }, [user, getIdToken]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  // Derive all visible locations across all enabled groups
  const allVisibleGroupLocations = useMemo(() => {
    const list: GroupLocation[] = [];
    groups.forEach(g => {
      if (visibleGroupIds.has(g.id) && Array.isArray(g.locations)) {
        list.push(...g.locations);
      }
    });
    return list;
  }, [groups, visibleGroupIds]);

  // When active group changes, update members and locations
  useEffect(() => {
    if (!activeGroup) {
      setMembers([]);
      setLocations([]);
      return;
    }

    const loadGroupDetails = async () => {
      const token = await getIdToken();
      if (!token) return;

      try {
        const [membersRes, locsRes] = await Promise.all([
          fetch(`/api/groups/${activeGroup.id}/members`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`/api/groups/${activeGroup.id}/locations`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (membersRes.ok) {
          const membersData = await membersRes.json();
          setMembers(membersData);
        }
        if (locsRes.ok) {
          const locsData = await locsRes.json();
          setLocations(locsData);
        }
      } catch (err) {
        console.error('Erro ao atualizar detalhes do grupo ativo:', err);
      }
    };

    loadGroupDetails();
  }, [activeGroup, getIdToken]);

  const createGroup = async (name: string): Promise<GroupTenant> => {
    const token = await getIdToken();
    if (!token) throw new Error('Não autenticado');

    const res = await fetch('/api/groups', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Falha ao criar grupo');
    }

    const created: GroupTenant = await res.json();
    await fetchGroups();
    setActiveGroup(created);
    return created;
  };

  const joinGroup = async (inviteCode: string): Promise<GroupTenant> => {
    const token = await getIdToken();
    if (!token) throw new Error('Faça login primeiro para ingressar no grupo com seu convite');

    const res = await fetch('/api/groups/join', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ inviteCode }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Código de convite inválido ou expirado');
    }

    const joined: GroupTenant = await res.json();
    await fetchGroups();
    setActiveGroup(joined);
    setPendingInviteCode(null);
    return joined;
  };

  const addLocation = async (data: {
    name: string;
    category?: string;
    militaryGrid: string;
    inGameX: number;
    inGameZ: number;
    lat: number;
    lng: number;
    codeLock?: string;
    lootNotes?: string;
    additionalNotes?: string;
  }): Promise<GroupLocation> => {
    if (!activeGroup) throw new Error('Nenhum grupo ativo selecionado');
    const token = await getIdToken();
    if (!token) throw new Error('Não autenticado');

    const res = await fetch(`/api/groups/${activeGroup.id}/locations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Falha ao salvar local no grupo');
    }

    const newLoc: GroupLocation = await res.json();
    setLocations(prev => [newLoc, ...prev]);
    setVisibleGroupIds(prev => new Set(prev).add(activeGroup.id));
    await fetchGroups();
    return newLoc;
  };

  const deleteLocation = async (locationId: number, targetGroupId?: number): Promise<void> => {
    let effectiveGroupId = targetGroupId || activeGroup?.id;
    if (!effectiveGroupId) {
      const foundInGroup = groups.find(g => g.locations?.some(l => l.id === locationId));
      if (foundInGroup) {
        effectiveGroupId = foundInGroup.id;
      }
    }
    if (!effectiveGroupId) return;

    const token = await getIdToken();
    if (!token) throw new Error('Não autenticado');

    const res = await fetch(`/api/groups/${effectiveGroupId}/locations/${locationId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Falha ao remover local');
    }

    setLocations(prev => prev.filter(l => l.id !== locationId));
    await fetchGroups();
  };

  const getInviteLink = (group: GroupTenant): string => {
    if (typeof window === 'undefined') return '';
    const origin = window.location.origin;
    return `${origin}?invite=${group.inviteCode}`;
  };

  return (
    <GroupContext.Provider
      value={{
        groups,
        activeGroup,
        setActiveGroup,
        members,
        locations,
        visibleGroupIds,
        toggleGroupVisibility,
        setGroupVisibility,
        allVisibleGroupLocations,
        loading,
        pendingInviteCode,
        setPendingInviteCode,
        fetchGroups,
        createGroup,
        joinGroup,
        addLocation,
        deleteLocation,
        getInviteLink,
      }}
    >
      {children}
    </GroupContext.Provider>
  );
};

export const useGroup = () => {
  const context = useContext(GroupContext);
  if (!context) {
    throw new Error('useGroup deve ser utilizado dentro de um GroupProvider');
  }
  return context;
};
