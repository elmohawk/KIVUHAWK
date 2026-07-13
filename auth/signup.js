/* ==========================================================
   KIVUSTREAM PROFESSIONAL SIGNUP ENGINE
========================================================== */

const signupForm =
document.getElementById("signupForm");

const loading =
document.getElementById("loadingOverlay");

const signupCard =
document.getElementById("signupCard");

const togglePassword =
document.getElementById("togglePassword");

const password =
document.getElementById("password");

const confirmPassword =
document.getElementById("confirmPassword");

const username =
document.getElementById("username");

const email =
document.getElementById("email");
/* ==========================================================
   PREMIUM 3D CARD
========================================================== */

signupCard.addEventListener("mousemove",e=>{

const rect=signupCard.getBoundingClientRect();

const x=e.clientX-rect.left;

const y=e.clientY-rect.top;

const rotateX=((y/rect.height)-0.5)*-10;

const rotateY=((x/rect.width)-0.5)*10;

signupCard.style.transform=`
perspective(1200px)
rotateX(${rotateX}deg)
rotateY(${rotateY}deg)
scale(1.02)
`;

});

signupCard.addEventListener("mouseleave",()=>{

signupCard.style.transform=`
perspective(1200px)
rotateX(0deg)
rotateY(0deg)
scale(1)
`;

});
togglePassword.onclick=()=>{

password.type=

password.type==="password"

?

"text"

:

"password";

};
signupForm.addEventListener(

"submit",

async(e)=>{

e.preventDefault();

loading.style.display="flex";
  if(password.value!==confirmPassword.value){

loading.style.display="none";

alert("Passwords do not match.");

return;

}

if(password.value.length<6){

loading.style.display="none";

alert("Password must contain at least 6 characters.");

return;

}
  const{

data,

error

}

=

await supabaseClient.auth.signUp({

email:

email.value.trim(),

password:

password.value,

options:{

data:{

username:

username.value.trim()

}

}

});

if(error){

loading.style.display="none";

alert(error.message);

return;

}
  const user=data.user;

await supabaseClient

.from("profiles")

.insert({

id:user.id,

username:

username.value,

email:

email.value,

role:"user",

avatar:"",

created_at:

new Date()

});
  await supabaseClient

.from("notifications")

.insert({

user_id:user.id,

title:"Welcome",

message:

"Welcome to KivuStream!",

read:false

});
  await supabaseClient

.auth

.signInWithPassword({

email:

email.value,

password:

password.value

});
  loading.style.display="none";

window.location.href="../index.html";

});
document

.getElementById(

"googleSignup"

)

.onclick=()=>{

alert(

"Google Signup Coming Soon"

);

};
