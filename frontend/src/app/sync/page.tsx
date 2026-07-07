'use client';

import { ProtectedRoute } from '@/platform/routing/protected-route';
import { AppShell } from '@/platform/layout/AppShell';
import { useEmailSyncControllerGetStatusQuery } from '@/platform/api/rtk-query/generated/api';
import styled from 'styled-components';

const PageTitle = styled.h1`
  font-size: 20px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textDark};
  margin: 0 0 8px;
`;

const PageDesc = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.dim};
  margin: 0 0 24px;
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.borderDark};
  border-radius: 20px;
  padding: 32px;
  text-align: center;
  max-width: 480px;
`;

const CardTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textDark};
  margin: 16px 0 8px;
`;

const CardText = styled.p`
  font-size: 13px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.dim};
  margin: 0;
`;

const Spinner = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 3px solid rgba(79,142,247,0.2);
  border-top-color: #4F8EF7;
  margin: 0 auto;
`;

function SyncContent() {
  const { data: syncStatus, isLoading } = useEmailSyncControllerGetStatusQuery(undefined, {
    pollingInterval: 5000,
  });

  const status = syncStatus?.status;

  return (
    <AppShell>
      <PageTitle>Email Sync</PageTitle>
      <PageDesc>Connect your email to automatically track job applications.</PageDesc>

      <Card>
        {isLoading ? (
          <>
            <Spinner />
            <CardTitle>Checking sync status...</CardTitle>
          </>
        ) : status === 'never_synced' ? (
          <>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#4F8EF7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
            </svg>
            <CardTitle>Connect Your Email</CardTitle>
            <CardText>Sync your email inbox to automatically detect job applications, interview invitations, and offer letters. CareerOS will parse the emails and organize everything for you.</CardText>
          </>
        ) : status === 'pending' ? (
          <>
            <Spinner />
            <CardTitle>Syncing your inbox...</CardTitle>
            <CardText>We are scanning your emails for job-related content. This usually takes a few minutes.</CardText>
          </>
        ) : status === 'completed' ? (
          <>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <CardTitle>Sync Complete</CardTitle>
            <CardText>Your email is connected and applications are being tracked. You can now view your dashboard.</CardText>
          </>
        ) : (
          <>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <CardTitle>Sync Error</CardTitle>
            <CardText>We encountered an issue syncing your email. Please check your connection and try again.</CardText>
          </>
        )}
      </Card>
    </AppShell>
  );
}

export default function SyncPage() {
  return (
    <ProtectedRoute>
      <SyncContent />
    </ProtectedRoute>
  );
}
