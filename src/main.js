import { APP_CONFIG } from "./config.js";
import { createOmdbService } from "./services/omdbService.js";
import { createCacheService } from "./services/cacheService.js";
import { createStore } from "./state/store.js";
import { createPersistence } from "./utils/persistence.js";
import { createRenderer } from "./ui/render.js";

const store = createStore();
const cache = createCacheService();
const persistence = createPersistence({ storageKey: APP_CONFIG.storageKey });
const omdbService = createOmdbService({
  apiBaseUrl: APP_CONFIG.omdbApiBaseUrl,
  apiKey: APP_CONFIG.omdbApiKey,
});
const ui = createRenderer();

/* ── helpers ── */
const cacheKey = (q) => `search:${q.toLowerCase()}`;
const detailsCacheKey = (id) => `details:${id}`;

/* ── select movie → open modal ── */
const selectMovie = async (imdbId) => {
  store.setState({ selectedImdbId: imdbId });
  ui.renderResults({
    results: store.getState().searchResults,
    selectedImdbId: imdbId,
  });

  const dk = detailsCacheKey(imdbId);
  if (cache.has(dk)) {
    ui.renderMovieDetails(cache.get(dk));
    return;
  }

  try {
    const movie = await omdbService.getMovieById(imdbId);
    cache.set(dk, movie);
    store.setState({ selectedMovie: movie });
    ui.renderMovieDetails(movie);
  } catch (err) {
    ui.renderStatus(err instanceof Error ? err.message : "An error occurred.", true);
  }
};

/* ── search ── */
const runSearch = async (query) => {
  const q = query.trim();
  if (!q) return;

  ui.setLoading(true);
  ui.renderStatus("");

  const key = cacheKey(q);
  try {
    let payload;
    if (cache.has(key)) {
      payload = cache.get(key);
    } else {
      payload = await omdbService.searchByTitle(q);
      cache.set(key, payload);
    }

    const results = payload.Search || [];
    store.setState({
      query: q,
      searchResults: results,
      selectedMovie: null,
      error: "",
    });

    ui.renderResults({ results });
    persistence.writeQueryToUrl(q);
    persistence.save({ query: q });

    if (results.length === 0) {
      ui.renderStatus("No results found.", true);
    }
  } catch (err) {
    ui.renderStatus(
      err instanceof Error ? err.message : "An error occurred while searching.",
      true
    );
  } finally {
    ui.setLoading(false);
  }
};

/* ── hydrate ── */
const hydrateInitialState = async () => {
  const fromUrl = persistence.readQueryFromUrl().trim();
  const fromStorage = persistence.load();
  const initial = fromUrl || fromStorage?.query || "";
  if (!initial) return;
  ui.elements.input.value = initial;
  await runSearch(initial);
};

/* ── events ── */

// Search form submit
ui.elements.form.addEventListener("submit", async (e) => {
  e.preventDefault();
  await runSearch(ui.elements.input.value);
});

// Click on movie card
ui.elements.resultList.addEventListener("click", async (e) => {
  const card = e.target.closest(".movie-card");
  if (!card) return;
  const id = card.dataset.imdbId;
  if (id) await selectMovie(id);
});



// Keyboard: Escape closes modal
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") ui.toggleModal(false);
});

hydrateInitialState();
