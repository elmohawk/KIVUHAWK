/* =====================================
   KIVUSTREAM CINEMATIC CARD INTERACTION
   Stable 3D Hover Effect
===================================== */


document.querySelectorAll(".movie-card")
.forEach(card=>{


    card.addEventListener("mousemove",(e)=>{


        const rect = card.getBoundingClientRect();


        const x =
        e.clientX - rect.left;


        const y =
        e.clientY - rect.top;


        const centerX =
        rect.width / 2;


        const centerY =
        rect.height / 2;


        const rotateX =
        ((y - centerY) / centerY) * -4;


        const rotateY =
        ((x - centerX) / centerX) * 4;



        card.style.transform = `

            perspective(900px)

            rotateX(${rotateX}deg)

            rotateY(${rotateY}deg)

            translateY(-10px)

            scale(1.03)

        `;


    });



    card.addEventListener("mouseleave",()=>{


        card.style.transform = `

            perspective(900px)

            rotateX(0deg)

            rotateY(0deg)

            translateY(0)

            scale(1)

        `;


    });


});
