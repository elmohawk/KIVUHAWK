/* ==========================================================
   KIVUSTREAM IMPORT ENGINE V2
========================================================== */

let currentSelection = null;

/* ==========================================================
   SEARCH TMDB
========================================================== */

async function searchTMDB() {

    const title = document
        .getElementById("movieSearch")
        .value
        .trim();

    const type = document
        .getElementById("contentType")
        .value;

    if (!title) {

        alert("Enter movie title");

        return;

    }

    const results =
        await smartTMDBSearch(
            title,
            type
        );

    displayTMDBResults(
        results,
        "tmdbResults"
    );

}

/* ==========================================================
   SELECT MOVIE
========================================================== */

async function selectTMDBContent(
    id,
    type
){

    currentSelection = {

        id,

        type

    };

    let details;

    if(type==="movie"){

        details =
        await getTMDBMovieDetails(id);

    }

    else{

        details =
        await getTMDBSeriesDetails(id);

    }

    document.getElementById(
        "selectedPoster"
    ).src =
    details.poster_path
    ?
    `https://image.tmdb.org/t/p/w500${details.poster_path}`
    :
    "../assets/logo.png";

    document.getElementById(
        "selectedTitle"
    ).innerText =
    details.title ||
    details.name;

    document.getElementById(
        "selectedYear"
    ).innerText =
    details.release_date ||
    details.first_air_date ||
    "";

    console.log(details);

}

/* ==========================================================
   IMPORT
========================================================== */

async function importTMDBMovie(){

    if(!currentSelection){

        alert("Select movie first");

        return;

    }

    const payload = {

        tmdb_id:
        currentSelection.id,

        category:
        document.getElementById(
            "category"
        ).value,

        quality:
        document.getElementById(
            "quality"
        ).value,

        video_url:
        document.getElementById(
            "videoURL"
        ).value,

        download_url:
        document.getElementById(
            "downloadURL"
        )?.value || "",

        translator:
        document.getElementById(
            "translator"
        )?.value || ""

    };

    try{

        const response =
        await fetch(

`${SUPABASE_URL}/functions/v1/tmdb-import`,

{

method:"POST",

headers:{

"Content-Type":"application/json",

apikey:SUPABASE_ANON_KEY,

Authorization:
`Bearer ${SUPABASE_ANON_KEY}`

},

body:JSON.stringify(payload)

}

);

        const result =
        await response.json();

        if(!response.ok){

            throw new Error(

                result.error ||

                result.message ||

                "Import Failed"

            );

        }

        alert("✅ Imported Successfully");

        console.log(result);

        refreshAfterImport();

    }

    catch(error){

        console.error(error);

        alert(error.message);

    }

}

/* ==========================================================
   REFRESH
========================================================== */

function refreshAfterImport(){

    document.getElementById(
        "movieSearch"
    ).value="";

    document.getElementById(
        "tmdbResults"
    ).innerHTML="";

    currentSelection=null;

}

/* ==========================================================
   EVENTS
========================================================== */

document
.getElementById("searchBtn")
.addEventListener(
"click",
searchTMDB
);

document
.getElementById("importBtn")
.addEventListener(
"click",
importTMDBMovie
);
