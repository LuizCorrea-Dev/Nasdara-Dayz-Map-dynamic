import React from 'react';
import styled from 'styled-components';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onClear?: () => void;
  fullWidth?: boolean;
}

const InputContainer = styled.div<{ $fullWidth?: boolean }>`
  display: flex;
  align-items: center;
  position: relative;
  width: ${props => (props.$fullWidth ? '100%' : 'auto')};
  background-color: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  min-height: 48px; /* Thumb zone touch target */
  padding: 0 ${props => props.theme.spacing.sm};
  box-sizing: border-box;

  &:focus-within {
    border-color: ${props => props.theme.colors.borderFocus};
    box-shadow: 0 0 0 1px ${props => props.theme.colors.borderFocus};
  }
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.textMuted};
  padding: 0 ${props => props.theme.spacing.xs};
  flex-shrink: 0;
`;

const StyledInputField = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: ${props => props.theme.colors.text};
  font-family: inherit;
  font-size: 14px;
  padding: ${props => props.theme.spacing.sm} 0;
  width: 100%;

  &::placeholder {
    color: ${props => props.theme.colors.textMuted};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const ClearButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  color: ${props => props.theme.colors.textMuted};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing.xs};
  border-radius: ${props => props.theme.borderRadius.sm};
  min-width: 32px;
  min-height: 32px;

  &:hover {
    color: ${props => props.theme.colors.text};
  }
`;

export const Input: React.FC<InputProps> = ({
  leftIcon,
  rightIcon,
  onClear,
  fullWidth = true,
  value,
  ...rest
}) => {
  return (
    <InputContainer $fullWidth={fullWidth}>
      {leftIcon && <IconWrapper>{leftIcon}</IconWrapper>}
      <StyledInputField value={value} {...rest} />
      {value && onClear && (
        <ClearButton type="button" onClick={onClear} aria-label="Limpar campo">
          ✕
        </ClearButton>
      )}
      {rightIcon && <IconWrapper>{rightIcon}</IconWrapper>}
    </InputContainer>
  );
};
