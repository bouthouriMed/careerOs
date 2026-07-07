'use client';

import { ReactNode } from 'react';
import styled from 'styled-components';

const Item = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const DateTime = styled.time`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Content = styled.div`
  padding-left: ${({ theme }) => theme.spacing.md};
  border-left: 2px solid ${({ theme }) => theme.colors.border};
`;

interface TimelineItemProps {
  datetime?: string;
  children: ReactNode;
}

export function TimelineItem({ datetime, children }: TimelineItemProps) {
  return (
    <Item>
      {datetime && (
        <DateTime dateTime={datetime}>
          {new Date(datetime + 'T00:00:00').toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </DateTime>
      )}
      <Content>{children}</Content>
    </Item>
  );
}
