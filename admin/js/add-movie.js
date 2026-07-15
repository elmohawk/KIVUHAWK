/* ======================================================
   KIVUSTREAM ADMIN
   ADD MOVIE ENGINE
====================================================== */


document.addEventListener(
"DOMContentLoaded",
()=>{


initMovieUpload();

initPreview();


});





/* ======================================================
   MOVIE UPLOAD
====================================================== */


function initMovieUpload(){


const form =
document.getElementById(
"movieUploadForm"
);



if(!form){

console.warn(
"Movie upload form missing"
);

return;

}



form.addEventListener(

"submit",

async(e)=>{


e.preventDefault();



const status =
document.getElementById(
"uploadStatus"
);



try{


status.textContent =
"Uploading movie...";




const title =
document.getElementById(
"movieTitle"
).value;



const description =
document.getElementById(
"movieDescription"
).value;



const category =
document.getElementById(
"movieCategory"
).value;



const language =
document.getElementById(
"movieLanguage"
).value;



const quality =
document.getElementById(
"movieQuality"
).value;



const year =
document.getElementById(
"movieYear"
).value;



const video =
document.getElementById(
"videoUrl"
).value;



const download =
document.getElementById(
"downloadUrl"
).value;





/* ============================
   UPLOAD IMAGES
============================ */


status.textContent =
"Uploading images...";



const posterFile =
document.getElementById(
"posterFile"
).files[0];



const backdropFile =
document.getElementById(
"backdropFile"
).files[0];





let posterURL =
"";

let backdropURL =
"";





if(posterFile){


posterURL =
await uploadMovieImage(
posterFile,
"posters"
);


}



if(backdropFile){


backdropURL =
await uploadMovieImage(
backdropFile,
"backdrops"
);


}








/* ============================
   INSERT MOVIE
============================ */


status.textContent =
"Saving movie...";



const {

data,

error

}

=

await supabaseClient

.from("movies")

.insert([{


title,

description,

category,

language,

quality,

year,

video_url:video,

download_url:download,

poster:posterURL,

backdrop:backdropURL,

created_at:
new Date()


}])

.select()

.single();






if(error){

throw error;

}





/* ============================
   TMDB SYNC
============================ */


const tmdbEnabled =
document.getElementById(
"tmdbSync"
).checked;



if(tmdbEnabled){


status.textContent =
"Syncing TMDB data...";



await syncTMDB(

"movies",

data.id

);



}





status.textContent =
"Movie uploaded successfully 🎬";



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
   STORAGE UPLOAD
====================================================== */


async function uploadMovieImage(

file,

folder

){



const filename =

`${Date.now()}-${file.name}`;



const path =

`${folder}/${filename}`;





const {

error

}

=

await supabaseClient

.storage

.from("movies")

.upload(

path,

file,

{

cacheControl:"3600",

upsert:false

}

);



if(error){

throw error;

}





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
   TMDB EDGE FUNCTION CALL
====================================================== */


async function syncTMDB(

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
"TMDB Sync Error",
error
);

return;

}



console.log(

"TMDB Result",

data

);



}








/* ======================================================
   LIVE PREVIEW
====================================================== */


function initPreview(){



const inputs = [

"movieTitle",

"movieDescription",

"movieCategory",

"movieQuality",

"movieYear"

];



inputs.forEach(id=>{


const element =
document.getElementById(id);



if(element){


element.addEventListener(

"input",

updatePreview

);


}



});


}






function updatePreview(){



const title =
document.getElementById(
"movieTitle"
);



const desc =
document.getElementById(
"movieDescription"
);



const category =
document.getElementById(
"movieCategory"
);



const quality =
document.getElementById(
"movieQuality"
);



const year =
document.getElementById(
"movieYear"
);




document.getElementById(
"previewTitle"
).textContent =

title.value ||

"Movie Title";



document.getElementById(
"previewDescription"
).textContent =

desc.value ||

"Movie description";



document.getElementById(
"previewCategory"
).textContent =

category.value;



document.getElementById(
"previewQuality"
).textContent =

quality.value;



document.getElementById(
"previewYear"
).textContent =

year.value;



}
