import React from 'react';
import styled, { css } from 'styled-components';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'surface' | 'surfaceVariant' | 'highlight';
  interactive?: boolean;
  padding?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  onPress?: () => void;
  className?: string;
}

const StyledCard = styled.div<{
  $variant: 'surface' | 'surfaceVariant' | 'highlight';
  $interactive?: boolean;
  $padding: 'sm' | 'md' | 'lg';
}>`
  display: flex;
  flex-direction: column;
  border-radius: ${props => props.theme.borderRadius.lg};
  border: 1px solid ${props => props.theme.colors.border};
  box-sizing: border-box;
  transition: all 0.15s ease-in-out;

  ${props => {
    switch (props.$variant) {
      case 'surfaceVariant':
        return css`
          background-color: ${props.theme.colors.surfaceVariant};
        `;
      case 'highlight':
        return css`
          background-color: ${props.theme.colors.surface};
          border-color: ${props.theme.colors.primary};
        `;
      case 'surface':
      default:
        return css`
          background-color: ${props.theme.colors.surface};
        `;
    }
  }}

  ${props => {
    switch (props.$padding) {
      case 'sm':
        return css`
          padding: ${props.theme.spacing.sm};
        `;
      case 'lg':
        return css`
          padding: ${props.theme.spacing.lg};
        `;
      case 'md':
      default:
        return css`
          padding: ${props.theme.spacing.md};
        `;
    }
  }}

  ${props =>
    props.$interactive &&
    css`
      cursor: pointer;
      user-select: none;
      &:hover {
        background-color: ${props.theme.colors.surfaceHover};
        border-color: ${props.theme.colors.borderFocus};
        transform: translateY(-1px);
      }
      &:active {
        transform: translateY(0);
      }
    `}
`;

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'surface',
  interactive = false,
  padding = 'md',
  onClick,
  onPress,
  className,
}) => {
  const handleClick = () => {
    if (onPress) onPress();
    if (onClick) onClick();
  };

  return (
    <StyledCard
      $variant={variant}
      $interactive={interactive}
      $padding={padding}
      onClick={interactive ? handleClick : undefined}
      className={className}
    >
      {children}
    </StyledCard>
  );
};
