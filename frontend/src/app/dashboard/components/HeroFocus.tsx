'use client';

import styled from 'styled-components';
import type { Signal } from '../page';

const Wrapper = styled.div<{ $hasSignal: boolean }>`
  border-radius: 16px;
  padding: 28px;
  position: relative;
  overflow: hidden;
  background: ${({ $hasSignal, theme }) =>
    $hasSignal
      ? `radial-gradient(circle at top right, ${theme.colors.accent}11 0%, ${theme.colors.accent}08 35%, ${theme.colors.cardBg} 100%)`
      : `radial-gradient(circle at top right, ${theme.colors.primary}11 0%, ${theme.colors.primary}08 35%, ${theme.colors.cardBg} 100%)`};
  border: 1px solid ${({ $hasSignal, theme }) => $hasSignal ? `${theme.colors.accent}22` : `${theme.colors.primary}22`};
`;

const FloatingDeco = styled.div`
  position: absolute;
  top: 24px;
  right: 32px;
  width: 140px;
  height: 110px;
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.surfaceHover} 0%, transparent 100%);
  border-radius: 8px;
  opacity: 0.3;
  pointer-events: none;
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
  background-color: ${({ theme }) => theme.colors.accentMuted};
  border: 1px solid ${({ theme }) => theme.colors.accent}26;
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
  background: ${({ $bg }) => $bg};
  color: white;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const TitleBlock = styled.div`
  flex: 1;
  min-width: 0;
`;

const Title = styled.h2`
  font-size: 22px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
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

const BodySplit = styled.div`
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 40px;
`;

const ActionSection = styled.div`
  h3 {
    font-size: 18px;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
    margin: 0 0 8px;
  }
  p {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 14px;
    line-height: 1.5;
    margin: 0 0 24px;
  }
`;

const GreenBtn = styled.button`
  background-color: ${({ theme }) => theme.colors.accent};
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
  transition: background-color 0.15s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.accentHover};
  }
`;

const EstTime = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 20px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const PrepBox = styled.div`
  background: ${({ theme }) => theme.colors.cardBg2};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  padding: 20px;
`;

const PrepHeader = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 12px;
`;

const PrepHeaderRight = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ProgressBarTrack = styled.div`
  height: 4px;
  background-color: ${({ theme }) => theme.colors.borderLight};
  border-radius: 2px;
  margin-bottom: 20px;
`;

const ProgressBarFill = styled.div<{ $pct: number }>`
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
  color: ${({ theme }) => theme.colors.text};
`;

const PrepItemLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const CheckCircle = styled.div<{ $done: boolean }>`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1.5px solid ${({ $done, theme }) => $done ? theme.colors.accent : theme.colors.textMuted};
  background-color: ${({ $done, theme }) => $done ? theme.colors.accentMuted : 'transparent'};
  position: relative;
  flex-shrink: 0;

  ${({ $done, theme }) => $done && `
    &::after {
      content: '✓';
      color: ${theme.colors.accent};
      font-size: 11px;
      font-weight: bold;
      position: absolute;
      left: 3px;
      top: -1px;
    }
  `}
`;

const PrepItemRight = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 12px;
`;

const EmptyTag = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  background: ${({ theme }) => theme.colors.primaryMuted};
  color: ${({ theme }) => theme.colors.primary};
  width: fit-content;
  margin-bottom: 16px;
`;

const EmptyTitle = styled.h2`
  font-size: 22px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 8px;
`;

const EmptyDesc = styled.p`
  font-size: 14px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.textSecondary};
  max-width: 420px;
  margin: 0;
`;

interface HeroFocusProps {
  isEmpty?: boolean;
  syncEmailsScanned?: number;
  signal?: Signal | null;
}

const typeLabels: Record<string, string> = {
  Action: 'Interview',
  Reminder: 'Reminder',
  Insight: 'Update',
  Offer: 'Offer',
};

function formatExpires(expiresAt: string): { label: string; value: string } {
  const diff = new Date(expiresAt).getTime() - Date.now();
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return { label: `In ${days}d`, value: `${hours}h` };
  if (hours > 0) return { label: 'Today', value: `${hours}h` };
  return { label: 'Now', value: '!' };
}

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}

function getCompanyColor(name: string): string {
  const colors = ['#635bff', '#632ca6', '#0ea5e9', '#f97316', '#ec4899', '#06b6d4', '#8b5cf6', '#ef4444'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function HeroFocus({ isEmpty, syncEmailsScanned, signal }: HeroFocusProps) {
  if (signal) {
    const companyName = signal.company?.name || 'Company';
    const companyInitials = companyName.slice(0, 1).toUpperCase();
    const companyColor = getCompanyColor(companyName);
    const jobTitle = signal.application?.job?.title || signal.title;
    const typeLabel = typeLabels[signal.type] || signal.type;
    const expires = signal.expiresAt ? formatExpires(signal.expiresAt) : null;

    return (
      <Wrapper $hasSignal={true}>
        <FloatingDeco />
        <PriorityTag>Today&apos;s Priority</PriorityTag>

        <Header>
          {expires ? (
            <TimeBadge>
              <TimeLabel>{expires.label}</TimeLabel>
              <TimeValue>{expires.value}</TimeValue>
            </TimeBadge>
          ) : (
            <TimeBadge>
              <TimeLabel>Now</TimeLabel>
              <TimeValue>!</TimeValue>
            </TimeBadge>
          )}
          <CompanyIcon $bg={companyColor}>
            {signal.company?.logoUrl ? (
              <img src={signal.company.logoUrl} alt={companyName} />
            ) : (
              companyInitials
            )}
          </CompanyIcon>
          <TitleBlock>
            <Title>{companyName}</Title>
            <Subtitle>{jobTitle}</Subtitle>
            <StatusPill>
              <span>⊙</span> {typeLabel} • {signal.priority}
            </StatusPill>
          </TitleBlock>
        </Header>

        <BodySplit>
          <ActionSection>
            <h3>Attention needed</h3>
            <p>{signal.description}</p>
            <GreenBtn>
              Take action
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" />
              </svg>
            </GreenBtn>
            <EstTime>
              <span>🕒</span> Detected {formatTimeAgo(signal.createdAt)} · {Math.round(signal.confidence * 100)}% confidence
            </EstTime>
          </ActionSection>

          <PrepBox>
            <PrepHeader>
              <span>Signal details</span>
              <PrepHeaderRight>{typeLabel}</PrepHeaderRight>
            </PrepHeader>
            <ProgressBarTrack>
              <ProgressBarFill $pct={Math.round(signal.confidence * 100)} />
            </ProgressBarTrack>
            <PrepList>
              <PrepItem>
                <PrepItemLeft>
                  <CheckCircle $done={true} />
                  Email detected
                </PrepItemLeft>
              </PrepItem>
              <PrepItem>
                <PrepItemLeft>
                  <CheckCircle $done={true} />
                  Signal classified as {typeLabel.toLowerCase()}
                </PrepItemLeft>
              </PrepItem>
              <PrepItem>
                <PrepItemLeft>
                  <CheckCircle $done={true} />
                  Linked to {companyName}
                </PrepItemLeft>
              </PrepItem>
              <PrepItem>
                <PrepItemLeft>
                  <CheckCircle $done={signal.priority === 'Critical' || signal.priority === 'High'} />
                  Priority assessed
                </PrepItemLeft>
                <PrepItemRight>{signal.priority}</PrepItemRight>
              </PrepItem>
              <PrepItem>
                <PrepItemLeft>
                  <CheckCircle $done={false} />
                  Action required
                </PrepItemLeft>
                <PrepItemRight>{signal.expiresAt ? `${Math.ceil((new Date(signal.expiresAt).getTime() - Date.now()) / 86400000)}d left` : 'Now'}</PrepItemRight>
              </PrepItem>
            </PrepList>
          </PrepBox>
        </BodySplit>
      </Wrapper>
    );
  }

  if (isEmpty && syncEmailsScanned !== undefined) {
    return (
      <Wrapper $hasSignal={false}>
        <FloatingDeco />
        <EmptyTag>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
          Getting started
        </EmptyTag>
        <EmptyTitle>Welcome to CareerOS</EmptyTitle>
        <EmptyDesc>
          We are scanning your inbox and organizing your career. {syncEmailsScanned} emails found
          so far — your applications will appear here automatically.
        </EmptyDesc>
      </Wrapper>
    );
  }

  if (isEmpty) {
    return (
      <Wrapper $hasSignal={false}>
        <FloatingDeco />
        <EmptyTag>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
          Getting started
        </EmptyTag>
        <EmptyTitle>Welcome to CareerOS</EmptyTitle>
        <EmptyDesc>
          We are organizing your career and preparing personalized insights.
        </EmptyDesc>
      </Wrapper>
    );
  }

  return (
    <Wrapper $hasSignal={false}>
      <FloatingDeco />
      <EmptyTag>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        </svg>
        What&apos;s happening
      </EmptyTag>
      <EmptyTitle>All caught up</EmptyTitle>
      <EmptyDesc>
        No pending actions right now. New updates from your applications will appear here automatically.
      </EmptyDesc>
    </Wrapper>
  );
}
