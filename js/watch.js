/* ==========================================================
   KIVUSTREAM — 3D TILT ENGINE
   Drives the --rx / --ry / --tz custom properties consumed
   by watch.css (.tilt-3d, .movie-card, .continue-card, etc.)
========================================================== */

(function(){

  const TILT_MAX = getTiltMax();

  function getTiltMax(){
    const raw = getComputedStyle(document.documentElement)
      .getPropertyValue("--tilt-max")
      .trim();
    return parseFloat(raw) || 14;
  }

  const reduceMotion =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ----------------------------------------------------------
     Attach tilt behavior to one element
  ---------------------------------------------------------- */
  function attachTilt(el, opts = {}){

    if(reduceMotion) return;

    const maxTilt = opts.maxTilt || TILT_MAX;
    const maxLift = opts.maxLift ?? 24; // px, translateZ on hover peak

    let frame = null;

    function onMove(e){

      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;   // 0..1
      const py = (e.clientY - rect.top) / rect.height;   // 0..1

      // Map 0..1 -> -1..1, invert Y so top tilts back
      const rx = (0.5 - py) * 2 * maxTilt;
      const ry = (px - 0.5) * 2 * maxTilt;

      if(frame) cancelAnimationFrame(frame);

      frame = requestAnimationFrame(()=>{
        el.style.setProperty("--rx", rx.toFixed(2) + "deg");
        el.style.setProperty("--ry", ry.toFixed(2) + "deg");
        el.style.setProperty("--tz", maxLift + "px");
        el.classList.add("tilt-3d");
      });

    }

    function onLeave(){

      if(frame) cancelAnimationFrame(frame);

      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
      el.style.setProperty("--tz", "0px");

      // Let CSS transition ease back, then drop the override class
      setTimeout(()=> el.classList.remove("tilt-3d"), 300);

    }

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    el.addEventListener("mouseenter", onMove);

  }

  /* ----------------------------------------------------------
     Attach to a live NodeList/selector, including elements
     added later by watch.js (movie cards render async)
  ---------------------------------------------------------- */
  function attachTiltToSelector(selector, opts){

    document.querySelectorAll(selector).forEach(el=>{
      if(el.dataset.tiltBound) return;
      el.dataset.tiltBound = "true";
      attachTilt(el, opts);
    });

  }

  function bindAll(){

    // Poster gets a stronger, slower tilt
    attachTiltToSelector(".poster-area img", { maxTilt: 16, maxLift: 30 });

    // Grid cards get a snappier, smaller tilt
    attachTiltToSelector(
      ".movie-card, .continue-card, .episode-card, .download-card",
      { maxTilt: 10, maxLift: 18 }
    );

  }

  /* ----------------------------------------------------------
     Hero backdrop parallax (moves opposite to poster tilt
     for a subtle depth-of-field feel)
  ---------------------------------------------------------- */
  function bindHeroParallax(){

    const hero = document.querySelector(".hero");
    const backdrop = document.getElementById("backdrop");

    if(!hero || !backdrop || reduceMotion) return;

    hero.addEventListener("mousemove", (e)=>{

      const rect = hero.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;

      requestAnimationFrame(()=>{
        backdrop.style.transform =
          `translateZ(-120px) scale(1.15) translate(${px * -20}px, ${py * -14}px)`;
      });

    });

    hero.addEventListener("mouseleave", ()=>{
      backdrop.style.transform = "translateZ(-120px) scale(1.15)";
    });

  }

  /* ----------------------------------------------------------
     Bind on load, then re-scan periodically since watch.js
     injects movie/episode/continue cards asynchronously via
     innerHTML += (no single "cards ready" event to hook).
  ---------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", ()=>{

    bindAll();
    bindHeroParallax();

    // Re-scan for newly injected cards for a few seconds after load,
    // and again on scroll (loadMoreRecommendations appends more).
    let scans = 0;
    const rescan = setInterval(()=>{
      bindAll();
      scans++;
      if(scans > 20) clearInterval(rescan); // stop after ~10s
    }, 500);

    window.addEventListener("scroll", ()=> bindAll());

  });

})();
/* ==========================================================
   LOAD COMMENTS
========================================================== */

async function loadComments(){

    const container = document.getElementById("comments");

    if(!container || !currentContent){
        return;
    }

    const { data, error } = await supabaseClient

        .from("comments")

        .select("*")

        .eq("content_id", currentContent.id)

        .order("created_at", { ascending: false });

    if(error){

        console.error(error);

        return;

    }

    if(!data.length){

        container.innerHTML = `
            <div class="empty-comments">
                No comments yet.
            </div>
        `;

        return;

    }

    container.innerHTML = "";

    data.forEach(comment=>{

        container.innerHTML += `
            <div class="comment">

                <h4>${comment.username || "Anonymous"}</h4>

                <p>${comment.comment}</p>

                <small>${new Date(comment.created_at).toLocaleString()}</small>

            </div>
        `;

    });

}
/* ==========================================================
   KIVUSTREAM WATCH ENGINE V6
   Professional Streaming System
========================================================== */

let currentContent = null;
let relatedContent = [];
let currentDownloads = [];

const params = new URLSearchParams(window.location.search);

/*
Supports

watch.html?id=UUID&type=movie

watch.html?id=UUID&type=series

Future routing

/movie/UUID

/series/UUID
*/

let contentID = params.get("id");
let contentType = params.get("type") || "movie";

/* ==========================================================
   DOM READY
========================================================== */

document.addEventListener("DOMContentLoaded", async () => {

    try{

        showLoading();

        await initializeWatchPage();

        hideLoading();

    }

    catch(error){

        console.error(error);

        showError(error.message);

    }

});
/* =====================================
   LOADING SCREEN
===================================== */

function showLoading() {

    const loading = document.getElementById("loadingScreen");

    if (loading) {
        loading.style.display = "flex";
        loading.style.opacity = "1";
    }

}

function hideLoading() {

    const loading = document.getElementById("loadingScreen");

    if (!loading) return;

    loading.style.transition = "opacity .4s ease";
    loading.style.opacity = "0";

    setTimeout(() => {
        loading.style.display = "none";
    }, 400);

}
function showError(message){

    hideLoading();

    const hero=document.querySelector(".watch-container");

    if(hero){

        hero.innerHTML=`

        <div class="watch-error">

            <h2>Content Not Found</h2>

            <p>${message}</p>

        </div>

        `;

    }

}
/* ==========================================================
   INITIALIZE PAGE
========================================================== */
async function initializeWatchPage(){
 showLoading();

    // Hide loading after 1 second
    setTimeout(() => {
        hideLoading();
    }, 1000);
    await loadContent();

    if(!currentContent){
        throw new Error("Content not found.");
    }

    renderHero();

    renderDownloads();

    renderMovieParts();

    await renderEpisodes();

    await loadRelated();

    await loadComments();

    await loadMoreRecommendations();

}
/* ==========================================================
   LOAD CONTENT
========================================================== */

async function loadContent(){

    if(!contentID){

        throw new Error("Missing content id.");

    }

    const table=

    contentType==="series"

    ?

    "series"

    :

    "movies";

    const {data,error}=

    await supabaseClient

    .from(table)

    .select("*")

    .eq("id",contentID)

    .single();

    if(error){

        console.error(error);

        return;

    }

    currentContent=data;

}
/* ==========================================================
   IMAGE ENGINE
========================================================== */

function imageURL(path){

    if(!path){

        return "assets/logo.png";

    }

    if(path.startsWith("http")){

        return path;

    }

    return path;

}
/* ==========================================================
   HERO RENDER ENGINE
========================================================== */

function renderHero(){

    if(!currentContent) return;

    const backdrop =
        imageURL(
            currentContent.backdrop ||
            currentContent.backdrop_path
        );

    const poster =
        imageURL(
            currentContent.poster ||
            currentContent.poster_path
        );

    /* ---------- Background ---------- */

    const bg = document.getElementById("heroBackdrop");

    if(bg){

        bg.style.backgroundImage =

        `linear-gradient(
            rgba(2,8,18,.78),
            rgba(2,8,18,.96)
        ),
        url('${backdrop}')`;

    }

    /* ---------- Poster ---------- */

    const posterImage = document.getElementById("poster");

    if(posterImage){

        posterImage.src = poster;

        posterImage.onerror = ()=>{

            posterImage.src="assets/logo.png";

        };

    }

    /* ---------- Title ---------- */

    setText("title",
        currentContent.title ||
        "Unknown Title"
    );

    /* ---------- Overview ---------- */

    setText(
        "overview",
        currentContent.overview ||
        "No description available."
    );

    /* ---------- Rating ---------- */

    setText(
        "rating",
        Number(
            currentContent.rating ||
            currentContent.vote_average ||
            0
        ).toFixed(1)
    );

    /* ---------- Year ---------- */

    setText(
        "year",
        currentContent.year ||
        getYear(currentContent.release_date)
    );

    /* ---------- Runtime ---------- */

    setText(
        "runtime",
        currentContent.runtime
        ?
        currentContent.runtime + " min"
        :
        "-"
    );

    /* ---------- Language ---------- */

    setText(
        "language",
        currentContent.original_language ||
        currentContent.language ||
        "-"
    );

    /* ---------- Views ---------- */

    setText(
        "views",
        formatViews(
            currentContent.views || 0
        )
    );

    /* ---------- Likes ---------- */

    setText(
        "likes",
        currentContent.likes || 0
    );

    /* ---------- Genres ---------- */

    renderGenres();

    /* ---------- Buttons ---------- */

    setupButtons();

}
/* ==========================================================
   SMALL HELPERS
========================================================== */

function setText(id,value){

    const el=document.getElementById(id);

    if(el){

        el.textContent=value;

    }

}

function getYear(date){

    if(!date) return "";

    return new Date(date).getFullYear();

}

function formatViews(v){

    v=Number(v||0);

    if(v>=1000000){

        return (v/1000000).toFixed(1)+"M";

    }

    if(v>=1000){

        return (v/1000).toFixed(1)+"K";

    }

    return v;

}
/* ==========================================================
   GENRES
========================================================== */

function renderGenres(){

    const box=document.getElementById("genres");

    if(!box) return;

    box.innerHTML="";

    if(!currentContent.genres){

        return;

    }

    currentContent.genres

    .split(",")

    .forEach(g=>{

        box.innerHTML+=`

        <span class="genre-chip">

            ${g.trim()}

        </span>

        `;

    });

}
/* ==========================================================

   BUTTON EVENTS
========================================================== */

function setupButtons(){

    const play=document.getElementById("playMovie");

    if(play){

        play.onclick=playMovie;

    }

    const trailer=document.getElementById("watchTrailer");

    if(trailer){

        trailer.onclick=playTrailer;

    }

}
/* ==========================================================
   PLAY VIDEO
========================================================== */

function playMovie(){

    if(!currentContent) return;

    const player=document.getElementById("videoPlayer");

    if(!player) return;

    player.src=

        currentContent.video_url ||

        currentContent.worker_url ||

        "";

    player.scrollIntoView({

        behavior:"smooth"

    });

}
/* ==========================================================
   TMDB TRAILER
========================================================== */

function playTrailer(){

    if(!currentContent.trailer_key){

        alert("Trailer unavailable.");

        return;

    }

    window.open(

        `https://www.youtube.com/watch?v=${currentContent.trailer_key}`,

        "_blank"

    );

}
/* ==========================================================
   PLAYER ENGINE
========================================================== */

function playMovie(url = null){

    if(!currentContent) return;

    const player=document.getElementById("videoPlayer");

    if(!player) return;

    let video=

        url ||

        currentContent.video_url ||

        currentContent.worker_url ||
       

        "";

    if(video===""){

        alert("Video unavailable.");

        return;

    }

    player.src=video;

    player.play();

    player.scrollIntoView({

        behavior:"smooth"

    });

}
/* ==========================================================
   DOWNLOAD SECTION
========================================================== */

function renderDownloads(){

    const container=document.getElementById("downloads");

    if(!container) return;

    container.innerHTML="";

    let links=currentContent.download_links;

    if(!links){

        container.innerHTML=

        "<p>No downloads available.</p>";

        return;

    }

    if(typeof links==="string"){

        try{

            links=JSON.parse(links);

        }

        catch{

            links=[];

        }

    }

    currentDownloads=links;

    links.forEach((item,index)=>{

        container.innerHTML+=`

        <div class="download-card">

            <div>

                <h4>${item.name || "Download "+(index+1)}</h4>

            </div>

            <button

                onclick="downloadVideo('${item.url}')">

                Download

            </button>

        </div>

        `;

    });

}
/* ==========================================================
   DOWNLOAD
========================================================== */

function downloadVideo(url){

    if(!url){

        alert("Download unavailable.");

        return;

    }

    window.open(url,"_blank");

}
/* ==========================================================
   MOVIE PARTS
========================================================== */

function renderMovieParts(){

    const box=document.getElementById("movieParts");

    if(!box) return;

    box.innerHTML="";

    let links=currentContent.download_links;

    if(typeof links==="string"){

        try{

            links=JSON.parse(links);

        }

        catch{

            links=[];

        }

    }

    if(!links || links.length<=1){

        return;

    }

    links.forEach((part,index)=>{

        box.innerHTML+=`

        <button

        class="part-button"

        onclick="playMovie('${part.url}')">

        Part ${String.fromCharCode(65+index)}

        </button>

        `;

    });

}
/* ==========================================================
   SERIES EPISODES
========================================================== */

async function renderEpisodes(){

    if(contentType!=="series") return;

    const container=document.getElementById("episodes");

    if(!container) return;

    const {data,error}=

    await supabaseClient

    .from("episodes")

    .select("*")

    .eq("series_id",currentContent.id)

    .order("episode_number");

    if(error){

        console.error(error);

        return;

    }

    container.innerHTML="";

    data.forEach(ep=>{

        container.innerHTML+=`

        <div class="episode-card">

            <img

            src="${imageURL(ep.thumbnail)}">

            <div>

                <h4>

                Episode ${ep.episode_number}

                </h4>

                <p>

                ${ep.title}

                </p>

            </div>

            <button

            onclick="playMovie('${ep.video_url}')">

            ▶ Play

            </button>

        </div>

        `;

    });

}
/* ==========================================================
   KIVUSTREAM RECOMMENDATION ENGINE
========================================================== */

/* ==========================================================
   RELATED CONTENT
========================================================== */

async function loadRelated(){

    const container=document.getElementById("relatedContainer");

    if(!container) return;

    let query=supabaseClient
        .from(contentType==="series" ? "series" : "movies")
        .select("*")
        .neq("id",currentContent.id)
        .limit(24);

    if(currentContent.category){

        query=query.eq(
            "category",
            currentContent.category
        );

    }

    const {data,error}=await query;

    if(error){

        console.error(error);

        return;

    }

    relatedContent=data||[];

    renderRelatedCards(relatedContent);

}

/* ==========================================================
   RENDER RELATED
========================================================== */

function renderRelatedCards(list){

    const container=document.getElementById("relatedContainer");

    if(!container) return;

    container.innerHTML="";

    list.forEach(movie=>{

        container.innerHTML+=`

        <div class="movie-card"

        onclick="openWatchPage('${movie.id}','${contentType}')">

            <img

            src="${getPoster(movie)}"

            loading="lazy"

            alt="${movie.title}"

            onerror="this.src='assets/logo.png'">

            <div class="movie-overlay">

                <h3>${movie.title}</h3>

                <div class="movie-meta">

                    <span>⭐ ${movie.rating||"N/A"}</span>

                    <span>${movie.year||""}</span>

                </div>

            </div>

        </div>

        `;

    });

}

/* ==========================================================
   OPEN WATCH PAGE
========================================================== */
function openWatchPage(id, type = "movie") {

    if (!id) {
        console.error("Missing movie ID.");
        return;
    }

    console.log("Opening:", id, type);

    window.location.href =
        `watch.html?id=${encodeURIComponent(id)}&type=${encodeURIComponent(type)}`;

}

/* ==========================================================
   CONTINUE WATCHING
========================================================== */

function saveContinueWatching(){

    if(!currentContent) return;

    const player=document.getElementById("videoPlayer");

    if(!player) return;

    const item={

        id:currentContent.id,

        type:contentType,

        title:currentContent.title,

        poster:getPoster(currentContent),

        position:player.currentTime,

        duration:player.duration,

        updated:Date.now()

    };

    localStorage.setItem(

        `continue_${currentContent.id}`,

        JSON.stringify(item)

    );

}

function restoreContinueWatching(){

    if(!currentContent) return;

    const saved=localStorage.getItem(

        `continue_${currentContent.id}`

    );

    if(!saved) return;

    const data=JSON.parse(saved);

    const player=document.getElementById("videoPlayer");

    if(player){

        player.currentTime=data.position||0;

    }

}

/* Auto save every 5 seconds */

setInterval(saveContinueWatching,5000);

/* ==========================================================
   RECENTLY WATCHED
========================================================== */

function saveRecentlyWatched(){

    if(!currentContent) return;

    let list=JSON.parse(
        localStorage.getItem("recentlyWatched")
    )||[];

    list=list.filter(item=>item.id!==currentContent.id);

    list.unshift({

        id:currentContent.id,

        type:contentType,

        title:currentContent.title,

        poster:getPoster(currentContent),

        updated:Date.now()

    });

    list=list.slice(0,20);

    localStorage.setItem(
        "recentlyWatched",
        JSON.stringify(list)
    );

}

function renderContinueWatching(){

    const container=document.getElementById("continueWatching");

    if(!container) return;

    const list=JSON.parse(
        localStorage.getItem("recentlyWatched")
    )||[];

    container.innerHTML="";

    list.forEach(item=>{

        container.innerHTML+=`

        <div class="continue-card"

        onclick="openWatchPage('${item.id}','${item.type}')">

            <img src="${item.poster}">

            <h4>${item.title}</h4>

        </div>

        `;

    });

}

/* ==========================================================
   INFINITE RECOMMENDATIONS
========================================================== */

/* ==========================================================
   LOAD MORE RECOMMENDATIONS
========================================================== */

async function loadMoreRecommendations(){

    // Wait until content has loaded
    if(!currentContent){

        console.warn("Current content not loaded yet.");

        return;

    }

    const table =
        currentContent.type === "series"
        ? "series"
        : "movies";

    const { data, error } = await supabaseClient

        .from(table)

        .select("*")

        .neq("id", currentContent.id)

        .limit(12);

    if(error){

        console.error("Recommendations:", error);

        return;

    }

    renderRelatedCards(data || []);

}

/* ==========================================================
   LAZY LOAD ON SCROLL
========================================================== */

window.addEventListener("scroll",async()=>{

    if(

        window.innerHeight+
        window.scrollY >

        document.body.offsetHeight-800

    ){

        await loadMoreRecommendations();

    }

});

/* ==========================================================
   BOOT
========================================================== */

document.addEventListener("DOMContentLoaded",()=>{

    saveRecentlyWatched();

    renderContinueWatching();

    restoreContinueWatching();

});
/* ==========================================================
   LIKE CONTENT
========================================================== */

async function likeContent(){

    if(!currentContent) return;

    const table =
        contentType === "series"
        ? "series"
        : "movies";

    const newLikes =
        Number(currentContent.likes || 0) + 1;

    const { error } = await supabaseClient

        .from(table)

        .update({
            likes:newLikes
        })

        .eq("id",currentContent.id);

    if(error){

        console.error(error);

        return;

    }

    currentContent.likes = newLikes;

    setText("likes",newLikes);

}
