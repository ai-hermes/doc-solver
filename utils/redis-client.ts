import { Redis } from 'ioredis'





let redisClient: Redis;
export function getRedisClient(): Redis {
    if (redisClient) return redisClient
    redisClient = new Redis({
        port: 6379, // Redis port
        host: "192.168.10.6", // Redis host
        username: "", // needs Redis >= 6
        password: "docsolver123456",
        db: 0, // Defaults to 0
    });
    return redisClient
}