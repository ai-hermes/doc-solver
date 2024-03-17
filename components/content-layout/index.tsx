import React from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { ContentHeader } from '@/components/header/content-header';
import { DocumentList } from '../document-list';
import { ToUploadButton } from '../to-upload-button';

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
            <ResizablePanelGroup direction="horizontal" style={{height: `calc(100vh - 4.2rem)`}}>
                <ResizablePanel defaultSize={15}>
                    <ToUploadButton />
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