import React, { useState } from 'react';
import { UserAccountNav } from "@/components/layout/user-account-nav";
import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/utils/cn";
import { Icons } from "@/components/shared/icons"
import { siteConfig } from "@/config/site"
import useScroll from "@/hooks/use-scroll";
import { useSession } from "next-auth/react";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable'
interface LayoutProps {
    children: React.ReactNode;
    rightElements?: React.ReactNode
    scroll?: boolean;
}

export default function ContentLayout({
    children,
    rightElements,
    scroll = false
}: LayoutProps) {
    const [open, setOpen] = useState(true)
    const scrolled = useScroll(50);
    const { data } = useSession()
    const user = data?.user;

    return (
        <Collapsible open={open} onOpenChange={setOpen}>
            <header
                className={`sticky top-0 z-40 flex w-full justify-center bg-background/60 backdrop-blur-xl transition-all ${scroll ? scrolled
                    ? "border-b"
                    : "bg-background/0"
                    : "border-b"}`}
            >
                <div className="container flex h-16 items-center justify-between py-4">
                    <div className='flex items-center'>
                        <CollapsibleTrigger>
                            {open ? <Icons.fold /> : <Icons.open />}
                        </CollapsibleTrigger>
                        <div className='mx-1 text-slate-300'>｜</div>
                        <Link href="/upload" className="hidden items-center space-x-2 md:flex">
                            <Icons.logo />
                            <span className="hidden font-urban text-xl font-bold sm:inline-block">
                                {siteConfig.name}
                            </span>
                        </Link>
                    </div>

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
                                <Button
                                    className="px-3"
                                    variant="outline" size="sm"
                                    onClick={() => { }}>
                                    logout
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </header>
            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={15}>
                    <CollapsibleContent className='overflow-hidden p-3'>
                        {/* pdf file list */}
                        <div className='text-lg font-semibold'>Title</div>
                    </CollapsibleContent>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel>
                    {children}
                </ResizablePanel>
            </ResizablePanelGroup>
        </Collapsible>
    )
}