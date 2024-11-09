import { ProductProvider } from "./contexts/files";
import { PubSubProvider } from "./contexts/pubsub";
import { SidebarProvider } from "./ui/sidebar";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <PubSubProvider>
      <ProductProvider>
        <SidebarProvider>{children}</SidebarProvider>
      </ProductProvider>
    </PubSubProvider>
  );
};
