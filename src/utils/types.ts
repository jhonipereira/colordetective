export interface ColorMatch {
  selector: string;
  tagName: string;
  colorProperty: string;
  colorValue: string;
  element?: HTMLElement;
}

export interface AggregatedColorMatch {
  selector: string;
  tagName: string;
  properties: Array<{ property: string; value: string }>;
  element?: HTMLElement;
}

export type ColorProperty = 'color' | 'background-color' | 'border-color' | 'fill' | 'stroke';
