import { HydrateClient, trpc } from "@/trpc/server";
import { HomeView } from "@/modules/home/ui/views/home-view";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
export const dynamic = "force-dynamic";
interface HomePageProps {
  searchParams: Promise<{ categoryId?: string }>;
}

const Page = async ({ searchParams }: HomePageProps) => {
  const { categoryId } = await searchParams;
  void trpc.categories.getAll();
  return (
    <HydrateClient>
      <Suspense fallback={<div>Loading...</div>}>
        <ErrorBoundary fallback={<div>Error loading home view</div>}>
          <HomeView categoryId={categoryId} />
        </ErrorBoundary>
      </Suspense>
    </HydrateClient>
  );
};

export default Page;
