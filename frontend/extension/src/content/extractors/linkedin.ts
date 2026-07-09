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
    } catch { /* skip invalid JSON */ }
  }
  return null;
}

/** Find the job detail panel within <main> using structural hints */
function findDetailPanel(): Element | null {
  const main = document.querySelector('main');
  if (!main) return null;

  const children = Array.from(main.children).filter((c) => c.tagName === 'DIV' || c.tagName === 'SECTION');

  // On search-results with a selected job, the layout is:
  //   child 0: search results list (many repeating job cards)
  //   child 1: job detail panel
  // The detail panel is identifiable by:
  //   - has an <img> near the top (company logo)
  //   - has a heading <h1> or <h2>
  //   - has a large text block (> 1000 chars)
  //   - contains markers like "job description" or "about the job"

  const scored = children.map((el) => {
    const html = el.innerHTML.slice(0, 500).toLowerCase();
    const text = el.textContent?.trim() || '';
    const topHtml = el.innerHTML.slice(0, 2000).toLowerCase();

    let score = 0;
    // Has company logo image
    if (el.querySelector('img')) score += 2;
    // Has heading
    if (el.querySelector('h1, h2, h3')) score += 2;
    // Large text block
    if (text.length > 1000) score += 2;
    // Contains job description markers
    if (/about the job|job description|qualifications|responsibilities/i.test(topHtml)) score += 3;
    // Contains salary pattern
    if (/[$£€₹¥]\s*\d[\d,]*/i.test(topHtml)) score += 2;
    // Not the search results list (which has many repeating "job card" patterns)
    const cardCount = (html.match(/job-card|search-result|result-card/gi) || []).length;
    if (cardCount < 3) score += 1;

    return { el, score, text };
  });

  scored.sort((a, b) => b.score - a.score);
  const best = scored[0];
  return best && best.score >= 3 ? best.el : null;
}

/** Extract from DOM structure of the panel (tag-based, no CSS classes needed) */
function extractFromPanelDOM(panel: Element): Extraction | null {
  const url = window.location.href;

  // Job title: first <h1> or <h2> or <h3>
  const heading = panel.querySelector('h1, h2, h3');
  const jobTitle = heading?.textContent?.trim() || '';

  // Company: first <a> that points to /company/ or similar, OR the <img> alt text
  let companyName = '';
  const companyLink = panel.querySelector('a[href*="/company/"], a[href*="/jobs/"]');
  if (companyLink) {
    companyName = companyLink.textContent?.trim() || companyLink.getAttribute('aria-label')?.trim() || '';
  }
  if (!companyName) {
    const logoImg = panel.querySelector('img[alt]');
    if (logoImg) {
      const alt = logoImg.getAttribute('alt')?.trim();
      if (alt && alt.length > 1 && alt.length < 50) companyName = alt;
    }
  }
  // Also check any element with aria-label containing "company"
  if (!companyName) {
    const ariaCompany = panel.querySelector('[aria-label*="company" i], [aria-label*="organization" i]');
    companyName = ariaCompany?.getAttribute('aria-label')?.trim() || '';
  }

  // Location: look for aria-label or text near company
  const locationEl = panel.querySelector('[aria-label*="location" i]');
  let jobLocation = locationEl?.textContent?.trim() || locationEl?.getAttribute('aria-label')?.trim() || undefined;

  // Description: the main content block
  const descEl = panel.querySelector('article, [class*="description"], section > div');
  const jobDescription = descEl?.textContent?.trim().slice(0, 8000) || undefined;

  // Salary text
  const salaryEl = panel.querySelector('[aria-label*="salary" i], [aria-label*="compensation" i]');
  const salaryText = salaryEl?.textContent?.trim() || salaryEl?.getAttribute('aria-label')?.trim();
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

  if (!companyName && !jobTitle) return null;

  const domain = companyName
    ? `${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`
    : undefined;

  return {
    sourceUrl: url,
    companyName: companyName || '',
    companyDomain: domain,
    jobTitle: jobTitle || '',
    jobDescription,
    jobLocation,
    salaryMin,
    salaryMax,
    salaryCurrency,
    jobType: undefined,
    keywords: undefined,
  };
}

/** Extract from the text content of the detail panel using positional heuristics */
function extractFromPanel(panel: Element): Extraction | null {
  const url = window.location.href;
  const allText = panel.textContent || '';

  // Split into non-empty lines
  const lines = allText.split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length < 3) return null;

  // ~ Top section ~
  // The first several meaningful lines are typically:
  //   [Job Title]
  //   [Company Name]
  //   [Location]
  //   [Salary / Job Type]
  // But order varies.  Use patterns to classify each line.

  const topN = Math.min(lines.length, 30);
  const topLines = lines.slice(0, topN);

  // Classify lines by their content patterns
  interface Classified {
    line: string;
    kind: 'title' | 'company' | 'location' | 'salary' | 'jobtype' | 'empty' | 'other';
  }

  const classified: Classified[] = topLines.map((line) => {
    const lower = line.toLowerCase();
    if (!line) return { line, kind: 'empty' };
    if (/^\d+ (relations?|ancien)/i.test(line)) return { line, kind: 'other' };
    if (/(publi|promu|vérifiée|soyez|classe|candidat|abonnez|suivez|voir)/i.test(lower)) return { line, kind: 'other' };
    if (/(full.?time|part.?time|contract|temporary|internship|freelance|temps plein|temps partiel|cdi|cdd)/i.test(lower)) return { line, kind: 'jobtype' };
    if (/[\$£€₹¥]\s*\d[\d,]*/.test(line)) return { line, kind: 'salary' };
    if (/^[A-Z][a-zà-ÿ]+(\s|$)/.test(line) && /,/.test(line) && line.length < 60) return { line, kind: 'location' };
    if (/(hybride|remote|à distance|sur site|télétravail|madrid|paris|barcelona|barcelone|espagne|spain|france|europe)/i.test(lower) && line.length < 60) return { line, kind: 'location' };
    if (line.length > 15 && line.length < 120 && !/^(about|job|company|qualifications|skills|responsibilities|requirements)/i.test(lower)) return { line, kind: 'title' };
    if (line.length > 2 && line.length < 50 && /^[A-Z][a-zA-ZÀ-ÿ0-9]/.test(line)) return { line, kind: 'company' };
    return { line, kind: 'other' };
  });

  const titleLines = classified.filter((c) => c.kind === 'title');
  const companyLines = classified.filter((c) => c.kind === 'company');
  const locationLines = classified.filter((c) => c.kind === 'location');
  const salaryLines = classified.filter((c) => c.kind === 'salary');
  const typeLines = classified.filter((c) => c.kind === 'jobtype');

  // Job title: longest title-classified line, preferably the first one
  const jobTitle = titleLines.sort((a, b) => b.line.length - a.line.length)[0]?.line || '';

  // Company name: first company-classified line NOT in the title
  let companyName = '';
  for (const c of companyLines) {
    if (jobTitle && c.line !== jobTitle && !jobTitle.includes(c.line)) {
      companyName = c.line;
      break;
    }
  }
  // Fallback: literally the shortest line among top candidates
  if (!companyName) {
    const candidates = topLines.filter(
      (l) => l !== jobTitle && l.length > 1 && l.length < 40 && /^[A-Z][a-zA-ZÀ-ÿ0-9]/.test(l),
    );
    companyName = candidates.sort((a, b) => a.length - b.length)[0] || '';
  }

  const jobLocation = locationLines[0]?.line;

  // Salary
  let salaryMin: number | undefined;
  let salaryMax: number | undefined;
  let salaryCurrency: string | undefined;
  const salLine = salaryLines[0]?.line;
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

  const jobType = typeLines[0]?.line;

  // --- Description ---
  // Find where the main description starts (after the top metadata lines)
  // Look for headings like "About the job", "Job description", "Company", etc.
  const descMarkers = ['about the job', 'job description', 'description', 'responsibilities', 'qualifications', 'about us', 'the role', 'what you\'ll do'];
  let descStartIdx = -1;
  for (let i = 0; i < Math.min(lines.length, 50); i++) {
    const lower = lines[i].toLowerCase().trim();
    if (descMarkers.some((m) => lower.startsWith(m) || lower === m)) {
      descStartIdx = i;
      break;
    }
  }

  let jobDescription: string | undefined;
  if (descStartIdx >= 0) {
    const descLines = lines.slice(descStartIdx).filter(
      (l) => !/^(voir moins|see less|see how you compare|signaler|report|save|sauvegarder)/i.test(l.trim()),
    );
    jobDescription = descLines.join('\n').slice(0, 8000);
  }

  // --- Keywords / skills ---
  const keywords: string[] = [];
  const kwMarkerIdx = lines.findIndex(
    (l) => /^(skills|qualifications|requirements|competences|compétences)/i.test(l.trim()),
  );
  if (kwMarkerIdx >= 0) {
    for (let i = kwMarkerIdx + 1; i < Math.min(kwMarkerIdx + 25, lines.length); i++) {
      const line = lines[i].trim();
      if (line.length < 60 && line.length > 2 && !line.endsWith('.') && !line.endsWith(':')
          && !/^(voir|see|about|job|company)/i.test(line)) {
        keywords.push(line);
      }
    }
  }

  const domain = companyName
    ? `${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`
    : undefined;

  if (!companyName && !jobTitle) return null;

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

export function extractLinkedIn(): Extraction | null {
  console.log('[CareerOS] extractLinkedIn running on', window.location.href);

  // Strategy 1: JSON-LD
  const ld = extractLdJson();
  if (ld) return ld;

  // Strategy 2: find detail panel and extract from it
  const panel = findDetailPanel();
  if (panel) {
    console.log('[CareerOS] detail panel found, extracting...');

    // First pass: DOM structure extraction (tag-based)
    const domResult = extractFromPanelDOM(panel);
    if (domResult) {
      console.log('[CareerOS] extracted from panel DOM');
      // Merge with text heuristics for missing fields
      if (!domResult.jobLocation || !domResult.jobType || !domResult.salaryMin) {
        const textResult = extractFromPanel(panel);
        if (textResult) {
          domResult.jobLocation ||= textResult.jobLocation;
          domResult.salaryMin ||= textResult.salaryMin;
          domResult.salaryMax ||= textResult.salaryMax;
          domResult.salaryCurrency ||= textResult.salaryCurrency;
          domResult.jobType ||= textResult.jobType;
          domResult.keywords ||= textResult.keywords;
          if (!domResult.jobDescription) domResult.jobDescription = textResult.jobDescription;
          if (!domResult.companyName) domResult.companyName = textResult.companyName;
        }
      }
      return domResult;
    }

    // Second pass: text heuristics
    const textResult = extractFromPanel(panel);
    if (textResult && (textResult.companyName || textResult.jobTitle)) {
      console.log('[CareerOS] extracted from panel text');
      return textResult;
    }
  }

  console.log('[CareerOS] all LinkedIn strategies failed');
  return null;
}
