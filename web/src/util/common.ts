export function jsonClone(object: any) {
    return JSON.parse(JSON.stringify(object))
}

export function logError(error: unknown) {
    if (error instanceof Error) {
        console.error(error.message);
    } else {
        console.error(error);
    }
}