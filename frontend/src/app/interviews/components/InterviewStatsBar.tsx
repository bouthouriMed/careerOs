'use client';

import styled from 'styled-components';
import { InterviewItem } from './InterviewCard';

const Bar = styled.div`
  background-color: ${({ theme }) => theme.colors.cardBg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 14px;
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Left = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const IconBg = styled.div`
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.accentMuted};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.accent};
  font-size: 18px;
`;

const TextBlock = styled.div`
  h4 {
    font-size: 15px;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
    margin: 0 0 2px;
  }
  p {
    font-size: 12px;
    color: ${({ theme }) => theme.colors.textSecondary};
    margin: 0;
    line-height: 1.4;
  }
`;

const Stats = styled.div`
  display: flex;
  gap: 40px;
`;

const StatBox = styled.div`
  text-align: center;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 4px;
`;

const StatValue = styled.div`
  font-size: 22px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
`;

const StatChange = styled.div<{ $positive?: boolean }>`
  font-size: 11px;
  color: ${({ $positive, theme }) => $positive ? theme.colors.accent : theme.colors.error};
  font-weight: 600;
  margin-top: 2px;
`;

export function InterviewStatsBar({ interviews }: { interviews: InterviewItem[] }) {
  const total = interviews.length;
  const upcoming = interviews.filter(i => i.status === 'Scheduled').length;
  const completed = interviews.filter(i => i.status === 'Completed').length;
  const cancelled = interviews.filter(i => i.status === 'Cancelled').length;

  return (
    <Bar>
      <Left>
        <IconBg>↗</IconBg>
        <TextBlock>
          <h4>Interview tracker</h4>
          <p>
            {upcoming > 0
              ? `You have ${upcoming} upcoming interview${upcoming > 1 ? 's' : ''}. Stay prepared!`
              : total > 0
                ? `You've completed ${completed} interview${completed > 1 ? 's' : ''}. Keep going!`
                : 'Start tracking your interviews to see stats here.'}
          </p>
        </TextBlock>
      </Left>

      <Stats>
        <StatBox>
          <StatLabel>Total</StatLabel>
          <StatValue>{total}</StatValue>
        </StatBox>
        <StatBox>
          <StatLabel>Upcoming</StatLabel>
          <StatValue>{upcoming}</StatValue>
          {upcoming > 0 && <StatChange $positive>Active</StatChange>}
        </StatBox>
        <StatBox>
          <StatLabel>Completed</StatLabel>
          <StatValue>{completed}</StatValue>
        </StatBox>
        <StatBox>
          <StatLabel>Cancelled</StatLabel>
          <StatValue>{cancelled}</StatValue>
        </StatBox>
      </Stats>
    </Bar>
  );
}
