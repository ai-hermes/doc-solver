import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { env } from 'env.mjs'
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(input: string | number): string {
    const date = new Date(input)
    return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    })
}

export function nFormatter(num?: number, digits?: number) {
    if (!num) return "";
    const lookup = [
        { value: 1, symbol: "" },
        { value: 1e3, symbol: "K" },
        { value: 1e6, symbol: "M" },
        { value: 1e9, symbol: "G" },
        { value: 1e12, symbol: "T" },
        { value: 1e15, symbol: "P" },
        { value: 1e18, symbol: "E" },
    ];
    const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    const item = lookup
        .slice()
        .reverse()
        .find(function (item) {
            return num >= item.value;
        });
    return item
        ? (num / item.value).toFixed(digits || 1).replace(rx, "$1") + item.symbol
        : "0";
}

export function sleepNSeconds(n: number) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(null)
        }, n * 1000)
    })
}

export function absoluteUrl(path: string) {
    return `${env.NEXT_PUBLIC_APP_URL}${path}`
}