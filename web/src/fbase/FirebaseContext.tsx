

import { FirebaseApp } from 'firebase/app';
import React, { useState } from 'react';
import EntityClient, { putCache } from './EntityClient';
import { EntityCache } from './types';


export const FirebaseContext = React.createContext<EntityClient | null>(null);


interface FirebaseProviderProps {
    firebaseApp: FirebaseApp;
    children?: React.ReactNode;
}
export function FirebaseProvider(props: FirebaseProviderProps) {
    const {firebaseApp, children} = props;

    const [cache, setCache] = useState<EntityCache>({entities: {}})
    const [client] = useState<EntityClient>(new EntityClient(firebaseApp, cache, setCache));

    putCache(client, cache);

    return (
        <FirebaseContext.Provider value={client}>
            {children}
        </FirebaseContext.Provider>
    )

}




