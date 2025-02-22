"use client";
import DragAndDrop from "@/components/DragAndDrop";
import UploadPending from "@/components/UploadPending";
import { useCallback, useEffect, useState } from "react";

export type UploadPendingItemType = {
  uploadId: string;
  fileName: string;
  size: number;
  status: "uploading" | "completed";
  path?: string;
};

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File[] | null>(null);
  const [pendingUpload, setPendingUpload] = useState<
    UploadPendingItemType[] | null
  >(null);

  const handleUpload = useCallback(() => {
    selectedFile?.forEach((file: File) => {
      uploadFile(file);
      setSelectedFile((prev) => (prev ? prev.filter((f) => f !== file) : null));
    });
  }, [selectedFile]);

  const startUpload = async (
    file: File
  ): Promise<{ uploadId: string; key: string }> => {
    const formData = new FormData();
    formData.append("fileName", file.name);
    formData.append("fileType", file.type);
    formData.append("endPoint", "create-multipart-upload");
    const response = await fetch(
      `/api/upload`,
      {
        method: "POST",
        body: formData,
      }
    );
    const data = await response.json();

    return data; // { uploadId, key }
  };

  const uploadParts = async (
    file: File,
    uploadId: string,
    key: string,
    onProgress: (progress: number) => void
  ): Promise<{ ETag: string; PartNumber: number }[]> => {
    const chunkSize = 5 * 1024 * 1024; // 5MB
    const totalChunks = Math.ceil(file.size / chunkSize);
    const parts = [];

    for (let i = 0; i < totalChunks; i++) {
      const chunk = file.slice(i * chunkSize, (i + 1) * chunkSize);
      const partNumber = i + 1;

      const formData = new FormData();
      formData.append("chunk", chunk);
      formData.append("uploadId", uploadId);
      formData.append("key", key);
      formData.append("partNumber", partNumber.toString());
      formData.append("endPoint", "upload-part");
      const uploadResponse = await fetch(
        `${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/api/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const responseData = await uploadResponse.json();

      if (responseData.etag) {
        parts.push({ ETag: responseData.etag, PartNumber: partNumber });
      }

      const progress = Math.round((partNumber / totalChunks) * 100);
      onProgress(progress);
    }

    return parts;
  };

  const completeUpload = async (
    uploadId: string,
    key: string,
    parts: { ETag: string; PartNumber: number }[]
  ): Promise<{ Location: string }> => {
    const formData = new FormData();

    formData.append("key", key);
    formData.append("uploadId", uploadId);
    formData.append("parts", JSON.stringify(parts));
    formData.append("endPoint", "complete-multipart-upload");
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/api/upload`,
      {
        method: "POST",
        body: formData,
      }
    );
    const data = await response.json();
    return data;
  };

  const uploadFile = async (file: File): Promise<void> => {
    try {
      const { uploadId, key } = await startUpload(file);
      setPendingUpload((prev) => [
        ...(prev ?? []),
        {
          uploadId,
          fileName: file.name,
          size: file.size,
          path: "",
          status: "uploading",
        },
      ]);
      const parts = await uploadParts(file, uploadId, key, (progress) => {
        console.log(`Upload Progress: ${progress}%`);
      });

      const result = await completeUpload(uploadId, key, parts);

      setPendingUpload(
        (prev) =>
          prev?.map((item) =>
            item.uploadId === uploadId
              ? { ...item, status: "completed", path: result.Location }
              : item
          ) ?? []
      );
    } catch (error) {
      console.error("خطا در آپلود فایل:", error);
    }
  };
  useEffect(() => {
    if (selectedFile?.length) {
      handleUpload();
    }
  }, [selectedFile]);
  return (
    <div className="mt-24 w-10/12 max-w-[700px] mx-auto">
      <DragAndDrop setSelectedFile={setSelectedFile} />
      <div className="mt-4">
        <UploadPending pendingUpload={pendingUpload} />
      </div>
    </div>
  );
}
