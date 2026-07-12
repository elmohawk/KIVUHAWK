/* ===========================
   SUPABASE CLIENT
=========================== */

const supabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

/* ===========================
   CURRENT USER
=========================== */

async function currentUser(){

    const {
        data:{user}
    } = await supabase.auth.getUser();

    return user;

}
