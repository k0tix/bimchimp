import { PubSubProvider } from "./contexts/pubsub";
import { SidebarProvider } from "./ui/sidebar";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <PubSubProvider>
      <SidebarProvider>{children}</SidebarProvider>
    </PubSubProvider>
  );
};
