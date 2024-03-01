import { env } from 'env.mjs';
export function getObjectUrl(objectName: string) {
    // https://doc-solver-dev-1251009550.cos.ap-shanghai.myqcloud.com/pdf/d6db6fd34c5ea56fa1dc8f55df17830e
    return `https://${env.NEXT_PUBLIC_QCLOUD_BUCKET}.cos.${env.NEXT_PUBLIC_QCLOUD_REGION}.myqcloud.com/${objectName}`;
}