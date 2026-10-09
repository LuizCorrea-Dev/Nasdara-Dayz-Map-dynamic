import React, { useState } from 'react';
import styled from 'styled-components';
import { X, MapPin, Lock, Package, FileText, Compass, Check } from 'lucide-react';
import { useGroup } from '../../context/GroupContext';

interface SaveLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCoords?: {
    lat: number;
    lng: number;
    inGameX: number;
    inGameZ: number;
    militaryGrid: string;
    initialName?: string;
    initialNote?: string;
  };
  onSuccess?: () => void;
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: ${props => props.theme.colors.overlay};
  backdrop-filter: blur(6px);
  z-index: 10001;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing.md};
`;

const Card = styled.div`
  background-color: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  width: 100%;
  max-width: 520px;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  background-color: ${props => props.theme.colors.surfaceVariant};
  border-bottom: 1px solid ${props => props.theme.colors.border};

  h2 {
    font-size: 17px;
    font-weight: 700;
    color: ${props => props.theme.colors.text};
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: ${props => props.theme.colors.textMuted};
  cursor: pointer;
  padding: 6px;
  border-radius: ${props => props.theme.borderRadius.md};
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: ${props => props.theme.colors.text};
  }
`;

const Form = styled.form`
  padding: ${props => props.theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
  overflow-y: auto;
  max-height: 75vh;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    font-size: 13px;
    font-weight: 600;
    color: ${props => props.theme.colors.text};
    display: flex;
    align-items: center;
    gap: 6px;
  }
`;

const StyledInput = styled.input`
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

const StyledTextarea = styled.textarea`
  min-height: 70px;
  padding: 10px 12px;
  background-color: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  color: ${props => props.theme.colors.text};
  font-size: 14px;
  resize: vertical;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const CancelButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
  padding: 0 18px;
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  background-color: #DC2626;
  border: 1px solid #B91C1C;
  color: #FFFFFF;
  transition: all 0.2s ease;

  &:hover {
    background-color: #B91C1C;
    border-color: #991B1B;
  }

  &:focus-visible {
    outline: 2px solid #EF4444;
    outline-offset: 2px;
  }
`;

const SaveButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
  padding: 0 20px;
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  background-color: #16A34A;
  border: 1px solid #15803D;
  color: #FFFFFF;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background-color: #15803D;
    border-color: #166534;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid #22C55E;
    outline-offset: 2px;
  }
`;

const ErrorMsg = styled.div`
  color: ${props => props.theme.colors.dangerText};
  background-color: ${props => props.theme.colors.dangerSurface};
  border: 1px solid ${props => props.theme.colors.danger};
  padding: 8px 12px;
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: 13px;
`;

export const SaveLocationModal: React.FC<SaveLocationModalProps> = ({
  isOpen,
  onClose,
  defaultCoords = {
    lat: -95,
    lng: 150,
    inGameX: 9600,
    inGameZ: 10400,
    militaryGrid: 'J-06',
  },
  onSuccess,
}) => {
  const { activeGroup, addLocation } = useGroup();

  const [name, setName] = useState(defaultCoords.initialName || '');
  const [codeLock, setCodeLock] = useState('');
  const [lootNotes, setLootNotes] = useState(defaultCoords.initialNote || '');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state when defaultCoords changes or modal opens
  React.useEffect(() => {
    if (isOpen) {
      setName(defaultCoords.initialName || '');
      setLootNotes(defaultCoords.initialNote || '');
      setCodeLock('');
      setAdditionalNotes('');
      setError(null);
    }
  }, [isOpen, defaultCoords.initialName, defaultCoords.initialNote]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor, informe o nome do local');
      return;
    }
    if (!activeGroup) {
      setError('Selecione um grupo ativo antes de salvar');
      return;
    }

    try {
      setError(null);
      setSubmitting(true);
      await addLocation({
        name: name.trim(),
        militaryGrid: defaultCoords.militaryGrid || '---',
        inGameX: Math.round(defaultCoords.inGameX || 8192),
        inGameZ: Math.round(defaultCoords.inGameZ || 8192),
        lat: defaultCoords.lat,
        lng: defaultCoords.lng,
        codeLock: codeLock.trim() || undefined,
        lootNotes: lootNotes.trim() || undefined,
        additionalNotes: additionalNotes.trim() || undefined,
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Falha ao salvar local');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Overlay onClick={onClose}>
      <Card onClick={e => e.stopPropagation()}>
        <Header>
          <h2>
            <MapPin size={18} color="#EA580C" />
            Salvar Local no Grupo: {activeGroup?.name || 'Selecione um grupo'}
          </h2>
          <CloseButton onClick={onClose} aria-label="Fechar">
            <X size={18} />
          </CloseButton>
        </Header>

        <Form onSubmit={handleSubmit}>
          {error && <ErrorMsg>{error}</ErrorMsg>}

          <FormGroup>
            <label>
              <Compass size={14} /> Nome do Local (Base, Stash, Portão) *
            </label>
            <StyledInput
              placeholder="Ex: Base Floresta Zelenogorsk, Stash da Tenda..."
              value={name}
              onChange={e => setName(e.target.value)}
              required
              autoFocus
            />
          </FormGroup>

          <FormGroup>
            <label>
              <Lock size={14} /> Senha do Code Lock
            </label>
            <StyledInput
              value={codeLock}
              onChange={e => setCodeLock(e.target.value)}
              placeholder="Ex: 4921 ou 8820"
              maxLength={8}
            />
          </FormGroup>

          <FormGroup>
            <label>
              <Package size={14} /> Anotações de Loot & Suprimentos Guardados
            </label>
            <StyledTextarea
              value={lootNotes}
              onChange={e => setLootNotes(e.target.value)}
              placeholder="Ex: 2x M4-A1, 4x Carregadores 60rnd, Caixa de Munição 5.56, 2x NVG, Tenda militar..."
            />
          </FormGroup>

          <FormGroup>
            <label>
              <FileText size={14} /> Anotações Adicionais
            </label>
            <StyledInput
              value={additionalNotes}
              onChange={e => setAdditionalNotes(e.target.value)}
              placeholder="Instruções de acesso, senhas secundárias ou alertas..."
            />
          </FormGroup>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
            <CancelButton type="button" onClick={onClose}>
              Cancelar
            </CancelButton>
            <SaveButton type="submit" disabled={submitting}>
              <Check size={16} />
              {submitting ? 'Salvando...' : 'Salvar Local'}
            </SaveButton>
          </div>
        </Form>
      </Card>
    </Overlay>
  );
};
