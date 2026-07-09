const API = 'http://localhost:4000';

chrome.runtime.onInstalled.addListener(() => {
  console.log('CareerOS extension installed');
});

chrome.action.onClicked.addListener((tab) => {
  if (tab.id) {
    chrome.tabs.sendMessage(tab.id, { type: 'CAREEROS_EXTRACT' });
  }
});

chrome.runtime.onMessage.addListener(
  (message: { type: string; data?: Record<string, unknown> }, _sender, sendResponse) => {
    if (message.type === 'CAREEROS_SAVE' && message.data) {
      fetch(`${API}/applications/import`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message.data),
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
