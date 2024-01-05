/*
import celery from 'celery-node';

const client = celery.createClient(
    "redis://:docsolver123456@127.0.0.1:6379/0",
    "redis://:docsolver123456@127.0.0.1:6379/0",
);

const task = client.createTask("tasks.add");
const result = task.applyAsync([1, 2]);
result.get().then(data => {
  console.log(data);
  client.disconnect();
});
*/