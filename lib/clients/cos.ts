import COS from 'cos-nodejs-sdk-v5';
import { env } from 'env.mjs';

let cos: COS;
export function getCOSClient() {
    if (cos) return cos;
    cos = new COS({
        SecretId: env.QCLOUD_SECRET_ID,
        SecretKey: env.QCLOUD_SECRET_KEY,
    })
    return cos
}
