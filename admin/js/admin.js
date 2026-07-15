/* ======================================================
   KIVUSTREAM ADMIN CONTROLLER
====================================================== */


/* ======================================================
   DOM READY
====================================================== */


document.addEventListener(
"DOMContentLoaded",
()=>{


console.log(
"KivuStream Admin Loaded"
);



initSidebar();

initLogout();

highlightActiveMenu();

});





/* ======================================================
   SIDEBAR CONTROL
====================================================== */


function initSidebar(){


const menuBtn =
document.getElementById(
"menuToggle"
);


const sidebar =
document.querySelector(
".sidebar"
);



if(!menuBtn || !sidebar){

console.warn(
"Sidebar elements missing"
);

return;

}



menuBtn.addEventListener(

"click",

()=>{


sidebar.classList.toggle(
"show"
);


}

);



/*
Close sidebar when clicking outside
*/


document.addEventListener(

"click",

(e)=>{


if(

window.innerWidth <= 900 &&

!sidebar.contains(e.target) &&

!menuBtn.contains(e.target)

){


sidebar.classList.remove(
"show"
);


}


});


}





/* ======================================================
   ACTIVE MENU
====================================================== */


function highlightActiveMenu(){


const links =
document.querySelectorAll(
".sidebar-menu a"
);



const current =
window.location.pathname
.split("/")
.pop();



links.forEach(

link=>{


const href =
link
.getAttribute("href");



if(
href === current
){

link.classList.add(
"active"
);

}

else{

link.classList.remove(
"active"
);

}


});


}





/* ======================================================
   LOGOUT
====================================================== */


function initLogout(){


const logout =
document.getElementById(
"logoutBtn"
);



if(!logout){

return;

}



logout.addEventListener(

"click",

async(e)=>{


e.preventDefault();



try{


if(
typeof supabaseClient !== "undefined"
){


await supabaseClient
.auth
.signOut();


}



}

catch(error){


console.error(
"Logout Error:",
error
);


}



window.location.href =
"../login.html";



});


}





/* ======================================================
   ADMIN NOTIFICATION BUTTON
====================================================== */


const notificationButton =
document.querySelector(
".notification-btn"
);



if(notificationButton){


notificationButton.addEventListener(

"click",

()=>{


console.log(
"Notifications opened"
);


});


}
/* ======================================================
   ADMIN AUTHENTICATION GUARD
====================================================== */


async function checkAdminAccess(){


try{


if(
typeof supabaseClient === "undefined"
){


console.error(
"Supabase client missing"
);

return false;

}



const {

data:{
user

}

}

=

await supabaseClient
.auth
.getUser();



if(!user){


console.warn(
"No user session"
);


window.location.href =
"../login.html";


return false;


}




/*

Check admin role

Requires your users table:

users

id
email
role


role = admin


*/


const {

data:profile,

error

}

=

await supabaseClient

.from("users")

.select("*")

.eq(
"id",
user.id
)

.single();



if(error){


console.error(
"Profile error:",
error
);


window.location.href =
"../login.html";


return false;


}





if(
profile.role !== "admin"
){


alert(
"Access denied"
);



window.location.href =
"../index.html";


return false;


}





loadAdminProfile(
profile
);



return true;



}

catch(error){


console.error(
"Admin Guard Error:",
error
);



window.location.href =
"../login.html";


return false;


}



}







/* ======================================================
   LOAD ADMIN PROFILE
====================================================== */


function loadAdminProfile(
profile
){


const name =
document.getElementById(
"adminName"
);



if(name){


name.textContent =

profile.name ||

profile.email ||

"Administrator";


}



}





/* ======================================================
   AUTO RUN SECURITY CHECK
====================================================== */


document.addEventListener(

"DOMContentLoaded",

async()=>{


const allowed =
await checkAdminAccess();



if(!allowed){

return;

}



console.log(

"KivuStream Admin Access Granted"

);



});
