import { detectColorInDOM, highlightElement, highlightPseudoElement, removeAllHighlights } from './colorDetector';
import { AggregatedColorMatch } from '../utils/types';

console.log('ColorDetective content script loaded');

let matchedElements: Map<number, HTMLElement> = new Map();
let matchedPseudoElements: Map<number, '::before' | '::after'> = new Map();

function aggregateMatches(matches: ReturnType<typeof detectColorInDOM>): (AggregatedColorMatch & { pseudoElement?: '::before' | '::after' })[] {
  // Use element + pseudo-element as composite key
  const matchMap = new Map<HTMLElement, Map<string, AggregatedColorMatch & { pseudoElement?: '::before' | '::after' }>>();

  matches.forEach((match) => {
    if (!match.element) return;

    const pseudoKey = match.pseudoElement || '';

    if (!matchMap.has(match.element)) {
      matchMap.set(match.element, new Map());
    }

    const elementMap = matchMap.get(match.element)!;

    if (elementMap.has(pseudoKey)) {
      const existing = elementMap.get(pseudoKey)!;
      existing.properties.push({
        property: match.colorProperty,
        value: match.colorValue,
      });
    } else {
      elementMap.set(pseudoKey, {
        selector: match.selector,
        tagName: match.tagName,
        properties: [{ property: match.colorProperty, value: match.colorValue }],
        element: match.element,
        pseudoElement: match.pseudoElement,
      });
    }
  });

  // Flatten the nested maps
  const result: (AggregatedColorMatch & { pseudoElement?: '::before' | '::after' })[] = [];
  for (const elementMap of matchMap.values()) {
    for (const match of elementMap.values()) {
      result.push(match);
    }
  }

  return result;
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
    let finalMatches: (AggregatedColorMatch & { pseudoElement?: '::before' | '::after' })[];

    if (request.showNestedElements) {
      const hierarchy = buildHierarchy(aggregated);
      finalMatches = flattenHierarchy(hierarchy) as (AggregatedColorMatch & { pseudoElement?: '::before' | '::after' })[];
    } else {
      finalMatches = aggregated.map(m => ({ ...m, depth: 0 }));
    }

    matchedElements.clear();
    matchedPseudoElements.clear();
    finalMatches.forEach((match, index) => {
      if (match.element) {
        matchedElements.set(index, match.element);
        if (match.pseudoElement) {
          matchedPseudoElements.set(index, match.pseudoElement);
        }
      }
    });

    const serializableMatches = finalMatches.map(({ element, children, ...rest }) => rest);
    sendResponse({ matches: serializableMatches });
  }

  if (request.action === 'highlightElement') {
    const element = matchedElements.get(request.index);
    const pseudoElement = matchedPseudoElements.get(request.index);

    if (element) {
      if (pseudoElement) {
        removeAllHighlights();
        highlightPseudoElement(element, pseudoElement, request.temporary || false);
      } else {
        highlightElement(element, request.temporary || false);
      }

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
