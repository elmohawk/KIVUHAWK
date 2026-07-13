/* ==========================================================
   KIVUSTREAM SUPABASE STORAGE ENGINE
   POSTERS BUCKET
========================================================== */


const STORAGE_BUCKET = "posters";



function getStorageImage(path){

    if(!path)

        return "assets/logo.png";


    // already full URL

    if(path.startsWith("http"))

        return path;



    const {

        data

    } = supabaseClient
        .storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(path);



    return data.publicUrl;


}




function prepareStorageContent(item){


    return {


        ...item,


        poster:


        getStorageImage(

            item.poster

        ),



        backdrop:


        getStorageImage(

            item.backdrop

        )



    };


}
