import { sleepNSeconds } from "@/lib/utils";
import { BaseQueue } from "./base";

interface IngestQueueData {
    pdfUrl: string;
    pdfMd5Key: string;
}

export class IngestQueue extends BaseQueue<IngestQueueData> {
    public getQueueName(): string {
        return "ingest";
    }
    public getConcurrency(): number {
        return 10;
    }

    public static getQueue() {
        return BaseQueue._getQueue('ingest')
    }

    public async handle(job: { id: string; data: IngestQueueData; }) {
        console.log(`Processing job ${job.id}`);
        // await sleep(20)
        await sleepNSeconds(20);
        console.log('return data')
        console.log('job data', job.data)
        // save pdf to local tmp path
        // split、embedding and save the result to weaviate
        return
    }
}