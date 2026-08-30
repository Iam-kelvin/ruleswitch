import { describe, expect, it } from 'vitest';
import { createDefaultProgress } from './schema';
import { clearProgress, decodeProgress, loadProgress, saveProgress, STORAGE_KEY, type StorageAdapter } from './persistence';

class MemoryStorage implements StorageAdapter {
  values = new Map<string, string>();
  async getItem(key: string) { return this.values.get(key) ?? null; }
  async setItem(key: string, value: string) { this.values.set(key, value); }
  async removeItem(key: string) { this.values.delete(key); }
}

describe('offline persistence', () => {
  it('round-trips progress through a storage adapter', async () => {
    const storage = new MemoryStorage();
    const progress = createDefaultProgress();
    progress.xp = 1234;
    progress.settings.sound = false;
    await saveProgress(storage, progress);
    const loaded = await loadProgress(storage);
    expect(loaded.xp).toBe(1234);
    expect(loaded.settings.sound).toBe(false);
  });

  it('fills missing fields with safe defaults', () => {
    const partial = createDefaultProgress();
    const raw = JSON.stringify({ storageVersion: partial.storageVersion, xp: 42 });
    const decoded = decodeProgress(raw);
    expect(decoded.xp).toBe(42);
    expect(decoded.settings.preferredDifficulty).toBe('normal');
    expect(decoded.ruleStats.reversal.attempts).toBe(0);
  });

  it('rejects corrupt or unsupported data', () => {
    expect(() => decodeProgress('{nope')).toThrow('unreadable');
    expect(() => decodeProgress(JSON.stringify({ storageVersion: 99 }))).toThrow('unsupported');
  });

  it('clears the exact application key', async () => {
    const storage = new MemoryStorage();
    storage.values.set(STORAGE_KEY, '{}');
    storage.values.set('other', 'keep');
    await clearProgress(storage);
    expect(storage.values.has(STORAGE_KEY)).toBe(false);
    expect(storage.values.get('other')).toBe('keep');
  });
});
