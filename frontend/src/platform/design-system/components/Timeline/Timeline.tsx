'use client';

import { ReactNode } from 'react';
import styled from 'styled-components';

const TimelineRoot = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

interface TimelineProps {
  children: ReactNode;
}

export function Timeline({ children }: TimelineProps) {
  return <TimelineRoot>{children}</TimelineRoot>;
}
