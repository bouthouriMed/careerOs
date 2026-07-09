interface Extraction {
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

export function extractIndeed(): Extraction | null {
  const url = window.location.href;

  const titleEl =
    document.querySelector('.jobsearch-JobInfoHeader-title') ||
    document.querySelector('h1[class*="title"]') ||
    document.querySelector('[data-testid="jobsearch-JobInfoHeader-title"]');
  const jobTitle = titleEl?.textContent?.trim() || '';

  const companyEl =
    document.querySelector('[data-testid="jobsearch-JobInfoHeader-company-name"]') ||
    document.querySelector('.jobsearch-InlineCompanyRating div') ||
    document.querySelector('.jobsearch-JobInfoHeader-company-name');
  const companyName = companyEl?.textContent?.trim()?.split('\n')[0]?.trim() || '';

  const locationEl =
    document.querySelector('[data-testid="jobsearch-JobInfoHeader-location"]') ||
    document.querySelector('.jobsearch-JobInfoHeader-location');
  const jobLocation = locationEl?.textContent?.trim() || undefined;

  const descEl =
    document.querySelector('#jobDescriptionText') ||
    document.querySelector('.jobsearch-jobDescriptionText');
  const jobDescription = descEl?.textContent?.trim() || undefined;

  const salaryEl =
    document.querySelector('#salaryrange') ||
    document.querySelector('.jobsearch-JobMetadataHeader-item') ||
    document.querySelector('[data-testid="jobsearch-JobMetadataHeader-salary"]');
  const salaryText = salaryEl?.textContent?.trim();
  let salaryMin: number | undefined;
  let salaryMax: number | undefined;
  let salaryCurrency: string | undefined;
  if (salaryText) {
    const nums = salaryText.match(/\d[\d,]*/g);
    const currencyMatch = salaryText.match(/([A-Z]{3}|[$£€₹¥])/);
    if (currencyMatch) salaryCurrency = currencyMatch[1];
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

  const metaItems = document.querySelectorAll('.jobsearch-JobMetadataHeader-item');
  let jobType: string | undefined;
  metaItems.forEach((el) => {
    const text = el.textContent?.trim().toLowerCase() || '';
    if (text.includes('full-time') || text.includes('part-time') || text.includes('contract') || text.includes('temporary')) {
      jobType = text;
    }
  });

  const keywords: string[] = [];
  document.querySelectorAll('.jobsearch-jobDescriptionText li, .jobsearch-jobDescriptionText p strong').forEach((el) => {
    const text = el.textContent?.trim();
    if (text && text.length < 60 && !text.endsWith('.') && !text.endsWith(':')) {
      keywords.push(text);
    }
  });

  if (!companyName && !jobTitle) return null;

  return {
    sourceUrl: url,
    companyName,
    companyDomain: companyName
      ? `${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`
      : undefined,
    jobTitle,
    jobDescription,
    jobLocation,
    salaryMin,
    salaryMax,
    salaryCurrency,
    jobType,
    keywords: keywords.length > 0 ? [...new Set(keywords)].slice(0, 20) : undefined,
  };
}
