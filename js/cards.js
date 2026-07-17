/* =====================================
   KIVUSTREAM CINEMATIC CARD ENGINE
   PART 1
   CARD RENDERING
===================================== */

/* =====================================
   CREATE MOVIE CARDS
===================================== */

function renderCards(content, containerID) {

    const container = document.getElementById(containerID);

    if (!container) return;

    container.innerHTML = "";

    if (!content || content.length === 0) {

        container.innerHTML = `
            <div class="empty-content">
                <h3>No content available</h3>
            </div>
        `;

        return;

    }

    content.forEach(movie => {

        container.innerHTML += `

        <div class="movie-card"
             onclick="openWatchPage('${movie.id}','${movie.type}')">

            <span class="content-type">
                ${movie.type === "series" ? "SERIES" : "MOVIE"}
            </span>

            <img
                src="${getPoster(movie)}"
                loading="lazy"
                alt="${movie.title}"
                onerror="this.src='assets/logo.png';"
            >

            <div class="movie-overlay">

                <h3 class="movie-title">
                    ${movie.title || "Unknown Title"}
                </h3>

                <div class="movie-meta">

                    <span>
                        ⭐ ${movie.rating || movie.vote_average || "N/A"}
                    </span>

                    <span>
                        ${movie.year || ""}
                    </span>

                    <span>
                        ${movie.runtime ? movie.runtime + " min" : ""}
                    </span>

                </div>

                <div class="movie-genres">
                    ${movie.genres || ""}
                </div>

                <div class="badges">

                    <span class="badge-chip hd">
                        ${getQuality(movie)}
                    </span>

                    ${
                        Number(movie.rating || movie.vote_average || 0) >= 8
                        ? `<span class="badge-chip top">TOP</span>`
                        : ""
                    }

                </div>

                <div class="card-buttons">

                    <button class="play-btn">

                        ▶ Watch

                    </button>

                </div>

            </div>

        </div>

        `;

    });

    activateCard3D();

    refreshCardImages();

    enableCardShine();

}

/* =====================================
   OPEN WATCH PAGE
===================================== */

function openWatchPage(id, type) {

    if (!id) return;

    window.location.href =
        `watch.html?id=${id}&type=${type}`;

}

/* =====================================
   3D CARD EFFECT
===================================== */

function activateCard3D() {

    document
        .querySelectorAll(".movie-card")
        .forEach(card => {

            card.onmousemove = e => {

                const rect = card.getBoundingClientRect();

                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const rotateY =
                    ((x - rect.width / 2) / rect.width) * 12;

                const rotateX =
                    ((y - rect.height / 2) / rect.height) * -12;

                card.style.transform = `
                    perspective(1200px)
                    rotateX(${rotateX}deg)
                    rotateY(${rotateY}deg)
                    translateY(-10px)
                    scale(1.03)
                `;

            };

            card.onmouseleave = () => {

                card.style.transform = `
                    perspective(1200px)
                    rotateX(0deg)
                    rotateY(0deg)
                    translateY(0px)
                    scale(1)
                `;

            };

        });

}
/* =====================================
   KIVUSTREAM CARD ENGINE
   PART 2
   IMAGE + QUALITY + UI SYSTEM
===================================== */

/* =====================================
   SAFE POSTER HANDLER
===================================== */

function getPoster(movie){

    // Supabase full URL
    if(movie.poster && movie.poster !== ""){
        return movie.poster;
    }

    // TMDB poster path
    if(movie.poster_path && movie.poster_path !== ""){

        if(movie.poster_path.startsWith("http")){
            return movie.poster_path;
        }

        return `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
    }

    // Supabase backdrop
    if(movie.backdrop && movie.backdrop !== ""){
        return movie.backdrop;
    }

    // TMDB backdrop
    if(movie.backdrop_path && movie.backdrop_path !== ""){

        if(movie.backdrop_path.startsWith("http")){
            return movie.backdrop_path;
        }

        return `https://image.tmdb.org/t/p/w780${movie.backdrop_path}`;
    }

    return "assets/logo.png";

}

/* =====================================
   SAFE BACKDROP
===================================== */

function getBackdrop(movie){

    if(movie.backdrop){
        return movie.backdrop;
    }

    if(movie.backdrop_path){

        if(movie.backdrop_path.startsWith("http")){
            return movie.backdrop_path;
        }

        return `https://image.tmdb.org/t/p/original${movie.backdrop_path}`;
    }

    return "assets/default-backdrop.jpg";

}

/* =====================================
   QUALITY SYSTEM
===================================== */

function getQuality(movie){

    if(movie.quality && movie.quality !== "")
        return movie.quality;

    if(movie.resolution && movie.resolution !== "")
        return movie.resolution;

    if(movie.video_url &&
       movie.video_url.includes("2160"))
        return "4K";

    if(movie.video_url &&
       movie.video_url.includes("1080"))
        return "FHD";

    if(movie.video_url &&
       movie.video_url.includes("720"))
        return "HD";

    return "HD";

}

/* =====================================
   SERIES LABEL
===================================== */

function episodeLabel(movie){

    if(movie.type === "series"){

        if(movie.episodes){

            return `${movie.episodes} Episodes`;

        }

        return "TV Series";

    }

    return "";

}

/* =====================================
   SAFE IMAGE REFRESH
===================================== */

function refreshCardImages(){

    document
    .querySelectorAll(".movie-card img")
    .forEach(img=>{

        img.onerror=function(){

            this.src="assets/logo.png";

        };

    });

}

/* =====================================
   CARD SHINE EFFECT
===================================== */

function enableCardShine(){

    document
    .querySelectorAll(".movie-card")
    .forEach(card=>{

        card.addEventListener("mousemove",e=>{

            const rect=card.getBoundingClientRect();

            const x=e.clientX-rect.left;

            const y=e.clientY-rect.top;

            card.style.setProperty(
                "--shine-x",
                `${x}px`
            );

            card.style.setProperty(
                "--shine-y",
                `${y}px`
            );

        });

    });

}

/* =====================================
   PLAY BUTTON CONTROL
===================================== */

document.addEventListener("click",e=>{

    if(!e.target.classList.contains("play-btn"))
        return;

    e.preventDefault();

    e.stopPropagation();

    const card=e.target.closest(".movie-card");

    if(card){

        card.click();

    }

});

/* =====================================
   WISHLIST SYSTEM
===================================== */

function addWishlist(id){

    let list=
    JSON.parse(
        localStorage.getItem("kivustreamWishlist")
    ) || [];

    if(!list.includes(id)){

        list.push(id);

        localStorage.setItem(

            "kivustreamWishlist",

            JSON.stringify(list)

        );

    }

    console.log("Wishlist Updated",id);

}

/* =====================================
   UPDATE CARD SYSTEM
===================================== */

function updateCardSystem(){

    refreshCardImages();

    enableCardShine();

    activateCard3D();

    console.log("Cards Updated");

}
/* =====================================
   KIVUSTREAM CARD ENGINE
   PART 3
   PERFORMANCE + ANIMATION
===================================== */

/* =====================================
   ENABLE LAZY LOADING
===================================== */

function enableLazyImages(){

    const images = document.querySelectorAll(".movie-card img");

    if(!("IntersectionObserver" in window)){
        return;
    }

    const observer = new IntersectionObserver((entries)=>{

        entries.forEach(entry=>{

            if(entry.isIntersecting){

                const img = entry.target;

                if(img.dataset.src){

                    img.src = img.dataset.src;

                }

                observer.unobserve(img);

            }

        });

    });

    images.forEach(img=>{

        observer.observe(img);

    });

}

/* =====================================
   CREATE STAR RATING
===================================== */

function createStars(rating){

    rating = Number(rating || 0);

    let html = "";

    for(let i=1;i<=5;i++){

        if(rating >= i*2){

            html += "★";

        }

        else{

            html += "☆";

        }

    }

    return html;

}

/* =====================================
   VIEW COUNTER
===================================== */

async function increaseViews(movieId,type="movie"){

    try{

        const table = type==="series"
            ? "series"
            : "movies";

        const {data} =
        await supabaseClient
        .from(table)
        .select("views")
        .eq("id",movieId)
        .single();

        const views =
        Number(data?.views || 0)+1;

        await supabaseClient
        .from(table)
        .update({
            views:views
        })
        .eq("id",movieId);

    }

    catch(error){

        console.log("View counter skipped");

    }

}

/* =====================================
   CARD ANIMATION
===================================== */

function observeCards(){

    const cards =
    document.querySelectorAll(".movie-card");

    if(!("IntersectionObserver" in window))
        return;

    const observer =
    new IntersectionObserver(entries=>{

        entries.forEach(entry=>{

            if(entry.isIntersecting){

                entry.target.classList.add("show-card");

                observer.unobserve(entry.target);

            }

        });

    },{

        threshold:.15

    });

    cards.forEach(card=>{

        observer.observe(card);

    });

}

/* =====================================
   LOAD MORE READY
===================================== */

let currentPage = 1;

function loadMoreReady(){

    let loading=false;

    window.addEventListener("scroll",()=>{

        if(loading) return;

        const bottom=

        window.innerHeight+

        window.scrollY>=

        document.body.offsetHeight-300;

        if(bottom){

            loading=true;

            console.log(
                "Ready for page",
                currentPage+1
            );

            setTimeout(()=>{

                currentPage++;

                loading=false;

            },500);

        }

    });

}

/* =====================================
   SEARCH FILTER
===================================== */

function filterCards(keyword){

    keyword = keyword.toLowerCase();

    document
    .querySelectorAll(".movie-card")
    .forEach(card=>{

        const title =
        card
        .querySelector(".movie-title")
        .textContent
        .toLowerCase();

        card.style.display =
        title.includes(keyword)
        ? ""
        : "none";

    });

}

/* =====================================
   SORT BY RATING
===================================== */

function sortCardsByRating(content){

    return [...content].sort((a,b)=>{

        return Number(b.rating||0)-Number(a.rating||0);

    });

}

/* =====================================
   SORT BY YEAR
===================================== */

function sortCardsByYear(content){

    return [...content].sort((a,b)=>{

        return Number(b.year||0)-Number(a.year||0);

    });

}

/* =====================================
   FINAL INITIALIZATION
===================================== */

function initCards(){

    enableLazyImages();

    observeCards();

    loadMoreReady();

    updateCardSystem();

    console.log(
        "KivuStream Premium Cards Loaded 🚀"
    );

}

/* =====================================
   AUTO START
===================================== */

document.addEventListener(

    "DOMContentLoaded",

    ()=>{

        initCards();

    }

);
