import { withAuth } from 'next-auth/middleware'

export default withAuth({
    callbacks: {
        authorized: ({ req: { cookies } }) => {
            const cookieName = process.env.NODE_ENV === 'development' ? "next-auth.session-token" : "__Secure-next-auth.session-token"
            const sessionToken = cookies.get(cookieName);
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


