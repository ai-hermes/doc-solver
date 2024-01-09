import { NextResponse } from 'next/server'
import { withContext } from './context';

const allowedContextKeys = ["user"];
export default withContext(allowedContextKeys, (setContext, req) => {
    // setContext("user", JSON.stringify({ id: 1, name: 'John Doe' }));
    return NextResponse.next();
});

// See "Matching Paths" below to learn more
export const config = {
    matcher: '/api/:path*',
}