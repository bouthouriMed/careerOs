const API_BASE = 'http://localhost:4000';

async function getSessionCookie(): Promise<string | null> {
  try {
    const cookie = await chrome.cookies.get({
      url: API_BASE,
      name: 'session',
    });
    return cookie?.value ?? null;
  } catch {
    return null;
  }
}

function buildCookieHeader(value: string): Record<string, string> {
  return { Cookie: `session=${value}` };
}

export interface ImportPayload {
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
  applicationDeadline?: string;
  source: 'browser_extension';
}

const IMPORT_ALLOWED = new Set([
  'sourceUrl', 'companyName', 'companyDomain', 'companyDescription',
  'jobTitle', 'jobDescription', 'jobLocation',
  'salaryMin', 'salaryMax', 'salaryCurrency', 'jobType',
  'keywords', 'applicationDeadline', 'source',
]);

export async function importApplication(
  payload: Record<string, unknown>,
): Promise<{ id: string }> {
  const body: Record<string, unknown> = {};
  for (const key of IMPORT_ALLOWED) {
    if (key in payload) body[key] = payload[key];
  }
  if (!body.source) body.source = 'browser_extension';

  const sessionId = await getSessionCookie();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (sessionId) Object.assign(headers, buildCookieHeader(sessionId));

  const res = await fetch(`${API_BASE}/applications/import`, {
    method: 'POST',
    credentials: 'include',
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to import: ${res.status} — ${text}`);
  }

  return res.json();
}

export async function checkAuth(): Promise<{ user: { id: string; name: string | null; email: string } } | null> {
  try {
    const sessionId = await getSessionCookie();
    const headers: Record<string, string> = {};
    if (sessionId) Object.assign(headers, buildCookieHeader(sessionId));

    const res = await fetch(`${API_BASE}/auth/me`, {
      credentials: 'include',
      headers,
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
