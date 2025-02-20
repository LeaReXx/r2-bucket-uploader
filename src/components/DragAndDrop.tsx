import Image from "next/image";
import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";

const DragAndDrop = () => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log(acceptedFiles);
    return acceptedFiles;
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div
      {...getRootProps()}
      className={`w-10/12 max-w-[700px] h-[300px] flex items-center justify-center text-white  mx-auto rounded-lg py-4 px-2 cursor-pointer border-dashed border-2 duration-150 ${
        isDragActive
          ? "border-gray-200 bg-white/20"
          : "border-gray-400 bg-white/10"
      }`}
    >
      <input {...getInputProps()} />
      <div className="text-center">
        <div className="w-fit mx-auto">
          <Image
            src="/upload.svg"
            className="text-white"
            width={100}
            height={100}
            quality={100}
            alt="upload icon"
          />
        </div>
        {isDragActive ? (
          <div>Drop it to upload</div>
        ) : (
          <div>
            <p>Drag or Drop file(s) here</p>
            <p className="text-sm my-2 text-opacity-80 text-white">or</p>
            <p className="py-1 bg-black/90 hover:bg-black duration-150 w-fit mx-auto px-2 rounded-md font-light">
              Browse file(s)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
export default DragAndDrop;
