document.addEventListener("DOMContentLoaded", async ()=>{


    console.log("KivuStream Loading...");


    // Load Hero from Supabase
    await buildHeroSlider();



    // Load Movies from Supabase

    const movies = await getMovies();



    console.log(
        "Supabase Content:",
        movies
    );



    renderMovies(
        movies.filter(
            movie=>movie.type==="movie"
        ),
        "trendingMovies"
    );



    renderMovies(
        movies.filter(
            movie=>movie.category==="popular"
        ),
        "popularMovies"
    );



    renderMovies(
        movies.filter(
            movie=>movie.type==="series"
        ),
        "tvShows"
    );


});
async function getMovies(){


    const {
        data,
        error

    } = await supabaseClient

    .from("movies")

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

        return [];

    }


    return data || [];


}
function renderMovies(items, containerID){


    const container =
    document.getElementById(containerID);


    if(!container){

        console.error(
        "Missing:",
        containerID
        );

        return;

    }



    container.innerHTML="";



    items.forEach(movie=>{


        container.innerHTML += `

        <div class="movie-card">


            <img src="${movie.poster}">


            <div class="movie-overlay">


                <h3 class="movie-title">

                    ${movie.title}

                </h3>


                <div class="movie-meta">

                    <span>
                    ⭐ ${movie.rating || "N/A"}
                    </span>


                    <span>
                    ${movie.year || ""}
                    </span>

                </div>


                <div class="badges">

                    <span class="badge-chip hd">
                    HD
                    </span>

                </div>


            </div>


        </div>

        `;


    });


}
