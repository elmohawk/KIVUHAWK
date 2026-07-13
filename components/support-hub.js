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
/* ==========================================================
   CLICK OUTSIDE
========================================================== */

document.addEventListener("click",(e)=>{

if(

!hub.contains(e.target)

&&

isOpen

){

closeSupport();

}

});
/* ==========================================================
   ESC CLOSE
========================================================== */

document.addEventListener(

"keydown",

e=>{

if(

e.key==="Escape"

&&

isOpen

){

closeSupport();

}

});
/* ==========================================================
   CLOSE
========================================================== */

function closeSupport(){

isOpen=false;

hub.classList.remove("active");

icon.className=

"fa-solid fa-headset";

}
/* ==========================================================
   3D GLASS EFFECT
========================================================== */

document.addEventListener(

"mousemove",

e=>{

if(!isOpen)return;

const rect=

panel.getBoundingClientRect();

const x=

e.clientX

-

rect.left;

const y=

e.clientY

-

rect.top;

const rotateY=

((x/rect.width)-0.5)*16;

const rotateX=

((y/rect.height)-0.5)*-16;

panel.style.transform=

`

translateY(0)

rotateX(${rotateX}deg)

rotateY(${rotateY}deg)

`;

});
/* ==========================================================
   RESET
========================================================== */

panel.addEventListener(

"mouseleave",

()=>{

panel.style.transform=

`

translateY(0)

rotateX(0deg)

rotateY(0deg)

`;

});
/* ==========================================================
   BUG REPORT
========================================================== */

reportBug.onclick=()=>{

window.location.href=

"report.html";

};
/* ==========================================================
   FEATURE REQUEST
========================================================== */

featureRequest.onclick=()=>{

window.location.href=

"feature-request.html";

};
/* ==========================================================
   MOBILE
========================================================== */

document

.querySelectorAll(".support-btn")

.forEach(btn=>{

btn.onclick=()=>{

if(

window.innerWidth<768

){

setTimeout(

closeSupport,

300

);

}

};

});
/* ==========================================================
   AUTO HIDE
========================================================== */

let lastScroll=0;

window.addEventListener(

"scroll",

()=>{

const current=

window.scrollY;

if(

current>lastScroll

&&

current>300

){

hub.style.bottom="-120px";

}else{

hub.style.bottom="30px";

}

lastScroll=current;

});
/* ==========================================================
   INTRO
========================================================== */

window.addEventListener(

"load",

()=>{

hub.animate(

[

{

transform:

"translateY(120px)",

opacity:0

},

{

transform:

"translateY(0)",

opacity:1

}

],

{

duration:700,

easing:"ease-out"

}

);

});
console.log(
"%c KivuStream Support Hub Pro v3.0",
"color:#00C2FF;font-size:16px;font-weight:bold;"
);
