/* ======================================================
   KIVUSTREAM ADMIN
   MANAGE SERIES ENGINE
====================================================== */


let seriesCache = [];

let editingSeriesId = null;

let selectedSeriesId = null;




document.addEventListener(
"DOMContentLoaded",
()=>{


loadSeries();

initSeriesSearch();

initSeriesFilter();

initSeriesModal();


});








/* ======================================================
   LOAD SERIES
====================================================== */


async function loadSeries(){


try{


const {

data,

error

}

=

await supabaseClient

.from("series")

.select("*")

.order(
"created_at",
{
ascending:false
}

);



if(error)
throw error;



seriesCache = data || [];



renderSeries(
seriesCache
);



}

catch(error){


console.error(
"Series Load Error",
error
);


}



}









/* ======================================================
   RENDER SERIES TABLE
====================================================== */


function renderSeries(list){


const table =
document.getElementById(
"seriesTable"
);



const total =
document.getElementById(
"seriesTotal"
);



if(total){

total.textContent =
list.length;

}



if(!table)
return;




table.innerHTML="";




list.forEach(series=>{


table.innerHTML += `


<tr>


<td>


<img

src="${
series.poster ||

'../assets/default-poster.jpg'

}"

class="table-poster">


</td>





<td>

${series.title || "Unknown"}

</td>





<td>

${series.category || "-"}

</td>





<td>


<button

class="secondary-btn"

onclick="openSeasonManager('${series.id}')">


<i class="fa-solid fa-layer-group"></i>


Manage


</button>



</td>





<td>


${
series.tmdb_id

?

'<span class="status success">SYNC</span>'

:

'<span class="status">NO</span>'

}



</td>





<td>


<button

class="edit-btn"

onclick="editSeries('${series.id}')">


<i class="fa-solid fa-pen"></i>


</button>





<button

class="delete-btn"

onclick="deleteSeries('${series.id}')">


<i class="fa-solid fa-trash"></i>


</button>





<button

class="tmdb-btn"

onclick="refreshSeriesTMDB('${series.id}')">


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


function initSeriesSearch(){


const input =
document.getElementById(
"seriesSearch"
);



if(!input)
return;



input.addEventListener(

"input",

()=>{


const value =
input.value
.toLowerCase();



renderSeries(

seriesCache.filter(

item =>

item.title
?.toLowerCase()
.includes(value)

)

);


});


}









/* ======================================================
   FILTER
====================================================== */


function initSeriesFilter(){


const filter =
document.getElementById(
"seriesFilter"
);



if(!filter)
return;



filter.addEventListener(

"change",

()=>{


if(
filter.value==="all"
){


renderSeries(seriesCache);

return;


}



renderSeries(

seriesCache.filter(

item=>

item.category===filter.value

)

);


});


}









/* ======================================================
   EDIT SERIES
====================================================== */


window.editSeries =

function(id){



const series =

seriesCache.find(

x=>x.id==id

);



if(!series)
return;



editingSeriesId=id;




document.getElementById(
"editSeriesTitle"
).value =

series.title || "";



document.getElementById(
"editSeriesDescription"
).value =

series.description || "";



document.getElementById(
"editSeriesCategory"
).value =

series.category || "Other";



document.getElementById(
"editSeriesQuality"
).value =

series.quality || "720p HD";





document

.getElementById(
"editSeriesModal"
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
"saveSeriesEdit"
)

?.addEventListener(

"click",

async()=>{


const update={


title:

document.getElementById(
"editSeriesTitle"
).value,


description:

document.getElementById(
"editSeriesDescription"
).value,


category:

document.getElementById(
"editSeriesCategory"
).value,


quality:

document.getElementById(
"editSeriesQuality"
).value


};




const {

error

}

=

await supabaseClient

.from("series")

.update(update)

.eq(
"id",
editingSeriesId
);



if(error){

console.error(error);

return;

}



closeSeriesModal();

loadSeries();



});









/* ======================================================
   DELETE SERIES
====================================================== */


window.deleteSeries =

async function(id){



if(
!confirm(
"Delete this series?"
)

)
return;




const {

error

}

=

await supabaseClient

.from("series")

.delete()

.eq(
"id",
id
);



if(error){

console.error(error);

return;

}



loadSeries();



}









/* ======================================================
   CLOSE EDIT MODAL
====================================================== */


function initSeriesModal(){


document

.getElementById(
"closeSeriesModal"
)

?.addEventListener(

"click",

closeSeriesModal

);


}




function closeSeriesModal(){


document

.getElementById(
"editSeriesModal"
)

?.classList.remove(
"show"
);


}









/* ======================================================
   TMDB REFRESH
====================================================== */


window.refreshSeriesTMDB =

async function(id){



const {

data,

error

}

=

await supabaseClient.functions.invoke(

"tmdb-sync",

{

body:{

table:"series",

row_id:id

}

}

);



if(error){

console.error(error);

return;

}



alert(
"TMDB Series Updated"
);



loadSeries();



}









/* ======================================================
   SEASON MANAGER
====================================================== */


window.openSeasonManager =

async function(id){



selectedSeriesId=id;



const modal =
document.getElementById(
"seasonModal"
);



const box =
document.getElementById(
"seasonManagerContent"
);



modal.classList.add(
"show"
);



box.innerHTML = `

<div class="empty-state">

<i class="fa-solid fa-spinner fa-spin"></i>

<p>

Loading seasons...

</p>

</div>

`;



const {

data,

error

}

=

await supabaseClient

.from("seasons")

.select("*")

.eq(
"series_id",
id
)

.order(
"season_number"
);



if(error){

box.innerHTML =
"Failed loading seasons";

return;

}




box.innerHTML="";



data.forEach(season=>{


box.innerHTML += `


<div class="season-box">


<h3>

Season ${season.season_number}

</h3>

<a

href="manage-episodes.html?season=${season.id}"

class="primary-btn">


Manage Episodes


</a>


</div>


`;


});


}
