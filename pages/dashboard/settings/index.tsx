import React, { ReactElement } from "react"
// import { redirect } from "next/navigation"

// import { authOptions } from "@/lib/auth"
// import { getCurrentUser } from "@/lib/session"
import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardShell } from "@/components/dashboard/shell"
import { UserNameForm } from "@/components/forms/user-name-form"
import Layout from "@/components/dashboard/layout"

export const metadata = {
    title: "Settings",
    description: "Manage account and website settings.",
}

function SettingsPage() {
    // const user = await getCurrentUser()

    // if (!user) {
    //     redirect(authOptions?.pages?.signIn || "/login")
    // }

    return (
        <DashboardShell>
            <DashboardHeader
                heading="Settings"
                text="Manage account and website settings."
            />
            <div className="grid gap-10">
                <UserNameForm user={{
                    id: 'user.id',
                    name: 'user.name' || ""
                }} />
            </div>
        </DashboardShell>
    )
}

SettingsPage.getLayout = function getLayout(page: ReactElement) {
    return (
        <Layout>
            {page}
        </Layout>
    )
}


export default SettingsPage;