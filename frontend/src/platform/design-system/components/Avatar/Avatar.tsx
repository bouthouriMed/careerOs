'use client';

import styled from 'styled-components';

interface AvatarProps {
  src?: string;
  name?: string;
  size?: number;
}

function getInitials(name?: string): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

const StyledAvatar = styled.div<{ $size: number }>`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.textInverse};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ $size }) => Math.round($size * 0.4)}px;
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  overflow: hidden;
  flex-shrink: 0;
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export function Avatar({ src, name, size = 40 }: AvatarProps) {
  return (
    <StyledAvatar $size={size} role="img" aria-label={name || 'User avatar'}>
      {src ? <Image src={src} alt={name || ''} /> : getInitials(name)}
    </StyledAvatar>
  );
}
