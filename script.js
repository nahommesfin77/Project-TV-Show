let allShows = [];
let episodesCache = {}; // store episodes per show id
let currentEpisodes = [];

function setup() {
  const rootElem = document.getElementById("root");

  // Fetch list of all shows
  fetch("https://api.tvmaze.com/shows")
    .then((response) => response.json())
    .then((shows) => {
      allShows = shows.sort((a, b) =>
        a.name.toLowerCase().localeCompare(b.name.toLowerCase())
      );
      populateShowSelector(allShows);

      // Initially load Game of Thrones (id = 82)
      loadEpisodes(82);
    })
    .catch((error) => {
      console.error("Error fetching shows:", error);
      rootElem.textContent = "Failed to load shows. Please try again later.";
    });
}

// Populate show dropdown
function populateShowSelector(shows) {
  const showSelector = document.createElement("select");
  showSelector.id = "show-selector";

  shows.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    showSelector.appendChild(option);
  });

  // Insert the show selector above the existing controls
  const controls = document.querySelector(".controls");
  controls.insertBefore(showSelector, controls.firstChild);

  // Listen for show change
  showSelector.addEventListener("change", (event) => {
    const selectedShowId = Number(event.target.value);
    loadEpisodes(selectedShowId);
  });
}

// Load episodes for a given show
function loadEpisodes(showId) {
  const rootElem = document.getElementById("root");

  if (episodesCache[showId]) {
    currentEpisodes = episodesCache[showId];
    updateEpisodeView(currentEpisodes);
    return;
  }

  fetch(`https://api.tvmaze.com/shows/${showId}/episodes`)
    .then((response) => response.json())
    .then((episodes) => {
      episodesCache[showId] = episodes;
      currentEpisodes = episodes;
      updateEpisodeView(currentEpisodes);
    })
    .catch((error) => {
      console.error("Error fetching episodes:", error);
      rootElem.textContent = "Failed to load episodes. Please try again later.";
    });
}

// Update episode view and set up search & episode selector
function updateEpisodeView(episodeList) {
  makePageForEpisodes(episodeList);
  populateEpisodeSelector(episodeList);

  // Search functionality
  const searchInput = document.getElementById("search");
  searchInput.oninput = (event) => {
    const searchTerm = event.target.value.toLowerCase();
    const filteredEpisodes = currentEpisodes.filter(
      (ep) =>
        ep.name.toLowerCase().includes(searchTerm) ||
        ep.summary.toLowerCase().includes(searchTerm)
    );
    makePageForEpisodes(filteredEpisodes);
    populateEpisodeSelector(filteredEpisodes);
  };

  // Episode dropdown functionality
  const selector = document.getElementById("episode-selector");
  selector.onchange = (event) => {
    const selectedId = event.target.value;
    if (selectedId === "") {
      makePageForEpisodes(currentEpisodes);
    } else {
      const selectedEpisode = currentEpisodes.find(
        (ep) => ep.id === Number(selectedId)
      );
      makePageForEpisodes([selectedEpisode]);
    }
  };
}

// Existing functions remain unchanged
function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.textContent = "";

  episodeList.forEach((episode) => {
    const episodeDiv = document.createElement("div");
    episodeDiv.className = "episode-card";

    const seasonCode = String(episode.season).padStart(2, "0");
    const numberCode = String(episode.number).padStart(2, "0");
    const episodeCode = `S${seasonCode}E${numberCode}`;

    const title = document.createElement("h2");
    title.textContent = `${episode.name} (${episodeCode})`;

    const img = document.createElement("img");
    img.src = episode.image?.medium || "";
    img.alt = `${episode.name} image`;

    const summary = document.createElement("div");
    summary.innerHTML = episode.summary || "No summary available.";

    const link = document.createElement("a");
    link.href = episode.url;
    link.textContent = "View on TVMaze";
    link.target = "_blank";

    episodeDiv.appendChild(title);
    episodeDiv.appendChild(img);
    episodeDiv.appendChild(summary);
    episodeDiv.appendChild(link);

    rootElem.appendChild(episodeDiv);
  });

  const footer = document.createElement("p");
  footer.innerHTML = `Data provided by <a href="https://www.tvmaze.com/" target="_blank">TVMaze.com</a>`;
  rootElem.appendChild(footer);

  const episodeCountElem = document.getElementById("episode-count");
  episodeCountElem.textContent = `Showing ${episodeList.length} episode(s)`;
}

function populateEpisodeSelector(episodeList) {
  const selector = document.getElementById("episode-selector");
  selector.innerHTML = `<option value="">-- All Episodes --</option>`;
  episodeList.forEach((ep) => {
    const seasonCode = String(ep.season).padStart(2, "0");
    const numberCode = String(ep.number).padStart(2, "0");
    const option = document.createElement("option");
    option.value = ep.id;
    option.textContent = `${ep.name} (S${seasonCode}E${numberCode})`;
    selector.appendChild(option);
  });
}

window.onload = setup;
