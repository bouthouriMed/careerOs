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

/** Lines that are LinkedIn UI chrome, not job data */
const NOISE = [
  /^\d+$/, /^\d+ notification/, /^accueil$/i, /^mon réseau$/i,
  /^emplois$/i, /^messagerie$/i, /^notifications$/i, /^vous$/i,
  /^pour les entreprises/i, /^réactivez/i, /^passer au/i,
  /^les dernières/i, /^niveau d'expérience/i, /^type d'emploi$/i,
  /^entreprise$/i, /^moins de \d+/i, /^dans mon réseau/i,
  /^la recherche par l'ia/i, /^résultats$/i, /^\d+ résultats/i,
  /^comment sont classées/i, /^à distance$/i, /^candidature simplifiée/i,
  /^ui$/i, /^ux$/i, /^saas$/i, /^fintech$/i, /^espagne$/i,
  /^publi/i, /^promu/i, /^vérifiée/i, /^soyez/i, /^sauvegarder/i,
  /^signaler/i, /^partager/i, /^voir/i, /^masquer/i, /^suivant/i,
  /^précédent/i, /^charger/i,
];

function isNoise(l: string): boolean {
  return NOISE.some((p) => p.test(l.trim()));
}

/** Extract from JSON-LD */
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

        const r: Extraction = {
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
        if (r.companyName && r.jobTitle) return r;
      }
    } catch { /* skip */ }
  }
  return null;
}

/** Extract from page text using simple positional heuristics */
function extractFromText(): Extraction | null {
  const lines = document.body.innerText
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  // Remove noise lines
  const clean = lines.filter((l) => !isNoise(l) && l.length > 1);

  if (clean.length < 3) return null;

  // Find the first line that looks like a job title.
  // A job title is typically long (>15 chars), contains letters and
  // punctuation like / - , and starts with a capital letter.
  const titleIdx = clean.findIndex((l) => {
    if (l.length < 15) return false;
    if (/^[a-z]/.test(l)) return false;  // starts with lowercase = not a title
    if (/^\d/.test(l)) return false;
    if (l.includes('résultat') || l.includes('offre d\'emploi promu')) return false;
    return true;
  });

  if (titleIdx < 0) return null;
  let jobTitle = clean[titleIdx];

  // Strip badge suffixes like "(offre d'emploi vérifiée)", "(Verified)", etc.
  jobTitle = jobTitle.replace(/\s*\([^)]*(vérifié|verified)[^)]*\)\s*/gi, '').trim();

  // Company: first short line (2-40 chars) after the title
  let companyName = '';
  let companyIdx = -1;
  for (let i = titleIdx + 1; i < clean.length; i++) {
    const l = clean[i];
    if (l === jobTitle) continue; // skip duplicate title
    if (l.length > 2 && l.length < 50 && /^[A-ZÀ-Œ]/.test(l)) {
      companyName = l;
      companyIdx = i;
      break;
    }
  }

  // Location: first line near company that looks like a place
  let jobLocation: string | undefined;
  const searchFrom = companyIdx > 0 ? companyIdx + 1 : titleIdx + 2;
  for (let i = searchFrom; i < Math.min(searchFrom + 5, clean.length); i++) {
    const l = clean[i];
    if (l === jobTitle || l === companyName) continue;
    // Location patterns: has comma, or contains known place words/patterns
    if (
      (l.includes(',') || l.includes('(') || l.includes('Hybride') || l.includes('Remote') ||
       l.includes('À distance') || l.includes('Madrid') || l.includes('Paris') || l.includes('Barcelona') ||
       l.includes('London') || l.includes('Berlin') || l.includes('New York') || l.includes('San Francisco') ||
       /^[A-Z][a-z]+(\s|,|$)/.test(l)) &&
      l.length < 60
    ) {
      jobLocation = l;
      break;
    }
  }

  // Salary: find anywhere near title/company
  let salaryMin: number | undefined;
  let salaryMax: number | undefined;
  let salaryCurrency: string | undefined;
  const nearLines = clean.slice(Math.max(0, titleIdx - 2), titleIdx + 10);
  const salaryLine = nearLines.find((l) => /[$£€₹¥]\s*\d[\d,]*/.test(l));
  if (salaryLine) {
    const nums = salaryLine.match(/\d[\d,]*/g);
    const curr = salaryLine.match(/([A-Z]{3}|[$£€₹¥])/);
    salaryCurrency = curr?.[1];
    if (nums) {
      const parsed = nums.map((n) => parseInt(n.replace(/,/g, ''), 10));
      salaryMin = parsed[0];
      if (parsed.length >= 2) salaryMax = parsed[parsed.length - 1];
    }
  }

  // Job type
  const typeLine = nearLines.find((l) =>
    /(full.?time|part.?time|contract|temporary|internship|freelance|cdi|cdd|temps plein|temps partiel)/i.test(l),
  );
  const jobType = typeLine || undefined;

  // Description: find "About the job" or equivalent in the full text
  const allLines = lines; // use unfiltered lines for description
  const descMarkers = [
    'about the job', 'job description', 'description',
    'à propos de l\'offre', 'description du poste',
    'the role', 'what you\'ll do', 'who you are', 'about you',
  ];
  let descStart = -1;
  for (let i = 0; i < allLines.length; i++) {
    const lower = allLines[i].toLowerCase().trim();
    if (descMarkers.some((m) => lower.startsWith(m))) {
      descStart = i;
      break;
    }
  }
  const jobDescription = descStart >= 0
    ? allLines.slice(descStart).join('\n').slice(0, 8000)
    : undefined;

  // Keywords: look for "Skills" or "Qualifications" section
  const keywords: string[] = [];
  const kwStart = allLines.findIndex((l) =>
    /^(skills|qualifications|compétences|requis)/i.test(l.trim()),
  );
  if (kwStart >= 0) {
    for (let i = kwStart + 1; i < Math.min(kwStart + 25, allLines.length); i++) {
      const l = allLines[i].trim();
      if (l.length < 60 && l.length > 2 && !l.endsWith('.') && !l.endsWith(':')) {
        keywords.push(l);
      }
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

  // 1. JSON-LD
  const ld = extractLdJson();
  if (ld) {
    console.log('[CareerOS] success: JSON-LD');
    return ld;
  }

  // 2. Text heuristics
  const text = extractFromText();
  if (text) {
    console.log('[CareerOS] success: text heuristic');
    return text;
  }

  console.log('[CareerOS] all strategies failed');
  return null;
}
