'use client';

import styled from 'styled-components';
import { useAuth } from '@/platform/auth/hooks/use-auth';

const Wrapper = styled.div`
  border-radius: 24px;
  padding: 24px;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #1E3A8A 0%, #1D4ED8 40%, #2563EB 70%, #3B82F6 100%);
  min-height: 180px;
`;

const Sheen = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
`;

const Net = styled.div`
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 260px;
  pointer-events: none;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at right, transparent 0%, #1E3A8A 65%);
  }
`;

const Content = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Tag = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  background: rgba(255,255,255,0.15);
  color: white;
  width: fit-content;
`;

const Title = styled.h2`
  font-size: 19px;
  font-weight: 700;
  color: white;
  margin: 0;
`;

const Summary = styled.p`
  font-size: 12px;
  line-height: 1.6;
  color: rgba(255,255,255,0.75);
  max-width: 420px;
  margin: 0;
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
`;

const BtnGhost = styled.a`
  padding: 8px 16px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255,255,255,0.18);
  border: 1px solid rgba(255,255,255,0.2);
  backdrop-filter: blur(8px);
  font-family: ${({ theme }) => theme.typography.fontFamily};
  transition: transform 0.1s;
  text-decoration: none;

  &:hover { transform: scale(1.02); }
`;

const BtnSolid = styled.a`
  padding: 8px 16px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  color: #1D4ED8;
  background: rgba(255,255,255,0.95);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  border: none;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  transition: transform 0.1s;
  text-decoration: none;

  &:hover { transform: scale(1.02); }
`;

function NetSvg() {
  return (
    <svg width="260" height="188" viewBox="0 0 260 188" fill="none" opacity="0.18">
      <circle cx="200" cy="94" r="120" stroke="white" strokeWidth="0.5" />
      <circle cx="200" cy="94" r="80" stroke="white" strokeWidth="0.5" />
      <circle cx="200" cy="94" r="40" stroke="white" strokeWidth="0.5" />
      <line x1="80" y1="10" x2="200" y2="94" stroke="white" strokeWidth="0.5" />
      <line x1="60" y1="60" x2="200" y2="94" stroke="white" strokeWidth="0.5" />
      <line x1="70" y1="140" x2="200" y2="94" stroke="white" strokeWidth="0.5" />
      <line x1="110" y1="170" x2="200" y2="94" stroke="white" strokeWidth="0.5" />
      <circle cx="80" cy="10" r="3" fill="white" />
      <circle cx="60" cy="60" r="3" fill="white" />
      <circle cx="70" cy="140" r="3" fill="white" />
      <circle cx="110" cy="170" r="3" fill="white" />
      <circle cx="200" cy="94" r="6" fill="white" fillOpacity="0.5" />
    </svg>
  );
}

interface HeroFocusProps {
  isEmpty?: boolean;
}

export function HeroFocus({ isEmpty }: HeroFocusProps) {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <Wrapper>
      <Sheen />
      <Net>
        <NetSvg />
      </Net>
      <Content>
        <Tag>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="1">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
          AI Focus Mode
        </Tag>
        {isEmpty ? (
          <>
            <Title>Welcome to CareerOS</Title>
            <Summary>We are organizing your career and preparing personalized insights.</Summary>
          </>
        ) : (
          <>
            <Title>Strong momentum this week, {firstName}.</Title>
            <Summary>You have a Figma interview tomorrow and 3 applications awaiting response. Your career score rose 4 points — you are in the top 15% of active candidates.</Summary>
            <Actions>
              <BtnGhost href="#">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9.5 2A2.5 2.5 0 0112 4.5v15a2.5 2.5 0 01-4.96-.46 2.5 2.5 0 01-1.07-3.45A3.5 3.5 0 018 9.5v-3A2.5 2.5 0 019.5 2zM14.5 2A2.5 2.5 0 0112 4.5v15a2.5 2.5 0 004.96-.46 2.5 2.5 0 001.07-3.45A3.5 3.5 0 0116 9.5v-3A2.5 2.5 0 0014.5 2z" />
                </svg>
                Prep for Interview
              </BtnGhost>
              <BtnSolid href="#">
                View Action Plan
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" />
                </svg>
              </BtnSolid>
            </Actions>
          </>
        )}
      </Content>
    </Wrapper>
  );
}
