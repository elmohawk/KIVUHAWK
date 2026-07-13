/* ===========================
   HERO 3D SWIPER
=========================== */

let heroSwiper;

async function buildHeroSlider(){

const {

data,

error

}=await supabaseClient

.from("movies")

.select("*")

.order(

"created_at",

{

ascending:false

}

)

.limit(8);

if(error){

console.error(error);

return;

}

renderHero(data);

}
function renderHero(movies){

const hero=document.getElementById("heroSlider");

hero.innerHTML="";

movies.forEach(movie=>{

hero.innerHTML+=`

<div class="swiper-slide hero-slide"

style="background-image:url('${movie.backdrop}')">

<div class="hero-overlay">

<div class="hero-info">

<span class="hero-badge">

Recently Added

</span>

<h1>

${movie.title}

</h1>

<p>

${movie.description}

</p>

<div class="hero-buttons">

<button

onclick="location.href='watch.html?id=${movie.id}'">

▶ Watch Now

</button>

</div>

</div>

</div>

</div>

`;

});

new Swiper(".heroSwiper",{

loop:true,

autoplay:{

delay:5000

},

effect:"fade",

speed:1000

});

}
const [moviesResult, seriesResult] = await Promise.all([
    supabaseClient
        .from("movies")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5),

    supabaseClient
        .from("series")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5)
]);

const movies = (moviesResult.data || []).map(item => ({
    ...item,
    type: "movie"
}));

const series = (seriesResult.data || []).map(item => ({
    ...item,
    type: "series"
}));

const latest = [...movies, ...series]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 8);

renderHero(latest);
    heroSwiper = new Swiper(".heroSwiper",{

        effect:"coverflow",

        grabCursor:true,

        centeredSlides:true,

        slidesPerView:1.2,

        loop:true,

        speed:900,

        autoplay:{
            delay:5000
        },

        coverflowEffect:{

            rotate:20,

            stretch:0,

            depth:220,

            modifier:1,

            slideShadows:false

        }

    });

}
