
/* ==========================================================
   STORAGE SETTINGS
========================================================== */

const STORAGE_BUCKET = "posters";
/* ==========================================================
   UPLOAD IMAGE TO SUPABASE STORAGE
========================================================== */


async function uploadImageToStorage(

imageURL,

fileName

){


try{


    const response =

    await fetch(imageURL);



    const blob =

    await response.blob();



    const file =

    new File(

        [blob],

        fileName,

        {

        type:blob.type

        }

    );






    const {

        data,

        error

    } = await supabaseClient


    .storage


    .from(STORAGE_BUCKET)


    .upload(

        fileName,

        file,

        {

        upsert:true

        }

    );






    if(error){


        console.error(

            "Storage Upload Error:",

            error

        );


        return null;


    }







    const publicURL =

    supabaseClient


    .storage


    .from(STORAGE_BUCKET)


    .getPublicUrl(

        fileName

    );





    return publicURL

    .data

    .publicUrl;



}



catch(error){


console.error(

"Image Upload Failed:",

error

);


return null;


}



}
