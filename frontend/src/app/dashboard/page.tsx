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
} from '@/platform/api/rtk-query/generated/api';
import { HeroFocus } from './components/HeroFocus';
import { MetricsRow } from './components/MetricsRow';
import { QuickActions } from './components/QuickActions';
import { Pipeline } from './components/Pipeline';
import { CareerTimeline } from './components/CareerTimeline';
import { AIPanel } from './components/AIPanel';

const pulse = keyframes`
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
`;

const Section = styled.section`
  margin-bottom: 0;
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
  background: rgba(79, 142, 247, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
`;

const SyncTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: #E8EBF4;
  margin: 0 0 8px;
`;

const SyncMessage = styled.p`
  font-size: 13px;
  line-height: 1.6;
  color: #6B7A9E;
  margin: 0 0 4px;
  max-width: 360px;
`;

const SyncCount = styled.div`
  font-size: 12px;
  color: #4F8EF7;
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

function DashboardContent() {
  const { user } = useAuth();
  const [startSync] = useEmailSyncControllerStartSyncMutation();
  const [msgIndex, setMsgIndex] = useState(0);
  const { data: syncStatus, isLoading: syncLoading } = useEmailSyncControllerGetStatusQuery(undefined, {
    pollingInterval: 5000,
    skip: !user,
  });
  const { data: timelineData, isLoading: timelineLoading } = useApplicationControllerGetTimelineQuery(undefined, {
    skip: !user || syncStatus?.status !== 'completed',
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

  const timeline = useMemo(() => {
    if (!timelineData) return [];
    const t = timelineData as { timeline: Array<{ date: string; applications: Array<Record<string, unknown>> }> };
    return t.timeline ?? [];
  }, [timelineData]);

  const allApps = useMemo(
    () => timeline.flatMap((entry) => entry.applications) as Array<{
      id: string;
      status: string;
      companyName?: string;
      companyDomain?: string | null;
      companyLogo?: string | null;
      jobTitle?: string | null;
      createdAt: string;
    }>,
    [timeline],
  );

  const isEmpty = syncStatus?.status === 'never_synced' || (syncStatus?.status === 'completed' && !timelineLoading && allApps.length === 0);
  const isPending = syncStatus?.status === 'pending';

  const appsCount = allApps.length;
  const interviewsCount = allApps.filter((a) => a.status === 'Interviewing' || a.status === 'Interview').length;
  const responseRate = allApps.length > 0
    ? Math.round(allApps.filter((a) => a.status !== 'Saved').length / allApps.length * 100)
    : 0;
  const offersCount = allApps.filter((a) => a.status === 'Offer').length;

  if (isPending || (syncLoading && !syncStatus)) {
    return (
      <AppShell rightPanel={<AIPanel isEmpty applications={[]} />}>
        <Section>
          <HeroFocus isEmpty syncEmailsScanned={syncStatus?.emailsScanned} syncAppsDetected={syncStatus?.applicationsDetected} />
        </Section>

        <Section>
          <SyncOverlay>
            <SyncIcon>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4F8EF7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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

        <Section>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: '#E8EBF4', margin: '0 0 12px' }}>Application Pipeline</h3>
          <Pipeline applications={[]} loading />
        </Section>

        <Section>
          <CareerTimeline isEmpty applications={[]} loading />
        </Section>
      </AppShell>
    );
  }

  return (
    <AppShell rightPanel={<AIPanel isEmpty={isEmpty} applications={allApps} />}>
      <Section>
        <HeroFocus isEmpty={isEmpty} />
      </Section>

      <Section>
        <MetricsRow
          applications={appsCount}
          interviews={interviewsCount}
          responseRate={responseRate}
          offers={offersCount}
        />
      </Section>

      <Section>
        <QuickActions />
      </Section>

      {!isEmpty && (
        <Section>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: '#E8EBF4', margin: '0 0 12px' }}>Application Pipeline</h3>
          <Pipeline applications={allApps} />
        </Section>
      )}

      <Section>
        <CareerTimeline isEmpty={isEmpty} applications={allApps} />
      </Section>
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
