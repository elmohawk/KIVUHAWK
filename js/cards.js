/* =====================================
   KIVUSTREAM CINEMATIC CARD ENGINE
   Dynamic Supabase Support
   Stable 3D Interaction
===================================== */


/* =====================================
   CREATE MOVIE CARDS
===================================== */


function renderCards(

    content,

    containerID

){


    const container =

    document.getElementById(containerID);



    if(!container)

        return;




    container.innerHTML = "";



    if(

        !content ||

        content.length === 0

    ){


        container.innerHTML = `

        <div class="empty-content">

            No content available

        </div>

        `;


        return;


    }




    content.forEach(movie=>{



        container.innerHTML += `


        <div class="movie-card"

        onclick="openWatchPage('${movie.id}','${movie.type}')">



            <span class="content-type">

                ${

                movie.type === "series"

                ?

                "SERIES"

                :

                "MOVIE"

                }

            </span>




            <img src="${getPoster(movie)}
            loading="lazy"

            >




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



    activateCard3D();



}





/* =====================================
   OPEN WATCH PAGE
===================================== */


function openWatchPage(

    id,

    type

){



    window.location.href =

    `watch.html?id=${id}&type=${type}`;



}






/* =====================================
   3D CARD EFFECT
===================================== */


function activateCard3D(){



document

.querySelectorAll(".movie-card")

.forEach(card=>{



    card.onmousemove = (e)=>{


        const rect =

        card.getBoundingClientRect();



        const x =

        e.clientX - rect.left;



        const y =

        e.clientY - rect.top;



        const rotateY =

        ((x - rect.width / 2)

        /

        rect.width)

        * 12;




        const rotateX =

        ((y - rect.height / 2)

        /

        rect.height)

        * -12;




        card.style.transform = `

        perspective(1200px)

        rotateX(${rotateX}deg)

        rotateY(${rotateY}deg)

        translateY(-12px)

        scale(1.03)

        `;



    };





    card.onmouseleave = ()=>{



        card.style.transform = `

        perspective(1200px)

        rotateX(0)

        rotateY(0)

        translateY(0)

        scale(1)

        `;



    };




});



}
/* =====================================
   KIVUSTREAM CARD PREMIUM FEATURES
   PART 2
===================================== */


/* =====================================
   SAFE POSTER HANDLER
===================================== */
function getPoster(movie){

if(movie.poster){

return movie.poster;

}

if(movie.poster_path){

return

`https://image.tmdb.org/t/p/w500${movie.poster_path}`;

}

if(movie.backdrop){

return movie.backdrop;

}

return "assets/logo.png";

}
/* =====================================
   QUALITY SYSTEM
===================================== */


function getQuality(movie){


    if(movie.quality)

        return movie.quality;



    if(movie.resolution)

        return movie.resolution;



    return "HD";


}





/* =====================================
   SERIES EPISODE COUNT
===================================== */


function episodeLabel(movie){


    if(

        movie.type === "series"

        &&

        movie.episodes

    ){


        return `${movie.episodes} Episodes`;


    }


    return "";

}





/* =====================================
   UPDATE CARD IMAGE
===================================== */


function refreshCardImages(){



    document

    .querySelectorAll(".movie-card img")

    .forEach(img=>{



        img.onerror = ()=>{


            img.src =

            "assets/logo.png";


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



    card.addEventListener(

    "mousemove",

    e=>{


        const rect =

        card.getBoundingClientRect();



        const x =

        e.clientX -

        rect.left;



        const y =

        e.clientY -

        rect.top;



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
   WATCH BUTTON CONTROL
===================================== */


document.addEventListener(

"click",

e=>{


    if(

        e.target.classList

        .contains("play-btn")

    ){


        const card =

        e.target.closest(

        ".movie-card"

        );



        if(card){


            card.click();


        }


    }



});







/* =====================================
   WISHLIST SYSTEM
===================================== */


function addWishlist(id){



    let list =

    JSON.parse(

    localStorage.getItem(

    "kivustreamWishlist"

    )

    )

    || [];




    if(

        !list.includes(id)

    ){


        list.push(id);


        localStorage.setItem(

        "kivustreamWishlist",

        JSON.stringify(list)

        );


    }



    console.log(

        "Added wishlist",

        id

    );



}





/* =====================================
   FINAL CARD UPDATE
===================================== */


function updateCardSystem(){



    refreshCardImages();



    enableCardShine();



    activateCard3D();



    console.log(

        "KivuStream Cards Ready 🎬"

    );



}
/* =====================================
   KIVUSTREAM ADVANCED CARD SYSTEM
   PART 3
===================================== */


/* =====================================
   LAZY IMAGE LOADING
===================================== */


function enableLazyImages(){


    const images =

    document.querySelectorAll(

        ".movie-card img"

    );



    images.forEach(img=>{


        img.loading = "lazy";



        img.onerror = ()=>{


            img.src =

            "assets/logo.png";


        };



    });


}





/* =====================================
   RATING STARS
===================================== */


function createStars(rating){



    let value =

    Number(rating || 0);



    let stars = "";



    for(

        let i = 1;

        i <= 5;

        i++

    ){



        if(value >= i){

            stars += "★";

        }

        else{

            stars += "☆";

        }


    }



    return stars;


}





/* =====================================
   VIEW COUNTER
===================================== */


async function increaseViews(movieId){



    if(!movieId)

        return;



    try{


        await supabaseClient

        .from("movies")

        .update({

            views:

            supabaseClient

            .rpc(

            "increment"

            )


        })

        .eq(

            "id",

            movieId

        );



    }


    catch(error){


        console.log(

            "View update skipped"

        );


    }



}





/* =====================================
   CARD OBSERVER
===================================== */


function observeCards(){



    const cards =

    document.querySelectorAll(

        ".movie-card"

    );



    const observer =

    new IntersectionObserver(

        entries=>{


            entries.forEach(entry=>{


                if(entry.isIntersecting){


                    entry.target

                    .classList

                    .add(

                    "show-card"

                    );


                }


            });



        },

        {

            threshold:.15

        }

    );



    cards.forEach(card=>{


        observer.observe(card);


    });



}





/* =====================================
   INFINITE SCROLL READY
===================================== */


let currentPage = 1;



function loadMoreReady(){



    window.addEventListener(

    "scroll",

    ()=>{


        const bottom =

        window.innerHeight +

        window.scrollY >=

        document.body.offsetHeight - 300;



        if(bottom){


            console.log(

            "Ready for more content"

            );



        }



    });



}





/* =====================================
   FINAL CARD BOOT
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
