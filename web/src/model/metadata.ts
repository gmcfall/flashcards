import { Metadata, ResourceType } from "./types";

export function createMetadata(type: ResourceType, name: string) : Metadata {
    return {type, name}
}