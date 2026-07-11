'use client';

import styled from 'styled-components';
import { InterviewCard, InterviewItem } from './InterviewCard';

const Section = styled.div`
  margin-bottom: 24px;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
`;

const SectionTitle = styled.h3`
  font-size: 15px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const Count = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
  background: ${({ theme }) => theme.colors.surfaceHover};
  padding: 2px 8px;
  border-radius: 6px;
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const EmptyMsg = styled.div`
  text-align: center;
  padding: 40px 24px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 13px;
  line-height: 1.6;
`;

function groupInterviews(interviews: InterviewItem[]) {
  const upcoming = interviews.filter(i => i.status === 'Scheduled');
  const completed = interviews.filter(i => i.status === 'Completed');
  const cancelled = interviews.filter(i => i.status === 'Cancelled' || i.status === 'FeedbackReceived');
  return { upcoming, completed, cancelled };
}

export function InterviewList({
  interviews,
  selectedId,
  onSelect,
}: {
  interviews: InterviewItem[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}) {
  const { upcoming, completed, cancelled } = groupInterviews(interviews);

  if (interviews.length === 0) {
    return (
      <EmptyMsg>
        No interviews found. They{"'"}ll appear here once extracted from your emails or added manually.
      </EmptyMsg>
    );
  }

  return (
    <>
      {upcoming.length > 0 && (
        <Section>
          <SectionHeader>
            <SectionTitle>Upcoming</SectionTitle>
            <Count>{upcoming.length}</Count>
          </SectionHeader>
          <List>
            {upcoming.map(iv => (
              <InterviewCard
                key={iv.id}
                interview={iv}
                selected={selectedId === iv.id}
                onSelect={onSelect}
              />
            ))}
          </List>
        </Section>
      )}

      {completed.length > 0 && (
        <Section>
          <SectionHeader>
            <SectionTitle>Completed</SectionTitle>
            <Count>{completed.length}</Count>
          </SectionHeader>
          <List>
            {completed.map(iv => (
              <InterviewCard
                key={iv.id}
                interview={iv}
                selected={selectedId === iv.id}
                onSelect={onSelect}
              />
            ))}
          </List>
        </Section>
      )}

      {cancelled.length > 0 && (
        <Section>
          <SectionHeader>
            <SectionTitle>Cancelled / Other</SectionTitle>
            <Count>{cancelled.length}</Count>
          </SectionHeader>
          <List>
            {cancelled.map(iv => (
              <InterviewCard
                key={iv.id}
                interview={iv}
                selected={selectedId === iv.id}
                onSelect={onSelect}
              />
            ))}
          </List>
        </Section>
      )}
    </>
  );
}
