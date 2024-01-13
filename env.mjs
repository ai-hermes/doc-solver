import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

const isGitHubCI = process.env.GITHUB_ACTIONS === 'true';
const runtimeEnv =
    isGitHubCI ?
        {
            // openai
            OPENAI_BASE: 'https://www.example.com',
            OPENAI_API_KEY: '*',
            CHAT_MODEL_NAME: '*',
            EMBEDDING_MODEL_NAME: '*',
            EMBEDDING_BATCHSIZE: 0,
            // pinecone[removed in the future]
            PINECONE_API_KEY: '*',
            PINECONE_ENVIRONMENT: '*',
            PINECONE_INDEX_NAME: '*',
            //  weaviate
            WEAVIATE_HOST: '*',
            WEAVIATE_SCHEMA: '*',
            // mysql
            DATABASE_URL: '*',

            // redis
            REDIS_HOST: '*',
            REDIS_DB: 0,
            REDIS_PORT: 0,
            REDIS_USERNAME: '*',
            REDIS_PASSWORD: '*',
            // qcloud
            QCLOUD_SECRET_ID: '*',
            QCLOUD_SECRET_KEY: '*',
            QCLOUD_DURATION_SECONDS: 0,
            QCLOUD_BUCKET: '*',
            QCLOUD_REGION: '*',
            NEXT_PUBLIC_QCLOUD_BUCKET: '*',
            NEXT_PUBLIC_QCLOUD_REGION: '*',

            // auth
            GITHUB_ID: '*',
            GITHUB_SECRET: '*'
        } :
        {
            // openai
            OPENAI_BASE: process.env.OPENAI_BASE,
            OPENAI_API_KEY: process.env.OPENAI_API_KEY,
            CHAT_MODEL_NAME: process.env.CHAT_MODEL_NAME,
            EMBEDDING_MODEL_NAME: process.env.EMBEDDING_MODEL_NAME,
            EMBEDDING_BATCHSIZE: process.env.EMBEDDING_BATCHSIZE,
            // pinecone[removed in the future]
            PINECONE_API_KEY: process.env.PINECONE_API_KEY,
            PINECONE_ENVIRONMENT: process.env.PINECONE_ENVIRONMENT,
            PINECONE_INDEX_NAME: process.env.PINECONE_INDEX_NAME,
            //  weaviate
            WEAVIATE_HOST: process.env.WEAVIATE_HOST,
            WEAVIATE_SCHEMA: process.env.WEAVIATE_SCHEMA,
            // mysql
            DATABASE_URL: process.env.DATABASE_URL,

            // redis
            REDIS_HOST: process.env.REDIS_HOST,
            REDIS_DB: process.env.REDIS_DB,
            REDIS_PORT: process.env.REDIS_PORT,
            REDIS_USERNAME: process.env.REDIS_USERNAME,
            REDIS_PASSWORD: process.env.REDIS_PASSWORD,
            // qcloud
            QCLOUD_SECRET_ID: process.env.QCLOUD_SECRET_ID,
            QCLOUD_SECRET_KEY: process.env.QCLOUD_SECRET_KEY,
            QCLOUD_DURATION_SECONDS: process.env.QCLOUD_DURATION_SECONDS,
            QCLOUD_BUCKET: process.env.QCLOUD_BUCKET,
            QCLOUD_REGION: process.env.QCLOUD_REGION,
            NEXT_PUBLIC_QCLOUD_BUCKET: process.env.NEXT_PUBLIC_QCLOUD_BUCKET,
            NEXT_PUBLIC_QCLOUD_REGION: process.env.NEXT_PUBLIC_QCLOUD_REGION,

            // auth
            GITHUB_ID: process.env.GITHUB_ID,
            GITHUB_SECRET: process.env.GITHUB_SECRET,
        }
export const env = createEnv({
    server: {
        // This is optional because it's only used in development.
        // See https://next-auth.js.org/deployment.
        // NEXTAUTH_URL: z.string().url().optional(),
        // NEXTAUTH_SECRET: z.string().min(1),

        // openai endpoint
        OPENAI_BASE: z.string().url().min(1),
        OPENAI_API_KEY: z.string().min(1),
        CHAT_MODEL_NAME: z.string().min(1),
        EMBEDDING_MODEL_NAME: z.string().min(1),
        EMBEDDING_BATCHSIZE: z.coerce.number(),
        // vector store 
        // pinecone[removed in the future]
        PINECONE_API_KEY: z.string().min(1),
        PINECONE_ENVIRONMENT: z.string().min(1),
        PINECONE_INDEX_NAME: z.string().min(1),
        //  weaviate
        WEAVIATE_HOST: z.string().min(1),
        WEAVIATE_SCHEMA: z.string().min(1),

        // mysql
        DATABASE_URL: z.string().min(1),

        // redis
        REDIS_HOST: z.string().min(1),
        REDIS_PORT: z.coerce.number(),
        REDIS_DB: z.coerce.number(),
        REDIS_USERNAME: z.string().optional(),
        REDIS_PASSWORD: z.string().min(1),

        // qcloud
        QCLOUD_SECRET_ID: z.string().min(1),
        QCLOUD_SECRET_KEY: z.string().min(1),
        QCLOUD_DURATION_SECONDS: z.coerce.number(),
        QCLOUD_BUCKET: z.string().min(1),
        QCLOUD_REGION: z.string().min(1),

        // auth
        GITHUB_ID: z.string().min(1),
        GITHUB_SECRET: z.string().min(1),

        // GOOGLE_CLIENT_ID: z.string().min(1),
        // GOOGLE_CLIENT_SECRET: z.string().min(1),
        // GITHUB_OAUTH_TOKEN: z.string().min(1),
        // DATABASE_URL: z.string().min(1),
        // RESEND_API_KEY: z.string().min(1),
        // STRIPE_API_KEY: z.string().min(1),
        // STRIPE_WEBHOOK_SECRET: z.string().min(1),
    },
    client: {
        NEXT_PUBLIC_QCLOUD_BUCKET: z.string().min(1),
        NEXT_PUBLIC_QCLOUD_REGION: z.string().min(1),
        // NEXT_PUBLIC_SUPABASE_URL: z.string().min(1),
        // NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
        // NEXT_PUBLIC_APP_URL: z.string().min(1),
        // NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PLAN_ID: z.string().min(1),
        // NEXT_PUBLIC_STRIPE_PRO_YEARLY_PLAN_ID: z.string().min(1),
        // NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PLAN_ID: z.string().min(1),
        // NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PLAN_ID: z.string().min(1),
    },
    runtimeEnv: {
        // NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        // NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
        // GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
        // GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
        // GITHUB_OAUTH_TOKEN: process.env.GITHUB_OAUTH_TOKEN,
        // DATABASE_URL: process.env.DATABASE_URL,
        // RESEND_API_KEY: process.env.RESEND_API_KEY,
        // NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
        // Stripe
        // STRIPE_API_KEY: process.env.STRIPE_API_KEY,
        // STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
        // NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PLAN_ID: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PLAN_ID,
        // NEXT_PUBLIC_STRIPE_PRO_YEARLY_PLAN_ID: process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PLAN_ID,
        // NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PLAN_ID: process.env.NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PLAN_ID,
        // NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PLAN_ID: process.env.NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PLAN_ID,
        ...runtimeEnv,
    },
})
