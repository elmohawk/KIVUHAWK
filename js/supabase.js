/* ===========================
   SUPABASE CLIENT
=========================== */

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

/* ===========================
   CURRENT USER
=========================== */

async function currentUser() {

    const {
        data: { user }
    } = await supabaseClient.auth.getUser();

    return user;
}
