const hero = document.querySelector(".hero");


hero.addEventListener("mousemove",(e)=>{


const x =
(e.clientX / window.innerWidth - .5) * 10;


const y =
(e.clientY / window.innerHeight - .5) * 10;



hero.style.transform = `

perspective(1200px)

rotateX(${-y}deg)

rotateY(${x}deg)

`;

});


hero.addEventListener("mouseleave",()=>{


hero.style.transform="";

});
