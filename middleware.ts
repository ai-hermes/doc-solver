import { withAuth } from 'next-auth/middleware'

export default withAuth({
    callbacks: {
        authorized: ({ req: { cookies } }) => {
            const sessionToken = cookies.get("next-auth.session-token");
            return sessionToken != null;
        }
    }
})

// See "Matching Paths" below to learn more
// https://nextjs.org/docs/pages/building-your-application/routing/middleware
export const config = {
    matcher: [
        // '/api/:path*',
        '/dashboard/:path*'
    ],
}


