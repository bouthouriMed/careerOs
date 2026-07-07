'use client';

import styled from 'styled-components';
import { useTranslation } from '@/platform/i18n/use-translation';
import { useAuth } from '@/platform/auth/hooks/use-auth';
import { Button } from '@/platform/design-system/components/Button';

const StyledHeader = styled.header`
  height: 64px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 ${({ theme }) => theme.spacing.xl};
  background: ${({ theme }) => theme.colors.background};
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const UserName = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  return (
    <StyledHeader>
      <Title>{title}</Title>
      <Actions>
        <UserName>{user?.name || user?.email}</UserName>
        <Button variant="ghost" size="sm" onClick={() => logout()}>
          {t('platform.auth.logout.button')}
        </Button>
      </Actions>
    </StyledHeader>
  );
}
