export const styles = {
  container: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  },

  header: {
    display: 'flex',
    alignItems: 'center' as const,
    gap: '10px',
  },

  logoIcon: {
    width: '28px',
    height: '28px',
    borderRadius: '10px',
    flexShrink: 0,
    background: 'linear-gradient(135deg, #4F8EF7, #A78BFA)',
    display: 'flex',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  } as React.CSSProperties,

  logoText: {
    fontSize: '15px',
    fontWeight: 700,
    letterSpacing: '-0.3px',
    color: '#E8EBF4',
    flex: 1,
  },

  statusDot: (connected: boolean): React.CSSProperties => ({
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: connected ? '#34D399' : '#6B7A9E',
    flexShrink: 0,
  }),

  card: {
    background: '#141925',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
  },

  cardTitle: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#E8EBF4',
  },

  field: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '2px',
  },

  fieldLabel: {
    fontSize: '10px',
    fontWeight: 600,
    color: '#6B7A9E',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },

  fieldValue: {
    fontSize: '12px',
    color: '#A8B3CF',
    lineHeight: 1.5,
    wordBreak: 'break-word' as const,
  },

  chipGroup: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '6px',
  },

  chip: {
    fontSize: '10px',
    fontWeight: 500,
    padding: '3px 8px',
    borderRadius: '6px',
    background: 'rgba(255,255,255,0.05)',
    color: '#A8B3CF',
  },

  primaryButton: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '10px',
    border: 'none',
    background: 'linear-gradient(135deg, #4F8EF7, #A78BFA)',
    color: '#FFFFFF',
    fontSize: '13px',
    fontWeight: 600,
    fontFamily: '"Plus Jakarta Sans", sans-serif',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: '8px',
    transition: 'opacity 0.15s',
  } as React.CSSProperties,

  secondaryButton: {
    width: '100%',
    padding: '10px 16px',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.07)',
    background: 'transparent',
    color: '#6B7A9E',
    fontSize: '12px',
    fontWeight: 500,
    fontFamily: '"Plus Jakarta Sans", sans-serif',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: '6px',
    transition: 'background 0.15s, color 0.15s',
  } as React.CSSProperties,

  successBanner: {
    display: 'flex',
    alignItems: 'center' as const,
    gap: '8px',
    padding: '10px 14px',
    borderRadius: '10px',
    background: 'rgba(52, 211, 153, 0.1)',
    border: '1px solid rgba(52, 211, 153, 0.2)',
    color: '#34D399',
    fontSize: '12px',
    fontWeight: 500,
  },

  errorBanner: {
    display: 'flex',
    alignItems: 'center' as const,
    gap: '8px',
    padding: '10px 14px',
    borderRadius: '10px',
    background: 'rgba(248, 113, 113, 0.1)',
    border: '1px solid rgba(248, 113, 113, 0.2)',
    color: '#F87171',
    fontSize: '12px',
    fontWeight: 500,
  },

  loadingPulse: {
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    border: '2px solid rgba(79, 142, 247, 0.2)',
    borderTopColor: '#4F8EF7',
    animation: 'spin 0.8s linear infinite',
  } as React.CSSProperties,

  emptyState: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: '12px',
    padding: '32px 16px',
    textAlign: 'center' as const,
  },

  emptyTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#E8EBF4',
  },

  emptyDesc: {
    fontSize: '11px',
    color: '#6B7A9E',
    lineHeight: 1.6,
  },

  footer: {
    display: 'flex',
    justifyContent: 'center' as const,
    padding: '8px 0 0',
  },

  footerLink: {
    fontSize: '10px',
    color: '#4F8EF7',
    textDecoration: 'none',
    cursor: 'pointer',
  },
};
