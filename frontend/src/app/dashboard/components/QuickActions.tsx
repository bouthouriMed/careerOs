'use client';

import styled from 'styled-components';

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
`;

const Card = styled.button`
  background: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.borderDark};
  border-radius: 20px;
  padding: 16px;
  cursor: pointer;
  transition: transform 0.15s, filter 0.15s;
  text-align: left;
  font-family: ${({ theme }) => theme.typography.fontFamily};

  &:hover {
    transform: scale(1.01);
    filter: brightness(1.08);
  }
`;

const IconBox = styled.div<{ $color: string }>`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  background: ${({ $color }) => $color}26;
  color: ${({ $color }) => $color};
`;

const Name = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textDark};
  margin-bottom: 2px;
`;

const Desc = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.dim};
`;

const actions = [
  {
    icon: () => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    ),
    color: '#4F8EF7',
    name: 'Add Application',
    desc: 'Log a new job',
  },
  {
    icon: () => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.5 2A2.5 2.5 0 0112 4.5v15a2.5 2.5 0 01-4.96-.46 2.5 2.5 0 01-1.07-3.45A3.5 3.5 0 018 9.5v-3A2.5 2.5 0 019.5 2z" /><path d="M14.5 2A2.5 2.5 0 0112 4.5v15a2.5 2.5 0 004.96-.46 2.5 2.5 0 001.07-3.45A3.5 3.5 0 0116 9.5v-3A2.5 2.5 0 0014.5 2z" />
      </svg>
    ),
    color: '#A78BFA',
    name: 'Prep Interview',
    desc: 'AI mock session',
  },
  {
    icon: () => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    color: '#34D399',
    name: 'Tailor Resume',
    desc: 'For a specific role',
  },
  {
    icon: () => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </svg>
    ),
    color: '#F59E0B',
    name: 'Salary Research',
    desc: 'Market benchmarks',
  },
];

export function QuickActions() {
  return (
    <Grid>
      {actions.map((a) => (
        <Card key={a.name}>
          <IconBox $color={a.color}>{a.icon()}</IconBox>
          <Name>{a.name}</Name>
          <Desc>{a.desc}</Desc>
        </Card>
      ))}
    </Grid>
  );
}
