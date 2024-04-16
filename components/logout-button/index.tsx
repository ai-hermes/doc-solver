import React from 'react';
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react"

export function LogoutButton() {

    return (
        <Button
            className="px-3"
            variant="outline" size="sm"
            onClick={() => signOut({
                callbackUrl: `${window.location.origin}/`
            })}>
            logout
        </Button>
    )
}
