import type { NextApiRequest, NextApiResponse } from 'next';
import STS from 'qcloud-cos-sts';
import {
    SECRET_ID, SECRET_KEY,
    DURATION_SECONDS, POLICY, ENDPOINT
} from '@/config/qcloud';
import { checkLogin } from './user';

async function generateSTSToken() {
    /*
    {
        "expiredTime": 1704427250,
        "expiration": "2024-01-05T04:00:50Z",
        "credentials": {
            "sessionToken": ",
            "tmpSecretId": "",
            "tmpSecretKey": ""
        },
        "requestId": "fa408081-fe63-441b-a5ce-d1d2cf940ae4",
        "startTime": 1704425450
    }
    */
    const resp = await STS.getCredential({
        secretId: SECRET_ID,
        secretKey: SECRET_KEY,
        durationSeconds: DURATION_SECONDS,
        endpoint: ENDPOINT,
        policy: POLICY,
    })
    return resp
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const [_, isLogin] = await checkLogin(req, res)
    if (!isLogin) {
        res.status(401).end()
        return
    }
    try {
        switch (req.method) {
            case 'GET': {
                const stsResp = await generateSTSToken()
                res.status(200).json({
                    code: 200,
                    data: stsResp
                })
            }
            default:
                res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (e) {
        if (e instanceof Error) {
            res.status(200)
                .json({
                    code: 500,
                    message: e.message
                })
        }
    }
}