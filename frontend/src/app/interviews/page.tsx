'use client';

import { ProtectedRoute } from '@/platform/routing/protected-route';
import { AppShell } from '@/platform/layout/AppShell';
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
  margin: 0;
`;

function InterviewsContent() {
  return (
    <AppShell>
      <PageTitle>Interviews</PageTitle>
      <PageDesc>Prepare for upcoming interviews and review past sessions.</PageDesc>
    </AppShell>
  );
}

export default function InterviewsPage() {
  return (
    <ProtectedRoute>
      <InterviewsContent />
    </ProtectedRoute>
  );
}
