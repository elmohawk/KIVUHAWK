/* ==========================================================
   KIVUSTREAM MY LIST ENGINE
========================================================== */


let myListContent = [];

let currentFilter = "all";



document.addEventListener(
"DOMContentLoaded",
async()=>{


console.log(
"KivuStream My List Loading..."
);


await loadMyList();


setupSearch();


setupFilters();


});
/* ==========================================================
   LOAD MY LIST
========================================================== */


async function loadMyList(){


try{


const {

data:{
session

}

}

=
await supabaseClient
.auth
.getSession();



if(!session){


window.location.href=
"auth/login.html";


return;


}



const userId =
session.user.id;



const {

data,

error

}

=
await supabaseClient


.from("my_list")

.select("*")


.eq(

"user_id",

userId

)


.order(

"created_at",

{

ascending:false

}

);



if(error){

console.error(error);

return;

}



myListContent =
data || [];



updateStats();



renderMyList();



}

catch(error){

console.error(

"My List Error:",

error

);


}



}
/* ==========================================================
   RENDER LIST
========================================================== */


function renderMyList(){


const container =
document.getElementById(
"myListContainer"
);


const empty =
document.getElementById(
"emptyState"
);



let filtered =
filterMyList();



if(filtered.length===0){


container.innerHTML="";


empty.style.display="block";


return;


}



empty.style.display="none";



container.innerHTML="";



filtered.forEach(item=>{


const card =
document.createElement(
"div"
);


card.className=
"my-card";



card.innerHTML=`

<div class="remove-btn"
onclick="removeFromList('${item.id}')">

<i class="fa-solid fa-xmark"></i>

</div>


<img

src="${item.poster || 'assets/logo.png'}"

loading="lazy">


<h3>

${item.title}

</h3>


<button

onclick="openWatch('${item.content_id}')">

<i class="fa-solid fa-play"></i>

Watch

</button>

`;



container.appendChild(card);



});



}
/* ==========================================================
   FILTERS
========================================================== */


function filterMyList(){


if(currentFilter==="all"){

return myListContent;

}



if(currentFilter==="recent"){


return [

...myListContent

]

.sort(

(a,b)=>

new Date(b.created_at)

-

new Date(a.created_at)

);

}



return myListContent.filter(

item=>

item.content_type===currentFilter

);


}
/* ==========================================================
   SEARCH
========================================================== */


function setupSearch(){


const input =
document.getElementById(
"searchMyList"
);



input.addEventListener(

"input",

()=>{


const value =
input.value.toLowerCase();



const container =
document.getElementById(
"myListContainer"
);



const results =

myListContent.filter(

item=>

item.title

?.toLowerCase()

.includes(value)

);



container.innerHTML="";



results.forEach(renderSingleCard);



}

);


}
/* ==========================================================
   FILTER BUTTONS
========================================================== */


function setupFilters(){


document
.querySelectorAll(".filter")
.forEach(btn=>{


btn.onclick=()=>{


document

.querySelectorAll(".filter")

.forEach(b=>

b.classList.remove("active")

);



btn.classList.add("active");



currentFilter =
btn.dataset.filter;



renderMyList();


};


});


}
/* ==========================================================
   STATS
========================================================== */


function updateStats(){


const movies =

myListContent.filter(

x=>

x.content_type==="movie"

).length;



const series =

myListContent.filter(

x=>

x.content_type==="series"

).length;



document
.getElementById("movieCount")
.innerText=
movies;



document
.getElementById("seriesCount")
.innerText=
series;



document
.getElementById("totalCount")
.innerText=
myListContent.length;



}
/* ==========================================================
   REMOVE
========================================================== */


async function removeFromList(id){


await supabaseClient

.from("my_list")

.delete()

.eq(

"id",

id

);



await loadMyList();



}
/* ==========================================================
   WATCH
========================================================== */


function openWatch(id){


window.location.href=

`watch.html?id=${id}`;


}
function renderSingleCard(item){


const container =

document.getElementById(
"myListContainer"
);


container.innerHTML +=`

<div class="my-card">

<img

src="${item.poster || 'assets/logo.png'}">


<h3>${item.title}</h3>


</div>

`;

}
