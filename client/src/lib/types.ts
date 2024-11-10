export type FileInformation = {
  id: number;
  title: string;
  stats: {
    products: Stats[];
    clash_types: Stats[];
  };
};

export type ProductInformation = {
  id: number;
};

export type PeikkoProductData = {
  product_id: string | null;
  img?: string;
  clash_type?: string;
};

export type Stats = {
  label: string | null;
  amount: number;
};
