import React from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import ContentHeader from '@/components/header/content-header';
import DocumentList from '../document-list';
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
                    <DocumentList/>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel>
                    {children}
                </ResizablePanel>
            </ResizablePanelGroup>
        </>
    )
}