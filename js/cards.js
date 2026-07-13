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




            <img src="${

            movie.poster ||

            'assets/logo.png'

            }"

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
