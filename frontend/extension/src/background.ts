const API = 'http://localhost:4000';

async function getSessionCookie(): Promise<string | null> {
  try {
    const cookie = await chrome.cookies.get({ url: API, name: 'session' });
    return cookie?.value ?? null;
  } catch {
    return null;
  }
}

chrome.runtime.onInstalled.addListener(() => {
  console.log('CareerOS extension installed');
});

chrome.action.onClicked.addListener((tab) => {
  if (tab.id) {
    chrome.tabs.sendMessage(tab.id, { type: 'CAREEROS_EXTRACT' });
  }
});

const ALLOWED_FIELDS = new Set([
  'sourceUrl', 'companyName', 'companyDomain', 'companyDescription',
  'jobTitle', 'jobDescription', 'jobLocation',
  'salaryMin', 'salaryMax', 'salaryCurrency', 'jobType',
  'keywords', 'applicationDeadline', 'source',
]);

chrome.runtime.onMessage.addListener(
  (message: { type: string; data?: Record<string, unknown> }, _sender, sendResponse) => {
    if (message.type === 'CAREEROS_SAVE' && message.data) {
      const payload: Record<string, unknown> = {};
      for (const key of ALLOWED_FIELDS) {
        if (key in message.data) payload[key] = message.data[key];
      }
      if (!payload.source) payload.source = 'browser_extension';

      getSessionCookie().then((sessionId) => {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (sessionId) headers.Cookie = `session=${sessionId}`;

        return fetch(`${API}/applications/import`, {
          method: 'POST',
          credentials: 'include',
          headers,
          body: JSON.stringify(payload),
        });
      })
        .then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.json();
        })
        .then((result) => sendResponse({ ok: true, result }))
        .catch((err) => sendResponse({ ok: false, error: err.message }));
      return true;
    }

    if (message.type === 'CAREEROS_OPEN_DASHBOARD') {
      chrome.tabs.create({ url: 'http://localhost:3000/dashboard' });
    }
  },
);
