'use client';

import styled, { keyframes } from 'styled-components';

const shimmer = keyframes`
  from { transform: translateX(-100%); }
  to { transform: translateX(100%); }
`;

interface SkeletonProps {
  width?: string;
  height?: string;
  radius?: string;
}

const SkeletonRoot = styled.div<{ $width: string; $height: string; $radius: string }>`
  width: ${({ $width }) => $width};
  height: ${({ $height }) => $height};
  border-radius: ${({ $radius }) => $radius};
  background: ${({ theme }) => theme.colors.surface};
  position: relative;
  overflow: hidden;
  isolation: isolate;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.4),
      transparent
    );
    animation: ${shimmer} 1.5s ease-in-out infinite;
  }
`;

export function Skeleton({ width = '100%', height = '20px', radius = '8px' }: SkeletonProps) {
  return <SkeletonRoot $width={width} $height={height} $radius={radius} aria-hidden="true" />;
}
