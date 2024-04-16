import React from 'react';
import { UserAccountNav } from "@/components/layout/user-account-nav";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/utils/cn";
import { Icons } from "@/components/shared/icons"
import { siteConfig } from "@/config/site"
import useScroll from "@/hooks/use-scroll";
import { useSession } from "next-auth/react";
import styles from './content-header.module.css';
import { LogoutButton } from '../logout-button';

interface LayoutProps {
    rightElements?: React.ReactNode
    scroll?: boolean;
}

export function ContentHeader({
    rightElements,
    scroll = false
}: LayoutProps) {
    const scrolled = useScroll(50);
    const { data } = useSession()
    const user = data?.user;

    return (
        <header
            className={`sticky top-0 z-40 flex w-full justify-center bg-background/60 backdrop-blur-xl transition-all ${scroll ? scrolled
                ? "border-b"
                : "bg-background/0"
                : "border-b"}`}
        >
            <div className={cn('container flex h-16 items-center justify-between py-4',styles.container)}>
                <Link href="/dashboard/dataset" className="hidden items-center space-x-2 md:flex">
                    <Icons.logo />
                    <span className="hidden font-urban text-xl font-bold sm:inline-block">
                        {siteConfig.name}
                    </span>
                </Link>

                <div className="flex items-center space-x-3">
                    {rightElements}

                    {!user ? (
                        <Link
                            href="/login"
                            className={cn(
                                buttonVariants({ size: "sm" })
                            )}
                        >
                            Login
                        </Link>
                    ) : null}

                    {user && (
                        <>
                            <UserAccountNav user={user} />
                            <LogoutButton />
                        </>
                    )}
                </div>
            </div>
        </header>
    )
}
