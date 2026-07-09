chrome.runtime.onInstalled.addListener(() => {
  console.log('CareerOS extension installed');
});

chrome.action.onClicked.addListener((tab) => {
  if (tab.id) {
    chrome.tabs.sendMessage(tab.id, { type: 'CAREEROS_EXTRACT' });
  }
});
