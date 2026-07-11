'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styled, { useTheme } from 'styled-components';
import { useAuth } from '@/platform/auth/hooks/use-auth';
import {
  useAuthControllerGetGoogleAuthUrlQuery,
  useEmailSyncControllerStartSyncMutation,
} from '@/platform/api/rtk-query/generated/api';
import { AppTheme } from '@/platform/design-system/theme/tokens';

const Page = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.bg};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  position: relative;
  overflow: hidden;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  color: ${({ theme }) => theme.colors.text};
`;

const Glow = styled.div`
  position: absolute;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(79, 142, 247, 0.08) 0%, transparent 70%);
  top: -200px;
  right: -200px;
  pointer-events: none;
`;

const Glow2 = styled.div`
  position: absolute;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(167, 139, 250, 0.06) 0%, transparent 70%);
  bottom: -200px;
  left: -200px;
  pointer-events: none;
`;

const Content = styled.div`
  position: relative;
  z-index: 1;
  max-width: 520px;
  text-align: center;
`;

const Badge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.primaryMuted};
  border: 1px solid ${({ theme }) => theme.colors.primary}26;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 24px;
  letter-spacing: 0.02em;
`;

const Logo = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: ${({ theme }) => `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.purple})`};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
`;

const Title = styled.h1`
  font-size: 36px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 12px;
  letter-spacing: -0.03em;
  line-height: 1.15;
`;

const Highlight = styled.span`
  background: ${({ theme }) => `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.purple})`};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Subtitle = styled.p`
  font-size: 15px;
  line-height: 1.7;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0 0 40px;
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 40px;
  text-align: left;
`;

const Feature = styled.div`
  background: ${({ theme }) => theme.colors.cardBg};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  border-radius: 14px;
  padding: 16px;
`;

const FeatureIcon = styled.div<{ $bg: string; $color: string }>`
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: ${({ $bg }) => $bg};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
  color: ${({ $color }) => $color};

  svg {
    stroke: ${({ $color }) => $color};
  }
`;

const FeatureTitle = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 4px;
`;

const FeatureDesc = styled.div`
  font-size: 11px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const CtaButton = styled.button`
  width: 100%;
  padding: 14px 24px;
  border-radius: 12px;
  border: none;
  background: ${({ theme }) => `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.purple})`};
  color: white;
  font-size: 15px;
  font-weight: 600;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: opacity 0.2s, transform 0.15s;

  &:hover {
    opacity: 0.9;
    transform: scale(1.01);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const Footer = styled.div`
  margin-top: 40px;
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const Spinner = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid ${({ theme }) => theme.colors.primary}33;
  border-top-color: ${({ theme }) => theme.colors.primary};
  margin: 0 auto;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

interface FeatureItem {
  icon: React.ReactNode;
  title: string;
  desc: string;
  color: string;
  bg: string;
}

const FEATURES: FeatureItem[] = [
  {
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    title: 'Auto-track',
    desc: 'Every application sent, detected from email',
    color: '#4F8EF7',
    bg: 'rgba(79, 142, 247, 0.12)',
  },
  {
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    title: 'Recruiter ID',
    desc: 'Names, emails, and context, extracted automatically',
    color: '#A78BFA',
    bg: 'rgba(167, 139, 250, 0.12)',
  },
  {
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    title: 'Interview tracking',
    desc: 'Dates, types, and prep, all in one timeline',
    color: '#34D399',
    bg: 'rgba(52, 211, 153, 0.12)',
  },
  {
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    title: 'AI insights',
    desc: 'Smart analysis of your pipeline and patterns',
    color: '#F59E0B',
    bg: 'rgba(245, 158, 11, 0.12)',
  },
];

export default function HomePage() {
  const router = useRouter();
  const theme = useTheme() as AppTheme;
  const { isAuthenticated, isLoading: authLoading, isFetching } = useAuth();
  const { data: authUrlData, isLoading: urlLoading } = useAuthControllerGetGoogleAuthUrlQuery();
  const [startSync] = useEmailSyncControllerStartSyncMutation();
  const authUrl = authUrlData as { url: string } | undefined;

  useEffect(() => {
    if (!authLoading && !isFetching && isAuthenticated) {
      startSync();
      router.replace('/dashboard');
    }
  }, [isAuthenticated, authLoading, isFetching, router, startSync]);

  const handleConnect = () => {
    if (authUrl?.url) {
      window.location.href = authUrl.url;
    }
  };

  if (authLoading) {
    return (
      <Page>
        <Content>
          <Spinner />
        </Content>
      </Page>
    );
  }

  return (
    <Page>
      <Glow />
      <Glow2 />
      <Content>
        <Logo>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
        </Logo>

        <Badge>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
          AI-powered career tracking
        </Badge>

        <Title>
          Your Career,<br />
          <Highlight>Intelligently Organized</Highlight>
        </Title>

        <Subtitle>
          Connect your Gmail once. CareerOS automatically extracts every job application,
          interview invite, recruiter detail, and offer letter — organized in real time.
        </Subtitle>

        <FeatureGrid>
          {FEATURES.map((f) => (
            <Feature key={f.title}>
              <FeatureIcon $bg={f.bg} $color={f.color}>
                {f.icon}
              </FeatureIcon>
              <FeatureTitle>{f.title}</FeatureTitle>
              <FeatureDesc>{f.desc}</FeatureDesc>
            </Feature>
          ))}
        </FeatureGrid>

        <CtaButton onClick={handleConnect} disabled={urlLoading}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
          Connect with Google
        </CtaButton>

        <Footer>
          Your email data is encrypted. Only job-related emails are processed.
        </Footer>
      </Content>
    </Page>
  );
}
