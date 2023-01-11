import { FirebaseApp } from "firebase/app";
import produce from "immer";
import Lease from "./Lease";
import { Entity, EntityCache, EntityClientOptions, LeaseOptions } from "./types";

export default class EntityClient {

    /** The FirebaseApp that will be used to fetch documents */
    readonly firebaseApp: FirebaseApp;

    /** A Map where the key is the hash of an EntityKey and the value is the Lease for the entity */
    private leases: Map<string, Lease> = new Map<string, Lease>();

    /** 
     * A Map where the key is the hash of an EntityKey and the value is a Lease that has been abandonded,
     * i.e. the Lease has leasees. This map allows for quick garbage collection.
     */
    private abandonedLeases: Set<Lease> = new Set<Lease>();

    /**
     * A Map where the key is the name for a leasee, and the value is the set of
     * Leases owned by the leasee.
     */
    private leaseeLeases: Map<string, Set<Lease>> = new Map<string, Set<Lease>>();

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
                        this.removeEntity(lease.key, draftCache);
                    }
                })
            })
            if (mutated) {
                this.setCache(nextCache);
            }

        }, self.options.cacheTime)
    }

    putCache(cache: EntityCache) {
        this.cache = cache;
    }

    /**
     * Add a given entity to the cache on behalf of a given leasee.
     * @param key The hash of the EntityKey
     * @param entity The entity to be added
     * @param leasee The name of the leasee adding the entity
     * @param cache The cache proxy to which the entity will be added
     */
    addEntity(key: string, entity: Entity<any>, leasee: string, cache: EntityCache) {
        cache.entities[key] = entity;
        this.claimLease(key, leasee);
    }

    /**
     * Remove an entity from a given cache.
     * @param key The hash of the key under which the entity is stored in the cache
     * @param cache The cache containing the entity
     */
    removeEntity(key: string, cache: EntityCache) {
        delete cache.entities[key];
        const lease = this.leases.get(key);
        if (lease) {
            lease.leasees.forEach(leasee => {
                const set = this.leaseeLeases.get(leasee);
                if (set) {
                    set.delete(lease);
                }
            })
            this.abandonedLeases.delete(lease);
        }
        this.leases.delete(key);
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

    claimLease(entityKey: string, leasee: string, options?: LeaseOptions) {
        let lease = this.leases.get(entityKey);
        if (!lease) {
            lease = new Lease(entityKey);
            this.leases.set(entityKey, lease);
        }
        if (!lease.leasees.has(leasee)) {
            lease.addLeasee(leasee);
            let set = this.leaseeLeases.get(leasee);
            if (!set) {
                set = new Set<Lease>();
                this.leaseeLeases.set(leasee, set);
            }
            set.add(lease);
        }
        if (options) {
            lease.options = options;
        }
        this.abandonedLeases.delete(lease);
    }

}

function expiryTime(lease: Lease, cacheTime: number) {
    const options = lease.options;
    const abandonTime = lease.abandonTime;
    const extraTime = options?.cacheTime || cacheTime;
    return abandonTime + extraTime;
}