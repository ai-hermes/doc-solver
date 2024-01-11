import weaviate, { WeaviateClient } from 'weaviate-ts-client';
import { env } from 'env.mjs';

let weaviateClient: WeaviateClient;
export function getWeaviateClient() {
    if (weaviateClient) return weaviateClient
    weaviateClient = weaviate.client({
        scheme: env.WEAVIATE_SCHEMA,
        host: env.WEAVIATE_HOST,
    });
    return weaviateClient
}