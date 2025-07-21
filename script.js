//You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";
  //rootElem.textContent = `Got ${episodeList.length} episode(s)`;

  const episodeCards = episodeList.map(createEpisodeCard);

  rootElem.append(...episodeCards);
}

function createEpisodeCard(episode) {
  const episodeCard = document
    .getElementById("episode-card")
    .content.cloneNode(true);

  let seasonStr = episode.season.toString().padStart(2, "0");
  let episodeStr = episode.number.toString().padStart(2, "0");
  let episodeCode = "S" + seasonStr + "E" + episodeStr;

  const title = episodeCard.querySelector("h1");
  const titleLink = document.createElement("a");
  titleLink.href = episode.url;
  titleLink.textContent = episode.name;
  titleLink.target = "_blank";
  titleLink.rel = "noopener noreferrer";
  title.replaceWith(titleLink);

  episodeCard.querySelector("h2").textContent = episodeCode;
  episodeCard.querySelector("img").src = episode.image?.medium;
  episodeCard.querySelector("img").alt = `Image from ${episode.name}`;
  episodeCard.querySelector("p").innerHTML = episode.summary;

  return episodeCard;
}

window.onload = setup;
