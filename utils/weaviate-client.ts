import { Nullable } from '@/typings';
import weaviate, { WeaviateClient } from 'weaviate-ts-client';
let weaviateClient: Nullable<WeaviateClient> = null;

export function getWeaviateClient() {
    if (weaviateClient) return weaviateClient
    // console.log(process.env.WEAVIATE_SCHEMA, process.env.WEAVIATE_HOST)
    weaviateClient = weaviate.client({
        scheme: process.env.WEAVIATE_SCHEMA,
        host: process.env.WEAVIATE_HOST || '',
    });
    return weaviateClient
}