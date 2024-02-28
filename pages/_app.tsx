import '@/styles/global.css';
import "@/styles/mdx.css"

import React from 'react';
import type { ReactElement, ReactNode } from 'react'
import type { NextPage } from 'next'
import type { AppProps } from 'next/app'

import {
    QueryClient,
    QueryClientProvider,
} from '@tanstack/react-query';
import { ThemeProvider } from "@/components/providers";
import { SessionProvider } from "next-auth/react"
import { TailwindIndicator } from "@/components/tailwind-indicator";


//  web/pdf_viewer.css"
import "pdfjs-dist/web/pdf_viewer.css";
import '@/components/ui/react-pdf-highlighter/style/AreaHighlight.css';
import '@/components/ui/react-pdf-highlighter/style/Highlight.css';
import '@/components/ui/react-pdf-highlighter/style/MouseSelection.css';
import '@/components/ui/react-pdf-highlighter/style/pdf_viewer.css';
import '@/components/ui/react-pdf-highlighter/style/PdfHighlighter.css';
import '@/components/ui/react-pdf-highlighter/style/Tip.css';


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type NextPageWithLayout<P = any, IP = P> = NextPage<P, IP> & {
    getLayout?: (page: ReactElement) => ReactNode
}

type AppPropsWithLayout = AppProps & {
    Component: NextPageWithLayout
}


const queryClient = new QueryClient()
function App({
    Component,
    pageProps: { session, ...pageProps },
}: AppPropsWithLayout) {
    // Use the layout defined at the page level, if available
    const getLayout = Component.getLayout ?? ((page) => page)
    return (
        <QueryClientProvider client={queryClient}>
            <SessionProvider session={session}>
                <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
                    <div className="flex min-h-screen flex-col">
                        {getLayout(<Component {...pageProps} />)}
                    </div>
                    <TailwindIndicator />
                </ThemeProvider>
            </SessionProvider>
        </QueryClientProvider>
    )
}
export default App;