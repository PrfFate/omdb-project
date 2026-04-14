export const createCacheService = () => {
  const memoryCache = new Map();

  return {
    get(key) {
      return memoryCache.get(key);
    },
    set(key, value) {
      memoryCache.set(key, value);
    },
    has(key) {
      return memoryCache.has(key);
    },
  };
};
