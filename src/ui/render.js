const safeText = (v) => (v && v !== "N/A" ? v : "—");
const hasPoster = (p) => p && p !== "N/A";
const placeholder = "https://via.placeholder.com/400x600/141926/64748b?text=No+Poster";

export const createRenderer = () => {
  const elements = {
    form: document.querySelector("#searchForm"),
    input: document.querySelector("#movieQuery"),
    button: document.querySelector("#searchButton"),
    clear: document.querySelector("#clearButton"),
    status: document.querySelector("#statusMessage"),
    resultList: document.querySelector("#resultList"),
    details: document.querySelector("#detailsCard"),
    modal: document.querySelector("#detailsModal"),
    closeModal: document.querySelector("#closeModal"),

  };

  const renderStatus = (message, isError = false) => {
    elements.status.textContent = message;
    elements.status.classList.toggle("error", isError);
  };

  const toggleModal = (isOpen) => {
    elements.modal.classList.toggle("open", isOpen);
    elements.modal.setAttribute("aria-hidden", !isOpen);
    document.body.style.overflow = isOpen ? "hidden" : "";
  };



  const renderResults = ({ results, selectedImdbId }) => {
    if (!results || results.length === 0) {
      elements.resultList.innerHTML = "";
      return;
    }

    elements.resultList.innerHTML = results
      .map((m) => {
        const poster = hasPoster(m.Poster) ? m.Poster : placeholder;
        const active = m.imdbID === selectedImdbId ? " active" : "";
        return `
          <button type="button" class="movie-card${active}" data-imdb-id="${m.imdbID}">
            <img class="card-poster" src="${poster}" alt="${m.Title}" loading="lazy" />
            <div class="card-overlay">
              <h3>${m.Title}</h3>
              <span class="year">${m.Year}</span>
            </div>
          </button>`;
      })
      .join("");
  };

  const renderMovieDetails = (movie) => {
    if (!movie) {
      elements.details.innerHTML = "";
      toggleModal(false);
      return;
    }

    const poster = hasPoster(movie.Poster) ? movie.Poster : placeholder;

    elements.details.innerHTML = `
      <div class="details-grid">
        <img src="${poster}" alt="${movie.Title}" />
        <div class="details-info">
          <h2>${movie.Title}</h2>
          <dl>
            <dt>Year</dt>
            <dd>${safeText(movie.Year)}</dd>
            <dt>Genre</dt>
            <dd>${safeText(movie.Genre)}</dd>
            <dt>Director</dt>
            <dd>${safeText(movie.Director)}</dd>
            <dt>Actors</dt>
            <dd>${safeText(movie.Actors)}</dd>
            <dt>IMDB</dt>
            <dd>⭐ ${safeText(movie.imdbRating)}</dd>
            <dt>Plot</dt>
            <dd>${safeText(movie.Plot)}</dd>
          </dl>
        </div>
      </div>`;
    toggleModal(true);
  };

  const setLoading = (isLoading) => {
    elements.button.disabled = isLoading;
    elements.button.textContent = isLoading ? "…" : "Search";
  };

  // Close modal
  elements.closeModal.addEventListener("click", () => toggleModal(false));
  elements.modal.addEventListener("click", (e) => {
    if (e.target === elements.modal) toggleModal(false);
  });

  // Clear input
  elements.clear.addEventListener("click", () => {
    elements.input.value = "";
    elements.input.focus();
  });

  return {
    elements,
    renderStatus,
    renderResults,
    renderMovieDetails,
    setLoading,
    toggleModal,

  };
};
