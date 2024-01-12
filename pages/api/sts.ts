import type { NextApiRequest, NextApiResponse } from 'next';
import STS from 'qcloud-cos-sts';
import {
    SECRET_ID, SECRET_KEY, DURATION_SECONDS, POLICY, ENDPOINT
} from '@/config/qcloud';

export default async function handler(
    _: NextApiRequest,
    res: NextApiResponse<STS.CredentialData>,
) {

    const resp = await STS.getCredential({
        secretId: SECRET_ID,
        secretKey: SECRET_KEY,
        durationSeconds: DURATION_SECONDS,
        endpoint: ENDPOINT,
        policy: POLICY,
    })
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
    res.status(200).json(resp)
}