import { PALETTES } from '@/constants/theme';
import { useProgress } from '@/state/ProgressProvider';

export function usePalette() {
  const { data } = useProgress();
  return PALETTES[data.settings.theme];
}

export function useReducedMotion() {
  const { data } = useProgress();
  return data.settings.reducedMotion;
}
