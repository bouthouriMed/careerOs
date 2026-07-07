'use client';

import styled, { keyframes } from 'styled-components';
import { useTranslation } from '@/platform/i18n/use-translation';
import { GoogleLoginButton } from '@/platform/auth/components/google-login-button';

/* ── Animations ── */

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;

/* ── Layout ── */

const Page = styled.main`
  min-height: 100vh;
  background: linear-gradient(
    180deg,
    ${({ theme }) => theme.colors.primary}04 0%,
    ${({ theme }) => theme.colors.surface} 30%,
    ${({ theme }) => theme.colors.background} 60%
  );
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Container = styled.div`
  width: 100%;
  max-width: 1120px;
  padding: 0 ${({ theme }) => theme.spacing.xl};
  margin: 0 auto;
`;

/* ── Header ── */

const Header = styled.header`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.xl} 0;
  animation: ${fadeIn} 0.5s ease-out;
`;

const Logo = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.text};
  letter-spacing: -0.02em;
`;

const LogoAccent = styled.span`
  color: ${({ theme }) => theme.colors.primary};
`;

/* ── Hero ── */

const HeroSection = styled.section`
  padding: ${({ theme }) => theme.spacing.xxl} 0 ${({ theme }) => theme.spacing.xl};
  text-align: center;
  max-width: 720px;
  margin: 0 auto;
  animation: ${fadeIn} 0.6s ease-out 0.1s both;
`;

const HeroHeadline = styled.h1`
  font-size: 48px;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.15;
  letter-spacing: -0.03em;
  margin: 0 0 ${({ theme }) => theme.spacing.md};
`;

const HeroSubhead = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.6;
  margin: 0 0 ${({ theme }) => theme.spacing.xl};
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

const HeroActions = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const CtaWrapper = styled.div`
  width: 280px;
`;

const TrustRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const TrustDot = styled.span`
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.border};
`;

const TrustItem = styled.span``;

/* ── Sections ── */

const Section = styled.section`
  padding: ${({ theme }) => theme.spacing.xxl} 0;
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xxl};
  animation: ${fadeIn} 0.5s ease-out both;
`;

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.sizes.xxl};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.text};
  letter-spacing: -0.02em;
  margin: 0 0 ${({ theme }) => theme.spacing.sm};
`;

const SectionDesc = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
  max-width: 520px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
`;

/* ── Feature Cards ── */

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${({ theme }) => theme.spacing.xl};
  animation: ${fadeIn} 0.6s ease-out 0.2s both;

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing.lg};
  }
`;

const FeatureCard = styled.div`
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xl};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  transition: box-shadow 0.2s ease, border-color 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary}30;
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
`;

const FeatureIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.primary}10;
  color: ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const FeatureTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const FeatureText = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
  line-height: 1.6;
`;

/* ── Steps ── */

const StepsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${({ theme }) => theme.spacing.xl};
  position: relative;

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing.lg};
  }
`;

const StepCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const StepNumber = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.primary};
  text-transform: uppercase;
  letter-spacing: 0.08em;
`;

const StepTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const StepDesc = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
  line-height: 1.6;
`;

/* ── CTA Section ── */

const CtaSection = styled.section`
  padding: ${({ theme }) => theme.spacing.xxl} 0 ${({ theme }) => theme.spacing.xl};
  text-align: center;
  animation: ${fadeIn} 0.5s ease-out both;
`;

const CtaTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.sizes.xxl};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  color: ${({ theme }) => theme.colors.text};
  letter-spacing: -0.02em;
  margin: 0 0 ${({ theme }) => theme.spacing.lg};
`;

const CtaSubtext = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0 0 ${({ theme }) => theme.spacing.xl};
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
`;

/* ── Footer ── */

const Footer = styled.footer`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.lg} 0;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  margin-top: auto;
  animation: ${fadeIn} 0.5s ease-out 0.4s both;
`;

const FooterContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

/* ── Page ── */

export default function LoginPage() {
  const { t } = useTranslation();

  return (
    <Page>
      <Container>
        <Header>
          <Logo>
            Career<LogoAccent>OS</LogoAccent>
          </Logo>
        </Header>

        <HeroSection>
          <HeroHeadline>{t('platform.auth.login.hero.headline')}</HeroHeadline>
          <HeroSubhead>{t('platform.auth.login.hero.subhead')}</HeroSubhead>
          <HeroActions>
            <CtaWrapper>
              <GoogleLoginButton />
            </CtaWrapper>
            <TrustRow>
              <TrustItem>{t('platform.auth.login.trust.free')}</TrustItem>
              <TrustDot />
              <TrustItem>{t('platform.auth.login.trust.secure')}</TrustItem>
              <TrustDot />
              <TrustItem>{t('platform.auth.login.trust.gmail')}</TrustItem>
            </TrustRow>
          </HeroActions>
        </HeroSection>

        <Section>
          <FeatureGrid>
            <FeatureCard>
              <FeatureIcon>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16v4H4z" /><path d="M4 10h16v4H4z" /><path d="M4 16h16v4H4z" />
                </svg>
              </FeatureIcon>
              <FeatureTitle>{t('platform.auth.login.features.autoImport.title')}</FeatureTitle>
              <FeatureText>{t('platform.auth.login.features.autoImport.description')}</FeatureText>
            </FeatureCard>

            <FeatureCard>
              <FeatureIcon>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              </FeatureIcon>
              <FeatureTitle>{t('platform.auth.login.features.aiInsights.title')}</FeatureTitle>
              <FeatureText>{t('platform.auth.login.features.aiInsights.description')}</FeatureText>
            </FeatureCard>

            <FeatureCard>
              <FeatureIcon>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </FeatureIcon>
              <FeatureTitle>{t('platform.auth.login.features.tracking.title')}</FeatureTitle>
              <FeatureText>{t('platform.auth.login.features.tracking.description')}</FeatureText>
            </FeatureCard>
          </FeatureGrid>
        </Section>

        <Section>
          <SectionHeader>
            <SectionTitle>{t('platform.auth.login.howItWorks.connect.title')}</SectionTitle>
            <SectionDesc>{t('platform.auth.login.description')}</SectionDesc>
          </SectionHeader>
          <StepsGrid>
            <StepCard>
              <StepNumber>01</StepNumber>
              <StepTitle>{t('platform.auth.login.howItWorks.connect.title')}</StepTitle>
              <StepDesc>{t('platform.auth.login.howItWorks.connect.description')}</StepDesc>
            </StepCard>
            <StepCard>
              <StepNumber>02</StepNumber>
              <StepTitle>{t('platform.auth.login.howItWorks.sync.title')}</StepTitle>
              <StepDesc>{t('platform.auth.login.howItWorks.sync.description')}</StepDesc>
            </StepCard>
            <StepCard>
              <StepNumber>03</StepNumber>
              <StepTitle>{t('platform.auth.login.howItWorks.insights.title')}</StepTitle>
              <StepDesc>{t('platform.auth.login.howItWorks.insights.description')}</StepDesc>
            </StepCard>
          </StepsGrid>
        </Section>

        <CtaSection>
          <CtaTitle>{t('platform.auth.login.cta.title')}</CtaTitle>
          <CtaSubtext>{t('platform.auth.login.tagline')}</CtaSubtext>
          <CtaWrapper style={{ margin: '0 auto' }}>
            <GoogleLoginButton />
          </CtaWrapper>
        </CtaSection>
      </Container>

      <Footer>
        <Container>
          <FooterContent>
            <span>CareerOS</span>
            <span>{t('platform.auth.login.footer.copyright')}</span>
          </FooterContent>
        </Container>
      </Footer>
    </Page>
  );
}
