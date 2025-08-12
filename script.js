const episodesCache = {};
const showsCache = [];
let allEpisodes = [];
let allShows = [];

// Initial setup function triggered on page load
async function setup() {
  showLoadingMessage();
  await loadShowsListing();
  setupShowSearch();
}

// Fetch and render the list of shows, using cache if available
async function loadShowsListing() {
  try {
    if (showsCache.length === 0) {
      const shows = await fetchShows();
      showsCache.push(...shows);
    }
    allShows = showsCache;
    removeLoadingMessage();
    renderShowsListing(allShows);
  } catch (error) {
    showErrorMessage("Could not load shows.");
    console.error(error);
  }
}

// Fetch shows from TVMaze API and sort alphabetically by name
async function fetchShows() {
  const response = await fetch("https://api.tvmaze.com/shows");
  if (!response.ok) throw new Error("Failed to fetch shows");
  const shows = await response.json();
  return shows.sort((a, b) => a.name.localeCompare(b.name));
}

// Render a list of shows as clickable cards on the page
function renderShowsListing(shows) {
  hideEpisodeControls();

  const root = document.getElementById("root");
  root.innerHTML = "";

  const showsFoundMsg = document.getElementById("shows-found-message");
  if (showsFoundMsg) {
    showsFoundMsg.textContent = `Found ${shows.length} show${
      shows.length !== 1 ? "s" : ""
    }`;
  }

  const container = document.createElement("div");
  container.id = "shows-listing";

  shows.forEach((show) => {
    const card = document.createElement("article");
    card.className = "show-card";

    const title = document.createElement("h2");
    title.textContent = show.name;
    title.classList.add("clickable");
    title.addEventListener("click", () => handleShowSelection(show.id));

    const img = document.createElement("img");
    img.src =
      show.image?.medium || "https://via.placeholder.com/210x295?text=No+Image";

    img.alt = `Image from ${show.name}`;

    const summary = document.createElement("p");
    summary.innerHTML = show.summary || "No summary available.";

    const genres = document.createElement("p");
    genres.textContent = `Genres: ${show.genres.join(", ") || "N/A"}`;

    const status = document.createElement("p");
    status.textContent = `Status: ${show.status || "Unknown"}`;

    const rating = document.createElement("p");
    rating.textContent = `Rating: ${show.rating?.average || "N/A"}`;

    const runtime = document.createElement("p");
    runtime.textContent = `Runtime: ${show.runtime || "N/A"} min`;

    card.append(img, title, summary, genres, status, rating, runtime);
    container.appendChild(card);
  });

  root.appendChild(container);
}

// Setup event listeners for show search input and dropdown autocomplete
function setupShowSearch() {
  const searchInput = document.getElementById("searchShows");
  if (!searchInput) return;

  let dropdown = document.getElementById("showDropdown");
  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase().trim();

    dropdown.innerHTML = "";
    if (!query) {
      dropdown.style.display = "none";
      renderShowsListing(allShows);
      return;
    }

    const filtered = allShows.filter(
      (show) =>
        show.name.toLowerCase().includes(query) ||
        show.genres.join(" ").toLowerCase().includes(query) ||
        (show.summary || "").toLowerCase().includes(query)
    );

    filtered.forEach((show) => {
      const div = document.createElement("div");
      div.className = "dropdown-item";
      div.textContent = show.name;
      div.addEventListener("click", () => {
        handleShowSelection(show.id);
        dropdown.style.display = "none";
      });
      dropdown.appendChild(div);
    });

    dropdown.style.display = filtered.length > 0 ? "block" : "none";
    renderShowsListing(filtered);
  });

  document.addEventListener("click", (event) => {
    if (
      !searchInput.contains(event.target) &&
      !dropdown.contains(event.target)
    ) {
      dropdown.style.display = "none";
    }
  });
}

// Handle user clicking a show: fetch and display episodes
async function handleShowSelection(showId) {
  showLoadingMessage();
  try {
    if (!episodesCache[showId]) {
      const response = await fetch(
        `https://api.tvmaze.com/shows/${showId}/episodes`
      );
      if (!response.ok) throw new Error("Failed to fetch episodes");
      episodesCache[showId] = await response.json();
    }
    allEpisodes = episodesCache[showId];
    removeLoadingMessage();
    renderEpisodesUI(allEpisodes);

    document.getElementById("show-search-wrapper").style.display = "none";
  } catch (error) {
    removeLoadingMessage();
    showErrorMessage("Failed to load episodes.");
    console.error(error);
  }
}

// Render UI for episodes, including back button and episode list
function renderEpisodesUI(episodes) {
  showEpisodeControls();

  const root = document.getElementById("root");
  root.innerHTML = "";

  const backLink = document.createElement("button");
  backLink.textContent = "← Back to Shows";
  backLink.id = "nav-back";
  backLink.addEventListener("click", () => {
    renderShowsListing(allShows);

    document.getElementById("show-search-wrapper").style.display = "flex";
  });

  root.appendChild(backLink);

  const episodesContainer = document.createElement("div");
  episodesContainer.id = "episodes-listing";

  const episodeCards = episodes.map(createEpisodeCard);
  episodesContainer.append(...episodeCards);

  root.appendChild(episodesContainer);

  setupSearch();
  episodeOptions(episodes);
  numberMatchingEpisodes(episodes);
}

// Create episode cards from episode objects
function makePageForEpisodes(episodeList) {
  return episodeList.map(createEpisodeCard);
}

// Format season and episode number as S01E02 format
function formatEpisodeCode(episode) {
  const seasonStr = episode.season.toString().padStart(2, "0");
  const episodeStr = episode.number.toString().padStart(2, "0");
  return "S" + seasonStr + "E" + episodeStr;
}

// Create a single episode card element from an episode object
function createEpisodeCard(episode) {
  const episodeCard = document
    .getElementById("episode-card")
    .content.cloneNode(true);

  const title = episodeCard.querySelector("h2");
  const titleLink = document.createElement("a");
  titleLink.href = episode.url;
  titleLink.textContent = episode.name;
  titleLink.target = "_blank";
  titleLink.rel = "noopener noreferrer";
  title.textContent = "";
  title.appendChild(titleLink);

  episodeCard.querySelector(".episode-code").textContent =
    formatEpisodeCode(episode);
  episodeCard.querySelector("img").src =
    episode.image?.medium || "error-pic.png";
  episodeCard.querySelector("img").alt = `Image from ${episode.name}`;
  episodeCard.querySelector(".episode-summary").innerHTML =
    episode.summary || "No summary available.";

  return episodeCard;
}

// Setup event listener on episode search input
function setupSearch() {
  const searchEpisodes = document.getElementById("searchEpisodes");
  searchEpisodes.addEventListener("input", filterByKeyword);
}

// Filter episodes displayed by keyword in name or summary
function filterByKeyword(event) {
  const inputValue = event.target.value.toLowerCase();
  const filteredEpisodes = allEpisodes.filter((episode) => {
    const episodeText = `${episode.name} ${episode.summary}`.toLowerCase();
    return episodeText.includes(inputValue);
  });

  const episodesContainer = document.getElementById("episodes-listing");
  episodesContainer.innerHTML = "";
  const cards = makePageForEpisodes(filteredEpisodes);
  episodesContainer.append(...cards);

  numberMatchingEpisodes(filteredEpisodes);
}

// Show count of episodes currently displayed out of total episodes
function numberMatchingEpisodes(filteredEpisodes) {
  const matchingEpisodes = document.getElementById("match-number");
  matchingEpisodes.textContent = `Displaying ${filteredEpisodes.length} / ${allEpisodes.length} episode(s)`;
}

// Populate episode dropdown selector with all episodes + "All episodes" option
function episodeOptions(episodes) {
  const selector = document.getElementById("selectEpisode");
  selector.innerHTML = `<option value="all">All episodes</option>`;
  episodes.forEach((episode) => {
    const option = document.createElement("option");
    option.value = episode.id;
    option.textContent = `${formatEpisodeCode(episode)} - ${episode.name}`;
    selector.appendChild(option);
  });
  selector.addEventListener("change", episodeListDisplay);
}

// Display episodes based on dropdown selection ("all" or single episode)
function episodeListDisplay(event) {
  const selectedId = event.target.value;
  const episodesContainer = document.getElementById("episodes-listing");
  episodesContainer.innerHTML = "";

  if (selectedId === "all") {
    const cards = makePageForEpisodes(allEpisodes);
    episodesContainer.append(...cards);
    numberMatchingEpisodes(allEpisodes);
  } else {
    const selectedEpisode = allEpisodes.find((ep) => ep.id == selectedId);
    const cards = makePageForEpisodes([selectedEpisode]);
    episodesContainer.append(...cards);
    numberMatchingEpisodes([selectedEpisode]);
  }
}

// Show episode search and filter controls
function showEpisodeControls() {
  document.getElementById("search-container").style.display = "flex";
}

// Hide episode search and filter controls
function hideEpisodeControls() {
  document.getElementById("search-container").style.display = "none";
}

// Show a loading message in the root element
function showLoadingMessage() {
  document.getElementById("root").innerHTML = "<p id='loading'>Loading...</p>";
}

// Remove loading message if present
function removeLoadingMessage() {
  const loading = document.getElementById("loading");
  if (loading) loading.remove();
}

// Show an error message in the root element
function showErrorMessage(message) {
  document.getElementById("root").innerHTML = `<p id="error">${message}</p>`;
}

window.onload = setup;
