'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { ProtectedRoute } from '@/platform/routing/protected-route';
import { AppShell } from '@/platform/layout/AppShell';
import { useAuth } from '@/platform/auth/hooks/use-auth';
import {
  useEmailSyncControllerGetStatusQuery,
  useApplicationControllerGetTimelineQuery,
} from '@/platform/api/rtk-query/generated/api';
import { HeroFocus } from './components/HeroFocus';
import { MetricsRow } from './components/MetricsRow';
import { QuickActions } from './components/QuickActions';
import { Pipeline } from './components/Pipeline';
import { CareerTimeline } from './components/CareerTimeline';
import { AIPanel } from './components/AIPanel';

const Section = styled.section`
  margin-bottom: 0;
`;

function DashboardContent() {
  const router = useRouter();
  useAuth();
  const { data: syncStatus } = useEmailSyncControllerGetStatusQuery(undefined, {
    pollingInterval: 3000,
  });
  const { data: timelineData } = useApplicationControllerGetTimelineQuery(undefined, {
    skip: syncStatus?.status !== 'completed',
  });

  useEffect(() => {
    if (syncStatus?.status === 'never_synced' || syncStatus?.status === 'pending') {
      router.replace('/sync');
    }
  }, [syncStatus, router]);

  const timeline = useMemo(
    () =>
      (timelineData as { timeline: Array<{ date: string; applications: Array<{ id: string; status: string; companyName?: string; jobTitle?: string; createdAt: string }> }> } | undefined)
        ?.timeline ?? [],
    [timelineData],
  );

  const allApps = useMemo(
    () => timeline.flatMap((entry) => entry.applications),
    [timeline],
  );

  const isEmpty = allApps.length === 0;

  const appsCount = allApps.length;
  const interviewsCount = allApps.filter((a) => a.status === 'Interview').length;
  const responseRate = allApps.length > 0
    ? Math.round(allApps.filter((a) => a.status !== 'Saved').length / allApps.length * 100)
    : 0;
  const offersCount = allApps.filter((a) => a.status === 'Offer').length;

  return (
    <AppShell rightPanel={<AIPanel isEmpty={isEmpty} />}>
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
          <Pipeline />
        </Section>
      )}

      <Section>
        <CareerTimeline isEmpty={isEmpty} />
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
