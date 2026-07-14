/* ==========================================================
   KIVUSTREAM VIEW ALL ENGINE
   Premium 3D Edition
========================================================== */

let allContent = [];

let filteredContent = [];

let currentCategory = "movie";

let itemsPerLoad = 24;

let currentItems = 24;
/* ==========================================================
   URL
========================================================== */

const params = new URLSearchParams(window.location.search);

currentCategory =

params.get("category")

||

"movie";
document.addEventListener(

"DOMContentLoaded",

async()=>{

await loadContent();

setupSearch();

setupSorting();

setupLoadMore();

start3D();

});
function filterContent(){

switch(currentCategory){

case "movie":

filteredContent =

allContent.filter(

x=>x.type==="movie"

);

break;

case "series":

filteredContent =

allContent.filter(

x=>x.type==="series"

);

break;

case "trending":

filteredContent=

[...allContent]

.sort(

(a,b)=>

Number(b.rating||0)

-

Number(a.rating||0)

);

break;

case "latest":

filteredContent=

[...allContent]

.sort(

(a,b)=>

new Date(b.created_at)

-

new Date(a.created_at)

);

break;

default:

filteredContent=

allContent.filter(

x=>

x.category

?.toLowerCase()

.includes(

currentCategory

)

);

}

}
function renderContent(){

renderCards(

filteredContent.slice(

0,

currentItems

),

"viewAllContainer"

);

document.getElementById(

"resultCount"

).innerHTML=

`(${filteredContent.length})`;

}
function setupSearch(){

const input=

document.getElementById(

"searchInput"

);

input.oninput=()=>{

const q=

input.value.toLowerCase();

filteredContent=

allContent.filter(item=>{

const title=

(item.title||"")

.toLowerCase();

const matchCategory=

currentCategory==="movie"

?

item.type==="movie"

:

currentCategory==="series"

?

item.type==="series"

:

item.category

?.toLowerCase()

.includes(currentCategory);

return matchCategory&&title.includes(q);

});

renderContent();

};

}
function setupSorting(){

const sort=

document.getElementById(

"sortSelect"

);

sort.onchange=()=>{

switch(sort.value){

case"latest":

filteredContent.sort(

(a,b)=>

new Date(b.created_at)

-

new Date(a.created_at)

);

break;

case"rating":

filteredContent.sort(

(a,b)=>

Number(b.rating)

-

Number(a.rating)

);

break;

case"az":

filteredContent.sort(

(a,b)=>

a.title.localeCompare(

b.title

)

);

break;

case"year":

filteredContent.sort(

(a,b)=>

Number(b.year)

-

Number(a.year)

);

}

renderContent();

};

}
function setupLoadMore(){

document

.getElementById(

"loadMoreBtn"

)

.onclick=()=>{

currentItems+=24;

renderContent();

};

}
function updateHero(){

document

.getElementById(

"pageTitle"

)

.innerHTML=

capitalize(

currentCategory

);

document

.getElementById(

"categoryBadge"

)

.innerHTML=

capitalize(

currentCategory

);

if(filteredContent.length){

document

.querySelector(

".viewall-hero"

)

.style.backgroundImage=

`linear-gradient(rgba(0,0,0,.2),rgba(5,10,21,.9)),
url(${filteredContent[0].backdrop})`;

}

}
function capitalize(text){

return

text.charAt(0)

.toUpperCase()

+

text.slice(1);

}
function start3D(){

const hero=

document.querySelector(

".viewall-hero"

);

document.addEventListener(

"mousemove",

e=>{

const x=

(e.clientX/window.innerWidth-.5)*20;

const y=

(e.clientY/window.innerHeight-.5)*20;

hero.style.transform=

`

rotateY(${x}deg)

rotateX(${-y}deg)

`;

});

}
document.addEventListener(

"mousemove",

e=>{

document

.querySelectorAll(

".movie-card"

)

.forEach(card=>{

const rect=

card.getBoundingClientRect();

const x=

e.clientX

-

rect.left;

const y=

e.clientY

-

rect.top;

const rotateY=

((x/rect.width)-.5)*18;

const rotateX=

((y/rect.height)-.5)*-18;

card.style.transform=

`

rotateY(${rotateY}deg)

rotateX(${rotateX}deg)

`;

});

});
window.addEventListener(

"scroll",

()=>{

if(

window.innerHeight+

window.scrollY>=

document.body.offsetHeight-500

){

currentItems+=24;

renderContent();

}

});
window.addEventListener(

"load",

()=>{

document.body.animate(

[

{

opacity:0,

transform:

"scale(.98)"

},

{

opacity:1,

transform:

"scale(1)"

}

],

{

duration:500

}

);

});
