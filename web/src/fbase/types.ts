
export interface Entity<T> {
    unsubscribe?: () => void;
    data?: T;
    error?: Error;
};

export type EntityStatus = 'idle' | 'pending' | 'success' | 'error';

export type IdleTuple = ['idle', undefined, undefined];
export type PendingTuple = ['pending', undefined, undefined];
export type SuccessTuple<T> = ['success', T, undefined];
export type ErrorTuple = ['error', undefined, Error];

export type EntityTuple<T> = (
    IdleTuple |
    PendingTuple |
    SuccessTuple<T> |
    ErrorTuple
)

export type NonIdleTuple<T> = (
    PendingTuple |
    SuccessTuple<T> |
    ErrorTuple
)

export type KeyElement = any;
export type PathElement = string | undefined;

export type Unsubscribe = () => void;

export interface EntityCache {

    entities: Record<string, Entity<any>>;
}

export type EntityKey = readonly unknown[];

export interface EntityClientOptions {

    /** 
     * The minimum number of milliseconds that an abandoned entity can live in the cache.
     * An abandoned entity is one that has no leasees.
     */
    cacheTime: number;
}

export type LeaseOptions = Partial<EntityClientOptions>;


