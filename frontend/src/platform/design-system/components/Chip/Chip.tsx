'use client';

import styled from 'styled-components';

interface ChipProps {
  children: React.ReactNode;
}

const StyledChip = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 6px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  line-height: 1.3;
  white-space: nowrap;
`;

export function Chip({ children }: ChipProps) {
  return <StyledChip>{children}</StyledChip>;
}
