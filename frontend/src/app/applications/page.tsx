'use client';

import { useState, useMemo } from 'react';
import styled from 'styled-components';
import { ProtectedRoute } from '@/platform/routing/protected-route';
import { AppShell } from '@/platform/layout/AppShell';
import { useApplicationControllerGetTimelineQuery } from '@/platform/api/rtk-query/generated/api';

const PageTitle = styled.h1`
  font-size: 20px;
  font-weight: 700;
  color: #E8EBF4;
  margin: 0 0 4px;
`;

const PageDesc = styled.p`
  font-size: 13px;
  color: #6B7A9E;
  margin: 0 0 24px;
`;

const Tabs = styled.div`
  display: flex;
  gap: 4px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const Tab = styled.button<{ $active: boolean }>`
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  font-family: 'Plus Jakarta Sans', sans-serif;
  cursor: pointer;
  border: none;
  background: ${({ $active }) => ($active ? 'rgba(79,142,247,0.15)' : 'transparent')};
  color: ${({ $active }) => ($active ? '#4F8EF7' : '#6B7A9E')};
  transition: background 0.15s;

  &:hover {
    background: ${({ $active }) => ($active ? 'rgba(79,142,247,0.15)' : 'rgba(255,255,255,0.04)')};
  }
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Card = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  background: #141925;
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 14px;
  cursor: pointer;
  transition: background 0.1s;

  &:hover {
    background: #1C2333;
  }
`;

const Logo = styled.div<{ $bg: string; $color: string }>`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  background: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
`;

const CardBody = styled.div`
  flex: 1;
  min-width: 0;
`;

const CompanyName = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #E8EBF4;
`;

const JobTitle = styled.div`
  font-size: 11px;
  color: #6B7A9E;
  margin-top: 2px;
`;

const CardRight = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
`;

const Badge = styled.div<{ $color: string; $bg: string }>`
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: 6px;
  background: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
`;

const DateText = styled.span`
  font-size: 11px;
  color: #6B7A9E;
`;

const DetailOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  z-index: 100;
  display: flex;
  justify-content: flex-end;
`;

const DetailPanel = styled.div`
  width: 420px;
  max-width: 90vw;
  background: #0D1117;
  border-left: 1px solid rgba(255,255,255,0.05);
  padding: 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  color: #6B7A9E;
  cursor: pointer;
  padding: 4px;
  align-self: flex-end;
`;

const DetailSection = styled.div`
  h4 {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #6B7A9E;
    margin: 0 0 8px;
  }
`;

const RecruiterCard = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: #141925;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.05);
`;

const RecruiterAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(79,142,247,0.15);
  color: #4F8EF7;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
`;

const RecruiterInfo = styled.div`
  flex: 1;
  .name { font-size: 13px; font-weight: 600; color: #E8EBF4; }
  .email { font-size: 11px; color: #6B7A9E; }
`;

const InterviewTimeline = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const InterviewItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: #141925;
  border-radius: 10px;
`;

const InterviewDot = styled.div<{ $color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  flex-shrink: 0;
`;

const InterviewInfo = styled.div`
  flex: 1;
  .type { font-size: 12px; font-weight: 600; color: #E8EBF4; }
  .date { font-size: 11px; color: #6B7A9E; }
`;

const StatusSelect = styled.select`
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.1);
  background: #141925;
  color: #E8EBF4;
  font-size: 12px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  cursor: pointer;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 24px;
  color: #6B7A9E;
  font-size: 13px;
`;

const stages = [
  { key: '', label: 'All' },
  { key: 'Applied', label: 'Applied', color: '#4F8EF7', bg: 'rgba(79,142,247,0.15)' },
  { key: 'Screening', label: 'Screening', color: '#A78BFA', bg: 'rgba(167,139,250,0.15)' },
  { key: 'Interviewing', label: 'Interview', color: '#34D399', bg: 'rgba(52,211,153,0.15)' },
  { key: 'Offer', label: 'Offer', color: '#F59E0B', bg: 'rgba(245,158,11,0.15)' },
  { key: 'Rejected', label: 'Rejected', color: '#F87171', bg: 'rgba(248,113,113,0.15)' },
];

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

function ApplicationsContent() {
  const { data: timelineData, isLoading } = useApplicationControllerGetTimelineQuery();
  const [activeTab, setActiveTab] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const allApps = useMemo(() => {
    if (!timelineData) return [];
    const t = timelineData as { timeline: Array<{ date: string; applications: Array<Record<string, unknown>> }> };
    return t.timeline?.flatMap(e => e.applications) ?? [];
  }, [timelineData]);

  const filteredApps = useMemo(() => {
    if (!activeTab) return allApps;
    return allApps.filter((a: Record<string, unknown>) => a.status === activeTab);
  }, [allApps, activeTab]);

  type AppData = Record<string, unknown> & { recruiter?: { name: string; email?: string } };

  const selectedApp = useMemo(() => {
    return allApps.find((a: Record<string, unknown>) => a.id === selectedId) as AppData | undefined;
  }, [allApps, selectedId]);

  if (isLoading) {
    return (
      <AppShell>
        <PageTitle>Applications</PageTitle>
        <PageDesc>Loading your applications...</PageDesc>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageTitle>Applications</PageTitle>
      <PageDesc>Track and manage all your job applications in one place.</PageDesc>

      <Tabs>
        {stages.map((s) => {
          const count = s.key
            ? allApps.filter((a: Record<string, unknown>) => a.status === s.key).length
            : allApps.length;
          return (
            <Tab key={s.key} $active={activeTab === s.key} onClick={() => setActiveTab(s.key)}>
              {s.label} ({count})
            </Tab>
          );
        })}
      </Tabs>

      {filteredApps.length === 0 ? (
        <EmptyState>
          No applications yet. Sync your email to get started, or use the browser extension to save jobs from LinkedIn.
        </EmptyState>
      ) : (
        <List>
          {filteredApps.map((app: Record<string, unknown>) => {
            const status = app.status as string;
            const stage = stages.find(s => s.key === status) || stages[0];
            return (
              <Card key={app.id as string} onClick={() => setSelectedId(app.id as string)}>
                <Logo $bg={stage.bg || 'rgba(107,122,158,0.15)'} $color={stage.color || '#6B7A9E'}>
                  {getInitials((app.companyName as string) || '?')}
                </Logo>
                <CardBody>
                  <CompanyName>{(app.companyName as string | null) || 'Unknown'}</CompanyName>
                  {(app.jobTitle as string | null) && <JobTitle>{app.jobTitle as string}</JobTitle>}
                </CardBody>
                <CardRight>
                  <Badge $color={stage.color || '#6B7A9E'} $bg={stage.bg || 'rgba(107,122,158,0.15)'}>
                    {stage.label || status}
                  </Badge>
                  <DateText>{timeAgo(app.createdAt as string)}</DateText>
                </CardRight>
              </Card>
            );
          })}
        </List>
      )}

      {selectedApp && (
        <DetailOverlay onClick={() => setSelectedId(null)}>
          <DetailPanel onClick={(e) => e.stopPropagation()}>
            <CloseBtn onClick={() => setSelectedId(null)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </CloseBtn>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <Logo $bg="rgba(79,142,247,0.15)" $color="#4F8EF7">
                  {getInitials((selectedApp.companyName as string) || '?')}
                </Logo>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#E8EBF4' }}>
                    {selectedApp.companyName as string}
                  </div>
                  {(selectedApp.jobTitle as string) && (
                    <div style={{ fontSize: 12, color: '#6B7A9E', marginTop: 2 }}>
                      {selectedApp.jobTitle as string}
                    </div>
                  )}
                </div>
              </div>
              <DetailSection>
                <h4>Status</h4>
                <StatusSelect value={selectedApp.status as string}>
                  {['Saved', 'Applied', 'Screening', 'Interviewing', 'Offer', 'Accepted', 'Declined', 'Rejected', 'Closed'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </StatusSelect>
              </DetailSection>
            </div>

            {(selectedApp as AppData).recruiter && (
              <DetailSection>
                <h4>Recruiter</h4>
                <RecruiterCard>
                  <RecruiterAvatar>
                    {getInitials((selectedApp as AppData).recruiter?.name || 'R')}
                  </RecruiterAvatar>
                  <RecruiterInfo>
                    <div className="name">{(selectedApp as AppData).recruiter?.name}</div>
                    {(selectedApp as AppData).recruiter?.email && (
                      <div className="email">{(selectedApp as AppData).recruiter?.email}</div>
                    )}
                  </RecruiterInfo>
                </RecruiterCard>
              </DetailSection>
            )}

            <DetailSection>
              <h4>Timeline</h4>
              <InterviewTimeline>
                <InterviewItem>
                  <InterviewDot $color="#4F8EF7" />
                  <InterviewInfo>
                    <div className="type">Applied</div>
                    <div className="date">{timeAgo(selectedApp.createdAt as string)}</div>
                  </InterviewInfo>
                </InterviewItem>
              </InterviewTimeline>
            </DetailSection>

            <div style={{ fontSize: 11, color: '#3A4466', marginTop: 'auto' }}>
              {(selectedApp.createdAt as string | undefined) && `Created ${new Date(selectedApp.createdAt as string).toLocaleDateString()}`}
            </div>
          </DetailPanel>
        </DetailOverlay>
      )}
    </AppShell>
  );
}

export default function ApplicationsPage() {
  return (
    <ProtectedRoute>
      <ApplicationsContent />
    </ProtectedRoute>
  );
}
