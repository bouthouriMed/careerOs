'use client';

import styled, { keyframes } from 'styled-components';

interface ProgressBarProps {
  progress: number;
  animated?: boolean;
}

const fill = keyframes`
  from { width: 0; }
`;

const Track = styled.div`
  width: 100%;
  height: 4px;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  overflow: hidden;
`;

const Fill = styled.div<{ $progress: number; $animated: boolean }>`
  height: 100%;
  width: ${({ $progress }) => $progress}%;
  background: ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  transition: width 0.5s ease;
  ${({ $animated }) => $animated && `animation: ${fill} 0.5s ease-out;`}
`;

export function ProgressBar({ progress, animated = false }: ProgressBarProps) {
  return (
    <Track role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
      <Fill $progress={Math.min(100, Math.max(0, progress))} $animated={animated} />
    </Track>
  );
}
