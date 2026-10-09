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

const LOCAL_GROUPS_KEY_PREFIX = 'nasdara_user_squads_';

function getStoredLocalGroups(uid: string): GroupTenant[] {
  try {
    const raw = localStorage.getItem(`${LOCAL_GROUPS_KEY_PREFIX}${uid}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  return [];
}

function persistLocalGroups(uid: string, groups: GroupTenant[]) {
  try {
    localStorage.setItem(`${LOCAL_GROUPS_KEY_PREFIX}${uid}`, JSON.stringify(groups));
  } catch {
    // ignore
  }
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
      let serverGroups: GroupTenant[] | null = null;

      if (token) {
        try {
          const res = await fetch('/api/groups', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const contentType = res.headers.get('content-type') || '';
          if (res.ok && contentType.includes('application/json')) {
            serverGroups = await res.json();
          }
        } catch {
          // Server fetch failed, use local fallback
        }
      }

      if (serverGroups && Array.isArray(serverGroups)) {
        setGroups(serverGroups);
        persistLocalGroups(user.uid, serverGroups);

        setVisibleGroupIds(prev => {
          const next = new Set(prev);
          serverGroups!.forEach(g => {
            if (!prev.has(g.id)) {
              next.add(g.id);
            }
          });
          return next;
        });

        setActiveGroup(prev => {
          if (!prev && serverGroups!.length > 0) return serverGroups![0];
          if (prev) {
            const found = serverGroups!.find(g => g.id === prev.id);
            return found || (serverGroups!.length > 0 ? serverGroups![0] : null);
          }
          return null;
        });
      } else {
        // Fallback to local groups
        let local = getStoredLocalGroups(user.uid);
        if (local.length === 0) {
          // Initialize a default squad for the user
          const defaultSquad: GroupTenant = {
            id: 1,
            name: 'Meu Esquadrão',
            inviteCode: 'SQUAD-' + user.uid.substring(0, 6).toUpperCase(),
            ownerId: user.id,
            role: 'owner',
            createdAt: new Date().toISOString(),
            joinedAt: new Date().toISOString(),
            members: [
              {
                id: user.id,
                name: user.name,
                email: user.email,
                avatarUrl: user.avatarUrl,
                role: 'owner',
                joinedAt: new Date().toISOString(),
              },
            ],
            locations: [],
          };
          local = [defaultSquad];
          persistLocalGroups(user.uid, local);
        }

        setGroups(local);
        setVisibleGroupIds(new Set(local.map(g => g.id)));
        setActiveGroup(prev => {
          if (!prev && local.length > 0) return local[0];
          if (prev) {
            const found = local.find(g => g.id === prev.id);
            return found || local[0];
          }
          return null;
        });
      }
    } catch (err) {
      console.warn('Erro ao carregar grupos:', err);
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

    // First load from memory if already embedded
    if (activeGroup.members) setMembers(activeGroup.members);
    if (activeGroup.locations) setLocations(activeGroup.locations);

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

        if (membersRes.ok && membersRes.headers.get('content-type')?.includes('application/json')) {
          const membersData = await membersRes.json();
          setMembers(membersData);
        }
        if (locsRes.ok && locsRes.headers.get('content-type')?.includes('application/json')) {
          const locsData = await locsRes.json();
          setLocations(locsData);
        }
      } catch {
        // use local memory
      }
    };

    loadGroupDetails();
  }, [activeGroup, getIdToken]);

  const createGroup = async (name: string): Promise<GroupTenant> => {
    if (!user) throw new Error('Faça login primeiro');

    // Try server first
    try {
      const token = await getIdToken();
      if (token) {
        const res = await fetch('/api/groups', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name }),
        });

        if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
          const created: GroupTenant = await res.json();
          await fetchGroups();
          setActiveGroup(created);
          return created;
        }
      }
    } catch {
      // fallback to local
    }

    // Local creation fallback
    const newId = Date.now();
    const created: GroupTenant = {
      id: newId,
      name: name.trim(),
      inviteCode: 'SQUAD-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      ownerId: user.id,
      role: 'owner',
      createdAt: new Date().toISOString(),
      joinedAt: new Date().toISOString(),
      members: [
        {
          id: user.id,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
          role: 'owner',
          joinedAt: new Date().toISOString(),
        },
      ],
      locations: [],
    };

    const nextGroups = [created, ...groups];
    setGroups(nextGroups);
    persistLocalGroups(user.uid, nextGroups);
    setActiveGroup(created);
    setVisibleGroupIds(prev => new Set(prev).add(created.id));
    return created;
  };

  const joinGroup = async (inviteCode: string): Promise<GroupTenant> => {
    if (!user) throw new Error('Faça login primeiro para ingressar no grupo');

    const code = inviteCode.trim().toUpperCase();

    // Try server first
    try {
      const token = await getIdToken();
      if (token) {
        const res = await fetch('/api/groups/join', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ inviteCode: code }),
        });

        if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
          const joined: GroupTenant = await res.json();
          await fetchGroups();
          setActiveGroup(joined);
          setPendingInviteCode(null);
          return joined;
        }
      }
    } catch {
      // fallback
    }

    // Local fallback check
    const existing = groups.find(g => g.inviteCode === code);
    if (existing) {
      setActiveGroup(existing);
      setPendingInviteCode(null);
      return existing;
    }

    // Create joined group locally
    const joined: GroupTenant = {
      id: Date.now(),
      name: `Esquadrão [${code}]`,
      inviteCode: code,
      ownerId: 999,
      role: 'member',
      createdAt: new Date().toISOString(),
      joinedAt: new Date().toISOString(),
      members: [
        {
          id: user.id,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
          role: 'member',
          joinedAt: new Date().toISOString(),
        },
      ],
      locations: [],
    };

    const next = [...groups, joined];
    setGroups(next);
    persistLocalGroups(user.uid, next);
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
    if (!user) throw new Error('Não autenticado');

    // Try server first
    try {
      const token = await getIdToken();
      if (token) {
        const res = await fetch(`/api/groups/${activeGroup.id}/locations`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        });

        if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
          const newLoc: GroupLocation = await res.json();
          setLocations(prev => [newLoc, ...prev]);
          setVisibleGroupIds(prev => new Set(prev).add(activeGroup.id));
          await fetchGroups();
          return newLoc;
        }
      }
    } catch {
      // fallback
    }

    // Local fallback
    const newLoc: GroupLocation = {
      id: Date.now(),
      groupId: activeGroup.id,
      createdById: user.id,
      createdByName: user.name,
      name: data.name,
      category: data.category || 'base',
      militaryGrid: data.militaryGrid,
      inGameX: data.inGameX,
      inGameZ: data.inGameZ,
      lat: data.lat,
      lng: data.lng,
      codeLock: data.codeLock || null,
      lootNotes: data.lootNotes || null,
      additionalNotes: data.additionalNotes || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setLocations(prev => [newLoc, ...prev]);
    setVisibleGroupIds(prev => new Set(prev).add(activeGroup.id));

    setGroups(prev => {
      const updated = prev.map(g => {
        if (g.id === activeGroup.id) {
          const currentLocs = g.locations || [];
          return { ...g, locations: [newLoc, ...currentLocs] };
        }
        return g;
      });
      persistLocalGroups(user.uid, updated);
      return updated;
    });

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

    try {
      const token = await getIdToken();
      if (token) {
        await fetch(`/api/groups/${effectiveGroupId}/locations/${locationId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch {
      // fallback
    }

    setLocations(prev => prev.filter(l => l.id !== locationId));
    if (user) {
      setGroups(prev => {
        const updated = prev.map(g => {
          if (g.id === effectiveGroupId) {
            return {
              ...g,
              locations: (g.locations || []).filter(l => l.id !== locationId),
            };
          }
          return g;
        });
        persistLocalGroups(user.uid, updated);
        return updated;
      });
    }
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

