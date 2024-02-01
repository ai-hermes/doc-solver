import Queue from 'bee-queue';
import { env } from 'env.mjs';

const queueMap: Record<string, Queue> = {};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export abstract class BaseQueue<T extends Record<string, any>> {
    protected queueName: string = 'default';
    protected concurrency: number = 1;
    private queue: Queue;
    constructor() {
        this.queueName = this.getQueueName();
        this.concurrency = this.getConcurrency();
        this.queue = new Queue(this.queueName, {
            redis: {
                host: env.REDIS_HOST,
                port: env.REDIS_PORT,
                db: env.REDIS_DB,
                password: env.REDIS_PASSWORD,
                options: {},
            },
            isWorker: true,
        })
        const handle = this.handle.bind(this)
        this.queue.process(this.concurrency, async (job: {
            id: string;
            data: T;
        }) => {
            try {
                await handle(job)
            } catch (e) {
                console.error('error in queue', e)
            }
        });
    }

    public ready() {
        return new Promise((resolve) => {
            this.queue.on('ready', () => {
                queueMap[this.queueName] = this.queue;
                resolve(this.queue)
            });
        })
    }

    protected static _getQueue(queueName: string) {
        const queue = new Queue(queueName, {
            redis: {
                host: env.REDIS_HOST,
                port: env.REDIS_PORT,
                db: env.REDIS_DB,
                password: env.REDIS_PASSWORD,
                options: {},
            },
            isWorker: false,
        })
        return queue;
    }

    public abstract getQueueName(): string
    public abstract getConcurrency(): number
    public abstract handle(job: {
        id: string;
        data: T;
    }): void | Promise<void>
}
