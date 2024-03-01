import { FC } from 'react'
import Link from "next/link"
import { Doc } from "contentlayer/generated"

import { docsConfig } from "@/config/docs"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/shared/icons"
import { hrefOrItems } from 'types'
interface DocsPagerProps {
    doc: Doc
}

export const DocsPager: FC<DocsPagerProps> = ({ doc }) => {
    const pager = getPagerForDoc(doc)

    if (!pager) {
        return null
    }

    return (
        <div className="flex flex-row items-center justify-between">
            {pager?.prev && (
                <Link
                    href={pager.prev.href!}
                    className={cn(buttonVariants({ variant: "ghost" }))}
                >
                    <Icons.chevronLeft className="mr-2 size-4" />
                    {pager.prev.title}
                </Link>
            )}
            {pager?.next && (
                <Link
                    href={pager.next.href!}
                    className={cn(buttonVariants({ variant: "ghost" }), "ml-auto")}
                >
                    {pager.next.title}
                    <Icons.chevronRight className="ml-2 size-4" />
                </Link>
            )}
        </div>
    )
}

export function getPagerForDoc(doc: Doc) {
    const flattenedLinks = [null, ...flatten(docsConfig.sidebarNav), null]
    const activeIndex = flattenedLinks.findIndex(
        (link) => doc.slug === link?.href
    )
    const prev = activeIndex !== 0 ? flattenedLinks[activeIndex - 1] : null
    const next =
        activeIndex !== flattenedLinks.length - 1
            ? flattenedLinks[activeIndex + 1]
            : null
    return {
        prev,
        next,
    }
}

export function flatten(links: hrefOrItems[]): hrefOrItems[] {
    return links.reduce((flat, link) => {
        if (link?.href) {
            return flat.concat(link)
        } else if (link?.items) {
            return flat.concat(flatten(link.items))
        }
        return flat
    }, [] as hrefOrItems[])
}