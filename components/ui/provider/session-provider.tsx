"use client";

import { useUser } from "@/lib/store/user";
import { createBrowserClient } from "@supabase/ssr";
import { useCallback, useEffect } from "react";

const SessionProvider = () => {
    const setUser = useUser((state) => state.setUser);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const userSession = useCallback(async () => {
        const { data } = await supabase.auth.getSession();
        console.log(data.session?.user, 'data.session?.user')
        setUser(data.session?.user);
    }, [setUser, supabase]);

    useEffect(() => {
        userSession();
    }, [userSession]);

    return null
};

export default SessionProvider;
