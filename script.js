let allEpisodes = [];

function setup() {
  allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
  setupSearch();
  episodeOptions(allEpisodes);                                                              // Fill dropdown with episodes
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";
  // rootElem.textContent = `Got ${episodeList.length} episode(s)`;

  const episodeCards = episodeList.map(createEpisodeCard);
  rootElem.append(...episodeCards);
}

// Format season and episode number as two-digit strings and construct the episode code
function formatEpisodeCode(episode) {                                                        // Moving to global scope for reusability and to avoid repetition (DRY principle) 
  const seasonStr = episode.season.toString().padStart(2, "0");                              // Convert season to 2-digit string
  const episodeStr = episode.number.toString().padStart(2, "0");                             // Convert episode number to 2-digit string
  return "S" + seasonStr + "E" + episodeStr;                                                 // Create code like S01E01
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

  title.textContent = "";                                                                     // Clear any existing content inside <h2>
  title.appendChild(titleLink);                                                               // Changing replaceWith() because swapping to <a> breaks layout so insert link into <h2> for semantic structure                                                  

  // Set the different elements within the card element
  episodeCard.querySelector(".episode-code").textContent = formatEpisodeCode(episode);        // Distinguish <p> elements with unique class names to avoid extra <p> conflicts       
  episodeCard.querySelector("img").src = episode.image?.medium;
  episodeCard.querySelector("img").alt = `Image from ${episode.name}`;
  episodeCard.querySelector(".episode-summary").innerHTML = episode.summary;

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

  makePageForEpisodes(filteredEpisodes);                                                    // Show only filtered episodes on screen
  numberMatchingEpisodes(filteredEpisodes);                                                 // Update match count display
}

function numberMatchingEpisodes(filteredEpisodes) {
  const matchingEpisodes = document.getElementById("match-number");                         // Get element to show match number
  matchingEpisodes.textContent = `${filteredEpisodes.length} Episode(s) found`;             // Update text with count
}

// Fill the dropdown selector with list of episodes
function episodeOptions(episodes) {
  const selector = document.getElementById("selectEpisode");

  episodes.forEach((episode, index) => {
    const episodeCode = formatEpisodeCode(episode);
    const option = document.createElement("option");                                         // Dynamically add one <option> per episode into the dropdown

    option.value = episode.id;                                                               // Reference episode by unique object id
    option.textContent = `${episodeCode} - ${episode.name}`;                                 // Format as "S01E01 - Title"
    selector.appendChild(option);                                                            // Add to episode list dropdown
  });

  selector.addEventListener("change", episodeListDisplay);                                   // Listener to trigger 'display' function to update page according to user interaction in episode dropdown 
}

// Display episode selection
function episodeListDisplay(event) {
  const selectedId = event.target.value;                                                     // Grab value of selected <option> in the dropdown.

  if (selectedId === "all") {
    makePageForEpisodes(allEpisodes);                                                        // Re-render full list when user selects 'Show all episodes'
    numberMatchingEpisodes(allEpisodes);                                                     // Update to reflect full count
  } else {
    const selectedEpisode = allEpisodes.find(ep => ep.id == selectedId);                     // Get episode id
    makePageForEpisodes([selectedEpisode]);                                                  // Show only the selected episode
    numberMatchingEpisodes([selectedEpisode]);                                               // Update matching count
  }
}
window.onload = setup;
