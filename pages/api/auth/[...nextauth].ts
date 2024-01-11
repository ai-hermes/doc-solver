import NextAuth, { SessionOptions } from "next-auth"
import GithubProvider from "next-auth/providers/github"
import { getPrismaClient } from '@/lib/clients/prisma'
import { PrismaAdapter } from "@auth/prisma-adapter"

import { env } from "@/env.mjs"
import { randomBytes, randomUUID } from "crypto"
import { Adapter } from "next-auth/adapters"

const prisma = getPrismaClient()
export const authOptions = {
    debug: process.env.NODE_ENV !== "production",
    adapter: PrismaAdapter(prisma) as Adapter,
    // Configure one or more authentication providers
    providers: [
        GithubProvider({
            clientId: env.GITHUB_ID,
            clientSecret: env.GITHUB_SECRET,
        }),
        // ...add more providers here
    ],
    session: {
        strategy: "database",
        maxAge: 30 * 24 * 60 * 60,
        updateAge: 24 * 60 * 60,
        generateSessionToken: () => {
            return randomUUID?.() ?? randomBytes(32).toString("hex")
        }
    } as Partial<SessionOptions>
}

export default NextAuth(authOptions)