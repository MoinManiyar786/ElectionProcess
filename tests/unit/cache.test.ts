import { InMemoryCache } from "../../src/utils/cache";

describe("InMemoryCache", () => {
  let cache: InMemoryCache;

  beforeEach(() => {
    cache = new InMemoryCache(60_000);
  });

  afterEach(() => {
    cache.destroy();
  });

  describe("set and get", () => {
    it("should store and retrieve a value", () => {
      cache.set("key1", "value1");
      expect(cache.get("key1")).toBe("value1");
    });

    it("should store complex objects", () => {
      const obj = { name: "test", count: 42, nested: { a: true } };
      cache.set("complex", obj);
      expect(cache.get("complex")).toEqual(obj);
    });

    it("should return undefined for non-existent keys", () => {
      expect(cache.get("nonexistent")).toBeUndefined();
    });

    it("should overwrite existing values", () => {
      cache.set("key", "first");
      cache.set("key", "second");
      expect(cache.get("key")).toBe("second");
    });

    it("should handle different value types", () => {
      cache.set("string", "hello");
      cache.set("number", 42);
      cache.set("boolean", true);
      cache.set("null", null);
      cache.set("array", [1, 2, 3]);

      expect(cache.get("string")).toBe("hello");
      expect(cache.get("number")).toBe(42);
      expect(cache.get("boolean")).toBe(true);
      expect(cache.get("null")).toBeNull();
      expect(cache.get("array")).toEqual([1, 2, 3]);
    });
  });

  describe("expiration", () => {
    it("should expire entries after TTL", () => {
      const shortCache = new InMemoryCache(50);
      shortCache.set("expires", "soon");

      expect(shortCache.get("expires")).toBe("soon");

      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(shortCache.get("expires")).toBeUndefined();
          shortCache.destroy();
          resolve();
        }, 100);
      });
    });

    it("should support custom TTL per entry", () => {
      cache.set("short", "value", 50);
      cache.set("long", "value", 10_000);

      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(cache.get("short")).toBeUndefined();
          expect(cache.get("long")).toBe("value");
          resolve();
        }, 100);
      });
    });
  });

  describe("delete", () => {
    it("should delete an existing key", () => {
      cache.set("toDelete", "value");
      expect(cache.delete("toDelete")).toBe(true);
      expect(cache.get("toDelete")).toBeUndefined();
    });

    it("should return false for non-existent key", () => {
      expect(cache.delete("nonexistent")).toBe(false);
    });
  });

  describe("clear", () => {
    it("should remove all entries", () => {
      cache.set("a", 1);
      cache.set("b", 2);
      cache.set("c", 3);

      cache.clear();

      expect(cache.get("a")).toBeUndefined();
      expect(cache.get("b")).toBeUndefined();
      expect(cache.get("c")).toBeUndefined();
      expect(cache.size).toBe(0);
    });
  });

  describe("size", () => {
    it("should return 0 for empty cache", () => {
      expect(cache.size).toBe(0);
    });

    it("should track the number of entries", () => {
      cache.set("a", 1);
      cache.set("b", 2);
      expect(cache.size).toBe(2);

      cache.delete("a");
      expect(cache.size).toBe(1);
    });
  });

  describe("destroy", () => {
    it("should clear the cache and stop cleanup", () => {
      cache.set("test", "value");
      cache.destroy();
      expect(cache.size).toBe(0);
    });
  });
});
