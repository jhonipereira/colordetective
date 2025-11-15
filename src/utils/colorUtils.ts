export function normalizeHex(hex: string): string {
  let cleanHex = hex.replace('#', '');

  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split('')
      .map(char => char + char)
      .join('');
  }

  return `#${cleanHex.toUpperCase()}`;
}

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

export function colorsMatch(color1: string, color2: string): boolean {
  let hex1 = color1;
  let hex2 = color2;

  if (color1.startsWith('rgb')) {
    hex1 = rgbToHex(color1);
  }
  if (color2.startsWith('rgb')) {
    hex2 = rgbToHex(color2);
  }

  hex1 = normalizeHex(hex1);
  hex2 = normalizeHex(hex2);

  return hex1 === hex2;
}

export function isValidHexColor(color: string): boolean {
  return /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}
