/* ==========================================================
   KIVUSTREAM TRENDING SYSTEM
   PART 1
========================================================== */


let trendingContent = [];

let filteredTrending = [];

let visibleTrending = 24;

let heroTrending = null;


/* ==========================================================
   START TRENDING PAGE
========================================================== */


document.addEventListener(

    "DOMContentLoaded",

    async()=>{


        console.log(

            "Loading KivuStream Trending..."

        );


        await loadTrendingPage();


    }

);



/* ==========================================================
   MAIN LOADER
========================================================== */


async function loadTrendingPage(){


    try{


        await getTrendingContent();


        buildTrendingHero();


        loadTrendingToday();


        loadTrendingWeek();


        loadTrendingMovies();


        loadTrendingSeries();


        loadTopRated();


        loadAllTrending();


        setupSearch();


        setupFilters();


        setupLoadMore();


        setupScrollTop();



    }


    catch(error){


        console.error(

            "Trending Error:",

            error

        );


    }



}



/* ==========================================================
   LOAD MOVIES + SERIES FROM SUPABASE
========================================================== */


async function getTrendingContent(){


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





    const movies =


    (moviesResult.data || [])

    .map(movie=>({


        ...movie,


        type:"movie"


    }));





    const series =


    (seriesResult.data || [])

    .map(show=>({


        ...show,


        type:"series"


    }));





    trendingContent = [


        ...movies,


        ...series



    ]

    .sort((a,b)=>{


        return (

            Number(b.rating || 0)

            -

            Number(a.rating || 0)

        );


    });





    filteredTrending =

    [...trendingContent];





    console.log(

        "Trending Content:",

        trendingContent

    );


}
/* ==========================================================
   KIVUSTREAM TRENDING SYSTEM
   PART 2
========================================================== */


/* ==========================================================
   TRENDING TODAY
========================================================== */


function loadTrendingToday(){


    const today =


    [...trendingContent]

    .sort((a,b)=>{


        return (

            new Date(b.created_at)

            -

            new Date(a.created_at)

        );


    })

    .slice(0,12);



    renderTrendingCards(

        today,

        "trendingToday"

    );


}




/* ==========================================================
   TRENDING THIS WEEK
========================================================== */


function loadTrendingWeek(){


    const week =


    [...trendingContent]

    .sort((a,b)=>{


        return (

            Number(b.rating || 0)

            -

            Number(a.rating || 0)

        );


    })

    .slice(0,12);



    renderTrendingCards(

        week,

        "trendingWeek"

    );


}




/* ==========================================================
   TRENDING MOVIES
========================================================== */


function loadTrendingMovies(){


    const movies =


    trendingContent.filter(item=>{


        return item.type === "movie";


    })

    .slice(0,20);



    renderTrendingCards(

        movies,

        "trendingMovies"

    );


}





/* ==========================================================
   TRENDING SERIES
========================================================== */


function loadTrendingSeries(){


    const series =


    trendingContent.filter(item=>{


        return item.type === "series";


    })

    .slice(0,20);



    renderTrendingCards(

        series,

        "trendingSeries"

    );


}





/* ==========================================================
   TOP RATED
========================================================== */


function loadTopRated(){


    const rated =


    [...trendingContent]

    .sort((a,b)=>{


        return (

            Number(b.rating || 0)

            -

            Number(a.rating || 0)

        );


    })

    .slice(0,20);



    renderTrendingCards(

        rated,

        "topRated"

    );


}





/* ==========================================================
   ALL TRENDING
========================================================== */


function loadAllTrending(){


    renderTrendingCards(


        filteredTrending.slice(

            0,

            visibleTrending

        ),


        "allTrending"


    );


}





/* ==========================================================
   CARD BUILDER
========================================================== */


function renderTrendingCards(

content,

containerID

){



    const container =

    document.getElementById(

        containerID

    );



    if(!container)

        return;




    container.innerHTML="";




    content.forEach(item=>{



        const poster =


        item.poster ||

        "assets/logo.png";



        const title =


        item.title ||

        "Unknown";



        const type =


        item.type;



        container.innerHTML += `



<div class="movie-card"

onclick="openTrendingContent('${item.id}','${type}')">



<div class="top-tag">


${

type==="movie"

?

"🎬 Movie"

:

"📺 Series"

}


</div>




<img

src="${poster}"

loading="lazy"

alt="${title}">



<div class="movie-overlay">



<h3 class="movie-title">

${title}

</h3>




<div class="movie-meta">


<span class="rating">

⭐ ${item.rating || "N/A"}

</span>



<span>

${item.year || ""}

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



<button

class="play-btn">


<i class="fa-solid fa-play"></i>

Watch


</button>



<button

class="watchlist-btn">


<i class="fa-solid fa-heart"></i>


</button>



</div>



</div>



</div>


`;



    });



    if(typeof initCards === "function"){


        initCards();


    }
}

/* ==========================================================
   OPEN WATCH PAGE
========================================================== */


function openTrendingContent(

id,

type

){


    location.href =


    `watch.html?id=${id}&type=${type}`;


}
/* ==========================================================
   KIVUSTREAM TRENDING SYSTEM
   PART 3 FINAL
========================================================== */


/* ==========================================================
   HERO BUILDER
========================================================== */


function buildTrendingHero(){


    if(!trendingContent.length)

        return;



    heroTrending =

    trendingContent[0];



    updateHero(

        heroTrending

    );


}





function updateHero(item){


    const backdrop =

    document.getElementById(

        "heroBackdrop"

    );



    const title =

    document.getElementById(

        "heroTitle"

    );



    const description =

    document.getElementById(

        "heroDescription"

    );



    const watchBtn =

    document.getElementById(

        "heroWatchBtn"

    );



    const infoBtn =

    document.getElementById(

        "heroInfoBtn"

    );




    if(backdrop){


        backdrop.style.backgroundImage =


        `url('${item.backdrop || item.poster || "assets/logo.png"}')`;


    }





    if(title)

        title.textContent = item.title;





    if(description)

        description.textContent =


        item.description ||

        "Watch trending movies and series on KivuStream.";






    if(watchBtn){


        watchBtn.onclick=()=>{


            openTrendingContent(

                item.id,

                item.type

            );


        };


    }




    if(infoBtn){


        infoBtn.onclick=()=>{


            openTrendingContent(

                item.id,

                item.type

            );


        };


    }



}





/* ==========================================================
   AUTO HERO ROTATION
========================================================== */


setInterval(()=>{


    if(

        trendingContent.length < 2

    )

        return;




    const random =


    Math.floor(

        Math.random()

        *

        trendingContent.length

    );




    heroTrending =

    trendingContent[random];



    updateHero(

        heroTrending

    );



},10000);






/* ==========================================================
   SEARCH SYSTEM
========================================================== */


function setupSearch(){



    const search =

    document.getElementById(

        "searchInput"

    );



    if(!search)

        return;





    search.addEventListener(

        "input",

        ()=>{


            const value =


            search.value

            .toLowerCase()

            .trim();




            filteredTrending =


            trendingContent.filter(item=>{


                return(



                    item.title

                    ?.toLowerCase()

                    .includes(value)



                    ||



                    item.category

                    ?.toLowerCase()

                    .includes(value)



                    ||



                    item.type

                    ?.toLowerCase()

                    .includes(value)



                );


            });





            visibleTrending = 24;



            loadAllTrending();



        }


    );


}






/* ==========================================================
   FILTER SYSTEM
========================================================== */


function setupFilters(){



    const buttons =

    document.querySelectorAll(

        ".genre-btn"

    );




    buttons.forEach(button=>{


        button.onclick=()=>{



            buttons.forEach(btn=>{


                btn.classList.remove(

                    "active"

                );


            });




            button.classList.add(

                "active"

            );



            const filter =

            button.dataset.genre;





            if(filter==="all"){


                filteredTrending =


                [...trendingContent];


            }

            else if(

                filter==="movie"

                ||

                filter==="series"

            ){


                filteredTrending =


                trendingContent.filter(item=>{


                    return item.type === filter;


                });


            }

            else{


                filteredTrending =


                trendingContent.filter(item=>{


                    return item.category

                    ?.toLowerCase()

                    .includes(

                        filter

                        .toLowerCase()

                    );


                });



            }





            visibleTrending = 24;



            loadAllTrending();



        };


    });



}






/* ==========================================================
   LOAD MORE
========================================================== */


function setupLoadMore(){



    const button =

    document.getElementById(

        "loadMoreBtn"

    );



    if(!button)

        return;





    button.onclick=()=>{



        visibleTrending += 24;



        loadAllTrending();





        if(

            visibleTrending >=

            filteredTrending.length

        ){



            button.style.display="none";



        }



    };



}






/* ==========================================================
   SCROLL TOP
========================================================== */


function setupScrollTop(){



    const button =

    document.getElementById(

        "scrollTopBtn"

    );



    if(!button)

        return;





    window.addEventListener(

        "scroll",

        ()=>{



            if(

                window.scrollY > 500

            ){



                button.classList.add(

                    "show"

                );



            }

            else{


                button.classList.remove(

                    "show"

                );


            }



        }



    );





    button.onclick=()=>{


        window.scrollTo({


            top:0,


            behavior:"smooth"



        });



    };


}







/* ==========================================================
   REMOVE LOADER
========================================================== */


window.addEventListener(

"load",

()=>{


    const loader =

    document.getElementById(

        "loadingScreen"

    );

    if(loader){



        setTimeout(()=>{


            loader.classList.add(

                "hide"

            );



        },700);

    }

});

console.log(

"KivuStream Trending Ready 🔥"

);
