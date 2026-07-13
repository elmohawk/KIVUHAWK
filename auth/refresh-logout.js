/* ==========================================================
   KIVUSTREAM REFRESH LOGOUT
========================================================== */

window.addEventListener("beforeunload", async () => {

    try {

        await supabaseClient.auth.signOut({ scope: "local" });

    } catch (e) {}

});
