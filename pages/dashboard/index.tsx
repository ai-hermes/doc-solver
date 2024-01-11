import React, { ReactElement } from 'react';
// import { redirect } from "next/navigation"

// import { authOptions } from "@/lib/auth"
// import { getCurrentUser } from "@/lib/session"
import { EmptyPlaceholder } from "@/components/shared/empty-placeholder"
import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardShell } from "@/components/dashboard/shell"
import { Button } from "@/components/ui/button"
import Layout from '@/components/dashboard/layout';

export const metadata = {
    title: "Dashboard",
}

function DashboardPage() {
    // const user = await getCurrentUser()

    // if (!user) {
    //     redirect(authOptions?.pages?.signIn || "/login")
    // }

    return (
        <DashboardShell>
            <DashboardHeader heading="Panel" text="Create and manage content.">
                <Button>Fake button</Button>
            </DashboardHeader>
            <div>
                <EmptyPlaceholder>
                    <EmptyPlaceholder.Icon name="post" />
                    <EmptyPlaceholder.Title>No content created</EmptyPlaceholder.Title>
                    <EmptyPlaceholder.Description>
                        You don&apos;t have any content yet. Start creating content.
                    </EmptyPlaceholder.Description>
                    <Button variant="outline">Fake button</Button>
                </EmptyPlaceholder>
            </div>
        </DashboardShell>
    )
}

DashboardPage.getLayout = function getLayout(page: ReactElement) {
    return (
        <Layout>
            {page}
        </Layout>
    )
}

export default DashboardPage;