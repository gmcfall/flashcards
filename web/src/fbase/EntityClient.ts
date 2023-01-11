import { FirebaseApp } from "firebase/app";
import produce from "immer";
import { lookupEntity, toEntityTuple } from "./common";
import Lease from "./Lease";
import { Entity, EntityCache, EntityClientOptions, EntityKey, LeaseOptions } from "./types";
import { hashEntityKey } from "./util";

export default class EntityClient {

    /** The FirebaseApp that will be used to fetch documents */
    readonly firebaseApp: FirebaseApp;

    /** A Map where the key is the hash of an EntityKey and the value is the Lease for the entity */
    readonly leases: Map<string, Lease> = new Map<string, Lease>();

    /** 
     * A Map where the key is the hash of an EntityKey and the value is a Lease that has been abandonded,
     * i.e. the Lease has leasees. This map allows for quick garbage collection.
     */
    readonly abandonedLeases: Set<Lease> = new Set<Lease>();

    /**
     * A Map where the key is the name for a leasee, and the value is the set of
     * Leases owned by the leasee.
     */
    readonly leaseeLeases: Map<string, Set<Lease>> = new Map<string, Set<Lease>>();

    /** The function used to set a new revision of the cache */
    readonly setCache: React.Dispatch<React.SetStateAction<EntityCache>>;
    
    /** The current state of the cache */
    cache: EntityCache;

    /** Options for managing expiry of entities in the cache */
    options: EntityClientOptions;

    constructor(
        firebaseApp: FirebaseApp,
        cache: EntityCache,
        setCache: React.Dispatch<React.SetStateAction<EntityCache>>,
        options?: EntityClientOptions
    ) {
        this.firebaseApp = firebaseApp;
        this.cache = cache;
        this.setCache = setCache;
        this.options = options || {cacheTime: 300000};
        
        const self = this;

        setInterval(() => {
            const now = Date.now();
            const cacheTime = self.options.cacheTime;

            let mutated = false;
            const nextCache = produce(this.cache, draftCache => {
                self.abandonedLeases.forEach((lease) => {
                    if (lease.leasees.size===0 && (now > expiryTime(lease, cacheTime))) {
                        mutated = true;
                        removeEntity(this, lease.key, draftCache);
                    }
                })
            })
            if (mutated) {
                this.setCache(nextCache);
            }

        }, self.options.cacheTime)
    }

    lookupEntity(key: EntityKey) {
        const hashValue = hashEntityKey(key);
        const entity = lookupEntity(this.cache, hashValue);
        return toEntityTuple(entity);
    }

    /**
     * Remove a given leasee from all leases that it currently claims.
     * @param leasee The name of the leasee
     */
    disownAllLeases(leasee: string) {
        const set = this.leaseeLeases.get(leasee);
        if (set) {
            set.forEach(lease => {
                lease.removeLeasee(leasee);
                if (lease.leasees.size===0) {
                    this.abandonedLeases.add(lease);
                }
            })
            this.leaseeLeases.delete(leasee);
        }
    }

}

export function putCache(client: EntityClient, cache: EntityCache) {
    client.cache = cache;
}

/**
 * Add a given entity to the cache on behalf of a given leasee.
 * @param key The hash of the EntityKey
 * @param entity The entity to be added
 * @param leasee The name of the leasee adding the entity
 * @param cache The cache proxy to which the entity will be added
 */
export function addEntity(client: EntityClient, key: string, entity: Entity<any>, leasee: string, cache: EntityCache, options?: LeaseOptions) {
    cache.entities[key] = entity;
    claimLease(client, key, leasee, options);
}


/**
 * Remove an entity from a given cache.
 * @param key The hash of the key under which the entity is stored in the cache
 * @param cache The cache containing the entity
 */
export function removeEntity(client: EntityClient, key: string, cache: EntityCache) {
    const entity = cache.entities[key];
    if (entity) {
        if (entity.unsubscribe) {
            entity.unsubscribe();
        }
        delete cache.entities[key];
    }
    const lease = client.leases.get(key);
    if (lease) {
        lease.leasees.forEach(leasee => {
            const set = client.leaseeLeases.get(leasee);
            if (set) {
                set.delete(lease);
            }
        })
        client.abandonedLeases.delete(lease);
    }
    client.leases.delete(key);
}

export function claimLease(client: EntityClient, entityKey: string, leasee: string, options?: LeaseOptions) {

    let lease = client.leases.get(entityKey);
    if (!lease) {
        lease = new Lease(entityKey);
        client.leases.set(entityKey, lease);
    }
    if (!lease.leasees.has(leasee)) {
        lease.addLeasee(leasee);
        let set = client.leaseeLeases.get(leasee);
        if (!set) {
            set = new Set<Lease>();
            client.leaseeLeases.set(leasee, set);
        }
        set.add(lease);
    }
    if (options) {
        lease.options = options;
    }
    client.abandonedLeases.delete(lease);
}

function expiryTime(lease: Lease, cacheTime: number) {
    const options = lease.options;
    const abandonTime = lease.abandonTime;
    const extraTime = options?.cacheTime || cacheTime;
    return abandonTime + extraTime;
}