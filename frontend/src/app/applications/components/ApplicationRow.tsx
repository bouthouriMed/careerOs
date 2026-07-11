'use client';

import styled from 'styled-components';

const Row = styled.div<{ $selected: boolean }>`
  background-color: ${({ $selected, theme }) => $selected ? `${theme.colors.accent}08` : theme.colors.cardBg};
  border: 1px solid ${({ $selected, theme }) => $selected ? `${theme.colors.accent}4d` : theme.colors.border};
  border-radius: 12px;
  padding: 16px 20px;
  display: grid;
  grid-template-columns: 2.2fr 1.2fr 1.8fr 1fr 0.2fr;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: ${({ $selected, theme }) => $selected ? `0 0 16px ${theme.colors.accent}0a` : 'none'};

  &:hover {
    background-color: ${({ $selected, theme }) => $selected ? `${theme.colors.accent}08` : theme.colors.cardBg2};
  }
`;

const CompanyBlock = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const BrandBox = styled.div<{ $bg: string }>`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 18px;
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

const BrandInfo = styled.div`
  min-width: 0;
`;

const CompanyName = styled.h3`
  font-size: 15px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const JobTitle = styled.p`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 2px 0 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StatusInline = styled.span<{ $color: string }>`
  font-size: 11px;
  margin-top: 4px;
  display: inline-block;
  font-weight: 500;
  color: ${({ $color }) => $color};
`;

const Column = styled.div``;

const ColLabel = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ColValue = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text};
  margin-top: 4px;
  font-weight: 500;
`;

const ColSub = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 2px;
`;

const MatchBox = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const RadialCircle = styled.div<{ $color: string }>`
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 2px solid ${({ $color }) => $color}26;
  border-top-color: ${({ $color }) => $color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
`;

const MenuBtn = styled.div`
  color: ${({ theme }) => theme.colors.textMuted};
  font-weight: bold;
  font-size: 16px;
  text-align: right;
`;

function getStatusColor(status: string): { color: string; label: string } {
  const s = status.toLowerCase();
  if (s === 'interviewing' || s === 'interview') return { color: '#34D399', label: 'Interview' };
  if (s === 'applied') return { color: '#4F8EF7', label: 'Applied' };
  if (s === 'screening') return { color: '#A78BFA', label: 'Screening' };
  if (s === 'offer') return { color: '#F59E0B', label: 'Offer' };
  if (s === 'rejected') return { color: '#F87171', label: 'Rejected' };
  if (s === 'saved') return { color: '#818cf8', label: 'Saved' };
  if (s === 'closed') return { color: '#647387', label: 'Closed' };
  return { color: '#6B7A9E', label: status };
}

function getCompanyColor(name: string): string {
  const colors = ['#635bff', '#632ca6', '#0ea5e9', '#f97316', '#ec4899', '#06b6d4', '#8b5cf6', '#ef4444'];
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export interface ApplicationItem {
  id: string;
  status: string;
  companyName: string;
  companyDomain?: string | null;
  companyLogo?: string | null;
  jobTitle?: string | null;
  createdAt: string;
}

interface ApplicationRowProps {
  app: ApplicationItem;
  selected: boolean;
  onSelect: (id: string) => void;
}

export function ApplicationRow({ app, selected, onSelect }: ApplicationRowProps) {
  const { color, label } = getStatusColor(app.status);
  const bgColor = app.companyLogo ? 'transparent' : getCompanyColor(app.companyName);

  return (
    <Row $selected={selected} onClick={() => onSelect(app.id)}>
      <CompanyBlock>
        <BrandBox $bg={bgColor}>
          {app.companyLogo ? (
            <img src={app.companyLogo} alt={app.companyName} />
          ) : (
            app.companyName?.slice(0, 1).toUpperCase() || '?'
          )}
        </BrandBox>
        <BrandInfo>
          <CompanyName>{app.companyName}</CompanyName>
          {app.jobTitle && <JobTitle>{app.jobTitle}</JobTitle>}
          <StatusInline $color={color}>{label}</StatusInline>
        </BrandInfo>
      </CompanyBlock>

      <Column>
        <ColLabel>Applied</ColLabel>
        <ColValue>{formatDate(app.createdAt)}</ColValue>
      </Column>

      <Column>
        <ColLabel>Status</ColLabel>
        <ColValue>{label}</ColValue>
        <ColSub>{label}</ColSub>
      </Column>

      <MatchBox>
        <RadialCircle $color={color}>—</RadialCircle>
        <span>Match</span>
      </MatchBox>

      <MenuBtn>{'\u22EE'}</MenuBtn>
    </Row>
  );
}
