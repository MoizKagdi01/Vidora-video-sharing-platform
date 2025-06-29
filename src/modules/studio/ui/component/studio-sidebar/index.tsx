"use client"
import { Separator } from '@/components/ui/separator'
import { Sidebar, SidebarContent, SidebarGroup, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
import Link from 'next/link'
import { LogOutIcon, VideoIcon } from 'lucide-react'
import { usePathname } from 'next/navigation'
import StudioSidebarHeader from './studioSidebarHeader'
const StudioSidebar = () => {

  const pathname = usePathname()

  return (
    <Sidebar className="mt-16" collapsible="icon">
      <SidebarContent className='bg-background'
      //  style={{backgroundColor:"#ff0",color:"red"}}
      //      UPDATE THEME HERE
      >
        <StudioSidebarHeader />
        <Separator  />
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem >
              <SidebarMenuButton isActive={pathname === '/studio'} tooltip="Your Videos" asChild>
                <Link prefetch href="/studio">
                  <VideoIcon className="size-4" />
                  <span className="text-sm">Videos</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Exit Studio" asChild>
                <Link prefetch href="/">
                  <LogOutIcon className="size-4" />
                  <span className="text-sm">Exit Studio</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

export default StudioSidebar