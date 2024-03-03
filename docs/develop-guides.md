# Prerequirements
1. Docker(especially with `compose` subcommand): we use docker compose to start all the infrastructure needed for this project, it will be suitable for local development or on-premise deployment. 
2. Node.js: we use node.js to run the frontend and backend code, and also to run the scripts to ingest data into a vector store like Pinecone or weaviate.

# Development
1. start all the infrastructure needed for this project: `docker-compose up -d`. After the execution, you can check the status of the containers by `docker-compose ps`, it will look like this:
![docker-compose-example.png](./images/docker-compose-example.png)

2. install dependencies for doc-solver: `npm install`.(BTW, we'll use devcontainer to develop the code, so you can also use VSCode to develop the code, and the devcontainer will install the dependencies for you.)

3. create a `.env` file in the root directory of project, the fastest way to do this is to copy the `.env.example` file and rename it to `.env`, and then fill in the values of the variables in the `.env` file. The `.env` file will look like this:
    ```
    # env for llm
    OPENAI_BASE='**'
    OPENAI_API_KEY='**'
    CHAT_MODEL_NAME='**'
    EMBEDDING_MODEL_NAME='**'
    EMBEDDING_BATCHSIZE=1

    # env for vector store(including pinecone and weaviate)
    WEAVIATE_SCHEMA='**'
    WEAVIATE_HOST='**'


    # env for database
    DATABASE_URL="mysql://{username}:{password}@127.0.0.1:3306/doc_solver"

    # env for redis
    REDIS_HOST='**'
    REDIS_PORT='**'
    REDIS_DB='0'
    REDIS_USERNAME=''
    REDIS_PASSWORD='**'

    # env for third party auth
    GITHUB_ID='**'
    GITHUB_SECRET='**'

    NEXTAUTH_URL='http://localhost:3000'
    NEXTAUTH_SECRET='******'

    # env for QCLOUD(only support s3 provide by tencent)
    QCLOUD_SECRET_ID='**'
    QCLOUD_SECRET_KEY='**'
    QCLOUD_DURATION_SECONDS=1800
    QCLOUD_BUCKET='**'
    QCLOUD_REGION='**'

    NEXT_PUBLIC_QCLOUD_BUCKET='**'
    NEXT_PUBLIC_QCLOUD_REGION='**'
    ```
    - llm: we use openai as our llm backend, we will support more llm provide with the help of some llm proxy tools like [litellm](https://github.com/BerriAI/litellm)
    - vector store: currently we only tested on self-hosted weaviate, we will support more vector store in the future, including self-hosted or saas vector store.
    - database: we use mysql to store the data of doc-solver, may be we will take other databases like postgresql into consideration in the future, but not for now
    - redis: we use redis to store for job scheduling.
    - third party auth: we use github as our third party auth provider, we will support more third party auth provider in the future. 
    - qcloud: we use qcloud as our s3 provider, adapting multi kinds of s3 provider will not be a hard work with help of sdk provided by amazon.

3. start doc-solver project: `npm run dev`. After the execution, you can visit doc-solver on your favourite browser by `http://localhost:3000`, it will look like this:

but you cannot search anything now, because we haven't ingested any data into the vector store yet.
4. ingest data into vector store: `npm run ingest`. After the execution, you can visit doc-solver on your favourite browser by `http://localhost:3000`, and search something, it will look like this:


# System Design
1. Job Schedule
we use beequeue which use redis as backend as our job schedule, it will look like this:
![job-schedule](images/job-schedule.png)

we alreay register ingest task, and we will support more tasks in the future.

2. RAG
when user input a question, the rag system will take following steps to answer user, it will look like this:
![rag](images/arch-rag.png)
