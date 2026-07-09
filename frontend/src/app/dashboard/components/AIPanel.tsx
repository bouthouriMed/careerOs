'use client';

import styled from 'styled-components';

const Panel = styled.aside`
  border-left: 1px solid rgba(255,255,255,0.05);
  background: #0A0D14;
  display: flex;
  flex-direction: column;
  padding: 20px 16px;
  overflow-y: auto;
  gap: 12px;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }
  &::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.12); }
`;

const CopilotHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 4px;
`;

const CopilotTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  span {
    font-size: 13px;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.textDark};
  }
`;

const CopilotBadge = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 8px;
  background: linear-gradient(135deg, #4F8EF7, #A78BFA);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CpCard = styled.div`
  background: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.borderDark};
  border-radius: 20px;
  padding: 16px;
`;

const CpSectionLabel = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 12px;
  color: ${({ $color }) => $color};
`;

const CpBody = styled.p`
  font-size: 11px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.muted};
  margin: 0;

  strong {
    color: ${({ theme }) => theme.colors.textDark};
    font-weight: 600;
  }
`;

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 8px;
`;

const StatItem = styled.div`
  background: ${({ theme }) => theme.colors.card2};
  border-radius: 10px;
  padding: 10px;
  text-align: center;
`;

const StatValue = styled.div<{ $color: string }>`
  font-size: 18px;
  font-weight: 700;
  color: ${({ $color }) => $color};
`;

const StatLabel = styled.div`
  font-size: 10px;
  color: ${({ theme }) => theme.colors.dim};
  margin-top: 2px;
`;

const InsightRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px;
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.card2};
  margin-bottom: 6px;

  &:last-child { margin-bottom: 0; }
`;

const InsightIcon = styled.div`
  flex-shrink: 0;
  margin-top: 1px;
  display: flex;
`;

const InsightText = styled.div`
  font-size: 11px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.muted};
`;

const IvRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.card2};
  margin-bottom: 6px;
  cursor: pointer;
  transition: background 0.1s;

  &:last-child { margin-bottom: 0; }
  &:hover { background: rgba(255,255,255,0.06); }
`;

const IvLogo = styled.div<{ $bg: string; $color: string }>`
  width: 32px;
  height: 32px;
  border-radius: 10px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  background: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
`;

const IvCompany = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textDark};
`;

const IvRole = styled.div`
  font-size: 10px;
  color: ${({ theme }) => theme.colors.dim};
`;

const IvTime = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  color: ${({ theme }) => theme.colors.dim};
`;

const IvInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

interface Application {
  id: string;
  status: string;
  companyName?: string | null;
  jobTitle?: string | null;
  createdAt: string;
}

interface AIPanelProps {
  isEmpty?: boolean;
  applications?: Application[];
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
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

export function AIPanel({ isEmpty, applications = [] }: AIPanelProps) {
  if (isEmpty || applications.length === 0) {
    return (
      <Panel>
        <CopilotHeader>
          <CopilotTitle>
            <CopilotBadge>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="1">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
            </CopilotBadge>
            <span>AI Copilot</span>
          </CopilotTitle>
        </CopilotHeader>
        <CpCard>
          <p style={{ color: '#6B7A9E', fontSize: 12, lineHeight: 1.5, margin: 0, textAlign: 'center', padding: '24px 0' }}>
            AI insights will appear here as you track your applications.
          </p>
        </CpCard>
      </Panel>
    );
  }

  const appsCount = applications.length;
  const interviewsCount = applications.filter(a => a.status.toLowerCase() === 'interview').length;
  const offersCount = applications.filter(a => a.status.toLowerCase() === 'offer').length;
  const rejectedCount = applications.filter(a => a.status.toLowerCase() === 'rejected').length;
  const savedCount = applications.filter(a => a.status.toLowerCase() === 'saved').length;
  const appliedCount = applications.filter(a => a.status.toLowerCase() === 'applied').length;

  const activePipeline = appliedCount + interviewsCount;
  const responseRate = appsCount > 0 ? Math.round((appsCount - savedCount) / appsCount * 100) : 0;

  const interviewApps = applications.filter(a => a.status.toLowerCase() === 'interview');
  const savedApps = applications.filter(a => a.status.toLowerCase() === 'saved');

  return (
    <Panel>
      <CopilotHeader>
        <CopilotTitle>
          <CopilotBadge>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="1">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
          </CopilotBadge>
          <span>AI Copilot</span>
        </CopilotTitle>
      </CopilotHeader>

      <CpCard>
        <CpSectionLabel $color="#4F8EF7">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
          </svg>
          Pipeline Overview
        </CpSectionLabel>
        <CpBody>You have <strong>{activePipeline}</strong> active applications in your pipeline with <strong>{interviewsCount}</strong> interview{interviewsCount !== 1 ? 's' : ''} lined up.</CpBody>
        <StatGrid>
          <StatItem>
            <StatValue $color="#4F8EF7">{appsCount}</StatValue>
            <StatLabel>Total Apps</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue $color="#A78BFA">{responseRate}%</StatValue>
            <StatLabel>Response Rate</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue $color="#34D399">{interviewsCount}</StatValue>
            <StatLabel>Interviews</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue $color="#F59E0B">{offersCount}</StatValue>
            <StatLabel>Offers</StatLabel>
          </StatItem>
        </StatGrid>
      </CpCard>

      {interviewApps.length > 0 && (
        <CpCard>
          <CpSectionLabel $color="#4F8EF7">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Upcoming Interviews
            <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 999, background: 'rgba(79,142,247,0.15)', color: '#4F8EF7', textTransform: 'none', letterSpacing: 0 }}>{interviewApps.length}</span>
          </CpSectionLabel>
          {interviewApps.map((app) => (
            <IvRow key={app.id}>
              <IvLogo $bg="rgba(167,139,250,0.2)" $color="#A78BFA">{app.companyName ? getInitials(app.companyName) : '?'}</IvLogo>
              <IvInfo>
                <IvCompany>{app.companyName || 'Unknown'}</IvCompany>
                <IvRole>{app.jobTitle || 'Application'}</IvRole>
              </IvInfo>
              <IvTime>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#6B7A9E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                {timeAgo(app.createdAt)}
              </IvTime>
            </IvRow>
          ))}
        </CpCard>
      )}

      {savedApps.length > 0 && (
        <CpCard>
          <CpSectionLabel $color="#F59E0B">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            Saved Opportunities
          </CpSectionLabel>
          {savedApps.slice(0, 3).map((app) => (
            <IvRow key={app.id}>
              <IvLogo $bg="rgba(245,158,11,0.2)" $color="#F59E0B">{app.companyName ? getInitials(app.companyName) : '?'}</IvLogo>
              <IvInfo>
                <IvCompany>{app.companyName || 'Unknown'}</IvCompany>
                <IvRole>{app.jobTitle || 'Application'}</IvRole>
              </IvInfo>
              <IvTime>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#6B7A9E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                {timeAgo(app.createdAt)}
              </IvTime>
            </IvRow>
          ))}
        </CpCard>
      )}

      {rejectedCount > 0 && (
        <CpCard>
          <CpSectionLabel $color="#F87171">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            Rejected
          </CpSectionLabel>
          <InsightRow>
            <InsightIcon>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
            </InsightIcon>
            <InsightText>{rejectedCount} application{rejectedCount !== 1 ? 's were' : ' was'} rejected. Keep applying — each rejection brings you closer to the right fit.</InsightText>
          </InsightRow>
        </CpCard>
      )}

      <div style={{ height: 8 }} />
    </Panel>
  );
}
