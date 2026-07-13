/* ===========================
   HERO SWIPER
=========================== */

let heroSwiper;

async function buildHeroSlider() {

    try {

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

        const movies = (moviesResult.data || []).map(movie => ({
            ...movie,
            type: "movie"
        }));

        const series = (seriesResult.data || []).map(show => ({
            ...show,
            type: "series"
        }));

        const latest = [...movies, ...series]
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 8);

        renderHero(latest);

    } catch (err) {

        console.error("Hero Error:", err);

    }

}

function renderHero(items) {

    const hero = document.getElementById("heroSlider");

    if (!hero) return;

    hero.innerHTML = "";

    items.forEach(item => {

        const backdrop =
            item.backdrop ||
            item.poster ||
            "assets/default-backdrop.jpg";

        hero.innerHTML += `

<div class="swiper-slide hero-slide"
style="background-image:url('${backdrop}')">

<div class="hero-overlay">

<div class="hero-info">

<span class="hero-badge">

${item.type.toUpperCase()}

</span>

<h1>${item.title}</h1>

<p>${item.description || ""}</p>

<div class="hero-buttons">

<button
onclick="window.location.href='watch.html?id=${item.id}'">

<i class="fa-solid fa-play"></i>

Watch Now

</button>

</div>

</div>

</div>

</div>

`;

    });

    if (heroSwiper) {

        heroSwiper.destroy(true, true);

    }

    heroSwiper = new Swiper(".heroSwiper", {

        effect: "coverflow",

        grabCursor: true,

        centeredSlides: true,

        slidesPerView: 1.15,

        loop: true,

        speed: 900,

        autoplay: {

            delay: 5000,

            disableOnInteraction: false

        },

        coverflowEffect: {

            rotate: 20,

            depth: 250,

            modifier: 1,

            slideShadows: false

        }

    });

}
