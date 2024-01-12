import { Pinecone } from '@pinecone-database/pinecone';
import { env } from 'env.mjs'

async function initPinecone() {
    try {
        const pinecone = new Pinecone({
            environment: env.PINECONE_ENVIRONMENT, //this is in the dashboard
            apiKey: env.PINECONE_API_KEY ?? '',
        });

        return pinecone;
    } catch (error) {
        console.log('error', error);
        throw new Error('Failed to initialize Pinecone Client');
    }
}

export const pinecone = await initPinecone();
