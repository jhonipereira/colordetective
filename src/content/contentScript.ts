import { detectColorInDOM } from './colorDetector';

console.log('ColorDetective content script loaded');

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'detectColor') {
    const matches = detectColorInDOM(request.color);

    // Remove element references before sending (can't be serialized)
    const serializableMatches = matches.map(({ element, ...rest }) => rest);

    sendResponse({ matches: serializableMatches });
  }

  return true; // Keep the message channel open for async response
});
