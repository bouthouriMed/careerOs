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

export function extractGreenhouse(): Extraction | null {
  const url = window.location.href;

  const companyName =
    document.querySelector('[data-source="company-name"]')?.textContent?.trim() ||
    document.querySelector('.company-name')?.textContent?.trim() ||
    document.querySelector('.logo')?.getAttribute('alt') ||
    '';

  const titleEl = document.querySelector('.app-title') || document.querySelector('h1');
  const jobTitle = titleEl?.textContent?.trim() || '';

  const locationEl = document.querySelector('.location') || document.querySelector('[data-source="location"]');
  const jobLocation = locationEl?.textContent?.trim() || undefined;

  const descEl = document.querySelector('#content') || document.querySelector('.job-description');
  const jobDescription = descEl?.textContent?.trim() || undefined;

  const salaryEl = document.querySelector('.salary-range') || document.querySelector('[data-source="salary"]');
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

  const commitmentEl = document.querySelector('.commitment') || document.querySelector('[data-source="commitment"]');
  const jobType = commitmentEl?.textContent?.trim() || undefined;

  const keywords: string[] = [];
  document.querySelectorAll('.job-description li, .job-description strong').forEach((el) => {
    const text = el.textContent?.trim();
    if (text && text.length < 50 && !text.endsWith('.') && !text.endsWith(':')) {
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
