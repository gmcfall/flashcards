import { Cache, DocChangeEvent, DocRemovedEvent, getEntity } from "@gmcfall/react-firebase-state";
import { METADATA } from "./firestoreConstants";
import { libraryPath, sortResources } from "./library";
import { ClientLibrary, Metadata, ResourceType } from "./types";

export function createMetadata(id: string, type: ResourceType, owner: string, name: string) : Metadata {
    return {id, type, owner, name}
}

export function metadataPath(resourceId: string | undefined) {
    return [METADATA, resourceId];
}

export function createMetadataTransform(userUid: string) {

    return (event: DocChangeEvent<Metadata>) => {
        const raw = event.data;
        const api = event.api;
        const libPath = libraryPath(userUid);
        const resourceId = raw.id;
        api.mutate((cache: Object) => {
            const [lib] = getEntity<ClientLibrary>(cache as Cache, libPath);
            if (lib) {
                const resources = lib.resources;
                for (let i=0; i<resources.length; i++) {
                    if (resources[i].id === resourceId) {
                        resources[i] = raw;
                        sortResources(resources);
                        break;
                    }
                }
            }
        })

        return raw;
    }
}

export function createRemoveMetadataCallback(userUid: string) {
    return (event: DocRemovedEvent<Metadata>) => {
        const api = event.api;
        const metadata = event.data;
        const resourceId = metadata.id;
        api.mutate((cache: Object) => {
            const [lib] = getEntity<ClientLibrary>(cache as Cache, libraryPath(userUid));
            if (lib) {
                const resources = lib.resources;
                for (let i=0; i<resources.length; i++) {
                    if (resources[i].id === resourceId) {
                        resources.splice(i, 1);
                        break;
                    }                    
                }
            }
        })
    }
}