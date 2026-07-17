/* ==========================================================
   KIVUSTREAM IMPORT ENGINE
   Uses Supabase Edge Function
========================================================== */

async function importTMDBMovie({

    tmdb_id,

    category,

    quality,

    video_url,

    download_url = "",

    translator = ""

}) {

    try {

        const response = await fetch(

            `${SUPABASE_URL}/functions/v1/tmdb-import`,

            {

                method: "POST",

                headers: {

                    "Content-Type": "application/json",

                    "apikey": SUPABASE_ANON_KEY,

                    "Authorization": `Bearer ${SUPABASE_ANON_KEY}`

                },

                body: JSON.stringify({

                    tmdb_id,

                    category,

                    quality,

                    video_url,

                    download_url,

                    translator

                })

            }

        );

        const result = await response.json();

        if (!response.ok) {

            throw new Error(

                result.message ||

                result.error ||

                "Import Failed"

            );

        }

        console.log(

            "Movie Imported",

            result

        );

        return result;

    }

    catch(error){

        console.error(error);

        alert(error.message);

        return null;

    }

}
