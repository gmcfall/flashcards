import EntityClient from "./EntityClient";
import { EntityKey } from "./types";

export default class EntityApi {
    readonly leasee: string;
    private client: EntityClient;

    constructor(client: EntityClient, leasee: string) {
        this.leasee = leasee;
        this.client = client;
    }

    updateEntity(key: EntityKey, data: any) {

    }
}