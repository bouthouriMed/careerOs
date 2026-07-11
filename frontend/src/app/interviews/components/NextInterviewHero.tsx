'use client';

import styled from 'styled-components';
import { InterviewItem } from './InterviewCard';

const Hero = styled.div`
  background: radial-gradient(circle at top right, #0a271d 0%, #081a15 35%, #0a1112 100%);
  border: 1px solid #103226;
  border-radius: 16px;
  padding: 28px;
  position: relative;
  overflow: hidden;
`;

const PriorityTag = styled.div`
  font-size: 10px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.accent};
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 24px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 28px;
`;

const TimeBadge = styled.div`
  background-color: rgba(0, 202, 114, 0.06);
  border: 1px solid rgba(0, 202, 114, 0.15);
  border-radius: 12px;
  padding: 10px 14px;
  text-align: center;
`;

const TimeLabel = styled.div`
  font-size: 9px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.accent};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const TimeValue = styled.div`
  font-size: 19px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.accent};
  margin-top: 2px;
`;

const CompanyIcon = styled.div<{ $bg: string }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 22px;
  color: white;
  background: ${({ $bg }) => $bg};
`;

const TitleBlock = styled.div`
  flex: 1;
`;

const CompanyName = styled.h2`
  font-size: 22px;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
`;

const JobTitle = styled.p`
  color: #8591a3;
  font-size: 14px;
  margin: 2px 0 0;
`;

const StatusPill = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.accent};
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
`;

const Body = styled.div`
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 40px;
`;

const ActionSection = styled.div``;

const ActionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 8px;
`;

const ActionDesc = styled.p`
  color: #8591a3;
  font-size: 14px;
  line-height: 1.5;
  margin: 0 0 24px;
`;

const PrepButton = styled.button`
  background-color: #00aa5e;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: inherit;

  &:hover {
    background-color: ${({ theme }) => theme.colors.accent};
  }
`;

const EstTime = styled.div`
  font-size: 13px;
  color: #8591a3;
  margin-top: 20px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const PrepBox = styled.div`
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 12px;
  padding: 20px;
`;

const PrepHeader = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  font-weight: 500;
  color: #ffffff;
  margin-bottom: 12px;
`;

const PrepCount = styled.span`
  color: #8591a3;
`;

const ProgressBar = styled.div`
  height: 4px;
  background-color: rgba(255, 255, 255, 0.08);
  border-radius: 2px;
  margin-bottom: 20px;
`;

const ProgressFill = styled.div<{ $pct: number }>`
  width: ${({ $pct }) => $pct}%;
  height: 100%;
  background-color: ${({ theme }) => theme.colors.accent};
  border-radius: 2px;
`;

const PrepList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const PrepItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  color: #ffffff;
`;

const PrepItemLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const CheckCircle = styled.div<{ $done?: boolean }>`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1.5px solid ${({ $done, theme }) => $done ? theme.colors.accent : '#4d5765'};
  background-color: ${({ $done, theme }) => $done ? 'rgba(0, 202, 114, 0.1)' : 'transparent'};
  position: relative;

  ${({ $done }) => $done && `
    &::after {
      content: '✓';
      color: #00ca72;
      font-size: 11px;
      font-weight: bold;
      position: absolute;
      left: 3px;
      top: -1px;
    }
  `}
`;

const PrepTime = styled.span`
  color: #8591a3;
  font-size: 12px;
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

function formatTimeLabel(iso: string): { label: string; time: string } {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  let label = 'Upcoming';
  if (diffDays === 0) label = 'Today';
  else if (diffDays === 1) label = 'Tomorrow';
  else if (diffDays > 0) label = `In ${diffDays} days`;

  const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  return { label, time };
}

const PREP_ITEMS = [
  { label: 'Company & team research', done: true },
  { label: 'Resume alignment', done: true },
  { label: 'Likely interview questions', done: true },
  { label: 'Technical deep dive', done: false, time: '20 min' },
  { label: 'Prepare architecture story', done: false, time: '25 min' },
];

export function NextInterviewHero({ interview }: { interview: InterviewItem | null }) {
  if (!interview) {
    return (
      <Hero>
        <PriorityTag>No upcoming interviews</PriorityTag>
        <ActionTitle>You{"'"}re all caught up!</ActionTitle>
        <ActionDesc>No interviews scheduled. Focus on your applications or explore new opportunities.</ActionDesc>
      </Hero>
    );
  }

  const company = interview.application.company;
  const job = interview.application.job;
  const { label, time } = formatTimeLabel(interview.scheduledAt);
  const doneCount = PREP_ITEMS.filter(i => i.done).length;

  return (
    <Hero>
      <PriorityTag>Next Interview</PriorityTag>

      <Header>
        <TimeBadge>
          <TimeLabel>{label}</TimeLabel>
          <TimeValue>{time}</TimeValue>
        </TimeBadge>
        <CompanyIcon $bg={getCompanyColor(company.name)}>
          {company.name.charAt(0).toUpperCase()}
        </CompanyIcon>
        <TitleBlock>
          <CompanyName>{company.name}</CompanyName>
          <JobTitle>{job?.title || 'Position'}</JobTitle>
          <StatusPill>
            <span>⊙</span> {interview.type} {interview.round ? `• ${interview.round}` : ''}
          </StatusPill>
        </TitleBlock>
      </Header>

      <Body>
        <ActionSection>
          <ActionTitle>You{"'"}re mostly ready!</ActionTitle>
          <ActionDesc>
            We{"'"}ve prepared everything based on the role, your background and recent {company.name} interviews.
          </ActionDesc>
          <PrepButton>Continue preparation →</PrepButton>
          {interview.durationMinutes && (
            <EstTime>
              <span>🕒</span> Estimated time: {interview.durationMinutes} min
            </EstTime>
          )}
        </ActionSection>

        <PrepBox>
          <PrepHeader>
            <span>Your prep checklist</span>
            <PrepCount>{doneCount} / {PREP_ITEMS.length}</PrepCount>
          </PrepHeader>

          <ProgressBar>
            <ProgressFill $pct={(doneCount / PREP_ITEMS.length) * 100} />
          </ProgressBar>

          <PrepList>
            {PREP_ITEMS.map((item, i) => (
              <PrepItem key={i}>
                <PrepItemLeft>
                  <CheckCircle $done={item.done} />
                  {item.label}
                </PrepItemLeft>
                {item.time && <PrepTime>{item.time}</PrepTime>}
              </PrepItem>
            ))}
          </PrepList>
        </PrepBox>
      </Body>
    </Hero>
  );
}
