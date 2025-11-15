/**
 * Normalizes a hex color to 6-digit format with #
 * @param hex - The hex color string (with or without #)
 * @returns Normalized hex color (e.g., #FFFFFF)
 */
export function normalizeHex(hex: string): string {
  // Remove # if present
  let cleanHex = hex.replace('#', '');

  // Expand 3-digit hex to 6-digit
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split('')
      .map(char => char + char)
      .join('');
  }

  return `#${cleanHex.toUpperCase()}`;
}

/**
 * Converts hex color to RGB object
 * @param hex - The hex color string
 * @returns RGB object with r, g, b properties
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = normalizeHex(hex).replace('#', '');

  if (normalized.length !== 6) {
    return null;
  }

  const r = parseInt(normalized.substring(0, 2), 16);
  const g = parseInt(normalized.substring(2, 4), 16);
  const b = parseInt(normalized.substring(4, 6), 16);

  return { r, g, b };
}

/**
 * Converts RGB string to hex
 * @param rgb - RGB string (e.g., "rgb(255, 0, 0)" or "rgba(255, 0, 0, 0.5)")
 * @returns Hex color string
 */
export function rgbToHex(rgb: string): string {
  const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);

  if (!match) {
    return '';
  }

  const r = parseInt(match[1]);
  const g = parseInt(match[2]);
  const b = parseInt(match[3]);

  const toHex = (n: number) => {
    const hex = n.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/**
 * Compares two colors for equality
 * @param color1 - First color (hex or rgb)
 * @param color2 - Second color (hex or rgb)
 * @returns True if colors match
 */
export function colorsMatch(color1: string, color2: string): boolean {
  let hex1 = color1;
  let hex2 = color2;

  // Convert rgb to hex if needed
  if (color1.startsWith('rgb')) {
    hex1 = rgbToHex(color1);
  }
  if (color2.startsWith('rgb')) {
    hex2 = rgbToHex(color2);
  }

  // Normalize both colors
  hex1 = normalizeHex(hex1);
  hex2 = normalizeHex(hex2);

  return hex1 === hex2;
}

/**
 * Checks if a color string is valid
 * @param color - The color string to validate
 * @returns True if valid
 */
export function isValidHexColor(color: string): boolean {
  return /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}
