import { FirebaseApp } from "@firebase/app";
import { Bytes, collection, doc, getFirestore, onSnapshot, query, setDoc, Unsubscribe } from "@firebase/firestore";
import { Observable } from "lib0/observable";
import * as Y from 'yjs';

const UPDATES = "updates";

interface DocUpdate {

    /** The binary encoding of the update */
    update: Bytes;
}


/**
 * A Yjs Provider that stores document updates in a Firestore collection.
 * 
 * Each update is stored in a Firestore document at:
 * ```
 * {collectionName}/{docId}/updates/{updateId}
 * ```
 * The `updateId` has the form `{ydoc.clientID}-{clock}` where
 * `clock` is incremented with each new update that is received. The
 * `ydoc.clientID` and `clock` values are expressed as hex numbers.
 * 
 * ```
 */
export default class FirestoreProvider extends Observable<any> {
    readonly doc: Y.Doc;
    private firebaseApp: FirebaseApp;
    private collectionName: string;
    private docId: string;
    private unsubscribe?: Unsubscribe;
    private clock = 0;

    private cache?: Uint8Array;
    private maxUpdatePause = 600;
    private maxUpdateCount = 20;
    private updateCount = 0;
    private timeoutId?: ReturnType<typeof setTimeout>;
    private updateHandler: (update: Uint8Array, origin: any) => void;

    constructor(firebaseApp: FirebaseApp, ydoc: Y.Doc, collectionName: string, docId: string) {
        super();
        this.firebaseApp = firebaseApp;
        this.doc = ydoc;
        this.collectionName = collectionName;
        this.docId = docId;

        const db = getFirestore(firebaseApp);
        const self = this;

        this.updateHandler = (update, origin) => {

            // Ignore updates applied by this provider
            if (origin !== self) {
                // The update was produced either locally or by another provider.
                //
                // Don't persist every single update. Instead, merge updates until there are 
                // at least 20 changes or there is a pause in updates greater than 600 ms.
                // Merged updates are stored in `this.cache`

                if (self.timeoutId) {
                    clearTimeout(self.timeoutId);
                    delete self.timeoutId;
                }
                
                self.cache = self.cache ? Y.mergeUpdates([self.cache, update]) : update;
                self.updateCount++;

                if (self.updateCount < self.maxUpdateCount) {
                    if (self.timeoutId) {
                        clearTimeout(self.timeoutId);
                    }
                    self.timeoutId = setTimeout(() => {
                        delete self.timeoutId;
                        self.emit();
                    }, self.maxUpdatePause)
                } else {
                    self.emit();
                }
            }
        }

        // Subscribe to the ydoc's update events
        ydoc.on('update', this.updateHandler)


        // Start a listener for document updates
        const q = query(collection(db, collectionName));
        this.unsubscribe = onSnapshot(q, (snapshot) => {
            snapshot.forEach( document => {
                const data = document.data() as DocUpdate;
                const clientID = parseClientId(document.id);
                // Ignore updates that originated from the local Y.Doc
                if (clientID !== ydoc.clientID) {
                    const update = data.update.toUint8Array();
                    Y.applyUpdate(ydoc, update, self);
                }
            })
        })
    }

    destroy() {
        this.emit();
        if (this.unsubscribe) {
            this.unsubscribe();
            delete this.unsubscribe;
        }
        
        this.doc.off("update", this.updateHandler);
        super.destroy();
    }

    emit() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            delete this.timeoutId;
        }
        
        const update = this.cache;
        delete this.cache;
        this.updateCount=0;

        if (update) {
            const data: DocUpdate = {
                update: Bytes.fromUint8Array(update)
            }

            const clock = this.clock++;
            const updateId = this.doc.clientID.toString(16) + "-" + clock.toString(16);

            const db = getFirestore(this.firebaseApp);
            const docRef = doc(db, this.collectionName, this.docId, UPDATES, updateId);
            setDoc(docRef, data);
        }
    }
}

function parseClientId(updateId: string) {
    const dash = updateId.indexOf('-');
    const value = updateId.substring(0, dash);
    return parseInt(value, 16);
}