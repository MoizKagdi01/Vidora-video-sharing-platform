"use client";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { trpc } from "@/trpc/client";
import UserAvatar from "@/components/user-avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ListIcon } from "lucide-react";

export const SubscriptionSectionSkeleton = () => {
  return (
    <>
      {Array.from({ length: 5 }).map((_, index) => (
        <SidebarMenuItem key={index}>
          <SidebarMenuButton asChild disabled isActive={false}>
            <>
              <Skeleton className="size-6 rounded-full shrink-0" />
              <Skeleton className="w-full h-4" />
            </>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </>
  );
};
const SubscriptionSection = () => {
  const pathName = usePathname();
  const { data, isLoading } = trpc.subscriptions.getMany.useInfiniteQuery(
    {
      limit: 5,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Subscriptions</SidebarGroupLabel>
      <SidebarGroupContent>
        <>
          <SidebarMenu>
            {isLoading && <SubscriptionSectionSkeleton />}
            {!isLoading &&
              data?.pages
                .flatMap((page) => page.items)
                .map((subscription) => (
                  <SidebarMenuItem
                    key={`${subscription.id}-${subscription.viewerId}`}
                  >
                    <SidebarMenuButton
                      asChild
                      isActive={pathName === `/users/${subscription.users.id}`}
                      tooltip={subscription.users.name}
                    >
                      <Link
                        href={`/users/${subscription.users.id}`}
                        className="flex items-center gap-4"
                      >
                        <UserAvatar
                          size={"xs"}
                          imageUrl={subscription.users.imageURL}
                          name={subscription.users.name}
                        />
                        <span>{subscription.users.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
          </SidebarMenu>
          {!isLoading && (
            <SidebarMenuItem
            className="list-none"   // don't know why but this is having a bug showing list item dot while normally it doesn't
            >
              <SidebarMenuButton
                asChild
                isActive={pathName === `/subscriptions`}
              >
                <Link prefetch href="/subscriptions" className="flex items-center gap-4">
                  <ListIcon className="size-4" />
                  <span>View all</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

export default SubscriptionSection;
