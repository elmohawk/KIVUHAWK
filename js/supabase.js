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
