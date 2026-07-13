/* ==========================================================
   KIVUSTREAM SECURITY ENGINE
   Version 2.0
========================================================== */

const PUBLIC_PAGES = [

    "/",
    "/index.html",
    "/movies.html",
    "/series.html",
    "/trending.html",
    "/search.html",
    "/watch.html",
    "/auth/login.html",
    "/auth/signup.html",
    "/auth/forgot.html",
    "/auth/reset.html"

];

const ADMIN_FOLDER = "/admin/";
/* ==========================================================
   CHECK USER SESSION
========================================================== */

async function checkSession(){

    const {

        data:{session}

    }

    = await supabaseClient

    .auth

    .getSession();

    return session;

}
/* ==========================================================
   LOAD PROFILE
========================================================== */

async function getProfile(userId){

    const {

        data,

        error

    }

    = await supabaseClient

    .from("profiles")

    .select("*")

    .eq("id",userId)

    .single();

    if(error){

        return null;

    }

    return data;

}
/* ==========================================================
   PAGE GUARD
========================================================== */

(async()=>{

const session=

await checkSession();

const path=

window.location.pathname;



/* ----------

NOT LOGGED IN

---------- */

if(!session){

if(

PUBLIC_PAGES.includes(path)

){

return;

}

window.location.href=

"/auth/login.html";

return;

}



const profile=

await getProfile(

session.user.id

);



if(!profile){

await supabaseClient

.auth

.signOut();

window.location.href=

"/auth/login.html";

return;

}



/* ----------

ADMIN AREA

---------- */

if(

path.startsWith(

ADMIN_FOLDER

)

){

if(

profile.role!=="admin"

){

window.location.href="/";

return;

}

}



/* ----------

STORE USER

---------- */

window.currentUser=

session.user;

window.currentProfile=

profile;

})();
/* ==========================================================
   SESSION LISTENER
========================================================== */

supabaseClient.auth.onAuthStateChange(

(event,session)=>{

console.log(

"Auth:",

event

);

if(

event==="SIGNED_OUT"

){

window.location.href=

"/auth/login.html";

}

});
/* ==========================================================
   LOGOUT
========================================================== */

async function logout(){

await supabaseClient

.auth

.signOut();

localStorage.clear();

sessionStorage.clear();

window.location.href=

"/auth/login.html";

}
