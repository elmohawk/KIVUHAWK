/* ==========================================================
   KIVUSTREAM WATCH ENGINE V4
   PART 1 - CORE ENGINE
========================================================== */

"use strict";

/* ==========================================================
   GLOBAL STATE
========================================================== */

let currentContent = null;
let contentID = null;
let contentType = "movie";

let currentSeason = 1;
let currentEpisode = 1;

let isCinemaMode = false;
let isFavorite = false;

/* ==========================================================
   DOM READY
========================================================== */

document.addEventListener("DOMContentLoaded", () => {
    initializeWatchPage();
});

/* ==========================================================
   INITIALIZE
========================================================== */

async function initializeWatchPage() {

    try {

        showLoading();

        parseURL();

        checkSupabase();

        await loadContent();

        if (!currentContent) {
            throw new Error("Content not found.");
        }

        renderHero();

        hideLoading();

    } catch (err) {

        console.error(err);

        showError(err.message || "Unable to load content.");

    }

}

/* ==========================================================
   URL ROUTER
========================================================== */

function parseURL() {

    const url = new URL(window.location.href);

    /* Query format
       watch.html?id=123&type=movie
    */

    const id = url.searchParams.get("id");
    const type = url.searchParams.get("type");

    if (id) {

        contentID = id;

        contentType = type || "movie";

        return;

    }

    /* Cloudflare Worker format

       /movie/123

       /series/uuid

    */

    const path = window.location.pathname
        .replace(/^\/+|\/+$/g, "")
        .split("/");

    if (path.length >= 2) {

        contentType = path[0].toLowerCase();

        contentID = path[1];

    }

}

/* ==========================================================
   CHECK SUPABASE
========================================================== */

function checkSupabase() {

    if (typeof supabaseClient === "undefined") {

        throw new Error("Supabase Client not loaded.");

    }

}

/* ==========================================================
   LOADING
========================================================== */

function showLoading() {

    const loader = document.getElementById("loadingScreen");

    if (loader) {

        loader.style.display = "flex";

    }

}

function hideLoading() {

    const loader = document.getElementById("loadingScreen");

    if (!loader) return;

    setTimeout(() => {

        loader.style.opacity = "0";

        setTimeout(() => {

            loader.style.display = "none";

            document.body.classList.add("loaded");

        }, 500);

    }, 1000);

}

/* ==========================================================
   ERROR PAGE
========================================================== */

function showError(message) {

    hideLoading();

    document.body.innerHTML = `

    <div style="
        min-height:100vh;
        display:flex;
        justify-content:center;
        align-items:center;
        background:#071521;
        color:white;
        font-family:Poppins,sans-serif;
        text-align:center;
        padding:40px;
    ">

        <div>

            <h1 style="font-size:40px;margin-bottom:15px;">
                ⚠ Error
            </h1>

            <p style="opacity:.8;">
                ${message}
            </p>

            <br>

            <a href="index.html"
               style="
                    display:inline-block;
                    padding:14px 30px;
                    border-radius:30px;
                    background:#00d4ff;
                    color:#04131f;
                    text-decoration:none;
                    font-weight:700;
               ">
               Back Home
            </a>

        </div>

    </div>

    `;

}

/* ==========================================================
   TOAST
========================================================== */

function showToast(message = "Done") {

    const toast = document.getElementById("toast");
    const text = document.getElementById("toastMessage");

    if (!toast || !text) return;

    text.textContent = message;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 3000);

}
/* ==========================================================
   PART 2 - LOAD CONTENT + HERO
========================================================== */

/* ==========================================================
   LOAD CONTENT
========================================================== */

async function loadContent() {

    if (!contentID) {
        throw new Error("Missing content ID.");
    }

    const table =
        contentType === "series"
            ? "series"
            : "movies";

    let query = supabaseClient
        .from(table)
        .select("*");

    /*
      Support UUID and numeric IDs.
      If your database column is UUID, the string ID works.
      If it's integer, numeric strings are converted.
    */

    if (/^\d+$/.test(contentID)) {
        query = query.eq("id", Number(contentID));
    } else {
        query = query.eq("id", contentID);
    }

    const { data, error } = await query.limit(1);

    if (error) {
        console.error(error);
        throw new Error("Unable to load content.");
    }

    if (!data || data.length === 0) {
        throw new Error("Content not found.");
    }

    currentContent = data[0];

    console.log("Loaded:", currentContent);

}

/* ==========================================================
   HERO
========================================================== */

function renderHero() {

    if (!currentContent) return;

    setText("title", currentContent.title);

    setText(
        "overview",
        currentContent.overview || "No description available."
    );

    setText(
        "rating",
        currentContent.rating || "N/A"
    );

    setText(
        "runtime",
        currentContent.runtime
            ? currentContent.runtime + " min"
            : "--"
    );

    setText(
        "year",
        currentContent.year ||
        extractYear(currentContent.release_date)
    );

    setText(
        "typeBadge",
        currentContent.type || contentType
    );

    setText(
        "status",
        currentContent.status || "Released"
    );

    setPoster();

    setBackdrop();

    renderGenres();

}

/* ==========================================================
   POSTER
========================================================== */

function setPoster() {

    const poster = document.getElementById("poster");

    if (!poster) return;

    poster.src = getPoster(currentContent);

}

/* ==========================================================
   BACKDROP
========================================================== */

function setBackdrop() {

    const hero = document.getElementById("backdrop");

    if (!hero) return;

    hero.style.backgroundImage =
        `url('${getBackdrop(currentContent)}')`;

}

/* ==========================================================
   GENRES
========================================================== */

function renderGenres() {

    const container =
        document.getElementById("genres");

    if (!container) return;

    container.innerHTML = "";

    let genres = currentContent.genres;

    if (!genres) return;

    if (typeof genres === "string") {

        genres = genres.split(",");

    }

    genres.forEach(g => {

        container.innerHTML += `

            <span>

                ${g}

            </span>

        `;

    });

}

/* ==========================================================
   IMAGE HELPERS
========================================================== */

function getPoster(movie) {

    if (!movie) {

        return "assets/logo.png";

    }

    if (movie.poster) {

        return movie.poster;

    }

    if (movie.poster_path) {

        return IMAGE_BASE + movie.poster_path;

    }

    return "assets/logo.png";

}

function getBackdrop(movie) {

    if (!movie) {

        return "assets/logo.png";

    }

    if (movie.backdrop) {

        return movie.backdrop;

    }

    if (movie.backdrop_path) {

        return IMAGE_BASE.replace("/w500", "/original")
            + movie.backdrop_path;

    }

    return getPoster(movie);

}

/* ==========================================================
   HELPERS
========================================================== */

function setText(id, value) {

    const el = document.getElementById(id);

    if (el) {

        el.textContent = value ?? "";

    }

}

function extractYear(date) {

    if (!date) return "--";

    return String(date).substring(0, 4);

}
/* ==========================================================
   PART 3
   VIDEO PLAYER ENGINE
========================================================== */

const videoPlayer = document.getElementById("videoPlayer");

/* ==========================================================
   INITIALIZE PLAYER
========================================================== */

function initializePlayer(){

    if(!videoPlayer) return;

    loadVideoSource();

    restoreProgress();

    registerPlayerEvents();

}

/* ==========================================================
   LOAD VIDEO
========================================================== */

function loadVideoSource(){

    if(!currentContent) return;

    /*
       Priority

       video_url

       stream_url

       source

       video

    */

    const src=

    currentContent.video_url ||

    currentContent.stream_url ||

    currentContent.source ||

    currentContent.video ||

    "";

    if(!src){

        showToast("Video unavailable.");

        return;

    }

    videoPlayer.src=src;

}

/* ==========================================================
   PLAYER EVENTS
========================================================== */

function registerPlayerEvents(){

    videoPlayer.addEventListener(

        "loadedmetadata",

        ()=>{

            hidePlayerLoading();

        }

    );

    videoPlayer.addEventListener(

        "play",

        ()=>{

            increaseViews();

        }

    );

    videoPlayer.addEventListener(

        "timeupdate",

        ()=>{

            saveProgress();

        }

    );

    videoPlayer.addEventListener(

        "ended",

        ()=>{

            removeProgress();

        }

    );

}

/* ==========================================================
   PLAYER LOADER
========================================================== */

function hidePlayerLoading(){

    const loader=

    document.getElementById("playerLoading");

    if(loader){

        loader.style.display="none";

    }

}

/* ==========================================================
   SAVE WATCH PROGRESS
========================================================== */

function saveProgress(){

    if(!currentContent) return;

    localStorage.setItem(

        "watch-"+currentContent.id,

        JSON.stringify({

            time:videoPlayer.currentTime,

            duration:videoPlayer.duration

        })

    );

}

/* ==========================================================
   RESTORE PROGRESS
========================================================== */

function restoreProgress(){

    if(!currentContent) return;

    const saved=

    JSON.parse(

        localStorage.getItem(

            "watch-"+currentContent.id

        )

    );

    if(saved){

        videoPlayer.currentTime=saved.time||0;

    }

}

/* ==========================================================
   REMOVE PROGRESS
========================================================== */

function removeProgress(){

    if(!currentContent) return;

    localStorage.removeItem(

        "watch-"+currentContent.id

    );

}

/* ==========================================================
   CONTINUE WATCHING
========================================================== */

function saveContinueWatching(){

    if(!currentContent) return;

    let list=

    JSON.parse(

        localStorage.getItem(

            "recentlyWatched"

        )

    )||[];

    list=list.filter(

        item=>item.id!==currentContent.id

    );

    list.unshift({

        id:currentContent.id,

        type:contentType,

        title:currentContent.title,

        poster:getPoster(currentContent)

    });

    if(list.length>20){

        list.length=20;

    }

    localStorage.setItem(

        "recentlyWatched",

        JSON.stringify(list)

    );

}

/* ==========================================================
   CINEMA MODE
========================================================== */

const cinemaBtn=

document.getElementById(

    "cinemaMode"

);

if(cinemaBtn){

cinemaBtn.onclick=()=>{

    document.body.classList.toggle(

        "cinema-mode"

    );

};

}

/* ==========================================================
   FULLSCREEN
========================================================== */

const fullscreenBtn=

document.getElementById(

    "fullscreenBtn"

);

if(fullscreenBtn){

fullscreenBtn.onclick=()=>{

    if(videoPlayer.requestFullscreen){

        videoPlayer.requestFullscreen();

    }

};

}

/* ==========================================================
   WATCH NOW
========================================================== */

const watchBtn=

document.getElementById(

    "watchNow"

);

if(watchBtn){

watchBtn.onclick=()=>{

    videoPlayer.scrollIntoView({

        behavior:"smooth"

    });

    videoPlayer.play();

};

}

/* ==========================================================
   VIEWS
========================================================== */

async function increaseViews(){

    if(!currentContent) return;

    try{

        const views=

        (currentContent.views||0)+1;

        await supabaseClient

        .from(contentType==="series"

        ?"series"

        :"movies")

        .update({

            views:views

        })

        .eq(

            "id",

            currentContent.id

        );

        currentContent.views=views;

        const counter=

        document.getElementById(

            "viewCount"

        );

        if(counter){

            counter.textContent=views;

        }

    }

    catch(e){

        console.log(e);

    }

}

/* ==========================================================
   START PLAYER
========================================================== */

initializePlayer();

saveContinueWatching();
/* ==========================================================
   PART 4
   MOVIE PARTS + EPISODES + DOWNLOAD CENTER
========================================================== */

/* ==========================================================
   LOAD CONTENT DETAILS
========================================================== */

async function loadContentExtras(){

    if(!currentContent) return;

    if(contentType==="movie"){

        loadMovieParts();

    }else{

        loadEpisodes();

    }

    loadDownloads();

}

/* ==========================================================
   MOVIE PARTS
========================================================== */

function loadMovieParts(){

    const section=document.getElementById("moviePartsSection");
    const container=document.getElementById("movieParts");

    if(!section || !container) return;

    const parts=currentContent.parts || [];

    if(parts.length===0){

        section.style.display="none";

        return;

    }

    section.style.display="block";

    container.innerHTML="";

    parts.forEach((part,index)=>{

        container.innerHTML+=`

        <div class="movie-part-card">

            <h3>

                Part ${String.fromCharCode(65+index)}

            </h3>

            <p>

                ${part.name || "Movie Part"}

            </p>

            <button
            onclick="playMoviePart(${index})">

                ▶ Watch

            </button>

        </div>

        `;

    });

}

/* ==========================================================
   PLAY PART
========================================================== */

function playMoviePart(index){

    const parts=currentContent.parts||[];

    if(!parts[index]) return;

    videoPlayer.src=

    parts[index].video ||

    parts[index].url;

    videoPlayer.play();

    showToast(

        "Playing Part "+String.fromCharCode(65+index)

    );

}

/* ==========================================================
   SERIES
========================================================== */

async function loadEpisodes(){

    const section=

    document.getElementById(

        "episodesSection"

    );

    const grid=

    document.getElementById(

        "episodesGrid"

    );

    if(!section || !grid) return;

    section.style.display="block";

    const {

        data,

        error

    }=

    await supabaseClient

    .from("episodes")

    .select("*")

    .eq(

        "series_id",

        currentContent.id

    )

    .order(

        "episode_number"

    );

    if(error){

        console.log(error);

        return;

    }

    grid.innerHTML="";

    data.forEach(ep=>{

        grid.innerHTML+=`

        <div class="episode-card"

        onclick="playEpisode('${ep.id}')">

            <img

            src="${
                ep.thumbnail ||

                getPoster(currentContent)
            }">

            <div class="episode-info">

                <h3>

                    Episode ${ep.episode_number}

                </h3>

                <p>

                    ${ep.title}

                </p>

            </div>

        </div>

        `;

    });

}

/* ==========================================================
   PLAY EPISODE
========================================================== */

async function playEpisode(id){

    const{

        data

    }=

    await supabaseClient

    .from("episodes")

    .select("*")

    .eq("id",id)

    .single();

    if(!data) return;

    videoPlayer.src=

    data.video_url ||

    data.video;

    videoPlayer.play();

    currentEpisode=

    data.episode_number;

    showToast(

        "Episode "+currentEpisode

    );

}

/* ==========================================================
   DOWNLOADS
========================================================== */
async function loadDownloads() {

    const container = document.getElementById("downloadContainer");

    if (!container || !currentContent) return;

    container.innerHTML = "<p>Loading downloads...</p>";

    const { data, error } = await supabaseClient
        .from("downloads")
        .select("*")
        .eq("content_id", currentContent.id)
        .eq("content_type", contentType)
        .order("quality");

    if (error) {

        console.error(error);

        container.innerHTML = `
            <div class="download-error">
                No downloads available.
            </div>
        `;

        return;
    }

    if (!data.length) {

        container.innerHTML = `
            <div class="download-error">
                Downloads not added yet.
            </div>
        `;

        return;
    }

    container.innerHTML = "";

    data.forEach(file => {

        container.innerHTML += `

        <div class="download-card">

            <span class="download-quality">

                ${file.quality}

            </span>

            <p>

                ${file.size}

            </p>

            <small>

                ${file.server}

            </small>

            <button
                onclick="downloadFile('${file.url}')">

                <i class="fa-solid fa-download"></i>

                Download

            </button>

        </div>

        `;

    });

}

/* ==========================================================
   DOWNLOAD
========================================================== */

function downloadFile(url){

    if(!url){

        showToast("Download unavailable.");

        return;

    }

    window.open(url,"_blank");

}
/* ==========================================================
   AUTO NEXT EPISODE
========================================================== */

videoPlayer?.addEventListener(

"ended",

()=>{

    if(contentType!=="series") return;

    playNextEpisode();

});

async function playNextEpisode(){

    const{

        data

    }=

    await supabaseClient

    .from("episodes")

    .select("*")

    .eq(

        "series_id",

        currentContent.id

    )

    .eq(

        "episode_number",

        currentEpisode+1

    )

    .single();

    if(!data){

        showToast(

            "Series Finished"

        );

        return;

    }

    playEpisode(data.id);

}

/* ==========================================================
   START
========================================================== */

loadContentExtras();
