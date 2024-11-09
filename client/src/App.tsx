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

function App() {
  return (
    <Providers>
      <SideBar />
      <div className="relative w-screen h-screen">
        <XbimViewer className="h-screen w-full" />

        <div className="absolute top-0 left-0">
          <SidebarTrigger />
        </div>

        <div className="absolute bottom-0 left-0 bg-slate-500 rounded-xl m-8">
          {/* <TableDemo /> */}

          <Button
            onClick={() => {
              PubSub.publish("resetCamera");
              console.log("Reset camera");
            }}
          >
            Fit to screen
          </Button>
        </div>
      </div>
      {/* <div className="h-screen w-screen flex items-center justify-center">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline">Show Dialog</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div> */}
    </Providers>
  );
}

export default App;
