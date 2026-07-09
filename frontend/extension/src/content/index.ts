import { extractLinkedIn } from './extractors/linkedin';
import { extractIndeed } from './extractors/indeed';
import { extractGreenhouse } from './extractors/greenhouse';
import { extractLever } from './extractors/lever';
import { extractGeneric } from './extractors/generic';

function getExtractors() {
  const hostname = window.location.hostname.toLowerCase();

  if (hostname.includes('linkedin')) return [extractLinkedIn, extractGeneric];
  if (hostname.includes('indeed')) return [extractIndeed, extractGeneric];
  if (hostname.includes('greenhouse')) return [extractGreenhouse, extractGeneric];
  if (hostname.includes('lever')) return [extractLever, extractGeneric];

  return [extractGeneric];
}

function tryExtract() {
  const extractors = getExtractors();
  for (const extractor of extractors) {
    try {
      const data = extractor();
      if (data && data.companyName && data.jobTitle) {
        console.log('[CareerOS] extracted via', extractor.name, ':', data.jobTitle, '@', data.companyName);
        return data;
      }
      if (data) {
        console.log('[CareerOS] partial extraction from', extractor.name, ':', data);
      }
    } catch (e) {
      console.warn('[CareerOS] extractor', extractor.name, 'error:', e);
    }
  }
  return null;
}

// Auto-run on page load
const autoResult = tryExtract();
if (autoResult) {
  console.log('[CareerOS] extracted on page load:', autoResult.jobTitle, '@', autoResult.companyName);
}

chrome.runtime.onMessage.addListener(
  (message: { type: string }, _sender: chrome.runtime.MessageSender, sendResponse: (data: unknown) => void) => {
    if (message.type === 'CAREEROS_EXTRACT') {
      const data = tryExtract();
      sendResponse(data);
    }
    return true;
  },
);

console.log('[CareerOS] content script loaded');
