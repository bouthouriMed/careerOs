'use client';

import styled from 'styled-components';
import { useAuth } from '@/platform/auth/hooks/use-auth';

const StyledHeader = styled.header`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 24px;
  flex-shrink: 0;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  background: rgba(13,17,23,0.85);
  backdrop-filter: blur(12px);
`;

const GreetingSection = styled.div`
  flex: 1;
`;

const GreetingText = styled.h1`
  font-size: 15px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textDark};
  margin: 0;
`;

const GreetingSub = styled.p`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.dim};
  margin: 0;
  margin-top: 1px;
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  border-radius: 12px;
  flex: 1;
  max-width: 340px;
  background: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.borderDark};
`;

const SearchInput = styled.input`
  background: transparent;
  border: none;
  outline: none;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textDark};
  flex: 1;

  &::placeholder {
    color: ${({ theme }) => theme.colors.dim};
  }
`;

const Kbd = styled.span`
  font-family: ${({ theme }) => theme.typography.fontMono};
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 5px;
  background: rgba(255,255,255,0.06);
  color: ${({ theme }) => theme.colors.dim};
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const IconBtn = styled.div`
  position: relative;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.borderDark};
  transition: background 0.15s;

  &:hover {
    background: ${({ theme }) => theme.colors.card2};
  }
`;

const NotifDot = styled.div`
  position: absolute;
  top: 6px;
  right: 6px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.blue};
  border: 1.5px solid #090C14;
`;

const Avatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  cursor: pointer;
  background: linear-gradient(135deg, #4F8EF7, #A78BFA);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: white;
`;

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatDate() {
  const now = new Date();
  const opts: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
  return now.toLocaleDateString('en-US', opts);
}

export function TopBar() {
  const { user } = useAuth();
  const name = user?.name?.split(' ')[0] || 'there';
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <StyledHeader>
      <GreetingSection>
        <GreetingText>{getGreeting()}, {name} 👋</GreetingText>
        <GreetingSub>{formatDate()} · 3 actions need your attention</GreetingSub>
      </GreetingSection>

      <SearchBar>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7A9E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <SearchInput type="text" placeholder="Search roles, companies, docs…" />
        <Kbd>⌘K</Kbd>
      </SearchBar>

      <Actions>
        <IconBtn>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#A8B3CF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" />
          </svg>
          <NotifDot />
        </IconBtn>
        <Avatar>{initials}</Avatar>
      </Actions>
    </StyledHeader>
  );
}
