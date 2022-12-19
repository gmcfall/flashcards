import { Metadata, ResourceType } from "./types";

export function createMetadata(id: string, type: ResourceType, owner: string, name: string) : Metadata {
    return {id, type, owner, name}
}