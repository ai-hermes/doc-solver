declare global {
  namespace NodeJS {
    interface ProcessEnv {
      OPENAI_BASE: string;
      OPENAI_API_KEY: string;
      CHAT_MODEL_NAME: string;
      EMBEDDING_MODEL_NAME: string;
      EMBEDDING_BATCHSIZE: string;
      PINECONE_API_KEY: string;
      PINECONE_ENVIRONMENT: string;
      PINECONE_INDEX_NAME: string;
      DATABASE_URL: string;
      QCLOUD_SECRET_ID: string;
      QCLOUD_SECRET_KEY: string;
      QCLOUD_DURATION_SECONDS: string;
      QCLOUD_BUCKET: string;
      QCLOUD_REGION: string;
      NEXT_PUBLIC_QCLOUD_BUCKET: string;
      NEXT_PUBLIC_QCLOUD_REGION: string;
    }
  }
}

export {}
