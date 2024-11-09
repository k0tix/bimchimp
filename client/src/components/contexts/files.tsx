import React, { createContext, useContext, useState, ReactNode } from "react";
import { FileInformation, ProductInformation } from "../../lib/types";

interface ProductContextType {
  selectedProduct: ProductInformation | null;
  setSelectedProduct: (product: ProductInformation | null) => void;
  availableFiles: FileInformation[];
  setAvailableFiles: (files: FileInformation[]) => void;
  currentFile: FileInformation | null;
  setCurrentFile: (file: FileInformation | null) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [availableFiles, setAvailableFiles] = useState<FileInformation[]>([]);
  const [currentFile, setCurrentFile] = useState<FileInformation | null>(null);
  const [selectedProduct, setSelectedProduct] =
    useState<ProductInformation | null>(null);

  return (
    <ProductContext.Provider
      value={{
        selectedProduct,
        setSelectedProduct,
        availableFiles,
        setAvailableFiles,
        currentFile,
        setCurrentFile,
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
