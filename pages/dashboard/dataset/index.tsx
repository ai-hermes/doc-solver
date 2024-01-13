import React, { ReactElement, useState } from "react"
import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardShell } from "@/components/dashboard/shell"
import Layout from "@/components/dashboard/layout"
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@/components/ui/card';
import { calculateMD5Async, readFileAsync } from "@/lib/fsUtils";
import { getClientCOSClient } from '@/lib/clients/jscos';
import { env } from 'env.mjs';
import { columns } from "@/components/dashboard/dataset/columns";
import { DataTable } from "@/components/dashboard/dataset/data-table";

const cos = getClientCOSClient();
export const metadata = {
    title: "Dataset",
    description: "Manage your dataset, including origin files and vector etc.",
}

function DatasetPage() {
    const [selectedFile, setSelectedFile] = useState<File>();
    return (
        <DashboardShell>
            <DashboardHeader
                heading="Dataset"
                text="Upload your pdf, split it into chunks and convert chunks in another dimention for searching."
            />
            <div className="p-[20px]">
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
                                console.log(env.NEXT_PUBLIC_QCLOUD_BUCKET)
                                console.log()
                                console.log(selectedFile.name)

                                const md5 = await calculateMD5Async(buffer)
                                console.log('md5', md5)

                                const uploadFileResp = await cos.uploadFile({
                                    Bucket: env.NEXT_PUBLIC_QCLOUD_BUCKET,
                                    Region: env.NEXT_PUBLIC_QCLOUD_REGION,
                                    Key: `pdf/${md5}`,
                                    Body: selectedFile,
                                    SliceSize: 1024 * 1024 * 2,
                                    onTaskReady: function (taskId) {
                                        console.log(taskId);
                                    },
                                    onProgress: function (progressData) {
                                        console.log(JSON.stringify(progressData));
                                    },
                                    onFileFinish: function (err, _, options) {
                                        console.log(options.Key + '上传' + (err ? '失败' : '完成'));
                                    },
                                })
                                // uploadFileResp.statusCode === 200 上传成功
                                // uploadFileResp.Location 访问的url
                                // key在前端自动生成
                                console.log('uploadFileResp', uploadFileResp)
                                setSelectedFile(undefined)
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
                <DataTable data={[]} columns={columns} />
            </div>
        </DashboardShell>
    )
}

DatasetPage.getLayout = function getLayout(page: ReactElement) {
    return (
        <Layout>
            {page}
        </Layout>
    )
}
export default DatasetPage;