'use client';

import { InputHTMLAttributes, forwardRef } from 'react';
import styled from 'styled-components';

interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  containerWidth?: string;
}

const Container = styled.div<{ $width: string }>`
  position: relative;
  width: ${({ $width }) => $width};
`;

const Icon = styled.span`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.textSecondary};
  display: flex;
  align-items: center;
  pointer-events: none;
`;

const StyledInput = styled.input`
  width: 100%;
  height: 44px;
  padding: 0 16px 0 44px;
  border-radius: 22px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  outline: none;
  transition: border-color 150ms, box-shadow 150ms;

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}15;
  }
`;

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ containerWidth = '420px', ...props }, ref) => {
    return (
      <Container $width={containerWidth}>
        <Icon>
          <SearchIcon />
        </Icon>
        <StyledInput ref={ref} type="search" {...props} />
      </Container>
    );
  },
);

SearchInput.displayName = 'SearchInput';
