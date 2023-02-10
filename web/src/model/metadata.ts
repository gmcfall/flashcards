import { getEntity } from "../fbase/functions";
import LeaseeApi from "../fbase/LeaseeApi";
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

    return (api: LeaseeApi, raw: Metadata, path: string[]) => {
        const libPath = libraryPath(userUid);
        const resourceId = raw.id;
        api.mutate((cache: Object) => {
            const [, lib] = getEntity<ClientLibrary>(cache, libPath);
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
    return (api: LeaseeApi, metadata: Metadata, path: string[]) => {
        const resourceId = metadata.id;
        api.mutate((cache: Object) => {
            const [, lib] = getEntity<ClientLibrary>(cache, libraryPath(userUid));
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