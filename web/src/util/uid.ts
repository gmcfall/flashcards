import { base64FromNumber, Rixits } from "./Base64";

const buffer = new Uint32Array(32);
let index = buffer.length;

function randomNumber() : number {
    if (index === buffer.length) {
        window.crypto.getRandomValues(buffer);
        index = 0;
    }
    return buffer[index++];
}

function randomNumberLimit(limit: number) : number {
    const value = randomNumber();
    return value % limit;
}

export default function generateUid() { 
    const rand1 = randomNumber();
    const rand2 = randomNumber();
    const time = Date.now();

    let result = base64FromNumber(rand1) + base64FromNumber(rand2) + base64FromNumber(time);

    // Ensure that the result starts and ends with an alphanumeric character.
    if (result.startsWith("_") || result.startsWith("+")) {
        result = randomLetterOrNumber() + result.substring(1);
    }
    if (result.endsWith("_") || result.endsWith("+")) {
        result = result.substring(0, result.length-1) + randomLetterOrNumber();
    }

    return result;
}

function randomLetterOrNumber() {

    const index = randomNumberLimit(62);
    return Rixits.charAt(index);
    
}



