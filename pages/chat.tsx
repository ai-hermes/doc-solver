import React, { useEffect } from 'react';
import { InferGetServerSidePropsType } from 'next';
import { useDocumentList } from '@/hooks/use-document';
import { useRouter } from "next/router"

export default function Home({
    messages: _messages,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
    const { documents } = useDocumentList()
    const router = useRouter()

    useEffect(() => {
        if(documents?.[0]?.id){
            router.push(`/chat/${documents?.[0]?.id}`)
        }
    }, [router, documents])

    return (
        <></>
    );
}

// import { getHistoryData } from './api/history'
export const getServerSideProps = (async () => {
    // const history = await getHistoryData()
    return {
        props: {
            messages: [],
        }
    }
})
