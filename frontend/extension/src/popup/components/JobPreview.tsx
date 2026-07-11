import { tokens } from '../../utils/design-tokens';
import { styles } from '../styles';

interface JobPreviewProps {
  sourceUrl: string;
  companyName: string;
  companyDomain?: string;
  jobTitle: string;
  jobDescription?: string;
  jobLocation?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  jobType?: string;
  keywords?: string[];
}

const AVATAR_COLORS = [
  '#4F8EF7', '#A78BFA', '#34D399', '#F59E0B',
  '#F87171', '#60A5FA', '#F472B6', '#2DD4BF',
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function formatSalary(
  min?: number,
  max?: number,
  currency?: string,
): string | null {
  if (min == null && max == null) return null;
  const symbol = currency === 'USD' ? '$'
    : currency === 'EUR' ? '€'
    : currency === 'GBP' ? '£'
    : currency || '$';
  const fmt = (n: number) =>
    n >= 1000 ? `${symbol}${Math.round(n / 1000)}K` : `${symbol}${n}`;
  if (min != null && max != null && min !== max) return `${fmt(min)} – ${fmt(max)}`;
  if (min != null) return `From ${fmt(min)}`;
  if (max != null) return `Up to ${fmt(max)}`;
  return null;
}

function formatJobType(type?: string): string | null {
  if (!type) return null;
  const lower = type.toLowerCase();
  if (lower.includes('full')) return 'Full-time';
  if (lower.includes('part')) return 'Part-time';
  if (lower.includes('contract')) return 'Contract';
  if (lower.includes('temporary') || lower.includes('temp')) return 'Temporary';
  if (lower.includes('intern')) return 'Internship';
  if (lower.includes('freelance')) return 'Freelance';
  if (lower.includes('cdi')) return 'CDI';
  if (lower.includes('cdd')) return 'CDD';
  return type;
}

export function JobPreview(props: JobPreviewProps) {
  const salaryDisplay = formatSalary(props.salaryMin, props.salaryMax, props.salaryCurrency);
  const jobTypeDisplay = formatJobType(props.jobType);
  const color = getAvatarColor(props.companyName);
  const initial = props.companyName.charAt(0).toUpperCase();

  return (
    <div style={styles.card}>
      {/* Company + Title */}
      <div style={styles.companyRow}>
        <div style={styles.companyAvatar(color)}>
          {initial}
        </div>
        <div style={styles.companyInfo}>
          <div style={styles.companyName}>{props.companyName}</div>
          <div style={styles.jobTitle}>{props.jobTitle}</div>
        </div>
      </div>

      {/* Location · Salary · Type */}
      <div style={styles.metaRow}>
        {props.jobLocation && (
          <span style={styles.badge}>
            <span style={styles.badgeIcon}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#6B7A9E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
              </svg>
            </span>
            {props.jobLocation}
          </span>
        )}

        {salaryDisplay && (
          <span style={{ ...styles.badge, color: '#34D399' }}>
            <span style={styles.badgeIcon}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
              </svg>
            </span>
            {salaryDisplay}
          </span>
        )}

        {jobTypeDisplay && (
          <span style={{ ...styles.badge, color: '#A78BFA' }}>
            <span style={styles.badgeIcon}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
              </svg>
            </span>
            {jobTypeDisplay}
          </span>
        )}
      </div>

      {/* Skills */}
      {props.keywords && props.keywords.length > 0 && (
        <div>
          <div style={{ ...styles.sectionLabel, marginBottom: '6px' }}>Skills</div>
          <div style={styles.chipGroup}>
            {props.keywords.map((kw) => (
              <span key={kw} style={styles.chip}>{kw}</span>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      {props.jobDescription && (
        <div>
          <div style={{ ...styles.sectionLabel, marginBottom: '6px' }}>Description</div>
          <div style={styles.descriptionBox}>
            {props.jobDescription.length > 600
              ? props.jobDescription.slice(0, 600) + '…'
              : props.jobDescription}
          </div>
        </div>
      )}
    </div>
  );
}
