'use client';

import { useState, useMemo } from 'react';
import styled from 'styled-components';
import { ProtectedRoute } from '@/platform/routing/protected-route';
import { AppShell } from '@/platform/layout/AppShell';
import { useApplicationControllerFindAllQuery } from '@/platform/api/rtk-query/generated/api';
import { MetricsGrid } from './components/MetricsGrid';
import { FilterBar } from './components/FilterBar';
import { ApplicationRow, ApplicationItem } from './components/ApplicationRow';
import { InspectorPanel } from './components/InspectorPanel';

const ContentPane = styled.div`
  display: flex;
  flex-direction: column;
  gap: 28px;
  min-height: 0;
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const TitleArea = styled.div`
  h1 {
    font-size: 26px;
    font-weight: 600;
    letter-spacing: -0.5px;
    color: ${({ theme }) => theme.colors.text};
    margin: 0;
  }
  p {
    font-size: 14px;
    color: ${({ theme }) => theme.colors.textSecondary};
    margin-top: 4px;
  }
`;

const ActionsArea = styled.div`
  display: flex;
  gap: 12px;
`;

const FilterBtn = styled.button`
  background-color: ${({ theme }) => theme.colors.surfaceHover};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
  border-radius: 8px;
  font-size: 13px;
  padding: 8px 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-family: inherit;

  &:hover {
    background: ${({ theme }) => theme.colors.cardBg2};
  }
`;

const AddBtn = styled.button`
  background-color: ${({ theme }) => theme.colors.accent};
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 13.5px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-family: inherit;

  &:hover {
    background-color: ${({ theme }) => theme.colors.accentHover};
  }
`;

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 24px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 13px;
  line-height: 1.6;
`;

function ApplicationsContent() {
  const { data: allApps, isLoading } = useApplicationControllerFindAllQuery('');
  const [activeTab, setActiveTab] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const apps = useMemo(() => {
    if (!allApps) return [];
    return (allApps as any[]).map((a: any) => ({
      id: a.id,
      status: a.status,
      companyName: a.company?.name ?? a.companyName ?? '',
      companyDomain: a.company?.domain ?? a.companyDomain ?? null,
      companyLogo: a.company?.logoUrl ?? a.companyLogo ?? null,
      jobTitle: a.job?.title ?? a.jobTitle ?? null,
      createdAt: a.createdAt,
    })) as ApplicationItem[];
  }, [allApps]);

  const filtered = useMemo(() => {
    if (!activeTab) return apps;
    if (activeTab === 'active') return apps.filter(a => !['Closed', 'Rejected', 'Saved'].includes(a.status));
    if (activeTab === 'closed') return apps.filter(a => a.status === 'Closed' || a.status === 'Rejected');
    return apps.filter(a => a.status === activeTab);
  }, [apps, activeTab]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {
      '': apps.length,
      active: apps.filter(a => !['Closed', 'Rejected', 'Saved'].includes(a.status)).length,
      Interviewing: apps.filter(a => a.status === 'Interviewing').length,
      Offer: apps.filter(a => a.status === 'Offer').length,
      closed: apps.filter(a => a.status === 'Closed' || a.status === 'Rejected').length,
      Rejected: apps.filter(a => a.status === 'Rejected').length,
    };
    return c;
  }, [apps]);

  const metrics = useMemo(() => {
    const active = apps.filter(a => !['Closed', 'Rejected', 'Saved'].includes(a.status)).length;
    const interviewing = apps.filter(a => a.status === 'Interviewing').length;
    const offers = apps.filter(a => a.status === 'Offer').length;
    const closed = apps.filter(a => a.status === 'Closed' || a.status === 'Rejected').length;
    const responded = apps.filter(a => a.status !== 'Saved').length;
    const responseRate = apps.length > 0 ? Math.round((responded / apps.length) * 100) : 0;
    return { active, interviewing, responseRate, offers, closed };
  }, [apps]);

  if (isLoading) {
    return (
      <AppShell>
        <EmptyState>Loading applications...</EmptyState>
      </AppShell>
    );
  }

  return (
    <AppShell
      rightPanel={
        <InspectorPanel
          applicationId={selectedId}
          onClose={() => setSelectedId(null)}
        />
      }
    >
      <ContentPane>
        <HeaderRow>
          <TitleArea>
            <h1>Applications</h1>
            <p>Track your opportunities and let CareerOS handle the rest.</p>
          </TitleArea>
          <ActionsArea>
            <FilterBtn>Filter</FilterBtn>
            <AddBtn>+ Add application</AddBtn>
          </ActionsArea>
        </HeaderRow>

        <MetricsGrid
          active={metrics.active}
          interviewing={metrics.interviewing}
          responseRate={metrics.responseRate}
          offers={metrics.offers}
          closed={metrics.closed}
        />

        <FilterBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          counts={counts}
        />

        <ListContainer>
          {filtered.length === 0 ? (
            <EmptyState>
              No applications match this filter. Sync your email or use the browser extension to get started.
            </EmptyState>
          ) : (
            filtered.map((app) => (
              <ApplicationRow
                key={app.id}
                app={app}
                selected={selectedId === app.id}
                onSelect={setSelectedId}
              />
            ))
          )}
        </ListContainer>
      </ContentPane>
    </AppShell>
  );
}

export default function ApplicationsPage() {
  return (
    <ProtectedRoute>
      <ApplicationsContent />
    </ProtectedRoute>
  );
}
