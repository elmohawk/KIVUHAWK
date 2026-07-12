/* ==========================================
   SUPABASE CLIENT
========================================== */

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

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
