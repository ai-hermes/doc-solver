import { env } from 'env.mjs';

const SECRET_ID = env.QCLOUD_SECRET_ID;
const SECRET_KEY = env.QCLOUD_SECRET_KEY;
const BUCKET = env.QCLOUD_BUCKET;
const REGION = env.QCLOUD_REGION;
const ALLOW_PREFIX = "/pdf"
const ENDPOINT = 'sts.tencentcloudapi.com'
const DURATION_SECONDS = env.QCLOUD_DURATION_SECONDS;
const SHORT_BUCKETNAME = BUCKET.substring(0, BUCKET.lastIndexOf('-'));
const APP_ID = BUCKET.substring(1 + BUCKET.lastIndexOf('-'));

const ALLOW_ACTIONS = [
    // 简单上传
    'name/cos:PutObject',
    'name/cos:PostObject',
    // 分片上传
    'name/cos:InitiateMultipartUpload',
    'name/cos:ListMultipartUploads',
    'name/cos:ListParts',
    'name/cos:UploadPart',
    'name/cos:CompleteMultipartUpload'
]

const POLICY = {
    'version': '2.0',
    'statement': [{
        // 'action': ALLOW_ACTIONS,
        'action': [
            '*'
        ],
        'effect': 'allow',
        'principal': { 'qcs': ['*'] },
        'resource': [
            "*"
            //'qcs::cos:' + REGION + ':uid/' + APP_ID + ':prefix//' + APP_ID + '/' + SHORT_BUCKETNAME + '/' + ALLOW_PREFIX,
        ],
    }],
};
export {
    SECRET_ID,
    SECRET_KEY,
    DURATION_SECONDS,
    BUCKET,
    ALLOW_ACTIONS,
    SHORT_BUCKETNAME,
    APP_ID,
    REGION,
    ALLOW_PREFIX, POLICY, ENDPOINT
}
