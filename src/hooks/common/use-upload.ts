import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface IUpload {
  _id: string;
  url: string;
  originalFilename: string;
  mimetype: string;
  size: number;
  folder: string;
}

interface UploadVariables {
  file: File;
  folder?: string;
}

export function useUploadFile() {
  return useMutation({
    mutationFn: async ({ file, folder }: UploadVariables) => {
      const formData = new FormData();
      formData.append("file", file);
      if (folder) {
        formData.append("folder", folder);
      }

      const res = await api.postForm("/system/upload", formData);

      return res.data?.data as IUpload;
    },
  });
}
