export interface ColorMatch {
  selector: string;
  tagName: string;
  colorProperty: string;
  colorValue: string;
  element?: HTMLElement;
}

export type ColorProperty = 'color' | 'background-color' | 'border-color' | 'fill' | 'stroke';
