import { sleepNSeconds } from "@/lib/utils";
import { BaseQueue } from "./base";
import { getPrismaClient } from "@/lib/clients/prisma";

interface TestQueueData {
    pdfUrl: string;
    pdfMd5Key: string;
}

export class TestQueue extends BaseQueue<TestQueueData> {
    public getQueueName(): string {
        return "test";
    }
    public getConcurrency(): number {
        return 10;
    }

    public static getQueue() {
        return BaseQueue._getQueue('test')
    }

    public async handle(job: { id: string; data: TestQueueData; }) {
        const prisma = getPrismaClient();
        let task_status = 'finished'
        try {
            console.log(`Processing job ${job.id}`);
            // await sleep(20)
            await sleepNSeconds(20);
            console.log('return data')
            console.log('job data', job.data)
            // save pdf to local tmp path
            // split、embedding and save the result to weaviate
        } catch (e) {
            task_status = 'fail'
        }
        await prisma.task.update({
            where: {
                bq_id: job.id
            },
            data: {
                task_status: task_status
            }
        })
    }
}