import { ColorMatch, ColorProperty } from '../utils/types';
import { colorsMatch } from '../utils/colorUtils';

/**
 * Color properties to check on elements
 */
const COLOR_PROPERTIES: ColorProperty[] = [
  'color',
  'background-color',
  'border-color',
];

/**
 * Generates a unique CSS selector for an element
 * @param element - The HTML element
 * @returns CSS selector string
 */
function generateSelector(element: HTMLElement): string {
  if (element.id) {
    return `#${element.id}`;
  }

  if (element.className && typeof element.className === 'string') {
    const classes = element.className.trim().split(/\s+/).join('.');
    if (classes) {
      return `${element.tagName.toLowerCase()}.${classes}`;
    }
  }

  // Generate a path-based selector
  const path: string[] = [];
  let current: HTMLElement | null = element;

  while (current && current.tagName) {
    let selector = current.tagName.toLowerCase();

    if (current.id) {
      selector += `#${current.id}`;
      path.unshift(selector);
      break;
    }

    // Add nth-child if there are siblings
    const parent: HTMLElement | null = current.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter(
        (child): child is Element => child.tagName === current!.tagName
      );

      if (siblings.length > 1) {
        const index = siblings.indexOf(current) + 1;
        selector += `:nth-child(${index})`;
      }
    }

    path.unshift(selector);
    current = parent;

    // Limit path depth
    if (path.length >= 4) break;
  }

  return path.join(' > ');
}

/**
 * Detects all elements matching a specific color
 * @param targetColor - The hex color to search for
 * @returns Array of color matches
 */
export function detectColorInDOM(targetColor: string): ColorMatch[] {
  const matches: ColorMatch[] = [];
  const elements = document.querySelectorAll('*');

  elements.forEach((element) => {
    if (!(element instanceof HTMLElement)) return;

    const computedStyle = window.getComputedStyle(element);

    COLOR_PROPERTIES.forEach((property) => {
      const colorValue = computedStyle.getPropertyValue(property);

      if (colorValue && colorsMatch(colorValue, targetColor)) {
        matches.push({
          selector: generateSelector(element),
          tagName: element.tagName,
          colorProperty: property,
          colorValue: colorValue,
          element: element,
        });
      }
    });
  });

  return matches;
}

// Store original styles to restore them later
const originalStyles = new WeakMap<HTMLElement, { outline: string; outlineOffset: string; backgroundColor: string }>();

/**
 * Highlights a single element on the page (like DevTools inspector)
 * @param element - The HTML element to highlight
 * @param temporary - If true, uses a lighter highlight for hover preview
 */
export function highlightElement(element: HTMLElement, temporary = false): void {
  // Remove all previous highlights first
  removeAllHighlights();

  // Store original styles if not already stored
  if (!originalStyles.has(element)) {
    originalStyles.set(element, {
      outline: element.style.outline,
      outlineOffset: element.style.outlineOffset,
      backgroundColor: element.style.backgroundColor,
    });
  }

  // Apply highlight styles (similar to Chrome DevTools)
  if (temporary) {
    // Lighter highlight for hover
    element.style.outline = '2px dashed rgba(66, 133, 244, 0.6)';
    element.style.outlineOffset = '2px';
  } else {
    // Stronger highlight for click
    element.style.outline = '3px solid rgba(66, 133, 244, 0.9)';
    element.style.outlineOffset = '2px';
    element.style.backgroundColor = 'rgba(66, 133, 244, 0.1)';
  }

  // Add a data attribute to track highlighted elements
  element.setAttribute('data-colordetective-highlighted', temporary ? 'temp' : 'permanent');
}

/**
 * Highlights multiple elements on the page
 * @param elements - Array of HTML elements to highlight
 */
export function highlightElements(elements: HTMLElement[]): void {
  elements.forEach((element) => {
    highlightElement(element, false);
  });
}

/**
 * Removes all highlighting from elements
 */
export function removeAllHighlights(): void {
  const elements = document.querySelectorAll('[data-colordetective-highlighted]');

  elements.forEach((element) => {
    if (element instanceof HTMLElement) {
      const original = originalStyles.get(element);

      if (original) {
        element.style.outline = original.outline;
        element.style.outlineOffset = original.outlineOffset;
        element.style.backgroundColor = original.backgroundColor;
      } else {
        element.style.outline = '';
        element.style.outlineOffset = '';
        element.style.backgroundColor = '';
      }

      element.removeAttribute('data-colordetective-highlighted');
    }
  });
}
