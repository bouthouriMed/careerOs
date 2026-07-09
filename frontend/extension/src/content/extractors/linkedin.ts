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

function firstText(...els: (Element | null | undefined)[]): string | undefined {
  for (const el of els) {
    const t = el?.textContent?.trim();
    if (t) return t;
  }
  return undefined;
}

/** Try to extract from JSON-LD script tag */
function extractFromLdJson(): Extraction | null {
  const scripts = document.querySelectorAll('script[type="application/ld+json"]');
  for (const script of scripts) {
    try {
      const raw = JSON.parse(script.textContent || '{}');
      const items = Array.isArray(raw) ? raw : [raw];
      for (const item of items) {
        if (item['@type'] === 'JobPosting' || item?.['@graph']?.some?.((g: Record<string, unknown>) => g['@type'] === 'JobPosting')) {
          const job = item['@type'] === 'JobPosting' ? item : item['@graph'].find((g: Record<string, unknown>) => g['@type'] === 'JobPosting');
          if (!job) continue;

          const companyName =
            typeof job.hiringOrganization === 'object'
              ? (job.hiringOrganization?.name || job.hiringOrganization?.['@id'] || '')
              : (job.hiringOrganization || '');

          let jobLocation: string | undefined;
          if (typeof job.jobLocation === 'object') {
            const loc = job.jobLocation;
            jobLocation =
              loc?.addressLocality ||
              loc?.name ||
              loc?.['@id'] ||
              (typeof loc.address === 'object' ? loc.address?.addressLocality : undefined) ||
              (typeof loc.address === 'string' ? loc.address : undefined);
          } else if (typeof job.jobLocation === 'string') {
            jobLocation = job.jobLocation;
          }

          const salaryObj = job.baseSalary;
          let salaryMin: number | undefined;
          let salaryMax: number | undefined;
          let salaryCurrency: string | undefined;
          if (salaryObj) {
            salaryMin = salaryObj?.minValue ? Number(salaryObj.minValue) : undefined;
            salaryMax = salaryObj?.maxValue ? Number(salaryObj.maxValue) : undefined;
            salaryCurrency = salaryObj?.currency;
          }

          const employmentType = job.employmentType;

          // skills may be a CSV string or an array
          let skillsList: string[] | undefined;
          if (typeof job.skills === 'string') {
            skillsList = job.skills.split(',').map((s: string) => s.trim()).filter(Boolean).slice(0, 20);
          } else if (Array.isArray(job.skills)) {
            skillsList = job.skills.map((s: unknown) => String(s)).filter(Boolean).slice(0, 20);
          }

          return {
            sourceUrl: window.location.href,
            companyName: companyName || '',
            companyDomain: companyName
              ? `${String(companyName).toLowerCase().replace(/[^a-z0-9]/g, '')}.com`
              : undefined,
            jobTitle: job.title || '',
            jobDescription: job.description || undefined,
            jobLocation: typeof jobLocation === 'string' ? jobLocation : undefined,
            salaryMin,
            salaryMax,
            salaryCurrency,
            jobType: typeof employmentType === 'string' ? employmentType : undefined,
            keywords: skillsList,
          };
        }
      }
    } catch {}
  }
  return null;
}

/** Heuristic extraction from page text (works with obfuscated class names) */
function extractFromPageText(): Extraction | null {
  const main = document.querySelector('main');
  if (!main) return null;

  const allText = main.innerText;
  const lines = allText.split('\n').map((l) => l.trim()).filter(Boolean);

  // Find job title: usually the first large heading in the detail panel area
  // On search-results, the detail panel is the second major section in <main>
  const mainChildren = Array.from(main.children).filter((c) => c.tagName === 'DIV' || c.tagName === 'SECTION');

  // The job detail panel is typically the SECOND child when a job is selected
  // (first is search results list, second is detail panel)
  const panels = mainChildren.filter((c) => {
    const text = c.innerText.trim();
    return text.length > 100 && !text.includes('Search results');
  });

  const panelText = panels.length >= 2
    ? panels[panels.length - 1].innerText  // last panel = detail panel
    : main.innerText;

  const detailLines = panelText.split('\n').map((l) => l.trim()).filter(Boolean);

  // Lines near top are likely: [Company, Job Title, Location] or [Job Title, Company, Location]
  // Skip empty/short lines and navigation items
  const topLines = detailLines.filter((l) => l.length > 2).slice(0, 15);

  let jobTitle = '';
  let companyName = '';

  // Strategy: find the salary line, location line, and work backwards to find company + title
  const salaryIdx = topLines.findIndex((l) => /\d[\d,]*/.test(l) && /[\$£€₹¥]/.test(l));
  const locationIdx = topLines.findIndex((l) =>
    /,/.test(l) && /[A-Z]/.test(l) && l.length > 3 && l.length < 60,
  );

  // Company and title are typically before location and salary
  const upperBound = Math.min(
    salaryIdx >= 0 ? salaryIdx : topLines.length,
    locationIdx >= 0 ? locationIdx : topLines.length,
    8,
  );

  const candidateLines = topLines.slice(0, Math.max(upperBound, 3));

  if (candidateLines.length >= 2) {
    // Heuristic: shorter line is often company, longer is title
    const sorted = [...candidateLines].sort((a, b) => a.length - b.length);
    companyName = sorted[0];
    jobTitle = sorted[sorted.length - 1];
  } else if (candidateLines.length === 1) {
    // Single line, try to split on " at " (e.g., "Software Engineer at Google")
    const parts = candidateLines[0].split(' at ');
    if (parts.length >= 2) {
      jobTitle = parts.slice(0, -1).join(' at ');
      companyName = parts[parts.length - 1];
    } else {
      jobTitle = candidateLines[0];
    }
  }

  // --- Location ---
  let jobLocation: string | undefined;
  const locLine = topLines.find(
    (l) => l.includes(',') && /[A-Z]/.test(l) && l.length > 3 && l.length < 60,
  );
  if (locLine && locLine !== companyName && locLine !== jobTitle) {
    jobLocation = locLine;
  }

  // --- Salary ---
  let salaryMin: number | undefined;
  let salaryMax: number | undefined;
  let salaryCurrency: string | undefined;
  const salLine = topLines.find((l) => /\d[\d,]*/.test(l) && /[\$£€₹¥]/.test(l));
  if (salLine) {
    const nums = salLine.match(/\d[\d,]*/g);
    const currMatch = salLine.match(/([A-Z]{3}|[$£€₹¥])/);
    salaryCurrency = currMatch?.[1];
    if (nums) {
      const parsed = nums.map((n) => parseInt(n.replace(/,/g, ''), 10));
      salaryMin = parsed[0];
      if (parsed.length >= 2) salaryMax = parsed[parsed.length - 1];
    }
  }

  // --- Job type (full-time, contract, etc.) ---
  let jobType: string | undefined;
  const typeLine = topLines.find((l) =>
    /(full.?time|part.?time|contract|temporary|internship|freelance)/i.test(l),
  );
  if (typeLine) jobType = typeLine;

  // --- Description ---
  // Everything after the first ~20 lines and before "See how you compare" or similar
  const descStart = detailLines.findIndex(
    (l) => l === jobTitle || candidateLines.includes(l),
  );
  const descEndCutoff = detailLines.findIndex(
    (l) => l.includes('See how you compare') || l.includes('About the job') || l.includes('Job description'),
  );
  const descSliceStart = Math.max(descStart + 1, 0);
  const descSliceEnd = descEndCutoff > descStart ? descEndCutoff : undefined;
  const descLines = detailLines.slice(descSliceStart, descSliceEnd);
  const jobDescription = descLines.length > 3 ? descLines.join('\n').slice(0, 5000) : undefined;

  // --- Keywords ---
  const keywords: string[] = [];
  const kwIdx = detailLines.findIndex((l) => /(skills|qualifications|requirements)/i.test(l));
  if (kwIdx >= 0) {
    for (let i = kwIdx + 1; i < Math.min(kwIdx + 20, detailLines.length); i++) {
      const line = detailLines[i];
      if (line.length < 60 && !line.endsWith('.') && !line.endsWith(':') && line.length > 2) {
        keywords.push(line);
      }
    }
  }

  if (!companyName && !jobTitle) return null;

  const domain = companyName
    ? `${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`
    : undefined;

  return {
    sourceUrl: window.location.href,
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

export function extractLinkedIn(): Extraction | null {
  const url = window.location.href;
  console.log('[CareerOS] extractLinkedIn running on', url);

  // Strategy 1: JSON-LD (most reliable)
  const ld = extractFromLdJson();
  if (ld && ld.companyName && ld.jobTitle) {
    console.log('[CareerOS] extracted from JSON-LD');
    return ld;
  }

  // Strategy 2: page text heuristics
  const text = extractFromPageText();
  if (text && text.companyName && text.jobTitle) {
    console.log('[CareerOS] extracted from page text');
    return text;
  }

  // Strategy 3: partial JSON-LD result
  if (ld && ld.jobTitle) {
    console.log('[CareerOS] partial JSON-LD result');
    return ld;
  }

  console.log('[CareerOS] LinkedIn extractor: all strategies failed');
  return null;
}
