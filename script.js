
let allShows = window.showList || [];
let episodesCache = window.episodesCache || {};
let currentEpisodes = [];
let inShowsView = true;

// helpers
function pad2(n){ return String(n).padStart(2, '0'); }
function stripHtml(s){ return s ? s.replace(/<[^>]+>/g, '') : ''; }
function truncateText(s, max=120){ const t = stripHtml(s||''); return t.length>max ? t.slice(0,max).trim() + '...' : t; }
function debounce(fn, wait=250){ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a), wait); }; }

// on load
window.onload = init;

function init(){
  wireControls();
  loadShows();
}

function wireControls(){
  const showSel = document.getElementById('show-selector');
  const search = document.getElementById('search');
  const clearBtn = document.getElementById('clear-search');
  const epSel = document.getElementById('episode-selector');
  const backBtn = document.getElementById('back-to-shows');

  // wire show selector change (when user picks from select)
  showSel.onchange = () => {
    const id = Number(showSel.value);
    if (id) loadEpisodes(id);
  };

  // debounced search that adapts to current view
  const onSearch = debounce(()=>{
    const term = search.value.trim().toLowerCase();
    clearBtn.hidden = !term;
    if (inShowsView) {
      const filtered = allShows.filter(s =>
        s.name.toLowerCase().includes(term) ||
        stripHtml(s.summary || '').toLowerCase().includes(term) ||
        (s.genres || []).join(' ').toLowerCase().includes(term)
      );
      displayShows(filtered);
    } else {
      const filtered = currentEpisodes.filter(e =>
        e.name.toLowerCase().includes(term) ||
        stripHtml(e.summary || '').toLowerCase().includes(term)
      );
      populateEpisodeSelector(filtered);
      displayEpisodes(filtered);
    }
  }, 220);

  search.addEventListener('input', onSearch);
  clearBtn.addEventListener('click', ()=>{
    search.value = '';
    clearBtn.hidden = true;
    search.dispatchEvent(new Event('input'));
    search.focus();
  });

  // episode selector
  epSel.onchange = () => {
    const id = epSel.value;
    if (!id) {
      displayEpisodes(currentEpisodes);
    } else {
      const ep = currentEpisodes.find(x => String(x.id) === String(id));
      if (ep) displayEpisodes([ep]);
    }
  };

  // back button to shows listing
  backBtn.onclick = () => {
    inShowsView = true;
    document.getElementById('back-to-shows').classList.add('hidden');
    document.getElementById('episode-selector').classList.remove('visible');
    document.getElementById('title').querySelector('h1').textContent = 'TV SHOW PROJECT';
    displayShows(allShows);
  };
}

/* Fetch shows once per visit */
async function loadShows(){
  const root = document.getElementById('root');
  root.innerHTML = '<p class="muted">Loading shows…</p>';
  if (allShows && allShows.length) {
    populateShowSelector(allShows);
    displayShows(allShows);
    return;
  }
  try {
    const res = await fetch('https://api.tvmaze.com/shows');
    const shows = await res.json();
    allShows = shows.sort((a,b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
    populateShowSelector(allShows);
    displayShows(allShows);
    
    window.showList = allShows;
  } catch (err) {
    console.error(err);
    root.innerHTML = '<p class="muted">Failed to load shows. Try again later.</p>';
  }
}

function populateShowSelector(list){
  const sel = document.getElementById('show-selector');
  sel.innerHTML = '<option value="">-- Select a show --</option>';
  list.forEach(s => {
    const o = document.createElement('option');
    o.value = s.id;
    o.textContent = s.name;
    sel.appendChild(o);
  });
}

/* Shows listing (front page) */
function displayShows(list){
  inShowsView = true;
  const root = document.getElementById('root');
  root.innerHTML = '';
  if (!list || list.length === 0) {
    root.innerHTML = '<p class="muted">No shows found.</p>';
    document.getElementById('episode-count').textContent = '';
    return;
  }

  list.forEach(show => {
    const card = document.createElement('div');
    card.className = 'show-card';

    const title = document.createElement('h2');
    title.textContent = show.name;
    
    title.addEventListener('click', () => loadEpisodes(show.id, show.name));
    title.addEventListener('keypress', (e) => { if (e.key === 'Enter') loadEpisodes(show.id, show.name); });
    title.tabIndex = 0;

    const img = document.createElement('img');
    img.src = show.image?.medium || '';
    img.alt = show.name;

    const summary = document.createElement('div');
    summary.className = 'summary';
    summary.textContent = truncateText(show.summary, 140);

    const info = document.createElement('div');
    info.className = 'show-info';
    
    const genresHtml = (show.genres || []).slice(0,4).map(g => `<span class="genre-chip">${g}</span>`).join(' ');
    info.innerHTML = `
      ${genresHtml}
      <span class="badge">Status: ${show.status || 'N/A'}</span>
      <span class="badge">Rating: ${show.rating?.average ?? 'N/A'}</span>
      <span class="badge">Runtime: ${show.runtime ?? 'N/A'}m</span>
    `;

    card.appendChild(title);
    card.appendChild(img);
    card.appendChild(summary);
    card.appendChild(info);
    root.appendChild(card);
  });

  document.getElementById('episode-count').textContent = `${list.length} show(s)`;
  // hide episode selector & back button in shows view
  document.getElementById('episode-selector').classList.remove('visible');
  document.getElementById('back-to-shows').classList.add('hidden');
}

/* Load episodes for a show (cached) */
async function loadEpisodes(showId, showName=''){
  inShowsView = false;
  const root = document.getElementById('root');
  document.getElementById('back-to-shows').classList.remove('hidden');
  document.getElementById('title').querySelector('h1').textContent = showName || 'Episodes';
  // reset search input
  document.getElementById('search').value = '';
  document.getElementById('clear-search').hidden = true;

  if (episodesCache[showId]) {
    currentEpisodes = episodesCache[showId];
    updateEpisodeView(currentEpisodes);
    return;
  }

  root.innerHTML = '<p class="muted">Loading episodes…</p>';
  try {
    const res = await fetch(`https://api.tvmaze.com/shows/${showId}/episodes`);
    const episodes = await res.json();
    episodesCache[showId] = episodes;
    currentEpisodes = episodes;
    updateEpisodeView(episodes);
    // store globally too
    window.episodesCache = episodesCache;
  } catch (err) {
    console.error(err);
    root.innerHTML = '<p class="muted">Failed to load episodes. Try again later.</p>';
  }
}

/* Update episode view and wire search/selector */
function updateEpisodeView(list) {
  populateEpisodeSelector(list);
  displayEpisodes(list);

  const search = document.getElementById('search');
  const epSel = document.getElementById('episode-selector');

  // debounced search for episodes
  const onSearchEp = debounce(()=>{
    const term = search.value.trim().toLowerCase();
    if (!term) {
      populateEpisodeSelector(currentEpisodes);
      displayEpisodes(currentEpisodes);
      return;
    }
    const filtered = currentEpisodes.filter(e =>
      e.name.toLowerCase().includes(term) ||
      stripHtml(e.summary || '').toLowerCase().includes(term)
    );
    populateEpisodeSelector(filtered);
    displayEpisodes(filtered);
  }, 220);

  search.oninput = onSearchEp;

  epSel.onchange = () => {
    const id = epSel.value;
    if (!id) {
      displayEpisodes(currentEpisodes);
    } else {
      const ep = currentEpisodes.find(x => String(x.id) === String(id));
      if (ep) displayEpisodes([ep]);
    }
  };

  // ensure episode selector visible and back button shown
  document.getElementById('episode-selector').classList.add('visible');
  document.getElementById('back-to-shows').classList.remove('hidden');
}

/* Render episodes */
function displayEpisodes(list){
  const root = document.getElementById('root');
  root.innerHTML = '';
  if (!list || list.length === 0) {
    root.innerHTML = '<p class="muted">No episodes to display.</p>';
    document.getElementById('episode-count').textContent = '0 episode(s)';
    return;
  }

  list.forEach(ep => {
    const code = `S${pad2(ep.season)}E${pad2(ep.number)}`;
    const card = document.createElement('div');
    card.className = 'episode-card';

    const title = document.createElement('h2');
    title.textContent = `${ep.name} (${code})`;

    const img = document.createElement('img');
    img.src = ep.image?.medium || '';
    img.alt = ep.name;

    const summary = document.createElement('div');
    summary.className = 'summary';
    summary.textContent = truncateText(ep.summary, 140);

    const link = document.createElement('a');
    link.href = ep.url;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = 'View on TVMaze';

    card.appendChild(title);
    card.appendChild(img);
    card.appendChild(summary);
    card.appendChild(link);
    root.appendChild(card);
  });

  document.getElementById('episode-count').textContent = `Showing ${list.length} episode(s)`;
}

/* populate episode selector */
function populateEpisodeSelector(list){
  const sel = document.getElementById('episode-selector');
  sel.innerHTML = '<option value="">-- All Episodes --</option>';
  list.forEach(ep => {
    const code = `S${pad2(ep.season)}E${pad2(ep.number)}`;
    const o = document.createElement('option');
    o.value = ep.id;
    o.textContent = `${ep.name} (${code})`;
    sel.appendChild(o);
  });
}
