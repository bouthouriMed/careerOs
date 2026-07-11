'use client';

import styled from 'styled-components';
import type { Signal } from '../page';

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
`;

const Card = styled.div`
  background-color: ${({ theme }) => theme.colors.cardBg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 14px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 290px;
`;

const CardTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
`;

const TagLabel = styled.span<{ $color: string }>`
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${({ $color }) => $color};
`;

const BadgePill = styled.span<{ $accent?: boolean }>`
  font-size: 11px;
  background: ${({ $accent, theme }) => $accent ? 'transparent' : theme.colors.borderLight};
  color: ${({ $accent, theme }) => $accent ? theme.colors.accent : theme.colors.textSecondary};
  padding: 4px 8px;
  border-radius: 6px;
  ${({ $accent }) => $accent && 'font-weight: 600; font-size: 13px;'}
`;

const CompanyRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
`;

const CompanyIcon = styled.div<{ $bg: string }>`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 18px;
  background: ${({ $bg }) => $bg};
  color: white;
  overflow: hidden;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const CompanyInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

const CompanyName = styled.h4`
  font-size: 15px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CompanyRole = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const MetaPills = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
`;

const MetaPill = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  display: flex;
  align-items: center;
  gap: 4px;
`;

const CardBody = styled.div`
  h4 {
    font-size: 14px;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
    margin: 0 0 4px;
  }
  p {
    font-size: 13px;
    color: ${({ theme }) => theme.colors.textSecondary};
    line-height: 1.4;
    margin: 0;
  }
`;

const CardFooter = styled.div`
  margin-top: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
`;

const PurpleBtn = styled.button`
  background-color: ${({ theme }) => theme.colors.purpleMuted};
  color: ${({ theme }) => theme.colors.purple};
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.purple}22;
  }
`;

const OrangeOutlineBtn = styled.button`
  background: ${({ theme }) => theme.colors.orangeMuted};
  border: 1px solid ${({ theme }) => theme.colors.orange}33;
  color: ${({ theme }) => theme.colors.orange};
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  text-align: center;
  flex-grow: 1;
  font-family: inherit;
  transition: background 0.15s;

  &:hover {
    background: ${({ theme }) => theme.colors.orange}1a;
  }
`;

const GreenBtn = styled.button`
  background-color: ${({ theme }) => theme.colors.accentMuted};
  color: ${({ theme }) => theme.colors.accent};
  border: 1px solid ${({ theme }) => theme.colors.accent}33;
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.accent}22;
  }
`;

const TextBtn = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 13px;
  cursor: pointer;
  font-family: inherit;
  transition: color 0.15s;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }
`;

const EmptyCard = styled.div`
  background-color: ${({ theme }) => theme.colors.cardBg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 14px;
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 290px;
`;

const EmptyText = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textMuted};
  margin: 0;
  text-align: center;
  line-height: 1.5;
`;

interface WhatsNextProps {
  signals?: Signal[];
}

function getCompanyColor(name: string): string {
  const colors = ['#635bff', '#632ca6', '#0ea5e9', '#f97316', '#ec4899', '#06b6d4', '#8b5cf6', '#ef4444'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function getTagConfig(type: string): { label: string; color: string } {
  switch (type) {
    case 'Action': return { label: 'Action Required', color: '#a855f7' };
    case 'Reminder': return { label: 'Reminder', color: '#f97316' };
    case 'Insight': return { label: 'Insight', color: '#0ea5e9' };
    case 'Offer': return { label: 'Opportunity', color: '#00ca72' };
    default: return { label: type, color: '#8591a3' };
  }
}

function formatUrgency(expiresAt?: string): string {
  if (!expiresAt) return '';
  const diff = new Date(expiresAt).getTime() - Date.now();
  const days = Math.floor(diff / 86400000);
  if (days < 0) return 'Overdue';
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `${days} days left`;
}

function getActionButton(type: string): { label: string; Component: typeof PurpleBtn } {
  switch (type) {
    case 'Action': return { label: 'Prepare now →', Component: PurpleBtn };
    case 'Reminder': return { label: 'View details →', Component: OrangeOutlineBtn };
    case 'Insight': return { label: 'View update →', Component: GreenBtn };
    default: return { label: 'Take action →', Component: PurpleBtn };
  }
}

export function WhatsNext({ signals = [] }: WhatsNextProps) {
  if (signals.length === 0) {
    return (
      <Grid>
        <EmptyCard>
          <EmptyText>
            Signals from your applications will appear here as your career progresses.
          </EmptyText>
        </EmptyCard>
        <EmptyCard>
          <EmptyText>
            AI-detected insights and actions will surface automatically.
          </EmptyText>
        </EmptyCard>
      </Grid>
    );
  }

  const display = signals.slice(0, 4);

  return (
    <Grid>
      {display.map((signal) => {
        const companyName = signal.company?.name || 'Company';
        const companyColor = getCompanyColor(companyName);
        const jobTitle = signal.application?.job?.title || signal.title;
        const tagConfig = getTagConfig(signal.type);
        const urgency = formatUrgency(signal.expiresAt);
        const conf = Math.round(signal.confidence * 100);
        const action = getActionButton(signal.type);
        const ActionBtn = action.Component;

        return (
          <Card key={signal.id}>
            <div>
              <CardTop>
                <TagLabel $color={tagConfig.color}>{tagConfig.label}</TagLabel>
                {urgency ? (
                  <BadgePill>{urgency}</BadgePill>
                ) : (
                  <BadgePill $accent>{conf}%</BadgePill>
                )}
              </CardTop>

              <CompanyRow>
                <CompanyIcon $bg={companyColor}>
                  {signal.company?.logoUrl ? (
                    <img src={signal.company.logoUrl} alt={companyName} />
                  ) : (
                    companyName.slice(0, 1)
                  )}
                </CompanyIcon>
                <CompanyInfo>
                  <CompanyName>{companyName}</CompanyName>
                  <CompanyRole>{jobTitle}</CompanyRole>
                </CompanyInfo>
              </CompanyRow>

              <MetaPills>
                {signal.expiresAt && (
                  <MetaPill>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                    </svg>
                    {urgency}
                  </MetaPill>
                )}
                <MetaPill>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
                  </svg>
                  {conf}% confidence
                </MetaPill>
                <MetaPill>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
                  </svg>
                  {signal.type}
                </MetaPill>
              </MetaPills>

              <CardBody>
                <h4>{signal.title}</h4>
                <p>{signal.description}</p>
              </CardBody>
            </div>

            <CardFooter>
              <ActionBtn>{action.label}</ActionBtn>
              <TextBtn>Dismiss</TextBtn>
            </CardFooter>
          </Card>
        );
      })}
    </Grid>
  );
}
