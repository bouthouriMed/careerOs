import { ReactNode } from 'react';
import styled from 'styled-components';

interface CardProps {
  children: ReactNode;
  padding?: 'sm' | 'md' | 'lg';
  shadow?: 'sm' | 'md' | 'lg';
}

const spacingMap = {
  sm: '12px',
  md: '24px',
  lg: '32px',
} as const;

const StyledCard = styled.div<{ $padding: 'sm' | 'md' | 'lg'; $shadow: 'sm' | 'md' | 'lg' }>`
  background: ${({ theme }) => theme.colors.cardBg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ $padding }) => spacingMap[$padding]};
  box-shadow: ${({ theme, $shadow }) => theme.shadows[$shadow]};
`;

export function Card({ children, padding = 'md', shadow = 'sm' }: CardProps) {
  return (
    <StyledCard $padding={padding} $shadow={shadow}>
      {children}
    </StyledCard>
  );
}
