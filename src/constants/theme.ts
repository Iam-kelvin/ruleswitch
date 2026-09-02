import type { ColorName } from '@/engine/types';
import type { ThemePreference } from '@/state/schema';

export interface Palette {
  background: string;
  backgroundAlt: string;
  panel: string;
  panelStrong: string;
  text: string;
  textMuted: string;
  border: string;
  primary: string;
  onPrimary: string;
  secondary: string;
  onSecondary: string;
  success: string;
  onSuccess: string;
  danger: string;
  onDanger: string;
  warning: string;
  onWarning: string;
  shadow: string;
  statusBar: 'light' | 'dark';
}

export const PALETTES: Record<ThemePreference, Palette> = {
  midnight: {
    background: '#090C18',
    backgroundAlt: '#171D35',
    panel: '#171D31',
    panelStrong: '#222A46',
    text: '#F7F8FF',
    textMuted: '#ADB6D5',
    border: '#333D61',
    primary: '#41E3B5',
    onPrimary: '#071510',
    secondary: '#6F5BE7',
    onSecondary: '#FFFFFF',
    success: '#41E3B5',
    onSuccess: '#071510',
    danger: '#FF6F91',
    onDanger: '#241018',
    warning: '#FFC15C',
    onWarning: '#241800',
    shadow: '#02030A',
    statusBar: 'light'
  },
  daylight: {
    background: '#F5F7FF',
    backgroundAlt: '#E7ECFF',
    panel: '#FFFFFF',
    panelStrong: '#EAF0FF',
    text: '#151A2E',
    textMuted: '#5E6682',
    border: '#CAD3ED',
    primary: '#087B65',
    onPrimary: '#FFFFFF',
    secondary: '#6550D8',
    onSecondary: '#FFFFFF',
    success: '#087B65',
    onSuccess: '#FFFFFF',
    danger: '#C93057',
    onDanger: '#FFFFFF',
    warning: '#9A6200',
    onWarning: '#FFFFFF',
    shadow: '#8690AF',
    statusBar: 'dark'
  },
  highContrast: {
    background: '#000000',
    backgroundAlt: '#0D0D0D',
    panel: '#111111',
    panelStrong: '#1C1C1C',
    text: '#FFFFFF',
    textMuted: '#E7E7E7',
    border: '#FFFFFF',
    primary: '#72FFD6',
    onPrimary: '#071510',
    secondary: '#CCBFFF',
    onSecondary: '#17102A',
    success: '#72FFD6',
    onSuccess: '#071510',
    danger: '#FF8BA7',
    onDanger: '#241018',
    warning: '#FFE071',
    onWarning: '#241800',
    shadow: '#000000',
    statusBar: 'light'
  }
};

export const OBJECT_COLORS: Record<ColorName, { fill: string; contrast: string; cue: string }> = {
  blue: { fill: '#3188FF', contrast: '#071510', cue: 'B' },
  red: { fill: '#EB4D6D', contrast: '#241018', cue: 'R' },
  amber: { fill: '#F5B83B', contrast: '#241800', cue: 'A' },
  teal: { fill: '#18A999', contrast: '#071510', cue: 'T' },
  violet: { fill: '#8A63D2', contrast: '#FFFFFF', cue: 'V' }
};

export const FONT = {
  regular: 'System',
  medium: 'System',
  bold: 'System'
} as const;
