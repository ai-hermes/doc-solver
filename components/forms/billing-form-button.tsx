"use client"
import React from 'react';
// import { generateUserStripe } from '@/actions/generate-user-stripe'
import { Icons } from "@/components/shared/icons"
import { Button } from "@/components/ui/button"
import { SubscriptionPlan, UserSubscriptionPlan } from "@/types"
import { useTransition } from 'react'

interface BillingFormButtonProps {
    offer: SubscriptionPlan;
    subscriptionPlan: UserSubscriptionPlan;
    year: boolean;
}

export function BillingFormButton({ year, offer, subscriptionPlan }: BillingFormButtonProps) {
    const [isPending, _] = useTransition();
    // const generateUserStripeSession = generateUserStripe.bind(
    //     null,
    //     offer.stripeIds[year ? "yearly" : "monthly"]
    // );

    // const stripeSessionAction = () => startTransition(async () => await generateUserStripeSession());

    return (
        <Button
            variant="default"
            className="w-full"
            disabled={isPending}
            onClick={() => {
                console.log('pay price')
            }}
        >
            {isPending ? (
                <>
                    <Icons.spinner className="mr-2 size-4 animate-spin" /> Loading...
                </>
            ) : (
                <>
                    {subscriptionPlan.stripePriceId === offer.stripeIds[year ? "yearly" : "monthly"]
                        ? "Manage Subscription"
                        : "Upgrade"}
                </>
            )}
        </Button>
    )
}
