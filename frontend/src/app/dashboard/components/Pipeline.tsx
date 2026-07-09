'use client';

import styled from 'styled-components';

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
`;

const Column = styled.div`
  background: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.borderDark};
  border-radius: 20px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ColHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
`;

const ColLabel = styled.span<{ $color: string }>`
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${({ $color }) => $color};
`;

const ColCount = styled.span<{ $bg: string; $color: string }>`
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 6px;
  background: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.card2};
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 12px;
  padding: 10px;
  cursor: pointer;
  transition: transform 0.15s;

  &:hover {
    transform: scale(1.02);
  }
`;

const CardTop = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
`;

const Logo = styled.div<{ $bg: string; $color: string }>`
  width: 20px;
  height: 20px;
  border-radius: 6px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  background: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
`;

const Company = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textDark};
`;

const Role = styled.div`
  font-size: 10px;
  color: ${({ theme }) => theme.colors.dim};
`;

const Meta = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 6px;

  span {
    font-size: 10px;
    color: ${({ theme }) => theme.colors.dim};
  }
`;

const AddBtn = styled.button`
  width: 100%;
  border-radius: 10px;
  padding: 8px;
  text-align: center;
  font-size: 11px;
  color: ${({ theme }) => theme.colors.dim};
  cursor: pointer;
  border: 1px dashed rgba(255,255,255,0.08);
  background: transparent;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition: background 0.15s;

  &:hover {
    background: rgba(255,255,255,0.04);
  }
`;

const columns = [
  { key: 'saved', label: 'Saved', color: '#6B7A9E', bg: 'rgba(107,122,158,0.15)' },
  { key: 'applied', label: 'Applied', color: '#4F8EF7', bg: 'rgba(79,142,247,0.15)' },
  { key: 'interview', label: 'Interview', color: '#A78BFA', bg: 'rgba(167,139,250,0.15)' },
  { key: 'offer', label: 'Offer', color: '#34D399', bg: 'rgba(52,211,153,0.15)' },
  { key: 'rejected', label: 'Rejected', color: '#F87171', bg: 'rgba(248,113,113,0.15)' },
];

interface Application {
  id: string;
  status: string;
  companyName?: string | null;
  jobTitle?: string | null;
  createdAt: string;
}

interface PipelineProps {
  applications?: Application[];
  loading?: boolean;
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

function getStatusGroup(status: string): string {
  const s = status.toLowerCase();
  if (s === 'saved') return 'saved';
  if (s === 'applied') return 'applied';
  if (s === 'interviewing' || s === 'interview') return 'interview';
  if (s === 'offer') return 'offer';
  if (s === 'rejected') return 'rejected';
  return 'applied';
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return '1d ago';
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks === 1) return '1w ago';
  return `${weeks}w ago`;
}

const LoadingCard = styled.div`
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.04);
  border-radius: 12px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;

  div {
    height: 10px;
    border-radius: 4px;
    background: rgba(255,255,255,0.04);
  }

  .w1 { width: 60%; }
  .w2 { width: 80%; }
`;

export function Pipeline({ applications = [], loading }: PipelineProps) {
  const grouped = columns.map(col => ({
    ...col,
    apps: applications.filter(a => getStatusGroup(a.status) === col.key),
  }));

  return (
    <Grid>
      {grouped.map((col) => {
        const cards = col.apps;
        if (loading) {
          return (
            <Column key={col.key}>
              <ColHead>
                <ColLabel $color={col.color}>{col.label}</ColLabel>
                <ColCount $bg={col.bg} $color={col.color}>0</ColCount>
              </ColHead>
              {[0, 1, 2].map((i) => (
                <LoadingCard key={i}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0 }} />
                    <div className="w1" />
                  </div>
                  <div className="w2" />
                </LoadingCard>
              ))}
            </Column>
          );
        }
        return (
          <Column key={col.key}>
            <ColHead>
              <ColLabel $color={col.color}>{col.label}</ColLabel>
              <ColCount $bg={col.bg} $color={col.color}>{cards.length}</ColCount>
            </ColHead>
            {cards.map((app) => {
              const companyName = app.companyName || 'Unknown';
              return (
                <Card key={app.id}>
                  <CardTop>
                    <Logo $bg={col.bg} $color={col.color}>{getInitials(companyName)}</Logo>
                    <Company>{companyName}</Company>
                  </CardTop>
                  <Role>{app.jobTitle || 'Application'}</Role>
                  <Meta>
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#6B7A9E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>{timeAgo(app.createdAt)}</span>
                  </Meta>
                </Card>
              );
            })}
            <AddBtn>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add
            </AddBtn>
          </Column>
        );
      })}
    </Grid>
  );
}
