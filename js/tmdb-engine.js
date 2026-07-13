/* ==========================================================
   KIVUSTREAM TMDB ENGINE
   TITLE SEARCH + CONTENT IMPORT SYSTEM
========================================================== */


/* ==========================================================
   SEARCH TMDB BY TITLE
========================================================== */


async function searchTMDBTitle(
    title,
    type="movie"
){


    if(!title)

        return [];



    let url;



    if(type === "series"){


        url =

        `https://api.themoviedb.org/3/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}`;


    }

    else{


        url =

        `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}`;


    }

    try{


        const response =

        await fetch(url);



        const data =

        await response.json();



        return data.results || [];



    }


    catch(error){


        console.error(

            "TMDB Search Error:",

            error

        );


        return [];


    }



}

/* ==========================================================
   GET MOVIE DETAILS
========================================================== */


async function getTMDBMovieDetails(
    id
){


    const response =

    await fetch(

    `https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos`

    );



    return await response.json();


}

/* ==========================================================
   GET SERIES DETAILS
========================================================== */


async function getTMDBSeriesDetails(
    id
){


    const response =

    await fetch(

    `https://api.themoviedb.org/3/tv/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos`

    );

    return await response.json();


}
/* ==========================================================
   FORMAT MOVIE FOR SUPABASE
========================================================== */


function prepareTMDBMovie(
    movie,
    extra
){


return {


    title:

    movie.title,



    tmdb_id:

    movie.id,



   poster:null,
backdrop:null,



    backdrop:

    movie.backdrop_path
    ?
    `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    :
    null,



    overview:

    movie.overview || "",



    rating:

    movie.vote_average || 0,



    year:

    movie.release_date
    ?
    Number(
        movie.release_date.substring(0,4)
    )
    :
    null,



    genres:

    extra.genres

    ?

    extra.genres

    .map(g=>g.name)

    .join(",")

    :

    "",



};

}
/* ==========================================================
   FORMAT SERIES FOR SUPABASE
========================================================== */


function prepareTMDBSeries(
    series,
    extra
){


return {


    title:

    series.name,



    tmdb_id:

    series.id,



    poster:

    series.poster_path
    ?
    `https://image.tmdb.org/t/p/original${series.poster_path}`
    :
    null,



    backdrop:

    series.backdrop_path
    ?
    `https://image.tmdb.org/t/p/original${series.backdrop_path}`
    :
    null,



    overview:

    series.overview || "",



    rating:

    series.vote_average || 0,



    year:

    series.first_air_date
    ?
    Number(
        series.first_air_date.substring(0,4)
    )
    :
    null,



    genres:

    extra.genres

    ?

    extra.genres

    .map(g=>g.name)

    .join(",")

    :

    ""



};


}
/* ==========================================================
   KIVUSTREAM TMDB IMPORT ENGINE
   SAVE TMDB DATA INTO SUPABASE
========================================================== */


/* ==========================================================
   IMPORT MOVIE TO SUPABASE
========================================================== */
/* ==========================================================
   IMPORT MOVIE WITH STORAGE IMAGES
========================================================== */


async function importMovieToSupabase(

tmdbMovie,

videoURL="",

category=""

){


try{


console.log(

"Importing Movie:",

tmdbMovie.title

);





const details =

await getTMDBMovieDetails(

tmdbMovie.id

);





/* =========================
   CREATE FILE NAMES
========================= */


const safeName =

tmdbMovie.title

.toLowerCase()

.replace(/[^a-z0-9]+/g,"-");





/* =========================
   UPLOAD POSTER
========================= */


let posterURL = null;



if(details.poster_path){


posterURL =

await uploadImageToStorage(

`https://image.tmdb.org/t/p/original${details.poster_path}`,

`posters/${safeName}-poster.jpg`

);


}






/* =========================
   UPLOAD BACKDROP
========================= */


let backdropURL = null;



if(details.backdrop_path){


backdropURL =

await uploadImageToStorage(

`https://image.tmdb.org/t/p/original${details.backdrop_path}`,

`posters/${safeName}-backdrop.jpg`

);


}







const movieData = {


title:

details.title,



tmdb_id:

details.id,



poster:

posterURL,



backdrop:

backdropURL,



overview:

details.overview,



rating:

details.vote_average,



year:

details.release_date

?

Number(

details.release_date.substring(0,4)

)

:

null,



genres:

details.genres

.map(g=>g.name)

.join(","),



category:category,



video_url:videoURL



};







const {

data,

error

}=

await supabaseClient


.from("movies")


.insert([movieData])


.select();







if(error){


console.error(

"Movie Save Error:",

error

);


return null;


}





console.log(

"Movie Saved 🚀",

data

);



return data[0];



}

catch(error){


console.error(

"Import Failed:",

error

);


return null;


}



}
/* ==========================================================
   IMPORT SERIES WITH STORAGE IMAGES
========================================================== */


async function importSeriesToSupabase(

tmdbSeries,

category=""

){


try{


const details =

await getTMDBSeriesDetails(

tmdbSeries.id

);





const safeName =

details.name

.toLowerCase()

.replace(/[^a-z0-9]+/g,"-");






let posterURL=null;


let backdropURL=null;






if(details.poster_path){


posterURL =

await uploadImageToStorage(

`https://image.tmdb.org/t/p/original${details.poster_path}`,

`posters/${safeName}-poster.jpg`

);


}






if(details.backdrop_path){


backdropURL =

await uploadImageToStorage(

`https://image.tmdb.org/t/p/original${details.backdrop_path}`,

`posters/${safeName}-backdrop.jpg`

);


}







const seriesData={


title:

details.name,



tmdb_id:

details.id,



poster:

posterURL,



backdrop:

backdropURL,



overview:

details.overview,



rating:

details.vote_average,



year:

details.first_air_date

?

Number(

details.first_air_date.substring(0,4)

)

:

null,



genres:

details.genres

.map(g=>g.name)

.join(","),



category:category



};






const {

data,

error

}=

await supabaseClient


.from("series")


.insert([seriesData])


.select();






if(error){


console.error(

"Series Save Error:",

error

);


return null;


}





console.log(

"Series Imported 🚀",

data

);



return data[0];



}


catch(error){


console.error(

"Series Import Failed:",

error

);


return null;


}


}
/* ==========================================================
   KIVUSTREAM TMDB SMART SEARCH
========================================================== */


/* ==========================================================
   UNIVERSAL SEARCH
========================================================== */


async function smartTMDBSearch(

    title,

    type="movie"

){


    const results =

    await searchTMDBTitle(

        title,

        type

    );



    return results.map(item=>({


        id:item.id,


        title:

        item.title || item.name,



        year:

        item.release_date

        ?

        item.release_date.substring(0,4)

        :

        item.first_air_date

        ?

        item.first_air_date.substring(0,4)

        :

        "",



        poster:

        item.poster_path

        ?

        `https://image.tmdb.org/t/p/w500${item.poster_path}`

        :

        "assets/logo.png",



        type:type



    }));


}






/* ==========================================================
   DISPLAY SEARCH RESULTS
========================================================== */


function displayTMDBResults(

    results,

    containerID

){



const container =

document.getElementById(

containerID

);



if(!container)

return;




container.innerHTML="";





results.forEach(item=>{



container.innerHTML += `



<div class="tmdb-result-card">



<img

src="${item.poster}"

>



<div class="tmdb-result-info">



<h3>

${item.title}

</h3>



<p>

${item.year}

</p>



<button

onclick="selectTMDBContent(

${item.id},

'${item.type}'

)"

>

Import

</button>



</div>



</div>



`;



});



}
