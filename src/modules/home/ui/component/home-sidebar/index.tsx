import { Separator } from '@/components/ui/separator'
import { Sidebar, SidebarContent } from '@/components/ui/sidebar'
import React from 'react'
import MainSection from './mainSection'
import PersonalSection from './personalSection'
import SubscriptionSection from './SubscriptionSection'
import { SignedIn } from '@clerk/nextjs'
const HomeSidebar = () => {
  return (
    <Sidebar className="mt-16" collapsible="icon">
      <SidebarContent>
        <MainSection />
        <Separator />
        <PersonalSection />
        <SignedIn>
            <Separator />
            <SubscriptionSection />
        </SignedIn>
      </SidebarContent>
    </Sidebar>
  )
}

export default HomeSidebar