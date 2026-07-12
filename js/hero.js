/* ===========================
   HERO 3D SWIPER
=========================== */

let heroSwiper;

async function buildHeroSlider(){

    const movies = await fetchTMDB(endpoints.trending);

    const slider = document.getElementById("heroSlider");

    slider.innerHTML = "";

    movies.slice(0,8).forEach(movie=>{

        slider.innerHTML += `

        <div class="swiper-slide">

            <div class="hero-slide"

            style="background-image:url(
            https://image.tmdb.org/t/p/original${movie.backdrop_path}
            )">

                <div class="hero-overlay">

                    <div class="hero-info">

                        <span class="badge">

                            ⭐ ${movie.vote_average.toFixed(1)}

                        </span>

                        <h1>${movie.title}</h1>

                        <p>${movie.overview}</p>

                        <div class="hero-buttons">

                            <button class="watchBtn">

                                ▶ Watch

                            </button>

                            <button class="infoBtn">

                                Details

                            </button>

                        </div>

                    </div>

                </div>

            </div>

        </div>

        `;

    });

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
