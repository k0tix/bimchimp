"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Drawer, DrawerContent, DrawerTrigger } from "./ui/drawer";
import { useMediaQuery } from "../lib/utils";
import { PeikkoProductData } from "../lib/types";
import { getProducts } from "../lib/api";

type Status = {
  value: string;
  label: string;
};

interface ComboBoxProps {
  onChange: (value: string) => void;
  initialProduct?: string;
}

export const ComboBoxResponsive: React.FC<ComboBoxProps> = ({
  onChange,
  initialProduct,
}) => {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [selectedStatus, setSelectedStatus] = React.useState<Status | null>(
    initialProduct
      ? {
          label: initialProduct,
          value: initialProduct,
        }
      : null
  );

  const [allProducts, setAllProducts] = React.useState<PeikkoProductData[]>([]);

  React.useEffect(() => {
    getProducts().then((products) => {
      setAllProducts(products);
    });
  }, []);

  const setSelected = (status: Status | null) => {
    setSelectedStatus(status);
    onChange(status?.value ?? "");
  };

  const memoizedProducts = React.useMemo<Status[]>(() => {
    const statuses = allProducts.map((product) => ({
      label: product.product_id ?? "Not selected",
      value: product.product_id ?? "",
    }));

    return [{ label: "Not selected", value: "" }, ...statuses];
  }, [allProducts]);

  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-[150px] justify-start">
            {selectedStatus ? <>{selectedStatus.label}</> : <>Set product</>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start">
          <StatusList
            setOpen={setOpen}
            setSelectedStatus={setSelected}
            products={memoizedProducts}
          />
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" className="w-[150px] justify-start">
          {selectedStatus ? <>{selectedStatus.label}</> : <>Set product</>}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mt-4 border-t">
          <StatusList
            setOpen={setOpen}
            setSelectedStatus={setSelected}
            products={memoizedProducts}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
};

function StatusList({
  setOpen,
  setSelectedStatus,
  products,
}: {
  setOpen: (open: boolean) => void;
  setSelectedStatus: (status: Status | null) => void;
  products: Status[];
}) {
  return (
    <Command>
      <CommandInput placeholder="Filter product..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup>
          {products.map((status, index) => (
            <CommandItem
              key={status.value + index}
              value={status.value}
              onSelect={(value) => {
                setSelectedStatus(
                  products.find((priority) => priority.value === value) || null
                );
                setOpen(false);
              }}
            >
              {status.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
