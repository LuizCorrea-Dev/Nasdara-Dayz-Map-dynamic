import React, { useState } from 'react';
import styled from 'styled-components';
import {
  Copy,
  Check,
  Navigation,
  Move,
  Edit3,
  Trash2,
  Shield,
} from 'lucide-react';
import { RealNasdaraMarker, REAL_CATEGORY_LABELS } from '../../data/nasdaraTypes';
import { BottomSheet } from '../ui/BottomSheet';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface LocationDetailSheetProps {
  location: RealNasdaraMarker | null;
  onClose: () => void;
  onSetWaypoint?: (loc: RealNasdaraMarker) => void;
  onStartDrag?: (markerId: string) => void;
  onEdit?: (marker: RealNasdaraMarker) => void;
  onDelete?: (markerId: string) => void;
  onSaveToGroup?: (loc: RealNasdaraMarker) => void;
}

const DetailSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const HeaderBadgesRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.xs};
  align-items: center;
`;

const CoordinatesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${props => props.theme.spacing.sm};
  background-color: ${props => props.theme.colors.surfaceVariant};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  border: 1px solid ${props => props.theme.colors.border};
`;

const CoordItem = styled.div`
  display: flex;
  flex-direction: column;
`;

const CoordLabel = styled.span`
  font-size: 10px;
  color: ${props => props.theme.colors.textMuted};
  text-transform: uppercase;
  font-weight: 700;
`;

const CoordValue = styled.span`
  font-size: 13px;
  font-family: monospace;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
`;

const DescriptionText = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: ${props => props.theme.colors.textSecondary};
`;

const ActionsRow = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  margin-top: ${props => props.theme.spacing.md};
  padding-top: ${props => props.theme.spacing.md};
  border-top: 1px solid ${props => props.theme.colors.border};
  flex-wrap: wrap;
`;

const CustomActionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
  background-color: ${props => props.theme.colors.surfaceVariant};
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.lg};
  border: 1px solid ${props => props.theme.colors.border};
  margin-top: ${props => props.theme.spacing.xs};
`;

const CustomActionsTitle = styled.div`
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: ${props => props.theme.colors.primary};
`;

const CustomButtonsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${props => props.theme.spacing.sm};

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

export const LocationDetailSheet: React.FC<LocationDetailSheetProps> = ({
  location,
  onClose,
  onSetWaypoint,
  onStartDrag,
  onEdit,
  onDelete,
  onSaveToGroup,
}) => {
  const [copied, setCopied] = useState(false);

  if (!location) return null;

  const handleCopyCoord = () => {
    navigator.clipboard.writeText(`Nasdara [${location.grid}] X:${location.x} Z:${location.z} - ${location.title}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isGroupMarker = String(location.id).startsWith('group-');
  const isPersonalMarker = !isGroupMarker && (location.category === 'custom' || location.filterKey === 'custom');
  const isCustom = isPersonalMarker || isGroupMarker;
  const catKey = location.filterKey || location.category || 'custom';
  const catInfo = REAL_CATEGORY_LABELS[catKey];

  return (
    <BottomSheet
      isOpen={Boolean(location)}
      onClose={onClose}
      title={location.name}
      subtitle={
        isGroupMarker
          ? `Marcador de Grupo • Grade [${location.grid}]`
          : isPersonalMarker
          ? `Marcador Pessoal`
          : `Província de Nasdara (DayZ Badlands DLC) • Grade [${location.grid}]`
      }
    >
      <DetailSection>
        {/* Badges Row - Hidden for personal markers */}
        {!isPersonalMarker && (
          <HeaderBadgesRow>
            <Badge variant="primary">{catInfo?.label || catKey}</Badge>
            <Badge variant="military">Grade: {location.grid}</Badge>
            {location.subCategory && (
              <Badge variant="default">{location.subCategory}</Badge>
            )}
          </HeaderBadgesRow>
        )}

        {/* Tactical Coordinates Grid - Hidden for personal markers */}
        {!isPersonalMarker && (
          <CoordinatesGrid>
            <CoordItem>
              <CoordLabel>Grade Militar</CoordLabel>
              <CoordValue>[{location.grid}]</CoordValue>
            </CoordItem>
            <CoordItem>
              <CoordLabel>In-Game X</CoordLabel>
              <CoordValue>{location.x}</CoordValue>
            </CoordItem>
            <CoordItem>
              <CoordLabel>In-Game Z</CoordLabel>
              <CoordValue>{location.z}</CoordValue>
            </CoordItem>
          </CoordinatesGrid>
        )}

        {/* Description */}
        <DescriptionText>{location.desc}</DescriptionText>

        {location.note && (
          <DescriptionText>
            <strong>Anotações:</strong> {location.note}
          </DescriptionText>
        )}

        {/* Custom Marker Controls (Drag & Reposition, Edit, Delete) */}
        {isPersonalMarker && (
          <CustomActionsContainer>
            <CustomActionsTitle>Gerenciar Marcador Pessoal</CustomActionsTitle>
            <CustomButtonsGrid>
              {onStartDrag && (
                <Button
                  variant="primary"
                  size="md"
                  leftIcon={<Move size={16} />}
                  onClick={() => {
                    onStartDrag(location.id);
                    onClose();
                  }}
                >
                  Arrastar Posição
                </Button>
              )}

              {onEdit && (
                <Button
                  variant="outline"
                  size="md"
                  leftIcon={<Edit3 size={16} />}
                  onClick={() => {
                    onEdit(location);
                    onClose();
                  }}
                >
                  Editar Dados
                </Button>
              )}
            </CustomButtonsGrid>

            {onDelete && (
              <Button
                variant="danger"
                size="md"
                fullWidth
                leftIcon={<Trash2 size={16} />}
                onMouseDown={(e: React.MouseEvent) => e.stopPropagation()}
                onPointerDown={(e: React.PointerEvent) => e.stopPropagation()}
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  onDelete(location.id);
                  onClose();
                }}
              >
                Excluir Marcador Pessoal
              </Button>
            )}
          </CustomActionsContainer>
        )}

        {/* Group Marker Controls (Delete from Group / Cloud SQL) */}
        {isGroupMarker && (
          <CustomActionsContainer>
            <CustomActionsTitle>Gerenciar Marcador do Grupo</CustomActionsTitle>
            {onDelete && (
              <Button
                variant="danger"
                size="md"
                fullWidth
                leftIcon={<Trash2 size={16} />}
                onMouseDown={(e: React.MouseEvent) => e.stopPropagation()}
                onPointerDown={(e: React.PointerEvent) => e.stopPropagation()}
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  onDelete(location.id);
                  onClose();
                }}
              >
                Excluir Marcador do Grupo
              </Button>
            )}
          </CustomActionsContainer>
        )}

        {/* Standard Actions */}
        <ActionsRow>
          {!isGroupMarker && onSaveToGroup && (
            <Button
              variant="secondary"
              size="md"
              fullWidth
              leftIcon={<Shield size={16} color="#0284C7" />}
              onClick={() => onSaveToGroup(location)}
            >
              Salvar no Esquadrão
            </Button>
          )}

          <Button
            variant="outline"
            size="md"
            fullWidth
            leftIcon={copied ? <Check size={16} /> : <Copy size={16} />}
            onClick={handleCopyCoord}
          >
            {copied ? 'Copiado!' : 'Copiar Coordenadas'}
          </Button>

          {onSetWaypoint && !isCustom && (
            <Button
              variant="primary"
              size="md"
              fullWidth
              leftIcon={<Navigation size={16} />}
              onClick={() => onSetWaypoint(location)}
            >
              Focar no Mapa
            </Button>
          )}
        </ActionsRow>
      </DetailSection>
    </BottomSheet>
  );
};
