import React, { ReactElement } from 'react';
import Layout from '@/components/layout';
import { useSession } from "next-auth/react";
import { PricingCards } from '@/components/pricing/pricing-cards';
import { PricingFaq } from '@/components/pricing/pricing-faq';
const PricingPage = () => {
    const { data: session } = useSession()
    // const user = session?.user || { id: '' }
    console.log('session', session)
    return (
        <div className="flex w-full flex-col gap-16 py-8 md:py-8">
            <PricingCards userId={'user?.id'} />
            <hr className='container' />
            <PricingFaq />
        </div>
    )
}

PricingPage.getLayout = function getLayout(page: ReactElement) {
    return (
        <Layout>
            {page}
        </Layout>
    )
}

export default PricingPage;