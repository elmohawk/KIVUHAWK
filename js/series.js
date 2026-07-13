/* ==========================================================
   KIVUSTREAM SERIES PAGE
   PART 1
========================================================== */

let allSeries = [];

let filteredSeries = [];

let heroSeries = null;

let visibleSeries = 24;

/* ==========================================================
   START PAGE
========================================================== */

document.addEventListener(

    "DOMContentLoaded",

    async()=>{

        console.log(

            "Loading Series Page..."

        );

        await loadSeriesPage();

    }

);

/* ==========================================================
   LOAD PAGE
========================================================== */

async function loadSeriesPage(){

    try{

        if(typeof loadNavbar === "function"){

            await loadNavbar();

        }

        await loadSeries();

        setupSearch();

        setupGenreFilters();

        setupLoadMore();

        setupScrollButton();

    }

    catch(error){

        console.error(

            "Series Page Error:",

            error

        );

    }

}

/* ==========================================================
   LOAD SERIES FROM SUPABASE
========================================================== */

async function loadSeries(){

    const {

        data,

        error

    } = await supabaseClient

    .from("series")

    .select("*")

    .order(

        "created_at",

        {

            ascending:false

        }

    );

    if(error){

        console.error(

            "Supabase:",

            error

        );

        return;

    }

    allSeries =

    data || [];

    filteredSeries =

    [...allSeries];

    loadHero();

    loadTrending();

    loadRecent();

    loadTopRated();

    loadLatestEpisodes();

    loadSeriesGrid();

}

/* ==========================================================
   HERO
========================================================== */

function loadHero(){

    if(

        allSeries.length===0

    )

        return;

    heroSeries =

    allSeries[0];

    document

    .getElementById(

        "heroBackdrop"

    )

    .style.backgroundImage =

    `url('${heroSeries.backdrop || heroSeries.poster}')`;

    document

    .getElementById(

        "heroTitle"

    )

    .textContent =

    heroSeries.title;

    document

    .getElementById(

        "heroDescription"

    )

    .textContent =

    heroSeries.description ||

    "No description available.";

    document

    .getElementById(

        "heroWatchBtn"

    )

    .onclick=()=>{

        location.href=

        `watch.html?id=${heroSeries.id}&type=series`;

    };

    document

    .getElementById(

        "heroInfoBtn"

    )

    .onclick=()=>{

        location.href=

        `watch.html?id=${heroSeries.id}&type=series`;

    };

}
/* ==========================================================
   KIVUSTREAM SERIES PAGE
   PART 2
========================================================== */


/* ==========================================================
   TRENDING SERIES
========================================================== */

function loadTrending(){

    const trending =

    [...allSeries]

    .sort(

        (a,b)=>

        Number(b.rating || 0)

        -

        Number(a.rating || 0)

    )

    .slice(0,12);

    renderSeriesCards(

        trending,

        "trendingSeries"

    );

}


/* ==========================================================
   RECENT SERIES
========================================================== */

function loadRecent(){

    const recent =

    [...allSeries]

    .sort(

        (a,b)=>

        new Date(b.created_at)

        -

        new Date(a.created_at)

    )

    .slice(0,12);

    renderSeriesCards(

        recent,

        "recentSeries"

    );

}


/* ==========================================================
   TOP RATED
========================================================== */

function loadTopRated(){

    const topRated =

    [...allSeries]

    .sort(

        (a,b)=>

        Number(b.rating || 0)

        -

        Number(a.rating || 0)

    )

    .slice(0,12);

    renderSeriesCards(

        topRated,

        "topRatedSeries"

    );

}


/* ==========================================================
   LATEST EPISODES
========================================================== */

function loadLatestEpisodes(){

    const latest =

    [...allSeries]

    .sort(

        (a,b)=>

        new Date(b.updated_at || b.created_at)

        -

        new Date(a.updated_at || a.created_at)

    )

    .slice(0,12);

    renderSeriesCards(

        latest,

        "latestEpisodes"

    );

}


/* ==========================================================
   ALL SERIES
========================================================== */

function loadSeriesGrid(){

    renderSeriesCards(

        filteredSeries.slice(

            0,

            visibleSeries

        ),

        "allSeries"

    );

}


/* ==========================================================
   CARD RENDERER
========================================================== */

function renderSeriesCards(

    series,

    containerID

){

    const container =

    document.getElementById(

        containerID

    );

    if(!container)

        return;

    container.innerHTML = "";

    series.forEach(show=>{

        const poster =

            show.poster ||

            "assets/logo.png";

        const rating =

            show.rating || "N/A";

        const year =

            show.year || "";

        const seasons =

            show.seasons || 1;

        const episodes =

            show.episodes || "?";

        container.innerHTML += `

<div
class="movie-card"
onclick="openSeries('${show.id}')">

<div class="top-tag">

📺 Series

</div>

<img
src="${poster}"
loading="lazy"
alt="${show.title}">

<div class="movie-overlay">

<h3 class="movie-title">

${show.title}

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

${seasons} Season${seasons>1?"s":""}

</span>

<span class="badge-chip k4">

${episodes} Ep

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
   OPEN SERIES
========================================================== */

function openSeries(id){

    location.href =

    `watch.html?id=${id}&type=series`;

}
/* ==========================================================
   KIVUSTREAM SERIES PAGE
   PART 3
========================================================== */


/* ==========================================================
   LIVE SEARCH
========================================================== */

function setupSearch(){

    const input =

    document.getElementById(

        "seriesSearch"

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

            filteredSeries =

            allSeries.filter(show=>{

                return(

                    (show.title || "")

                    .toLowerCase()

                    .includes(keyword)

                    ||

                    (show.description || "")

                    .toLowerCase()

                    .includes(keyword)

                    ||

                    (show.category || "")

                    .toLowerCase()

                    .includes(keyword)

                );

            });

            visibleSeries = 24;

            loadSeriesGrid();

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

        btn.onclick=()=>{

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

                genre==="all"

            ){

                filteredSeries=[

                    ...allSeries

                ];

            }

            else{

                filteredSeries=

                allSeries.filter(show=>{

                    return(

                        show.category || ""

                    )

                    .toLowerCase()

                    .includes(

                        genre.toLowerCase()

                    );

                });

            }

            visibleSeries = 24;

            loadSeriesGrid();

        };

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

        visibleSeries += 24;

        loadSeriesGrid();

        if(

            visibleSeries >=

            filteredSeries.length

        ){

            button.style.display="none";

        }

    };

}


/* ==========================================================
   SCROLL TO TOP
========================================================== */

function setupScrollButton(){

    const button =

    document.getElementById(

        "scrollTopBtn"

    );

    if(!button)

        return;

    window.addEventListener(

        "scroll",

        ()=>{

            if(

                window.scrollY > 400

            ){

                button.classList.add(

                    "show"

                );

            }

            else{

                button.classList.remove(

                    "show"

                );

            }

        }

    );

    button.onclick=()=>{

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

        const loader=

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
   HERO AUTO ROTATION
========================================================== */

setInterval(()=>{

    if(allSeries.length < 2)

        return;

    const index =

    Math.floor(

        Math.random() *

        allSeries.length

    );

    heroSeries =

    allSeries[index];

    document.getElementById(

        "heroBackdrop"

    ).style.backgroundImage =

    `url('${heroSeries.backdrop || heroSeries.poster || "assets/logo.png"}')`;

    document.getElementById(

        "heroTitle"

    ).textContent =

    heroSeries.title;

    document.getElementById(

        "heroDescription"

    ).textContent =

    heroSeries.description ||

    "No description available.";

    document.getElementById(

        "heroWatchBtn"

    ).onclick=()=>{

        location.href=

        `watch.html?id=${heroSeries.id}&type=series`;

    };

    document.getElementById(

        "heroInfoBtn"

    ).onclick=()=>{

        location.href=

        `watch.html?id=${heroSeries.id}&type=series`;

    };

},12000);


/* ==========================================================
   PAGE READY
========================================================== */

console.log(

    "KivuStream Series Ready 📺"

);
