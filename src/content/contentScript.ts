import { detectColorInDOM, highlightElement, removeAllHighlights } from './colorDetector';

console.log('ColorDetective content script loaded');

let matchedElements: Map<number, HTMLElement> = new Map();

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'detectColor') {
    const matches = detectColorInDOM(request.color);

    matchedElements.clear();
    matches.forEach((match, index) => {
      if (match.element) {
        matchedElements.set(index, match.element);
      }
    });

    const serializableMatches = matches.map(({ element, ...rest }) => rest);
    sendResponse({ matches: serializableMatches });
  }

  if (request.action === 'highlightElement') {
    const element = matchedElements.get(request.index);
    if (element) {
      highlightElement(element, request.temporary || false);

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

  return true;
});
