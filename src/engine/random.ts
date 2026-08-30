function xmur3(value: string): () => number {
  let hash = 1779033703 ^ value.length;
  for (let index = 0; index < value.length; index += 1) {
    hash = Math.imul(hash ^ value.charCodeAt(index), 3432918353);
    hash = (hash << 13) | (hash >>> 19);
  }
  return () => {
    hash = Math.imul(hash ^ (hash >>> 16), 2246822507);
    hash = Math.imul(hash ^ (hash >>> 13), 3266489909);
    return (hash ^= hash >>> 16) >>> 0;
  };
}

function mulberry32(seed: number): () => number {
  return () => {
    let value = (seed += 0x6d2b79f5);
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export interface SeededRandom {
  next: () => number;
  integer: (min: number, max: number) => number;
  pick: <T>(items: readonly T[]) => T;
  shuffle: <T>(items: readonly T[]) => T[];
}

export function createRandom(seed: string): SeededRandom {
  const hash = xmur3(seed);
  const next = mulberry32(hash());
  return {
    next,
    integer(min, max) {
      return min + Math.floor(next() * (max - min + 1));
    },
    pick<T>(items: readonly T[]): T {
      if (items.length === 0) throw new Error('Cannot choose from an empty collection.');
      return items[Math.floor(next() * items.length)]!;
    },
    shuffle<T>(items: readonly T[]): T[] {
      const copy = [...items];
      for (let index = copy.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(next() * (index + 1));
        [copy[index], copy[swapIndex]] = [copy[swapIndex]!, copy[index]!];
      }
      return copy;
    }
  };
}
