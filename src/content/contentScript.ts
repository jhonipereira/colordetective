import { detectColorInDOM, highlightElement, removeAllHighlights } from './colorDetector';

console.log('ColorDetective content script loaded');

// Store matched elements with their indices for highlighting
let matchedElements: Map<number, HTMLElement> = new Map();

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'detectColor') {
    const matches = detectColorInDOM(request.color);

    // Store elements with their index
    matchedElements.clear();
    matches.forEach((match, index) => {
      if (match.element) {
        matchedElements.set(index, match.element);
      }
    });

    // Remove element references before sending (can't be serialized)
    const serializableMatches = matches.map(({ element, ...rest }) => rest);

    sendResponse({ matches: serializableMatches });
  }

  if (request.action === 'highlightElement') {
    const element = matchedElements.get(request.index);
    if (element) {
      highlightElement(element, request.temporary || false);

      // Scroll element into view
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center'
      });
    }
    sendResponse({ success: true });
  }

  if (request.action === 'removeHighlight') {
    removeAllHighlights();
    sendResponse({ success: true });
  }

  return true; // Keep the message channel open for async response
});
