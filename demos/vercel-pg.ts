import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

async function main() {
    const vercelChunks = await prisma.chunks.findMany();
    console.log(vercelChunks)
}


main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {      
        console.log(e);
        await prisma.$disconnect();
        process.exit(1);
    });