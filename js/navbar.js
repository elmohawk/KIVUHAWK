/* ==========================================================
   KIVUSTREAM NAVBAR SYSTEM
   PART 1
========================================================== */


/* ==========================================================
   LOAD NAVBAR COMPONENT
========================================================== */

async function loadNavbar(){

    const container =
    document.getElementById(
        "navbar-container"
    );


    if(!container){

        console.warn(
            "Navbar container missing"
        );

        return;

    }


    try{

        const response =
        await fetch(
            "components/navbar.html"
        );


        const html =
        await response.text();


        container.innerHTML =
        html;


        initNavbar();


    }
    catch(error){

        console.error(
            "Navbar loading error:",
            error
        );

    }

}



/* ==========================================================
   INITIALIZE NAVBAR
========================================================== */


function initNavbar(){


    console.log(
        "KivuStream Navbar Loaded"
    );


    setupMobileMenu();

    setupScrollEffect();

    setupActiveLink();

    setup3DEffect();

    setupSearch();

}
/* ==========================================================
   MOBILE MENU
========================================================== */


function setupMobileMenu(){


    const menuBtn =
    document.getElementById(
        "menuToggle"
    );


    const mobileMenu =
    document.getElementById(
        "mobileMenu"
    );


    const closeBtn =
    document.getElementById(
        "closeMobile"
    );



    if(!menuBtn || !mobileMenu)

        return;



    menuBtn.onclick = ()=>{


        mobileMenu.classList.add(
            "active"
        );


    };



    if(closeBtn){


        closeBtn.onclick = ()=>{


            mobileMenu.classList.remove(
                "active"
            );


        };


    }



    document.addEventListener(
        "click",
        (e)=>{


            if(

                !mobileMenu.contains(e.target)

                &&

                !menuBtn.contains(e.target)

            ){

                mobileMenu.classList.remove(
                    "active"
                );

            }


        }

    );


}



/* ==========================================================
   SCROLL EFFECT
========================================================== */


function setupScrollEffect(){


    const navbar =
    document.querySelector(
        ".ks-navbar"
    );


    if(!navbar)

        return;



    window.addEventListener(
        "scroll",
        ()=>{


            if(
                window.scrollY > 50
            ){

                navbar.classList.add(
                    "scrolled"
                );


            }
            else{


                navbar.classList.remove(
                    "scrolled"
                );


            }


        }

    );


}



/* ==========================================================
   ACTIVE PAGE
========================================================== */


function setupActiveLink(){


    const current =
    window.location.pathname;


    document
    .querySelectorAll(
        ".ks-menu a"
    )
    .forEach(link=>{


        if(
            link.href.includes(
                current
            )
        ){

            link.classList.add(
                "active"
            );


        }


    });


}



/* ==========================================================
   3D NAVBAR MOVEMENT
========================================================== */


function setup3DEffect(){


    const navbar =
    document.querySelector(
        ".ks-navbar"
    );


    if(!navbar)

        return;



    document.addEventListener(
        "mousemove",
        (e)=>{


            const x =
            (window.innerWidth / 2 - e.clientX)
            /80;


            const y =
            (window.innerHeight / 2 - e.clientY)
            /80;



            navbar.style.transform =

            `

            translateX(-50%)

            rotateY(${x}deg)

            rotateX(${y}deg)

            `;


        }

    );



    document.addEventListener(
        "mouseleave",
        ()=>{


            navbar.style.transform =

            "translateX(-50%)";


        }

    );


}



/* ==========================================================
   START
========================================================== */


document.addEventListener(
    "DOMContentLoaded",
    loadNavbar
);
/* ==========================================================
   SEARCH ENGINE
   PART 2
========================================================== */


let searchTimer;



function setupSearch(){


    const input =
    document.getElementById(
        "searchInput"
    );


    const results =
    document.getElementById(
        "searchResults"
    );


    const clearBtn =
    document.getElementById(
        "searchClear"
    );



    if(!input || !results)

        return;



    input.addEventListener(
        "input",
        ()=>{


            const value =
            input.value.trim();



            clearTimeout(
                searchTimer
            );



            if(value.length < 2){


                results.innerHTML="";

                results.style.display="none";

                return;


            }



            searchTimer =
            setTimeout(
                ()=>{


                    searchContent(
                        value
                    );


                },
                400
            );


        }

    );



    if(clearBtn){


        clearBtn.onclick=()=>{


            input.value="";

            results.innerHTML="";

            results.style.display="none";


        };


    }



}




/* ==========================================================
   SEARCH DATABASE
========================================================== */


async function searchContent(
    keyword
){


    try{


        const [

            moviesResult,

            seriesResult

        ] = await Promise.all([



            supabaseClient

            .from("movies")

            .select("*")

            .ilike(

                "title",

                `%${keyword}%`

            )

            .limit(8),



            supabaseClient

            .from("series")

            .select("*")

            .ilike(

                "title",

                `%${keyword}%`

            )

            .limit(8)



        ]);




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





        const combined =

        [

            ...movies,

            ...series

        ];



        renderSearchResults(
            combined
        );



    }

    catch(error){


        console.error(

            "Search error:",

            error

        );


    }


}




/* ==========================================================
   DISPLAY RESULTS
========================================================== */


function renderSearchResults(
items
){


    const results =

    document.getElementById(
        "searchResults"
    );



    if(!results)

        return;



    results.innerHTML="";




    if(items.length===0){


        results.innerHTML=

        `

        <div class="search-empty">

            No content found

        </div>

        `;


        results.style.display="block";


        return;

    }




    items.forEach(item=>{


        results.innerHTML +=


        `

        <div

        class="search-item"

        onclick="openSearchItem('${item.id}','${item.type}')">


            <img

            src="${

            item.poster ||

            'assets/logo.png'

            }">


            <div>


                <h4>

                ${item.title}

                </h4>


                <span>

                ${

                item.type.toUpperCase()

                }

                </span>


            </div>


        </div>


        `;



    });



    results.style.display="block";


}




/* ==========================================================
   OPEN RESULT
========================================================== */


function openSearchItem(
id,
type
){


    window.location.href =

    `watch.html?id=${id}&type=${type}`;


}



/* ==========================================================
   CLOSE SEARCH OUTSIDE CLICK
========================================================== */


document.addEventListener(
"click",
(e)=>{


    const box =

    document.querySelector(
        ".search-container"
    );


    const results =

    document.getElementById(
        "searchResults"
    );



    if(

        box &&

        !box.contains(
            e.target
        )

    ){


        if(results)

        results.style.display="none";


    }


});
/* ==========================================================
   USER PROFILE + FINAL POLISH
   PART 3
========================================================== */


/* ==========================================================
   SUPABASE USER
========================================================== */

async function setupUserProfile(){


    const profileBtn =

    document.getElementById(
        "profileBtn"
    );



    if(!profileBtn)

        return;



    try{


        const {

            data

        } = await supabaseClient

        .auth

        .getUser();



        const user =

        data.user;



        if(user){


            profileBtn.innerHTML =

            `

            <i class="fa-solid fa-user-check"></i>

            `;



            profileBtn.title =

            user.email;


            profileBtn.onclick = ()=>{


                window.location.href =

                "profile.html";


            };


        }


        else{


            profileBtn.onclick = ()=>{


                window.location.href =

                "login.html";


            };


        }



    }

    catch(error){


        console.error(

            "Auth error:",

            error

        );


    }


}





/* ==========================================================
   MY LIST
========================================================== */


function setupMyList(){


    const myList =

    document.querySelector(

    'a[href="mylist.html"]'

    );



    if(!myList)

        return;



    myList.onclick=(e)=>{


        e.preventDefault();



        window.location.href =

        "mylist.html";


    };


}




/* ==========================================================
   NOTIFICATION SYSTEM
========================================================== */


function setupNotifications(){


    const btn =

    document.getElementById(

        "notificationBtn"

    );



    if(!btn)

        return;



    btn.onclick=()=>{


        showNotification(

        "New movies added to KivuStream 🎬"

        );


    };


}





function showNotification(message){



    const box =

    document.createElement(
        "div"
    );



    box.className=

    "ks-notification";



    box.innerHTML=

    `

    <i class="fa-solid fa-bell"></i>

    <span>

    ${message}

    </span>

    `;



    document.body.appendChild(
        box
    );



    setTimeout(()=>{


        box.classList.add(
            "show"
        );


    },50);




    setTimeout(()=>{


        box.classList.remove(
            "show"
        );



        setTimeout(()=>{


            box.remove();


        },500);



    },3500);



}





/* ==========================================================
   GSAP NAVBAR INTRO
========================================================== */


function navbarAnimation(){



    const navbar =

    document.querySelector(

        ".ks-navbar"

    );



    if(!navbar)

        return;



    if(window.gsap){



        gsap.from(

            navbar,

            {

            y:-100,

            opacity:0,

            duration:1.2,

            ease:"power4.out"

            }

        );


    }


}



/* ==========================================================
   EXTRA 3D TILT
========================================================== */


function navbarTilt(){



    const navbar =

    document.querySelector(

        ".ks-navbar"

    );



    if(!navbar)

        return;



    navbar.addEventListener(

    "mousemove",

    (e)=>{



        const rect =

        navbar.getBoundingClientRect();



        const x =

        e.clientX - rect.left;



        const y =

        e.clientY - rect.top;



        const rotateY =

        (x - rect.width/2)

        /40;



        const rotateX =

        -(y - rect.height/2)

        /40;




        navbar.style.transform =

        `

        translateX(-50%)

        rotateX(${rotateX}deg)

        rotateY(${rotateY}deg)

        `;



    });



    navbar.addEventListener(

    "mouseleave",

    ()=>{


        navbar.style.transform=

        "translateX(-50%)";


    });



}




/* ==========================================================
   FINAL INIT EXTENSION
========================================================== */


const oldInitNavbar = initNavbar;


initNavbar = function(){


    oldInitNavbar();


    setupUserProfile();


    setupMyList();


    setupNotifications();


    navbarAnimation();


    navbarTilt();


};
