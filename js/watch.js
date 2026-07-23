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
/* ==========================================================
   LOADING UI
========================================================== */

function showLoading(){

    const loader=document.getElementById("loading");

    if(loader){

        loader.style.display="flex";

    }

}

function hideLoading(){

    const loader=document.getElementById("loading");

    if(loader){

        loader.style.display="none";

    }

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

    hideLoading();

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

function openWatchPage(id,type){

    window.location.href=
        `watch.html?id=${id}&type=${type}`;

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

let recommendationPage=1;

async function loadMoreRecommendations(){

    const from=recommendationPage*24;

    const to=from+23;

    const {data,error}=await supabaseClient
        .from(contentType==="series" ? "series" : "movies")
        .select("*")
        .neq("id",currentContent.id)
        .range(from,to);

    if(error){

        console.error(error);

        return;

    }

    if(!data || data.length===0){

        return;

    }

    relatedContent.push(...data);

    renderRelatedCards(relatedContent);

    recommendationPage++;

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
