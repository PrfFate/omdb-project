export const createStore = () => {
  const state = {
    query: "",
    selectedImdbId: "",
    searchResults: [],
    selectedMovie: null,
    isLoading: false,
    error: "",
  };

  return {
    getState() {
      return { ...state };
    },
    setState(patch) {
      Object.assign(state, patch);
      return { ...state };
    },
  };
};
