import React, { useState } from 'react';
import styled from 'styled-components';
import { Check } from 'lucide-react';
import { BottomSheet } from '../ui/BottomSheet';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { CustomUserMarker } from './NasdaraLeafletMap';

interface AddMarkerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveMarker: (marker: CustomUserMarker) => void;
}

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
`;

const FieldLabel = styled.label`
  font-size: 13px;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
`;

const TextArea = styled.textarea`
  width: 100%;
  box-sizing: border-box;
  min-height: 80px;
  border-radius: ${props => props.theme.borderRadius.md};
  border: 1px solid ${props => props.theme.colors.border};
  background-color: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  font-family: inherit;
  font-size: 14px;
  padding: ${props => props.theme.spacing.sm};
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.borderFocus};
  }
`;

export const AddMarkerDialog: React.FC<AddMarkerDialogProps> = ({
  isOpen,
  onClose,
  onSaveMarker,
}) => {
  const [name, setName] = useState('');
  const [gridCoord, setGridCoord] = useState('I-09');
  const [note, setNote] = useState('');
  const [markerType, setMarkerType] = useState('Minha Base');

  const handleSave = () => {
    if (!name.trim()) return;

    // Default to center if not parsed
    const centerLat = -128;
    const centerLng = 128;

    const newMarker: CustomUserMarker = {
      id: `user-pin-${Date.now()}`,
      name: `[${markerType}] ${name.trim()}`,
      lat: centerLat,
      lng: centerLng,
      x: 8192,
      z: 8192,
      grid: gridCoord.trim() || 'I-09',
      note: note.trim() || 'Ponto de sobrevivência marcado em Nasdara.',
      category: 'custom',
    };

    onSaveMarker(newMarker);
    setName('');
    setNote('');
    onClose();
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Criar Novo Marcador Pessoal"
      subtitle="Salve sua base, barraca de loot ou moto em Nasdara"
    >
      <FormContainer>
        <FieldGroup>
          <FieldLabel>Tipo de Marcador</FieldLabel>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['Minha Base', 'Loot Oculto', 'Moto 1.30', 'Ponto Perigoso'].map(type => (
              <Button
                key={type}
                size="sm"
                variant={markerType === type ? 'primary' : 'outline'}
                onClick={() => setMarkerType(type)}
              >
                {type}
              </Button>
            ))}
          </div>
        </FieldGroup>

        <FieldGroup>
          <FieldLabel>Nome do Ponto</FieldLabel>
          <Input
            placeholder="Ex: Tenda com Fuzis / Moto Enduro Escondida"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </FieldGroup>

        <FieldGroup>
          <FieldLabel>Quadrante da Grade Militar (Ex: K-12)</FieldLabel>
          <Input
            placeholder="K-12"
            value={gridCoord}
            onChange={e => setGridCoord(e.target.value)}
          />
        </FieldGroup>

        <FieldGroup>
          <FieldLabel>Anotações Adicionais (Senha de Code Lock, Pistas)</FieldLabel>
          <TextArea
            placeholder="Ex: Código do cadeado: 3819. Fica ao lado da cisterna."
            value={note}
            onChange={e => setNote(e.target.value)}
          />
        </FieldGroup>

        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
          <Button variant="outline" size="md" fullWidth onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="md"
            fullWidth
            disabled={!name.trim()}
            leftIcon={<Check size={16} />}
            onClick={handleSave}
          >
            Salvar Marcador
          </Button>
        </div>
      </FormContainer>
    </BottomSheet>
  );
};
