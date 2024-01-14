/*
const queue = new Queue('test', {
  prefix: 'bq',
  stallInterval: 5000,
  nearTermWindow: 1200000,
  delayedDebounce: 1000,
  redis: {
    host: '127.0.0.1',
    port: 6379,
    db: 0,
    options: {},
  },
  isWorker: true,
  getEvents: true,
  sendEvents: true,
  storeJobs: true,
  ensureScripts: true,
  activateDelayedJobs: false,
  removeOnSuccess: false,
  removeOnFailure: false,
  redisScanCount: 100,
  autoConnect: true,
});
*/


import Queue from 'bee-queue';


export const queue = new Queue('test', {
  redis: {
    host: '127.0.0.1',
    port: 6379,
    db: 0,
    password: 'docsolver123456',
    options: {},
  },
})

function sleep(n: number) {
  return new Promise((resolve) => {
      setTimeout(() => {
          resolve(null)
      }, n * 1000)
  })
}

queue.process(async (job: {
  id: string;
  data: { x: number; y: number; };
}) => {
  console.log(`Processing job ${job.id}`);
  await sleep(100)
  console.log('return data')

  return job.data.x + job.data.y;
});

queue.on('ready', () => {
  console.log('queue now ready to start doing things');
});
queue.on('succeeded', (job, result) => {
  console.log(`Job ${job.id} succeeded with result: ${result}`);
});