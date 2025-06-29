"use client";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { HomeIcon, PlaySquareIcon, TrendingUpIcon } from "lucide-react";
import Link from "next/link";
import { useClerk, useAuth } from "@clerk/nextjs";
import { usePathname } from "next/navigation";

const items = [
  {
    id: "home",
    label: "Home",
    icon: <HomeIcon className="h-4 w-4" />,
    href: "/",
  },
  {
    id: "trending",
    label: "Trending",
    icon: <TrendingUpIcon className="h-4 w-4" />,
    href: "/feed/trending",
  },
  {
    id: "subscriptions",
    label: "Subscriptions",
    icon: <PlaySquareIcon className="h-4 w-4" />,
    href: "/feed/subscription",
    auth: true,
  },
];

const MainSection = () => {
  const { isSignedIn } = useAuth();
  const clerk = useClerk();
  const pathName = usePathname();
  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton
                asChild
                tooltip={item.label}
                isActive={pathName === item.href}
                onClick={(e) => {
                  if (!isSignedIn && item.auth) {
                    e.preventDefault();
                    return clerk.openSignIn();
                  }
                }}
              >
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

export default MainSection;
