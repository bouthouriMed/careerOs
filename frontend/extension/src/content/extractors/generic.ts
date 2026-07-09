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

export function extractGeneric(): Extraction | null {
  const url = window.location.href;

  const ldJson = document.querySelector('script[type="application/ld+json"]');
  let structured: Record<string, unknown> | null = null;
  if (ldJson?.textContent) {
    try {
      const parsed = JSON.parse(ldJson.textContent);
      if (Array.isArray(parsed)) {
        structured = parsed.find(
          (item: Record<string, unknown>) =>
            item['@type'] === 'JobPosting' || item['@type'] === 'JobPosting',
        ) || parsed[0];
      } else {
        structured = parsed;
      }
    } catch {
      // invalid JSON-LD
    }
  }

  const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content');
  const ogDesc = document.querySelector('meta[property="og:description"]')?.getAttribute('content');
  const ogSiteName = document.querySelector('meta[property="og:site_name"]')?.getAttribute('content');

  function getStructured(key: string): string | undefined {
    if (!structured) return undefined;
    const val = structured[key];
    if (typeof val === 'string') return val;
    if (typeof val === 'object' && val !== null) {
      return (val as Record<string, unknown>).name as string;
    }
    return undefined;
  }

  const jobTitle =
    getStructured('title') ||
    document.querySelector('h1')?.textContent?.trim() ||
    ogTitle ||
    '';

  const companyName =
    getStructured('hiringOrganization') ||
    ogSiteName ||
    document.querySelector('[class*="company"]')?.textContent?.trim() ||
    document.querySelector('[class*="employer"]')?.textContent?.trim() ||
    '';

  const jobDescription =
    getStructured('description') ||
    ogDesc ||
    document.querySelector('[class*="description"], [class*="content"], [class*="job-details"]')?.textContent?.trim() ||
    undefined;

  const jobLocation =
    getStructured('jobLocation') ||
    document.querySelector('[class*="location"]')?.textContent?.trim() ||
    document.querySelector('[class*="place"]')?.textContent?.trim() ||
    undefined;

  const salaryText = getStructured('baseSalary');
  let salaryMin: number | undefined;
  let salaryMax: number | undefined;
  let salaryCurrency: string | undefined;
  if (salaryText) {
    const nums = salaryText.match(/\d[\d,]*/g);
    const currMatch = salaryText.match(/([A-Z]{3}|[$£€₹¥])/);
    if (currMatch) salaryCurrency = currMatch[1];
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

  const employmentType = getStructured('employmentType') || getStructured('employmentType');
  const jobType = employmentType || undefined;

  const keywords: string[] = [];
  const kwStr = getStructured('skills') || getStructured('qualifications');
  if (kwStr) {
    kwStr.split(',').forEach((s: string) => {
      const t = s.trim();
      if (t) keywords.push(t);
    });
  }

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
