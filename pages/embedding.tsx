import React from 'react';
import { usePollingEffect } from '@/hooks/use-polling-effect';
import COS from 'cos-js-sdk-v5';
import type { CredentialData } from 'qcloud-cos-sts';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Nullable } from '@/typings';
import { calculateMD5Async, readFileAsync } from '@/lib/fsUtils';
const cos = new COS({
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
// cos.putBucket()
export default function Embedding() {
    const [selectedFile, setSelectedFile] = useState<Nullable<File>>();

    const [uploadInfo, setUploadInfo] = useState<{
        url: string;
        key: string;
        jobId: string;
        jobStatus: string;
    }>({
        url: 'doc-solver-dev-1251009550.cos.ap-shanghai.myqcloud.com/pdf/d6db6fd34c5ea56fa1dc8f55df17830e',
        key: 'pdf/d6db6fd34c5ea56fa1dc8f55df17830e',
        jobId: '',
        jobStatus: '',
    });

    usePollingEffect(
        async () => {
            if (!uploadInfo.key || !uploadInfo.url || !uploadInfo.jobId || uploadInfo.jobStatus === 'succeeded') {
                return
            }
            fetch(`/api/job?jobId=${uploadInfo.jobId}`).then(res => res.json())
                .then(data => {
                    console.log('polling data', data)
                    setUploadInfo({
                        ...uploadInfo,
                        jobStatus: data.status,
                    })
                })
        },
        [uploadInfo],
        {
            interval: 2000,
        }
    )
    return (
        <div className="container mx-auto mt-8">
            <div className='flex flex-col'>
                <Card className='mb-10'>
                    <CardHeader>
                        <CardTitle>Upload pdf file</CardTitle>
                        <CardDescription>upload file for embedding</CardDescription>
                    </CardHeader>
                    <CardContent
                        className='flex flex-row'
                    >
                        <Input
                            id="picture"
                            type="file"
                            className='w-[200px] mr-8'
                            onChange={(e) => {
                                if (e.target?.files && e.target.files.length > 0) {
                                    setSelectedFile(e.target.files[0])
                                }
                            }}
                        />
                        <Button
                            onClick={async () => {
                                console.log('selectedFile', selectedFile)
                                if (!selectedFile) return
                                const buffer = await readFileAsync(selectedFile)
                                if (!buffer) return
                                console.log(process.env.NEXT_PUBLIC_QCLOUD_BUCKET)
                                console.log()
                                console.log(selectedFile.name)

                                const md5 = await calculateMD5Async(buffer)
                                console.log('md5', md5)

                                const uploadFileResp = await cos.uploadFile({
                                    Bucket: process.env.NEXT_PUBLIC_QCLOUD_BUCKET,
                                    Region: process.env.NEXT_PUBLIC_QCLOUD_REGION,
                                    Key: `pdf/${md5}`,
                                    Body: selectedFile,
                                    SliceSize: 1024 * 1024 * 2,
                                    onTaskReady: function (taskId) {
                                        console.log(taskId);
                                    },
                                    onProgress: function (progressData) {
                                        console.log(JSON.stringify(progressData));
                                    },
                                    onFileFinish: function (err, data, options) {
                                        console.log(options.Key + '上传' + (err ? '失败' : '完成'));
                                    },
                                })
                                // uploadFileResp.statusCode === 200 上传成功
                                // uploadFileResp.Location 访问的url
                                // key在前端自动生成
                                console.log('uploadFileResp', uploadFileResp)
                                setSelectedFile(null)
                                // cos.putObject({})
                                // const z = await cos.getBucket({
                                //     Bucket: 'doc-solver-dev-1251009550', /* 填入您自己的存储桶，必须字段 */
                                //     Region: 'ap-shanghai',  /* 存储桶所在地域，例如ap-beijing，必须字段 */
                                //     Prefix: '_next/static',           /* Prefix表示列出的object的key以prefix开始，非必须 */
                                // })
                                /*
                                function(err, data) {
                                    console.log(err || data.Contents);
                                })
                                */
                                // console.log(JSON.stringify(z))
                            }}
                        >
                            generate sts token
                        </Button>
                    </CardContent>
                </Card>
                <Card className='mb-10'>
                    <CardHeader>
                        <CardTitle>Embedding</CardTitle>
                        <CardDescription>split chunks and embed the upload file</CardDescription>
                    </CardHeader>
                    <CardContent
                        className='flex flex-row'
                    >
                        <Button
                            onClick={() => {
                                fetch('/api/embedding', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({
                                        // jobId: uploadInfo.jobId
                                        pdfUrl: uploadInfo.url,
                                        pdfMd5Key: uploadInfo.key
                                    })
                                })
                                    .then(res => res.json())
                                    .then(data => {
                                        console.log('embedding data', data)
                                        // {jobId: '9', status: 'created'}
                                        setUploadInfo({
                                            ...uploadInfo,
                                            jobId: data.jobId,
                                        })
                                    })
                            }}
                        >
                            {
                                uploadInfo.jobStatus === '' ?
                                    '开始embedding' :
                                    uploadInfo.jobStatus === 'created' ? 'embedding中' :
                                        uploadInfo.jobStatus === 'succeeded' ? 'embedding成功' : '默认状态'
                            }
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}