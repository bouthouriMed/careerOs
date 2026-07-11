'use client';

import styled from 'styled-components';
import type { Signal } from '../page';

const Panel = styled.aside`
  border-left: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.panelBg};
  display: flex;
  flex-direction: column;
  padding: 40px 24px;
  overflow-y: auto;
  gap: 32px;

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

const ViewLink = styled.a`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-decoration: none;
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }
`;

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const InteractiveRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: ${({ theme }) => theme.colors.surfaceHover};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  padding: 14px;
  cursor: pointer;
  transition: background-color 0.1s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.surfaceHover};
  }
`;

const RowMainWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const RowIconPlate = styled.div<{ $color?: string }>`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.borderLight};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ $color }) => $color || '#8591a3'};
  font-size: 16px;
`;

const RowTxtWrap = styled.div`
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

const RowArrow = styled.span`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 14px;
`;

const InsightCard = styled.div`
  background: linear-gradient(180deg, ${({ theme }) => theme.colors.surfaceHover} 0%, transparent 100%);
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  padding: 20px;
`;

const InsightHeader = styled.h6<{ $color: string }>`
  font-size: 14px;
  font-weight: 600;
  color: ${({ $color }) => $color};
  margin: 0 0 12px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const InsightBody = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.5;
  margin: 0 0 18px;

  span {
    color: ${({ theme }) => theme.colors.text};
  }
`;

const DarkBtn = styled.button`
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
  transition: background 0.15s;

  &:hover {
    background: ${({ theme }) => theme.colors.cardBg2};
  }
`;

const ActionStripItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 8px;
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  transition: background-color 0.1s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.surfaceHover};
    border-radius: 6px;
  }
`;

const ActionArrow = styled.span`
  color: ${({ theme }) => theme.colors.textMuted};
`;

const EmptyPanel = styled.p`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 13px;
  line-height: 1.5;
  margin: 0;
  text-align: center;
  padding: 20px 0;
`;

interface AIPanelProps {
  signals?: Signal[];
}

function getSignalIcon(type: string): { emoji: string; color: string } {
  switch (type) {
    case 'Action': return { emoji: '📅', color: '#a855f7' };
    case 'Reminder': return { emoji: '🔔', color: '#f97316' };
    case 'Insight': return { emoji: '💡', color: '#0ea5e9' };
    case 'Offer': return { emoji: '⭐', color: '#00ca72' };
    default: return { emoji: '●', color: '#8591a3' };
  }
}

function getSignalTypeLabel(type: string): string {
  switch (type) {
    case 'Action': return 'Interview';
    case 'Reminder': return 'Reminder';
    case 'Insight': return 'Update';
    case 'Offer': return 'Offer';
    default: return 'Signal';
  }
}

function formatTimeUntil(dateStr: string): string {
  const diff = new Date(dateStr).getTime() - Date.now();
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days < 0) return 'Overdue';
  if (days === 0 && hours < 1) return 'Soon';
  if (days === 0) return `In ${hours}h`;
  if (days === 1) return 'Tomorrow';
  return `In ${days} days`;
}

export function AIPanel({ signals = [] }: AIPanelProps) {
  const interviewSignals = signals.filter(s => s.type === 'Action');
  const otherSignals = signals.filter(s => s.type !== 'Action');
  const highPriority = signals.filter(s => s.priority === 'Critical' || s.priority === 'High');
  const hasData = signals.length > 0;

  return (
    <Panel>
      <div>
        <SectionTitle>
          <span>Up next</span>
          <ViewLink href="#">View all signals</ViewLink>
        </SectionTitle>
        <Stack>
          {hasData ? (
            <>
              {interviewSignals.slice(0, 3).map((signal) => {
                const icon = getSignalIcon(signal.type);
                const company = signal.company?.name || 'Company';
                const label = getSignalTypeLabel(signal.type);
                const when = signal.expiresAt ? formatTimeUntil(signal.expiresAt) : 'Pending';
                return (
                  <InteractiveRow key={signal.id}>
                    <RowMainWrap>
                      <RowIconPlate $color={icon.color}>{icon.emoji}</RowIconPlate>
                      <RowTxtWrap>
                        <h5>{label}</h5>
                        <p>{company}</p>
                        <span>{when}</span>
                      </RowTxtWrap>
                    </RowMainWrap>
                    <RowArrow>›</RowArrow>
                  </InteractiveRow>
                );
              })}
              {otherSignals.slice(0, 2).map((signal) => {
                const icon = getSignalIcon(signal.type);
                const company = signal.company?.name || 'Company';
                const label = getSignalTypeLabel(signal.type);
                const when = signal.expiresAt ? formatTimeUntil(signal.expiresAt) : 'Pending';
                return (
                  <InteractiveRow key={signal.id}>
                    <RowMainWrap>
                      <RowIconPlate $color={icon.color}>{icon.emoji}</RowIconPlate>
                      <RowTxtWrap>
                        <h5>{label}</h5>
                        <p>{company}</p>
                        <span>{when}</span>
                      </RowTxtWrap>
                    </RowMainWrap>
                    <RowArrow>›</RowArrow>
                  </InteractiveRow>
                );
              })}
            </>
          ) : (
            <EmptyPanel>
              Signals will appear here as your applications progress.
            </EmptyPanel>
          )}
        </Stack>
      </div>

      {hasData ? (
        <InsightCard>
          <InsightHeader $color="#00ca72">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
            </svg>
            Career insight
          </InsightHeader>
          <InsightBody>
            You have {signals.length} active signal{signals.length > 1 ? 's' : ''} across your applications.
            {highPriority.length > 0 && (
              <> {highPriority.length} need{highPriority.length === 1 ? 's' : ''} your immediate attention.</>
            )}
            <br /><br />
            <span>
              {highPriority.length > 0
                ? 'Acting quickly can improve your outcomes significantly.'
                : 'Keep tracking — more insights will emerge as your career progresses.'}
            </span>
          </InsightBody>
          <DarkBtn>View full insight</DarkBtn>
        </InsightCard>
      ) : (
        <InsightCard>
          <InsightHeader $color="#00ca72">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
            </svg>
            Career insight
          </InsightHeader>
          <InsightBody>
            Your career is being tracked automatically. Insights will appear as your data grows.
            <br /><br />
            <span>Keep applying — patterns will emerge soon.</span>
          </InsightBody>
          <DarkBtn>View full insight</DarkBtn>
        </InsightCard>
      )}

      <InsightCard>
        <InsightHeader $color="#eab308">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          Focus suggestion
        </InsightHeader>
        <InsightBody>
          {interviewSignals.length > 0
            ? `You have ${interviewSignals.length} upcoming interview${interviewSignals.length > 1 ? 's' : ''}. Preparing thoroughly is the highest-impact action you can take right now.`
            : 'Preparing for interviews and following up on applications are the highest-impact actions you can take right now.'}
        </InsightBody>
        <DarkBtn>Create study plan</DarkBtn>
      </InsightCard>

      <div>
        <SectionTitle>
          <span>Quick actions</span>
        </SectionTitle>
        <Stack style={{ gap: 4 }}>
          <ActionStripItem>
            <span>Prepare for interview</span>
            <ActionArrow>›</ActionArrow>
          </ActionStripItem>
          <ActionStripItem>
            <span>Compare offers</span>
            <ActionArrow>›</ActionArrow>
          </ActionStripItem>
          <ActionStripItem>
            <span>Improve resume</span>
            <ActionArrow>›</ActionArrow>
          </ActionStripItem>
        </Stack>
      </div>
    </Panel>
  );
}
