const episodesCache = {};                                   // Cache to store episodes for each show
let allEpisodes = [];

async function setup() {
  showLoadingMessage();
  await setupShowDropdown();                                // Make a single fetch to the TVMaze API

  const showSelect = document.getElementById("selectShow");
  const pageLoadShow = showSelect.options[1]?.value;        // Skip index 0 (placeholder: "Select a show..." and load first episode option)

  if (pageLoadShow) {
    showSelect.value = pageLoadShow;
    await handleShowSelection(pageLoadShow);
  }
}

// Prepare dropdown for all shows 
async function setupShowDropdown() {
  const showSelect = document.getElementById("selectShow");
  const rootElem = document.getElementById("root");

  try {
    const shows = await fetchShows();
    populateShowDropdown(showSelect, shows);

    showSelect.addEventListener("change", async () => {
      const selectedId = showSelect.value;
      if (!selectedId) return;

      await handleShowSelection(selectedId);
    });
  } catch (error) {
    rootElem.innerHTML = "Sorry, could not load shows.";
    console.error("Failed to load shows:", error);
  }
}

// Fetch shows from TVMaze API
async function fetchShows() {
  const response = await fetch("https://api.tvmaze.com/shows");
  if (!response.ok) throw new Error("Failed to fetch shows");
  const shows = await response.json();                      // Check if the response contains episodes
  return shows.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
}

// Populate the dropdown with shows
function populateShowDropdown(dropdown, shows) {
  dropdown.innerHTML = `<option value="">Select a show...</option>`;
  shows.forEach(show => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    dropdown.appendChild(option);
  });
}

// Handle show selection and fetch episodes
async function handleShowSelection(showId) {
  showLoadingMessage();
  clearEpisodeUI();

  // Check if episodes for the selected show are already cached
  try {
    if (!episodesCache[showId]) {
      const response = await fetch(`https://api.tvmaze.com/shows/${showId}/episodes`);
      if (!response.ok) throw new Error("Failed to fetch episodes");          // Handle API Failures Gracefully
      const episodes = await response.json();
      episodesCache[showId] = episodes;                     // Cache episodes for the selected show
    }

    allEpisodes = episodesCache[showId];                    // Store all episodes globally
    removeLoadingMessage();
    renderEpisodesUI(allEpisodes);
  } catch (error) {
    removeLoadingMessage();
    showErrorMessage("⚠️ Failed to load episodes. Please check your connection and try again.");
    console.error("Error loading episodes:", error);
  }
}

// Clear the episode UI before rendering new episodes
function clearEpisodeUI() {
  document.getElementById("searchEpisodes").value = "";
  document.getElementById("selectEpisode").innerHTML = `<option value="all">All episodes</option>`;
  document.getElementById("match-number").textContent = "";
}

// Render episodes UI after fetching episodes
function renderEpisodesUI(episodes) {
  makePageForEpisodes(episodes);
  setupSearch();
  episodeOptions(episodes);
  numberMatchingEpisodes(episodes);
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";
  // rootElem.textContent = `Got ${episodeList.length} episode(s)`;

  const episodeCards = episodeList.map(createEpisodeCard);
  rootElem.append(...episodeCards);
}

// Format season and episode number as two-digit strings and construct the episode code
function formatEpisodeCode(episode) {
  // Moving to global scope for reusability and to avoid repetition (DRY principle)
  const seasonStr = episode.season.toString().padStart(2, "0"); // Convert season to 2-digit string
  const episodeStr = episode.number.toString().padStart(2, "0"); // Convert episode number to 2-digit string
  return "S" + seasonStr + "E" + episodeStr; // Create code like S01E01
}

// Create a card element for one episode
function createEpisodeCard(episode) {
  const episodeCard = document
    .getElementById("episode-card")
    .content.cloneNode(true);

  // Replace the <h1> title element with a clickable link
  const title = episodeCard.querySelector("h2");
  const titleLink = document.createElement("a");
  titleLink.href = episode.url;
  titleLink.textContent = episode.name;
  titleLink.target = "_blank";
  titleLink.rel = "noopener noreferrer";

  title.textContent = ""; // Clear any existing content inside <h2>
  title.appendChild(titleLink); // Changing replaceWith() because swapping to <a> breaks layout so insert link into <h2> for semantic structure

  // Set the different elements within the card element
  episodeCard.querySelector(".episode-code").textContent = formatEpisodeCode(episode); // Distinguish <p> elements with unique class names to avoid extra <p> conflicts
  episodeCard.querySelector("img").src = episode.image?.medium || "error-pic.png";       // Use a fallback image if none is available
  episodeCard.querySelector("img").alt = `Image from ${episode.name}`;
  episodeCard.querySelector(".episode-summary").innerHTML = episode.summary || "No summary available.";

  return episodeCard;
}

// Search functionality: live, case-insensitive search filtering
function setupSearch() {
  const searchEpisodes = document.getElementById("searchEpisodes");
  searchEpisodes.addEventListener("input", filterByKeyword);
}

function filterByKeyword(event) {
  const inputValue = event.target.value.toLowerCase();

  const filteredEpisodes = allEpisodes.filter((episode) => {
    const episodeText = `${episode.name} ${episode.summary}`.toLowerCase();
    return episodeText.includes(inputValue);
  });

  makePageForEpisodes(filteredEpisodes); // Show only filtered episodes on screen
  numberMatchingEpisodes(filteredEpisodes); // Update match count display
}

function numberMatchingEpisodes(filteredEpisodes) {         // Changed the display format for clarity 
  const matchingEpisodes = document.getElementById("match-number");
  matchingEpisodes.textContent = `Displaying ${filteredEpisodes.length} / ${allEpisodes.length} episode(s)`;
}

/*function numberMatchingEpisodes(filteredEpisodes) {
    const matchingEpisodes = document.getElementById("match-number"); // Get element to show match number
    matchingEpisodes.textContent = `${filteredEpisodes.length} Episode(s) found`; // Update text with count
  }
  */

// Fill the dropdown selector with list of episodes
function episodeOptions(episodes) {
  const selector = document.getElementById("selectEpisode");
  selector.innerHTML = `<option value="all">All episodes</option>`; // Add default option to show all episodes

  episodes.forEach((episode) => {
    const option = document.createElement("option"); // Dynamically add one <option> per episode into the dropdown
    option.value = episode.id; // Reference episode by unique object id
    option.textContent = `${formatEpisodeCode(episode)} - ${episode.name}`; // Format as "S01E01 - Title"
    selector.appendChild(option); // Add to episode list dropdown
  });

  selector.addEventListener("change", episodeListDisplay);  // Listener to trigger 'display' function to update page according to user interaction in episode dropdown
}

// Display episode selection
function episodeListDisplay(event) {
  const selectedId = event.target.value; // Grab value of selected <option> in the dropdown.

  if (selectedId === "all") {
    makePageForEpisodes(allEpisodes); // Re-render full list when user selects 'Show all episodes'
    numberMatchingEpisodes(allEpisodes); // Update to reflect full count
  } else {
    const selectedEpisode = allEpisodes.find((ep) => ep.id == selectedId); // Get episode id
    makePageForEpisodes([selectedEpisode]); // Show only the selected episode
    numberMatchingEpisodes([selectedEpisode]); // Update matching count
  }
}

function showLoadingMessage() {
  document.getElementById("root").innerHTML = "<p id='loading'>Loading episodes...</p>";
}

function removeLoadingMessage() {
  const loading = document.getElementById("loading");
  if (loading) loading.remove();
}

function showErrorMessage(message) {
  document.getElementById("root").innerHTML = `<p id="error" style="color: red;">${message}</p>`;
}

window.onload = setup;
