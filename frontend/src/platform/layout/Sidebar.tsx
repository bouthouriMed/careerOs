'use client';

import { useMemo } from 'react';
import styled from 'styled-components';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/platform/auth/hooks/use-auth';
import { useApplicationControllerGetTimelineQuery } from '@/platform/api/rtk-query/generated/api';
import { useThemeMode } from '@/platform/design-system/theme/ThemeProvider';

const Aside = styled.aside`
  background: ${({ theme }) => theme.colors.sidebarBg};
  border-right: 1px solid ${({ theme }) => theme.colors.borderLight};
  display: flex;
  flex-direction: column;
  padding: 20px 12px;
  overflow-y: auto;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: ${({ theme }) => theme.colors.scrollbarThumb}; border-radius: 4px; }
  &::-webkit-scrollbar-thumb:hover { background: ${({ theme }) => theme.colors.scrollbarThumbHover}; }
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
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary} 0%, #2563EB 100%);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LogoName = styled.span`
  font-size: 13px;
  font-weight: 700;
  letter-spacing: -0.3px;
  color: ${({ theme }) => theme.colors.text};
`;

const LogoPlan = styled.span`
  font-size: 10px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
`;

const NavLabel = styled.p`
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textMuted};
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
  background: ${({ $active, theme }) =>
    $active ? theme.colors.primaryMuted : 'transparent'};
  border-color: ${({ $active, theme }) =>
    $active ? `${theme.colors.primary}33` : 'transparent'};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.text : theme.colors.textMuted};

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
    color: ${({ theme }) => theme.colors.textSecondary};
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
  background: ${({ theme }) => theme.colors.borderLight};
  color: ${({ theme }) => theme.colors.textMuted};
`;

const UserCard = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border-radius: 12px;
  margin-top: 16px;
  background: ${({ theme }) => theme.colors.surfaceHover};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
`;

const UserAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 10px;
  flex-shrink: 0;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}, #A78BFA);
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
  color: ${({ theme }) => theme.colors.text};
`;

const UserRole = styled.div`
  font-size: 10px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const BottomSection = styled.div`
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const BottomActions = styled.div`
  display: flex;
  gap: 4px;
`;

const ThemeToggle = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid transparent;
  background: transparent;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 13px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  flex: 1;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
    color: ${({ theme }) => theme.colors.text};
  }
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid transparent;
  background: transparent;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 13px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  flex: 1;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
    color: ${({ theme }) => theme.colors.error};
  }
`;

const NAV_ITEM_DEFS: Array<{ href: string; label: string; icon: string }> = [
  { href: '/dashboard', label: 'Dashboard', icon: 'grid' },
  { href: '/applications', label: 'Applications', icon: 'file' },
  { href: '/interviews', label: 'Interviews', icon: 'message' },
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

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
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
  const router = useRouter();
  const { user, logout } = useAuth();
  const { mode, toggle } = useThemeMode();
  const { data: timelineData } = useApplicationControllerGetTimelineQuery(undefined, { skip: !user });

  const allApps = useMemo(() => {
    if (!timelineData) return [];
    const t = timelineData as { timeline: Array<{ date: string; applications: Array<Record<string, unknown>> }> };
    return t.timeline?.flatMap(e => e.applications) ?? [];
  }, [timelineData]);

  const appsCount = allApps.length;
  const interviewsCount = allApps.filter((a: Record<string, unknown>) => a.status === 'Interviewing' || a.status === 'Interview').length;

  const navItems = NAV_ITEM_DEFS.map((item) => ({
    ...item,
    badge: item.href === '/applications'
      ? String(appsCount)
      : item.href === '/interviews'
        ? String(interviewsCount)
        : undefined,
  }));

  const name = user?.name || 'User';
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } catch {
      // session may already be expired
    }
    router.replace('/');
  };

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
        {navItems.map(({ href, label, icon, badge }) => {
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

      <BottomSection>
        <UserCard>
          <UserAvatar>{initials}</UserAvatar>
          <UserInfo>
            <UserName>{name}</UserName>
            <UserRole>Job Seeker</UserRole>
          </UserInfo>
        </UserCard>
        <BottomActions>
          <ThemeToggle onClick={toggle} title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}>
            {mode === 'dark' ? <SunIcon /> : <MoonIcon />}
          </ThemeToggle>
          <LogoutButton onClick={handleLogout}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign out
          </LogoutButton>
        </BottomActions>
      </BottomSection>
    </Aside>
  );
}
