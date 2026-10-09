import React, { useState } from 'react';
import styled from 'styled-components';
import { X, ShieldCheck, AlertTriangle, Copy, Check, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: ${props => props.theme.colors.overlay};
  backdrop-filter: blur(6px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing.md};
`;

const ModalCard = styled.div`
  background-color: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  width: 100%;
  max-width: 480px;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  background-color: ${props => props.theme.colors.surfaceVariant};
`;

const TitleArea = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const Title = styled.h2`
  font-size: 17px;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
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
  transition: all 0.2s;

  &:hover {
    color: ${props => props.theme.colors.text};
    background-color: ${props => props.theme.colors.surfaceHover};
  }
`;

const Content = styled.div`
  padding: ${props => props.theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
`;

const Description = styled.p`
  font-size: 14px;
  color: ${props => props.theme.colors.textSecondary};
  line-height: 1.5;
  margin: 0;
  text-align: center;
`;

const ErrorBanner = styled.div`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background-color: ${props => props.theme.colors.dangerSurface};
  border: 1px solid ${props => props.theme.colors.danger};
  border-radius: ${props => props.theme.borderRadius.md};
  color: ${props => props.theme.colors.dangerText};
  font-size: 13px;
`;

const UnauthorizedDomainBox = styled.div`
  padding: ${props => props.theme.spacing.md};
  background-color: ${props => props.theme.colors.warningSurface};
  border: 1px solid ${props => props.theme.colors.warning};
  border-radius: ${props => props.theme.borderRadius.md};
  color: ${props => props.theme.colors.warningText};
  font-size: 13px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  line-height: 1.4;
`;

const DomainCodeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: rgba(0, 0, 0, 0.4);
  padding: 6px 10px;
  border-radius: ${props => props.theme.borderRadius.sm};
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-family: monospace;
  font-size: 12px;
  justify-content: space-between;
`;

const CopyButton = styled.button`
  background: transparent;
  border: none;
  color: #fbbf24;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  padding: 4px 6px;
  border-radius: 4px;
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const ConsoleLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #60a5fa;
  text-decoration: underline;
  font-size: 12px;
  margin-top: 4px;
  &:hover {
    color: #93c5fd;
  }
`;

const GoogleButton = styled.button`
  width: 100%;
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background-color: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  &:hover:not(:disabled) {
    background-color: ${props => props.theme.colors.surfaceHover};
    border-color: ${props => props.theme.colors.primary};
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const UserCard = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.md};
  background-color: ${props => props.theme.colors.surfaceVariant};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
`;

const UserAvatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.primaryText};
  font-weight: 700;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
`;

const UserName = styled.span`
  font-size: 15px;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UserEmail = styled.span`
  font-size: 12px;
  color: ${props => props.theme.colors.textMuted};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const SessionBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  color: #10b981;
  margin-top: 2px;
`;

const PrimaryButton = styled.button`
  width: 100%;
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.primaryText};
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    filter: brightness(1.1);
    transform: translateY(-1px);
  }
`;

const SecondaryButton = styled.button`
  width: 100%;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: transparent;
  color: ${props => props.theme.colors.textMuted};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: ${props => props.theme.colors.text};
    border-color: ${props => props.theme.colors.textSecondary};
    background-color: ${props => props.theme.colors.surfaceHover};
  }
`;

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { signInWithGoogle, signOut, loading, user, firebaseUser } = useAuth();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isUnauthorizedDomain, setIsUnauthorizedDomain] = useState<boolean>(false);
  const [copiedDomain, setCopiedDomain] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';

  const handleCopyHostname = () => {
    if (currentHostname) {
      navigator.clipboard.writeText(currentHostname);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2500);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setErrorMsg(null);
      setIsUnauthorizedDomain(false);
      await signInWithGoogle();
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      const code = err?.code || '';
      const message = err?.message || '';

      if (code === 'auth/unauthorized-domain' || message.includes('unauthorized-domain')) {
        setIsUnauthorizedDomain(true);
        setErrorMsg('Domínio não autorizado pelo Firebase Authentication.');
      } else if (code === 'auth/popup-closed-by-user') {
        setErrorMsg('Janela de login fechada antes da confirmação.');
      } else {
        setErrorMsg(message || 'Falha ao autenticar com Google.');
      }
    }
  };

  const handleContinue = () => {
    if (onSuccess) onSuccess();
    onClose();
  };

  const activeUser = user || (firebaseUser ? {
    name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Sobrevivente',
    email: firebaseUser.email || '',
    avatarUrl: firebaseUser.photoURL || undefined,
  } : null);

  return (
    <Overlay onClick={onClose}>
      <ModalCard onClick={e => e.stopPropagation()}>
        <Header>
          <TitleArea>
            <ShieldCheck size={20} color="#EA580C" />
            <Title>{activeUser ? 'Sessão Conectada' : 'Acesso ao Esquadrão'}</Title>
          </TitleArea>
          <CloseButton onClick={onClose} aria-label="Fechar">
            <X size={18} />
          </CloseButton>
        </Header>

        <Content>
          {activeUser ? (
            <>
              <UserCard>
                <UserAvatar>
                  {activeUser.avatarUrl ? (
                    <img src={activeUser.avatarUrl} alt={activeUser.name} />
                  ) : (
                    activeUser.name.charAt(0).toUpperCase()
                  )}
                </UserAvatar>
                <UserInfo>
                  <UserName>{activeUser.name}</UserName>
                  <UserEmail>{activeUser.email}</UserEmail>
                  <SessionBadge>
                    <Check size={12} /> Conectado com Google
                  </SessionBadge>
                </UserInfo>
              </UserCard>

              <Description>
                Sua conta está sincronizada. Você pode criar esquadrões, salvar bases, gerenciar code locks e marcar pontos estratégicos em Nasdara.
              </Description>

              <PrimaryButton onClick={handleContinue}>
                Continuar no Mapa
              </PrimaryButton>

              <SecondaryButton onClick={async () => {
                await signOut();
              }}>
                Trocar de Conta / Desconectar
              </SecondaryButton>
            </>
          ) : (
            <>
              <Description>
                Entre com sua conta Google para sincronizar seu grupo e salvar as localizações no mapa de Nasdara.
              </Description>

              {isUnauthorizedDomain ? (
                <UnauthorizedDomainBox>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                    <AlertTriangle size={18} color="#f59e0b" />
                    <span>Domínio precisa ser autorizado no Firebase</span>
                  </div>
                  <div>
                    O Google Login bloqueou a conexão porque o domínio onde o app está hospedado ainda não foi liberado no console do Firebase.
                  </div>
                  <DomainCodeRow>
                    <span>{currentHostname || 'seu-app.vercel.app'}</span>
                    <CopyButton onClick={handleCopyHostname} type="button">
                      {copiedDomain ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                      {copiedDomain ? 'Copiado!' : 'Copiar'}
                    </CopyButton>
                  </DomainCodeRow>
                  <div style={{ fontSize: '12px' }}>
                    <strong>Como resolver em 1 minuto:</strong>
                    <ol style={{ paddingLeft: '18px', margin: '6px 0' }}>
                      <li>Acesse o Firebase Console do seu projeto.</li>
                      <li>Vá em <strong>Authentication</strong> &rarr; aba <strong>Settings (Configurações)</strong> &rarr; <strong>Authorized domains (Domínios autorizados)</strong>.</li>
                      <li>Clique em <strong>Add domain (Adicionar domínio)</strong> e cole o domínio acima.</li>
                    </ol>
                  </div>
                  <ConsoleLink
                    href="https://console.firebase.google.com/project/gen-lang-client-0517904499/authentication/settings"
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    Abrir Configurações do Firebase Console <ExternalLink size={13} />
                  </ConsoleLink>
                </UnauthorizedDomainBox>
              ) : (
                errorMsg && <ErrorBanner>{errorMsg}</ErrorBanner>
              )}

              <GoogleButton onClick={handleGoogleLogin} disabled={loading}>
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                {loading ? 'Conectando...' : 'Entrar com Google'}
              </GoogleButton>
            </>
          )}
        </Content>
      </ModalCard>
    </Overlay>
  );
};

