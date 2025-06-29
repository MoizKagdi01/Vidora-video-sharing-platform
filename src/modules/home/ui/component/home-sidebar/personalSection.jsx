"use client";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { HistoryIcon, ListVideoIcon, ThumbsUpIcon } from "lucide-react";
import Link from "next/link";
import { useAuth, useClerk } from "@clerk/nextjs";
import { usePathname } from "next/navigation";

const items = [
  {
    id: "history",
    label: "History",
    icon: <HistoryIcon className="h-4 w-4" />,
    href: "/playlist/history",
    auth: true,
  },
  {
    id: "liked",
    label: "Liked Videos",
    icon: <ThumbsUpIcon className="h-4 w-4" />,
    href: "/playlist/liked",
    auth: true,
  },
  {
    id: "playlist",
    label: "Playlist",
    icon: <ListVideoIcon className="h-4 w-4" />,
    href: "/playlist",
    auth: true,
  },
];

const PersonalSection = () => {
    const {isSignedIn} = useAuth();
    const clerk = useClerk();
    const pathName = usePathname()
  return (
    <SidebarGroup>
      <SidebarGroupLabel>YOU</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton asChild isActive={pathName === item.href} tooltip={item.label} onClick={(e) => {
                if (!isSignedIn && item.auth) {
                  e.preventDefault();
                  return clerk.openSignIn();
                }
              }}>
                <Link prefetch href={item.href}>
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

export default PersonalSection;
