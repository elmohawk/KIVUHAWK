/* ==========================================================
   KIVUSTREAM WATCH PAGE
   CORE LOADER
========================================================== */

const params = new URLSearchParams(window.location.search);

const CONTENT_ID = params.get("id");

if (!CONTENT_ID) {

    window.location.href = "index.html";

}

/* ==========================================
   Elements
========================================== */

const backdrop = document.getElementById("backdrop");
const poster = document.getElementById("poster");
const title = document.getElementById("title");
const overview = document.getElementById("overview");
const rating = document.getElementById("rating");
const runtime = document.getElementById("runtime");
const year = document.getElementById("year");
const genres = document.getElementById("genres");
const typeBadge = document.getElementById("typeBadge");

const player = document.getElementById("videoPlayer");

const seriesSection =
document.getElementById("seriesSection");

let currentContent = null;

/* ==========================================
   Load Content
========================================== */

document.addEventListener("DOMContentLoaded", init);

async function init() {

    try {

        currentContent = await loadContent();

        if (!currentContent) {

            showError();

            return;

        }

        renderContent(currentContent);

        await enrichTMDB(currentContent);

        if (currentContent.type === "series") {

            seriesSection.style.display = "block";

            await loadEpisodes(currentContent.id);

        } else {

            seriesSection.style.display = "none";

        }

    } catch (err) {

        console.error(err);

        showError();

    }

}

/* ==========================================
   Load Movie / Series
========================================== */

async function loadContent() {

    let { data } = await supabaseClient

        .from("movies")

        .select("*")

        .eq("id", CONTENT_ID)

        .maybeSingle();

    if (data) {

        data.type = "movie";

        return data;

    }

    let result = await supabaseClient

        .from("series")

        .select("*")

        .eq("id", CONTENT_ID)

        .maybeSingle();

    if (result.data) {

        result.data.type = "series";

        return result.data;

    }

    return null;

}

/* ==========================================
   Render
========================================== */

function renderContent(movie) {

    title.textContent = movie.title;

    overview.textContent = movie.description || "";

    poster.src = movie.poster;

    backdrop.style.backgroundImage =
        `url('${movie.backdrop || movie.poster}')`;

    rating.textContent =
        "⭐ " + (movie.rating || "N/A");

    year.textContent =
        movie.year || "";

    runtime.textContent =
        movie.runtime
            ? movie.runtime + " min"
            : "";

    typeBadge.textContent =
        movie.type.toUpperCase();

    if (movie.video_url) {

        player.src = movie.video_url;

    }

}

/* ==========================================
   TMDB
========================================== */

async function enrichTMDB(movie) {

    if (!movie.tmdb_id) return;

    const details =
        await getTMDBDetails(
            movie.tmdb_id,
            movie.type
        );

    if (!details) return;

    if (details.backdrop_path) {

        backdrop.style.backgroundImage =
            `url(https://image.tmdb.org/t/p/original${details.backdrop_path})`;

    }

    if (details.runtime) {

        runtime.textContent =
            details.runtime + " min";

    }

    if (details.genres) {

        genres.innerHTML = "";

        details.genres.forEach(g => {

            genres.innerHTML +=
                `<span>${g.name}</span>`;

        });

    }

}

/* ==========================================
   Episodes
========================================== */

async function loadEpisodes(seriesID) {

    const { data } =
        await supabaseClient

        .from("episodes")

        .select("*")

        .eq("series_id", seriesID)

        .order("episode");

    renderEpisodes(data || []);

}

/* ==========================================
   Episode Renderer
========================================== */

function renderEpisodes(list) {

    const container =
        document.getElementById(
            "episodesContainer"
        );

    container.innerHTML = "";

    list.forEach(ep => {

        container.innerHTML += `

<div class="episode-card">

<div class="episode-thumb">

<img src="${ep.thumbnail}">

<div class="play-overlay">

<i class="fa-solid fa-play"></i>

</div>

<div class="episode-number">

EP ${ep.episode}

</div>

</div>

<div class="episode-info">

<h3>${ep.title}</h3>

<p>${ep.description || ""}</p>

</div>

</div>

`;

    });

}

/* ==========================================
   Error
========================================== */

function showError() {

    document.body.innerHTML = `

<div class="empty-state">

<h2>Content Not Found</h2>

<p>This movie or series does not exist.</p>

<a href="index.html">

Go Home

</a>

</div>

`;

}
