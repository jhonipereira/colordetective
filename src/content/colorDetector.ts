import { ColorMatch, ColorProperty } from '../utils/types';
import { colorsMatch } from '../utils/colorUtils';

const COLOR_PROPERTIES: ColorProperty[] = [
  'color',
  'background-color',
  'border-color',
];

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

  const path: string[] = [];
  let current: HTMLElement | null = element;

  while (current && current.tagName) {
    let selector = current.tagName.toLowerCase();

    if (current.id) {
      selector += `#${current.id}`;
      path.unshift(selector);
      break;
    }

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

    if (path.length >= 4) break;
  }

  return path.join(' > ');
}

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

const originalStyles = new WeakMap<HTMLElement, { outline: string; outlineOffset: string; backgroundColor: string }>();

export function highlightElement(element: HTMLElement, temporary = false): void {
  removeAllHighlights();

  if (!originalStyles.has(element)) {
    originalStyles.set(element, {
      outline: element.style.outline,
      outlineOffset: element.style.outlineOffset,
      backgroundColor: element.style.backgroundColor,
    });
  }

  if (temporary) {
    element.style.outline = '2px dashed rgba(229, 70, 54, 0.6)';
    element.style.outlineOffset = '2px';
  } else {
    element.style.outline = '3px solid rgba(229, 70, 54, 0.9)';
    element.style.outlineOffset = '2px';
    element.style.backgroundColor = 'rgba(229, 70, 54, 0.1)';
  }

  element.setAttribute('data-colordetective-highlighted', temporary ? 'temp' : 'permanent');
}

export function highlightElements(elements: HTMLElement[]): void {
  elements.forEach((element) => {
    highlightElement(element, false);
  });
}

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
