'use client'
import React from 'react';
import { DocsSearch } from "@/components/docs/search"
import { DocsSidebarNav } from "@/components/docs/sidebar-nav"
import { NavBar } from "@/components/layout/navbar"
import { SiteFooter } from "@/components/layout/site-footer"

import { useSession } from 'next-auth/react';
import { Icons } from "@/components/shared/icons"
import Link from 'next/link';
import { docsConfig } from "@/config/docs"
import { siteConfig } from "@/config/site"


export const metadata = {
    title: "Documents",
}

const rightHeader = () => (
    <div className="flex flex-1 items-center space-x-4 sm:justify-end">
        <div className="hidden lg:flex lg:grow-0">
            <DocsSearch />
        </div>
        <div className="flex lg:hidden">
            <Icons.search className="size-6 text-muted-foreground" />
        </div>
        <nav className="flex space-x-4">
            <Link
                href={siteConfig.links.github}
                target="_blank"
                rel="noreferrer"
            >
                <Icons.gitHub className="size-7" />
                <span className="sr-only">GitHub</span>
            </Link>
        </nav>
    </div>
)

interface DocsLayoutProps {
    children: React.ReactNode
}

export default function Layout({ children }: DocsLayoutProps) {
    const { data: session } = useSession()
    return (
        <div className="flex min-h-screen flex-col">
            <NavBar user={session?.user} items={docsConfig.mainNav} rightElements={rightHeader()}>
                <DocsSidebarNav items={docsConfig.sidebarNav} />
            </NavBar>
            <div className="container flex-1">
                <div className="flex-1 md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
                    <aside className="fixed top-14 z-30 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-r py-6 pr-2 md:sticky md:block lg:py-10">
                        <DocsSidebarNav items={docsConfig.sidebarNav} />
                    </aside>
                    {children}
                </div>
            </div>
            <SiteFooter className="border-t" />
        </div>
    )
};