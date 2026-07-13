/* ==========================================================
   KIVUSTREAM SUPPORT HUB PRO
   Version 3.0
========================================================== */

const hub =
document.getElementById("supportHub");

const toggle =
document.getElementById("supportToggle");

const panel =
document.getElementById("supportPanel");

const icon =
document.getElementById("supportIcon");

const reportBug =
document.getElementById("reportBug");

const featureRequest =
document.getElementById("featureRequest");

let isOpen = false;

/* ==========================================================
   TOGGLE PANEL
========================================================== */

toggle.addEventListener("click",()=>{

    isOpen=!isOpen;

    hub.classList.toggle("active");

    icon.className=

    isOpen

    ?

    "fa-solid fa-xmark"

    :

    "fa-solid fa-headset";

});
