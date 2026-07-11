'use client';

import styled from 'styled-components';
import { useApplicationControllerFindByIdQuery } from '@/platform/api/rtk-query/generated/api';

const Panel = styled.aside`
  background-color: ${({ theme }) => theme.colors.sidebarBg};
  border-left: 1px solid ${({ theme }) => theme.colors.borderLight};
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  gap: 28px;
  overflow-y: auto;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: ${({ theme }) => theme.colors.scrollbarThumb}; border-radius: 4px; }
  &::-webkit-scrollbar-thumb:hover { background: ${({ theme }) => theme.colors.scrollbarThumbHover}; }
`;

const TopIdentity = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const IdentityLeft = styled.div`
  display: flex;
  gap: 14px;
  align-items: center;
`;

const BrandBox = styled.div<{ $bg: string }>`
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 20px;
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

const IdentityText = styled.div`
  h2 {
    font-size: 18px;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
    margin: 0;
  }
  p {
    font-size: 13px;
    color: ${({ theme }) => theme.colors.textSecondary};
    margin-top: 1px;
  }
`;

const ActionsRow = styled.div`
  display: flex;
  gap: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 16px;
  cursor: pointer;

  span:hover {
    color: ${({ theme }) => theme.colors.text};
  }
`;

const UrlLink = styled.a`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 13px;
  text-decoration: none;
  margin-top: 6px;
  display: inline-block;

  &:hover {
    text-decoration: underline;
  }
`;

const TagsRow = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 16px;
  flex-wrap: wrap;
`;

const Tag = styled.div<{ $match?: boolean }>`
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 6px;
  background: ${({ $match, theme }) => $match ? `${theme.colors.accent}0f` : theme.colors.surfaceHover};
  border: 1px solid ${({ $match, theme }) => $match ? `${theme.colors.accent}33` : theme.colors.border};
  color: ${({ $match, theme }) => $match ? theme.colors.accent : theme.colors.textSecondary};
  font-weight: ${({ $match }) => $match ? 600 : 400};
`;

const ModuleCard = styled.div`
  background-color: ${({ theme }) => theme.colors.cardBg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  padding: 16px;
`;

const ModuleHead = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const SmallBtn = styled.button`
  background: ${({ theme }) => theme.colors.surfaceHover};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  font-family: inherit;

  &:hover {
    background: ${({ theme }) => theme.colors.cardBg2};
  }
`;

const ColLabel = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const AiSummary = styled.div`
  background: linear-gradient(180deg, ${({ theme }) => theme.colors.purple}14 0%, transparent 100%);
  border: 1px solid ${({ theme }) => theme.colors.purple}26;
  border-radius: 12px;
  padding: 18px;

  h4 {
    font-size: 13px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 6px;
    color: ${({ theme }) => theme.colors.purple};
    margin: 0;
  }
  p {
    font-size: 12.5px;
    color: ${({ theme }) => theme.colors.textSecondary};
    line-height: 1.5;
    margin-top: 10px;
  }
`;

const GradientBtn = styled.button`
  width: 100%;
  text-align: center;
  background: ${({ theme }) => theme.colors.purpleMuted};
  border: 1px solid ${({ theme }) => theme.colors.purple}33;
  border-radius: 8px;
  padding: 8px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.purple};
  font-weight: 600;
  margin-top: 14px;
  cursor: pointer;
  font-family: inherit;

  &:hover {
    background: ${({ theme }) => theme.colors.purple}1a;
  }
`;

const PipelineHeader = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  margin-bottom: 8px;

  span:first-child {
    font-weight: 600;
    font-size: 13px;
    color: ${({ theme }) => theme.colors.text};
  }
  span:last-child {
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

const ProgressTrack = styled.div`
  height: 4px;
  background: ${({ theme }) => theme.colors.borderLight};
  border-radius: 2px;
  margin-bottom: 18px;
`;

const ProgressFill = styled.div<{ $pct: number }>`
  width: ${({ $pct }) => $pct}%;
  height: 100%;
  background: ${({ theme }) => theme.colors.accent};
  border-radius: 2px;
`;

const StepList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const StepRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
`;

const StepLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  color: ${({ theme }) => theme.colors.text};
`;

const Dot = styled.div<{ $passed: boolean }>`
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 1.5px solid ${({ $passed, theme }) => $passed ? theme.colors.accent : theme.colors.textMuted};
  background: ${({ $passed, theme }) => $passed ? theme.colors.accent : 'transparent'};
  position: relative;
  flex-shrink: 0;

  ${({ $passed }) => $passed && `
    &::after {
      content: '\\2713';
      color: #000;
      font-size: 9px;
      font-weight: 900;
      position: absolute;
      left: 2.5px;
      top: -1px;
    }
  `}
`;

const StepDate = styled.span<{ $upcoming?: boolean }>`
  color: ${({ $upcoming, theme }) => $upcoming ? theme.colors.accent : theme.colors.textSecondary};
  font-size: 12px;
`;

const NotesCard = styled.div`
  background: ${({ theme }) => theme.colors.surfaceHover};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  padding: 16px;

  p {
    font-size: 13px;
    color: ${({ theme }) => theme.colors.textSecondary};
    line-height: 1.5;
    margin: 0;
  }
`;

const NotesInput = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: transparent;
  border-radius: 8px;
  padding: 10px 12px;
  margin-top: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const EmptyPanel = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 13px;
  text-align: center;
  padding: 40px;
  line-height: 1.6;
`;

function getCompanyColor(name: string): string {
  const colors = ['#635bff', '#632ca6', '#0ea5e9', '#f97316', '#ec4899', '#06b6d4', '#8b5cf6', '#ef4444'];
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getStatusLabel(status: string): string {
  const s = status.toLowerCase();
  if (s === 'interviewing') return 'Interview';
  if (s === 'screening') return 'Screening';
  if (s === 'offer') return 'Offer';
  if (s === 'rejected') return 'Rejected';
  if (s === 'saved') return 'Saved';
  if (s === 'closed') return 'Closed';
  return 'Applied';
}

function getPipelineSteps(status: string): Array<{ label: string; date: string; passed: boolean }> {
  const steps = [
    { label: 'Application submitted', date: '', passed: true },
    { label: 'Resume tailored', date: '', passed: true },
    { label: 'Initial screening', date: '', passed: false },
    { label: 'Technical interview', date: '', passed: false },
    { label: 'Hiring manager interview', date: '', passed: false },
    { label: 'Final interview', date: '', passed: false },
  ];

  const statusIdx: Record<string, number> = {
    Saved: 0,
    Applied: 1,
    Screening: 2,
    Interviewing: 3,
    Offer: 4,
    Accepted: 5,
    Rejected: 2,
    Closed: 2,
  };

  const idx = statusIdx[status] ?? 1;
  return steps.map((s, i) => ({
    ...s,
    passed: i <= idx,
    date: i <= idx ? 'Done' : i === idx + 1 ? 'Upcoming' : '',
  }));
}

interface InspectorPanelProps {
  applicationId: string | null;
  onClose: () => void;
}

export function InspectorPanel({ applicationId, onClose }: InspectorPanelProps) {
  const { data: detail, isLoading } = useApplicationControllerFindByIdQuery(applicationId!, {
    skip: !applicationId,
  });

  if (!applicationId) {
    return (
      <Panel>
        <EmptyPanel>
          Select an application to view details.
        </EmptyPanel>
      </Panel>
    );
  }

  if (isLoading || !detail) {
    return (
      <Panel>
        <EmptyPanel>Loading...</EmptyPanel>
      </Panel>
    );
  }

  const d = detail as {
    id: string;
    status: string;
    company: { id: string; name: string; domain: string | null; logoUrl: string | null };
    job: { id: string; title: string; location: string | null } | null;
    contacts: Array<{ role: string; recruiter: { id: string; name: string; email: string | null } }>;
    interviews: Array<{ id: string; scheduledAt: string; type: string; status: string }>;
    createdAt: string;
    updatedAt: string;
  };

  const companyName = d.company?.name || 'Company';
  const bgColor = d.company?.logoUrl ? 'transparent' : getCompanyColor(companyName);
  const jobTitle = d.job?.title || 'Position';
  const statusLabel = getStatusLabel(d.status);
  const pipeline = getPipelineSteps(d.status);
  const completedSteps = pipeline.filter(s => s.passed).length;
  const progressPct = Math.round((completedSteps / pipeline.length) * 100);
  const nextInterview = d.interviews?.find(i => new Date(i.scheduledAt) > new Date());

  return (
    <Panel>
      <div>
        <TopIdentity>
          <IdentityLeft>
            <BrandBox $bg={bgColor}>
              {d.company?.logoUrl ? (
                <img src={d.company.logoUrl} alt={companyName} />
              ) : (
                companyName.slice(0, 1)
              )}
            </BrandBox>
            <IdentityText>
              <h2>{companyName}</h2>
              <p>{jobTitle}</p>
            </IdentityText>
          </IdentityLeft>
          <ActionsRow>
            <span onClick={onClose}>{'\u2715'}</span>
          </ActionsRow>
        </TopIdentity>

        {d.company?.domain && (
          <UrlLink href={`https://${d.company.domain}`} target="_blank" rel="noopener noreferrer">
            {d.company.domain}
          </UrlLink>
        )}

        <TagsRow>
          <Tag>{statusLabel}</Tag>
          <Tag $match>High match</Tag>
        </TagsRow>
      </div>

      <ModuleCard>
        <ColLabel style={{ marginBottom: 8 }}>Next Step</ColLabel>
        <ModuleHead>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ fontSize: 18 }}>{'\uD83D\uDCC5'}</span>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: 'inherit' }}>
                {nextInterview ? nextInterview.type : statusLabel}
              </div>
              <div style={{ fontSize: 12, color: 'inherit', marginTop: 1 }}>
                {nextInterview
                  ? `${formatDate(nextInterview.scheduledAt)}`
                  : 'No upcoming steps'}
              </div>
            </div>
          </div>
          <SmallBtn>View details</SmallBtn>
        </ModuleHead>
      </ModuleCard>

      <AiSummary>
        <h4><span>{'\u2726'}</span> AI summary</h4>
        <p>
          {d.job?.title
            ? `You're being considered for ${d.job.title} at ${companyName}. Focus on demonstrating relevant experience and asking insightful questions.`
            : `Track your progress with ${companyName} and prepare for upcoming steps.`}
        </p>
        <GradientBtn>View full analysis {'\u2192'}</GradientBtn>
      </AiSummary>

      <div>
        <PipelineHeader>
          <span>Your progress</span>
          <span>{completedSteps} / {pipeline.length} completed</span>
        </PipelineHeader>
        <ProgressTrack>
          <ProgressFill $pct={progressPct} />
        </ProgressTrack>
        <StepList>
          {pipeline.map((step, i) => (
            <StepRow key={i}>
              <StepLeft>
                <Dot $passed={step.passed} />
                {step.label}
              </StepLeft>
              <StepDate $upcoming={step.date === 'Upcoming'}>
                {step.date === 'Done' ? formatDate(d.createdAt) : step.date || ''}
              </StepDate>
            </StepRow>
          ))}
        </StepList>
      </div>

      {d.contacts && d.contacts.length > 0 && (
        <ModuleCard>
          <ColLabel style={{ marginBottom: 8 }}>Contacts</ColLabel>
          {d.contacts.map((c) => (
            <div key={c.recruiter.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: `${getCompanyColor(c.recruiter.name)}20`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, color: getCompanyColor(c.recruiter.name),
              }}>
                {c.recruiter.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{c.recruiter.name}</div>
                <div style={{ fontSize: 11, color: 'inherit' }}>{c.role}</div>
              </div>
            </div>
          ))}
        </ModuleCard>
      )}

      <NotesCard>
        <ColLabel style={{ marginBottom: 12, display: 'block' }}>Notes & reminders</ColLabel>
        <p>Add notes and reminders for this application.</p>
        <NotesInput>
          <span>Add a note...</span>
          <span>{'\uD83D\uDE80'}</span>
        </NotesInput>
      </NotesCard>
    </Panel>
  );
}
