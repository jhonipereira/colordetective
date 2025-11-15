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

function buildHierarchy(aggregated: AggregatedColorMatch[]): AggregatedColorMatch[] {
  const result: AggregatedColorMatch[] = [];
  const processed = new Set<AggregatedColorMatch>();

  aggregated.sort((a, b) => {
    if (!a.element || !b.element) return 0;
    if (a.element.contains(b.element)) return -1;
    if (b.element.contains(a.element)) return 1;
    return 0;
  });

  for (const match of aggregated) {
    if (processed.has(match)) continue;

    let parent: AggregatedColorMatch | null = null;
    for (const potentialParent of aggregated) {
      if (potentialParent === match) continue;
      if (potentialParent.element && match.element &&
          potentialParent.element.contains(match.element)) {
        if (!parent || (parent.element && potentialParent.element.contains(parent.element))) {
          parent = potentialParent;
        }
      }
    }

    if (!parent) {
      match.depth = 0;
      result.push(match);
      processed.add(match);
    }
  }

  const addChildren = (parent: AggregatedColorMatch, depth: number) => {
    parent.children = [];
    for (const match of aggregated) {
      if (processed.has(match)) continue;
      if (!match.element || !parent.element) continue;

      if (parent.element.contains(match.element)) {
        let isDirectChild = true;
        for (const other of aggregated) {
          if (other === parent || other === match || processed.has(other)) continue;
          if (other.element && parent.element.contains(other.element) &&
              other.element.contains(match.element)) {
            isDirectChild = false;
            break;
          }
        }

        if (isDirectChild) {
          match.depth = depth;
          parent.children.push(match);
          processed.add(match);
        }
      }
    }

    for (const child of parent.children) {
      addChildren(child, depth + 1);
    }
  };

  for (const root of result) {
    addChildren(root, 1);
  }

  return result;
}

function flattenHierarchy(items: AggregatedColorMatch[], result: AggregatedColorMatch[] = []): AggregatedColorMatch[] {
  for (const item of items) {
    result.push(item);
    if (item.children && item.children.length > 0) {
      flattenHierarchy(item.children, result);
    }
  }
  return result;
}

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'detectColor') {
    const matches = detectColorInDOM(request.color, request.showFullPath || false);
    let aggregated = aggregateMatches(matches);
    let finalMatches: AggregatedColorMatch[];

    if (request.showNestedElements) {
      const hierarchy = buildHierarchy(aggregated);
      finalMatches = flattenHierarchy(hierarchy);
    } else {
      finalMatches = aggregated.map(m => ({ ...m, depth: 0 }));
    }

    matchedElements.clear();
    finalMatches.forEach((match, index) => {
      if (match.element) {
        matchedElements.set(index, match.element);
      }
    });

    const serializableMatches = finalMatches.map(({ element, children, ...rest }) => rest);
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
