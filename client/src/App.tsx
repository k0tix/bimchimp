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
import { SidebarTrigger, useSidebar } from "./components/ui/sidebar";
import { useProducts } from "./components/contexts/files";
import {
  Box,
  FileBox,
  Menu,
  PanelLeft,
  ScanSearch,
  Search,
} from "lucide-react";
import { Separator } from "./components/ui/separator";
import { PeikkoProductData } from "./lib/types";
import { ComboBoxResponsive } from "./components/ProductUpdateThing";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "./components/ui/card";
import { usePubSub } from "./components/contexts/pubsub";

function App() {
  return (
    <Providers>
      <Dashboard />
    </Providers>
  );
}

const Dashboard: React.FC = () => {
  const products = useProducts();
  const { toggleSidebar, open } = useSidebar();

  return (
    <>
      <SideBar />

      <div className="relative w-screen h-screen overscroll-none">
        <XbimViewer className="h-screen w-full" />

        {/* <div className="absolute bottom-0 right-0 m-8">
          <PeikkoProductListView products={products.productData} />
        </div> */}

        <div className="absolute bottom-0 right-0 m-8">
          <PeikkoProductListView products={products.productData} />

          <div className="flex items-center space-x-4 p-4 bg-emerald-600 rounded-lg shadow-lg mt-2">
            <Button
              onClick={() => {
                toggleSidebar();
              }}
            >
              <FileBox />
              <span className="text-xs">{open ? "Hide" : "Show"} files</span>
            </Button>

            <Button
              onClick={() => {
                PubSub.publish("resetCamera");
                console.log("Reset camera");
              }}
            >
              <Box />
              Fit
            </Button>

            {/* Add more buttons here as needed */}
          </div>
        </div>
      </div>
    </>
  );
};

const PeikkoProductListView: React.FC<{ products: PeikkoProductData[] }> = ({
  products,
}) => {
  const PubSub = usePubSub();
  if (!products.length) {
    return <></>;
  }

  return (
    <Card>
      <CardContent className="mt-4">
        {products.map((product, index) =>
          product.product_id === null ? (
            <></>
          ) : (
            <img
              key={product.product_id + index}
              src={product.img ?? "/chimp.jpg"}
              alt={product.product_id}
              className="h-32 rounded-sm"
            />
          )
        )}
      </CardContent>

      {!!products.length && (
        <CardFooter>
          <ComboBoxResponsive
            key={products[0].product_id}
            onChange={(value) => {
              console.log("Product updated", value);
              PubSub.publish("productUpdate", value.length ? value : null);
            }}
            initialProduct={products[0].product_id ?? ""}
          />
        </CardFooter>
      )}
    </Card>
  );
};

export default App;
