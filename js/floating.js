const dock =
document.getElementById("floatingDock");

const main =
document.getElementById("floatingMain");

main.onclick=()=>{

dock.classList.toggle("active");

};

document.addEventListener("mousemove",(e)=>{

const x=

(window.innerWidth-e.clientX)/40;

const y=

(window.innerHeight-e.clientY)/40;

dock.style.transform=

`rotateY(${x}deg)
 rotateX(${-y}deg)`;

});
