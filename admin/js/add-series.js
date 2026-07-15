/* ======================================================
   KIVUSTREAM ADMIN
   ADD SERIES ENGINE
====================================================== */


document.addEventListener(
"DOMContentLoaded",
()=>{


initSeriesUpload();

initSeriesPreview();

initSeasonCreator();


});

/* ======================================================
   SERIES UPLOAD
====================================================== */


function initSeriesUpload(){


const form =
document.getElementById(
"seriesUploadForm"
);

if(!form)return;

form.addEventListener(

"submit",

async(e)=>{


e.preventDefault();

const status =
document.getElementById(
"seriesUploadStatus"
);



try{


status.textContent =
"Uploading series...";



const title =
document.getElementById(
"seriesTitle"
).value;



const description =
document.getElementById(
"seriesDescription"
).value;



const category =
document.getElementById(
"seriesCategory"
).value;



const language =
document.getElementById(
"seriesLanguage"
).value;



const year =
document.getElementById(
"seriesYear"
).value;



const quality =
document.getElementById(
"seriesQuality"
).value;


/* =============================
   IMAGES
============================= */


status.textContent =
"Uploading images...";



const posterFile =
document.getElementById(
"seriesPoster"
)
.files[0];



const backdropFile =
document.getElementById(
"seriesBackdrop"
)
.files[0];




let poster="";

let backdrop="";





if(posterFile){


poster =
await uploadSeriesImage(
posterFile,
"series-posters"
);


}



if(backdropFile){


backdrop =
await uploadSeriesImage(
backdropFile,
"series-backdrops"
);


}







/* =============================
   DATABASE INSERT
============================= */


status.textContent =
"Saving series...";




const {

data,

error

}

=

await supabaseClient

.from("series")

.insert([{


title:title,

description:description,

category:category,

language:language,

year:year,

quality:quality,

poster:poster,

backdrop:backdrop,

created_at:new Date()


}])

.select()

.single();






if(error)
throw error;







/* =============================
   TMDB SYNC
============================= */


const sync =
document.getElementById(
"seriesTmdbSync"
)
.checked;



if(sync){


status.textContent =
"Syncing TMDB TV data...";



await syncSeriesTMDB(
"series",
data.id
);


}





status.textContent =
"Series uploaded successfully 📺";



form.reset();



}

catch(error){


console.error(
error
);



status.textContent =

"Upload failed: "

+
error.message;



}



});


}








/* ======================================================
   IMAGE UPLOAD
====================================================== */


async function uploadSeriesImage(

file,

folder

){



const filename =

Date.now()
+
"-"
+
file.name;



const path =

folder
+
"/"
+
filename;





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
   TMDB EDGE FUNCTION
====================================================== */


async function syncSeriesTMDB(

table,

id

){



const {

data,

error

}

=

await supabaseClient.functions.invoke(

"tmdb-sync",

{

body:{

table,

row_id:id

}

}

);



if(error){


console.error(

"TMDB ERROR",

error

);



return;


}



console.log(

"TMDB SERIES RESULT",

data

);



}









/* ======================================================
   SEASON CREATOR
====================================================== */


function initSeasonCreator(){



const button =
document.getElementById(
"addSeasonBtn"
);



const container =
document.getElementById(
"seasonContainer"
);



if(!button || !container)
return;





let seasonNumber = 1;



button.addEventListener(

"click",

()=>{


seasonNumber++;




container.innerHTML += `


<div class="season-box">


<h3>

Season ${seasonNumber}

</h3>



<label>

Number of Episodes

</label>


<input

type="number"

class="episode-count"

value="1">


</div>



`;



});



}









/* ======================================================
   PREVIEW SYSTEM
====================================================== */


function initSeriesPreview(){



const fields=[


"seriesTitle",

"seriesDescription",

"seriesCategory",

"seriesQuality",

"seriesYear"


];



fields.forEach(id=>{


const el =
document.getElementById(id);



if(el){


el.addEventListener(

"input",

updateSeriesPreview

);


}



});


}






function updateSeriesPreview(){


const map={


seriesPreviewTitle:
"seriesTitle",


seriesPreviewDescription:
"seriesDescription",


seriesPreviewCategory:
"seriesCategory",


seriesPreviewQuality:
"seriesQuality",


seriesPreviewYear:
"seriesYear"


};





Object.keys(map)
.forEach(target=>{


const source =
document.getElementById(
map[target]
);



const output =
document.getElementById(
target
);



if(source && output){


output.textContent =

source.value ||

"--";


}


});



}
