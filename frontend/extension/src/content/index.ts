import { extractLinkedIn } from './extractors/linkedin';
import { extractIndeed } from './extractors/indeed';
import { extractGreenhouse } from './extractors/greenhouse';
import { extractLever } from './extractors/lever';
import { extractGeneric } from './extractors/generic';

function getExtractor() {
  const hostname = window.location.hostname.toLowerCase();

  if (hostname.includes('linkedin')) return extractLinkedIn;
  if (hostname.includes('indeed')) return extractIndeed;
  if (hostname.includes('greenhouse')) return extractGreenhouse;
  if (hostname.includes('lever')) return extractLever;

  return extractGeneric;
}

chrome.runtime.onMessage.addListener(
  (message: { type: string }, _sender: chrome.runtime.MessageSender, sendResponse: (data: unknown) => void) => {
    if (message.type === 'CAREEROS_EXTRACT') {
      const extractor = getExtractor();
      const data = extractor();
      sendResponse(data);
    }
    return true;
  },
);
