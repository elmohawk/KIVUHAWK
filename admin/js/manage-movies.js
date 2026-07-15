/* ======================================================
   KIVUSTREAM ADMIN
   MANAGE MOVIES ENGINE
====================================================== */


let moviesCache = [];

let editingMovieId = null;



document.addEventListener(
"DOMContentLoaded",
()=>{


loadMovies();

initSearch();

initFilter();

initModal();


});







/* ======================================================
   LOAD MOVIES
====================================================== */


async function loadMovies(){


try{


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
);



if(error)
throw error;



moviesCache = data || [];



renderMovies(
moviesCache
);



}

catch(error){


console.error(
"Load Movies Error:",
error
);


}


}









/* ======================================================
   RENDER TABLE
====================================================== */


function renderMovies(list){


const table =
document.getElementById(
"movieTable"
);



const total =
document.getElementById(
"movieTotal"
);



if(total){

total.textContent =
list.length;

}




if(!table)
return;




table.innerHTML="";





list.forEach(movie=>{


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

${movie.category || "-"}

</td>





<td>

${movie.quality || "-"}

</td>





<td>


${
movie.tmdb_id

?

'<span class="status success">SYNC</span>'

:

'<span class="status">NO</span>'

}


</td>





<td>


<button

class="edit-btn"

onclick="editMovie('${movie.id}')">


<i class="fa-solid fa-pen"></i>


</button>





<button

class="delete-btn"

onclick="deleteMovie('${movie.id}')">


<i class="fa-solid fa-trash"></i>


</button>





<button

class="tmdb-btn"

onclick="refreshTMDB('${movie.id}')">


<i class="fa-solid fa-rotate"></i>


</button>



</td>




</tr>



`;


});


}








/* ======================================================
   SEARCH
====================================================== */


function initSearch(){


const input =
document.getElementById(
"movieSearch"
);



if(!input)
return;




input.addEventListener(

"input",

()=>{


const value =
input.value
.toLowerCase();



const filtered =

moviesCache.filter(

movie =>


movie.title

?.toLowerCase()

.includes(value)


);



renderMovies(
filtered
);



});


}







/* ======================================================
   CATEGORY FILTER
====================================================== */


function initFilter(){


const filter =
document.getElementById(
"movieFilter"
);



if(!filter)
return;



filter.addEventListener(

"change",

()=>{


if(
filter.value==="all"
){


renderMovies(
moviesCache
);


return;

}




renderMovies(

moviesCache.filter(

movie =>

movie.category === filter.value

)

);


});


}








/* ======================================================
   EDIT MOVIE
====================================================== */


window.editMovie =
function(id){



const movie =

moviesCache.find(

m=>m.id==id

);



if(!movie)
return;




editingMovieId=id;



document.getElementById(
"editTitle"
).value =

movie.title || "";



document.getElementById(
"editDescription"
).value =

movie.description || "";



document.getElementById(
"editCategory"
).value =

movie.category || "Other";



document.getElementById(
"editQuality"
).value =

movie.quality || "720p HD";





document

.getElementById(
"editMovieModal"
)

.classList.add(
"show"
);



}









/* ======================================================
   SAVE EDIT
====================================================== */


document

.getElementById(
"saveMovieEdit"
)

?.addEventListener(

"click",

async()=>{


const update={


title:

document.getElementById(
"editTitle"
).value,


description:

document.getElementById(
"editDescription"
).value,


category:

document.getElementById(
"editCategory"
).value,


quality:

document.getElementById(
"editQuality"
).value


};





const {

error

}

=

await supabaseClient

.from("movies")

.update(update)

.eq(
"id",
editingMovieId
);



if(error){

console.error(error);

return;

}



closeModal();


loadMovies();



});









/* ======================================================
   DELETE MOVIE
====================================================== */


window.deleteMovie =
async function(id){



const confirmDelete =

confirm(
"Delete this movie?"
);



if(!confirmDelete)
return;





const {

error

}

=

await supabaseClient

.from("movies")

.delete()

.eq(
"id",
id
);



if(error){

console.error(error);

return;

}



loadMovies();


}








/* ======================================================
   CLOSE MODAL
====================================================== */


function initModal(){


document

.getElementById(
"closeModal"
)

?.addEventListener(

"click",

closeModal

);


}




function closeModal(){


document

.getElementById(
"editMovieModal"
)

?.classList.remove(
"show"
);


}








/* ======================================================
   TMDB REFRESH
====================================================== */


window.refreshTMDB =
async function(id){



console.log(
"Refreshing TMDB:",
id
);



const {

data,

error

}

=

await supabaseClient.functions.invoke(

"tmdb-sync",

{

body:{

table:"movies",

row_id:id

}

}

);


if(error){

console.error(
error
);

return;

}


alert(
"TMDB Updated"
);



loadMovies();


}
