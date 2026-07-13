/* ==========================================================
   KIVUSTREAM MAIN APP
   PART 1
========================================================== */


let allContent = [];



/* ==========================================================
   START WEBSITE
========================================================== */


document.addEventListener(
"DOMContentLoaded",
async()=>{


    console.log(
        "Loading KivuStream..."
    );



    await loadKivuStream();



});




/* ==========================================================
   MAIN LOADER
========================================================== */


async function loadKivuStream(){


    try{


        // Load hero

        if(typeof buildHeroSlider === "function"){

            await buildHeroSlider();

        }




        // Load database

allContent = await getSupabaseContent();


normalizeContent();


console.log(
"Supabase Content:",
allContent
);
        // Recently added


        renderCards(

            allContent.slice(0,20),

            "recentMovies"

        );




        // Categories


        renderCards(

            filterCategory(

                allContent,

                "action"

            ),

            "actionMovies"

        );





        renderCards(

            filterCategory(

                allContent,

                "indian"

            ),

            "indianMovies"

        );





        renderCards(

            filterCategory(

                allContent,

                "highschool"

            ),

            "highschoolMovies"

        );





        renderCards(

            filterCategory(

                allContent,

                "comedy"

            ),

            "comedyMovies"

        );



    }


    catch(error){


        console.error(

            "KivuStream Loading Error:",

            error

        );


    }



}




/* ==========================================================
   LOAD MOVIES + SERIES
========================================================== */


async function getSupabaseContent(){



    const [

        moviesResult,

        seriesResult


    ] = await Promise.all([



        supabaseClient

        .from("movies")

        .select("*")

        .order(

            "created_at",

            {

            ascending:false

            }



        ),





        supabaseClient

        .from("series")

        .select("*")

        .order(

            "created_at",

            {

            ascending:false

            }

        )



    ]);




    if(moviesResult.error){

        console.error(

            "Movies Error:",

            moviesResult.error

        );

    }




    if(seriesResult.error){

        console.error(

            "Series Error:",

            seriesResult.error

        );

    }





    const movies =

    (moviesResult.data || [])

    .map(item=>({

        ...item,

        type:"movie"

    }));





    const series =

    (seriesResult.data || [])

    .map(item=>({

        ...item,

        type:"series"

    }));





    return [

        ...movies,

        ...series


    ]

    .sort(

        (a,b)=>

        new Date(b.created_at)

        -

        new Date(a.created_at)

    );
}
/* ==========================================================
   CATEGORY SYSTEM
   PART 2
========================================================== */


/* ==========================================================
   FILTER CATEGORY
========================================================== */


function filterCategory(

    content,

    category

){


    if(!content || !category)

        return [];



    return content.filter(item=>{



        if(!item.category)

            return false;




        return item.category

        .toLowerCase()

        .includes(

            category.toLowerCase()

        );



    });



}




/* ==========================================================
   FILTER TYPE
========================================================== */


function filterType(

    content,

    type

){


    return content.filter(item=>{


        return item.type === type;


    });


}





/* ==========================================================
   MOVIE SECTION
========================================================== */


function loadMovieSections(){


    const movies =

    filterType(

        allContent,

        "movie"

    );



    renderCards(

        movies,

        "moviesContainer"

    );


}





/* ==========================================================
   SERIES SECTION
========================================================== */


function loadSeriesSection(){


    const series =

    filterType(

        allContent,

        "series"

    );



    renderCards(

        series,

        "seriesMovies"

    );


}




/* ==========================================================
   TRENDING
========================================================== */


function loadTrending(){


    const trending =

    [...allContent]

    .sort(

        (a,b)=>{


            return (

            Number(b.rating || 0)

            -

            Number(a.rating || 0)

            );


        }

    )

    .slice(

        0,

        20

    );



    renderCards(

        trending,

        "trendingMovies"

    );


}





/* ==========================================================
   LATEST UPDATES
========================================================== */


function loadLatest(){


    const latest =

    [...allContent]

    .sort(

        (a,b)=>

        new Date(b.created_at)

        -

        new Date(a.created_at)

    )

    .slice(

        0,

        20

    );



    renderCards(

        latest,

        "recentMovies"

    );


}





/* ==========================================================
   SAFE REFRESH
========================================================== */
async function refreshKivuStream(){



    allContent =

    await getSupabaseContent();



    loadLatest();


    loadTrending();


    loadSeriesSection();



    console.log(

        "Content refreshed"

    );
}
/* ==========================================================
   KIVUSTREAM DATA POLISH
   PART 3
========================================================== */


/* ==========================================================
   IMAGE PROTECTION
========================================================== */


function safeImage(url){


    if(

        url &&

        url.trim() !== ""

    ){

        return url;

    }


    return "assets/logo.png";


}





/* ==========================================================
   FORMAT YEAR
========================================================== */


function formatYear(date){


    if(!date)

        return "";



    const year =

    new Date(date)

    .getFullYear();



    return year || "";

}





/* ==========================================================
   FORMAT RATING
========================================================== */


function formatRating(value){


    if(!value)

        return "N/A";



    const rating =

    Number(value);



    if(isNaN(rating))

        return "N/A";



    return rating.toFixed(1);


}





/* ==========================================================
   PREPARE CONTENT DATA
========================================================== */


function prepareContent(item){



    return {


        ...item,


        poster:

        safeImage(

            item.poster

        ),



        backdrop:

        safeImage(

            item.backdrop

        ),



        rating:

        formatRating(

            item.rating

        ),



        year:

        item.year ||

        formatYear(

            item.created_at

        ),



        title:

        item.title ||

        "Unknown Title"



    };



}





/* ==========================================================
   NORMALIZE ALL CONTENT
========================================================== */


function normalizeContent(){


    allContent =

    allContent.map(

        item =>

        prepareContent(item)

    );


}





/* ==========================================================
   AUTO REFRESH DATABASE
========================================================== */


function enableAutoRefresh(){



    setInterval(

        async()=>{


            console.log(

                "Checking KivuStream updates..."

            );



            const updated =

            await getSupabaseContent();



            if(

                updated.length !==

                allContent.length

            ){


                allContent = updated;


                normalizeContent();


                loadLatest();


                loadTrending();


                loadSeriesSection();



                console.log(

                    "Homepage updated"

                );


            }



        },

        60000

    );



}





/* ==========================================================
   FINAL APP START
========================================================== */


async function startKivuStream(){



    normalizeContent();



    loadLatest();



    loadTrending();



    loadSeriesSection();



    enableAutoRefresh();



    console.log(

        "KivuStream Ready 🚀"

    );



}





/* ==========================================================
   CONNECT WITH MAIN LOADER
========================================================== */
async function startKivuStream(){


    normalizeContent();


    loadLatest();


    loadTrending();


    loadSeriesSection();


    enableAutoRefresh();


    console.log(
        "KivuStream Ready 🚀"
    );


}
