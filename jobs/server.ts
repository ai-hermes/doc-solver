import { IngestQueue } from './queues/ingest';
import { TestQueue } from './queues/test';

async function main() {
    const testQueue = new TestQueue();
    await testQueue.ready()


    const ingestQueue = new IngestQueue();
    await ingestQueue.ready()
    console.log('job server is started')
}

main()
// .catch(console.error)
// .finally(() => {
//     process.exit(0)
// })