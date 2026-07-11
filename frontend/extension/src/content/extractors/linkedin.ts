interface Extraction {
  sourceUrl: string;
  companyName: string;
  companyDomain?: string;
  companyDescription?: string;
  companyLogoUrl?: string;
  companyUrl?: string;
  jobTitle: string;
  jobDescription?: string;
  jobDescriptionHtml?: string;
  jobLocation?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  jobType?: string;
  keywords?: string[];
  seniority?: string;
  industry?: string;
  jobFunction?: string;
  postedTime?: string;
  applicantCount?: number;
}

function getJobId(): string | null {
  const m = window.location.href.match(/currentJobId=(\d+)/);
  return m ? m[1] : null;
}

function cleanTitle(t: string): string {
  return t.replace(/\s*\([^)]*(vérifié|verified)[^)]*\)\s*/gi, '').trim();
}

// ─── Strategy 1: LinkedIn public job API ──────────────────────────

async function extractViaPublicAPI(): Promise<Extraction | null> {
  const jobId = getJobId();
  if (!jobId) return null;

  try {
    const res = await fetch(
      `https://www.linkedin.com/jobs-guest/jobs/api/jobPosting/${jobId}`,
      { credentials: 'include' },
    );
    if (!res.ok) {
      console.log('[CareerOS] public API returned', res.status);
      return null;
    }

    const html = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Extract from JSON-LD in the fetched page
    const scripts = doc.querySelectorAll('script[type="application/ld+json"]');
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
          const companyName = typeof org === 'object'
            ? (org?.name || org?.['@id'] || '')
            : (org || '');

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

          const title = job.title || doc.querySelector('h1')?.textContent?.trim() || '';
          const companyFallback = companyName
            || doc.querySelector('[class*="company"]')?.textContent?.trim()
            || '';

          if (companyFallback && title) {
            console.log('[CareerOS] public API: JSON-LD success');
            return {
              sourceUrl: window.location.href,
              companyName: companyFallback,
              companyDomain: companyFallback
                ? `${companyFallback.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`
                : undefined,
              jobTitle: title,
              jobDescription: job.description || undefined,
              jobLocation,
              salaryMin, salaryMax, salaryCurrency,
              jobType: job.employmentType || undefined,
              keywords: skillsList,
            };
          }
        }
      } catch { /* skip */ }
    }

    // Fallback: parse from HTML elements (no JSON-LD in response)
    const title =
      doc.querySelector('.top-card-layout__title')?.textContent?.trim() ||
      doc.querySelector('.topcard__title')?.textContent?.trim() ||
      '';
    const company =
      doc.querySelector('.topcard__org-name-link')?.textContent?.trim() ||
      '';
    const location = (() => {
      const row = doc.querySelector('.topcard__flavor-row');
      if (!row) return undefined;
      const bullets = row.querySelectorAll('.topcard__flavor--bullet');
      for (const b of bullets) {
        if (b.tagName === 'SPAN') return b.textContent?.trim();
      }
      return undefined;
    })();

    // Company logo + URL
    const logoImg = doc.querySelector<HTMLImageElement>('img.artdeco-entity-image[data-delayed-url]');
    const companyLogoUrl = logoImg?.getAttribute('data-delayed-url') || undefined;
    const companyUrl =
      doc.querySelector<HTMLAnchorElement>('a[data-tracking-control-name="public_jobs_topcard_logo"]')?.href ||
      doc.querySelector<HTMLAnchorElement>('.topcard__org-name-link')?.href ||
      undefined;

    // Description
    const descEl = doc.querySelector('.description__text');
    const description = descEl?.textContent?.trim().slice(0, 8000) || undefined;
    const descHtmlEl = doc.querySelector('.show-more-less-html__markup');
    const jobDescriptionHtml = descHtmlEl?.innerHTML?.trim().slice(0, 10000) || undefined;

    // Posted time
    const postedEl = doc.querySelector('.posted-time-ago__text');
    const postedTime = postedEl?.textContent?.trim() || undefined;

    // Applicant count
    const applicantsEl = doc.querySelector('.num-applicants__caption');
    const applicantCount = (() => {
      if (!applicantsEl) return undefined;
      const text = applicantsEl.textContent?.trim() || '';
      const nums = text.match(/\d+/);
      return nums ? parseInt(nums[0], 10) : undefined;
    })();

    // Criteria list: seniority, job type, function, industry
    let jobType: string | undefined;
    let seniority: string | undefined;
    let jobFunction: string | undefined;
    let industry: string | undefined;
    const criteriaItems = doc.querySelectorAll('.description__job-criteria-item');
    for (const item of criteriaItems) {
      const header = item.querySelector('.description__job-criteria-subheader');
      const value = item.querySelector('.description__job-criteria-text--criteria');
      if (!header || !value) continue;
      const label = header.textContent?.trim().toLowerCase() || '';
      const val = value.textContent?.trim() || '';
      if (label.includes('type') || label.includes('emploi')) jobType = val;
      else if (label.includes('niveau') || label.includes('hiérarchique') || label.includes('seniority')) seniority = val;
      else if (label.includes('fonction')) jobFunction = val;
      else if (label.includes('secteur') || label.includes('industry')) industry = val;
    }

    // Salary text
    const salaryText = doc.body.innerText.match(/[$£€₹¥]\s*\d[\d,]*\s*[-–]\s*[$£€₹¥]?\s*\d[\d,]*/)?.[0];
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

    if (company && title) {
      console.log('[CareerOS] public API: HTML parse success');
      return {
        sourceUrl: window.location.href,
        companyName: company,
        companyDomain: company ? `${company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com` : undefined,
        companyLogoUrl,
        companyUrl,
        jobTitle: title,
        jobDescription: description,
        jobDescriptionHtml,
        jobLocation: location,
        salaryMin, salaryMax, salaryCurrency,
        jobType,
        seniority,
        industry,
        jobFunction,
        postedTime,
        applicantCount,
      };
    }

    console.log('[CareerOS] public API: could not parse');
    return null;
  } catch (e) {
    console.log('[CareerOS] public API error:', e);
    return null;
  }
}

// ─── Strategy 2: selected job card (by href containing currentJobId) ──

function extractFromSelectedCard(): Extraction | null {
  const jobId = getJobId();
  if (!jobId) return null;

  const links = document.querySelectorAll(`a[href*="${jobId}"]`);
  if (!links.length) return null;

  let card = links[0].closest('[class*="job-card"], [class*="search-result"], li, article') || links[0];
  for (let i = 0; i < 4; i++) {
    const parent = card.parentElement;
    if (!parent || parent === document.body) break;
    if (parent.textContent && parent.textContent.trim().length > 100) card = parent;
  }

  const text = card.textContent?.trim() || '';
  const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 1);

  let jobTitle = '';
  for (const l of lines) {
    if (l.length >= 15 && !/^[a-z]/.test(l) && (l.includes('/') || l.includes(' - ') || l.includes(' | ') || l.length >= 25)) {
      jobTitle = cleanTitle(l);
      break;
    }
  }
  if (!jobTitle) {
    const sorted = [...lines].filter((l) => l.length >= 15 && !/^[a-z]/.test(l)).sort((a, b) => b.length - a.length);
    jobTitle = sorted[0] || '';
    jobTitle = cleanTitle(jobTitle);
  }

  const titleIdx = lines.indexOf(jobTitle) >= 0 ? lines.indexOf(jobTitle) : 0;
  let companyName = '';
  for (let i = titleIdx + 1; i < Math.min(titleIdx + 6, lines.length); i++) {
    const l = lines[i];
    if (l.length > 1 && l.length < 45 && /^[A-ZÀ-Œ]/.test(l) && l !== jobTitle && !jobTitle.includes(l)) {
      companyName = l;
      break;
    }
  }

  let jobLocation: string | undefined;
  for (let i = titleIdx + 1; i < Math.min(titleIdx + 8, lines.length); i++) {
    const l = lines[i];
    if (l.includes(',') || l.includes('(') || l.includes('Hybride') || l.includes('Remote') ||
        l.includes('À distance') || /(madrid|paris|barcelona|london|berlin|new york|san francisco|spain|france)/i.test(l)) {
      jobLocation = l; break;
    }
  }

  let salaryMin: number | undefined, salaryMax: number | undefined, salaryCurrency: string | undefined;
  const salLine = lines.find((l) => /[$£€₹¥]\s*\d[\d,]*/.test(l));
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

  const typeLine = lines.find((l) =>
    /(full.?time|part.?time|contract|temporary|internship|freelance|cdi|cdd|temps plein|temps partiel)/i.test(l));

  if (!companyName && !jobTitle) return null;
  return {
    sourceUrl: window.location.href,
    companyName: companyName || '',
    companyDomain: companyName ? `${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com` : undefined,
    jobTitle: jobTitle || '',
    jobLocation,
    salaryMin, salaryMax, salaryCurrency,
    jobType: typeLine || undefined,
  };
}

// ─── Strategy 3: JSON-LD from current page ──────────────────────────

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
          jobLocation = loc?.addressLocality || loc?.name || (typeof addr === 'object' ? addr?.addressLocality : undefined) || (typeof addr === 'string' ? addr : undefined);
        } else if (typeof loc === 'string') jobLocation = loc;
        const salary = job.baseSalary;
        let salaryMin: number | undefined, salaryMax: number | undefined, salaryCurrency: string | undefined;
        if (salary) {
          salaryMin = salary?.minValue ? Number(salary.minValue) : undefined;
          salaryMax = salary?.maxValue ? Number(salary.maxValue) : undefined;
          salaryCurrency = salary?.currency;
        }
        let skillsList: string[] | undefined;
        if (typeof job.skills === 'string') skillsList = job.skills.split(',').map((s: string) => s.trim()).filter(Boolean).slice(0, 20);
        else if (Array.isArray(job.skills)) skillsList = job.skills.map((s: unknown) => String(s)).filter(Boolean).slice(0, 20);
        const r: Extraction = {
          sourceUrl: window.location.href,
          companyName: companyName || '',
          companyDomain: companyName ? `${String(companyName).toLowerCase().replace(/[^a-z0-9]/g, '')}.com` : undefined,
          jobTitle: job.title || '',
          jobDescription: job.description || undefined,
          jobLocation, salaryMin, salaryMax, salaryCurrency,
          jobType: job.employmentType || undefined,
          keywords: skillsList,
        };
        if (r.companyName && r.jobTitle) return r;
      }
    } catch { /* skip */ }
  }
  return null;
}

// ─── Main export ──────────────────────────────────────────────────

export async function extractLinkedIn(): Promise<Extraction | null> {
  console.log('[CareerOS] extractLinkedIn running on', window.location.href);

  // 1. Public job API (most reliable)
  try {
    const api = await extractViaPublicAPI();
    if (api) { console.log('[CareerOS] success: public API'); return api; }
  } catch { /* fall through */ }

  // 2. Selected card by jobId in href
  const card = extractFromSelectedCard();
  if (card) { console.log('[CareerOS] success: selected card'); return card; }

  // 3. JSON-LD on current page
  const ld = extractLdJson();
  if (ld) { console.log('[CareerOS] success: JSON-LD'); return ld; }

  console.log('[CareerOS] all strategies failed');
  return null;
}
