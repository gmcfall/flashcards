export function jsonClone(object: any) {
    return JSON.parse(JSON.stringify(object))
}