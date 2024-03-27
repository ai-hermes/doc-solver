import { withAuth } from 'next-auth/middleware'

export default withAuth({
    callbacks: {
        authorized: ({ req: { cookies } }) => {
            const devCookieName = "next-auth.session-token"
            const prodCookieName = "__Secure-next-auth.session-token"
            // const cookieName = process.env.NODE_ENV === 'development' ? "next-auth.session-token" : "__Secure-next-auth.session-token"
            const sessionToken = cookies.get(devCookieName) || cookies.get(prodCookieName);
            return sessionToken != null;
        }
    }
})

// See "Matching Paths" below to learn more
// https://nextjs.org/docs/pages/building-your-application/routing/middleware
export const config = {
    matcher: [
        // '/api/:path*',
        '/dashboard/:path*',
        '/api/job',
        '/api/jobs',
    ],
}


