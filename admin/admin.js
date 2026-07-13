/* ==========================================================
   KIVUSTREAM ADMIN IMPORT CONTROLLER
========================================================== */



let currentSelection = null;



/* ==========================================================
   SEARCH TMDB
========================================================== */


document

.getElementById("searchBtn")

.addEventListener(

"click",

async()=>{



const title =

document

.getElementById("movieSearch")

.value;



const type =

document

.getElementById("contentType")

.value;





if(!title)

return alert(

"Enter a title first"

);





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

);







/* ==========================================================
   RECEIVE SELECTED TMDB ITEM
========================================================== */


async function selectTMDBContent(

id,

type

){



currentSelection={


id:id,


type:type



};



console.log(

"Selected:",

currentSelection

);



let data;



if(type==="movie"){


data =

await getTMDBMovieDetails(

id

);


}

else{


data =

await getTMDBSeriesDetails(

id

);


}







document

.getElementById(

"selectedPoster"

)

.src =

data.poster_path

?

`https://image.tmdb.org/t/p/w500${data.poster_path}`

:

"assets/logo.png";







document

.getElementById(

"selectedTitle"

)

.innerText =

data.title ||

data.name;





document

.getElementById(

"selectedYear"

)

.innerText =

data.release_date ||

data.first_air_date ||

"";



}







/* ==========================================================
   IMPORT TO SUPABASE
========================================================== */



document

.getElementById("importBtn")

.addEventListener(

"click",

async()=>{





if(!currentSelection)

return alert(

"Select content first"

);





const videoURL =

document

.getElementById(

"videoURL"

)

.value;





const category =

document

.getElementById(

"category"

)

.value;








let result;



if(

currentSelection.type==="movie"

){



const movie =

await getTMDBMovieDetails(

currentSelection.id

);





result =

await importMovieToSupabase(

movie,

videoURL,

category

);



}



else{



const series =

await getTMDBSeriesDetails(

currentSelection.id

);





result =

await importSeriesToSupabase(

series,

category

);



}





if(result){



alert(

"KivuStream Import Successful 🚀"

);



console.log(

result

);



}



}



);
