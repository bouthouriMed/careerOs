'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import styled, { keyframes } from 'styled-components';
import { useTranslation } from '@/platform/i18n/use-translation';
import { ProgressBar } from '@/platform/design-system/components/ProgressBar';
import {
  useEmailSyncControllerStartSyncMutation,
  useEmailSyncControllerGetStatusQuery,
} from '@/platform/api/rtk-query/generated/api';

/* ── Animations ── */

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
`;

/* ── Layout ── */

const Page = styled.main`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacing.xl};
`;

const Content = styled.div`
  width: 100%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxl};
  animation: ${fadeIn} 0.5s ease-out;
`;

/* ── Logo ── */

const Logo = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.text};
  letter-spacing: -0.02em;
`;

const LogoAccent = styled.span`
  color: ${({ theme }) => theme.colors.primary};
`;

/* ── Header ── */

const Header = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const Description = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
  line-height: 1.6;
  max-width: 360px;
`;

/* ── Progress ── */

const ProgressWrapper = styled.div`
  width: 100%;
`;

const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

/* ── Stages ── */

const StagesList = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

interface StageProps {
  $active: boolean;
  $completed: boolean;
}

const StageRow = styled.div<StageProps>`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ $active, theme }) => ($active ? theme.colors.primary + '06' : 'transparent')};
  border: 1px solid ${({ $active, $completed, theme }) =>
    $active ? theme.colors.primary + '20' : $completed ? theme.colors.success + '20' : 'transparent'};
  transition: all 0.3s ease;
  animation: ${({ $active }) => ($active ? fadeIn : 'none')} 0.3s ease-out;
`;

const StageIcon = styled.div<StageProps>`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  background: ${({ $completed, $active, theme }) =>
    $completed ? theme.colors.success : $active ? theme.colors.primary : theme.colors.surface};
  color: ${({ $completed, $active, theme }) =>
    $completed || $active ? theme.colors.textInverse : theme.colors.textSecondary};
  transition: all 0.3s ease;
  animation: ${({ $active }) => ($active ? pulse : 'none')} 2s ease-in-out infinite;
`;

const StageInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const StageTitle = styled.p<StageProps>`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ $active, $completed, theme }) =>
    $active ? theme.colors.text : $completed ? theme.colors.text : theme.colors.textSecondary};
  margin: 0 0 2px;
  transition: color 0.3s ease;
`;

const StageDesc = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
  line-height: 1.4;
`;

/* ── Status ── */

const StatusText = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
  animation: ${pulse} 2s ease-in-out infinite;
`;

/* ── Error State ── */

const ErrorCard = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.xl};
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.error}30;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
`;

const ErrorTitle = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.error};
  margin: 0;
`;

const ErrorDesc = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
`;

const RetryButton = styled.button`
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.lg}`};
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.textInverse};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
  }
`;

/* ── Stages Data ── */

const STAGES = ['connecting', 'discovering', 'organizing', 'preparing'] as const;

/* ── Page ── */

export default function SyncPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [startSync] = useEmailSyncControllerStartSyncMutation();
  const { data: syncStatus } = useEmailSyncControllerGetStatusQuery(undefined, {
    pollingInterval: 2000,
  });

  const status = syncStatus?.status;
  const scanned = syncStatus?.emailsScanned ?? 0;
  const created = syncStatus?.applicationsCreated ?? 0;

  /* Auto-start sync if not started */
  useEffect(() => {
    if (status === 'never_synced') {
      startSync();
    }
  }, [status, startSync]);

  /* Redirect to dashboard when complete */
  useEffect(() => {
    if (status === 'completed') {
      const timer = setTimeout(() => router.replace('/dashboard'), 1200);
      return () => clearTimeout(timer);
    }
  }, [status, router]);

  const { currentStage, progress } = useMemo(() => {
    if (status === 'pending' || (status === 'in_progress' && scanned === 0)) {
      return { currentStage: 0, progress: 10 };
    }
    if (status === 'in_progress' && scanned > 0 && created === 0) {
      return { currentStage: 1, progress: 35 };
    }
    if (status === 'in_progress' && created > 0) {
      return { currentStage: 2, progress: 65 };
    }
    if (status === 'completed') {
      return { currentStage: 4, progress: 100 };
    }
    return { currentStage: 0, progress: 0 };
  }, [status, scanned, created]);

  const isComplete = status === 'completed';
  const isFailed = status === 'failed';

  /* ── Render ── */

  return (
    <Page>
      <Content>
        <Logo>
          Career<LogoAccent>OS</LogoAccent>
        </Logo>

        {isFailed ? (
          <ErrorCard>
            <ErrorTitle>{t('platform.sync.status.failed')}</ErrorTitle>
            <ErrorDesc>{t('platform.sync.status.failed')}</ErrorDesc>
            <RetryButton onClick={() => startSync()}>
              {t('platform.sync.status.retry')}
            </RetryButton>
          </ErrorCard>
        ) : (
          <>
            <Header>
              <Title>{t('platform.sync.title')}</Title>
              {!isComplete && <Description>{t('platform.sync.description')}</Description>}
            </Header>

            <ProgressWrapper>
              <ProgressLabel>
                <span>{isComplete ? t('platform.sync.status.complete') : ''}</span>
              </ProgressLabel>
              <ProgressBar progress={progress} animated />
            </ProgressWrapper>

            <StagesList>
              {STAGES.map((stageKey, index) => {
                const active = index === currentStage && !isComplete;
                const completed = index < currentStage || isComplete;

                return (
                  <StageRow key={stageKey} $active={active} $completed={completed}>
                    <StageIcon $active={active} $completed={completed}>
                      {completed ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : active ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                        </svg>
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </StageIcon>
                    <StageInfo>
                      <StageTitle $active={active} $completed={completed}>
                        {t(`platform.sync.stages.${stageKey}`)}
                      </StageTitle>
                      {(active || completed) && (
                        <StageDesc>
                          {t(`platform.sync.stages.${stageKey}Desc`)}
                        </StageDesc>
                      )}
                    </StageInfo>
                  </StageRow>
                );
              })}
            </StagesList>

            {!isComplete && (
              <StatusText>{t('platform.sync.status.inProgress')}</StatusText>
            )}

            {isComplete && (
              <StatusText style={{ animation: 'none', color: '#16A34A' }}>
                {t('platform.sync.status.completeDesc')}
              </StatusText>
            )}
          </>
        )}
      </Content>
    </Page>
  );
}
