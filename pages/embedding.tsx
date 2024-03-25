/* eslint-disable max-lines-per-function */
import React from 'react';
import { usePollingEffect } from '@/hooks/use-polling-effect';
import COS from 'cos-js-sdk-v5';
import type { CredentialData } from 'qcloud-cos-sts';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Nullable } from '@/typings';
import { calculateMD5Async, readFileAsync } from '@/lib/fsUtils';
import { getObjectUrl } from '@/lib/cos';
import { Stepper,StepperItem } from "@/components/ui/stepper";
import { useToast } from "@/components/ui/use-toast";
import ContentLayout from '@/components/content-layout';
import { Progress } from "@/components/ui/progress"

const steps = [
    { id: 1, label: "Step 1: Select pdf file (.pdf, .txt, or .doc suffixes only and limit 5M)" },
    { id: 2, label: "Step 2: Upload the file" },
    { id: 3, label: "Step 3: Embedding" },
    { id: 4, label: "Ending" },
  ]

const cos = new COS({
    getAuthorization: function (_, callback) {
        fetch('/api/sts')
            .then((res) => res.json())
            .then((data) => {
                const credentials = (data?.data as CredentialData)?.credentials;
                callback({
                    TmpSecretId: credentials.tmpSecretId,
                    TmpSecretKey: credentials.tmpSecretKey,
                    SecurityToken: credentials.sessionToken,
                    // 建议返回服务器时间作为签名的开始时间，避免用户浏览器本地时间偏差过大导致签名错误
                    StartTime: data?.data?.startTime, // 时间戳，单位秒，如：1580000000
                    ExpiredTime: data?.data?.expiredTime, // 时间戳，单位秒，如：1580000000
                });
            })
    }
})
// cos.putBucket()
export default function Embedding() {
    const { toast } = useToast();
    const [selectedFile, setSelectedFile] = useState<Nullable<File>>();

    const [uploadInfo, setUploadInfo] = useState<Partial<{
        url: string;
        key: string;
        jobId: string;
        jobStatus: 'created' | 'succeeded' | 'failure';
    }>>({
        // url: 'doc-solver-dev-1251009550.cos.ap-shanghai.myqcloud.com/pdf/d6db6fd34c5ea56fa1dc8f55df17830e',
        // key: 'pdf/d6db6fd34c5ea56fa1dc8f55df17830e',
        url: '',
        key: '',
        jobId: '',
    });

    const [progress, setProgress] = useState<number>();
    
    usePollingEffect(
        async () => {
            if (!uploadInfo?.key || !uploadInfo?.url || !uploadInfo?.jobId || uploadInfo?.jobStatus === 'succeeded') {
                return
            }
            fetch(`/api/job?jobId=${uploadInfo.jobId}`).then(res => res.json())
                .then(data => {
                    console.log('polling data', data)
                    setUploadInfo({
                        ...uploadInfo,
                        jobStatus: data?.data?.status,
                    })
                })
        },
        [uploadInfo],
        {
            interval: 2000,
        }
    )

    return (
        <ContentLayout>
            <div className="container mx-auto mt-8">
                <Stepper initialStep={0} steps={steps} orientation="vertical">
                    <StepperItem>
                        <div className="rounded-lg bg-slate-100 p-4 text-slate-900 dark:bg-slate-300">
                            <Input
                                id="picture"
                                type="file"
                                className='w-[300px] mr-8'
                                onChange={(e) => {
                                    const files = e.target?.files
                                    if (files && files[0]?.size >= 5000000) {
                                        toast({
                                            variant: "destructive",
                                            title: 'Please select a file that does not exceed 5MB'
                                        })
                                        return;
                                    } else if (files && files.length > 0) {
                                        setUploadInfo({})
                                        setProgress(0);
                                        setSelectedFile(files[0])
                                    }
                                }}
                                accept='.pdf,.doc,.txt'
                            />
                        </div>
                    </StepperItem>

                    <StepperItem>
                        <div className="text-left rounded-lg bg-slate-100 p-4 text-slate-900 dark:bg-slate-300">
                            {selectedFile && <Progress value={progress} className='mb-2 bg-white' />}
                            <Button
                                disabled={!selectedFile}
                                onClick={async () => {
                                    if (!selectedFile) return
                                    const buffer = await readFileAsync(selectedFile)
                                    if (!buffer) return
                                    const md5 = await calculateMD5Async(buffer)
                                    await cos.uploadFile({
                                        Bucket: process.env.NEXT_PUBLIC_QCLOUD_BUCKET,
                                        Region: process.env.NEXT_PUBLIC_QCLOUD_REGION,
                                        Key: `pdf/${md5}`,
                                        Body: selectedFile,
                                        SliceSize: 1024 * 1024 * 2,
                                        onTaskReady: function (taskId) {
                                            console.log('onTaskReady', taskId);
                                        },
                                        onProgress: function (progressData) {
                                            console.log('onProgress', JSON.stringify(progressData));
                                            setProgress(progressData?.percent * 100);
                                        },
                                        onFileFinish: function (err, data, options) {
                                            console.log(options.Key + '上传' + (err ? '失败' : '完成'), data);
                                            setUploadInfo({
                                                ...uploadInfo,
                                                url: getObjectUrl(`pdf/${md5}`),
                                                key: `pdf/${md5}`,
                                            })
                                            if (err) {
                                                toast({
                                                    variant: 'destructive',
                                                    description: err.message,
                                                })
                                            } else {
                                                toast({
                                                    description: 'success',
                                                })
                                            }
                                        },
                                    }, function(err) {
                                        if(err) {
                                            toast({
                                                variant: 'destructive',
                                                description: err.message,
                                            })
                                        }
                                    }
                                    )
                                }}
                            >
                                upload
                            </Button>
                        </div>
                    </StepperItem>

                    <StepperItem>
                        <div className="text-left rounded-lg bg-slate-100 p-4 text-slate-900 dark:bg-slate-300">
                            <Button
                                disabled={!selectedFile || !uploadInfo?.key}
                                onClick={() => {
                                    console.log('uploadInfo', uploadInfo)
                                    console.log('selectedFile', selectedFile)
                                    if (!selectedFile) return
                                    // return
                                    fetch('/api/job', {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json'
                                        },
                                        body: JSON.stringify({
                                            // jobId: uploadInfo.jobId
                                            source: selectedFile.name,
                                            pdfUrl: uploadInfo.url,
                                            pdfMd5Key: uploadInfo.key
                                        })
                                    })
                                        .then(res => res.json())
                                        .then(data => {
                                            console.log('embedding data', data)
                                            // {code, data: {jobId: '9'}, message: 'create job success'}
                                            setUploadInfo({
                                                ...uploadInfo,
                                                jobId: data?.data?.jobId,
                                            })
                                            if(data.code === 200) {
                                                toast({
                                                    description: data.message,
                                                })
                                            } else {
                                                toast({
                                                    variant: 'destructive',
                                                    description: data.message,
                                                })
                                            }
                                        })
                                }}
                            >
                                {
                                    !uploadInfo.jobStatus ?
                                        '开始embedding' :
                                        uploadInfo.jobStatus === 'created' ? 'embedding中' :
                                            uploadInfo.jobStatus === 'succeeded' ? 'embedding成功' : '默认状态'
                                }
                            </Button>
                        </div>
                    </StepperItem>

                    <StepperItem />
                    
                </Stepper>
            </div>
        </ContentLayout>
    )
}
