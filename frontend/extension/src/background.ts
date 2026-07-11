const API = 'http://localhost:4000';

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
      fetch(`${API}/applications/import`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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
