import React from 'react';
import styled, { css } from 'styled-components';

export type IconButtonVariant = 'default' | 'primary' | 'secondary' | 'danger' | 'ghost';
export type IconButtonSize = 'sm' | 'md' | 'lg';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  active?: boolean;
  onPress?: () => void;
  'aria-label': string;
}

const StyledIconButton = styled.button<{
  $variant: IconButtonVariant;
  $size: IconButtonSize;
  $active?: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: ${props => props.theme.borderRadius.md};
  cursor: pointer;
  transition: all 0.15s ease-in-out;
  user-select: none;
  touch-action: manipulation;
  border: 1px solid transparent;
  flex-shrink: 0;

  /* Min 48x48px touch target on mobile */
  ${props => {
    switch (props.$size) {
      case 'sm':
        return css`
          width: 40px;
          height: 40px;
          min-width: 40px;
          min-height: 40px;
        `;
      case 'lg':
        return css`
          width: 56px;
          height: 56px;
          min-width: 56px;
          min-height: 56px;
        `;
      case 'md':
      default:
        return css`
          width: 48px;
          height: 48px;
          min-width: 48px;
          min-height: 48px;
        `;
    }
  }}

  ${props => {
    switch (props.$variant) {
      case 'primary':
        return css`
          background-color: ${props.$active
            ? props.theme.colors.primaryHover
            : props.theme.colors.primary};
          color: ${props.theme.colors.primaryText};
          &:hover:not(:disabled) {
            background-color: ${props.theme.colors.primaryHover};
          }
        `;
      case 'secondary':
        return css`
          background-color: ${props.theme.colors.secondary};
          color: ${props.theme.colors.secondaryText};
          &:hover:not(:disabled) {
            background-color: ${props.theme.colors.secondaryHover};
          }
        `;
      case 'danger':
        return css`
          background-color: ${props.theme.colors.dangerSurface};
          color: ${props.theme.colors.danger};
          border-color: ${props.theme.colors.danger};
        `;
      case 'ghost':
        return css`
          background-color: transparent;
          color: ${props.theme.colors.textSecondary};
          &:hover:not(:disabled) {
            background-color: ${props.theme.colors.surfaceHover};
            color: ${props.theme.colors.text};
          }
        `;
      case 'default':
      default:
        return css`
          background-color: ${props.$active
            ? props.theme.colors.surfaceHover
            : props.theme.colors.surface};
          color: ${props.$active
            ? props.theme.colors.primary
            : props.theme.colors.text};
          border-color: ${props.$active
            ? props.theme.colors.primary
            : props.theme.colors.border};
          &:hover:not(:disabled) {
            background-color: ${props.theme.colors.surfaceHover};
            border-color: ${props.theme.colors.borderFocus};
          }
        `;
    }
  }}

  &:active:not(:disabled) {
    transform: scale(0.94);
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

export const IconButton: React.FC<IconButtonProps> = ({
  variant = 'default',
  size = 'md',
  active = false,
  onPress,
  onClick,
  children,
  ...rest
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (rest.disabled) return;
    if (onPress) onPress();
    if (onClick) onClick(e);
  };

  return (
    <StyledIconButton
      $variant={variant}
      $size={size}
      $active={active}
      onClick={handleClick}
      {...rest}
    >
      {children}
    </StyledIconButton>
  );
};
