

import { FirebaseApp } from 'firebase/app';
import React, { useState } from 'react';
import EntityClient, { createEntityClient, updateEntityClient } from './EntityClient';
import { EntityCache } from './types';


export const FirebaseContext = React.createContext<EntityClient | null>(null);


interface FirebaseProviderProps {
    firebaseApp: FirebaseApp;
    children?: React.ReactNode;
}
export function FirebaseProvider(props: FirebaseProviderProps) {
    const {firebaseApp, children} = props;

    const [cache, setCache] = useState<EntityCache>({entities: {}})
    const [client] = useState<EntityClient>(createEntityClient(firebaseApp, cache, setCache));

    const clientValue = updateEntityClient(client, cache);

    return (
        <FirebaseContext.Provider value={clientValue}>
            {children}
        </FirebaseContext.Provider>
    )

}




