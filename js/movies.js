/* ==========================================================
   KIVUSTREAM MOVIES PAGE
   PART 1
========================================================== */

let allMovies = [];

let filteredMovies = [];

let heroMovie = null;

let visibleMovies = 24;

/* ==========================================================
   START PAGE
========================================================== */

document.addEventListener(

"DOMContentLoaded",

async()=>{

    console.log(

        "Loading Movies Page..."

    );

    await loadMoviesPage();

});

/* ==========================================================
   LOAD PAGE
========================================================== */

async function loadMoviesPage(){

    try{

        await loadNavbar();

        await loadMovies();

        setupSearch();

        setupGenreFilters();

        setupLoadMore();

        setupScrollButton();

    }

    catch(error){

        console.error(

            "Movies Page Error:",

            error

        );

    }

}

/* ==========================================================
   LOAD MOVIES FROM SUPABASE
========================================================== */

async function loadMovies(){

    const {

        data,

        error

    } = await supabaseClient

    .from("movies")

    .select("*")

    .order(

        "created_at",

        {

            ascending:false

        }

    );

    if(error){

        console.error(error);

        return;

    }

    allMovies =

    data || [];

    filteredMovies =

    [...allMovies];

    loadHero();

    loadTrending();

    loadRecent();

    loadTopRated();

    loadMovieGrid();

}

/* ==========================================================
   HERO
========================================================== */

function loadHero(){

    if(allMovies.length===0)

        return;

    heroMovie =

    allMovies[0];

    const backdrop =

        document.getElementById(

            "heroBackdrop"

        );

    const title =

        document.getElementById(

            "heroTitle"

        );

    const desc =

        document.getElementById(

            "heroDescription"

        );

    backdrop.style.backgroundImage =

    `url('${heroMovie.backdrop}')`;

    title.textContent =

        heroMovie.title;

    desc.textContent =

        heroMovie.description ||

        "No description available.";

    document

    .getElementById(

        "heroWatchBtn"

    )

    .onclick=()=>{

        location.href=

        `watch.html?id=${heroMovie.id}`;

    };

    document

    .getElementById(

        "heroInfoBtn"

    )

    .onclick=()=>{

        location.href=

        `watch.html?id=${heroMovie.id}`;

    };

}
/* ==========================================================
   KIVUSTREAM MOVIES PAGE
   PART 2
========================================================== */


/* ==========================================================
   TRENDING
========================================================== */

function loadTrending(){

    const trending =

    [...allMovies]

    .sort((a,b)=>{

        return Number(b.rating || 0)

        -

        Number(a.rating || 0);

    })

    .slice(0,12);

    renderMovieCards(

        trending,

        "trendingMovies"

    );

}


/* ==========================================================
   RECENT
========================================================== */

function loadRecent(){

    const recent =

    [...allMovies]

    .sort(

        (a,b)=>

        new Date(b.created_at)

        -

        new Date(a.created_at)

    )

    .slice(0,12);

    renderMovieCards(

        recent,

        "recentMovies"

    );

}


/* ==========================================================
   TOP RATED
========================================================== */

function loadTopRated(){

    const topRated =

    [...allMovies]

    .sort(

        (a,b)=>

        Number(b.rating || 0)

        -

        Number(a.rating || 0)

    )

    .slice(0,12);

    renderMovieCards(

        topRated,

        "topRatedMovies"

    );

}


/* ==========================================================
   MAIN GRID
========================================================== */

function loadMovieGrid(){

    renderMovieCards(

        filteredMovies.slice(

            0,

            visibleMovies

        ),

        "allMovies"

    );

}


/* ==========================================================
   CARD RENDERER
========================================================== */

function renderMovieCards(

    movies,

    containerID

){

    const container =

    document.getElementById(

        containerID

    );

    if(!container)

        return;

    container.innerHTML = "";

    movies.forEach(movie=>{

        const poster =

        movie.poster ||

        "assets/logo.png";

        const rating =

        movie.rating || "N/A";

        const year =

        movie.year ||

        "";

        container.innerHTML += `

<div
class="movie-card"
onclick="openMovie('${movie.id}')">

<div class="top-tag">

🎬 Movie

</div>

<img
src="${poster}"
loading="lazy"
alt="${movie.title}">

<div class="movie-overlay">

<h3 class="movie-title">

${movie.title}

</h3>

<div class="movie-meta">

<span class="rating">

⭐ ${rating}

</span>

<span>

${year}

</span>

</div>

<div class="badges">

<span class="badge-chip hd">

HD

</span>

<span class="badge-chip k4">

4K

</span>

</div>

<div class="card-buttons">

<button
class="play-btn">

<i class="fa-solid fa-play"></i>

Watch

</button>

<button
class="watchlist-btn">

<i class="fa-solid fa-heart"></i>

</button>

</div>

</div>

</div>

`;

    });

    if(typeof initCards==="function"){

        initCards();

    }

}


/* ==========================================================
   OPEN MOVIE
========================================================== */

function openMovie(id){

    location.href=

    `watch.html?id=${id}&type=movie`;

}
/* ==========================================================
   KIVUSTREAM MOVIES PAGE
   PART 3
========================================================== */


/* ==========================================================
   LIVE SEARCH
========================================================== */

function setupSearch(){

    const input =

    document.getElementById(

        "movieSearch"

    );

    if(!input)

        return;

    input.addEventListener(

        "input",

        ()=>{

            const keyword =

            input.value

            .trim()

            .toLowerCase();

            filteredMovies =

            allMovies.filter(movie=>{

                return(

                    (movie.title || "")

                    .toLowerCase()

                    .includes(keyword)

                    ||

                    (movie.description || "")

                    .toLowerCase()

                    .includes(keyword)

                    ||

                    (movie.category || "")

                    .toLowerCase()

                    .includes(keyword)

                );

            });

            visibleMovies = 24;

            loadMovieGrid();

        }

    );

}


/* ==========================================================
   GENRE FILTERS
========================================================== */

function setupGenreFilters(){

    const buttons =

    document.querySelectorAll(

        ".genre-btn"

    );

    buttons.forEach(btn=>{

        btn.addEventListener(

            "click",

            ()=>{

                buttons.forEach(

                    b=>b.classList.remove(

                        "active"

                    )

                );

                btn.classList.add(

                    "active"

                );

                const genre =

                btn.dataset.genre;

                if(

                    genre === "all"

                ){

                    filteredMovies =

                    [...allMovies];

                }

                else{

                    filteredMovies =

                    allMovies.filter(movie=>{

                        return(

                            movie.category || ""

                        )

                        .toLowerCase()

                        .includes(

                            genre.toLowerCase()

                        );

                    });

                }

                visibleMovies = 24;

                loadMovieGrid();

            }

        );

    });

}


/* ==========================================================
   LOAD MORE
========================================================== */

function setupLoadMore(){

    const button =

    document.getElementById(

        "loadMoreBtn"

    );

    if(!button)

        return;

    button.onclick=()=>{

        visibleMovies += 24;

        loadMovieGrid();

        if(

            visibleMovies >=

            filteredMovies.length

        ){

            button.style.display =

            "none";

        }

    };

}


/* ==========================================================
   SCROLL TO TOP
========================================================== */

function setupScrollButton(){

    const btn =

    document.getElementById(

        "scrollTopBtn"

    );

    if(!btn)

        return;

    window.addEventListener(

        "scroll",

        ()=>{

            if(

                window.scrollY > 400

            ){

                btn.classList.add(

                    "show"

                );

            }

            else{

                btn.classList.remove(

                    "show"

                );

            }

        }

    );

    btn.onclick=()=>{

        window.scrollTo({

            top:0,

            behavior:"smooth"

        });

    };

}


/* ==========================================================
   LOADING SCREEN
========================================================== */

window.addEventListener(

    "load",

    ()=>{

        const loader =

        document.getElementById(

            "loadingScreen"

        );

        if(loader){

            setTimeout(()=>{

                loader.classList.add(

                    "hide"

                );

            },700);

        }

    }

);


/* ==========================================================
   SIMPLE HERO ROTATION
========================================================== */

setInterval(()=>{

    if(

        allMovies.length < 2

    )

        return;

    const index =

    Math.floor(

        Math.random() *

        allMovies.length

    );

    heroMovie =

    allMovies[index];

    document.getElementById(

        "heroBackdrop"

    ).style.backgroundImage =

    `url('${heroMovie.backdrop || heroMovie.poster || "assets/logo.png"}')`;

    document.getElementById(

        "heroTitle"

    ).textContent =

    heroMovie.title;

    document.getElementById(

        "heroDescription"

    ).textContent =

    heroMovie.description ||

    "No description available.";

},12000);


/* ==========================================================
   PAGE READY
========================================================== */

console.log(

    "Movies Page Ready 🎬"

);
