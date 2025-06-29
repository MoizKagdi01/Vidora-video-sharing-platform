import UserView from '@/modules/users/ui/views/UserView';
import { HydrateClient, trpc } from '@/trpc/server';
import React from 'react'
interface PageProps {
  params: Promise<{ userId: string }>
}
const page = async ({ params }: PageProps) => {
  const { userId } = await params;
  void trpc.users.getOne({ id: userId });
  void trpc.videos.getMany({ userId: userId, limit: 5 });
  return (
    <HydrateClient>
        <UserView userId={userId} />
    </HydrateClient>
  )
}
 
export default page