import NextAuth, { SessionOptions, Session } from "next-auth"
import { JWT } from "next-auth/jwt"
import { AdapterUser } from "next-auth/adapters"
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
            // sometimes github provider is so slow and may occur timeout error
            // increase timeout to avoid this error
            // https://github.com/nextauthjs/next-auth/issues/3920
            httpOptions: {
                timeout: 10000,
            }
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
    } as Partial<SessionOptions>,
    callbacks: {
        session: async ({ session, token, user }: {
            session: Session,
            token: JWT,
            user: AdapterUser
        }) => {
            if (session?.user) {
                session.user.id = user.id;
            }
            return session;
        }
    }
}

export default NextAuth(authOptions)