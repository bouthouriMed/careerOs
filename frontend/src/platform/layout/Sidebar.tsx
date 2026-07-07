'use client';

import styled from 'styled-components';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const scrollbarStyles = `
  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }
  &::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.12); }
`;

const Aside = styled.aside`
  background: ${({ theme }) => theme.colors.sidebar};
  border-right: 1px solid ${({ theme }) => theme.colors.borderDark2};
  display: flex;
  flex-direction: column;
  padding: 20px 12px;
  overflow-y: auto;
  ${scrollbarStyles}
`;

const LogoWrap = styled(Link)`
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  padding: 0 8px;
  margin-bottom: 32px;
`;

const LogoIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 12px;
  flex-shrink: 0;
  background: linear-gradient(135deg, #4F8EF7 0%, #2563EB 100%);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LogoName = styled.span`
  font-size: 13px;
  font-weight: 700;
  letter-spacing: -0.3px;
  color: ${({ theme }) => theme.colors.textDark};
`;

const LogoPlan = styled.span`
  font-size: 10px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.blue};
`;

const NavLabel = styled.p`
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #3B4A6B;
  padding: 0 12px;
  margin-bottom: 8px;
`;

const Nav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
`;

const NavLink = styled(Link)<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  cursor: pointer;
  border: 1px solid transparent;
  font-size: 13px;
  font-weight: 500;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
  text-decoration: none;
  background: ${({ $active }) =>
    $active ? 'rgba(79,142,247,0.12)' : 'transparent'};
  border-color: ${({ $active }) =>
    $active ? 'rgba(79,142,247,0.2)' : 'transparent'};
  color: ${({ $active }) =>
    $active ? '#E8EBF4' : '#6B7A9E'};

  &:hover {
    background: rgba(255,255,255,0.04);
    color: #A8B3CF;
  }
`;

const NavIcon = styled.span`
  display: flex;
  align-items: center;
  flex-shrink: 0;
  color: inherit;
`;

const NavSpacer = styled.span`
  flex: 1;
`;

const NavBadge = styled.span`
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 6px;
  background: rgba(255,255,255,0.07);
  color: ${({ theme }) => theme.colors.dim};
`;

const UserCard = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border-radius: 12px;
  margin-top: 16px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
`;

const UserAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 10px;
  flex-shrink: 0;
  background: linear-gradient(135deg, #4F8EF7, #A78BFA);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: white;
`;

const UserInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const UserName = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textDark};
`;

const UserRole = styled.div`
  font-size: 10px;
  color: ${({ theme }) => theme.colors.dim};
`;

const NAV_ITEMS: Array<{ href: string; label: string; icon: string; badge?: string }> = [
  { href: '/dashboard', label: 'Dashboard', icon: 'grid' },
  { href: '/applications', label: 'Applications', icon: 'file', badge: '12' },
  { href: '/interviews', label: 'Interviews', icon: 'message', badge: '3' },
  { href: '/documents', label: 'Documents', icon: 'file2' },
  { href: '/settings', label: 'Settings', icon: 'settings' },
];

function GridIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  );
}

function File2Icon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" /><path d="M19.07 4.93l-1.41 1.41M5.34 18.66l-1.41 1.41M19.07 19.07l-1.41-1.41M5.34 5.34L3.93 3.93M22 12h-2M4 12H2M19.07 4.93A10 10 0 014.93 19.07M19.07 19.07A10 10 0 014.93 4.93" />
    </svg>
  );
}

const iconMap: Record<string, typeof GridIcon> = {
  grid: GridIcon,
  file: FileIcon,
  message: MessageIcon,
  file2: File2Icon,
  settings: SettingsIcon,
};

export function Sidebar() {
  const pathname = usePathname();

  return (
    <Aside>
      <LogoWrap href="/dashboard">
        <LogoIcon>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 2L13 5.5V10.5L8 14L3 10.5V5.5L8 2Z" fill="white" fillOpacity="0.9" />
            <path d="M8 5L11 7V11L8 13L5 11V7L8 5Z" fill="white" fillOpacity="0.3" />
          </svg>
        </LogoIcon>
        <div>
          <LogoName>CareerOS</LogoName>
          <LogoPlan>Pro Plan</LogoPlan>
        </div>
      </LogoWrap>

      <NavLabel>Workspace</NavLabel>

      <Nav>
        {NAV_ITEMS.map(({ href, label, icon, badge }) => {
          const Icon = iconMap[icon];
          const isActive = pathname === href;
          return (
            <NavLink key={href} href={href} $active={isActive}>
              <NavIcon><Icon /></NavIcon>
              {label}
              <NavSpacer />
              {badge && <NavBadge>{badge}</NavBadge>}
            </NavLink>
          );
        })}
      </Nav>

      <UserCard>
        <UserAvatar>AJ</UserAvatar>
        <UserInfo>
          <UserName>Alex Johnson</UserName>
          <UserRole>Product Manager</UserRole>
        </UserInfo>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6B7A9E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" /><path d="M19.07 4.93l-1.41 1.41M5.34 18.66l-1.41 1.41M19.07 19.07l-1.41-1.41M5.34 5.34L3.93 3.93M22 12h-2M4 12H2M19.07 4.93A10 10 0 014.93 19.07M19.07 19.07A10 10 0 014.93 4.93" />
        </svg>
      </UserCard>
    </Aside>
  );
}
