'use client';

import { ProtectedRoute } from '@/platform/routing/protected-route';
import { AppShell } from '@/platform/layout/AppShell';
import styled from 'styled-components';

const PageTitle = styled.h1`
  font-size: 20px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 8px;
`;

const PageDesc = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textMuted};
  margin: 0;
`;

function DocumentsContent() {
  return (
    <AppShell>
      <PageTitle>Documents</PageTitle>
      <PageDesc>Manage your resumes, cover letters, and portfolio materials.</PageDesc>
    </AppShell>
  );
}

export default function DocumentsPage() {
  return (
    <ProtectedRoute>
      <DocumentsContent />
    </ProtectedRoute>
  );
}
