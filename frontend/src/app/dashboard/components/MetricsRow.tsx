'use client';

import styled from 'styled-components';

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.borderDark};
  border-radius: 20px;
  padding: 16px;
  transition: transform 0.15s;
  cursor: default;

  &:hover {
    transform: scale(1.01);
  }
`;

const Top = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const IconBox = styled.div<{ $color: string }>`
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $color }) => $color}1f;
  color: ${({ $color }) => $color};
`;

const Value = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textDark};
  line-height: 1;
`;

const Label = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.dim};
  margin-top: 2px;
`;

const Delta = styled.div<{ $color: string }>`
  font-size: 11px;
  font-weight: 600;
  margin-top: 4px;
  color: ${({ $color }) => $color};
`;

const ArrowUp = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="18 15 12 9 6 15" />
  </svg>
);

interface MetricProps {
  icon: 'applications' | 'interviews' | 'responseRate' | 'offers';
  value: string | number;
  label: string;
  delta: string;
  deltaColor: string;
}

const iconConfig: Record<string, { icon: React.ComponentType; color: string }> = {
  applications: {
    icon: () => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
      </svg>
    ),
    color: '#4F8EF7',
  },
  interviews: {
    icon: () => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
    color: '#34D399',
  },
  responseRate: {
    icon: () => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
      </svg>
    ),
    color: '#A78BFA',
  },
  offers: {
    icon: () => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    color: '#F59E0B',
  },
};

function MetricCard({ icon, value, label, delta, deltaColor }: MetricProps) {
  const cfg = iconConfig[icon];
  const Icon = cfg.icon;

  return (
    <Card>
      <Top>
        <IconBox $color={cfg.color}><Icon /></IconBox>
        <span style={{ color: deltaColor }}><ArrowUp /></span>
      </Top>
      <Value>{value}</Value>
      <Label>{label}</Label>
      <Delta $color={deltaColor}>{delta}</Delta>
    </Card>
  );
}

interface MetricsRowProps {
  applications?: number;
  interviews?: number;
  responseRate?: number;
  offers?: number;
}

export function MetricsRow({ applications = 0, interviews = 0, responseRate = 0, offers = 0 }: MetricsRowProps) {
  const metrics: MetricProps[] = [
    { icon: 'applications', value: applications, label: 'Applications', delta: '+8 this week', deltaColor: '#4F8EF7' },
    { icon: 'interviews', value: interviews, label: 'Interviews', delta: '+3 scheduled', deltaColor: '#34D399' },
    { icon: 'responseRate', value: responseRate ? `${responseRate}%` : '31%', label: 'Response Rate', delta: '+4% vs avg', deltaColor: '#A78BFA' },
    { icon: 'offers', value: offers, label: 'Offers', delta: 'Active pipeline', deltaColor: '#F59E0B' },
  ];

  return (
    <Grid>
      {metrics.map((m) => (
        <MetricCard key={m.icon} {...m} />
      ))}
    </Grid>
  );
}
