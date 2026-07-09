export const styles = {
  container: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
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
    gap: '12px',
  },

  companyRow: {
    display: 'flex',
    alignItems: 'center' as const,
    gap: '10px',
  },

  companyAvatar: (color: string): React.CSSProperties => ({
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: color,
    display: 'flex',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    fontSize: '16px',
    fontWeight: 700,
    color: '#FFFFFF',
    flexShrink: 0,
  }),

  companyInfo: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1px',
  },

  companyName: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#A8B3CF',
    lineHeight: 1.3,
  },

  jobTitle: {
    fontSize: '15px',
    fontWeight: 700,
    color: '#E8EBF4',
    lineHeight: 1.35,
    letterSpacing: '-0.2px',
  },

  metaRow: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '6px',
  },

  badge: {
    display: 'inline-flex',
    alignItems: 'center' as const,
    gap: '4px',
    fontSize: '11px',
    fontWeight: 500,
    padding: '4px 10px',
    borderRadius: '8px',
    background: 'rgba(255,255,255,0.04)',
    color: '#A8B3CF',
    border: '1px solid rgba(255,255,255,0.05)',
  },

  badgeIcon: {
    display: 'flex',
    flexShrink: 0,
  },

  sectionLabel: {
    fontSize: '10px',
    fontWeight: 600,
    color: '#6B7A9E',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    marginBottom: '-4px',
  },

  chipGroup: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '6px',
  },

  chip: {
    fontSize: '11px',
    fontWeight: 500,
    padding: '4px 10px',
    borderRadius: '6px',
    background: 'rgba(79, 142, 247, 0.1)',
    color: '#7BA9F9',
    border: '1px solid rgba(79, 142, 247, 0.15)',
  },

  descriptionBox: {
    fontSize: '11px',
    color: '#8A94A6',
    lineHeight: 1.6,
    maxHeight: '96px',
    overflowY: 'auto' as const,
    padding: '8px 10px',
    borderRadius: '8px',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.04)',
  },

  primaryButton: {
    width: '100%',
    padding: '11px 16px',
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
    padding: '4px 0 0',
  },

  footerLink: {
    fontSize: '10px',
    color: '#4F8EF7',
    textDecoration: 'none',
    cursor: 'pointer',
  },
};
