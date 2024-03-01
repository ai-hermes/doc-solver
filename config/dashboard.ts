import { DashboardConfig } from "types"

export const dashboardConfig: DashboardConfig = {
    mainNav: [
        {
            title: "Documentation",
            href: "/docs",
        },
        {
            title: "Support",
            href: "/support",
            disabled: true,
        },
    ],
    sidebarNav: [
        {
            title: "Panel",
            href: "/dashboard",
            icon: "post",
        },
        {
            title: "Billing",
            href: "/dashboard/billing",
            icon: "billing",
        },
        {
            title: "Settings",
            href: "/dashboard/settings",
            icon: "settings",
        },
        {
            title: "Dataset",
            href: "/dashboard/dataset",
            icon: "database",
        },
    ],
}
