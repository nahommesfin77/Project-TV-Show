//You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.textContent = "";
  
 episodeList.forEach(episode => {
    // Create container div for each episode
    const episodeDiv = document.createElement("div");
    episodeDiv.className = "episode-card";
 }
