/* ==========================================
   SUPABASE CLIENT
========================================== */

if (!window.supabase) {

    throw new Error(
        "Supabase SDK failed to load."
    );

}

const supabaseClient =
window.supabase.createClient(

    SUPABASE_URL,

    SUPABASE_ANON_KEY

);

window.supabaseClient = supabaseClient;

async function currentUser(){

    const { data:{ user }, error } =
        await supabaseClient.auth.getUser();

    if(error){
        console.error(error);
        return null;
    }

    return user;
}

async function getMovies(){

    const {data,error}=await supabaseClient
    .from("movies")
    .select("*")
    .order("id",{ascending:false});


    if(error){

        console.error(
            "SUPABASE ERROR:",
            error
        );

        return [];

    }


    return data;

}
async function getSupabaseMovies(){


    const {
        data,
        error

    } = await supabaseClient

    .from("movies")

    .select("*")

    .order(
        "created_at",
        {
            ascending:false
        }
    );


    if(error){

        console.error(
            "Database Error:",
            error
        );

        return [];

    }


    return data || [];

}
/* ==========================================================
   LOAD MOVIES + SERIES
========================================================== */

async function getSupabaseContent(){

    const [

        moviesResult,

        seriesResult

    ] = await Promise.all([

        supabaseClient
        .from("movies")
        .select("*")
        .order("created_at",{ascending:false}),

        supabaseClient
        .from("series")
        .select("*")
        .order("created_at",{ascending:false})

    ]);

    const movies=(moviesResult.data||[]).map(movie=>({

        ...movie,

        type:"movie"

    }));

    const series=(seriesResult.data||[]).map(series=>({

        ...series,

        type:"series"

    }));

    return [

        ...movies,

        ...series

    ].sort(

        (a,b)=>

        new Date(b.created_at)-new Date(a.created_at)

    );

}
