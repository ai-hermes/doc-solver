import { createClient } from 'redis';



async function main() {
    const client = createClient({
        url: 'redis://:docsolver123456@localhost:6379/0',
    });
    await client.connect();
    /*
    await client.set("foo", "bar")
    const z = await client.get("foo")
    console.log('z', z)
    */
    const data = await client.hGet('bq:test:jobs', "8");
    const newData: Record<string, string> = JSON.parse(data || '{}')
    newData['result'] = '789'
    await client.hSet('bq:test:jobs', "8", JSON.stringify(newData));
    console.log(newData)
}

main()
    .catch(console.error)
    .finally(() => {
        process.exit(0)
    })