import React from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import ContentHeader from '@/components/header/content-header'
interface LayoutProps {
    children: React.ReactNode;
    rightElements?: React.ReactNode
    scroll?: boolean;
}

export default function ContentLayout({
    children,
    rightElements,
}: LayoutProps) {
    return (
        <>
            <ContentHeader rightElements={rightElements} />
            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={15}>
                    <div className='overflow-hidden p-3'>
                        {/* pdf file list */}
                        <div className='text-lg font-semibold'>Title</div>
                    </div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel>
                    {children}
                </ResizablePanel>
            </ResizablePanelGroup>
        </>
    )
}