document.addEventListener(
"DOMContentLoaded",
async()=>{


    console.log(
    "Loading KivuStream..."
    );


    const movies =
    await getSupabaseMovies();



    console.log(
    "Supabase:",
    movies
    );



    // Recently added

    renderMovies(
        movies.slice(0,20),
        "recentMovies"
    );



    // Categories

    renderMovies(
        filterCategory(
            movies,
            "action"
        ),
        "actionMovies"
    );



    renderMovies(
        filterCategory(
            movies,
            "indian"
        ),
        "indianMovies"
    );



    renderMovies(
        filterCategory(
            movies,
            "highschool"
        ),
        "highschoolMovies"
    );



    renderMovies(
        filterCategory(
            movies,
            "comedy"
        ),
        "comedyMovies"
    );


});
function filterCategory(
movies,
category
){


return movies.filter(movie=>{


if(!movie.category)

return false;



return movie.category

.toLowerCase()

.includes(

category.toLowerCase()

);


});


}
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
function renderMovies(
movies,
containerID
){


const container =
document.getElementById(containerID);



if(!container)

return;



container.innerHTML="";



movies.forEach(movie=>{


container.innerHTML += `


<div class="movie-card">


<img src="${movie.poster || 'assets/logo.png'}">


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


<span class="badge-chip k4">

4K

</span>


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


}
