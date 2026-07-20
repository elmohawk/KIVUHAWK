/* ==========================================================
   KIVUSTREAM V4 WATCH ENGINE
   PART 1
   CORE INITIALIZATION
========================================================== */

"use strict";

/* ==========================================================
   GLOBAL STATE
========================================================== */

const WatchState = {

    content: null,

    type: null,

    id: null,

    loaded: false

};

/* ==========================================================
   DOM ELEMENTS
========================================================== */

const $ = (id) => document.getElementById(id);

const backdrop = $("backdrop");
const poster = $("poster");
const player = $("videoPlayer");

const title = $("title");
const overview = $("overview");

const rating = $("rating");
const runtime = $("runtime");
const year = $("year");
const genres = $("genres");
const typeBadge = $("typeBadge");

const loadingScreen = $("loadingScreen");

/* ==========================================================
   START
========================================================== */

document.addEventListener(

    "DOMContentLoaded",

    bootWatchPage
renderContent(content);

await enrichFromTMDB();

hideLoading();
);

/* ==========================================================
   BOOT
========================================================== */

async function bootWatchPage(){

    try{

        showLoading();

        const route = getRoute();

        if(!route){

            throw new Error("Invalid URL");

        }

        WatchState.type = route.type;
        WatchState.id = route.id;

        const content = await loadContent();

        if(!content){

            throw new Error("Content Not Found");

        }

        WatchState.content = content;
        WatchState.loaded = true;

        renderContent(content);

        hideLoading();

        console.log("Watch Page Ready");

    }

    catch(error){

        console.error(error);

        hideLoading();

        showError(error.message);

    }

}
/* ==========================================================
   URL ROUTER
========================================================== */

function getRoute(){

    const path =

    window.location.pathname

    .replace(/^\/+/,"")

    .split("/")

    .filter(Boolean);

    if(path.length >= 2){

        if(

            path[0] === "movie" ||

            path[0] === "series"

        ){

            if(!isUUID(path[1])){

                return null;

            }

            return{

                type:path[0],

                id:path[1]

            };

        }

    }

    const params = new URLSearchParams(

        window.location.search

    );

    const id = params.get("id");

    const type = params.get("type") || "movie";

    if(!id){

        return null;

    }

    if(!isUUID(id)){

        return null;

    }

    return{

        type,

        id

    };

}

/* ==========================================================
   UUID VALIDATOR
========================================================== */

function isUUID(value){

    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

}
/* ==========================================================
   LOAD CONTENT
========================================================== */

async function loadContent(){

    const table =

    WatchState.type === "series"

    ? "series"

    : "movies";

    const {

        data,

        error

    }

    =

    await supabaseClient

    .from(table)

    .select("*")

    .eq("id",WatchState.id)

    .single();

    if(error){

        throw error;

    }

    return{

        ...data,

        type:WatchState.type

    };

}
/* ==========================================================
   LOADING
========================================================== */

function showLoading(){

    if(loadingScreen){

        loadingScreen.style.display="flex";

    }

}

function hideLoading(){

    if(loadingScreen){

        loadingScreen.style.display="none";

    }

}

/* ==========================================================
   ERROR
========================================================== */

function showError(message){

    document.body.innerHTML=`

    <div class="watch-error">

        <h1>404</h1>

        <p>${message}</p>

        <a href="/">Back Home</a>

    </div>

    `;

}
/* ==========================================================
   KIVUSTREAM V4
   CONTENT RENDERER
========================================================== */

function renderContent(content){

    if(!content) return;

    /* ---------- Basic ---------- */

    document.title = `${content.title} • KivuStream`;

    if(title)
        title.textContent = content.title || "Unknown Title";

    if(overview)
        overview.textContent =
            content.overview ||
            content.description ||
            "No description available.";

    if(typeBadge){

        typeBadge.textContent =
            content.type.toUpperCase();

        typeBadge.className =
            `badge ${content.type}`;

    }

    /* ---------- Images ---------- */

    const posterURL =
        getPoster(content);

    const backdropURL =
        getBackdrop(content);

    if(poster){

        poster.src = posterURL;

        poster.onerror = ()=>
            poster.src="assets/logo.png";

    }

    if(backdrop){

        backdrop.style.backgroundImage =
            `url('${backdropURL}')`;

    }

    /* ---------- Rating ---------- */

    if(rating){

        rating.textContent =
            Number(content.rating || 0)
            .toFixed(1);

    }

    /* ---------- Runtime ---------- */

    if(runtime){

        runtime.textContent =
            content.runtime
            ?
            `${content.runtime} min`
            :
            "Unknown";

    }

    /* ---------- Year ---------- */

    if(year){

        year.textContent =
            content.year ||
            extractYear(content.release_date);

    }

    /* ---------- Genres ---------- */

    renderGenres(content.genres);

    /* ---------- Player ---------- */

    loadPlayer(content);

}
/* ==========================================================
   POSTER
========================================================== */

function getPoster(movie){

    if(movie.poster)
        return movie.poster;

    if(movie.poster_path){

        if(movie.poster_path.startsWith("http")){

            return movie.poster_path;

        }

        return `https://image.tmdb.org/t/p/w500${movie.poster_path}`;

    }

    if(movie.backdrop)
        return movie.backdrop;

    return "assets/logo.png";

}

/* ==========================================================
   BACKDROP
========================================================== */

function getBackdrop(movie){

    if(movie.backdrop)
        return movie.backdrop;

    if(movie.backdrop_path){

        if(movie.backdrop_path.startsWith("http")){

            return movie.backdrop_path;

        }

        return `https://image.tmdb.org/t/p/original${movie.backdrop_path}`;

    }

    return getPoster(movie);

}
/* ==========================================================
   GENRES
========================================================== */

function renderGenres(value){

    if(!genres)
        return;

    genres.innerHTML="";

    if(!value)
        return;

    let list=[];

    if(Array.isArray(value)){

        list=value;

    }

    else{

        list=value.split(",");

    }

    list.forEach(item=>{

        genres.innerHTML +=

        `<span class="genre-chip">

            ${item.trim()}

        </span>`;

    });

}
/* ==========================================================
   YEAR
========================================================== */

function extractYear(date){

    if(!date)
        return "";

    return String(date).substring(0,4);

}
/* ==========================================================
   PLAYER
========================================================== */

function loadPlayer(content){

    if(!player)
        return;

    if(content.video_url){

        player.src =
            content.video_url;

    }

    else{

        player.poster =
            getPoster(content);

    }

}
/* ==========================================================
   TMDB ENRICHMENT
========================================================== */

async function enrichFromTMDB(){

    if(!WatchState.content)
        return;

    if(!WatchState.content.tmdb_id)
        return;

    try{

        const details =

        WatchState.type==="movie"

        ?

        await getTMDBMovieDetails(

            WatchState.content.tmdb_id

        )

        :

        await getTMDBSeriesDetails(

            WatchState.content.tmdb_id

        );

        if(details.poster_path && !WatchState.content.poster){

            poster.src =

            `https://image.tmdb.org/t/p/w500${details.poster_path}`;

        }

        if(details.backdrop_path){

            backdrop.style.backgroundImage =

            `url(https://image.tmdb.org/t/p/original${details.backdrop_path})`;

        }

        if(details.runtime && runtime){

            runtime.textContent =
                details.runtime+" min";

        }

        if(details.genres){

            renderGenres(

                details.genres.map(g=>g.name)

            );

        }

    }

    catch(error){

        console.log(

            "TMDB skipped",

            error

        );

    }

}
