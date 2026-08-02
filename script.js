const body = document.body;
const glow = document.querySelector('.space-glow');

window.addEventListener('mousemove', (event) => {
    const x = (event.clientX / window.innerWidth) * 100;
    const y = (event.clientY / window.innerHeight) * 100;

    if (glow) {
        glow.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(255, 212, 162, 0.16), transparent 24%), radial-gradient(circle at 20% 20%, rgba(118, 138, 184, 0.14), transparent 30%), radial-gradient(circle at 80% 10%, rgba(163, 125, 104, 0.12), transparent 25%)`;
    }

    body.style.background = `radial-gradient(circle at ${x}% ${y}%, #3a4c72 0%, #0d1422 45%, #080b12 100%)`;
});