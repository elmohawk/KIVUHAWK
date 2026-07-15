/* ======================================================
   KIVUSTREAM ADMIN
   MANAGE EPISODES ENGINE
====================================================== */


let episodeCache = [];

let editingEpisodeId = null;




document.addEventListener(
"DOMContentLoaded",
()=>{


loadSeriesOptions();

initEpisodeForm();

initEpisodeModal();


});







/* ======================================================
   LOAD SERIES
====================================================== */


async function loadSeriesOptions(){


const select =
document.getElementById(
"episodeSeries"
);



if(!select)
return;




const {

data,

error

}

=

await supabaseClient

.from("series")

.select(
"id,title"
)

.order(
"title"
);





if(error){

console.error(error);

return;

}





select.innerHTML =
"";




data.forEach(series=>{


select.innerHTML += `


<option value="${series.id}">

${series.title}

</option>


`;



});



loadSeasonOptions();



}









/* ======================================================
   LOAD SEASONS
====================================================== */


async function loadSeasonOptions(){


const series =
document.getElementById(
"episodeSeries"
).value;



const seasonSelect =
document.getElementById(
"episodeSeason"
);



if(!series)
return;





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
series
)

.order(
"season_number"
);






if(error){

console.error(error);

return;

}




seasonSelect.innerHTML="";




data.forEach(season=>{


seasonSelect.innerHTML += `


<option value="${season.id}">

Season ${season.season_number}

</option>


`;



});



loadEpisodes();



}







document

.getElementById(
"episodeSeries"
)

?.addEventListener(

"change",

loadSeasonOptions

);








document

.getElementById(
"episodeSeason"
)

?.addEventListener(

"change",

loadEpisodes

);









/* ======================================================
   ADD EPISODE
====================================================== */


function initEpisodeForm(){


const form =
document.getElementById(
"episodeForm"
);



if(!form)
return;





form.addEventListener(

"submit",

async(e)=>{


e.preventDefault();



const status =
document.getElementById(
"episodeStatus"
);



try{


status.textContent =
"Uploading thumbnail...";




const file =
document.getElementById(
"episodeThumbnail"
)
.files[0];



let thumbnail="";



if(file){


thumbnail =
await uploadEpisodeImage(
file
);


}






const episode={


season_id:

document.getElementById(
"episodeSeason"
).value,



episode_number:

document.getElementById(
"episodeNumber"
).value,



title:

document.getElementById(
"episodeTitle"
).value,



description:

document.getElementById(
"episodeDescription"
).value,



video_url:

document.getElementById(
"episodeVideo"
).value,



download_url:

document.getElementById(
"episodeDownload"
).value,


thumbnail:thumbnail,


created_at:new Date()



};






status.textContent =
"Saving episode...";





const {

error

}

=

await supabaseClient

.from("episodes")

.insert([episode]);






if(error)
throw error;





status.textContent =
"Episode saved successfully 🎬";



form.reset();



loadEpisodes();



}

catch(error){


console.error(error);



status.textContent =

"Error: "

+

error.message;



}



});


}









/* ======================================================
   IMAGE UPLOAD
====================================================== */


async function uploadEpisodeImage(file){


const path =

"episodes/"
+
Date.now()
+
"-"
+
file.name;





const {

error

}

=

await supabaseClient

.storage

.from("movies")

.upload(

path,

file

);



if(error)
throw error;






const {

data

}

=

supabaseClient

.storage

.from("movies")

.getPublicUrl(
path
);



return data.publicUrl;



}









/* ======================================================
   LOAD EPISODES
====================================================== */


async function loadEpisodes(){



const season =
document.getElementById(
"episodeSeason"
).value;



const table =
document.getElementById(
"episodeTable"
);




if(!season || !table)
return;






const {

data,

error

}

=

await supabaseClient

.from("episodes")

.select("*")

.eq(
"season_id",
season
)

.order(
"episode_number"
);





if(error){

console.error(error);

return;

}




episodeCache=data || [];





renderEpisodes(
episodeCache
);



}








/* ======================================================
   RENDER TABLE
====================================================== */


function renderEpisodes(list){



const table =
document.getElementById(
"episodeTable"
);



const total =
document.getElementById(
"episodeTotal"
);



if(total)
total.textContent=list.length;




table.innerHTML="";




list.forEach(ep=>{


table.innerHTML += `


<tr>


<td>

<img

src="${
ep.thumbnail ||

'../assets/default-poster.jpg'

}"

class="table-poster">


</td>




<td>

Episode ${ep.episode_number}

</td>




<td>

${ep.title}

</td>




<td>

Active

</td>




<td>



<button

class="edit-btn"

onclick="editEpisode('${ep.id}')">


<i class="fa-solid fa-pen"></i>


</button>




<button

class="delete-btn"

onclick="deleteEpisode('${ep.id}')">


<i class="fa-solid fa-trash"></i>


</button>



</td>



</tr>



`;



});



}









/* ======================================================
   DELETE EPISODE
====================================================== */


window.deleteEpisode =

async function(id){


if(
!confirm(
"Delete episode?"
)
)
return;



await supabaseClient

.from("episodes")

.delete()

.eq(
"id",
id
);



loadEpisodes();



}









/* ======================================================
   EDIT EPISODE
====================================================== */


window.editEpisode =

function(id){



const ep =

episodeCache.find(

e=>e.id==id

);



if(!ep)
return;



editingEpisodeId=id;



document.getElementById(
"editEpisodeTitle"
).value =
ep.title;



document.getElementById(
"editEpisodeNumber"
).value =
ep.episode_number;



document.getElementById(
"editEpisodeVideo"
).value =
ep.video_url;


document.getElementById(
"editEpisodeDownload"
).value =
ep.download_url;


document

.getElementById(
"editEpisodeModal"
)

.classList.add(
"show"
);



}
