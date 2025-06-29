
import StudioLayout from "@/modules/studio/ui/layout/studio-layout";  
interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div>
      <StudioLayout>
        {children}
      </StudioLayout>
    </div>
  );
};

export default Layout;