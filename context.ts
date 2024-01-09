import { NextApiRequest, NextApiResponse } from "next";
import { NextFetchEvent, NextMiddleware, NextRequest, NextResponse } from "next/server";

// REF: https://clerk.com/blog/nextjs-pass-value-from-middleware-to-api-routes-and-getserversideprops
// discuss: https://github.com/vercel/next.js/discussions/42732

type SetContext = (rawKey: string, value: string) => void
type ContextMiddleware = (setContext: SetContext, req: NextRequest, evt: NextFetchEvent) => ReturnType<NextMiddleware>;

const ctxKey = (key: string) => `ctx-${key.toLowerCase()}`;

export const getContext = (req: (NextApiRequest | NextRequest) & {
    socket?: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        _httpMessage?: any
    }
}, rawKey: string) => {
    const key = ctxKey(rawKey);

    let headerValue =
        typeof req.headers.get === "function"
            ? req.headers.get(key) // Edge
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            : (req.headers as Record<string, any>)[key]; // Node;

    // Necessary for node in development environment
    if (!headerValue) {
        headerValue = req.socket?._httpMessage?.getHeader(key);
    }

    if (headerValue) {
        return headerValue;
    }

    // Use a dummy url because some environments only return
    // a path, not the full url
    const reqURL = new URL(req.url || '');

    return reqURL.searchParams.get(key);
};
export const deleteContext = (res: NextApiResponse | NextResponse, rawKey: string) => {
    const key = ctxKey(rawKey);
    if((res as unknown as NextApiResponse).removeHeader) {
        (res as unknown as NextApiResponse).removeHeader(key)
    } else  {
        (res as NextResponse).headers.delete(key);
    }
}


export const withContext = (allowedKeys: string[], middleware: ContextMiddleware) => {
    // Normalize allowed keys
    for (let i = 0; i < allowedKeys.length; i++) {
        if (typeof allowedKeys[i] !== "string") {
            throw new Error("All keys must be strings");
        }
        allowedKeys[i] = ctxKey(allowedKeys[i]);
    }

    return async (req: NextRequest, evt: NextFetchEvent) => {
        const reqURL = new URL(req.url);

        // First, make sure allowedKeys aren't being spoofed.
        // Reliably overriding spoofed keys is a tricky problem and
        // different hosts may behave different behavior - it's best
        // just to safelist "allowedKeys" and block if they're being
        // spoofed
        for (const allowedKey of allowedKeys) {
            if (req.headers.get(allowedKey) || reqURL.searchParams.get(allowedKey)) {
                throw new Error(
                    `Key ${allowedKey.substring(
                        4
                    )} is being spoofed. Blocking this request.`
                );
            }
        }

        const data: Record<string, string> = {};

        const setContext = (rawKey: string, value: string) => {
            const key = ctxKey(rawKey);
            if (!allowedKeys.includes(key)) {
                throw new Error(
                    `Key ${rawKey} is not allowed. Add it to withContext's first argument.`
                );
            }
            if (typeof value !== "string") {
                throw new Error(
                    `Value for ${rawKey} must be a string, received ${typeof value}`
                );
            }
            data[key] = value;
        };

        const res = await middleware(setContext, req, evt) || NextResponse.next();

        // setContext wasn't called, passthrough
        if (Object.keys(data).length === 0) {
            return res;
        }

        // Don't modify redirects
        if (res.headers.get("Location")) {
            return res;
        }

        const rewriteURL = new URL(
            res.headers.get("x-middleware-rewrite") || req.url
        );

        // Don't modify cross-origin rewrites
        if (reqURL.origin !== rewriteURL.origin) {
            return res;
        }

        // Set context directly on the res object (headers)
        // and on the rewrite url (query string)
        for (const key in data) {
            res.headers.set(key, data[key]);
            rewriteURL.searchParams.set(key, data[key]);
        }

        // set the updated rewrite url
        res.headers.set("x-middleware-rewrite", rewriteURL.href);
        // (res as NextResponse)

        console.log('middleware finished')
        return res;
    };
};