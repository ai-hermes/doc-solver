/*
import celery from 'celery-node';

const worker = celery.createWorker(
    "redis://:docsolver123456@127.0.0.1:6379/0",
    "redis://:docsolver123456@127.0.0.1:6379/0",
);

function sleep(n: number) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(null)
        }, n)
    })
}
// !!!!not support async function
worker.register("tasks.add", (a: number, b: number) => {
    console.log('a', a, 'b', b)
    // await sleep(30)
    return a + b
});

worker.start();
*/

export {}