const createOmdbError = (message) => new Error(message);

export const createOmdbService = ({ apiBaseUrl, apiKey }) => {
  const buildUrl = (params) => {
    const url = new URL(apiBaseUrl);
    url.searchParams.set("apikey", apiKey);

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });

    return url.toString();
  };

  const request = async (params) => {
    const url = buildUrl(params);

    let response;
    try {
      response = await fetch(url);
    } catch {
      throw createOmdbError("Network issue detected. Please check your connection.");
    }

    if (!response.ok) {
      throw createOmdbError("Movie service is unavailable right now.");
    }

    const data = await response.json();
    if (data.Response === "False") {
      throw createOmdbError(data.Error || "No data found for this request.");
    }

    return data;
  };

  return {
    /** Search by title. Optional year and type filters. */
    searchByTitle(query, { year, type } = {}) {
      const params = { s: query };
      if (year) params.y = year;
      if (type) params.type = type;
      return request(params);
    },
    getMovieById(imdbId) {
      return request({ i: imdbId, plot: "short" });
    },
  };
};
