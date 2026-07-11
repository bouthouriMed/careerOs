'use client';

import styled from 'styled-components';

const Bar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
  padding-bottom: 10px;
`;

const Tabs = styled.div`
  display: flex;
  gap: 24px;
`;

const Tab = styled.button<{ $active: boolean }>`
  font-size: 14px;
  color: ${({ $active, theme }) => $active ? theme.colors.accent : theme.colors.textSecondary};
  cursor: pointer;
  padding-bottom: 12px;
  position: relative;
  background: none;
  border: none;
  font-family: inherit;
  font-weight: ${({ $active }) => $active ? 500 : 400};
  transition: color 0.15s;

  &::after {
    content: '';
    position: absolute;
    bottom: -11px;
    left: 0;
    right: 0;
    height: 2px;
    background-color: ${({ $active, theme }) => $active ? theme.colors.accent : 'transparent'};
  }

  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }
`;

const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const SortBtn = styled.button`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;

  span {
    color: ${({ theme }) => theme.colors.text};
    font-weight: 500;
  }
`;

const LayoutToggle = styled.div`
  display: flex;
  gap: 4px;
  background: ${({ theme }) => theme.colors.cardBg};
  padding: 2px;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const LayoutBtn = styled.button<{ $active: boolean }>`
  padding: 4px 8px;
  border-radius: 4px;
  border: none;
  background: ${({ $active, theme }) => $active ? theme.colors.border : 'transparent'};
  color: ${({ $active, theme }) => $active ? theme.colors.text : theme.colors.textMuted};
  cursor: pointer;
  font-size: 12px;
`;

const tabs = [
  { key: '', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'Interviewing', label: 'Interviewing' },
  { key: 'Offer', label: 'Offers' },
  { key: 'closed', label: 'Closed' },
  { key: 'Rejected', label: 'Rejected' },
];

interface FilterBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  counts: Record<string, number>;
}

export function FilterBar({ activeTab, onTabChange, counts }: FilterBarProps) {
  return (
    <Bar>
      <Tabs>
        {tabs.map((t) => (
          <Tab
            key={t.key}
            $active={activeTab === t.key}
            onClick={() => onTabChange(t.key)}
          >
            {t.label} {counts[t.key] !== undefined ? `(${counts[t.key]})` : ''}
          </Tab>
        ))}
      </Tabs>
      <Right>
        <SortBtn>
          Sort by: <span>Last updated {'\u2195'}</span>
        </SortBtn>
        <LayoutToggle>
          <LayoutBtn $active={true}>{'\u2630'}</LayoutBtn>
          <LayoutBtn $active={false}>{'\u2637'}</LayoutBtn>
        </LayoutToggle>
      </Right>
    </Bar>
  );
}
