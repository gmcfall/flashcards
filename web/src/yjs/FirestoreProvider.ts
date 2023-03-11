import { FirebaseApp } from "@firebase/app";
import { Bytes, collection, deleteDoc, doc, Firestore, getDoc, getDocs, getFirestore, onSnapshot, query, runTransaction, serverTimestamp, setDoc, Timestamp, Unsubscribe, writeBatch } from "@firebase/firestore";
import { Observable } from "lib0/observable";
import * as Y from 'yjs';
import { currentTime, timeSinceEpoch } from "./time";

const UPDATES = "updates";
const SHUTDOWN = "shutdown";
const YJS_BASELINE = "/yjs/baseline";
const YJS_TIME = "/yjs/time";

interface DocUpdate {
    /** A timestamp when the update was saved */
    createdAt: Timestamp | null;

    /** The binary encoding of the update */
    update: Bytes;
}

async function getUpdates(db: Firestore, path: string) {
    const set = new Set<string>();


    const ref = collection(db, path);
    const snapshot = await getDocs(ref);
    snapshot.forEach( document => set.add(document.id));

    return set;
}

export async function removeYdoc(firebaseApp: FirebaseApp, path: string[], updateSet?: Set<string>) {

    // Save a "shutdown" message for all running providers.
    // This is accomplished by adding an empty document whose `id` is "shutdown" to the
    // "updates" collection.

    const db = getFirestore(firebaseApp);

    const basePath = path.join('/');
    const collectionPath = basePath + '/' + UPDATES;
    const shutdownPath = collectionPath + '/' + SHUTDOWN;
    const shutdownRef = doc(db, shutdownPath);
    await setDoc(shutdownRef, {});

    const baselineRef = doc(db, basePath + YJS_BASELINE);
    
    // If the `updateSet` was not provided, get it via a query

    if (!updateSet) {
        updateSet = await getUpdates(db, collectionPath);
    }

    const batch = writeBatch(db);
    batch.delete(baselineRef);
    // Delete all the updates in the set (except for the "shutdown" message)
    updateSet.forEach( docId => {
        if (docId !== SHUTDOWN) {
            const docPath = collectionPath + '/' + docId;
            const docRef = doc(db, docPath);
            batch.delete(docRef);
        }
    })
    await batch.commit();

    // Finally, delete the shutdown message
    await deleteDoc(shutdownRef);
}

interface UpdateWithTimestamp {
    time: number;
    update?: Uint8Array;
}


/**
 * A Yjs Provider that stores document updates in a Firestore collection.
 * 
 * Each new update is stored in a Firestore document at:
 * ```
 * {path}/updates/{updateId}
 * ```
 * The `updateId` has the form `{ydoc.clientID}-{clock}-{time}` where
 * - `clock` is a number which is incremented with each new update that is received.
 * - `time` is the unix time when the update was created on the client
 * 
 * The values `ydoc.clientID`, `clock` and `time` are expressed as hex numbers.
 * 
 * Periodically, the provider will compress the individual updates into a
 * baseline state at  
 * ```
 * {path}/yjs/baseline
 * ```
 * 
 */
export default class FirestoreProvider extends Observable<any> {
    readonly doc: Y.Doc;
    error?: Error;
    private firebaseApp: FirebaseApp;
    private unsubscribe?: Unsubscribe;
    private clock = 0;
    private basePath: string;

    private cache?: Uint8Array;
    private maxUpdatePause = 600;
    private maxUpdateCount = 20;
    /**
     * The amount of time that an individual update is allowed to live in the 
     * "updates" collection until it is merged into "yjs/baseline"
     */
    private timeToLive = 10000; // 10 seconds
    private updateCount = 0;

    /**
     * The id for a timer that will save pending updates after an elapsed time
     */
    private saveTimeoutId?: ReturnType<typeof setTimeout>;
    private compressIntervalId?: ReturnType<typeof setInterval>;

    private updateHandler: (update: Uint8Array, origin: any) => void;
    private destroyHandler: () => void;
    private updateMap = new Map<string, UpdateWithTimestamp>();
    private isStopped = false;

    constructor(firebaseApp: FirebaseApp, ydoc: Y.Doc, path: string[]) {
        super();
        this.firebaseApp = firebaseApp;
        this.basePath = path.join('/');
        this.doc = ydoc;

        const db = getFirestore(firebaseApp);
        const self = this;

        const extra = Math.floor(2000 * Math.random());
        this.compressIntervalId = setInterval(() => {
            self.compress();
        }, this.timeToLive + extra)

        this.updateHandler = (update, origin) => {

            if (this.isStopped) {
                return;
            }

            // Ignore updates applied by this provider
            if (origin !== self) {
                // The update was produced either locally or by another provider.
                //
                // Don't persist every single update. Instead, merge updates until there are 
                // at least 20 changes or there is a pause in updates greater than 600 ms.
                // Merged updates are stored in `this.cache`

                if (self.saveTimeoutId) {
                    clearTimeout(self.saveTimeoutId);
                    delete self.saveTimeoutId;
                }
                
                self.cache = self.cache ? Y.mergeUpdates([self.cache, update]) : update;
                self.updateCount++;

                if (self.updateCount < self.maxUpdateCount) {
                    if (self.saveTimeoutId) {
                        clearTimeout(self.saveTimeoutId);
                    }
                    self.saveTimeoutId = setTimeout(() => {
                        delete self.saveTimeoutId;
                        self.save();
                    }, self.maxUpdatePause)
                } else {
                    self.save();
                }
            }
        }

        this.destroyHandler = () => this.destroy();

        // Subscribe to the ydoc's update and destroy events
        ydoc.on('update', this.updateHandler)
        ydoc.on('destroy', this.destroyHandler)


        // Start a listener for document updates
        const collectionPath = path.join("/") + '/' + UPDATES;
        const q = query(collection(db, collectionPath));

        const baselinePath = this.basePath + YJS_BASELINE;
        const baseRef = doc(db, baselinePath);
        getDoc(baseRef).then(baseDoc => {
            if (baseDoc.exists()) {
                const bytes = baseDoc.data().update as Bytes;
                const update = bytes.toUint8Array();
                Y.applyUpdate(ydoc, update, self);
            }
        }).then(()=> {
            self.unsubscribe = onSnapshot(q, (snapshot) => {
                let mustShutdown = false;
                snapshot.docChanges().forEach( change => {
                    const document = change.doc;
    
                    switch (change.type) {
                        case "added" :
                        case "modified":
                            if (document.id === SHUTDOWN)  {
                                mustShutdown = true;
                                self.updateMap.set(SHUTDOWN, {time: 0});
                            } else {
                                const data = document.data() as DocUpdate;
                                const createdAt = data.createdAt;
                                if (!createdAt) {
                                    break;
                                }
                                const update = data.update.toUint8Array();
                                const clientID = parseClientId(document.id);
                                const time = timeSinceEpoch(createdAt);
                                self.updateMap.set(document.id, {
                                   time,
                                   update
                                })
                                // Ignore updates that originated from the local Y.Doc
                                if (clientID !== ydoc.clientID) {
                                    Y.applyUpdate(ydoc, update, self);
                                }
                            }
                            break;
                        
                        case "removed" :
                            self.updateMap.delete(document.id);
                            break;
                    }
                    
                })
                if (mustShutdown) {
                    this.shutdown();
                }
            }, (error) => {
                console.error(`An error occurred while listening for Yjs updates at "${collectionPath}"`, error);
                this.error = error;
            })
        }).catch(error => {
            console.error(`An error occurred while getting Yjs update at "${baselinePath}"`, error);
        })


    }

    destroy() {
        this.save();
        this.shutdown();
        super.destroy();
    }

    async removeYDoc() {
        this.shutdown();
        const set = new Set<string>(this.updateMap.keys());
        const path = this.basePath.split('/');
        await removeYdoc(this.firebaseApp, path, set);
    }

    private async compress() {
        const map = this.updateMap;
        if (this.isStopped || map.size===0) {
            return;
        }
        const baselinePath = this.basePath + YJS_BASELINE;
        const updatesPath = this.basePath + '/' + UPDATES + '/';
        const timePath = this.basePath + YJS_TIME;
        
        const now = await currentTime(this.firebaseApp, timePath);
        const zombies = new Set<string>();
        let newUpdates: Uint8Array | null = null;
        for (const [key, value] of map) {
            if (value) {
                const update = value.update;
                if (!update) {
                    // Shutting down;
                    return;
                }
                if (now - value.time > this.timeToLive) {
                   zombies.add(key);
                   newUpdates = newUpdates ? Y.mergeUpdates([newUpdates, update]) : update;
                }
            }
        }
        if (!newUpdates) {
            return;
        }
        try {
            const db = getFirestore(this.firebaseApp);
            
            await runTransaction(db, async (txn) => {
                const baselineRef = doc(db, baselinePath);
                const baselineDoc = await txn.get(baselineRef);
                let update: Uint8Array | null = null;
                if (baselineDoc.exists())  {
                    const baselineData = baselineDoc.data() as DocUpdate;
                    update = Y.mergeUpdates(
                        [baselineData.update.toUint8Array(), newUpdates!]
                    );
                } else {
                    update = newUpdates;
                }

                txn.set(baselineRef, {update: Bytes.fromUint8Array(update!)});
                for (const key of zombies) {
                    const ref = doc(db, updatesPath, key);
                    txn.delete(ref);
                }
            })

        } catch (error) {
            console.error("Failed to compress Yjs update", {error, path: baselinePath})
        }

        for (const key of zombies) {
            map.delete(key);
        }
    }

    private shutdown() {
        if (!this.isStopped) {
            this.isStopped = true;
            this.doc.off("update", this.updateHandler);
            this.doc.off("destroy", this.destroyHandler);
            
            if (this.compressIntervalId) {
                clearInterval(this.compressIntervalId);
                delete this.compressIntervalId;
            }
            if (this.saveTimeoutId) {
                clearTimeout(this.saveTimeoutId);
                delete this.saveTimeoutId;
            }
            if (this.unsubscribe) {
                this.unsubscribe();
                delete this.unsubscribe;
            }
            this.updateMap = new Map<string, UpdateWithTimestamp>();
            if (this.cache) {
                delete this.cache;
            }
            this.updateCount=0;
        }
    }

    private async save() {
        if (this.saveTimeoutId) {
            clearTimeout(this.saveTimeoutId);
            delete this.saveTimeoutId;
        }
        
        const update = this.cache;
        delete this.cache;
        this.updateCount=0;

        if (update && !this.isStopped) {
            const data = {
                createdAt: serverTimestamp(),
                update: Bytes.fromUint8Array(update)
            }

            const clock = this.clock++;
            const time = Date.now();
            const updateId = this.doc.clientID.toString(16) + 
                "-" + clock.toString(16) + '-' + time.toString(16);

            const db = getFirestore(this.firebaseApp);
            const path = this.basePath + "/" + UPDATES + "/" + updateId;
            const docRef = doc(db, path);
            await setDoc(docRef, data);
        }
    }
}

function parseClientId(updateId: string) {
    const dash = updateId.indexOf('-');
    const value = updateId.substring(0, dash);
    return parseInt(value, 16);
}