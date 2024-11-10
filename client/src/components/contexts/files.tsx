import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import {
  FileInformation,
  PeikkoProductData,
  ProductInformation,
} from "../../lib/types";
import { api, getProduct, updateProduct } from "../../lib/api";
import { usePubSub } from "./pubsub";

interface ProductContextType {
  selectedProduct: ProductInformation | null;
  setSelectedProduct: (product: ProductInformation | null) => void;
  availableFiles: FileInformation[];
  setAvailableFiles: (files: FileInformation[]) => void;
  currentFile: FileInformation | null;
  setCurrentFile: (file: FileInformation | null) => void;
  productData: PeikkoProductData[];
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [availableFiles, setAvailableFiles] = useState<FileInformation[]>([]);
  const [currentFile, setCurrentFile] = useState<FileInformation | null>(null);
  const [selectedProduct, setSelectedProduct] =
    useState<ProductInformation | null>(null);

  const PubSub = usePubSub();

  const [productData, setProductData] = useState<PeikkoProductData[]>([]);

  useEffect(() => {
    const productToken = PubSub.subscribe("productSelected", (msg, data) => {
      console.log("selected product", data);
      setSelectedProduct({ id: data });

      if (!currentFile) {
        console.log("no file selected");
        return;
      }

      getProduct(currentFile.id, data).then((product) => {
        if (product === undefined) {
          console.log("no product data found");
          return;
        }

        console.log("product data found", product);

        setProductData([product]);
      });
    });

    const productUpdateToken = PubSub.subscribe(
      "productUpdate",
      (msg, data) => {
        if (!currentFile || !selectedProduct) {
          return;
        }

        updateProduct(currentFile.id, selectedProduct.id, data).then(() =>
          PubSub.publish("productSelected", selectedProduct.id)
        );
      }
    );

    return () => {
      PubSub.unsubscribe(productToken);
      PubSub.unsubscribe(productUpdateToken);
    };
  }, [PubSub, currentFile, selectedProduct]);

  return (
    <ProductContext.Provider
      value={{
        selectedProduct,
        setSelectedProduct,
        availableFiles,
        setAvailableFiles,
        currentFile,
        setCurrentFile,
        productData,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = (): ProductContextType => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error("useProductContext must be used within a ProductProvider");
  }
  return context;
};
