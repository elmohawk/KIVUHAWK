/* ==========================================================
   KIVUSTREAM SESSION MANAGER
========================================================== */

document.addEventListener("DOMContentLoaded", initSession);

async function initSession() {

    try {

        const {
            data: { session }
        } = await supabaseClient.auth.getSession();

        if (!session) {

            protectPage();

            return;

        }

        await loadCurrentUser(session.user);

    }

    catch (err) {

        console.error("Session Error:", err);

    }

}

/* ==========================================================
   PROTECT PRIVATE PAGES
========================================================== */

function protectPage() {

    const protectedPages = [

        "profile.html",
        "mylist.html",

        "admin/index.html",
        "admin/add-movie.html",
        "admin/manage-series.html",
        "admin/manage-episodes.html"

    ];

    const current = location.pathname.toLowerCase();

    const requiresLogin = protectedPages.some(page =>
        current.endsWith(page.toLowerCase())
    );

    if (requiresLogin) {

        window.location.replace("login.html");

    }

}

/* ==========================================================
   LOAD USER INFO
========================================================== */

async function loadCurrentUser(user) {

    const profileName = document.getElementById("profileName");
    const profileEmail = document.getElementById("profileEmail");
    const profileAvatar = document.getElementById("profileAvatar");

    try {

        const { data } = await supabaseClient

            .from("profiles")

            .select("*")

            .eq("id", user.id)

            .single();

        if (profileName) {

            profileName.textContent =
                data?.username || user.email;

        }

        if (profileEmail) {

            profileEmail.textContent =
                user.email;

        }

        if (profileAvatar) {

            profileAvatar.src =
                data?.avatar ||
                "assets/default-avatar.png";

        }

    }

    catch (err) {

        console.error(err);

    }

}

/* ==========================================================
   LOGOUT
========================================================== */

async function logout() {

    await supabaseClient.auth.signOut();

    localStorage.clear();
    sessionStorage.clear();

    window.location.replace("login.html");

}

/* ==========================================================
   AUTO SESSION LISTENER
========================================================== */

supabaseClient.auth.onAuthStateChange((event, session) => {

    if (event === "SIGNED_OUT") {

        window.location.replace("login.html");

    }

});
