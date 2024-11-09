import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Providers } from "./components/Providers";
import SideBar from "./components/SideBar";
import XbimViewer from "./components/XbimViewer";
import { SidebarTrigger } from "./components/ui/sidebar";
import { useProducts } from "./components/contexts/files";

function App() {
  return (
    <Providers>
      <Dashboard />
    </Providers>
  );
}

const Dashboard: React.FC = () => {
  const products = useProducts();

  return (
    <>
      <SideBar />
      <div className="relative w-screen h-screen">
        <XbimViewer className="h-screen w-full" />

        <div className="absolute bottom-0 left-0 m-8">
          <div className="flex items-center space-x-4 p-4 bg-gray-900 rounded-lg shadow-lg">
            <SidebarTrigger />

            <Button
              onClick={() => {
                PubSub.publish("resetCamera");
                console.log("Reset camera");
              }}
            >
              Fit to screen
            </Button>

            {/* Add more buttons here as needed */}
          </div>
        </div>
      </div>
    </>
  );
};

export default App;
