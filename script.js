// Starchaser website effects

console.log("Welcome to Starchaser's galaxy ✦");

// Create small shooting star effect

function shootingStar(){

    const star = document.createElement("div");

    star.style.position="fixed";
    star.style.width="3px";
    star.style.height="3px";
    star.style.background="white";
    star.style.left=Math.random()*window.innerWidth+"px";
    star.style.top="0px";
    star.style.boxShadow="0 0 15px white";

    document.body.appendChild(star);

    let position=0;

    let animation=setInterval(()=>{

        position+=8;

        star.style.transform=
        `translate(${position}px,${position}px)`;

        if(position>window.innerWidth){

            clearInterval(animation);
            star.remove();

        }

    },20);

}

setInterval(shootingStar,5000);