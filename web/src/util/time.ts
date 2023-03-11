import { Timestamp } from "firebase/firestore";
import { ClientTimestamp } from "../model/types";

export function compareTimestamps(a: Timestamp | ClientTimestamp, b: Timestamp | ClientTimestamp) {
    const seconds = a.seconds - b.seconds;
    if (seconds !== 0) {
        return seconds;
    }
    const nano = a.nanoseconds - b.nanoseconds;
    return nano;
}

export function toClientTimestamp(a: Timestamp) {
    return {
        seconds: a.seconds,
        nanoseconds: a.nanoseconds
    }
}

const NANO_PER_MILLI = 1000000;
export function toUnixTime(timestamp: ClientTimestamp) {
    return timestamp.seconds + Math.floor(timestamp.nanoseconds / NANO_PER_MILLI);
}
