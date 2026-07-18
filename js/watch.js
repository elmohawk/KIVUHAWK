/* ==========================================================
   KIVUSTREAM WATCH ENGINE V5
   PART 1
   Loader + Supabase + TMDB
========================================================== */

/* ==========================================================
URL PARAMETERS
========================================================== */

const params = new URLSearchParams(window.location.search);

const CONTENT_ID = params.get("id");

const CONTENT_TYPE = params.get("type") || "movie";

if (!CONTENT_ID) {

    window.location.href = "index.html";

}

/* ==========================================================
GLOBAL VARIABLES
========================================================== */

let currentContent = null;

let tmdbData = null;

/* ==========================================================
DOM
========================================================== */

const backdrop = document.getElementById("backdrop");

const poster = document.getElementById("poster");

const player = document.getElementById("videoPlayer");

const title = document.getElementById("title");

const overview = document.getElementById("overview");

const rating = document.getElementById("rating");

const runtime = document.getElementById("runtime");

const year = document.getElementById("year");

const genres = document.getElementById("genres");

const typeBadge = document.getElementById("typeBadge");

const trailerContainer =
document.getElementById("trailerContainer");

const castContainer =
document.getElementById("castContainer");

/* ==========================================================
START
========================================================== */

document.addEventListener(

"DOMContentLoaded",

async ()=>{

    await initializeWatchPage();

});

async function initializeWatchPage(){

    try{

        showLoading();

        currentContent = await loadContent();

        if(!currentContent){

            return showError();

        }

        renderBasicContent(currentContent);

        await loadTMDBData();

        hideLoading();

    }

    catch(error){

        console.error(error);

        showError();

    }

}

/* ==========================================================
LOAD CONTENT
========================================================== */

async function loadContent(){

    let response;

    if(CONTENT_TYPE==="series"){

        response = await supabaseClient

        .from("series")

        .select("*")

        .eq("id",CONTENT_ID)

        .maybeSingle();

    }

    else{

        response = await supabaseClient

        .from("movies")

        .select("*")

        .eq("id",CONTENT_ID)

        .maybeSingle();

    }

    if(response.error){

        console.error(response.error);

        return null;

    }

    if(!response.data){

        return null;

    }

    response.data.type = CONTENT_TYPE;

    return response.data;

}

/* ==========================================================
RENDER BASIC DATA
========================================================== */

function renderBasicContent(movie){

    title.textContent =

    movie.title ||

    "Unknown Title";

    overview.textContent =

    movie.overview ||

    movie.description ||

    "";

    rating.textContent =

    movie.rating ||

    movie.vote_average ||

    "N/A";

    runtime.textContent =

    movie.runtime ?

    movie.runtime+" min"

    :

    "--";

    year.textContent =

    movie.year ||

    movie.release_date ||

    "";

    typeBadge.textContent =

    movie.type.toUpperCase();

    const posterImage =

        getPoster(movie);

    poster.src = posterImage;

    poster.onerror=()=>{

        poster.src="assets/logo.png";

    };

    backdrop.style.backgroundImage=

    `url('${

    movie.backdrop ||

    posterImage

    }')`;

    if(movie.video_url){

        player.src=

        movie.video_url;

    }

    if(movie.genres){

        renderGenres(

            movie.genres

        );

    }

}

/* ==========================================================
GENRES
========================================================== */

function renderGenres(list){

    genres.innerHTML="";

    if(typeof list==="string"){

        list=list.split(",");

    }

    list.forEach(item=>{

        genres.innerHTML +=

        `<span class="genre">

        ${item}

        </span>`;

    });

}

/* ==========================================================
POSTER
========================================================== */

function getPoster(movie){

    if(movie.poster){

        return movie.poster;

    }

    if(movie.poster_path){

        return

        `https://image.tmdb.org/t/p/w500${movie.poster_path}`;

    }

    if(movie.backdrop){

        return movie.backdrop;

    }

    if(movie.backdrop_path){

        return

        `https://image.tmdb.org/t/p/w780${movie.backdrop_path}`;

    }

    return "assets/logo.png";

}
/* ==========================================================
   PART 2
   TMDB + DOWNLOAD CENTER + EPISODES
========================================================== */

/* ==========================================================
TMDB LOADER
========================================================== */

async function loadTMDBData(){

    if(!currentContent.tmdb_id){

        console.log("No TMDB ID");

        await loadDownloads();

        if(currentContent.type==="series"){

            await loadEpisodes();

        }

        return;

    }

    try{

        if(currentContent.type==="movie"){

            tmdbData = await getTMDBMovieDetails(

                currentContent.tmdb_id

            );

        }

        else{

            tmdbData = await getTMDBSeriesDetails(

                currentContent.tmdb_id

            );

        }

        if(!tmdbData){

            return;

        }

        updateTMDBUI();

        await loadDownloads();

        if(currentContent.type==="series"){

            await loadEpisodes();

        }

    }

    catch(error){

        console.error(error);

    }

}

/* ==========================================================
UPDATE UI FROM TMDB
========================================================== */

function updateTMDBUI(){

    if(tmdbData.poster_path){

        poster.src=

        `https://image.tmdb.org/t/p/w500${tmdbData.poster_path}`;

    }

    if(tmdbData.backdrop_path){

        backdrop.style.backgroundImage=

        `url(https://image.tmdb.org/t/p/original${tmdbData.backdrop_path})`;

    }

    if(tmdbData.vote_average){

        rating.innerHTML=

        "⭐ "+tmdbData.vote_average.toFixed(1);

    }

    if(tmdbData.runtime){

        runtime.innerHTML=

        tmdbData.runtime+" min";

    }

    if(tmdbData.genres){

        renderGenres(

            tmdbData.genres.map(g=>g.name)

        );

    }

    if(tmdbData.overview){

        overview.innerHTML=

        tmdbData.overview;

    }

    if(tmdbData.release_date){

        year.innerHTML=

        tmdbData.release_date.substring(0,4);

    }

}

/* ==========================================================
DOWNLOAD CENTER
========================================================== */

async function loadDownloads(){

    const container=

    document.getElementById(

        "downloadContainer"

    );

    if(!container) return;

    container.innerHTML="";

    if(currentContent.download_links){

        let links=currentContent.download_links;

        if(typeof links==="string"){

            try{

                links=JSON.parse(links);

            }

            catch{

                links=[];

            }

        }

        links.forEach(item=>{

            container.innerHTML+=`

<div class="download-card">

<div>

<h3>${item.name||"Download"}</h3>

</div>

<a

href="${item.url}"

target="_blank"

class="download-btn">

Download

</a>

</div>

`;

        });

    }

    if(currentContent.download_url){

        container.innerHTML+=`

<div class="download-card">

<div>

<h3>Download Movie</h3>

</div>

<a

href="${currentContent.download_url}"

target="_blank"

class="download-btn">

Download

</a>

</div>

`;

    }

}

/* ==========================================================
MULTI PART MOVIES
========================================================== */

async function loadMovieParts(){

    const container=

    document.getElementById(

        "movieParts"

    );

    if(!container) return;

    const{

        data,

        error

    }=

    await supabaseClient

    .from("movie_parts")

    .select("*")

    .eq(

        "movie_id",

        currentContent.id

    )

    .order(

        "part_number"

    );

    if(error){

        console.log(error);

        return;

    }

    if(!data.length){

        return;

    }

    container.innerHTML="";

    data.forEach(part=>{

        container.innerHTML+=`

<div class="part-card">

<h3>

Part ${part.part_number}

</h3>

<button

onclick="playPart('${part.video_url}')">

▶ Watch

</button>

<a

href="${part.download_url}"

target="_blank">

Download

</a>

</div>

`;

    });

}

function playPart(url){

    player.src=url;

    player.scrollIntoView({

        behavior:"smooth"

    });

}

/* ==========================================================
SERIES EPISODES
========================================================== */

async function loadEpisodes(){

    const container=

    document.getElementById(

        "episodesContainer"

    );

    if(!container) return;

    const{

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

        "episode"

    );

    if(error){

        console.log(error);

        return;

    }

    container.innerHTML="";

    data.forEach(ep=>{

        container.innerHTML+=`

<div class="episode-card">

<img

src="${ep.thumbnail||'assets/logo.png'}">

<div>

<h3>

Episode ${ep.episode}

</h3>

<p>${ep.title}</p>

<div class="episode-buttons">

<button

onclick="playEpisode('${ep.video_url}')">

▶ Watch

</button>

<a

href="${ep.download_url||'#'}"

target="_blank">

Download

</a>

</div>

</div>

</div>

`;

    });

}

function playEpisode(url){

    player.src=url;

    player.scrollIntoView({

        behavior:"smooth"

    });

}
/* ==========================================================
   KIVUSTREAM WATCH ENGINE V5
   PART 3
   TRAILER • CAST • RECOMMENDATIONS
========================================================== */

/* ==========================================================
LOAD EXTRA TMDB CONTENT
========================================================== */

async function loadExtras(){

    if(!tmdbData) return;

    loadTrailer();

    loadCast();

    await loadRecommendations();

    saveContinueWatching();

}

/* ==========================================================
TRAILER
========================================================== */

function loadTrailer(){

    if(!trailerContainer) return;

    trailerContainer.innerHTML="";

    if(

        !tmdbData.videos ||

        !tmdbData.videos.results ||

        tmdbData.videos.results.length===0

    ){

        trailerContainer.innerHTML=`

<div class="empty-state">

No Trailer Available

</div>

`;

        return;

    }

    const trailer=

    tmdbData.videos.results.find(video=>

        video.site==="YouTube"

        &&

        video.type==="Trailer"

    )

    ||

    tmdbData.videos.results[0];

    if(!trailer) return;

    trailerContainer.innerHTML=`

<iframe

src="https://www.youtube.com/embed/${trailer.key}"

allowfullscreen

loading="lazy"

></iframe>

`;

}

/* ==========================================================
CAST
========================================================== */

function loadCast(){

    if(!castContainer) return;

    castContainer.innerHTML="";

    if(

        !tmdbData.credits ||

        !tmdbData.credits.cast

    ){

        return;

    }

    tmdbData.credits.cast

    .slice(0,20)

    .forEach(actor=>{

        const image=

        actor.profile_path

        ?

        `https://image.tmdb.org/t/p/w300${actor.profile_path}`

        :

        "assets/logo.png";

        castContainer.innerHTML+=`

<div class="cast-card">

<img

src="${image}"

loading="lazy"

onerror="this.src='assets/logo.png'"

>

<h4>

${actor.name}

</h4>

<p>

${actor.character||""}

</p>

</div>

`;

    });

}

/* ==========================================================
RECOMMENDATIONS
========================================================== */

async function loadRecommendations(){

    const container=

    document.getElementById(

        "recommendations"

    );

    if(!container) return;

    const table=

    currentContent.type==="series"

    ?

    "series"

    :

    "movies";

    const{

        data,

        error

    }=

    await supabaseClient

    .from(table)

    .select("*")

    .neq(

        "id",

        currentContent.id

    )

    .limit(12);

    if(error){

        console.log(error);

        return;

    }

    container.innerHTML="";

    data.forEach(item=>{

        const image=

        getPoster(item);

        container.innerHTML+=`

<div

class="recommend-card"

onclick="location.href='watch.html?id=${item.id}&type=${currentContent.type}'"

>

<img

src="${image}"

loading="lazy"

onerror="this.src='assets/logo.png'"

>

<div class="recommend-info">

<h3>

${item.title}

</h3>

<p>

⭐ ${item.rating||"N/A"}

</p>

</div>

</div>

`;

    });

}

/* ==========================================================
CONTINUE WATCHING
========================================================== */

function saveContinueWatching(){

    if(!player) return;

    player.addEventListener(

        "timeupdate",

        ()=>{

            const watch={

                id:currentContent.id,

                type:currentContent.type,

                title:currentContent.title,

                poster:getPoster(currentContent),

                position:player.currentTime,

                duration:player.duration,

                updated:Date.now()

            };

            localStorage.setItem(

                "continueWatching_"+

                currentContent.id,

                JSON.stringify(watch)

            );

        }

    );

}

/* ==========================================================
RESUME
========================================================== */

function resumeWatching(){

    const saved=

    localStorage.getItem(

        "continueWatching_"+

        currentContent.id

    );

    if(!saved) return;

    const watch=

    JSON.parse(saved);

    player.currentTime=

    watch.position||0;

}

/* ==========================================================
AUTO PLAY NEXT EPISODE
========================================================== */

player.addEventListener(

"ended",

async()=>{

    if(currentContent.type!=="series")

        return;

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

    .gt(

        "episode",

        currentEpisode

    )

    .order(

        "episode"

    )

    .limit(1);

    if(data && data.length){

        playEpisode(

            data[0].video_url

        );

    }

});

/* ==========================================================
BOOT EXTRAS
========================================================== */

setTimeout(()=>{

    loadExtras();

    resumeWatching();

},800);
/* ==========================================================
   KIVUSTREAM WATCH ENGINE
   PART 4
   PREMIUM FEATURES
========================================================== */

/* ==========================================================
LIKE SYSTEM
========================================================== */

async function likeMovie(){

    if(!currentContent) return;

    try{

        const {

            data:{user}

        } = await supabaseClient.auth.getUser();

        if(!user){

            alert("Please login first.");

            return;

        }

        const {error} = await supabaseClient

        .from("likes")

        .insert({

            movie_id:currentContent.id,

            user_id:user.id

        });

        if(error){

            console.log(error);

            return;

        }

        updateLikeCounter();

    }

    catch(err){

        console.log(err);

    }

}

async function updateLikeCounter(){

    const {

        count

    } = await supabaseClient

    .from("likes")

    .select("*",

    {

        count:"exact",

        head:true

    })

    .eq(

        "movie_id",

        currentContent.id

    );

    const likeElement =

    document.getElementById(

        "likeCount"

    );

    if(likeElement){

        likeElement.textContent = count || 0;

    }

}

/* ==========================================================
VIEW COUNTER
========================================================== */

async function increaseViews(){

    try{

        const currentViews =

        Number(currentContent.views || 0);

        await supabaseClient

        .from(

            currentContent.type==="movie"

            ? "movies"

            : "series"

        )

        .update({

            views:currentViews+1

        })

        .eq(

            "id",

            currentContent.id

        );

    }

    catch(err){

        console.log(err);

    }

}

/* ==========================================================
COMMENTS
========================================================== */

async function loadComments(){

    const container =

    document.getElementById(

        "comments"

    );

    if(!container) return;

    const {

        data,

        error

    } = await supabaseClient

    .from("comments")

    .select("*")

    .eq(

        "movie_id",

        currentContent.id

    )

    .order(

        "created_at",

        {

            ascending:false

        }

    );

    if(error){

        console.log(error);

        return;

    }

    container.innerHTML="";

    data.forEach(comment=>{

        container.innerHTML+=`

<div class="comment-card">

<h4>

${comment.username}

</h4>

<p>

${comment.comment}

</p>

<span>

${new Date(comment.created_at)

.toLocaleDateString()}

</span>

</div>

`;

    });

}

async function sendComment(){

    const input =

    document.getElementById(

        "commentInput"

    );

    if(!input.value.trim())

        return;

    const {

        data:{user}

    } = await supabaseClient.auth.getUser();

    if(!user){

        alert("Login first");

        return;

    }

    await supabaseClient

    .from("comments")

    .insert({

        movie_id:currentContent.id,

        user_id:user.id,

        username:

        user.email,

        comment:

        input.value

    });

    input.value="";

    loadComments();

}

/* ==========================================================
SHARE BUTTON
========================================================== */

function shareMovie(){

    if(

        navigator.share

    ){

        navigator.share({

            title:

            currentContent.title,

            text:

            currentContent.overview,

            url:

            location.href

        });

    }

    else{

        navigator.clipboard

        .writeText(

            location.href

        );

        alert(

            "Movie link copied."

        );

    }

}

/* ==========================================================
FAVORITES
========================================================== */

function addFavorite(){

    let list = JSON.parse(

        localStorage.getItem(

            "favorites"

        )

    ) || [];

    if(

        !list.includes(

            currentContent.id

        )

    ){

        list.push(

            currentContent.id

        );

    }

    localStorage.setItem(

        "favorites",

        JSON.stringify(list)

    );

    alert(

        "Added to Favorites"

    );

}

/* ==========================================================
AUTO NEXT MOVIE
========================================================== */

async function playNextMovie(){

    const table =

    currentContent.type==="movie"

    ? "movies"

    : "series";

    const {

        data

    } = await supabaseClient

    .from(table)

    .select("*")

    .gt(

        "created_at",

        currentContent.created_at

    )

    .order(

        "created_at"

    )

    .limit(1);

    if(data.length){

        location.href=

        `watch.html?id=${data[0].id}&type=${currentContent.type}`;

    }

}

/* ==========================================================
TRENDING
========================================================== */

async function updateTrending(){

    const score =

    Number(

        currentContent.views || 0

    )

    +

    Number(

        currentContent.likes || 0

    );

    await supabaseClient

    .from(

        currentContent.type==="movie"

        ? "movies"

        : "series"

    )

    .update({

        popularity:score

    })

    .eq(

        "id",

        currentContent.id

    );

}

/* ==========================================================
BOOT PREMIUM
========================================================== */

document.addEventListener(

"DOMContentLoaded",

()=>{

    increaseViews();

    updateLikeCounter();

    loadComments();

    updateTrending();

});
/* ==========================================================
   KIVUSTREAM WATCH ENGINE
   PART 5
   FINAL PREMIUM SYSTEM
========================================================== */

/* ==========================================================
CINEMA MODE
========================================================== */

function toggleCinemaMode(){

    document.body.classList.toggle(

        "cinema-mode"

    );

}

/* ==========================================================
LIGHTS OFF
========================================================== */

function toggleLightsOff(){

    document.body.classList.toggle(

        "lights-off"

    );

}

/* ==========================================================
RECENTLY WATCHED
========================================================== */

function saveRecentlyWatched(){

    let list = JSON.parse(

        localStorage.getItem(

            "recentlyWatched"

        )

    ) || [];

    list = list.filter(

        item => item.id !== currentContent.id

    );

    list.unshift({

        id: currentContent.id,

        type: currentContent.type,

        title: currentContent.title,

        poster: getPoster(currentContent),

        watchedAt: Date.now()

    });

    list = list.slice(0,20);

    localStorage.setItem(

        "recentlyWatched",

        JSON.stringify(list)

    );

}

/* ==========================================================
WATCH HISTORY
========================================================== */

function saveWatchHistory(){

    const history = {

        id: currentContent.id,

        title: currentContent.title,

        type: currentContent.type,

        timestamp: Date.now()

    };

    let list = JSON.parse(

        localStorage.getItem(

            "watchHistory"

        )

    ) || [];

    list.push(history);

    localStorage.setItem(

        "watchHistory",

        JSON.stringify(list)

    );

}

/* ==========================================================
REALTIME SUPABASE
========================================================== */

function enableRealtimeUpdates(){

    const table =

    currentContent.type === "movie"

    ? "movies"

    : "series";

    supabaseClient

    .channel(

        "watch_updates"

    )

    .on(

        "postgres_changes",

        {

            event:"UPDATE",

            schema:"public",

            table:table

        },

        payload => {

            if(

                payload.new.id ===

                currentContent.id

            ){

                console.log(

                    "Content Updated"

                );

                location.reload();

            }

        }

    )

    .subscribe();

}

/* ==========================================================
AUTO TRAILER PREVIEW
========================================================== */

function autoplayTrailerPreview(){

    const trailer =

    document.querySelector(

        "#trailerContainer iframe"

    );

    if(!trailer) return;

    trailer.src +=

    trailer.src.includes("?")

    ? "&autoplay=1&mute=1"

    : "?autoplay=1&mute=1";

}

/* ==========================================================
VIDEO PROTECTION
========================================================== */

function enableVideoProtection(){

    if(!player) return;

    player.controlsList =

    "nodownload";

    player.addEventListener(

        "contextmenu",

        e => {

            e.preventDefault();

        }

    );

}

/* ==========================================================
AUTO SAVE PROGRESS
========================================================== */

function autoSaveProgress(){

    if(!player) return;

    setInterval(()=>{

        const progress = {

            id: currentContent.id,

            position: player.currentTime,

            duration: player.duration

        };

        localStorage.setItem(

            "watch_progress_" +

            currentContent.id,

            JSON.stringify(progress)

        );

    },5000);

}

/* ==========================================================
RESTORE PROGRESS
========================================================== */

function restoreProgress(){

    const saved =

    localStorage.getItem(

        "watch_progress_" +

        currentContent.id

    );

    if(!saved) return;

    const progress =

    JSON.parse(saved);

    player.currentTime =

    progress.position || 0;

}

/* ==========================================================
PLAYER AUTO REFRESH
========================================================== */

function monitorPlayer(){

    if(!player) return;

    player.addEventListener(

        "error",

        ()=>{

            console.log(

                "Reloading Video..."

            );

            player.load();

        }

    );

}

/* ==========================================================
KEYBOARD SHORTCUTS
========================================================== */

document.addEventListener(

"keydown",

e=>{

    if(e.code==="Space"){

        e.preventDefault();

        if(player.paused){

            player.play();

        }

        else{

            player.pause();

        }

    }

    if(e.code==="KeyF"){

        if(player.requestFullscreen){

            player.requestFullscreen();

        }

    }

});

/* ==========================================================
FINAL BOOT
========================================================== */

document.addEventListener(

"DOMContentLoaded",

()=>{

    saveRecentlyWatched();

    saveWatchHistory();

    enableRealtimeUpdates();

    enableVideoProtection();

    autoSaveProgress();

    restoreProgress();

    monitorPlayer();

    console.log(

        "KivuStream Premium Watch Loaded 🚀"

    );

});
