import { SidebarProvider } from "@/components/ui/sidebar";
import HomeNavbar from "../component/home-navbar/index";
import HomeSidebar from "../component/home-sidebar";
import { HydrateClient } from "@/trpc/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface HomeLayoutProps {
  children: React.ReactNode;
}
const HomeLayout = ({ children }: HomeLayoutProps) => {
  return (
      <HydrateClient>
        <Suspense fallback={<div>Loading...</div>}>
          <ErrorBoundary fallback={<div>Error loading home view</div>}>
    <SidebarProvider>
      <div className="flex min-h-screen w-full flex-col">
        <HomeNavbar />
        <div className="flex flex-1">
          <aside>
            <HomeSidebar />
          </aside>
          <main className="flex-1 overflow-y-auto p-4 pt-16">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
          </ErrorBoundary>
        </Suspense>
      </HydrateClient>
  );
};

export default HomeLayout;
