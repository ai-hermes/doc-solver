import { User } from "@prisma/client"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { Icon } from "lucide-react"

import { Icons } from "@/components/shared/icons"

export type NavLink = {
    title: string,
    href: string,
    items: SidebarNavItem
}

export type NavItem = {
    title: string
    href: string
    disabled?: boolean
}

export type MainNavItem = NavItem

export type hrefOrItems = {
    title: string;
    href: string;
    items?: hrefOrItems[]
} | {
    title: string;
    href?: string
    items: hrefOrItems[]
}
export type SidebarNavItem = {
    disabled?: boolean
    external?: boolean
    icon?: keyof typeof Icons
} & hrefOrItems

export type SiteConfig = {
    name: string
    description: string
    url: string
    ogImage: string
    mailSupport: string
    links: {
        twitter: string
        github: string
    }
}

export type DocsConfig = {
    mainNav: MainNavItem[]
    sidebarNav: SidebarNavItem[]
}

export type MarketingConfig = {
    mainNav: MainNavItem[]
}

export type DashboardConfig = {
    mainNav: MainNavItem[]
    sidebarNav: SidebarNavItem[]
}

export type SubscriptionPlan = {
    title: string;
    description: string;
    benefits: string[];
    limitations: string[];
    prices: {
        monthly: number;
        yearly: number;
    };
    stripeIds: {
        monthly: string | null;
        yearly: string | null;
    };
}

export type UserSubscriptionPlan = SubscriptionPlan &
    Pick<User, "stripeCustomerId" | "stripeSubscriptionId" | "stripePriceId"> & {
        stripeCurrentPeriodEnd: number
        isPaid: boolean
        interval: "month" | "year" | null
        isCanceled?: boolean
    }
