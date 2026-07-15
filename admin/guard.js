/* ==========================================
   KIVUSTREAM ADMIN SECURITY GUARD
========================================== */


document.addEventListener(
"DOMContentLoaded",
checkAdminAccess
);




async function checkAdminAccess(){


try{


const {

data:{
user

}

}

=

await supabaseClient.auth.getUser();





/*
 USER NOT LOGGED IN
*/


if(!user){


window.location.href =
"../login.html";


return;


}








/*
 CHECK USER PROFILE
*/


const {

data:profile,

error

}

=

await supabaseClient

.from("profiles")

.select("*")

.eq(
"id",
user.id
)

.single();








if(error || !profile){


alert(
"Access denied"
);


window.location.href =
"../index.html";


return;


}








/*
 CHECK ADMIN ROLE
*/


if(
profile.role !== "admin"

){


alert(
"Admin permission required"
);



window.location.href =
"../index.html";


return;


}





console.log(

"ADMIN ACCESS GRANTED"

);



}

catch(error){


console.error(
"ADMIN SECURITY ERROR",
error
);



window.location.href =
"../login.html";


}



}
