import React from 'react';
import styled, { css } from 'styled-components';

export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'military'
  | 'water'
  | 'vehicle'
  | 'medical'
  | 'radio'
  | 'warning'
  | 'success'
  | 'danger';

export interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

const StyledBadge = styled.span<{ $variant: BadgeVariant }>`
  display: inline-flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.full};
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  user-select: none;
  line-height: 1;

  ${props => {
    switch (props.$variant) {
      case 'primary':
        return css`
          background-color: ${props.theme.colors.surfaceVariant};
          color: ${props.theme.colors.primary};
          border: 1px solid ${props.theme.colors.primary};
        `;
      case 'military':
        return css`
          background-color: ${props.theme.colors.militarySurface};
          color: ${props.theme.colors.military};
          border: 1px solid ${props.theme.colors.military};
        `;
      case 'water':
        return css`
          background-color: ${props.theme.colors.waterSurface};
          color: ${props.theme.colors.water};
          border: 1px solid ${props.theme.colors.water};
        `;
      case 'vehicle':
        return css`
          background-color: ${props.theme.colors.vehicleSurface};
          color: ${props.theme.colors.vehicle};
          border: 1px solid ${props.theme.colors.vehicle};
        `;
      case 'medical':
        return css`
          background-color: ${props.theme.colors.medicalSurface};
          color: ${props.theme.colors.medical};
          border: 1px solid ${props.theme.colors.medical};
        `;
      case 'radio':
        return css`
          background-color: ${props.theme.colors.radioSurface};
          color: ${props.theme.colors.radio};
          border: 1px solid ${props.theme.colors.radio};
        `;
      case 'danger':
        return css`
          background-color: ${props.theme.colors.dangerSurface};
          color: ${props.theme.colors.danger};
          border: 1px solid ${props.theme.colors.danger};
        `;
      case 'warning':
        return css`
          background-color: ${props.theme.colors.warningSurface};
          color: ${props.theme.colors.warning};
          border: 1px solid ${props.theme.colors.warning};
        `;
      case 'success':
        return css`
          background-color: ${props.theme.colors.successSurface};
          color: ${props.theme.colors.success};
          border: 1px solid ${props.theme.colors.success};
        `;
      case 'default':
      default:
        return css`
          background-color: ${props.theme.colors.surfaceVariant};
          color: ${props.theme.colors.textSecondary};
          border: 1px solid ${props.theme.colors.border};
        `;
    }
  }}
`;

export const Badge: React.FC<BadgeProps> = ({ variant = 'default', children, icon }) => {
  return (
    <StyledBadge $variant={variant}>
      {icon}
      {children}
    </StyledBadge>
  );
};
