export const createPersistence = ({ storageKey }) => {
  const save = ({ query, selectedImdbId }) => {
    try {
      const payload = JSON.stringify({ query, selectedImdbId });
      localStorage.setItem(storageKey, payload);
    } catch {
      // Silently ignore storage failures to keep the app usable.
    }
  };

  const load = () => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  const readQueryFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get("s") || "";
  };

  const writeQueryToUrl = (query) => {
    const url = new URL(window.location.href);
    if (query) {
      url.searchParams.set("s", query);
    } else {
      url.searchParams.delete("s");
    }
    window.history.replaceState({}, "", url);
  };

  return {
    save,
    load,
    readQueryFromUrl,
    writeQueryToUrl,
  };
};
