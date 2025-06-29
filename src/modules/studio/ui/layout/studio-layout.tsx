import { SidebarProvider } from "@/components/ui/sidebar";
import HomeNavbar from "../component/studio-navbar/index";
import HomeSidebar from "../component/studio-sidebar";

interface HomeLayoutProps {
  children: React.ReactNode;
}
const HomeLayout = ({ children }: HomeLayoutProps) => {
  return (
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
  );
};

export default HomeLayout;
