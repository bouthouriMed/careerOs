'use client';

import { useEffect, useMemo, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { ProtectedRoute } from '@/platform/routing/protected-route';
import { AppShell } from '@/platform/layout/AppShell';
import { useAuth } from '@/platform/auth/hooks/use-auth';
import {
  useEmailSyncControllerGetStatusQuery,
  useEmailSyncControllerStartSyncMutation,
  useApplicationControllerGetTimelineQuery,
  useSignalControllerFindActiveQuery,
} from '@/platform/api/rtk-query/generated/api';
import { HeroFocus } from './components/HeroFocus';
import { WhatsNext } from './components/WhatsNext';
import { Momentum } from './components/Momentum';
import { AIPanel } from './components/AIPanel';

const pulse = keyframes`
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
`;

const Section = styled.section`
  margin-bottom: 0;
`;

const WelcomeRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const WelcomeText = styled.div`
  h1 {
    font-size: 26px;
    font-weight: 600;
    letter-spacing: -0.5px;
    color: ${({ theme }) => theme.colors.text};
    margin: 0;
  }
  p {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 14px;
    margin: 4px 0 0;
  }
`;

const AddBtn = styled.button`
  background: ${({ theme }) => theme.colors.surfaceHover};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;

  &:hover {
    background: ${({ theme }) => theme.colors.cardBg2};
  }
`;

const SectionLabel = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin-top: 8px;
  margin-bottom: 16px;
`;

const SyncOverlay = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 24px;
  text-align: center;
`;

const SyncIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 16px;
  background: ${({ theme }) => theme.colors.primaryMuted};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
`;

const SyncTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 8px;
`;

const SyncMessage = styled.p`
  font-size: 13px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.textMuted};
  margin: 0 0 4px;
  max-width: 360px;
`;

const SyncCount = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.primary};
  margin-top: 16px;
  animation: ${pulse} 2s ease-in-out infinite;
`;

const messages = [
  'Gathering your career history...',
  'Scanning your inbox for applications...',
  'Organizing your hard work...',
  'Spotting your upcoming interviews...',
  'Building your career timeline...',
  'Almost there, finding your offers...',
];

interface SignalCompany {
  id: string;
  name: string;
  logoUrl: string | null;
}

interface SignalJob {
  id: string;
  title: string;
}

interface SignalApplication {
  id: string;
  status: string;
  company: SignalCompany;
  job: SignalJob | null;
}

export interface Signal {
  id: string;
  type: string;
  priority: string;
  status: string;
  title: string;
  description: string;
  confidence: number;
  applicationId?: string;
  companyId?: string;
  surfaces: string[];
  expiresAt?: string;
  createdAt: string;
  company?: SignalCompany;
  application?: SignalApplication;
}

const priorityOrder: Record<string, number> = {
  Critical: 0,
  High: 1,
  Medium: 2,
  Low: 3,
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function DashboardContent() {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] || 'there';
  const [startSync] = useEmailSyncControllerStartSyncMutation();
  const [msgIndex, setMsgIndex] = useState(0);
  const { data: syncStatus, isLoading: syncLoading } = useEmailSyncControllerGetStatusQuery(undefined, {
    skip: !user,
  });

  const syncStatusValue = syncStatus?.status as string | undefined;
  const syncReady = syncStatusValue === 'completed' || syncStatusValue === 'error';

  const { data: timelineData, isLoading: timelineLoading } = useApplicationControllerGetTimelineQuery(undefined, {
    skip: !user || !syncReady,
  });
  const { data: activeSignals } = useSignalControllerFindActiveQuery(undefined, {
    skip: !user || !syncReady,
  });

  useEffect(() => {
    if (user && syncStatus && !syncLoading) {
      if (syncStatus.status === 'never_synced') {
        startSync();
      }
    }
  }, [user, syncStatus, syncLoading, startSync]);

  useEffect(() => {
    if (!syncLoading && syncStatus?.status === 'pending') {
      const interval = setInterval(() => {
        setMsgIndex((prev) => (prev + 1) % messages.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [syncLoading, syncStatus?.status]);

  const allApps = useMemo(() => {
    if (!timelineData) return [];
    const t = timelineData as { timeline: Array<{ date: string; applications: Array<{
      id: string;
      status: string;
      companyName: string;
      companyDomain?: string | null;
      companyLogo?: string | null;
      jobTitle?: string | null;
      createdAt: string;
    }> }> };
    return t.timeline.flatMap((entry) => entry.applications);
  }, [timelineData]);

  const signals = useMemo(() => {
    if (!activeSignals) return [];
    return (activeSignals as Signal[]).filter(s => s.status === 'Active');
  }, [activeSignals]);

  const topSignal = useMemo(() => {
    if (signals.length === 0) return null;
    return [...signals].sort((a, b) => (priorityOrder[a.priority] ?? 99) - (priorityOrder[b.priority] ?? 99))[0];
  }, [signals]);

  const isEmpty = syncStatus?.status === 'never_synced' || (syncReady && !timelineLoading && allApps.length === 0);
  const isPending = syncStatus?.status === 'pending';

  const appsCount = allApps.length;
  const interviewsCount = allApps.filter((a) => a.status === 'Interviewing' || a.status === 'Interview').length;
  const offersCount = allApps.filter((a) => a.status === 'Offer').length;
  const responseRate = allApps.length > 0
    ? Math.round(allApps.filter((a) => a.status !== 'Saved').length / allApps.length * 100)
    : 0;

  if (isPending || (syncLoading && !syncStatus)) {
    return (
      <AppShell rightPanel={<AIPanel />}>
        <Section>
          <HeroFocus isEmpty syncEmailsScanned={syncStatus?.emailsScanned} />
        </Section>

        <Section>
          <SyncOverlay>
            <SyncIcon>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
              </svg>
            </SyncIcon>
            <SyncTitle>We{"'"}re setting up your CareerOS</SyncTitle>
            <SyncMessage>{messages[msgIndex]}</SyncMessage>
            <SyncCount>
              {syncStatus?.emailsScanned ?? 0} emails scanned
              {syncStatus?.applicationsDetected ? ` · ${syncStatus.applicationsDetected} applications found` : ''}
            </SyncCount>
          </SyncOverlay>
        </Section>
      </AppShell>
    );
  }

  return (
    <AppShell rightPanel={<AIPanel signals={signals} />}>
      <WelcomeRow>
        <WelcomeText>
          <h1>{getGreeting()}, {firstName}</h1>
          <p>Here&apos;s what matters most right now.</p>
        </WelcomeText>
        <AddBtn>+ Add something</AddBtn>
      </WelcomeRow>

      <Section>
        <HeroFocus isEmpty={isEmpty} signal={topSignal} />
      </Section>

      <Section>
        <SectionLabel>What&apos;s next</SectionLabel>
        <WhatsNext signals={signals} />
      </Section>

      {!isEmpty && (
        <Section>
          <Momentum
            applications={appsCount}
            interviews={interviewsCount}
            responseRate={responseRate}
            offers={offersCount}
          />
        </Section>
      )}
    </AppShell>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
