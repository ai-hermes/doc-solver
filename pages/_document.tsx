import React from 'react';
import { Html, Head, Main, NextScript } from 'next/document';
import { fontHeading, fontSans, fontUrban } from "@/assets/fonts";

import { cn } from "@/utils/cn";

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
          fontUrban.variable,
          fontHeading.variable
        )}
      >
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
