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

/**
 * LinkedIn's search-results page has obfuscated CSS class names so
 * class-based selectors don't work.  Instead we find the job-detail
 * panel by looking for content markers that ONLY appear in the
 * detail panel — specifically the "About the job" heading (or its
 * localised equivalent).
 */

const DESC_MARKERS = [
  'about the job', 'job description', 'description',
  'à propos de l\'offre', 'description du poste',
  'über die stelle', 'stellenbeschreibung',
  'sobre el empleo', 'descripción del puesto',
  'over de baan', 'functiebeschrijving',
  'om jobbet', 'jobbeskrivelse',
];

/** Walk up the DOM tree at most `maxLevels` levels */
function climb(el: Element | null, maxLevels = 5): Element | null {
  let current = el;
  for (let i = 0; i < maxLevels && current; i++) {
    current = current.parentElement;
    if (current?.tagName === 'SECTION' || current?.tagName === 'DIV') {
      const text = current.textContent?.trim() || '';
      // Container is large enough to hold full job details
      if (text.length > 300) return current;
    }
  }
  return el?.parentElement || el;
}

/** Try JSON-LD first */
function extractLdJson(): Extraction | null {
  const scripts = document.querySelectorAll('script[type="application/ld+json"]');
  for (const script of scripts) {
    try {
      const raw = JSON.parse(script.textContent || '{}');
      const items = Array.isArray(raw) ? raw : [raw];
      for (const item of items) {
        const job = item['@type'] === 'JobPosting'
          ? item
          : item['@graph']?.find((g: Record<string, unknown>) => g['@type'] === 'JobPosting');
        if (!job) continue;

        const org = job.hiringOrganization;
        const companyName = typeof org === 'object' ? (org?.name || org?.['@id'] || '') : (org || '');

        const loc = job.jobLocation;
        let jobLocation: string | undefined;
        if (typeof loc === 'object') {
          const addr = loc?.address;
          jobLocation = loc?.addressLocality
            || loc?.name
            || (typeof addr === 'object' ? addr?.addressLocality : undefined)
            || (typeof addr === 'string' ? addr : undefined);
        } else if (typeof loc === 'string') {
          jobLocation = loc;
        }

        const salary = job.baseSalary;
        let salaryMin: number | undefined;
        let salaryMax: number | undefined;
        let salaryCurrency: string | undefined;
        if (salary) {
          salaryMin = salary?.minValue ? Number(salary.minValue) : undefined;
          salaryMax = salary?.maxValue ? Number(salary.maxValue) : undefined;
          salaryCurrency = salary?.currency;
        }

        let skillsList: string[] | undefined;
        if (typeof job.skills === 'string') {
          skillsList = job.skills.split(',').map((s: string) => s.trim()).filter(Boolean).slice(0, 20);
        } else if (Array.isArray(job.skills)) {
          skillsList = job.skills.map((s: unknown) => String(s)).filter(Boolean).slice(0, 20);
        }

        const result: Extraction = {
          sourceUrl: window.location.href,
          companyName: companyName || '',
          companyDomain: companyName
            ? `${String(companyName).toLowerCase().replace(/[^a-z0-9]/g, '')}.com`
            : undefined,
          jobTitle: job.title || '',
          jobDescription: job.description || undefined,
          jobLocation,
          salaryMin,
          salaryMax,
          salaryCurrency,
          jobType: job.employmentType || undefined,
          keywords: skillsList,
        };
        if (result.companyName && result.jobTitle) return result;
      }
    } catch { /* skip */ }
  }
  return null;
}

/**
 * Find the job detail panel by locating text markers
 * that only exist in the detail section.
 */
function findDetailContainer(): Element | null {
  // Look for any element whose text matches a description marker
  for (const marker of DESC_MARKERS) {
    // querySelector with :contains doesn't exist; walk the DOM
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null,
    );
    let node: Text | null;
    while ((node = walker.nextNode() as Text | null)) {
      if (node.textContent?.trim().toLowerCase().startsWith(marker)) {
        // Found the marker text node — climb to a container
        const container = climb(node.parentElement, 6);
        if (container) return container;
      }
    }
  }
  return null;
}

function extractFromDOM(container: Element): Extraction | null {
  const url = window.location.href;

  // Job title: first h1/h2/h3 in container
  const heading = container.querySelector('h1, h2, h3');
  const jobTitle = heading?.textContent?.trim() || '';

  // Company: first <a> linking to /company/ or <img alt>
  let companyName = '';
  const companyLink = container.querySelector('a[href*="/company/"], a[href*="/jobs/"]');
  if (companyLink) {
    companyName = companyLink.textContent?.trim() || companyLink.getAttribute('aria-label')?.trim() || '';
  }
  if (!companyName) {
    const logoImg = container.querySelector('img[alt]');
    if (logoImg) {
      const alt = logoImg.getAttribute('alt')?.trim();
      if (alt && alt.length > 1 && alt.length < 50) companyName = alt;
    }
  }
  if (!companyName) {
    // Try any element with aria-label containing company/organization
    const ariaEl = container.querySelector('[aria-label*="company" i], [aria-label*="organization" i], [aria-label*="entreprise" i]');
    companyName = ariaEl?.textContent?.trim() || ariaEl?.getAttribute('aria-label')?.trim() || '';
  }

  // Location
  const locEl = container.querySelector('[aria-label*="location" i], [aria-label*="lieu" i]');
  const jobLocation = locEl?.textContent?.trim() || locEl?.getAttribute('aria-label')?.trim() || undefined;

  // Salary
  const salEl = container.querySelector('[aria-label*="salary" i], [aria-label*="salaire" i], [aria-label*="compensation" i]');
  const salaryText = salEl?.textContent?.trim();
  let salaryMin: number | undefined;
  let salaryMax: number | undefined;
  let salaryCurrency: string | undefined;
  if (salaryText) {
    const nums = salaryText.match(/\d[\d,]*/g);
    const curr = salaryText.match(/([A-Z]{3}|[$£€₹¥])/);
    salaryCurrency = curr?.[1];
    if (nums) {
      const parsed = nums.map((n) => parseInt(n.replace(/,/g, ''), 10));
      salaryMin = parsed[0];
      if (parsed.length >= 2) salaryMax = parsed[parsed.length - 1];
    }
  }

  // Description: everything starting from the marker we found (already in container)
  const descPart = container.textContent?.trim().slice(0, 8000) || undefined;

  if (!companyName || !jobTitle) return null;
  return {
    sourceUrl: url,
    companyName,
    companyDomain: companyName ? `${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com` : undefined,
    jobTitle,
    jobDescription: descPart,
    jobLocation,
    salaryMin,
    salaryMax,
    salaryCurrency,
  };
}

/**
 * Fallback: extract from page text using heuristics.
 * Only used when detail-container approach fails.
 */
function extractFromPageText(): Extraction | null {
  const url = window.location.href;
  const allText = document.body.innerText;
  const lines = allText.split('\n').map((l) => l.trim()).filter((l) => l.length > 1);

  // Find the job title: look for lines with salary nearby
  // Strategy: find a cluster of lines containing: title (~30-120 chars), company (~5-40 chars), salary marker
  for (let i = 0; i < Math.min(lines.length - 2, 40); i++) {
    const cluster = lines.slice(i, i + 8);
    const hasSalary = cluster.some((l) => /[$£€₹¥]\s*\d[\d,]*/.test(l) || /(k|k€|k\$)\s*[-–]/.test(l));
    const hasLocation = cluster.some((l) => /(hybride|remote|à distance|madrid|paris|barcelona|spain|france|europe|united states|new york|san francisco|londres|london|berlin)/i.test(l));
    const hasType = cluster.some((l) => /(full.?time|part.?time|contract|cdi|cdd)/i.test(l));

    if (hasSalary || (hasLocation && hasType)) {
      // First few lines of this cluster are likely [Company, Title] or [Title, Company]
      const top = cluster.slice(0, 4);
      const sorted = [...top].sort((a, b) => a.length - b.length);
      const companyName = sorted[0];
      const jobTitle = sorted[sorted.length - 1];

      if (jobTitle && jobTitle.length > 10) {
        const locationLine = cluster.find((l) => /(hybride|remote|à distance|madrid|paris|barcelona|spain|france)/i.test(l) && l.length < 60);
        const salLine = cluster.find((l) => /[$£€₹¥]\s*\d[\d,]*/.test(l));
        const typeLine = cluster.find((l) => /(full.?time|part.?time|contract|cdi|cdd)/i.test(l));
        const descStart = lines.findIndex((l) => /(about the job|job description|qualifications)/i.test(l));
        const description = descStart > 0 ? lines.slice(descStart).join('\n').slice(0, 5000) : undefined;

        let salaryMin: number | undefined;
        let salaryMax: number | undefined;
        let salaryCurrency: string | undefined;
        if (salLine) {
          const nums = salLine.match(/\d[\d,]*/g);
          const curr = salLine.match(/([A-Z]{3}|[$£€₹¥])/);
          salaryCurrency = curr?.[1];
          if (nums) {
            const parsed = nums.map((n) => parseInt(n.replace(/,/g, ''), 10));
            salaryMin = parsed[0];
            if (parsed.length >= 2) salaryMax = parsed[parsed.length - 1];
          }
        }

        return {
          sourceUrl: url,
          companyName: companyName || '',
          companyDomain: companyName ? `${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com` : undefined,
          jobTitle,
          jobDescription: description,
          jobLocation: locationLine,
          salaryMin,
          salaryMax,
          salaryCurrency,
          jobType: typeLine,
        };
      }
    }
  }

  return null;
}

export function extractLinkedIn(): Extraction | null {
  console.log('[CareerOS] extractLinkedIn running on', window.location.href);

  // 1. JSON-LD
  const ld = extractLdJson();
  if (ld) {
    console.log('[CareerOS] success: JSON-LD');
    return ld;
  }

  // 2. Find detail container by text markers, then extract from DOM
  const container = findDetailContainer();
  if (container) {
    console.log('[CareerOS] detail container found via markers');
    const result = extractFromDOM(container);
    if (result && result.companyName && result.jobTitle) {
      console.log('[CareerOS] success: detail container DOM');
      return result;
    }
    // Fallback within container: text heuristics
    console.log('[CareerOS] detail container DOM failed, trying text heuristics');
    const textResult = extractFromPageText();
    if (textResult) return textResult;
  }

  // 3. Full-page text heuristics
  console.log('[CareerOS] trying full-page text heuristics');
  const fallback = extractFromPageText();
  if (fallback) return fallback;

  console.log('[CareerOS] all strategies failed');
  return null;
}
