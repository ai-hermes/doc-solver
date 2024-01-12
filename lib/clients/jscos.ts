import JSCOS from 'cos-js-sdk-v5';
import { CredentialData } from 'typings'

let clientCos: JSCOS;

export function getClientCOSClient() {
    if (clientCos) return clientCos;
    clientCos = new JSCOS({
        getAuthorization: function (_, callback) {
            fetch('/api/sts')
                .then((res) => res.json())
                .then((data: CredentialData) => {
                    const credentials = data.credentials
                    // [todo][dingwenjiang] error handle
                    callback({
                        TmpSecretId: credentials.tmpSecretId,
                        TmpSecretKey: credentials.tmpSecretKey,
                        SecurityToken: credentials.sessionToken,
                        // 建议返回服务器时间作为签名的开始时间，避免用户浏览器本地时间偏差过大导致签名错误
                        StartTime: data.startTime, // 时间戳，单位秒，如：1580000000
                        ExpiredTime: data.expiredTime, // 时间戳，单位秒，如：1580000000
                    });
                })
        }
    })
    return clientCos
}
