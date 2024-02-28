'use client'
import { notFound } from "next/navigation"
import { Doc, allDocs } from "contentlayer/generated"

import { getTableOfContents, TableOfContents } from "@/lib/toc"
import { Mdx } from "@/components/content/mdx-components"
import { DocsPageHeader } from "@/components/docs/page-header"
import { DocsPager } from "@/components/docs/pager"
import { DashboardTableOfContents } from "@/components/shared/toc"

// import "@/styles/mdx.css"
import { Metadata } from "next"

import { env } from "@/env.mjs"
import { absoluteUrl } from "@/lib/utils"
import { useRouter } from "next/router"
import { ReactElement, useEffect, useState } from "react"
import DocLayout from '@/components/doc-layout'

interface DocPageProps {
    params: {
        slug: string[]
    }
}

function getDocFromParams(params: DocPageProps["params"]) {
    const slug = params.slug?.join("/") || ""
    const doc = allDocs.find((doc) => doc.slugAsParams === slug)

    if (!doc) {
        null
    }

    return doc
}

export async function generateMetadata({
    params,
}: DocPageProps): Promise<Metadata> {
    const doc = await getDocFromParams(params)

    if (!doc) {
        return {}
    }

    const url = env.NEXT_PUBLIC_APP_URL

    const ogUrl = new URL(`${url}/api/og`)
    ogUrl.searchParams.set("heading", doc.description ?? doc.title)
    ogUrl.searchParams.set("type", "Documentation")
    ogUrl.searchParams.set("mode", "dark")

    return {
        title: doc.title,
        description: doc.description,
        openGraph: {
            title: doc.title,
            description: doc.description,
            type: "article",
            url: absoluteUrl(doc.slug),
            images: [
                {
                    url: ogUrl.toString(),
                    width: 1200,
                    height: 630,
                    alt: doc.title,
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title: doc.title,
            description: doc.description,
            images: [ogUrl.toString()],
        },
    }
}

export async function generateStaticParams(): Promise<
    DocPageProps["params"][]
> {
    return allDocs.map((doc) => ({
        slug: doc.slugAsParams.split("/"),
    }))
}

function DocPage(props: DocPageProps) {
    const router = useRouter()
    // console.log('slugs', router.query['slug'])
    const doc = getDocFromParams(router.query as DocPageProps["params"])
    const [docData, setDocData] = useState<{
        doc: Doc | undefined;
        toc: TableOfContents | undefined,
        isLoading: boolean
    }>({
        doc: undefined,
        toc: undefined,
        isLoading: true
    })
    useEffect(() => {
        (async () => {
            const doc = await getDocFromParams(router.query as DocPageProps["params"])
            if (!doc) {
                return
            }
            const toc = await getTableOfContents(doc.body.raw)
            setDocData({
                doc, toc, isLoading: false
            })
        })()
    }, [router.query])

    if (!doc) {
        notFound()
    }
    if (docData.isLoading || !docData.toc || !docData.doc) {
        return null
    }
    return (
        <main className="relative py-6 lg:gap-10 lg:py-10 xl:grid xl:grid-cols-[1fr_300px]">
            <div className="mx-auto w-full min-w-0">
                <DocsPageHeader heading={doc.title} text={doc.description} />
                <Mdx code={docData.doc.body.code} />
                <hr className="my-4 md:my-6" />
                <DocsPager doc={doc} />
            </div>
            <div className="hidden text-sm xl:block">
                <div className="sticky top-16 -mt-10 max-h-[calc(var(--vh)-4rem)] overflow-y-auto pt-10">
                    <DashboardTableOfContents toc={docData.toc} />
                </div>
            </div>
        </main>
    )
}

DocPage.getLayout = function getLayout(page: ReactElement) {
    return (
        <DocLayout>
            {page}
        </DocLayout>
    )
}

export default DocPage;