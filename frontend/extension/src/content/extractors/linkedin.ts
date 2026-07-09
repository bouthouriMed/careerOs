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

/** Fetch from LinkedIn's internal Voyager API (same-origin) */
async function extractViaAPI(): Promise<Extraction | null> {
  const jobId = getJobId();
  if (!jobId) return null;

  try {
    const res = await fetch(
      `https://www.linkedin.com/voyager/api/jobs/jobPostings/${jobId}`,
      {
        headers: {
          accept: 'application/vnd.linkedin.normalized+json+2.1',
        },
        credentials: 'include',
      },
    );
    if (!res.ok) return null;

    const data = await res.json();
    const included: Record<string, unknown>[] = data?.included || [];

    // Find the job posting object
    const job = included.find(
      (i: Record<string, unknown>) =>
        typeof i.$type === 'string' && i.$type.includes('JobPosting'),
    ) as Record<string, unknown> | undefined;
    if (!job) return null;

    // Company
    const companyData = included.find(
      (i: Record<string, unknown>) =>
        typeof i.$type === 'string' && i.$type.includes('Company'),
    ) as Record<string, unknown> | undefined;
    const companyName =
      (companyData?.name as string) ||
      (companyData?.companyName as string) ||
      ((job?.companyDetails as Record<string, unknown>)?.company as Record<string, unknown>)?.name as string ||
      '';

    // Title
    const titleData = included.find(
      (i: Record<string, unknown>) =>
        typeof i.$type === 'string' && i.$type.includes('JobPostingTitle'),
    ) as Record<string, unknown> | undefined;
    const jobTitle =
      (titleData?.text as string) ||
      (job?.title as string) ||
      '';

    // Location
    const locData = included.find(
      (i: Record<string, unknown>) =>
        typeof i.$type === 'string' && i.$type.includes('JobPostingLocation'),
    ) as Record<string, unknown> | undefined;
    const jobLocation =
      (locData?.text as string) ||
      (locData?.locationName as string) ||
      (job?.formattedLocation as string) ||
      undefined;

    // Description
    const desc = (job?.description as Record<string, unknown>)?.text as string ||
      (job?.description as string) ||
      '';

    // Salary
    const salary = job?.salary as Record<string, unknown> | undefined;
    let salaryMin: number | undefined;
    let salaryMax: number | undefined;
    let salaryCurrency: string | undefined;
    if (salary) {
      const minVal = salary.minValue as Record<string, unknown> | undefined;
      salaryMin = (minVal?.amount as number) || (salary.minAmount as number);
      salaryMax = ((salary.maxValue as Record<string, unknown>)?.amount as number) || (salary.maxAmount as number);
      salaryCurrency = (salary.currency as string) || (minVal?.currency as string);
    }

    // Job type
    const jobType = (job?.employmentType as string) ||
      ((job?.workplaceTypes as string[])?.[0]) ||
      undefined;

    // Skills
    const skills: string[] = [];
    const rawSkills = job?.skills as Record<string, unknown>[] | undefined;
    if (rawSkills) {
      for (const s of rawSkills) {
        const name = (s.name as string) || (s.text as string);
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
      jobLocation,
      salaryMin,
      salaryMax,
      salaryCurrency,
      jobType,
      keywords: skills.length > 0 ? skills.slice(0, 20) : undefined,
    };
  } catch {
    return null;
  }
}

/** JSON-LD fallback */
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
          companyDomain: companyName ? `${String(companyName).toLowerCase().replace(/[^a-z0-9]/g, '')}.com` : undefined,
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

const LABELS = new Set([
  'accueil', 'mon réseau', 'emplois', 'messagerie', 'notifications', 'vous',
  'pour les entreprises', 'niveau d\'expérience', 'type d\'emploi', 'entreprise',
  'lieu', 'localisation', 'moins de 10 candidats', 'dans mon réseau',
  'candidature simplifiée', 'la recherche par l\'ia est en phase bêta',
  'à propos de l\'offre d\'emploi', 'à propos de l\'offre',
  'comment sont classées les offres d\'emploi promues',
  'personnes que vous pouvez contacter', 'rencontrez l\'équipe de recrutement',
  'auteur de l\'offre d\'emploi', 'envoyer un message',
  'enregistrer', 'sauvegarder', 'signaler', 'partager', 'suivant', 'précédent',
  'ui', 'ux', 'saas', 'fintech', 'espagne',
  'réactivez premium', 'réactivez premium : - 50%',
  'passez au contenu principal', 'passer au contenu principal',
  'les dernières 24 heures', 'les dernières 24h',
  'à distance', 'modalidad', 'tareas a realizar',
  'compétences', 'qualifications', 'responsabilités',
  'salaire', 'il y a', 'publié', 'promu', 'vérifiée', 'soyez',
  'masquer', 'voir', 'charger',
]);

function isNoise(l: string): boolean {
  const t = l.trim().toLowerCase();
  if (/^\d+$/.test(t) || /^\d+ notification/.test(t)) return true;
  if (LABELS.has(t) || [...LABELS].some((label) => t.startsWith(label))) return true;
  return false;
}

/** Text heuristic fallback */
function extractFromText(): Extraction | null {
  const lines = document.body.innerText.split('\n').map((l) => l.trim());
  const descMarkers = [
    'about the job', 'job description',
    'à propos de l\'offre', 'description du poste',
    'the role', 'what you\'ll do', 'who you are', 'about you',
  ];

  let descStart = -1;
  for (let i = 0; i < lines.length; i++) {
    const lower = lines[i].toLowerCase().trim();
    if (descMarkers.some((m) => lower.startsWith(m))) { descStart = i; break; }
  }

  const searchEnd = descStart > 0 ? descStart : Math.min(lines.length, 80);
  const searchStart = Math.max(0, searchEnd - 60);
  const region = lines.slice(searchStart, searchEnd).filter((l) => l.length > 1);
  const clean = region.filter((l) => !isNoise(l));

  let jobTitle = '';
  let titleIdx = -1;
  for (let i = clean.length - 1; i >= 0; i--) {
    const l = clean[i];
    if (l.length < 20 || /^[a-z]/.test(l)) continue;
    if (l.includes('/') || l.includes(' - ') || l.includes(' | ')) {
      jobTitle = l; titleIdx = i; break;
    }
  }
  if (!jobTitle && clean.length > 0) {
    const sorted = [...clean].sort((a, b) => b.length - a.length);
    jobTitle = sorted[0];
    titleIdx = clean.indexOf(jobTitle);
  }

  jobTitle = jobTitle.replace(/\s*\([^)]*(vérifié|verified)[^)]*\)\s*/gi, '').trim();

  let companyName = '';
  for (let i = titleIdx + 1; i < Math.min(titleIdx + 8, clean.length); i++) {
    const l = clean[i];
    if (l === jobTitle || isNoise(l)) continue;
    if (l.length > 2 && l.length < 45 && /^[A-ZÀ-Œ]/.test(l)) { companyName = l; break; }
  }
  if (!companyName) {
    for (let i = titleIdx - 1; i >= Math.max(0, titleIdx - 5); i--) {
      const l = clean[i];
      if (l === jobTitle || isNoise(l)) continue;
      if (l.length > 2 && l.length < 45 && /^[A-ZÀ-Œ]/.test(l)) { companyName = l; break; }
    }
  }

  let jobLocation: string | undefined;
  const nearLines = clean.slice(Math.max(0, titleIdx - 3), titleIdx + 8);
  for (const l of nearLines) {
    if (l === jobTitle || l === companyName) continue;
    if (l.length > 2 && l.length < 60 &&
        (l.includes(',') || l.includes('(') || l.includes('Hybride') || l.includes('Remote') ||
         l.includes('À distance') || /(madrid|paris|barcelona|london|berlin|new york|san francisco|spain|france|germany|uk|usa)/i.test(l))) {
      jobLocation = l; break;
    }
  }

  const moreLines = lines.slice(Math.max(0, titleIdx - 5), titleIdx + 15);
  let salaryMin: number | undefined, salaryMax: number | undefined, salaryCurrency: string | undefined;
  const salaryLine = moreLines.find((l) => /[$£€₹¥]\s*\d[\d,]*/.test(l));
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

  const typeLine = moreLines.find((l) =>
    /(full.?time|part.?time|contract|temporary|internship|freelance|cdi|cdd|temps plein|temps partiel)/i.test(l));

  const jobDescription = descStart >= 0
    ? lines.slice(descStart).join('\n').slice(0, 8000)
    : undefined;

  const keywords: string[] = [];
  const kwStart = lines.findIndex((l) => /^(skills|qualifications|compétences|requis)/i.test(l.trim()));
  if (kwStart >= 0) {
    for (let i = kwStart + 1; i < Math.min(kwStart + 25, lines.length); i++) {
      const l = lines[i].trim();
      if (l.length < 60 && l.length > 2 && !l.endsWith('.') && !l.endsWith(':') && !/^(voir|see|about|job|company)/i.test(l)) {
        keywords.push(l);
      }
    }
  }

  if (!companyName && !jobTitle) return null;
  return {
    sourceUrl: window.location.href,
    companyName: companyName || '',
    companyDomain: companyName ? `${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com` : undefined,
    jobTitle: jobTitle || '',
    jobDescription,
    jobLocation,
    salaryMin, salaryMax, salaryCurrency,
    jobType: typeLine || undefined,
    keywords: keywords.length > 0 ? [...new Set(keywords)].slice(0, 20) : undefined,
  };
}

export async function extractLinkedIn(): Promise<Extraction | null> {
  console.log('[CareerOS] extractLinkedIn running on', window.location.href);

  try {
    const api = await extractViaAPI();
    if (api) {
      console.log('[CareerOS] success: Voyager API');
      return api;
    }
  } catch { /* API failed, fall through */ }

  const ld = extractLdJson();
  if (ld) { console.log('[CareerOS] success: JSON-LD'); return ld; }

  const text = extractFromText();
  if (text) { console.log('[CareerOS] success: text heuristic'); return text; }

  console.log('[CareerOS] all strategies failed');
  return null;
}
