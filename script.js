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
 
        // Create episode code S02E07 style
    const seasonCode = String(episode.season).padStart(2, "0");
    const numberCode = String(episode.number).padStart(2, "0");
    const episodeCode = `S${seasonCode}E${numberCode}`;
 
    // Episode title
    const title = document.createElement("h2");
    title.textContent = `${episode.name} (${episodeCode})`;

    // Episode image
    const img = document.createElement("img");
    img.src = episode.image.medium;
    img.alt = `${episode.name} image`;

    // Episode summary
    const summary = document.createElement("div");
    summary.innerHTML = episode.summary;

    // TVMaze link
    const link = document.createElement("a");
    link.href = episode.url;
    link.textContent = "View on TVMaze";
    link.target = "_blank";