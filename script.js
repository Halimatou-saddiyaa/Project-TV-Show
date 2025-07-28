let allEpisodes = [];                                                                       // Global episode storage
let keywordSearch;                                                                          // Search input element reference

function setup() {
  allEpisodes = getAllEpisodes();                                                           // 'const' not needed as 'allEpisodes' now declared globally to manage shared data across functions 
  makePageForEpisodes(allEpisodes);
  setupSearch();                                                                            // Enable live keyword search                    
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";
  // rootElem.textContent = `Got ${episodeList.length} episode(s)`;

  const episodeCards = episodeList.map(createEpisodeCard);
  rootElem.append(...episodeCards);
}
// Create a card element for one episode
function createEpisodeCard(episode) {
  const episodeCard = document
    .getElementById("episode-card")
    .content.cloneNode(true);

  // Format season and episode number as two-digit strings and construct the episode code
  let seasonStr = episode.season.toString().padStart(2, "0");
  let episodeStr = episode.number.toString().padStart(2, "0");
  let episodeCode = "S" + seasonStr + "E" + episodeStr;

  // Replace the <h1> title element with a clickable link
  const title = episodeCard.querySelector("h2");                   
  const titleLink = document.createElement("a");
  titleLink.href = episode.url;
  titleLink.textContent = episode.name;
  titleLink.target = "_blank";
  titleLink.rel = "noopener noreferrer";
  title.replaceWith(titleLink);

  // Set the different elements within the card element
  episodeCard.querySelector("p").textContent = episodeCode;       
  episodeCard.querySelector("img").src = episode.image?.medium;
  episodeCard.querySelector("img").alt = `Image from ${episode.name}`;
  episodeCard.querySelector("p").innerHTML = episode.summary;

  return episodeCard;
}

// Search functionality: live, case-insensitive search filtering 
function setupSearch() {
  const searchEpisodes = document.getElementById("searchEpisodes");                         // Get the search input field
  searchEpisodes.addEventListener("input", filterByKeyword);                                // Trigger filter function on every keypress
}

function filterByKeyword(event) {
  const inputValue = event.target.value.toLowerCase();                                      // Get typed input and make lowercase for matching

  const filteredEpisodes = allEpisodes.filter((episode) => {                                // Filter all episodes based on input
    const episodeText = `${episode.name} ${episode.summary}`.toLowerCase();                 // Combine name + summary, lowercase
    return episodeText.includes(inputValue);                                                // Return true if input is found in episode text
  });

  makePageForEpisodes(filteredEpisodes);                                                    // Show only filtered episodes on screen
  numberMatchingEpisodes(filteredEpisodes);                                                 // Update match count display
}

function numberMatchingEpisodes(filteredEpisodes) {
  const matchingEpisodes = document.getElementById("match-number");                         // Get element to show match number
  matchingEpisodes.textContent = `${filteredEpisodes.length} Episode(s) found`;             // Update text with count
}

window.onload = setup;
