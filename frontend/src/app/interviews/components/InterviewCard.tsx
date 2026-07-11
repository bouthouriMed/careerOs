'use client';

import styled from 'styled-components';

export interface InterviewItem {
  id: string;
  type: string;
  status: string;
  scheduledAt: string;
  durationMinutes?: number | null;
  location?: string | null;
  meetingUrl?: string | null;
  round?: string | null;
  feedback?: string | null;
  application: {
    id: string;
    status: string;
    company: {
      id: string;
      name: string;
      domain?: string | null;
      logoUrl?: string | null;
    };
    job?: {
      id: string;
      title: string;
      location?: string | null;
    } | null;
  };
}

const Card = styled.div<{ $selected?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: ${({ theme }) => theme.colors.cardBg};
  border: 1px solid ${({ $selected, theme }) => $selected ? theme.colors.accent : theme.colors.border};
  border-radius: 12px;
  padding: 16px 18px;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.cardBg2};
    border-color: ${({ theme }) => theme.colors.border};
  }
`;

const Left = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
`;

const CompanyIcon = styled.div<{ $bg: string }>`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
  color: white;
  background: ${({ $bg }) => $bg};
  flex-shrink: 0;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const Info = styled.div`
  min-width: 0;
`;

const CompanyName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const JobTitle = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
`;

const DateTime = styled.div`
  text-align: right;
`;

const DateText = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
`;

const TimeText = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 1px;
`;

const Badge = styled.span<{ $variant: string }>`
  font-size: 11px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 6px;
  white-space: nowrap;

  ${({ $variant, theme }) => {
    switch ($variant) {
      case 'Video': return `background: ${theme.colors.primaryMuted}; color: ${theme.colors.primary};`;
      case 'Phone': return `background: ${theme.colors.purpleMuted}; color: ${theme.colors.purple};`;
      case 'Onsite': return `background: ${theme.colors.orangeMuted}; color: ${theme.colors.orange};`;
      case 'Technical': return `background: rgba(234, 179, 8, 0.12); color: #eab308;`;
      case 'Final': return `background: ${theme.colors.accentMuted}; color: ${theme.colors.accent};`;
      case 'Scheduled': return `background: ${theme.colors.accentMuted}; color: ${theme.colors.accent};`;
      case 'Completed': return `background: ${theme.colors.primaryMuted}; color: ${theme.colors.primary};`;
      case 'Cancelled': return `background: rgba(239, 68, 68, 0.12); color: #ef4444;`;
      default: return `background: ${theme.colors.surfaceHover}; color: ${theme.colors.textSecondary};`;
    }
  }}
`;

const Chevron = styled.span`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 14px;
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

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays > 0 && diffDays <= 7) return `In ${diffDays} days`;

  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export function InterviewCard({ interview, selected, onSelect }: {
  interview: InterviewItem;
  selected?: boolean;
  onSelect?: (id: string) => void;
}) {
  const company = interview.application.company;
  const job = interview.application.job;

  return (
    <Card $selected={selected} onClick={() => onSelect?.(interview.id)}>
      <Left>
        <CompanyIcon $bg={getCompanyColor(company.name)}>
          {company.logoUrl ? (
            <img src={company.logoUrl} alt={company.name} />
          ) : (
            company.name.charAt(0).toUpperCase()
          )}
        </CompanyIcon>
        <Info>
          <CompanyName>{company.name}</CompanyName>
          <JobTitle>{job?.title || interview.round || 'Interview'}</JobTitle>
        </Info>
      </Left>
      <Right>
        <DateTime>
          <DateText>{formatDate(interview.scheduledAt)}</DateText>
          <TimeText>{formatTime(interview.scheduledAt)}</TimeText>
        </DateTime>
        <Badge $variant={interview.type}>{interview.type}</Badge>
        <Badge $variant={interview.status}>{interview.status}</Badge>
        <Chevron>›</Chevron>
      </Right>
    </Card>
  );
}
