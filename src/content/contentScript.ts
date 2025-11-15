import { detectColorInDOM, highlightElement, removeAllHighlights } from './colorDetector';
import { AggregatedColorMatch } from '../utils/types';

console.log('ColorDetective content script loaded');

let matchedElements: Map<number, HTMLElement> = new Map();

function aggregateMatches(matches: ReturnType<typeof detectColorInDOM>): AggregatedColorMatch[] {
  const elementMap = new Map<HTMLElement, AggregatedColorMatch>();

  matches.forEach((match) => {
    if (!match.element) return;

    if (elementMap.has(match.element)) {
      const existing = elementMap.get(match.element)!;
      existing.properties.push({
        property: match.colorProperty,
        value: match.colorValue,
      });
    } else {
      elementMap.set(match.element, {
        selector: match.selector,
        tagName: match.tagName,
        properties: [{ property: match.colorProperty, value: match.colorValue }],
        element: match.element,
      });
    }
  });

  return Array.from(elementMap.values());
}

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'detectColor') {
    const matches = detectColorInDOM(request.color);
    const aggregated = aggregateMatches(matches);

    matchedElements.clear();
    aggregated.forEach((match, index) => {
      if (match.element) {
        matchedElements.set(index, match.element);
      }
    });

    const serializableMatches = aggregated.map(({ element, ...rest }) => rest);
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
