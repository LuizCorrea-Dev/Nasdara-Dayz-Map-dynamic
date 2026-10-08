import React from 'react';
import styled, { css } from 'styled-components';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
  onPress?: () => void;
}

// Styled component separation
const StyledButton = styled.button<{
  $variant: ButtonVariant;
  $size: ButtonSize;
  $fullWidth?: boolean;
  $isLoading?: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.md};
  font-family: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
  user-select: none;
  touch-action: manipulation;
  width: ${props => (props.$fullWidth ? '100%' : 'auto')};
  box-sizing: border-box;

  /* Size & Minimum 48px Touch Target for thumb zone accessibility */
  ${props => {
    switch (props.$size) {
      case 'sm':
        return css`
          min-height: 40px;
          padding: ${props.theme.spacing.xs} ${props.theme.spacing.md};
          font-size: 13px;
        `;
      case 'lg':
        return css`
          min-height: 52px;
          padding: ${props.theme.spacing.md} ${props.theme.spacing.xl};
          font-size: 16px;
        `;
      case 'md':
      default:
        return css`
          min-height: 48px;
          padding: ${props.theme.spacing.sm} ${props.theme.spacing.lg};
          font-size: 14px;
        `;
    }
  }}

  /* Variants without hardcoded colors */
  ${props => {
    switch (props.$variant) {
      case 'secondary':
        return css`
          background-color: ${props.theme.colors.secondary};
          color: ${props.theme.colors.secondaryText};
          border: 1px solid ${props.theme.colors.secondary};
          &:hover:not(:disabled) {
            background-color: ${props.theme.colors.secondaryHover};
          }
        `;
      case 'outline':
        return css`
          background-color: transparent;
          color: ${props.theme.colors.text};
          border: 1px solid ${props.theme.colors.border};
          &:hover:not(:disabled) {
            background-color: ${props.theme.colors.surfaceVariant};
            border-color: ${props.theme.colors.borderFocus};
          }
        `;
      case 'danger':
        return css`
          background-color: ${props.theme.colors.danger};
          color: ${props.theme.colors.dangerText};
          border: 1px solid ${props.theme.colors.danger};
          &:hover:not(:disabled) {
            opacity: 0.9;
          }
        `;
      case 'ghost':
        return css`
          background-color: transparent;
          color: ${props.theme.colors.textSecondary};
          border: 1px solid transparent;
          &:hover:not(:disabled) {
            background-color: ${props.theme.colors.surfaceHover};
            color: ${props.theme.colors.text};
          }
        `;
      case 'primary':
      default:
        return css`
          background-color: ${props.theme.colors.primary};
          color: ${props.theme.colors.primaryText};
          border: 1px solid ${props.theme.colors.primary};
          &:hover:not(:disabled) {
            background-color: ${props.theme.colors.primaryHover};
          }
        `;
    }
  }}

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const Spinner = styled.span`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: ${props => props.theme.borderRadius.full};
  animation: spin 0.75s linear infinite;

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

// Logic layer separated from styled layer
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  children,
  onClick,
  onPress,
  ...rest
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || isLoading) return;
    if (onPress) onPress();
    if (onClick) onClick(e);
  };

  return (
    <StyledButton
      $variant={variant}
      $size={size}
      $fullWidth={fullWidth}
      $isLoading={isLoading}
      disabled={disabled || isLoading}
      onClick={handleClick}
      {...rest}
    >
      {isLoading ? (
        <Spinner />
      ) : (
        <>
          {leftIcon}
          <span>{children}</span>
          {rightIcon}
        </>
      )}
    </StyledButton>
  );
};
