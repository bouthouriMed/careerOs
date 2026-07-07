'use client';

import { useEffect, useRef } from 'react';
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

const ChartWrap = styled.div`
  height: 56px;
  position: relative;
  margin-top: 8px;
`;

const ScoreWrap = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px 0;
`;

const ScoreRing = styled.div`
  position: relative;
  width: 110px;
  height: 110px;
`;

const ScoreRingSvg = styled.svg`
  transform: rotate(-125deg);
`;

const ScoreRingLabel = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const ScoreNum = styled.span`
  font-size: 26px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textDark};
  line-height: 1;
`;

const ScoreDen = styled.span`
  font-size: 10px;
  color: ${({ theme }) => theme.colors.dim};
`;

const SubScores = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: 4px;
`;

const SubScore = styled.div`
  text-align: center;
`;

const SubScoreVal = styled.div`
  font-size: 12px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textDark};
`;

const SubBarTrack = styled.div`
  height: 3px;
  border-radius: 9px;
  background: rgba(255,255,255,0.08);
  margin: 4px 0;
  overflow: hidden;
`;

const SubBarFill = styled.div<{ $width: number; $color: string }>`
  height: 100%;
  border-radius: 9px;
  width: ${({ $width }) => $width}%;
  background: ${({ $color }) => $color};
`;

const SubScoreLabel = styled.div`
  font-size: 10px;
  color: ${({ theme }) => theme.colors.dim};
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

const ActionRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px;
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.card2};
  margin-bottom: 6px;
  cursor: pointer;
  transition: background 0.1s;

  &:last-child { margin-bottom: 0; }
  &:hover { background: rgba(255,255,255,0.06); }
`;

const ActionText = styled.div`
  font-size: 11px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textDark};
  flex: 1;
`;

const PriorityBadge = styled.span<{ $bg: string; $color: string }>`
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 5px;
  flex-shrink: 0;
  background: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
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

const OppCard = styled.div`
  background: ${({ theme }) => theme.colors.card2};
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: transform 0.15s;

  &:last-child { margin-bottom: 0; }
  &:hover { transform: scale(1.01); }
`;

const OppTop = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const OppCompany = styled.div`
  font-size: 12px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textDark};
`;

const OppRole = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.dim};
`;

const OppMatch = styled.span<{ $bg: string; $color: string }>`
  font-size: 12px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 8px;
  background: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
`;

const OppMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const OppMetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  color: ${({ theme }) => theme.colors.muted};
`;

const OppDivider = styled.div`
  width: 1px;
  height: 12px;
  background: rgba(255,255,255,0.1);
`;

interface AIPanelProps {
  isEmpty?: boolean;
}

export function AIPanel({ isEmpty }: AIPanelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isEmpty || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth * 2;
    canvas.height = 56 * 2;
    ctx.scale(2, 2);

    const grad = ctx.createLinearGradient(0, 0, 0, 56);
    grad.addColorStop(0, 'rgba(79,142,247,0.35)');
    grad.addColorStop(1, 'rgba(79,142,247,0)');

    const points = [3, 7, 4, 9, 6, 2, 5];
    const cw = canvas.offsetWidth;
    const stepX = cw / (points.length - 1);

    ctx.beginPath();
    ctx.moveTo(0, 56);
    ctx.lineTo(0, 56 - (points[0] / 10) * 44 - 6);
    for (let i = 1; i < points.length; i++) {
      const x = i * stepX;
      const y = 56 - (points[i] / 10) * 44 - 6;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(cw, 56);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0, 56 - (points[0] / 10) * 44 - 6);
    for (let i = 1; i < points.length; i++) {
      const x = i * stepX;
      const y = 56 - (points[i] / 10) * 44 - 6;
      ctx.lineTo(x, y);
    }
    ctx.strokeStyle = '#4F8EF7';
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [isEmpty]);

  if (isEmpty) {
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
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6B7A9E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ cursor: 'pointer' }}>
          <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
        </svg>
      </CopilotHeader>

      {/* Today's Summary */}
      <CpCard>
        <CpSectionLabel $color="#4F8EF7">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
          </svg>
          Today&apos;s Summary
        </CpSectionLabel>
        <CpBody>You&apos;ve applied to <strong>3 roles</strong> today and have a high-priority interview prep session due. Your pipeline is healthy — focus on the Figma interview tomorrow.</CpBody>
        <ChartWrap>
          <canvas ref={canvasRef} style={{ width: '100%', height: 56 }} />
        </ChartWrap>
      </CpCard>

      {/* Career Score */}
      <CpCard>
        <CpSectionLabel $color="#F59E0B">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
          </svg>
          Career Score
          <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 999, background: 'rgba(52,211,153,0.12)', color: '#34D399', textTransform: 'none', letterSpacing: 0 }}>+4 pts</span>
        </CpSectionLabel>
        <ScoreWrap>
          <ScoreRing>
            <ScoreRingSvg width="110" height="110" viewBox="0 0 110 110">
              <circle cx="55" cy="55" r="44" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" strokeLinecap="round" strokeDasharray="234" strokeDashoffset="0" />
              <circle cx="55" cy="55" r="44" fill="none" stroke="#4F8EF7" strokeWidth="8" strokeLinecap="round" strokeDasharray="234" strokeDashoffset="51" style={{ filter: 'drop-shadow(0 0 6px rgba(79,142,247,0.5))' }} />
            </ScoreRingSvg>
            <ScoreRingLabel>
              <ScoreNum>78</ScoreNum>
              <ScoreDen>/ 100</ScoreDen>
            </ScoreRingLabel>
          </ScoreRing>
        </ScoreWrap>
        <SubScores>
          <SubScore>
            <SubScoreVal>85</SubScoreVal>
            <SubBarTrack><SubBarFill $width={85} $color="#4F8EF7" /></SubBarTrack>
            <SubScoreLabel>Activity</SubScoreLabel>
          </SubScore>
          <SubScore>
            <SubScoreVal>62</SubScoreVal>
            <SubBarTrack><SubBarFill $width={62} $color="#A78BFA" /></SubBarTrack>
            <SubScoreLabel>Network</SubScoreLabel>
          </SubScore>
          <SubScore>
            <SubScoreVal>70</SubScoreVal>
            <SubBarTrack><SubBarFill $width={70} $color="#34D399" /></SubBarTrack>
            <SubScoreLabel>Prep</SubScoreLabel>
          </SubScore>
        </SubScores>
      </CpCard>

      {/* AI Insights */}
      <CpCard>
        <CpSectionLabel $color="#A78BFA">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9.5 2A2.5 2.5 0 0112 4.5v15a2.5 2.5 0 01-4.96-.46 2.5 2.5 0 01-1.07-3.45A3.5 3.5 0 018 9.5v-3A2.5 2.5 0 019.5 2z" /><path d="M14.5 2A2.5 2.5 0 0112 4.5v15a2.5 2.5 0 004.96-.46 2.5 2.5 0 001.07-3.45A3.5 3.5 0 0116 9.5v-3A2.5 2.5 0 0014.5 2z" />
          </svg>
          AI Insights
        </CpSectionLabel>
        <InsightRow>
          <InsightIcon><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg></InsightIcon>
          <InsightText>Your response rate is 31% — top 15% of active job seekers.</InsightText>
        </InsightRow>
        <InsightRow>
          <InsightIcon><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg></InsightIcon>
          <InsightText>3 applications have gone 14+ days without a response. Consider following up.</InsightText>
        </InsightRow>
        <InsightRow>
          <InsightIcon><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0112 4.5v15a2.5 2.5 0 01-4.96-.46" /><path d="M14.5 2A2.5 2.5 0 0112 4.5v15a2.5 2.5 0 004.96-.46" /></svg></InsightIcon>
          <InsightText>Figma interview tomorrow — your prep score is 68%. Practice system design.</InsightText>
        </InsightRow>
      </CpCard>

      {/* Recommended Actions */}
      <CpCard>
        <CpSectionLabel $color="#34D399">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          Recommended Actions
        </CpSectionLabel>
        <ActionRow>
          <ActionText>Prep system design for Figma interview</ActionText>
          <PriorityBadge $bg="rgba(239,68,68,0.15)" $color="#EF4444">High</PriorityBadge>
        </ActionRow>
        <ActionRow>
          <ActionText>Follow up on Vercel application (14 days)</ActionText>
          <PriorityBadge $bg="rgba(245,158,11,0.15)" $color="#F59E0B">Medium</PriorityBadge>
        </ActionRow>
        <ActionRow>
          <ActionText>Update LinkedIn with recent projects</ActionText>
          <PriorityBadge $bg="rgba(107,122,158,0.15)" $color="#6B7A9E">Low</PriorityBadge>
        </ActionRow>
      </CpCard>

      {/* Upcoming Interviews */}
      <CpCard>
        <CpSectionLabel $color="#4F8EF7">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          Upcoming Interviews
          <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 999, background: 'rgba(79,142,247,0.15)', color: '#4F8EF7', textTransform: 'none', letterSpacing: 0 }}>3</span>
        </CpSectionLabel>
        <IvRow>
          <IvLogo $bg="rgba(167,139,250,0.2)" $color="#A78BFA">F</IvLogo>
          <IvInfo>
            <IvCompany>Figma</IvCompany>
            <IvRole>Staff PM · Round 2</IvRole>
          </IvInfo>
          <IvTime>
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#6B7A9E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            Tomorrow
          </IvTime>
        </IvRow>
        <IvRow>
          <IvLogo $bg="rgba(79,142,247,0.2)" $color="#4F8EF7">A</IvLogo>
          <IvInfo>
            <IvCompany>Arc</IvCompany>
            <IvRole>Product Lead · Intro</IvRole>
          </IvInfo>
          <IvTime>
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#6B7A9E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            Thu
          </IvTime>
        </IvRow>
        <IvRow>
          <IvLogo $bg="rgba(52,211,153,0.2)" $color="#34D399">S</IvLogo>
          <IvInfo>
            <IvCompany>Stripe</IvCompany>
            <IvRole>Senior PM · Technical</IvRole>
          </IvInfo>
          <IvTime>
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#6B7A9E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            Fri
          </IvTime>
        </IvRow>
      </CpCard>

      {/* Opportunity Radar */}
      <CpCard>
        <CpSectionLabel $color="#F59E0B">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          Opportunity Radar
        </CpSectionLabel>
        <OppCard>
          <OppTop>
            <div>
              <OppCompany>Raycast</OppCompany>
              <OppRole>Head of Product</OppRole>
            </div>
            <OppMatch $bg="rgba(52,211,153,0.15)" $color="#34D399">94%</OppMatch>
          </OppTop>
          <OppMeta>
            <OppMetaItem>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>
              $200–240K
            </OppMetaItem>
            <OppDivider />
            <OppMetaItem>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
              Remote
            </OppMetaItem>
          </OppMeta>
        </OppCard>
        <OppCard>
          <OppTop>
            <div>
              <OppCompany>Loom</OppCompany>
              <OppRole>Senior PM</OppRole>
            </div>
            <OppMatch $bg="rgba(79,142,247,0.15)" $color="#4F8EF7">88%</OppMatch>
          </OppTop>
          <OppMeta>
            <OppMetaItem>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>
              $170–200K
            </OppMetaItem>
            <OppDivider />
            <OppMetaItem>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
              SF / Remote
            </OppMetaItem>
          </OppMeta>
        </OppCard>
      </CpCard>

      <div style={{ height: 8 }} />
    </Panel>
  );
}
