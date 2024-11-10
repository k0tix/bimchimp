const useProxy = false;

const API_BASE_URL = useProxy ? "/api" : "http://51.120.240.58:8080";

import { FileInformation, PeikkoProductData } from "./types";
import { fileToBase64 } from "./utils";

export async function getAvailableFiles(): Promise<FileInformation[]> {
  const response = await fetch(`${API_BASE_URL}/files/list`);

  const data = await response.json();
  console.log(data);
  return data;
}

export async function getFileBlob(fileId: number): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/files/${fileId}`);

  const data = await response.json();

  return base64stringToBlob(data.file);
}

export async function uploadFile(file: File): Promise<number> {
  const fileAsBase64 = await fileToBase64(file);

  const jsonBody = {
    title: file.name,
    file: fileAsBase64,
  };

  const result = await fetch(`${API_BASE_URL}/files/add`, {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(jsonBody),
  });

  // const data = await result.json();

  // return data.id;

  return -1;
}

export async function getProducts(): Promise<PeikkoProductData[]> {
  const response = await fetch(`${API_BASE_URL}/products`);

  const data = await response.json();

  return data;
}

export async function getProduct(
  fileId: number,
  elementId: number
): Promise<PeikkoProductData | undefined> {
  const response = await fetch(
    `${API_BASE_URL}/files/${fileId}/products/${elementId}`
  );

  const data = await response.json();

  console.log(data);

  if (!data) {
    return undefined;
  }

  return data;
}

export async function updateProduct(
  fileId: number,
  elementId: number,
  productId: string | null
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/files/${fileId}/products`, {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      product_id: productId,
      element_id: elementId,
    }),
  });

  // const data = await response.json();

  // return data;
}

export interface IApi {
  getAvailableFiles(): Promise<FileInformation[]>;
  getFileBlob(fileId: number): Promise<Blob>;
  uploadFile(file: File): Promise<number>;
  getProducts(): Promise<PeikkoProductData[]>;
}

export const api: IApi = {
  getAvailableFiles,
  getFileBlob,
  uploadFile,
  getProducts,
};

const mockFiles = [
  {
    id: 1,
    title: "space.wexbim",
  },
  {
    id: 2,
    title: "c.wexbim",
  },
  {
    id: 6,
    title: "aaaa.wexbim",
  },
];

export const mockApi: IApi = {
  getAvailableFiles: async () => [],
  getFileBlob: async (fileId) => {
    const fileName = mockFiles.find((file) => file.id === fileId)?.title;

    if (!fileName) {
      return new Blob();
    }

    const response = await fetch(`/wexbim-files/${fileName}`);
    const blob = await response.blob();
    return blob;
  },
  uploadFile: async (file) => {
    return 1;
  },
  getProducts: async () => {
    return [
      {
        product_id: "HPM_20P",
        img: "https://www.prodlib.com/suppliers_images/Supplier_Peikko/Files/Html%20content/HPM_Item.jpg",
      },
      {
        product_id: "HPM_16L",
        img: "https://www.prodlib.com/suppliers_images/Supplier_Peikko/Files/Html%20content/HPM_Item.jpg",
      },
      {
        product_id: "HULCO_52",
        img: "https://www.prodlib.com/suppliers_images/Supplier_Peikko/Files/Html%20content/HULCO/HULCO.jpg",
      },
    ];
  },
};

// getFileBlob: async (fileId) => {
//   if (fileId === 1) {
//     const response = await fetch(`/wexbim-files/space.wexbim`);
//     const blob = await response.blob();
//     return blob;
//   }

//   const fileBase64 = json.file;
//   const blob = base64stringToBlob(fileBase64);
//   console.log("loaded blob from base64 string");

//   return blob;
// },

const base64stringToBlob = (base64string: string) => {
  const byteCharacters = atob(base64string);

  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: "application/octet-stream" });

  return blob;
};
