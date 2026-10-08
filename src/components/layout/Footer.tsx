import React from 'react';
import styled from 'styled-components';
import { ShieldCheck, Compass } from 'lucide-react';

interface FooterProps {
  totalMarkersCount?: number;
}

const FooterContainer = styled.footer`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${props => props.theme.spacing.md};
  padding: 6px ${props => props.theme.spacing.lg};
  background-color: ${props => props.theme.colors.surface};
  border-top: 1px solid ${props => props.theme.colors.border};
  color: ${props => props.theme.colors.textSecondary};
  font-size: 12px;
  user-select: none;
  min-height: 36px;
  box-sizing: border-box;
  z-index: 20;

  @media (max-width: 768px) {
    flex-direction: column;
    justify-content: center;
    gap: 4px;
    padding: 6px ${props => props.theme.spacing.sm};
    font-size: 11px;
    text-align: center;
    min-height: 38px;
  }
`;

const FooterLeft = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  color: ${props => props.theme.colors.textMuted};
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace, sans-serif;
  letter-spacing: 0.02em;

  @media (max-width: 768px) {
    display: none;
  }
`;

const TacticalBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px;
  border-radius: ${props => props.theme.borderRadius.sm};
  background-color: ${props => props.theme.colors.surfaceVariant};
  border: 1px solid ${props => props.theme.colors.border};
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  color: ${props => props.theme.colors.primary};
`;

const FooterAuthor = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
  color: ${props => props.theme.colors.text};

  strong {
    color: ${props => props.theme.colors.primary};
    font-weight: 700;
    letter-spacing: 0.02em;
  }
`;

const FooterRight = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

export const Footer: React.FC<FooterProps> = ({ totalMarkersCount = 4938 }) => {
  return (
    <FooterContainer>
      <FooterLeft>
        <TacticalBadge>
          <Compass size={12} />
          <span>Nasdara 1.30</span>
        </TacticalBadge>
        <span>Mapa Tático Badlands • {totalMarkersCount.toLocaleString()} POIs ativos</span>
      </FooterLeft>

      <FooterRight>
        <FooterAuthor>
          <ShieldCheck size={14} color="#EA580C" />
          <span>
            criado por <strong>Rootszera</strong>
          </span>
        </FooterAuthor>
      </FooterRight>
    </FooterContainer>
  );
};
