/* ===========================================
   KIVUSTREAM TMDB API
=========================================== */

const endpoints = {
    trending: `${TMDB_BASE}/trending/movie/week?api_key=${TMDB_API_KEY}`,
    popular: `${TMDB_BASE}/movie/popular?api_key=${TMDB_API_KEY}`,
    tv: `${TMDB_BASE}/tv/popular?api_key=${TMDB_API_KEY}`
};

/* ------------------------------
   Generic Fetch
--------------------------------*/

async function fetchTMDB(url){

    try{

        const response = await fetch(url);

        if(!response.ok){
            throw new Error("Failed to fetch TMDB data");
        }

        const data = await response.json();

        return data.results;

    }catch(err){

        console.error(err);

        return [];

    }

}

/* ------------------------------
   Hero Banner
--------------------------------*/

async function loadHero(){

    const movies = await fetchTMDB(endpoints.trending);

    if(!movies.length) return;

    const movie = movies[Math.floor(Math.random()*movies.length)];

    document.querySelector(".hero").style.backgroundImage =
        `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`;

    document.getElementById("heroTitle").textContent =
        movie.title;

    document.getElementById("heroOverview").textContent =
        movie.overview;

}

/* ------------------------------
   Movie Card
--------------------------------*/

function movieCard(movie){

    return `

    <div class="movie-card">

        <img src="${IMAGE_BASE}${movie.poster_path}"
             alt="${movie.title || movie.name}">

        <div class="movie-info">

            <h3>${movie.title || movie.name}</h3>

            <div class="movie-meta">

                <span class="rating">

                    ⭐ ${movie.vote_average.toFixed(1)}

                </span>

                <span>

                    ${(movie.release_date || movie.first_air_date || "").slice(0,4)}

                </span>

            </div>

            <div class="translator-tag">

                KivuStream

            </div>

        </div>

    </div>

    `;

}

/* ------------------------------
   Render Section
--------------------------------*/

async function renderSection(endpoint, containerID){

    const container =
        document.getElementById(containerID);

    const movies =
        await fetchTMDB(endpoint);

    container.innerHTML =
        movies.map(movieCard).join("");

}

/* ------------------------------
   Home Loader
--------------------------------*/

async function loadHome(){

    await loadHero();

    renderSection(
        endpoints.trending,
        "trendingMovies"
    );

    renderSection(
        endpoints.popular,
        "popularMovies"
    );

    renderSection(
        endpoints.tv,
        "tvShows"
    );

}
