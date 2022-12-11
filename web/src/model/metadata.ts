import { Metadata, ResourceType } from "./types";

export function createMetadata(type: ResourceType, owner: string, name: string) : Metadata {
    return {type, owner, name}
}