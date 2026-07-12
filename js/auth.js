/* ===========================
   LOGIN
=========================== */

const loginBtn =
document.getElementById("loginBtn");

const signupBtn =
document.getElementById("signupBtn");

loginBtn.onclick = async ()=>{

    const email =
    document.getElementById("email").value;

    const password =
    document.getElementById("password").value;

    const {error} =
    await supabase.auth.signInWithPassword({

        email,

        password

    });

    if(error){

        alert(error.message);

        return;

    }

    location.href="index.html";

};

/* ===========================
   SIGNUP
=========================== */

signupBtn.onclick = async ()=>{

    const email =
    document.getElementById("email").value;

    const password =
    document.getElementById("password").value;

    const {error} =
    await supabase.auth.signUp({

        email,

        password

    });

    if(error){

        alert(error.message);

        return;

    }

    alert("Account created. Check your email if confirmation is enabled.");

};
