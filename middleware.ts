import { withAuth } from 'next-auth/middleware'
export default withAuth({})

// See "Matching Paths" below to learn more
// https://nextjs.org/docs/pages/building-your-application/routing/middleware
export const config = {
    matcher: [
        '/api/:path*',
        '/dashboard/:path*'
    ],
}


