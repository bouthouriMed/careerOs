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

function text(el: Element | null): string | undefined {
  return el?.textContent?.trim() || undefined;
}

function findInContainer(container: Element | null, ...selectors: string[]): Element | null {
  if (!container) return null;
  for (const sel of selectors) {
    const found = container.querySelector(sel);
    if (found) return found;
  }
  return null;
}

export function extractLinkedIn(): Extraction | null {
  const url = window.location.href;
  console.log('[CareerOS] extractLinkedIn running on', url);

  // The job details container differs between standalone /jobs/view/N and
  // the search-results page with a selected result.  Grab the widest
  // container that holds job details, then scope queries inside it.
  const jobDetailContainer =
    document.querySelector('.jobs-search__job-details--container') ||
    document.querySelector('[data-view-name="job-details"]') ||
    document.querySelector('.job-details-jobs-unified-top-card')?.closest('[class*="job-details"]') ||
    document.querySelector('main') ||
    document.querySelector('[class*="job-detail"]') ||
    document.body;

  console.log('[CareerOS] jobDetailContainer tag:', jobDetailContainer.tagName,
    'classes:', jobDetailContainer.className?.slice(0, 120));

  // --- Job Title ---
  const titleEl = findInContainer(jobDetailContainer,
    '.job-details-jobs-unified-top-card__job-title',
    '.top-card-layout__title',
    '[class*="job-title"]',
    '[class*="jobTitle"]',
    'h1',
  );
  let jobTitle = text(titleEl) || '';

  // --- Company ---
  const companyEl = findInContainer(jobDetailContainer,
    '.job-details-jobs-unified-top-card__company-name',
    '.top-card-layout__second-line',
    '[data-anonymize="company-name"]',
    '[class*="company-name"]',
    '[class*="companyName"]',
    '[class*="org-name"]',
    'a[data-anonymize="company-name"]',
  );
  const companyNameNode = companyEl?.querySelector('a') || companyEl;
  let companyName = text(companyNameNode) || '';

  // --- Location ---
  const locationEl = findInContainer(jobDetailContainer,
    '.job-details-jobs-unified-top-card__bullet',
    '.top-card-layout__third-line',
    '[data-anonymize="location"]',
    '[class*="location"]',
  );
  const jobLocation = locationEl
    ? (text(locationEl)?.split('\n')[0]?.trim() || undefined)
    : undefined;

  // --- Description ---
  const descEl = findInContainer(jobDetailContainer,
    '.jobs-description-content__text',
    '.job-details-jobs-unified-top-card__job-description',
    '[class*="description"]',
    '#job-details',
    'article',
  );
  const jobDescription = text(descEl);

  // --- Salary ---
  const salaryEl = findInContainer(jobDetailContainer,
    '.job-details-jobs-unified-top-card__salary-info',
    '[class*="salary"]',
    '[class*="compensation"]',
  );
  const salaryText = text(salaryEl);
  let salaryMin: number | undefined;
  let salaryMax: number | undefined;
  let salaryCurrency: string | undefined;
  if (salaryText) {
    const nums = salaryText.match(/\d[\d,]*/g);
    const currencyMatch = salaryText.match(/([A-Z]{3}|[$£€₹¥])/);
    salaryCurrency = currencyMatch?.[1];
    if (nums) {
      const parsed = nums.map((n) => parseInt(n.replace(/,/g, ''), 10));
      salaryMin = parsed[0];
      if (parsed.length >= 2) salaryMax = parsed[1];
    }
  }

  // --- Job type ---
  const criteriaEl = findInContainer(jobDetailContainer,
    '.job-details-jobs-unified-top-card__job-criteria',
    '[class*="criteria"]',
  );
  let jobType: string | undefined;
  criteriaEl?.querySelectorAll('li, span').forEach((li) => {
    const t = li.textContent?.trim().toLowerCase() || '';
    if (t.includes('full-time') || t.includes('part-time') || t.includes('contract') || t.includes('temporary') || t.includes('internship')) {
      jobType = li.textContent?.trim() || undefined;
    }
  });
  // Also check metadata chips anywhere
  if (!jobType) {
    jobDetailContainer.querySelectorAll('[class*="metadata"] span, [class*="chip"]').forEach((el) => {
      const t = el.textContent?.trim().toLowerCase() || '';
      if (t.includes('full-time') || t.includes('part-time') || t.includes('contract') || t.includes('internship')) {
        jobType = el.textContent?.trim() || undefined;
      }
    });
  }

  // --- Keywords ---
  const keywords: string[] = [];
  jobDetailContainer.querySelectorAll('[class*="skill"], [class*="keyword"], [class*="tag"], [data-anonymize="skill"]').forEach((el) => {
    const t = el.textContent?.trim();
    if (t && t.length < 50) keywords.push(t);
  });

  // --- Fallback: meta tags ---
  if (!companyName || !jobTitle) {
    const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content');
    const ogSite = document.querySelector('meta[property="og:site_name"]')?.getAttribute('content');
    if (!jobTitle && ogTitle) {
      const parts = ogTitle.split(' at ');
      if (parts.length >= 2) {
        jobTitle ||= parts[0].trim();
        companyName ||= parts.slice(1).join(' at ').trim();
      } else {
        jobTitle ||= ogTitle;
      }
    }
    companyName ||= ogSite || '';
  }

  // --- Fallback: look at EVERYTHING in the detail container ---
  if (!companyName && !jobTitle) {
    // List all class names in the container to help debug
    const allClasses = new Set<string>();
    jobDetailContainer.querySelectorAll('[class]').forEach((el) => {
      el.className?.split(/\s+/).forEach((c: string) => {
        if (c.includes('card') || c.includes('title') || c.includes('company') || c.includes('header')) {
          allClasses.add(c);
        }
      });
    });
    console.log('[CareerOS] relevant classes in container:', [...allClasses].slice(0, 30));

    // Bruteforce: grab text of the first 10 <h1..h3> in the container
    const headings = jobDetailContainer.querySelectorAll('h1, h2, h3');
    if (headings.length > 0) {
      jobTitle = headings[0]?.textContent?.trim() || '';
      if (headings.length > 1) {
        companyName = headings[1]?.textContent?.trim() || '';
      }
      console.log('[CareerOS] brute-force headings:', { h1: headings[0]?.textContent?.trim(), h2: headings[1]?.textContent?.trim(), h3: headings[2]?.textContent?.trim() });
    }
  }

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
