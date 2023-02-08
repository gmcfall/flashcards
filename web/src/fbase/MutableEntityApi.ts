import EntityApi from "./EntityApi";
import EntityClient from "./EntityClient";
import { mutate } from "./functions";

const NOT_INITIALIZED = "EntityClient not initialized";

export default class MutableEntityApi implements EntityApi {
    
    private client?: EntityClient;

    constructor() {
        this.mutate = this.mutate.bind(this);
    }

    mutate<T>(recipe: (state: T) => void) {
        if (!this.client) {
            throw new Error(NOT_INITIALIZED)
        }
        mutate(this.client, recipe);
    }

    getClient() {
        if (!this.client) {
            throw new Error(NOT_INITIALIZED)
        }
        return this.client;
    }

    setClient(client: EntityClient) {
        this.client = client;
    }
}