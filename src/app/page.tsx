"use client";
import { useState } from "react";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
  }

  const handleUpload = () => {
    if (selectedFile) {
      uploadFile(selectedFile);
    } else {
      alert("No file selected for upload!");
    }
  };

  const startUpload = async (
    file: File
  ): Promise<{ uploadId: string; key: string }> => {
    const formData = new FormData();
    formData.append("fileName", file.name);
    formData.append("fileType", file.type);
    formData.append("endPoint", "create-multipart-upload");
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/api/upload`,
      {
        method: "POST",
        body: formData,
      }
    );
    const data = await response.json();
    console.log(data);

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
      console.log("response =>", responseData);

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
  ): Promise<{ location: string }> => {
    const formData = new FormData();
    console.log(parts);

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

      const parts = await uploadParts(file, uploadId, key, (progress) => {
        console.log(`پیشرفت آپلود: ${progress}%`);
      });
      console.log(parts);

      const result = await completeUpload(uploadId, key, parts);
      console.log(result);
    } catch (error) {
      console.error("خطا در آپلود فایل:", error);
    }
  };

  return (
    <div className="flex items-center justify-center mt-24">
      <input
        type="file"
        className="border-2 border-white/40 hover:border-white/70 duration-100 ease-linear rounded-md p-2 cursor-pointer"
        onChange={handleFileChange}
      />
      <button
        className="ml-4 bg-blue-500 text-white rounded p-2"
        onClick={handleUpload}
      >
        Upload
      </button>
    </div>
  );
}
