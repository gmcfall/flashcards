import { base64FromNumber } from "./Base64";

const buffer = new Uint32Array(32);
let index = buffer.length;

function randomNumber() {
    if (index === buffer.length) {
        window.crypto.getRandomValues(buffer);
        index = 0;
    }
    return buffer[index++];
}

export default function generateUid() { 
    const rand1 = randomNumber();
    const rand2 = randomNumber();
    const time = Date.now();

    return base64FromNumber(rand1) + base64FromNumber(rand2) + base64FromNumber(time);
}



