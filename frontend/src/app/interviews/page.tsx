'use client';

import { useMemo, useState } from 'react';
import styled from 'styled-components';
import { ProtectedRoute } from '@/platform/routing/protected-route';
import { AppShell } from '@/platform/layout/AppShell';
import { useInterviewControllerFindQuery } from '@/platform/api/rtk-query/generated/api';
import { InterviewCard, InterviewItem } from './components/InterviewCard';
import { InterviewList } from './components/InterviewList';
import { InterviewStatsBar } from './components/InterviewStatsBar';
import { NextInterviewHero } from './components/NextInterviewHero';
import { InterviewDetailPanel } from './components/InterviewDetailPanel';

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

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 24px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 13px;
  line-height: 1.6;
`;

const LoadingSpinner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 24px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 13px;
`;

function InterviewsContent() {
  const { data: rawInterviews, isLoading } = useInterviewControllerFindQuery('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const interviews = useMemo(() => {
    if (!rawInterviews) return [];
    return (rawInterviews as any[]).map((iv: any) => ({
      id: iv.id,
      type: iv.type,
      status: iv.status,
      scheduledAt: iv.scheduledAt,
      durationMinutes: iv.durationMinutes,
      location: iv.location,
      meetingUrl: iv.meetingUrl,
      round: iv.round,
      feedback: iv.feedback,
      application: {
        id: iv.application?.id || '',
        status: iv.application?.status || '',
        company: {
          id: iv.application?.company?.id || '',
          name: iv.application?.company?.name || 'Unknown',
          domain: iv.application?.company?.domain,
          logoUrl: iv.application?.company?.logoUrl,
        },
        job: iv.application?.job ? {
          id: iv.application.job.id,
          title: iv.application.job.title,
          location: iv.application.job.location,
        } : null,
      },
    })) as InterviewItem[];
  }, [rawInterviews]);

  const nextInterview = useMemo(() => {
    const upcoming = interviews.filter(i => i.status === 'Scheduled');
    return upcoming.length > 0 ? upcoming[0] : null;
  }, [interviews]);

  if (isLoading) {
    return (
      <AppShell>
        <LoadingSpinner>Loading interviews...</LoadingSpinner>
      </AppShell>
    );
  }

  return (
    <AppShell
      rightPanel={<InterviewDetailPanel interviews={interviews} />}
    >
      <ContentPane>
        <HeaderRow>
          <TitleArea>
            <h1>Interviews</h1>
            <p>Prepare for upcoming interviews and review past sessions.</p>
          </TitleArea>
          <AddBtn>+ Add interview</AddBtn>
        </HeaderRow>

        <NextInterviewHero interview={nextInterview} />

        <InterviewStatsBar interviews={interviews} />

        <InterviewList
          interviews={interviews}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </ContentPane>
    </AppShell>
  );
}

export default function InterviewsPage() {
  return (
    <ProtectedRoute>
      <InterviewsContent />
    </ProtectedRoute>
  );
}
