import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Check, Trash2 } from 'lucide-react';
import { BottomSheet } from '../ui/BottomSheet';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { CustomUserMarker } from './NasdaraLeafletMap';

interface EditMarkerDialogProps {
  marker: CustomUserMarker | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedMarker: CustomUserMarker) => void;
  onDelete: (markerId: string) => void;
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

const ActionsRow = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  margin-top: ${props => props.theme.spacing.sm};
`;

export const EditMarkerDialog: React.FC<EditMarkerDialogProps> = ({
  marker,
  isOpen,
  onClose,
  onSave,
  onDelete,
}) => {
  const [name, setName] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (marker) {
      setName(marker.name);
      setNote(marker.note || '');
    }
  }, [marker]);

  if (!marker) return null;

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      ...marker,
      name: name.trim(),
      note: note.trim(),
    });
    onClose();
  };

  const handleDelete = () => {
    onDelete(marker.id);
    onClose();
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Marcador Pessoal"
      subtitle={`Quadrante: [${marker.grid}] • X: ${marker.x} | Z: ${marker.z}`}
    >
      <FormContainer>
        <FieldGroup>
          <FieldLabel>Nome do Ponto</FieldLabel>
          <Input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Nome do marcador..."
          />
        </FieldGroup>

        <FieldGroup>
          <FieldLabel>Anotações Adicionais (Senha do Code Lock, Loot)</FieldLabel>
          <TextArea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Ex: Senha da porta 7741. Barraca contendo armas e peças de moto..."
          />
        </FieldGroup>

        <ActionsRow>
          <Button
            variant="danger"
            size="md"
            leftIcon={<Trash2 size={16} />}
            onClick={handleDelete}
          >
            Excluir
          </Button>

          <Button
            variant="primary"
            size="md"
            fullWidth
            disabled={!name.trim()}
            leftIcon={<Check size={16} />}
            onClick={handleSave}
          >
            Salvar Alterações
          </Button>
        </ActionsRow>
      </FormContainer>
    </BottomSheet>
  );
};
