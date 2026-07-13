/* ==========================================================
   KIVUSTREAM LOGIN ENGINE
========================================================== */

const loginForm = document.getElementById("loginForm");
const loading = document.getElementById("loadingOverlay");

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const rememberBox = document.getElementById("remember");
const togglePassword = document.getElementById("togglePassword");

const loginCard = document.getElementById("loginCard");
/* ==========================================================
   REMEMBER EMAIL
========================================================== */

const rememberedEmail = localStorage.getItem("remember_email");

if (rememberedEmail) {

    emailInput.value = rememberedEmail;

    rememberBox.checked = true;

}
/* ==========================================================
   PASSWORD TOGGLE
========================================================== */

togglePassword.addEventListener("click", () => {

    const type =
        passwordInput.type === "password"
        ? "text"
        : "password";

    passwordInput.type = type;

    togglePassword.innerHTML =
        type === "password"
        ? '<i class="fa-solid fa-eye"></i>'
        : '<i class="fa-solid fa-eye-slash"></i>';

});
/* ==========================================================
   3D LOGIN CARD
========================================================== */

loginCard.addEventListener("mousemove", e => {

    const rect =
        loginCard.getBoundingClientRect();

    const x =
        e.clientX - rect.left;

    const y =
        e.clientY - rect.top;

    const rotateX =
        ((y / rect.height) - .5) * -10;

    const rotateY =
        ((x / rect.width) - .5) * 10;

    loginCard.style.transform = `
        perspective(1000px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        scale(1.02)
    `;

});

loginCard.addEventListener("mouseleave", () => {

    loginCard.style.transform = `
        perspective(1000px)
        rotateX(0deg)
        rotateY(0deg)
        scale(1)
    `;

});
/* ==========================================================
   LOGIN
========================================================== */

loginForm.addEventListener("submit", async e => {

    e.preventDefault();

    loading.style.display = "flex";

    const email =
        emailInput.value.trim();

    const password =
        passwordInput.value;

    if (rememberBox.checked) {

        localStorage.setItem(
            "remember_email",
            email
        );

    } else {

        localStorage.removeItem(
            "remember_email"
        );

    }

    const { data, error } =
        await supabaseClient.auth.signInWithPassword({

            email,
            password

        });

    if (error) {

        loading.style.display = "none";

        alert(error.message);

        return;

    }

    const user =
        data.user;
   /* ==========================================================
   CHECK ROLE
========================================================== */

    const {

        data: profile,

        error: roleError

    }

    = await supabaseClient

        .from("profiles")

        .select("role")

        .eq("id", user.id)

        .single();

    loading.style.display = "none";

    if (roleError) {

        alert("Unable to load profile.");

        return;

    }

    if (profile.role === "admin") {

        window.location.href =
            "admin/dashboard.html";

        return;

    }

    window.location.href =
        "index.html";

});
/* ==========================================================
   GOOGLE LOGIN
========================================================== */

document
.getElementById("googleLogin")
.addEventListener("click", () => {

    alert(
        "Google Authentication will be enabled next."
    );

});
