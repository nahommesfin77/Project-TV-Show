function setup() {
  // Fetch episodes from TVMaze API (Game of Thrones = show 82)
  fetch("https://api.tvmaze.com/shows/82/episodes")
    .then((response) => response.json())
    .then((allEpisodes) => {
      makePageForEpisodes(allEpisodes);
      populateEpisodeSelector(allEpisodes);

      // Search functionality
      const searchInput = document.getElementById("search");
      searchInput.addEventListener("input", (event) => {
        const searchTerm = event.target.value.toLowerCase();
        const filteredEpisodes = allEpisodes.filter(
          (ep) =>
            ep.name.toLowerCase().includes(searchTerm) ||
            ep.summary.toLowerCase().includes(searchTerm)
        );
        makePageForEpisodes(filteredEpisodes);
        populateEpisodeSelector(filteredEpisodes);
      });

      // Dropdown functionality
      const selector = document.getElementById("episode-selector");
      selector.addEventListener("change", (event) => {
        const selectedId = event.target.value;
        if (selectedId === "") {
          makePageForEpisodes(allEpisodes);
        } else {
          const selectedEpisode = allEpisodes.find(
            (ep) => ep.id === Number(selectedId)
          );
          makePageForEpisodes([selectedEpisode]);
        }
      });
    })
    .catch((error) => {
      console.error("Error fetching episodes:", error);
      document.getElementById("root").textContent =
        "Failed to load episodes. Please try again later.";
    });
}

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

  // Footer credit
  const footer = document.createElement("p");
  footer.innerHTML = `Data provided by <a href="https://www.tvmaze.com/" target="_blank">TVMaze.com</a>`;
  rootElem.appendChild(footer);

  // Update episode count
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
    option.value = ep.id; // use unique episode ID from API
    option.textContent = `${ep.name} (S${seasonCode}E${numberCode})`;
    selector.appendChild(option);
  });
}

window.onload = setup;
