/* ===========================
   3D CARD EFFECT
=========================== */

document.addEventListener("mousemove",(e)=>{

    document.querySelectorAll(".movie-card").forEach(card=>{

        const rect = card.getBoundingClientRect();

        const x = e.clientX - rect.left;

        const y = e.clientY - rect.top;

        const centerX = rect.width/2;

        const centerY = rect.height/2;

        const rotateY = (x-centerX)/18;

        const rotateX = -(y-centerY)/18;

        card.style.transform =
        `
        perspective(900px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        scale(1.02)
        `;

    });

});

document.addEventListener("mouseleave",()=>{

    document.querySelectorAll(".movie-card").forEach(card=>{

        card.style.transform="";

    });

});
