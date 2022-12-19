
function isValidUsernameChar(c: string) {
    const code = c.charCodeAt(0);
    return (
        (code>=48 && code<=57)  || // digits
        (code>=65 && code<=90)  || // upper case letters
        (code>=97 && code<=122) || // lower case letters
        (code === 95)              // underscore
    )
}

/**
 * Convert a given string into a valid username by removing
 * disallowed characters and trimming to a max of 15 chars.
 * @param value The value to be converted into a valid username
 */
export function toUsername(value: string) {
    let buffer = "";
    for (let i=0; i<value.length; i++) {
        const c = value.charAt(i);
        if (isValidUsernameChar(c)) {
            buffer += c;
        }
    }
    buffer = buffer.trim();
    if (buffer.length>15) {
        buffer = buffer.substring(0, 15);
    }
    return buffer;
}