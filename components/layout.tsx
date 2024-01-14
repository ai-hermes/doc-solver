import React from 'react';
import SessionProvider from "@/components/ui/provider/session-provider";
import { NavBar } from "@/components/layout/navbar";
import { SiteFooter } from '@/components/layout/site-footer';
import { marketingConfig } from '@/config/marketing';
import { useSession } from "next-auth/react";

interface LayoutProps {
    children: React.ReactNode;
}

export default function Layout({
    children,
}: LayoutProps) {
    const { data: session } = useSession()
    return (
        <>
            <NavBar user={session?.user} items={marketingConfig.mainNav} scroll={true} />
            {children}
            <SiteFooter />
            <SessionProvider />
        </>
    )
}
