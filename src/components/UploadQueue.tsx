import { formatFileSize } from "@/utils/formatFileSize";

const UploadQueue = ({ selectedFile }: { selectedFile: File[] | null }) => {
  return (
    <div className="mt-4 space-y-3">
      {selectedFile &&
        selectedFile.map((file, index) => (
          <div
            key={index}
            className="bg-gradient-to-r from-gray-900/50 to-gray-900/10 backdrop-blur-[1px] text-sm flex flex-col sm:items-center gap-2 sm:gap-0 sm:flex-row justify-between rounded-md py-2 px-2 text-white"
          >
            <div>
              <p className="truncate w-[250px] md:w-[450px]">{file.name}</p>
            </div>
            <div className="flex justify-between items-center sm:gap-5">
              <span>{formatFileSize(file.size)}</span>
              <span className="bg-yellow-300/90 py-1 px-2 text-black rounded">
                <i className="fa-light fa-alarm-clock text-md"></i> In Queue
              </span>
            </div>
          </div>
        ))}
    </div>
  );
};

export default UploadQueue;
