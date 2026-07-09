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

export function JobPreview(props: JobPreviewProps) {
  const salaryDisplay =
    props.salaryMin != null || props.salaryMax != null
      ? `${props.salaryCurrency || 'USD'} ${props.salaryMin ?? ''}${props.salaryMin != null && props.salaryMax != null ? ' — ' : ''}${props.salaryMax ?? ''}`
      : null;

  return (
    <div style={styles.card}>
      <div style={styles.cardTitle}>{props.jobTitle}</div>

      <div style={styles.field}>
        <span style={styles.fieldLabel}>Company</span>
        <span style={styles.fieldValue}>{props.companyName}</span>
      </div>

      {props.jobLocation && (
        <div style={styles.field}>
          <span style={styles.fieldLabel}>Location</span>
          <span style={styles.fieldValue}>{props.jobLocation}</span>
        </div>
      )}

      {salaryDisplay && (
        <div style={styles.field}>
          <span style={styles.fieldLabel}>Salary</span>
          <span style={styles.fieldValue}>{salaryDisplay}</span>
        </div>
      )}

      {props.jobType && (
        <div style={styles.field}>
          <span style={styles.fieldLabel}>Type</span>
          <span style={styles.fieldValue}>{props.jobType}</span>
        </div>
      )}

      {props.keywords && props.keywords.length > 0 && (
        <div style={styles.field}>
          <span style={styles.fieldLabel}>Skills</span>
          <div style={styles.chipGroup}>
            {props.keywords.map((kw) => (
              <span key={kw} style={styles.chip}>{kw}</span>
            ))}
          </div>
        </div>
      )}

      {props.jobDescription && (
        <div style={styles.field}>
          <span style={styles.fieldLabel}>Description</span>
          <span style={{ ...styles.fieldValue, maxHeight: '120px', overflowY: 'auto' }}>
            {props.jobDescription.length > 500
              ? props.jobDescription.slice(0, 500) + '…'
              : props.jobDescription}
          </span>
        </div>
      )}
    </div>
  );
}
