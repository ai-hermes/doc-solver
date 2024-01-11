import React from 'react';
// import { notFound } from "next/navigation"

import { DashboardNav } from "@/components/layout/nav"
import { NavBar } from "@/components/layout/navbar"
import { SiteFooter } from "@/components/layout/site-footer"
import { dashboardConfig } from "@/config/dashboard"
import { useSession } from "next-auth/react"
// import { getCurrentUser } from "@/lib/session"

interface DashboardLayoutProps {
    children?: React.ReactNode
}

export default function DashboardLayout({
    children,
}: DashboardLayoutProps) {
    const { data: session } = useSession()
    const user = session?.user
    console.log('user', session)
    if (!session?.user) {
        return "notFound()"
    }

    return (
        <div className="flex min-h-screen flex-col space-y-6">
            <NavBar user={user} items={dashboardConfig.mainNav} scroll={false} />

            <div className="container grid flex-1 gap-12 md:grid-cols-[200px_1fr]">
                <aside className="hidden w-[200px] flex-col md:flex">
                    <DashboardNav items={dashboardConfig.sidebarNav} />
                </aside>
                <main className="flex w-full flex-1 flex-col overflow-hidden">
                    {children}
                </main>
            </div>
            <SiteFooter className="border-t" />
        </div>
    )
}
