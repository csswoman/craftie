export type FontClassification =
  | 'serif'
  | 'sans-serif'
  | 'display'
  | 'monospace';

export type FontMeta = {
  family: string;
  googleFontsRef: string;
  classification: FontClassification;
  contrast: 'high' | 'medium' | 'low';
  xHeight: 'high' | 'medium' | 'low';
  personality: string[];
  bestFor: 'heading' | 'body' | 'both';
  /** UI weight for specimens / applied readout; defaults 700 heading / 400 body */
  defaultWeight?: number;
};

export type FontPair = {
  id: string;
  displayName: string;
  heading: FontMeta;
  body: FontMeta;
  rationale: string;
  mood: string[];
  character: string[];
  wcagNote?: string;
};
