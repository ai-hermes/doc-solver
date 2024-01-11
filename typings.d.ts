type Nullable<T> = T | null;


// next-auth-extensions.d.ts
// next-auth-extensions.d.ts
import { DefaultSession } from "next-auth";

declare module "next-auth" {
    /**
     * Returned by `useSession`, `getSession`, and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user: {
            /** The user's id */
            id: string;
        } & DefaultSession["user"];
    }
}