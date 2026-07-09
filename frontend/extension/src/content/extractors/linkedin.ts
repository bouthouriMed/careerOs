interface Extraction {
  companyName: string;
  companyDomain?: string;
  companyDescription?: string;
  jobTitle: string;
  jobDescription?: string;
  jobLocation?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  jobType?: string;
  keywords?: string[];
}

export function extractLinkedIn(): Extraction | null {
  const url = window.location.href;

  const titleEl =
    document.querySelector('.job-details-jobs-unified-top-card__job-title') ||
    document.querySelector('.top-card-layout__title') ||
    document.querySelector('h1');
  const jobTitle = titleEl?.textContent?.trim() || '';

  const companyEl =
    document.querySelector('.job-details-jobs-unified-top-card__company-name') ||
    document.querySelector('.top-card-layout__second-line') ||
    document.querySelector('[data-anonymize="company-name"]');
  const companyNameNode = companyEl?.querySelector('a') || companyEl;
  const companyName = companyNameNode?.textContent?.trim() || '';

  const locationEl =
    document.querySelector('.job-details-jobs-unified-top-card__bullet') ||
    document.querySelector('.top-card-layout__third-line') ||
    document.querySelector('[data-anonymize="location"]');
  const jobLocation = locationEl?.textContent?.trim()?.split('\n')[0]?.trim() || undefined;

  const descEl =
    document.querySelector('.jobs-description-content__text') ||
    document.querySelector('.job-details-jobs-unified-top-card__job-description') ||
    document.getElementById('job-details');
  const jobDescription = descEl?.textContent?.trim() || undefined;

  const salaryEl = document.querySelector('.job-details-jobs-unified-top-card__salary-info');
  const salaryText = salaryEl?.textContent?.trim();
  let salaryMin: number | undefined;
  let salaryMax: number | undefined;
  let salaryCurrency: string | undefined;
  if (salaryText) {
    const nums = salaryText.match(/\d[\d,]*/g);
    const currencyMatch = salaryText.match(/([A-Z]{3}|[$£€₹¥])/);
    salaryCurrency = currencyMatch?.[1];
    if (nums) {
      const parsed = nums.map((n) => parseInt(n.replace(/,/g, ''), 10));
      if (parsed.length >= 2) {
        salaryMin = parsed[0];
        salaryMax = parsed[1];
      } else if (parsed.length === 1) {
        salaryMin = parsed[0];
      }
    }
  }

  const criteriaEl = document.querySelector('.job-details-jobs-unified-top-card__job-criteria');
  let jobType: string | undefined;
  criteriaEl?.querySelectorAll('li').forEach((li) => {
    const label = li.querySelector('span')?.textContent?.trim().toLowerCase();
    if (label && ['employment type', 'job function', 'seniority level'].includes(label)) {
      const value = li.textContent?.replace(label, '').trim();
      if (label === 'employment type' && value) jobType = value;
    }
  });

  const keywords: string[] = [];
  document.querySelectorAll('.job-details-skill-criteria__skill-name, .job-details-skill-criteria__skill-item, [data-anonymize="skill"]').forEach((el) => {
    const text = el.textContent?.trim();
    if (text) keywords.push(text);
  });

  if (!companyName && !jobTitle) return null;

  const domain = companyName
    ? `${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`
    : undefined;

  return {
    sourceUrl: url,
    companyName,
    companyDomain: domain,
    jobTitle,
    jobDescription,
    jobLocation,
    salaryMin,
    salaryMax,
    salaryCurrency,
    jobType,
    keywords: keywords.length > 0 ? keywords : undefined,
  };
}
