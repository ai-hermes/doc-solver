import { Redis } from 'ioredis'
import { env } from 'env.mjs'

let redisClient: Redis;
export function getRedisClient(): Redis {
    if (redisClient) return redisClient
    redisClient = new Redis({
        port: env.REDIS_PORT, // Redis port
        host: env.REDIS_HOST, // Redis host
        username: env.REDIS_USERNAME, // needs Redis >= 6
        password: env.REDIS_PASSWORD,
        db: env.REDIS_DB, // Defaults to 0
    });
    return redisClient
}
export function getRedisUrl() {
    // 'redis://name:password@127.0.0.1:6379/0'
    return `redis://${env.REDIS_USERNAME}:${env.REDIS_PASSWORD}@${env.REDIS_HOST}:${env.REDIS_PORT}/${env.REDIS_DB}`
}