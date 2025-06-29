import { StudioView } from '@/modules/studio/ui/views/studio-view'
import { getQueryClient, trpc } from '@/trpc/server'
import { HydrationBoundary, dehydrate } from '@tanstack/react-query'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import React from 'react'

const page = async () => {
  const { userId } = await auth()
  
  // Redirect to sign-in if not authenticated
  if (!userId) {
    redirect('/sign-in')
  }

  const queryClient = getQueryClient()
  
  try {
    // Prefetch the initial data
    void trpc.studio.getMany.prefetch({
      limit: 5,
    })
    
    return (
      <HydrationBoundary state={dehydrate(queryClient)}>
        <StudioView />
      </HydrationBoundary>
    )
  } catch (error) {
    // If there's an auth error, redirect to sign-in
    if (error && typeof error === 'object' && 'code' in error && error.code === 'UNAUTHORIZED') {
      redirect('/sign-in')
    }
    throw error // Re-throw other errors
  }
}

export default page