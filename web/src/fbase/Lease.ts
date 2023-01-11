import { LeaseOptions } from "./types";

/**
 * A Lease for some entity held in the EntityCache.
 * Each Lease contains a list of leasees, which are typically React components
 * that require the entity for rendering. When the number of leasees drops to
 * zero, we say that the lease as been "abandoned" and the associated entity
 * becomes eligible for garbage collection.  The time to live after being abandoned
 * is governed by the `cacheTime` option. The EntityClient contains default options
 * but the Lease may override the defaults with options of its own.
 */
export default class Lease {

    /** The hash of the EntityKey under which the entity is stored in the cache */
    readonly key: string;

    /** 
     * The set of names for individuals (typically components) that hold
     * a lease for a given entity.
     */
    readonly leasees: Set<string> = new Set<string>();

    /**
     * The time when the number of leasees dropped to zero.
     * 
     * The entity is eligible for garbage collection after 
     * `abandonTime + cacheTime`, where `cacheTime` is defined by
     * the EntityClient options.
     */
    abandonTime: number = 0;

    options?: LeaseOptions;

    constructor(key: string) {
        this.key = key;
    }

    addLeasee(leasee: string) {
        this.leasees.add(leasee);
    }

    removeLeasee(leasee: string) {
        this.leasees.delete(leasee);
        if (this.leasees.size === 0) {
            this.abandonTime = Date.now();
        }
    }
}