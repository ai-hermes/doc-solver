import type { NextApiRequest, NextApiResponse } from 'next';
export default async function handler(
    _: NextApiRequest,
    resp: NextApiResponse,
) {
    resp.status(200).send('pang');
}
