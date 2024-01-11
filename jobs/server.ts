import { TestQueue } from './queues/test';

async function main() {
    const testQueue = new TestQueue();
    await testQueue.ready()
    console.log('job server is started')
}

main()
// .catch(console.error)
// .finally(() => {
//     process.exit(0)
// })