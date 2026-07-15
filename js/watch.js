/* ==========================================================
   KIVUSTREAM WATCH PAGE
   CORE LOADER
========================================================== */

const params = new URLSearchParams(window.location.search);

const CONTENT_ID = params.get("id");

if (!CONTENT_ID) {

    window.location.href = "index.html";

}

/* ==========================================
   Elements
========================================== */

const backdrop = document.getElementById("backdrop");
const poster = document.getElementById("poster");
const title = document.getElementById("title");
const overview = document.getElementById("overview");
const rating = document.getElementById("rating");
const runtime = document.getElementById("runtime");
const year = document.getElementById("year");
const genres = document.getElementById("genres");
const typeBadge = document.getElementById("typeBadge");

const player = document.getElementById("videoPlayer");

const seriesSection =
document.getElementById("seriesSection");

let currentContent = null;

/* ==========================================
   LOAD CONTENT
========================================== */


document.addEventListener(
"DOMContentLoaded",
init
);



async function init(){


try{


currentContent =
await loadContent();





if(!currentContent){


showError();

return;


}





renderContent(
currentContent
);






// TMDB AUTO ENRICH + SAVE

await enrichTMDB(
currentContent
);






if(
currentContent.type === "series"

){



if(seriesSection){

seriesSection.style.display =
"block";

}



await loadEpisodes(
currentContent.id
);



}

else{



if(seriesSection){

seriesSection.style.display =
"none";

}



}



}

catch(error){


console.error(

"WATCH INIT ERROR:",

error

);



showError();



}



}









/* ==========================================
   LOAD MOVIE / SERIES
========================================== */


async function loadContent(){



// CHECK MOVIE FIRST


const {

data:movie,

error:movieError

}

=

await supabaseClient

.from("movies")

.select("*")

.eq(
"id",
CONTENT_ID
)

.maybeSingle();






if(movie){


return {


...movie,


type:"movie"



};


}







// CHECK SERIES


const {

data:series,

error:seriesError

}

=

await supabaseClient

.from("series")

.select("*")

.eq(
"id",
CONTENT_ID
)

.maybeSingle();






if(series){


return {


...series,


type:"series"



};



}







console.error(

movieError ||
seriesError

);




return null;



}









/* ==========================================
   RENDER CONTENT
========================================== */


function renderContent(item){



title.textContent =

item.title || "Unknown";





overview.textContent =

item.description || 
"No description available";






poster.src =

item.poster ||

"assets/default-poster.jpg";






backdrop.style.backgroundImage =

`

url(
"${

item.backdrop ||

item.poster ||

'assets/default-backdrop.jpg'

}"

)

`;








rating.textContent =

"⭐ " +

(
item.rating ||

"N/A"

);







year.textContent =

item.year || "";






runtime.textContent =

item.runtime

?

item.runtime+" min"

:

"";








typeBadge.textContent =

item.type.toUpperCase();









// MOVIE PLAYER



if(
item.video_url

&&

player

){


player.src =

item.video_url;



player.poster =

item.poster;



}





}









/* ==========================================
   TMDB AUTO ENRICH
========================================== */


async function enrichTMDB(item){



if(!item.tmdb_id){



console.log(

"No TMDB ID"

);



return;



}





try{



const details =

await getTMDBDetails(

item.tmdb_id,

item.type

);






if(!details)
return;







/*
 UPDATE UI
*/



if(details.backdrop_path){


const backdropURL =

"https://image.tmdb.org/t/p/original"

+

details.backdrop_path;



backdrop.style.backgroundImage =

`

url("${backdropURL}")

`;



}





if(details.runtime){


runtime.textContent =

details.runtime +

" min";



}







if(details.genres){



genres.innerHTML="";





details.genres.forEach(

genre=>{


genres.innerHTML +=


`

<span>

${genre.name}

</span>


`;



});



}








/*
 SAVE TMDB DATA TO SUPABASE
*/



const table =

item.type === "series"

?

"series"

:

"movies";







await supabaseClient

.from(table)

.update({

rating:

details.vote_average,


backdrop:

details.backdrop_path

?

"https://image.tmdb.org/t/p/original"

+

details.backdrop_path

:

item.backdrop,



runtime:

details.runtime || item.runtime,



genres:

details.genres || item.genres,



updated_at:

new Date()



})

.eq(

"id",

item.id

);








console.log(

"TMDB DATA SAVED:",

item.title

);




}

catch(error){


console.error(

"TMDB ENRICH ERROR:",

error

);



}



}
/* ==========================================
   LOAD SERIES EPISODES
========================================== */


async function loadEpisodes(seriesID){


const {

data: seasons,

error

}

=

await supabaseClient

.from("seasons")

.select("*")

.eq(
"series_id",
seriesID
)

.order(
"season_number"
);



if(error){

console.error(error);

return;

}



if(!seasons?.length)
return;



const seasonID =
seasons[0].id;



const {

data:episodes

}

=

await supabaseClient

.from("episodes")

.select("*")

.eq(
"season_id",
seasonID
)

.order(
"episode_number"
);



renderEpisodes(
episodes || []
);



}








/* ==========================================
   EPISODE RENDERER
========================================== */


function renderEpisodes(list){


const container =
document.getElementById(
"episodesContainer"
);



if(!container)
return;



container.innerHTML="";




list.forEach(
(ep,index)=>{


container.innerHTML += `


<div

class="episode-card"

onclick="playEpisode(${index})">


<div class="episode-thumb">


<img

src="${
ep.thumbnail ||

'assets/default-poster.jpg'

}">


<div class="play-overlay">

<i class="fa-solid fa-play"></i>

</div>



<div class="episode-number">

EP ${ep.episode_number}

</div>



</div>



<div class="episode-info">


<h3>

${ep.title}

</h3>


<p>

${ep.description || ""}

</p>



</div>


</div>



`;



});



window.currentEpisodes=list;



}









/* ==========================================
   PLAY EPISODE
========================================== */


window.playEpisode=function(index){


const ep =
window.currentEpisodes[index];



if(!ep)
return;



player.src =
ep.video_url;



player.play();



const download =
document.getElementById(
"downloadButton"
);



if(download){


download.href =
ep.download_url || "#";


}



};


/* ==========================================
   Error
========================================== */

function showError() {

    document.body.innerHTML = `

<div class="empty-state">

<h2>Content Not Found</h2>

<p>This movie or series does not exist.</p>

<a href="index.html">

Go Home

</a>

</div>

`;

}
