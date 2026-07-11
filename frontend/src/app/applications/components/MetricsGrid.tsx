'use client';

import styled from 'styled-components';

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
`;

const Card = styled.div`
  background-color: ${({ theme }) => theme.colors.cardBg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  padding: 16px;
  position: relative;
`;

const Label = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ValueRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: 12px;
`;

const Num = styled.span`
  font-size: 24px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
`;

const MiniTrend = styled.svg`
  width: 50px;
  height: 20px;
`;

const Subtext = styled.div`
  font-size: 11px;
  margin-top: 6px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const Up = styled.span`
  color: ${({ theme }) => theme.colors.accent};
  font-weight: 500;
`;

interface MetricDef {
  label: string;
  value: number;
  suffix?: string;
  trend: string;
  trendUp?: boolean;
  color: string;
  path: string;
}

interface MetricsGridProps {
  active: number;
  interviewing: number;
  responseRate: number;
  offers: number;
  closed: number;
}

export function MetricsGrid({ active, interviewing, responseRate, offers, closed }: MetricsGridProps) {
  const metrics: MetricDef[] = [
    {
      label: 'Active',
      value: active,
      trend: 'vs last month',
      trendUp: true,
      color: '#00ca72',
      path: 'M0,15 Q15,12 30,5 T50,2',
    },
    {
      label: 'Interviewing',
      value: interviewing,
      trend: 'vs last month',
      trendUp: true,
      color: '#a855f7',
      path: 'M0,18 Q15,12 30,14 T50,4',
    },
    {
      label: 'Response rate',
      value: responseRate,
      suffix: '%',
      trend: 'vs last month',
      trendUp: true,
      color: '#3b82f6',
      path: 'M0,15 Q15,10 30,8 T50,3',
    },
    {
      label: 'Offers',
      value: offers,
      trend: 'vs last month',
      color: '#f97316',
      path: 'M0,18 Q15,16 30,12 T50,8',
    },
    {
      label: 'Closed',
      value: closed,
      trend: 'vs last month',
      trendUp: true,
      color: '#647387',
      path: 'M0,15 Q15,14 30,10 T50,5',
    },
  ];

  return (
    <Grid>
      {metrics.map((m) => (
        <Card key={m.label}>
          <Label>{m.label}</Label>
          <ValueRow>
            <Num>{m.value}{m.suffix || ''}</Num>
            <MiniTrend viewBox="0 0 50 20">
              <path d={m.path} fill="none" stroke={m.color} strokeWidth="1.5" />
            </MiniTrend>
          </ValueRow>
          <Subtext>
            {m.trendUp ? <Up>{'\u2191'}</Up> : '—'} {m.trend}
          </Subtext>
        </Card>
      ))}
    </Grid>
  );
}
