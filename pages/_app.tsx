import React from 'react';
import '@/styles/base.css';
import type { AppProps } from 'next/app';
import { Inter } from 'next/font/google';
import "pdfjs-dist/web/pdf_viewer.css";
//  web/pdf_viewer.css"
import '@/components/ui/react-pdf-highlighter/style/AreaHighlight.css';
import '@/components/ui/react-pdf-highlighter/style/Highlight.css';
import '@/components/ui/react-pdf-highlighter/style/MouseSelection.css';
import '@/components/ui/react-pdf-highlighter/style/pdf_viewer.css';
import '@/components/ui/react-pdf-highlighter/style/PdfHighlighter.css';
import '@/components/ui/react-pdf-highlighter/style/Tip.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <main className={inter.variable}>
        <Component {...pageProps} />
      </main>
    </>
  );
}

export default MyApp;
