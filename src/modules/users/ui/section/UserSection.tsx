"use client";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import UserPageBanner, { UserPageBannerSkeleton } from "../components/UserPageBanner";
import UserPageInfo, { UserPageInfoSkeleton } from "../components/UserPageInfo";
import { Separator } from "@/components/ui/separator";

interface UserSectionProps {
    userId: string;
}
const UserSection = ({ userId }: UserSectionProps) => {
  return (
    <Suspense fallback={<UserSectionSkeleton />}>
        <ErrorBoundary fallback={<div>Error loading user section</div>}>
          <UserSectionSuspense userId={userId} />
        </ErrorBoundary>
    </Suspense>
  )
}
const UserSectionSkeleton = () => {
return (
  <div className="felx flex-col">
    <UserPageBannerSkeleton />
    <UserPageInfoSkeleton />
        <Separator /> 
  </div>
)
}

const UserSectionSuspense = ({ userId }: UserSectionProps) => {
    const [user] = trpc.users.getOne.useSuspenseQuery({ id: userId });
return (
    <div className="flex flex-col">
        <UserPageBanner user={user} />
        <UserPageInfo user={user} />
        <Separator />
    </div>
)
}

export default UserSection