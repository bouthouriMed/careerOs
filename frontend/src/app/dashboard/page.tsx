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
  const { user } = useAuth();
  const { data: syncStatus, isLoading: syncLoading, isError: syncError } = useEmailSyncControllerGetStatusQuery(undefined, {
    pollingInterval: 30000,
    skip: !user,
  });
  const { data: timelineData, isLoading: timelineLoading } = useApplicationControllerGetTimelineQuery(undefined, {
    skip: !user || syncStatus?.status !== 'completed',
  });

  useEffect(() => {
    if (!syncLoading && !syncError && syncStatus?.status === 'never_synced') {
      router.replace('/sync');
    }
  }, [syncStatus, syncLoading, syncError, router]);

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

  const isEmpty = !timelineLoading && allApps.length === 0 && !syncLoading;
  const loading = syncLoading || timelineLoading;

  const appsCount = allApps.length;
  const interviewsCount = allApps.filter((a) => a.status === 'Interview').length;
  const responseRate = allApps.length > 0
    ? Math.round(allApps.filter((a) => a.status !== 'Saved').length / allApps.length * 100)
    : 0;
  const offersCount = allApps.filter((a) => a.status === 'Offer').length;

  if (loading) {
    return (
      <AppShell rightPanel={<AIPanel isEmpty applications={[]} />}>
        <Section>
          <div style={{ padding: 40, textAlign: 'center', color: '#6B7A9E', fontSize: 13 }}>Loading your dashboard...</div>
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
