import SubscriptionView from '@/modules/subscription/ui/view/SubscriptionView'
import { HydrateClient, trpc } from '@/trpc/server'
import React from 'react'

export const dynamic = "force-dynamic";
const page = async () => {
void trpc.subscriptions.getMany({ limit: 5 })
  return (
    <HydrateClient>
        <SubscriptionView />
    </HydrateClient>
  )
}

export default page