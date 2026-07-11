'use client';

import { ReactNode } from 'react';
import styled from 'styled-components';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

const Shell = styled.div`
  display: grid;
  grid-template-columns: 220px 1fr 300px;
  height: 100vh;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.bg};
`;

const Main = styled.main`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
`;

const Workspace = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.scrollbarThumb};
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.scrollbarThumbHover};
  }
`;

interface AppShellProps {
  children: ReactNode;
  rightPanel?: ReactNode;
}

export function AppShell({ children, rightPanel }: AppShellProps) {
  return (
    <Shell>
      <Sidebar />
      <Main>
        <TopBar />
        <Workspace>{children}</Workspace>
      </Main>
      {rightPanel}
    </Shell>
  );
}
