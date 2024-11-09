const API_BASE_URL = "https://your-api-endpoint.com";

// import json from "../../req.json";
// import json2 from "../../req2.json";

import { FileInformation } from "./types";

export async function getAvailableFiles(): Promise<FileInformation[]> {
  const response = await fetch(`${API_BASE_URL}/fils`);
  if (!response.ok) {
    throw new Error("Failed to fetch processed wexbim files");
  }
  return response.json();
}

export async function getFileBlob(fileId: number): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/wexbim-files/${fileId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch wexbim file: ${fileId}`);
  }
  return response.blob();
}
export interface IApi {
  getAvailableFiles(): Promise<FileInformation[]>;
  getFileBlob(fileId: number): Promise<Blob>;
}

export const api: IApi = {
  getAvailableFiles,
  getFileBlob,
};

const mockFiles = [
  {
    id: 1,
    name: "space.wexbim",
  },
  {
    id: 2,
    name: "c.wexbim",
  },
];

export const mockApi: IApi = {
  getAvailableFiles: async () => mockFiles,
  getFileBlob: async (fileId) => {
    const fileName = mockFiles.find((file) => file.id === fileId)?.name;

    if (!fileName) {
      return new Blob();
    }

    const response = await fetch(`/wexbim-files/${fileName}`);
    const blob = await response.blob();
    return blob;
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
