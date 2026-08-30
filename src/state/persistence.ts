import { createDefaultProgress, STORAGE_VERSION, type ProgressData, type RuleStats } from './schema';

export const STORAGE_KEY = '@ruleswitch/progress/v1';

export interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

function mergeRuleStats(defaults: Record<string, RuleStats>, value: unknown): Record<string, RuleStats> {
  if (!value || typeof value !== 'object') return defaults;
  const source = value as Record<string, Partial<RuleStats>>;
  return Object.fromEntries(
    Object.entries(defaults).map(([key, fallback]) => [key, { ...fallback, ...(source[key] ?? {}) }])
  );
}

export function decodeProgress(raw: string | null): ProgressData {
  const defaults = createDefaultProgress();
  if (!raw) return defaults;
  let parsed: Partial<ProgressData>;
  try {
    parsed = JSON.parse(raw) as Partial<ProgressData>;
  } catch {
    throw new Error('Saved progress is unreadable.');
  }
  if (typeof parsed !== 'object' || parsed === null) throw new Error('Saved progress has an invalid format.');
  if (parsed.storageVersion !== STORAGE_VERSION) throw new Error('Saved progress uses an unsupported version.');

  return {
    ...defaults,
    ...parsed,
    settings: { ...defaults.settings, ...(parsed.settings ?? {}) },
    totals: { ...defaults.totals, ...(parsed.totals ?? {}) },
    ruleStats: mergeRuleStats(defaults.ruleStats, parsed.ruleStats) as ProgressData['ruleStats'],
    focusStats: mergeRuleStats(defaults.focusStats, parsed.focusStats) as ProgressData['focusStats'],
    masteredRuleCategories: parsed.masteredRuleCategories ?? [],
    journey: {
      ...defaults.journey,
      ...(parsed.journey ?? {}),
      levels: parsed.journey?.levels ?? {}
    },
    daily: {
      ...defaults.daily,
      ...(parsed.daily ?? {}),
      results: parsed.daily?.results ?? {}
    },
    achievements: parsed.achievements ?? {},
    lastResult: parsed.lastResult ?? null,
    storageVersion: STORAGE_VERSION
  };
}

export async function loadProgress(storage: StorageAdapter): Promise<ProgressData> {
  return decodeProgress(await storage.getItem(STORAGE_KEY));
}

export async function saveProgress(storage: StorageAdapter, progress: ProgressData): Promise<void> {
  await storage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export async function clearProgress(storage: StorageAdapter): Promise<void> {
  await storage.removeItem(STORAGE_KEY);
}
