function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
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
  const title = episodeCard.querySelector("h2");                   // Editing selector to match html element identifier 
  const titleLink = document.createElement("a");
  titleLink.href = episode.url;
  titleLink.textContent = episode.name;
  titleLink.target = "_blank";
  titleLink.rel = "noopener noreferrer";
  title.replaceWith(titleLink);

  // Set the different elements within the card element
  episodeCard.querySelector("p").textContent = episodeCode;       // Selector was <h2>
  episodeCard.querySelector("img").src = episode.image?.medium;
  episodeCard.querySelector("img").alt = `Image from ${episode.name}`;
  episodeCard.querySelector("p").innerHTML = episode.summary;

  return episodeCard;
}

window.onload = setup;
