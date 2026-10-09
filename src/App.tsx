import React, { useState, useEffect } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { ThemeContextProvider } from './theme/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GroupProvider, useGroup, GroupLocation } from './context/GroupContext';
import { LoginModal } from './components/auth/LoginModal';
import { GroupManagerModal } from './components/groups/GroupManagerModal';
import { SaveLocationModal } from './components/groups/SaveLocationModal';
import {
  RealMarkerCategory,
  RealNasdaraMarker,
  REAL_CATEGORY_LABELS,
} from './data/nasdaraTypes';
import {
  DAYZ_FILTER_GROUPS,
  getInitialActiveFilterKeys,
} from './data/dayzFilterSchema';
import { Navbar } from './components/layout/Navbar';
import { MobileThumbDock } from './components/layout/MobileThumbDock';
import {
  NasdaraLeafletMap,
  CustomUserMarker,
} from './components/map/NasdaraLeafletMap';
import { SidebarFilterDrawer } from './components/layout/SidebarFilterDrawer';
import { LocationDetailSheet } from './components/map/LocationDetailSheet';
import { NasdaraSurvivalGuide } from './components/guide/NasdaraSurvivalGuide';
import { AddMarkerDialog } from './components/map/AddMarkerDialog';
import { EditMarkerDialog } from './components/map/EditMarkerDialog';
import { Footer } from './components/layout/Footer';

// Global styling with dynamic theme tokens
const GlobalStyle = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    -webkit-tap-highlight-color: transparent;
  }

  html, body, #root {
    width: 100%;
    height: 100%;
    overflow: hidden;
    background-color: ${props => props.theme.colors.background};
    color: ${props => props.theme.colors.text};
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  }
`;

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100dvh;
  height: 100vh;
  background-color: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  overflow: hidden;
  position: relative;
`;

const MainContentArea = styled.main`
  display: flex;
  flex-direction: row;
  flex: 1;
  min-height: 0;
  position: relative;
  overflow: hidden;
`;

const MapContainer = styled.div`
  flex: 1;
  min-height: 0;
  width: 100%;
  position: relative;
  overflow: hidden;
`;

function MainApp() {
  const { user } = useAuth();
  const {
    activeGroup,
    locations,
    pendingInviteCode,
    allVisibleGroupLocations,
    deleteLocation,
  } = useGroup();

  // Multi-tenant group & auth modals
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isGroupManagerModalOpen, setIsGroupManagerModalOpen] = useState(false);
  const [isSaveLocationModalOpen, setIsSaveLocationModalOpen] = useState(false);
  const [isAddPinActive, setIsAddPinActive] = useState(false);
  const [transferringPersonalMarkerId, setTransferringPersonalMarkerId] = useState<string | null>(null);
  const [saveLocationCoords, setSaveLocationCoords] = useState<{
    lat: number;
    lng: number;
    inGameX: number;
    inGameZ: number;
    militaryGrid: string;
    initialName?: string;
    initialNote?: string;
  } | undefined>(undefined);

  // Auto-prompt invite flow if pending invite code in URL
  useEffect(() => {
    if (pendingInviteCode) {
      if (user) {
        setIsGroupManagerModalOpen(true);
      } else {
        setIsLoginModalOpen(true);
      }
    }
  }, [pendingInviteCode, user]);

  // Lateral Filter Drawer open/collapsed state
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return true;
  });

  // Map filter keys for DayZ categories
  const [activeFilterKeys, setActiveFilterKeys] = useState<Set<string>>(getInitialActiveFilterKeys);

  // Tactical Coordinate Grid display toggle
  const [showGrid, setShowGrid] = useState(true);

  // City and settlement names display toggle
  const [showCityNames, setShowCityNames] = useState(true);

  // Search input
  const [searchQuery, setSearchQuery] = useState('');

  // Selected marker for details sheet
  const [selectedMarker, setSelectedMarker] = useState<RealNasdaraMarker | null>(null);

  // Dragging reposition state for custom marker
  const [draggingMarkerId, setDraggingMarkerId] = useState<string | null>(null);

  // Edit dialog state for custom marker
  const [editingMarker, setEditingMarker] = useState<CustomUserMarker | null>(null);

  // Sandstorm weather simulation toggle
  const [isSandstormActive, setIsSandstormActive] = useState(false);

  // Survival guide modal
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Add marker dialog
  const [isAddMarkerOpen, setIsAddMarkerOpen] = useState(false);

  // User custom markers saved in localStorage with automatic schema migration
  const [customMarkers, setCustomMarkers] = useState<CustomUserMarker[]>(() => {
    try {
      const saved = localStorage.getItem('nasdara_custom_markers');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((m: any, idx: number) => {
            const rawLat = Number(m.lat);
            const rawLng = Number(m.lng);
            const lat = Number.isFinite(rawLat)
              ? rawLat
              : Number.isFinite(m.z)
              ? (m.z / 16384 - 1) * 256
              : Number.isFinite(m.y)
              ? (m.y / 1000 - 1) * 256
              : -128;
            const lng = Number.isFinite(rawLng)
              ? rawLng
              : Number.isFinite(m.x)
              ? (m.x / 16384) * 256
              : Number.isFinite(m.x)
              ? (m.x / 1000) * 256
              : 128;
            return {
              id: m.id || `migrated-pin-${idx}`,
              name: m.name || 'Marcador Pessoal',
              lat,
              lng,
              x: Number.isFinite(m.x) ? m.x : Math.round((lng / 256) * 16384),
              z: Number.isFinite(m.z) ? m.z : Math.round((lat / 256 + 1) * 16384),
              grid: m.grid || m.gridCoord || 'J-05',
              note: m.note || '',
              category: 'custom' as const,
            };
          });
        }
      }
    } catch {
      // fallback
    }
    return [
      {
        id: 'user-base-kamar',
        name: '[Minha Base] Esconderijo em Kamar Zir',
        lat: -69.67,
        lng: 147.37,
        x: 9430,
        z: 11925,
        grid: 'J-05',
        note: 'Tenda militar com mantimentos e peças da moto 1.30.',
        category: 'custom',
      },
    ];
  });

  // Save custom markers to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('nasdara_custom_markers', JSON.stringify(customMarkers));
    } catch {
      // ignore
    }
  }, [customMarkers]);

  const handleToggleFilterKey = (key: string) => {
    setActiveFilterKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleToggleCategoryGroup = (keys: string[], makeVisible: boolean) => {
    setActiveFilterKeys(prev => {
      const next = new Set(prev);
      if (makeVisible) {
        keys.forEach(k => next.add(k));
      } else {
        keys.forEach(k => next.delete(k));
      }
      return next;
    });
  };

  const handleSelectAllFilters = () => {
    const all = new Set<string>();
    DAYZ_FILTER_GROUPS.forEach(g => {
      g.items.forEach(i => all.add(i.key));
    });
    setActiveFilterKeys(all);
  };

  const handleClearAllFilters = () => {
    setActiveFilterKeys(new Set());
  };

  const handleResetDefaultFilters = () => {
    setActiveFilterKeys(getInitialActiveFilterKeys());
    setShowCityNames(true);
  };

  const handleAddCustomMarker = (newMarker: CustomUserMarker) => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }
    setCustomMarkers(prev => [newMarker, ...prev]);
    setActiveFilterKeys(prev => new Set(prev).add('custom'));
  };

  // Custom marker action: Start drag / reposition
  const handleStartDrag = (markerId: string) => {
    setDraggingMarkerId(markerId);
    setSelectedMarker(null);
  };

  // Custom marker action: Confirm new position
  const handleConfirmDrag = (
    markerId: string,
    newLat: number,
    newLng: number,
    newX: number,
    newZ: number,
    newGrid: string
  ) => {
    setCustomMarkers(prev =>
      prev.map(m =>
        m.id === markerId
          ? {
              ...m,
              lat: newLat,
              lng: newLng,
              x: newX,
              z: newZ,
              grid: newGrid,
            }
          : m
      )
    );
    setDraggingMarkerId(null);
  };

  const handleCancelDrag = () => {
    setDraggingMarkerId(null);
  };

  // Custom marker action: Open edit modal
  const handleOpenEdit = (marker: RealNasdaraMarker) => {
    const target = customMarkers.find(m => m.id === marker.id);
    if (target) {
      setEditingMarker(target);
    }
  };

  // Custom marker action: Save edit
  const handleSaveEdit = (updatedMarker: CustomUserMarker) => {
    setCustomMarkers(prev =>
      prev.map(m => (m.id === updatedMarker.id ? updatedMarker : m))
    );
    setEditingMarker(null);
    if (selectedMarker?.id === updatedMarker.id) {
      setSelectedMarker({
        ...selectedMarker,
        name: updatedMarker.name,
        title: updatedMarker.name,
        desc: updatedMarker.note || selectedMarker.desc,
        note: updatedMarker.note,
      });
    }
  };

  // Custom marker action: Delete
  const handleDeleteCustomMarker = (markerId: string) => {
    setCustomMarkers(prev => {
      const nextMarkers = prev.filter(m => String(m.id) !== String(markerId));
      try {
        localStorage.setItem('nasdara_custom_markers', JSON.stringify(nextMarkers));
      } catch {
        // ignore
      }
      return nextMarkers;
    });
    if (selectedMarker && String(selectedMarker.id) === String(markerId)) {
      setSelectedMarker(null);
    }
    if (draggingMarkerId && String(draggingMarkerId) === String(markerId)) {
      setDraggingMarkerId(null);
    }
    if (editingMarker && String(editingMarker.id) === String(markerId)) {
      setEditingMarker(null);
    }
  };

  // Group location action: Delete from group database
  const handleDeleteGroupLocation = async (locId: number, groupId?: number) => {
    try {
      await deleteLocation(locId, groupId);
      if (selectedMarker?.id === `group-${locId}`) {
        setSelectedMarker(null);
      }
    } catch (err) {
      console.error('Erro ao excluir marcador do grupo:', err);
    }
  };

  // Unified delete handler (for both custom and group markers)
  const handleDeleteMarker = async (markerId: string) => {
    if (markerId.startsWith('group-')) {
      const numId = Number(markerId.replace('group-', ''));
      await handleDeleteGroupLocation(numId);
    } else {
      handleDeleteCustomMarker(markerId);
    }
  };

  return (
    <AppContainer>
      <GlobalStyle />

      {/* Top Navigation Bar */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isSandstormActive={isSandstormActive}
        onToggleSandstorm={() => setIsSandstormActive(prev => !prev)}
        onOpenGuide={() => setIsGuideOpen(true)}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onOpenGroupManager={() => setIsGroupManagerModalOpen(true)}
      />

      {/* Main Layout Area: Lateral Collapsible Filter Drawer + Map */}
      <MainContentArea>
        <SidebarFilterDrawer
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(prev => !prev)}
          activeFilterKeys={activeFilterKeys}
          onToggleFilterKey={handleToggleFilterKey}
          onToggleCategoryGroup={handleToggleCategoryGroup}
          onSelectAll={handleSelectAllFilters}
          onClearAll={handleClearAllFilters}
          onResetDefaults={handleResetDefaultFilters}
          showGrid={showGrid}
          onToggleGrid={() => setShowGrid(prev => !prev)}
          showCityNames={showCityNames}
          onToggleCityNames={() => setShowCityNames(prev => !prev)}
          onOpenLogin={() => setIsLoginModalOpen(true)}
          onOpenGroupManager={() => setIsGroupManagerModalOpen(true)}
          customMarkers={customMarkers}
          onSelectCustomMarker={marker => {
            setSelectedMarker({
              id: marker.id,
              name: marker.name,
              filterKey: 'custom',
              category: 'custom',
              lat: marker.lat,
              lng: marker.lng,
              x: marker.x,
              z: marker.z,
              grid: marker.grid,
              title: marker.name,
              desc: marker.note || 'Marcador pessoal criado no mapa.',
              note: marker.note,
            });
            if (window.innerWidth < 1024) {
              setIsSidebarOpen(false);
            }
          }}
          onOpenAddMarker={() => {
            if (!user) {
              setIsLoginModalOpen(true);
              return;
            }
            setIsAddPinActive(true);
            setIsSidebarOpen(false);
          }}
          onSelectGroupLocation={loc => {
            setSelectedMarker({
              id: `group-${loc.id}`,
              name: loc.name,
              filterKey: 'custom',
              category: 'custom',
              lat: loc.lat,
              lng: loc.lng,
              x: Math.round(loc.inGameX),
              z: Math.round(loc.inGameZ),
              grid: loc.militaryGrid,
              title: `[Grupo] ${loc.name}`,
              desc: `Grade: ${loc.militaryGrid} | X: ${Math.round(loc.inGameX)} Z: ${Math.round(loc.inGameZ)}`,
              note: `${loc.codeLock ? `Code Lock: ${loc.codeLock}\n` : ''}${loc.lootNotes ? `Loot: ${loc.lootNotes}\n` : ''}${loc.additionalNotes || ''}`,
            });
            if (window.innerWidth < 1024) {
              setIsSidebarOpen(false);
            }
          }}
          onDeleteCustomMarker={handleDeleteCustomMarker}
          onDeleteGroupLocation={handleDeleteGroupLocation}
        />

        <MapContainer>
          <NasdaraLeafletMap
            selectedMarker={selectedMarker}
            onSelectMarker={setSelectedMarker}
            activeCategories={activeFilterKeys}
            searchQuery={searchQuery}
            customMarkers={customMarkers}
            onAddCustomMarker={handleAddCustomMarker}
            isSandstormActive={isSandstormActive}
            onOpenSurvivalGuide={() => setIsGuideOpen(true)}
            showGrid={showGrid}
            onToggleGrid={() => setShowGrid(prev => !prev)}
            showCityNames={showCityNames}
            onToggleCityNames={() => setShowCityNames(prev => !prev)}
            onDeleteCustomMarker={handleDeleteMarker}
            onDeleteGroupLocation={handleDeleteGroupLocation}
            isLoggedIn={Boolean(user)}
            onRequireLogin={() => setIsLoginModalOpen(true)}
            isAddPinActive={isAddPinActive}
            onSetAddPinActive={setIsAddPinActive}
            draggingMarkerId={draggingMarkerId}
            onConfirmDragMarker={handleConfirmDrag}
            onCancelDragMarker={handleCancelDrag}
            groupLocations={allVisibleGroupLocations}
            activeGroupName={activeGroup?.name}
            onSaveLocationToGroup={coords => {
              if (!user) {
                setIsLoginModalOpen(true);
              } else {
                setTransferringPersonalMarkerId(null);
                setSaveLocationCoords(coords);
                setIsSaveLocationModalOpen(true);
              }
            }}
          />
        </MapContainer>
      </MainContentArea>

      {/* Page Footer displaying author credit */}
      <Footer />

      {/* Mobile-first Thumb-Zone Navigation Dock */}
      <MobileThumbDock
        onOpenFilters={() => setIsSidebarOpen(prev => !prev)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onToggleSandstorm={() => setIsSandstormActive(prev => !prev)}
        isSandstormActive={isSandstormActive}
        onAddMarker={() => {
          if (!user) {
            setIsLoginModalOpen(true);
            return;
          }
          setIsAddPinActive(true);
        }}
        activeFilterCount={activeFilterKeys.size}
        onOpenSquad={() => {
          if (!user) setIsLoginModalOpen(true);
          else setIsGroupManagerModalOpen(true);
        }}
        squadName={activeGroup?.name}
      />

      {/* Location Details Bottom Sheet */}
      <LocationDetailSheet
        location={selectedMarker}
        onClose={() => setSelectedMarker(null)}
        onSetWaypoint={loc => {
          setSelectedMarker(loc);
        }}
        onStartDrag={handleStartDrag}
        onEdit={handleOpenEdit}
        onDelete={handleDeleteMarker}
        onSaveToGroup={loc => {
          if (!user) {
            setIsLoginModalOpen(true);
          } else {
            const isPersonal =
              customMarkers.some(cm => cm.id === loc.id) || !String(loc.id).startsWith('group-');
            if (isPersonal) {
              setTransferringPersonalMarkerId(loc.id);
            } else {
              setTransferringPersonalMarkerId(null);
            }
            setSaveLocationCoords({
              lat: loc.lat,
              lng: loc.lng,
              inGameX: loc.x,
              inGameZ: loc.z,
              militaryGrid: loc.grid,
              initialName: loc.name,
              initialNote: loc.note || (loc.desc && loc.desc !== 'Marcador pessoal criado no mapa.' ? loc.desc : ''),
            });
            setIsSaveLocationModalOpen(true);
          }
        }}
      />

      {/* Edit Custom Marker Dialog */}
      <EditMarkerDialog
        marker={editingMarker}
        isOpen={Boolean(editingMarker)}
        onClose={() => setEditingMarker(null)}
        onSave={handleSaveEdit}
        onDelete={handleDeleteCustomMarker}
      />

      {/* Survival Guide Bottom Sheet & Morse Decoder */}
      <NasdaraSurvivalGuide
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      {/* Custom Marker Creator Modal */}
      <AddMarkerDialog
        isOpen={isAddMarkerOpen && Boolean(user)}
        onClose={() => setIsAddMarkerOpen(false)}
        onSaveMarker={handleAddCustomMarker}
      />

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={() => {
          if (pendingInviteCode) {
            setIsGroupManagerModalOpen(true);
          }
        }}
      />

      {/* Squad / Group Manager Modal */}
      <GroupManagerModal
        isOpen={isGroupManagerModalOpen}
        onClose={() => setIsGroupManagerModalOpen(false)}
        onSelectLocationOnMap={(loc: GroupLocation) => {
          setSelectedMarker({
            id: `group-${loc.id}`,
            name: loc.name,
            filterKey: 'custom',
            category: 'custom',
            lat: loc.lat,
            lng: loc.lng,
            x: Math.round(loc.inGameX),
            z: Math.round(loc.inGameZ),
            grid: loc.militaryGrid,
            title: `${loc.name} (${activeGroup?.name || 'Esquadrão'})`,
            desc: `Local do Esquadrão. Grade Militar: [${loc.militaryGrid}] X:${Math.round(loc.inGameX)} Z:${Math.round(loc.inGameZ)}.${loc.codeLock ? ` Code Lock: ${loc.codeLock}.` : ''}${loc.lootNotes ? ` Loot: ${loc.lootNotes}.` : ''}`,
            note: `${loc.codeLock ? `Code Lock: ${loc.codeLock}\n` : ''}${loc.lootNotes ? `Loot: ${loc.lootNotes}\n` : ''}${loc.additionalNotes || ''}`,
          });
        }}
        onOpenAddLocation={() => {
          setIsSaveLocationModalOpen(true);
        }}
      />

      {/* Save Location to Group Modal */}
      <SaveLocationModal
        isOpen={isSaveLocationModalOpen}
        onClose={() => {
          setIsSaveLocationModalOpen(false);
          setTransferringPersonalMarkerId(null);
        }}
        defaultCoords={saveLocationCoords}
        onSuccess={() => {
          if (transferringPersonalMarkerId) {
            handleDeleteMarker(transferringPersonalMarkerId);
            setTransferringPersonalMarkerId(null);
            setSelectedMarker(null);
          }
        }}
      />
    </AppContainer>
  );
}

export default function App() {
  return (
    <ThemeContextProvider>
      <AuthProvider>
        <GroupProvider>
          <MainApp />
        </GroupProvider>
      </AuthProvider>
    </ThemeContextProvider>
  );
}
