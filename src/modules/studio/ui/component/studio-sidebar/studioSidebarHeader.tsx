import { SidebarHeader, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar'
import { useUser } from '@clerk/nextjs'
import React from 'react'
import Link from 'next/link'
import Avatar from '@/components/user-avatar'
import { Skeleton } from '@/components/ui/skeleton'
import UserAvatar from '@/components/user-avatar'
const StudioSidebarHeader = () => {
  const {user} = useUser()
  const {state} = useSidebar()

  
  if(!user) return (
    <SidebarHeader className='flex items-center justfy-center pb-4'>
      <Skeleton className='w-[112px] h-[112px] rounded-full' />
      <div className='flex flex-col gap-y-1'>
        <Skeleton className='w-[112px] h-[16px]' />
        <Skeleton className='w-[112px] h-[16px]' />
      </div>
    </SidebarHeader>
  )
  if (state === "collapsed") {
    return (
      <SidebarMenuItem >
        <SidebarMenuButton tooltip="Your Profile" asChild>
          <Link prefetch href='/users/current'>
            <UserAvatar imageUrl={user?.imageUrl} name={user?.fullName ?? "user"} size='sm' />
            <span className='text-sm'>
              Your Profile
            </span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }
  
  return (
    <SidebarHeader className='flex items-center justfy-center pb-4'>
        <Link prefetch href='/users/current'>
            <Avatar imageUrl={user?.imageUrl} name={user?.fullName ?? "user"} className='size-[112px] hover:opacity-80 transition-opacity' />
        </Link>
        <div className='flex flex-col items-center justify-center mt-2 gap-y-2'>
          <p className='text-sm font-medium'>
            Your Profile
          </p>
          <p className='text-xs text-muted-foreground'>
            {user?.fullName}
          </p>
        </div>
    </SidebarHeader>
  )
}

export default StudioSidebarHeader