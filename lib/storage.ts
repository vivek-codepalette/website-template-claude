"use client";

import { api } from "../convex/_generated/api";
import { useMutation } from "convex/react";

// TODO: Add uploading.. or % complete
export const useUploadFile = () => {
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);

  async function uploadFile(file: File) {
    const url = await generateUploadUrl();

    const result = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });
    const { storageId } = await result.json();
    return storageId;
  }

  return uploadFile;
};
