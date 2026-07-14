/* ==========================================================
   KIVUSTREAM SUPPORT HUB
========================================================== */

document.addEventListener("DOMContentLoaded",()=>{

const hub=document.createElement("div");

hub.id="supportHub";

hub.innerHTML=`

<div class="support-toggle">

<i class="fa-solid fa-headset"></i>

</div>

<div class="support-menu">

<a
href="https://wa.me/250794669266"
target="_blank">

<i class="fa-brands fa-whatsapp"></i>

</a>

<a
href="https://whatsapp.com/channel/"
target="_blank">

<i class="fa-brands fa-whatsapp"></i>

</a>

<a
href="tel:+250794669266">

<i class="fa-solid fa-phone"></i>

</a>

</div>

`;

document.body.appendChild(hub);

const toggle=

hub.querySelector(".support-toggle");

toggle.onclick=()=>{

hub.classList.toggle("open");

};

});
