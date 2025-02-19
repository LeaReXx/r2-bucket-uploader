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
      console.error("No file selected for upload.");
    }
  };

  const startUpload = async (file: File) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/api/upload`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          endpoint: "create-multipart-upload",
          file: { name: file.name },
          contentType: file.type,
        }),
      }
    );
    const data = await response.json();
    return data; // { uploadId, key }
  };

  const uploadParts = async (
    file: File,
    uploadId: string,
    key: string,
    onProgress: (progress: number) => void // تابع callback برای به‌روزرسانی پیشرفت
  ) => {
    const chunkSize = 5 * 1024 * 1024; // 5MB
    const totalChunks = Math.ceil(file.size / chunkSize);
    const parts = [];

    for (let i = 0; i < totalChunks; i++) {
      const chunk = file.slice(i * chunkSize, (i + 1) * chunkSize);
      const partNumber = i + 1;

      // دریافت URL امضا شده برای آپلود پارت
      const signResponse = await fetch(
        `${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/api/upload`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            endpoint: "sign-part",
            key,
            uploadId,
            partNumber,
          }),
        }
      );
      const { url } = await signResponse.json();

      // آپلود پارت
      const uploadResponse = await fetch(url, {
        method: "PUT",
        body: chunk,
      });
      const etag = uploadResponse.headers.get("ETag");

      if (etag) {
        parts.push({ ETag: etag, PartNumber: partNumber });
      }

      // محاسبه درصد پیشرفت
      const progress = Math.round((partNumber / totalChunks) * 100);
      onProgress(progress); // ارسال درصد پیشرفت به تابع callback
    }

    return parts;
  };

  const completeUpload = async (
    uploadId: string,
    key: string,
    parts: any[]
  ) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/api/upload`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          endpoint: "complete-multipart-upload",
          key,
          uploadId,
          parts,
        }),
      }
    );
    const data = await response.json();
    return data;
  };

  const uploadFile = async (file: File) => {
    try {
      // شروع آپلود
      const { uploadId, key } = await startUpload(file);

      // آپلود پارت‌ها با ردیابی پیشرفت
      const parts = await uploadParts(file, uploadId, key, (progress) => {
        console.log(`پیشرفت آپلود: ${progress}%`);
        // می‌توانید این مقدار را در UI نمایش دهید (مثلاً با یک نوار پیشرفت)
      });

      // تکمیل آپلود
      const result = await completeUpload(uploadId, key, parts);
      console.log("آپلود با موفقیت انجام شد:", result);
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
