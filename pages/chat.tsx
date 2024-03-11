import React from 'react';
import ContentLayout from '@/components/content-layout';
import { InferGetServerSidePropsType } from 'next';
import Embedding from './embedding';
export default function Home({
    messages: _messages,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
    
    return (
        <ContentLayout>
            <Embedding />
        </ContentLayout>
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
