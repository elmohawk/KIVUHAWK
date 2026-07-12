// Premium Footer Animation

const footer = document.querySelector(".footer");

window.addEventListener("mousemove", (e) => {

    const x = (e.clientX / window.innerWidth - 0.5) * 10;
    const y = (e.clientY / window.innerHeight - 0.5) * 10;

    footer.style.transform = `
        perspective(1400px)
        rotateX(${-y}deg)
        rotateY(${x}deg)
    `;

});

footer.addEventListener("mouseleave", () => {

    footer.style.transform = `
        perspective(1400px)
        rotateX(0deg)
        rotateY(0deg)
    `;

});
