import type { NextApiRequest, NextApiResponse } from 'next'
import { Session, getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]'

export async function checkLogin(req: NextApiRequest, res: NextApiResponse): Promise<[
    Session['user'] | null,
    boolean]
> {
    try {
        const session = await getServerSession(req, res, authOptions)
        if (!session || !session.user) {
            return [null, false]
        }
        return [session.user, true]
    } catch (e) {
        return [null, false]
    }
}