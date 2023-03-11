export function jsonClone(object: any) {
    return JSON.parse(JSON.stringify(object))
}

export function isEmpty(object: Object) {

    for (const key in object) {
        return false;
    }
    return true;
}

export function last<T>(array: T[]) {
    return array.length===0 ? undefined : array[array.length-1];
}

function findUndefinedInArray(array: any[], path: string="") : string | null {
    for (let i=0; i<array.length; i++) {
        const value = array[i];
        if (value === undefined) {
            return `${path}[${i}]`;
        }
        if (Array.isArray(value)) {
            const result = findUndefinedInArray(value as any[], `${path}[${i}]`);
            if (result) {
                return result;
            }
        }
        if (value && typeof(value) === 'object') {
            const result = findUndefined(value, `${path}[${i}]`);
            if (result) {
                return result;
            }
        }
    }

    return null;
}

export function findUndefined(thing: any, path="") : string | null {
    if (Array.isArray(thing)) {
        return findUndefinedInArray(thing as any[], path);
    }
    if (thing && typeof(thing) === 'object') {
        for (const key in thing) {
            const value = thing[key];
            if (value === undefined) {
                return path ? `${path}.${key}` : key;
            }
            if (Array.isArray(value)) {
                const nextPath = path ? `${path}.${key}` : key;
                const result = findUndefinedInArray(value as any[], nextPath);
                if (result) {
                    return result;
                }
            }
            if (value && typeof(value) === 'object') {
                const nextPath = path ? `${path}.${key}` : key;
                const result = findUndefined(value, nextPath);
                if (result) {
                    return result;
                }
            }
        }
    }
    return null;
}