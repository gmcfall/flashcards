import EntityClient from "./EntityClient";

export default interface EntityApi {
    mutate<T>(recipe: (state: T) => void): void;
    getClient() : EntityClient;
}