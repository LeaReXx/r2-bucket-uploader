import Image from "next/image";
import React, { Dispatch, SetStateAction, useCallback } from "react";
import { useDropzone } from "react-dropzone";

const DragAndDrop = ({
  setSelectedFile,
}: {
  setSelectedFile: Dispatch<SetStateAction<File[] | null>>;
}) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setSelectedFile((prev) => [...(prev ?? []), ...acceptedFiles]);
    },
    [setSelectedFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div
      {...getRootProps()}
      className={`flex items-center justify-center text-white border-white rounded-lg py-4 px-2 cursor-pointer border-dashed border-2 duration-150 ${
        isDragActive
          ? "border-opacity-90 bg-white/20 backdrop-blur-[2px]"
          : "border-opacity-50 bg-white/10 backdrop-blur-[1px]"
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
            <p className="py-1 bg-black/80 hover:bg-black shadow-sm duration-150 w-fit mx-auto px-2 rounded-md font-light">
              Browse file(s)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
export default DragAndDrop;
