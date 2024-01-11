import { PrismaClient } from "@prisma/client";

let prismaClient: PrismaClient;
export function getPrismaClient(): PrismaClient {
    if (prismaClient) return prismaClient
    // from env DB_URL
    // ref prisma/schema.prisma
    prismaClient = new PrismaClient();
    return prismaClient
}