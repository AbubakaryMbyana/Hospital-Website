let messageArr = [" A heritage in care and reputation in excellence."];
let textPosition = 0;
let speed = 100;

let typewriter = () => {
    document.querySelector("#message").innerHTML = messageArr[0].substring(0, textPosition) + "<span>|</span>";

    if (textPosition++ != messageArr) {
        setTimeout(typewriter, speed);
    }
}

window.addEventListener("load", typewriter)


