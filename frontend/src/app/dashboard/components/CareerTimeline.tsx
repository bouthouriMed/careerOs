'use client';

import styled from 'styled-components';

const TimelineCard = styled.div`
  background: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.borderDark};
  border-radius: 20px;
  overflow: hidden;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.04);
  cursor: pointer;
  transition: background 0.1s;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: rgba(255,255,255,0.02);
  }
`;

const IconWrap = styled.div`
  flex-shrink: 0;
  display: flex;
`;

const Body = styled.div`
  flex: 1;
  min-width: 0;
`;

const Top = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Type = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textDark};
`;

const Chip = styled.span`
  font-size: 10px;
  font-weight: 500;
  padding: 2px 6px;
  border-radius: 5px;
  background: rgba(255,255,255,0.06);
  color: ${({ theme }) => theme.colors.dim};
`;

const RoleLine = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.dim};
  margin-top: 2px;
`;

const Time = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.dim};
  flex-shrink: 0;
`;

const SectionHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const SectionTitle = styled.h3`
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textDark};
  margin: 0;
`;

const ViewAll = styled.a`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.blue};
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const events = [
  {
    icon: 'check',
    iconColor: '#34D399',
    type: 'Interview Scheduled',
    chip: 'Figma',
    role: 'Staff PM',
    time: '2h ago',
  },
  {
    icon: 'check',
    iconColor: '#34D399',
    type: 'Application Sent',
    chip: 'Anthropic',
    role: 'PM Lead',
    time: '5h ago',
  },
  {
    icon: 'circle',
    iconColor: '#F59E0B',
    type: 'Follow-up Reminder',
    chip: 'Vercel',
    role: 'Eng Manager',
    time: 'Yesterday',
  },
  {
    icon: 'star',
    iconColor: '#4F8EF7',
    type: 'Offer Received',
    chip: 'Anthropic',
    role: 'PM Lead',
    time: 'Yesterday',
  },
  {
    icon: 'check',
    iconColor: '#34D399',
    type: 'Resume Tailored',
    chip: 'Linear',
    role: 'Product Lead',
    time: '2d ago',
  },
];

function CheckIcon({ color }: { color: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function CircleIcon({ color }: { color: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

function StarIcon({ color }: { color: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

const iconMap: Record<string, typeof CheckIcon> = {
  check: CheckIcon,
  circle: CircleIcon,
  star: StarIcon,
};

interface CareerTimelineProps {
  isEmpty?: boolean;
}

export function CareerTimeline({ isEmpty }: CareerTimelineProps) {
  if (isEmpty) {
    return (
      <div>
        <SectionHead>
          <SectionTitle>Career Activity</SectionTitle>
        </SectionHead>
        <TimelineCard style={{ padding: 32, textAlign: 'center' }}>
          <p style={{ color: '#6B7A9E', fontSize: 13, margin: 0 }}>Your career activity will appear here once you start tracking applications.</p>
        </TimelineCard>
      </div>
    );
  }

  return (
    <div>
      <SectionHead>
        <SectionTitle>Career Activity</SectionTitle>
        <ViewAll href="#">
          View all
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </ViewAll>
      </SectionHead>
      <TimelineCard>
        {events.map((evt) => {
          const Icon = iconMap[evt.icon];
          return (
            <Row key={`${evt.type}-${evt.chip}`}>
              <IconWrap><Icon color={evt.iconColor} /></IconWrap>
              <Body>
                <Top>
                  <Type>{evt.type}</Type>
                  <Chip>{evt.chip}</Chip>
                </Top>
                <RoleLine>{evt.role}</RoleLine>
              </Body>
              <Time>{evt.time}</Time>
            </Row>
          );
        })}
      </TimelineCard>
    </div>
  );
}
