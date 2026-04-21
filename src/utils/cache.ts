interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class InMemoryCache {
  private readonly store = new Map<string, CacheEntry<unknown>>();
  private readonly defaultTtlMs: number;
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor(defaultTtlMs: number = 300_000) {
    this.defaultTtlMs = defaultTtlMs;
    this.startCleanup();
  }

  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) {
      return undefined;
    }
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlMs?: number): void {
    const expiresAt = Date.now() + (ttlMs ?? this.defaultTtlMs);
    this.store.set(key, { value, expiresAt });
  }

  delete(key: string): boolean {
    return this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  get size(): number {
    return this.store.size;
  }

  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.store) {
        if (now > entry.expiresAt) {
          this.store.delete(key);
        }
      }
    }, 60_000);

    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.store.clear();
  }
}
