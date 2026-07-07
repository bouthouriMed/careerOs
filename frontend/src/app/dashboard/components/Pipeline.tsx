'use client';

import styled from 'styled-components';

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
`;

const Column = styled.div`
  background: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.borderDark};
  border-radius: 20px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ColHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
`;

const ColLabel = styled.span<{ $color: string }>`
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${({ $color }) => $color};
`;

const ColCount = styled.span<{ $bg: string; $color: string }>`
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 6px;
  background: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.card2};
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 12px;
  padding: 10px;
  cursor: pointer;
  transition: transform 0.15s;

  &:hover {
    transform: scale(1.02);
  }
`;

const CardTop = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
`;

const Logo = styled.div<{ $bg: string; $color: string }>`
  width: 20px;
  height: 20px;
  border-radius: 6px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  background: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
`;

const Company = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textDark};
`;

const Role = styled.div`
  font-size: 10px;
  color: ${({ theme }) => theme.colors.dim};
`;

const Meta = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 6px;

  span {
    font-size: 10px;
    color: ${({ theme }) => theme.colors.dim};
  }
`;

const AddBtn = styled.button`
  width: 100%;
  border-radius: 10px;
  padding: 8px;
  text-align: center;
  font-size: 11px;
  color: ${({ theme }) => theme.colors.dim};
  cursor: pointer;
  border: 1px dashed rgba(255,255,255,0.08);
  background: transparent;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition: background 0.15s;

  &:hover {
    background: rgba(255,255,255,0.04);
  }
`;

const columns = [
  { key: 'saved', label: 'Saved', color: '#6B7A9E', bg: 'rgba(107,122,158,0.15)' },
  { key: 'applied', label: 'Applied', color: '#4F8EF7', bg: 'rgba(79,142,247,0.15)' },
  { key: 'interview', label: 'Interview', color: '#A78BFA', bg: 'rgba(167,139,250,0.15)' },
  { key: 'offer', label: 'Offer', color: '#34D399', bg: 'rgba(52,211,153,0.15)' },
  { key: 'rejected', label: 'Rejected', color: '#F87171', bg: 'rgba(248,113,113,0.15)' },
];

const sampleCards: Record<string, Array<{ letter: string; company: string; role: string; time: string; isNew?: boolean }>> = {
  saved: [
    { letter: 'S', company: 'Stripe', role: 'Senior PM', time: '2d ago' },
    { letter: 'L', company: 'Linear', role: 'Product Lead', time: '5d ago' },
  ],
  applied: [
    { letter: 'V', company: 'Vercel', role: 'Eng Manager', time: '3d ago' },
    { letter: 'N', company: 'Notion', role: 'PM II', time: '7d ago' },
  ],
  interview: [
    { letter: 'F', company: 'Figma', role: 'Staff PM', time: '1d ago' },
    { letter: 'A', company: 'Arc', role: 'Product', time: '4d ago' },
  ],
  offer: [
    { letter: 'A', company: 'Anthropic', role: 'PM Lead', time: 'New', isNew: true },
  ],
  rejected: [
    { letter: 'O', company: 'OpenAI', role: 'Director PM', time: '6d ago' },
  ],
};

export function Pipeline() {
  return (
    <Grid>
      {columns.map((col) => {
        const cards = sampleCards[col.key] || [];
        return (
          <Column key={col.key}>
            <ColHead>
              <ColLabel $color={col.color}>{col.label}</ColLabel>
              <ColCount $bg={col.bg} $color={col.color}>{cards.length}</ColCount>
            </ColHead>
            {cards.map((card) => (
              <Card key={card.company}>
                <CardTop>
                  <Logo $bg={col.bg} $color={col.color}>{card.letter}</Logo>
                  <Company>{card.company}</Company>
                </CardTop>
                <Role>{card.role}</Role>
                <Meta>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#6B7A9E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                  </svg>
                  {card.isNew ? (
                    <span style={{ color: '#34D399', fontSize: 10, fontWeight: 600 }}>New</span>
                  ) : (
                    <span>{card.time}</span>
                  )}
                </Meta>
              </Card>
            ))}
            <AddBtn>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add
            </AddBtn>
          </Column>
        );
      })}
    </Grid>
  );
}
