/* ======================================================
   KIVUSTREAM ADMIN DASHBOARD ENGINE
====================================================== */


document.addEventListener(
"DOMContentLoaded",
()=>{


loadDashboard();


});





/* ======================================================
   LOAD ALL DASHBOARD DATA
====================================================== */


async function loadDashboard(){


try{


console.log(
"Loading Dashboard Data..."
);



await Promise.all([


loadMoviesCount(),

loadSeriesCount(),

loadEpisodeCount(),

loadUserCount(),

loadRecentUploads(),

loadTMDBStatus()


]);



console.log(
"Dashboard Loaded"
);



}

catch(error){


console.error(

"Dashboard Error:",

error

);


}



}







/* ======================================================
   MOVIES COUNT
====================================================== */


async function loadMoviesCount(){


const box =
document.getElementById(
"movieCount"
);



if(!box)return;



const {

count,

error

}

=

await supabaseClient

.from("movies")

.select(

"*",

{
count:"exact",
head:true

}

);



if(error){

console.error(error);

return;

}



box.textContent =
count || 0;


}







/* ======================================================
   SERIES COUNT
====================================================== */


async function loadSeriesCount(){


const box =
document.getElementById(
"seriesCount"
);



if(!box)return;



const {

count,

error

}

=

await supabaseClient

.from("series")

.select(

"*",

{
count:"exact",
head:true

}

);



if(error){

console.error(error);

return;

}



box.textContent =
count || 0;


}







/* ======================================================
   EPISODES COUNT
====================================================== */


async function loadEpisodeCount(){


const box =
document.getElementById(
"episodeCount"
);



if(!box)return;



const {

count,

error

}

=

await supabaseClient

.from("episodes")

.select(

"*",

{
count:"exact",
head:true

}

);



if(error){

console.error(error);

return;

}



box.textContent =
count || 0;


}







/* ======================================================
   USERS COUNT
====================================================== */


async function loadUserCount(){


const box =
document.getElementById(
"userCount"
);



if(!box)return;



const {

count,

error

}

=

await supabaseClient

.from("users")

.select(

"*",

{
count:"exact",
head:true

}

);



if(error){

console.error(error);

return;

}



box.textContent =
count || 0;


}







/* ======================================================
   RECENT UPLOADS
====================================================== */


async function loadRecentUploads(){


const table =
document.getElementById(
"recentUploads"
);



if(!table)return;



const {

data,

error

}

=

await supabaseClient

.from("movies")

.select("*")

.order(

"created_at",

{
ascending:false

}

)

.limit(5);



if(error){

console.error(error);

return;

}



table.innerHTML = "";



data.forEach(movie=>{


table.innerHTML += `


<tr>


<td>

<img

src="${
movie.poster ||

'../assets/default-poster.jpg'

}"

class="table-poster">

</td>



<td>

${movie.title || "Unknown"}

</td>



<td>

Movie

</td>



<td>

<span class="status success">

Active

</span>

</td>



<td>

${

movie.created_at ?

new Date(
movie.created_at
)
.toLocaleDateString()

:

"--"

}

</td>



<td>


<a href="manage-movies.html">

<button class="edit-btn">

<i class="fa-solid fa-pen"></i>

</button>


</a>


</td>



</tr>


`;


});


}







/* ======================================================
   TMDB STATUS
====================================================== */


async function loadTMDBStatus(){


const cache =
document.getElementById(
"tmdbCached"
);



if(!cache)return;



const {

count,

error

}

=

await supabaseClient

.from("movies")

.select(

"*",

{
count:"exact",
head:true

}

)

.not(
"tmdb_id",
"is",
null
);



if(error){

console.error(error);

return;

}



cache.textContent =

`${count || 0} Items`;



const sync =
document.getElementById(
"lastSync"
);



if(sync){


sync.textContent =

new Date()
.toLocaleString();


}



}
