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
// import Queue from 'bee-queue';
// const queue = new Queue('test', {
//   redis: {
//     host: '127.0.0.1',
//     port: 6379,
//     db: 0,
//     password: 'docsolver123456',
//     options: {},
//   },
// });

// async function main() {
//   const job = await queue.createJob({ x: 1, y: 2 }).save();
//   job.on('succeeded', (result) => {
//     console.log(`Job ${job.id} succeeded with result: ${result}`);
//   });
//   console.log('job', job);
// };


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
export async function createJob() {
  const job = await queue.createJob({ x: 1, y: 2 }).save();
  console.log('job id', job.id)
}

async function getJob(id: number) {
  const job = await queue.getJob(`${id}`)
  // 'created' | 'succeeded' | 'failed' | 'retrying';
  console.log(job.status)
  console.log(job.data)
  // job.data.result = 'xxx'
  // job.on('succeeded', (result) => {
  //   console.log(`Job ${job.id} succeeded with result: ${result}`);
  // })
  await job.save()
  // console.log(job)
}

async function main() {
  // await createJob()
  await getJob(8)
}

main()
  .catch(e => {
    console.log('error occured', e)
  })
  .finally(() => {
    process.exit();
  }) 
