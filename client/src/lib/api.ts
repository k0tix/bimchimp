const API_BASE_URL = "https://your-api-endpoint.com";

export async function getAvailableFiles(): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/fils`);
  if (!response.ok) {
    throw new Error("Failed to fetch processed wexbim files");
  }
  return response.json();
}

export async function getFileBlob(fileName: string): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/wexbim-files/${fileName}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch wexbim file: ${fileName}`);
  }
  return response.blob();
}
export interface IApi {
  getAvailableFiles(): Promise<string[]>;
  getFileBlob(fileName: string): Promise<Blob>;
}

export const api: IApi = {
  getAvailableFiles,
  getFileBlob,
};

export const mockApi: IApi = {
  getAvailableFiles: async () => ["space.wexbim", "c.wexbim"],
  getFileBlob: async (fileName) => {
    // get file from public folder
    const response = await fetch(`/wexbim-files/${fileName}`);

    // convert it to blob file
    const blob = await response.blob();

    return blob;
  },
};
