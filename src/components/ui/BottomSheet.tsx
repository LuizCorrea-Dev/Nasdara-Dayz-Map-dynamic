import React, { useEffect } from 'react';
import styled from 'styled-components';
import { X } from 'lucide-react';
import { IconButton } from './IconButton';

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  maxHeight?: string;
  width?: string;
  mobileWidth?: string;
  maxWidth?: string;
  zIndex?: number;
}

const Backdrop = styled.div<{ $isOpen: boolean; $zIndex?: number }>`
  position: fixed;
  inset: 0;
  background-color: ${props => props.theme.colors.overlay};
  z-index: ${props => props.$zIndex ?? 2000};
  opacity: ${props => (props.$isOpen ? 1 : 0)};
  pointer-events: ${props => (props.$isOpen ? 'auto' : 'none')};
  transition: opacity 0.25s ease;
  display: flex;
  justify-content: center;
  align-items: flex-end;

  @media (min-width: 768px) {
    align-items: center;
    padding: ${props => props.theme.spacing.lg};
  }
`;

const SheetContainer = styled.div<{
  $isOpen: boolean;
  $maxHeight?: string;
  $width?: string;
  $mobileWidth?: string;
  $maxWidth?: string;
}>`
  display: flex;
  flex-direction: column;
  width: ${props => props.$mobileWidth || '100%'};
  max-width: ${props => props.$mobileWidth || '100%'};
  max-height: ${props => props.$maxHeight || '85vh'};
  background-color: ${props => props.theme.colors.surface};
  border-top-left-radius: ${props => props.theme.borderRadius.xl};
  border-top-right-radius: ${props => props.theme.borderRadius.xl};
  border: 1px solid ${props => props.theme.colors.border};
  border-bottom: none;
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.35);
  transform: translateY(${props => (props.$isOpen ? '0' : '100%')});
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
  box-sizing: border-box;

  ${props =>
    props.$mobileWidth && props.$mobileWidth !== '100%'
      ? `
    border-bottom-left-radius: ${props.theme.borderRadius.xl};
    border-bottom-right-radius: ${props.theme.borderRadius.xl};
    margin-bottom: 12px;
    border-bottom: 1px solid ${props.theme.colors.border};
  `
      : ''}

  @media (min-width: 768px) {
    width: ${props => props.$width || '100%'};
    max-width: ${props => props.$maxWidth || '600px'};
    margin-bottom: 0;
    border-radius: ${props => props.theme.borderRadius.xl};
    border-bottom: 1px solid ${props => props.theme.colors.border};
    transform: translateY(${props => (props.$isOpen ? '0' : '20px')})
      scale(${props => (props.$isOpen ? 1 : 0.96)});
  }
`;

const DragHandleArea = styled.div`
  display: flex;
  justify-content: center;
  padding: ${props => props.theme.spacing.sm} 0 ${props => props.theme.spacing.xs};

  @media (min-width: 768px) {
    display: none;
  }
`;

const DragHandle = styled.div`
  width: 36px;
  height: 4px;
  border-radius: ${props => props.theme.borderRadius.full};
  background-color: ${props => props.theme.colors.border};
`;

const SheetHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.lg};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  min-height: 56px;
  box-sizing: border-box;
`;

const HeaderTextContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const SheetTitle = styled.h3`
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
`;

const SheetSubtitle = styled.span`
  font-size: 12px;
  color: ${props => props.theme.colors.textMuted};
`;

const SheetBody = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${props => props.theme.spacing.lg};
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  flex: 1;
`;

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxHeight,
  width,
  mobileWidth,
  maxWidth,
  zIndex,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <Backdrop $isOpen={isOpen} $zIndex={zIndex} onClick={onClose}>
      <SheetContainer
        $isOpen={isOpen}
        $maxHeight={maxHeight}
        $width={width}
        $mobileWidth={mobileWidth}
        $maxWidth={maxWidth}
        onClick={e => e.stopPropagation()}
      >
        <DragHandleArea>
          <DragHandle />
        </DragHandleArea>
        {title && (
          <SheetHeader>
            <HeaderTextContainer>
              <SheetTitle>{title}</SheetTitle>
              {subtitle && <SheetSubtitle>{subtitle}</SheetSubtitle>}
            </HeaderTextContainer>
            <IconButton
              size="sm"
              variant="ghost"
              onClick={onClose}
              aria-label="Fechar"
            >
              <X size={20} />
            </IconButton>
          </SheetHeader>
        )}
        <SheetBody>{children}</SheetBody>
      </SheetContainer>
    </Backdrop>
  );
};
