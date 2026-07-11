'use client';

import styled from 'styled-components';

const Banner = styled.div`
  background-color: ${({ theme }) => theme.colors.cardBg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 14px;
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  width: 45%;
`;

const IconBg = styled.div`
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.accentMuted};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.accent};
  font-size: 18px;
  flex-shrink: 0;
`;

const TextBlock = styled.div`
  h4 {
    font-size: 15px;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
    margin: 0 0 2px;
  }
  p {
    font-size: 12px;
    color: ${({ theme }) => theme.colors.textSecondary};
    line-height: 1.4;
    margin: 0;
  }
`;

const StatsFlex = styled.div`
  display: flex;
  gap: 40px;
`;

const StatBox = styled.div`
  .lbl {
    font-size: 12px;
    color: ${({ theme }) => theme.colors.textSecondary};
    margin-bottom: 4px;
  }
  .val {
    font-size: 22px;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text};
  }
  .change {
    font-size: 11px;
    color: ${({ theme }) => theme.colors.accent};
    font-weight: 600;
    margin-top: 2px;
  }
`;

const MiniChart = styled.div`
  flex-shrink: 0;
`;

interface MomentumProps {
  applications?: number;
  interviews?: number;
  responseRate?: number;
  offers?: number;
}

export function Momentum({ applications = 0, interviews = 0, responseRate = 0, offers = 0 }: MomentumProps) {
  const hasData = applications > 0;

  return (
    <Banner>
      <LeftSection>
        <IconBg>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
          </svg>
        </IconBg>
        <TextBlock>
          <h4>Keep the momentum going</h4>
          <p>
            {hasData
              ? `You've applied to ${applications} companies${interviews > 0 ? ` and have ${interviews} interview${interviews > 1 ? 's' : ''} lined up` : ''}.`
              : 'Start tracking applications to see your progress here.'}
          </p>
        </TextBlock>
      </LeftSection>

      <StatsFlex>
        <StatBox>
          <div className="lbl">Applications</div>
          <div className="val">{applications}</div>
          <div className="change">{applications > 0 ? '↑ Active' : '—'}</div>
        </StatBox>
        <StatBox>
          <div className="lbl">Interviews</div>
          <div className="val">{interviews}</div>
          <div className="change">{interviews > 0 ? '↑ Scheduled' : '—'}</div>
        </StatBox>
        <StatBox>
          <div className="lbl">Offers</div>
          <div className="val">{offers}</div>
          <div className="change">{offers > 0 ? '↑ Received' : '—'}</div>
        </StatBox>
        <StatBox>
          <div className="lbl">Response rate</div>
          <div className="val">{responseRate}%</div>
          <div className="change">{responseRate > 0 ? '↑ Trending' : '—'}</div>
        </StatBox>
      </StatsFlex>

      <MiniChart>
        <svg width="74" height="30" viewBox="0 0 74 30">
          <path
            d={hasData
              ? `M0,28 Q10,${28 - applications} 20,${25 - interviews} T50,${20 - responseRate / 5} T74,${15 - offers}`
              : 'M0,25 Q15,25 30,25 T60,25 T74,25'}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ color: 'var(--accent, #00ca72)' }}
          />
        </svg>
      </MiniChart>
    </Banner>
  );
}
