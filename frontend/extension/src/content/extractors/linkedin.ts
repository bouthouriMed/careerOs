interface Extraction {
  sourceUrl: string;
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
  console.log('[CareerOS] extractLinkedIn running on', url);

  // Multiple selector strategies for LinkedIn's ever-changing DOM
  const titleEl =
    document.querySelector('.job-details-jobs-unified-top-card__job-title') ||
    document.querySelector('.top-card-layout__title') ||
    document.querySelector('[class*="job-title"]') ||
    document.querySelector('[class*="jobTitle"]') ||
    document.querySelector('h1');
  let jobTitle = titleEl?.textContent?.trim() || '';

  const companyEl =
    document.querySelector('.job-details-jobs-unified-top-card__company-name') ||
    document.querySelector('.top-card-layout__second-line') ||
    document.querySelector('[data-anonymize="company-name"]') ||
    document.querySelector('[class*="company-name"]') ||
    document.querySelector('[class*="companyName"]') ||
    document.querySelector('[class*="org-name"]');
  const companyNameNode = companyEl?.querySelector('a') || companyEl;
  let companyName = companyNameNode?.textContent?.trim() || '';

  const locationEl =
    document.querySelector('.job-details-jobs-unified-top-card__bullet') ||
    document.querySelector('.top-card-layout__third-line') ||
    document.querySelector('[data-anonymize="location"]') ||
    document.querySelector('[class*="location"]');
  const jobLocation = locationEl?.textContent?.trim()?.split('\n')[0]?.trim() || undefined;

  const descEl =
    document.querySelector('.jobs-description-content__text') ||
    document.querySelector('.job-details-jobs-unified-top-card__job-description') ||
    document.querySelector('[class*="description"]') ||
    document.getElementById('job-details') ||
    document.querySelector('article');
  const jobDescription = descEl?.textContent?.trim() || undefined;

  const salaryEl =
    document.querySelector('.job-details-jobs-unified-top-card__salary-info') ||
    document.querySelector('[class*="salary"]') ||
    document.querySelector('[class*="compensation"]');
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

  const criteriaEl =
    document.querySelector('.job-details-jobs-unified-top-card__job-criteria') ||
    document.querySelector('[class*="criteria"]');
  let jobType: string | undefined;
  criteriaEl?.querySelectorAll('li, span').forEach((li) => {
    const text = li.textContent?.trim().toLowerCase() || '';
    if (text.includes('full-time') || text.includes('part-time') || text.includes('contract') || text.includes('temporary') || text.includes('internship')) {
      jobType = li.textContent?.trim() || undefined;
    }
  });

  // Also check metadata chips
  document.querySelectorAll('[class*="metadata"] span, [class*="chip"]').forEach((el) => {
    const text = el.textContent?.trim().toLowerCase() || '';
    if (!jobType && (text.includes('full-time') || text.includes('part-time') || text.includes('contract') || text.includes('internship'))) {
      jobType = el.textContent?.trim() || undefined;
    }
  });

  const keywords: string[] = [];
  document.querySelectorAll('[class*="skill"], [class*="keyword"], [class*="tag"], [data-anonymize="skill"]').forEach((el) => {
    const text = el.textContent?.trim();
    if (text && text.length < 50) keywords.push(text);
  });

  // If nothing found from specific selectors, try generic extraction from meta/JSON-LD
  if (!companyName || !jobTitle) {
    const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content');
    const ogSite = document.querySelector('meta[property="og:site_name"]')?.getAttribute('content');
    if (!jobTitle && ogTitle) {
      // og:title format: "Job Title at Company Name"
      const parts = ogTitle.split(' at ');
      if (parts.length >= 2) {
        const fallbackTitle = parts[0].trim();
        const fallbackCompany = parts.slice(1).join(' at ').trim();
        if (!jobTitle) jobTitle = fallbackTitle;
        if (!companyName) companyName = fallbackCompany;
      } else {
        if (!jobTitle) jobTitle = ogTitle;
      }
    }
    if (!companyName && ogSite) companyName = ogSite;
  }

  // If company name looks like URL, extract it
  const domain = companyName
    ? `${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`
    : undefined;

  if (!companyName && !jobTitle) {
    console.log('[CareerOS] LinkedIn extractor: no company or title found');
    return null;
  }

  console.log('[CareerOS] LinkedIn extracted:', { jobTitle, companyName, jobLocation });
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
    keywords: keywords.length > 0 ? [...new Set(keywords)].slice(0, 20) : undefined,
  };
}
