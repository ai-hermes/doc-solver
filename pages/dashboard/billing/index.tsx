import React, { ReactElement } from "react"
// import { redirect } from "next/navigation"

// import { authOptions } from "@/lib/auth"
// import { getCurrentUser } from "@/lib/session"
// import { getUserSubscriptionPlan } from "@/lib/subscription"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { BillingInfo } from "@/components/billing-info"
import { DashboardHeader } from "@/components/dashboard/header"
import { Icons } from "@/components/shared/icons"
import { DashboardShell } from "@/components/dashboard/shell"
import Layout from "@/components/dashboard/layout"


export const metadata = {
    title: "Billing",
    description: "Manage billing and your subscription plan.",
}

function BillingPage() {
    // const user = await getCurrentUser()

    // if (!user) {
    //     redirect(authOptions?.pages?.signIn || "/login")
    // }

    // const subscriptionPlan = await getUserSubscriptionPlan(user.id)

    return (
        <DashboardShell>
            <DashboardHeader
                heading="Billing"
                text="Manage billing and your subscription plan."
            />
            <div className="grid gap-8">
                <Alert className="!pl-14">
                    <Icons.warning />
                    <AlertTitle>This is a demo app.</AlertTitle>
                    <AlertDescription>
                        SaaS Starter app is a demo app using a Stripe test environment. You can
                        find a list of test card numbers on the{" "}
                        <a
                            href="https://stripe.com/docs/testing#cards"
                            target="_blank"
                            rel="noreferrer"
                            className="font-medium underline underline-offset-8"
                        >
                            Stripe docs
                        </a>
                        .
                    </AlertDescription>
                </Alert>
                <BillingInfo
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    subscriptionPlan={{} as any}
                />
            </div>
        </DashboardShell>
    )
}

BillingPage.getLayout = function getLayout(page: ReactElement) {
    return (
        <Layout>
            {page}
        </Layout>
    )
}
export default BillingPage;