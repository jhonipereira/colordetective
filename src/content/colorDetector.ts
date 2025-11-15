import { ColorMatch, ColorProperty } from '../utils/types';
import { colorsMatch } from '../utils/colorUtils';

const COLOR_PROPERTIES: ColorProperty[] = [
  'color',
  'background-color',
  'border-color',
  'border-top-color',
  'border-right-color',
  'border-bottom-color',
  'border-left-color',
  'outline-color',
  'text-decoration-color',
  'caret-color',
];

const SHADOW_PROPERTIES: ColorProperty[] = [
  'box-shadow',
  'text-shadow',
];

function extractColorsFromShadow(shadowValue: string): string[] {
  if (!shadowValue || shadowValue === 'none') return [];

  const colors: string[] = [];
  const rgbRegex = /rgba?\([^)]+\)/g;
  const hexRegex = /#[0-9A-Fa-f]{3,8}\b/g;

  const rgbMatches = shadowValue.match(rgbRegex);
  if (rgbMatches) {
    colors.push(...rgbMatches);
  }

  const hexMatches = shadowValue.match(hexRegex);
  if (hexMatches) {
    colors.push(...hexMatches);
  }

  return colors;
}

function generateSelector(element: HTMLElement, fullPath: boolean = false): string {
  if (!fullPath) {
    let selector = element.tagName.toLowerCase();

    if (element.id) {
      return `${selector}#${element.id}`;
    }

    if (element.className && typeof element.className === 'string') {
      const classes = element.className.trim().split(/\s+/).filter(c => c).join('.');
      if (classes) {
        selector += `.${classes}`;
      }
    }

    return selector;
  }

  const path: string[] = [];
  let current: HTMLElement | null = element;

  while (current && current.tagName && current.tagName.toLowerCase() !== 'html') {
    let selector = current.tagName.toLowerCase();

    if (current.id) {
      selector += `#${current.id}`;
    } else if (current.className && typeof current.className === 'string') {
      const classes = current.className.trim().split(/\s+/).filter(c => c).join('.');
      if (classes) {
        selector += `.${classes}`;
      }
    }

    const parent: HTMLElement | null = current.parentElement;
    if (parent && !current.id) {
      const siblings = Array.from(parent.children).filter(
        (child): child is Element => child.tagName === current!.tagName
      );

      if (siblings.length > 1) {
        const index = siblings.indexOf(current) + 1;
        selector += `:nth-of-type(${index})`;
      }
    }

    path.unshift(selector);
    current = parent;
  }

  return 'html > ' + path.join(' > ');
}

export function detectColorInDOM(targetColor: string, showFullPath: boolean = false): ColorMatch[] {
  const matches: ColorMatch[] = [];
  const elements = document.querySelectorAll('*');

  elements.forEach((element) => {
    if (!(element instanceof HTMLElement)) return;

    const computedStyle = window.getComputedStyle(element);

    COLOR_PROPERTIES.forEach((property) => {
      const colorValue = computedStyle.getPropertyValue(property);

      if (colorValue && colorsMatch(colorValue, targetColor)) {
        matches.push({
          selector: generateSelector(element, showFullPath),
          tagName: element.tagName,
          colorProperty: property,
          colorValue: colorValue,
          element: element,
        });
      }
    });

    SHADOW_PROPERTIES.forEach((property) => {
      const shadowValue = computedStyle.getPropertyValue(property);
      const shadowColors = extractColorsFromShadow(shadowValue);

      shadowColors.forEach((shadowColor) => {
        if (colorsMatch(shadowColor, targetColor)) {
          matches.push({
            selector: generateSelector(element, showFullPath),
            tagName: element.tagName,
            colorProperty: property,
            colorValue: shadowColor,
            element: element,
          });
        }
      });
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
