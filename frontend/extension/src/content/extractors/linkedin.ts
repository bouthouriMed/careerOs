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

/** Extract jobId from URL */
function getJobId(): string | null {
  const m = window.location.href.match(/currentJobId=(\d+)/);
  return m ? m[1] : null;
}

/**
 * Try LinkedIn's own Voyager API.
 * The content script runs on linkedin.com so same-origin fetch works.
 */
async function extractViaAPI(): Promise<Extraction | null> {
  const jobId = getJobId();
  if (!jobId) return null;

  const csrfToken =
    document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ||
    document.querySelector('meta[name="csrfToken"]')?.getAttribute('content') ||
    '';

  const headers: Record<string, string> = {
    accept: 'application/vnd.linkedin.normalized+json+2.1',
    'csrf-token': csrfToken,
  };
  if (csrfToken) headers['x-restli-protocol-version'] = '2.0.0';

  try {
    const res = await fetch(
      `https://www.linkedin.com/voyager/api/jobs/jobPostings/${jobId}?decorationId=com.linkedin.voyager.deco.jobs.web.shared.WebJobPosting-6`,
      { headers, credentials: 'include' },
    );
    if (!res.ok) return null;

    const data = await res.json();
    const included = data?.included || [];
    const jobData = included.find((i: Record<string, unknown>) => i.$type?.includes('JobPosting'));
    if (!jobData) return null;

    const companyData = included.find((i: Record<string, unknown>) => i.$type?.includes('Company'));
    const titleData = included.find((i: Record<string, unknown>) => i.$type?.includes('JobPostingTitle'));
    const locData = included.find((i: Record<string, unknown>) => i.$type?.includes('JobPostingLocation'));

    const companyName =
      companyData?.name ||
      companyData?.companyName ||
      jobData?.companyDetails?.company?.name ||
      '';

    const jobTitle =
      titleData?.text ||
      jobData?.title ||
      '';

    const jobLocation =
      locData?.text ||
      locData?.locationName ||
      jobData?.formattedLocation ||
      '';

    const desc = jobData?.description?.text ||
      jobData?.description ||
      '';

    const salary = jobData?.salary || jobData?.compensation;
    let salaryMin: number | undefined;
    let salaryMax: number | undefined;
    let salaryCurrency: string | undefined;
    if (salary) {
      salaryMin = salary.minValue?.amount || salary.minAmount;
      salaryMax = salary.maxValue?.amount || salary.maxAmount;
      salaryCurrency = salary.currency || salary.minValue?.currency;
    }

    const jobType = jobData?.employmentType || jobData?.workplaceTypes?.[0] || '';

    const skills: string[] = [];
    if (jobData?.skills) {
      for (const s of jobData.skills) {
        const name = s.name || s.text;
        if (name) skills.push(name);
      }
    }

    if (!companyName && !jobTitle) return null;

    return {
      sourceUrl: window.location.href,
      companyName: companyName || '',
      companyDomain: companyName
        ? `${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`
        : undefined,
      jobTitle: jobTitle || '',
      jobDescription: desc ? desc.slice(0, 8000) : undefined,
      jobLocation: typeof jobLocation === 'string' ? jobLocation : undefined,
      salaryMin,
      salaryMax,
      salaryCurrency,
      jobType: typeof jobType === 'string' ? jobType : undefined,
      keywords: skills.length > 0 ? skills.slice(0, 20) : undefined,
    };
  } catch {
    return null;
  }
}

/** JSON-LD */
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
 * Find detail container by looking for content markers.
 * On LinkedIn's search-results page the detail panel has headings
 * like "About the job", "Job description", etc.
 */
function findDetailContainer(): Element | null {
  const markers = [
    'about the job', 'job description', 'description',
    'à propos de l\'offre', 'description du poste',
    'über die stelle', 'stellenbeschreibung',
    'sobre el empleo', 'descripción del puesto',
    'over de baan', 'functiebeschrijving',
    'om jobbet', 'jobbeskrivelse',
  ];

  for (const marker of markers) {
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null,
    );
    let node: Text | null;
    while ((node = walker.nextNode() as Text | null)) {
      const text = node.textContent?.trim().toLowerCase() || '';
      if (text.startsWith(marker) || text === marker) {
        // Climb to a reasonable-sized container
        let el = node.parentElement;
        for (let i = 0; i < 6 && el; i++) {
          if ((el.tagName === 'SECTION' || el.tagName === 'DIV') && (el.textContent?.length || 0) > 300) {
            return el;
          }
          el = el.parentElement;
        }
        return node.parentElement?.closest('section, div, article') || node.parentElement;
      }
    }
  }
  return null;
}

function extractFromDOM(container: Element): Extraction | null {
  const url = window.location.href;

  const heading = container.querySelector('h1, h2, h3');
  const jobTitle = heading?.textContent?.trim() || '';

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
    const ariaEl = container.querySelector('[aria-label*="company" i], [aria-label*="organization" i], [aria-label*="entreprise" i]');
    companyName = ariaEl?.textContent?.trim() || ariaEl?.getAttribute('aria-label')?.trim() || '';
  }

  const locEl = container.querySelector('[aria-label*="location" i], [aria-label*="lieu" i]');
  const jobLocation = locEl?.textContent?.trim() || locEl?.getAttribute('aria-label')?.trim() || undefined;

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

/** Full-page text heuristic fallback */
function extractFromPageText(): Extraction | null {
  const url = window.location.href;
  const allText = document.body.innerText;
  const lines = allText.split('\n').map((l) => l.trim()).filter((l) => l.length > 1);

  // Log first 30 lines for debugging
  console.log('[CareerOS] page lines (first 30):', lines.slice(0, 30));

  // Find clusters with salary or location+type markers
  for (let i = 0; i < Math.min(lines.length - 2, 50); i++) {
    const cluster = lines.slice(i, i + 10);
    const hasSalary = cluster.some((l) => /[$£€₹¥]\s*\d[\d,]*/.test(l) || /(k\s*[-–]\s*\d+)/.test(l));
    const hasLocation = cluster.some((l) => /(hybride|remote|à distance|madrid|paris|barcelona|spain|france|europe|united states|new york|san francisco|londres|london|berlin)/i.test(l));
    const hasType = cluster.some((l) => /(full.?time|part.?time|contract|cdi|cdd|temps plein|temps partiel)/i.test(l));

    if (hasSalary || (hasLocation && hasType)) {
      const top = cluster.slice(0, 4).filter((l) => l.length > 2);
      const sorted = [...top].sort((a, b) => a.length - b.length);
      const companyName = sorted[0] || '';
      const jobTitle = sorted[sorted.length - 1] || '';

      if (jobTitle && jobTitle.length > 10) {
        const locationLine = cluster.find((l) => /(hybride|remote|à distance|madrid|paris|barcelona|spain|france)/i.test(l) && l.length < 60);
        const salLine = cluster.find((l) => /[$£€₹¥]\s*\d[\d,]*/.test(l));
        const typeLine = cluster.find((l) => /(full.?time|part.?time|contract|cdi|cdd)/i.test(l));
        const descStart = lines.findIndex((l) => /(about the job|job description|qualifications|the role)/i.test(l));
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

  // Debug: log page structure
  const main = document.querySelector('main');
  if (main) {
    console.log('[CareerOS] <main> has', main.children.length, 'direct children');
    for (let i = 0; i < main.children.length; i++) {
      const child = main.children[i];
      console.log(`[CareerOS]   child ${i}: tag=${child.tagName} text.length=${child.textContent?.length} hasImg=${!!child.querySelector('img')} hasH1=${!!child.querySelector('h1, h2, h3')}`);
    }
  } else {
    console.log('[CareerOS] no <main> found');
  }

  // 1. API
  // NOTE: This runs synchronously for now; the popup won't await it.
  // We'll handle async properly in the next iteration.
  // For now, fall through to other strategies.

  // 2. JSON-LD
  const ld = extractLdJson();
  if (ld) {
    console.log('[CareerOS] success: JSON-LD');
    return ld;
  }

  // 3. Detail container markers
  const container = findDetailContainer();
  if (container) {
    console.log('[CareerOS] detail container found, tag:', container.tagName, 'text.length:', container.textContent?.length);
    const result = extractFromDOM(container);
    if (result && result.companyName && result.jobTitle) {
      console.log('[CareerOS] success: detail container');
      return result;
    }
    console.log('[CareerOS] extractFromDOM failed, trying text heuristics');
    const textResult = extractFromPageText();
    if (textResult) return textResult;
  } else {
    console.log('[CareerOS] no detail container found via markers');
  }

  // 4. Page text heuristics
  console.log('[CareerOS] trying full-page text heuristics');
  const fallback = extractFromPageText();
  if (fallback) return fallback;

  console.log('[CareerOS] all strategies failed');
  return null;
}
