'use client';

import styled from 'styled-components';
import { InterviewItem } from './InterviewCard';

const Panel = styled.aside`
  background-color: ${({ theme }) => theme.colors.sidebarBg};
  border-left: 1px solid ${({ theme }) => theme.colors.borderLight};
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  gap: 28px;
  overflow-y: auto;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: ${({ theme }) => theme.colors.scrollbarThumb}; border-radius: 4px; }
  &::-webkit-scrollbar-thumb:hover { background: ${({ theme }) => theme.colors.scrollbarThumbHover}; }
`;

const SectionTitle = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 15px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 16px;
`;

const ViewLink = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;

  &:hover { color: ${({ theme }) => theme.colors.text}; }
`;

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: ${({ theme }) => theme.colors.surfaceHover};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  padding: 14px;
  cursor: pointer;
  transition: background 0.15s;

  &:hover { background-color: ${({ theme }) => theme.colors.cardBg2}; }
`;

const RowLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const RowIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.surfaceHover};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
`;

const RowText = styled.div`
  h5 {
    font-size: 13px;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
    margin: 0;
  }
  p {
    font-size: 12px;
    color: ${({ theme }) => theme.colors.textSecondary};
    margin: 1px 0 0;
  }
  span {
    font-size: 11px;
    color: ${({ theme }) => theme.colors.textMuted};
    display: block;
    margin-top: 4px;
  }
`;

const Chevron = styled.span`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 14px;
`;

const InsightCard = styled.div`
  background: linear-gradient(180deg, ${({ theme }) => theme.colors.surfaceHover} 0%, transparent 100%);
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  padding: 20px;
`;

const InsightTitle = styled.h6<{ $color: string }>`
  font-size: 14px;
  font-weight: 600;
  color: ${({ $color }) => $color};
  margin: 0 0 12px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const InsightText = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.5;
  margin: 0 0 18px;
`;

const InsightBtn = styled.button`
  width: 100%;
  background: ${({ theme }) => theme.colors.surfaceHover};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
  padding: 10px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;

  &:hover { background: ${({ theme }) => theme.colors.cardBg2}; }
`;

const ActionItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 8px;
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  border-radius: 6px;

  &:hover { background-color: ${({ theme }) => theme.colors.surfaceHover}; }
`;

function getCompanyColor(name: string): string {
  const colors = [
    '#635bff', '#00ca72', '#f97316', '#a855f7', '#3b82f6',
    '#ef4444', '#06b6d4', '#8b5cf6', '#ec4899', '#14b8a6',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function formatWhen(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays > 0) return `In ${diffDays} days`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function InterviewDetailPanel({ interviews }: { interviews: InterviewItem[] }) {
  const upcoming = interviews
    .filter(i => i.status === 'Scheduled')
    .slice(0, 3);

  const completed = interviews.filter(i => i.status === 'Completed').length;

  return (
    <Panel>
      <div>
        <SectionTitle>
          <span>Up next</span>
          <ViewLink>View calendar</ViewLink>
        </SectionTitle>
        <Stack>
          {upcoming.length === 0 ? (
            <RowText>
              <p>No upcoming interviews</p>
            </RowText>
          ) : (
            upcoming.map(iv => (
              <Row key={iv.id}>
                <RowLeft>
                  <RowIcon style={{ color: getCompanyColor(iv.application.company.name) }}>
                    {iv.type === 'Video' ? '📹' : iv.type === 'Phone' ? '📞' : '🏢'}
                  </RowIcon>
                  <RowText>
                    <h5>{iv.application.company.name}</h5>
                    <p>{iv.round || iv.type}</p>
                    <span>{formatWhen(iv.scheduledAt)}</span>
                  </RowText>
                </RowLeft>
                <Chevron>›</Chevron>
              </Row>
            ))
          )}
        </Stack>
      </div>

      <InsightCard>
        <InsightTitle $color="#00ca72">↗ Interview insight</InsightTitle>
        <InsightText>
          {completed > 0
            ? `You've completed ${completed} interview${completed > 1 ? 's' : ''}. Keep tracking to see trends.`
            : 'Complete your first interview to see insights and trends here.'}
        </InsightText>
        <InsightBtn>View full insight</InsightBtn>
      </InsightCard>

      <InsightCard>
        <InsightTitle $color="#eab308">⚡ Focus suggestion</InsightTitle>
        <InsightText>
          Track all your interviews to get personalized preparation suggestions based on your interview history.
        </InsightText>
        <InsightBtn>Create study plan</InsightBtn>
      </InsightCard>

      <div>
        <SectionTitle><span>Quick actions</span></SectionTitle>
        <Stack style={{ gap: '4px' }}>
          <ActionItem>
            <span>📋 Prepare for interview</span>
            <Chevron>›</Chevron>
          </ActionItem>
          <ActionItem>
            <span>📊 Compare offers</span>
            <Chevron>›</Chevron>
          </ActionItem>
          <ActionItem>
            <span>📝 Improve resume</span>
            <Chevron>›</Chevron>
          </ActionItem>
        </Stack>
      </div>
    </Panel>
  );
}
