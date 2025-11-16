export interface ColorMatch {
  selector: string;
  tagName: string;
  colorProperty: string;
  colorValue: string;
  element?: HTMLElement;
  pseudoElement?: '::before' | '::after';
}

export interface AggregatedColorMatch {
  selector: string;
  tagName: string;
  properties: Array<{ property: string; value: string }>;
  element?: HTMLElement;
  children?: AggregatedColorMatch[];
  depth?: number;
  pseudoElement?: '::before' | '::after';
}

export type ColorProperty =
  | 'color'
  | 'background-color'
  | 'border-color'
  | 'border-top-color'
  | 'border-right-color'
  | 'border-bottom-color'
  | 'border-left-color'
  | 'outline-color'
  | 'text-decoration-color'
  | 'caret-color'
  | 'fill'
  | 'stroke'
  | 'box-shadow'
  | 'text-shadow';
