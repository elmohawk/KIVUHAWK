/* ==========================================================
   KIVUSTREAM PROFILE ENGINE
========================================================== */

let currentUser = null;

let watchlist = [];

let favorites = [];

let continueWatching = [];
/* ==========================================================
   PAGE START
========================================================== */

document.addEventListener(

"DOMContentLoaded",

async()=>{

    console.log(

        "Loading Profile..."

    );

    await loadProfile();

});
/* ==========================================================
   LOAD PROFILE
========================================================== */

async function loadProfile(){

    await loadUser();

    await loadWatchlist();

    await loadFavorites();

    await loadContinueWatching();

    await loadStatistics();

}
/* ==========================================================
   LOAD USER
========================================================== */

async function loadUser(){

    const {

        data:{user}

    }

    =

    await supabaseClient.auth.getUser();




    if(!user){

        location.href="login.html";

        return;

    }




    currentUser=user;




    document.getElementById(

        "profileName"

    ).textContent=

    user.user_metadata?.username ||

    user.email;

}
/* ==========================================================
   WATCHLIST
========================================================== */

async function loadWatchlist(){

    const{

        data,

        error

    }

    =

    await supabaseClient

    .from("watchlist")

    .select("movie_id")

    .eq(

        "user_id",

        currentUser.id

    );




    if(error){

        console.error(error);

        return;

    }




    watchlist=data||[];

}
/* ==========================================================
   FAVORITES
========================================================== */

async function loadFavorites(){

    const{

        data,

        error

    }

    =

    await supabaseClient

    .from("favorites")

    .select("movie_id")

    .eq(

        "user_id",

        currentUser.id

    );




    if(error){

        console.error(error);

        return;

    }




    favorites=data||[];

}
/* ==========================================================
   CONTINUE WATCHING
========================================================== */

async function loadContinueWatching(){

    const{

        data,

        error

    }

    =

    await supabaseClient

    .from("watch_history")

    .select("*")

    .eq(

        "user_id",

        currentUser.id

    )

    .order(

        "updated_at",

        {

            ascending:false

        }

    )

    .limit(20);




    if(error){

        console.error(error);

        return;

    }




    continueWatching=data||[];

}
/* ==========================================================
   USER STATISTICS
========================================================== */

async function loadStatistics(){

    document.getElementById(

        "favoriteCount"

    ).textContent=

    favorites.length;




    document.getElementById(

        "moviesWatched"

    ).textContent=

    continueWatching.length;




    document.getElementById(

        "seriesWatched"

    ).textContent=

        continueWatching.filter(

            x=>x.type==="series"

        ).length;




    document.getElementById(

        "hoursWatched"

    ).textContent=

    Math.round(

        continueWatching.reduce(

            (sum,item)=>

            sum+

            (item.minutes||0),

            0

        )/60

    );

}
/* ==========================================================
   LOGOUT
========================================================== */

document

.getElementById(

"logoutBtn"

)

.addEventListener(

"click",

async()=>{

await supabaseClient

.auth

.signOut();

location.href="login.html";

});
