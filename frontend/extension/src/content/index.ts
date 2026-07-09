import { extractLinkedIn } from './extractors/linkedin';
import { extractIndeed } from './extractors/indeed';
import { extractGreenhouse } from './extractors/greenhouse';
import { extractLever } from './extractors/lever';
import { extractGeneric } from './extractors/generic';
import { LinkedInWidget } from './linkedin-widget';

type ExtractorFn = () => ReturnType<typeof extractGeneric>;

function getExtractors(): ExtractorFn[] {
  const hostname = window.location.hostname.toLowerCase();
  if (hostname.includes('linkedin')) return [extractLinkedIn as unknown as ExtractorFn, extractGeneric];
  if (hostname.includes('indeed')) return [extractIndeed, extractGeneric];
  if (hostname.includes('greenhouse')) return [extractGreenhouse, extractGeneric];
  if (hostname.includes('lever')) return [extractLever, extractGeneric];
  return [extractGeneric];
}

async function tryExtractAsync() {
  const extractors = getExtractors();
  for (const extractor of extractors) {
    try {
      const data = await Promise.resolve(extractor());
      if (data && data.companyName && data.jobTitle) {
        console.log('[CareerOS] extracted via', extractor.name, ':', data.jobTitle, '@', data.companyName);
        return data;
      }
    } catch (e) {
      console.warn('[CareerOS] extractor', extractor.name, 'error:', e);
    }
  }
  return null;
}

// Auto-run on page load (best-effort, not awaited)
tryExtractAsync().then((data) => {
  if (data) console.log('[CareerOS] extracted on page load:', data.jobTitle, '@', data.companyName);
});

chrome.runtime.onMessage.addListener(
  (message: { type: string }, _sender: chrome.runtime.MessageSender, sendResponse: (data: unknown) => void) => {
    if (message.type === 'CAREEROS_EXTRACT') {
      tryExtractAsync().then((data) => {
        console.log('[CareerOS] sending response:', data ? `${data.jobTitle} @ ${data.companyName}` : 'null');
        sendResponse(data);
      });
    }
    return true;
  },
);

// Inject LinkedIn floating widget on job search pages
if (window.location.hostname.includes('linkedin') && window.location.pathname.includes('/jobs/search')) {
  const widget = new LinkedInWidget();
  console.log('[CareerOS] LinkedIn widget injected');
}

console.log('[CareerOS] content script loaded');
