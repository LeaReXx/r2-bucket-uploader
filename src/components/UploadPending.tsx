import { UploadPendingItemType } from "@/app/page";
import { formatFileSize } from "@/utils/formatFileSize";

const UploadPending = ({
  pendingUpload,
}: {
  pendingUpload: UploadPendingItemType[] | null;
}) => {
  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
  };

  return (
    <div className="space-y-3 mb-10">
      {pendingUpload &&
        pendingUpload.map((item) => (
          <div
            key={item.uploadId}
            className={`bg-gradient-to-r from-gray-900/50 ${
              item.status === "uploading"
                ? "to-yellow-500/10"
                : "to-green-500/10"
            } backdrop-blur-[1px] text-sm flex flex-col sm:items-center gap-2 sm:gap-0 sm:flex-row justify-between rounded-md py-2 px-2 text-white`}
          >
            <div>
              <p className="truncate w-[250px] md:w-[450px]">{item.fileName}</p>
            </div>
            <div className="flex justify-between items-center sm:gap-5">
              <span>{formatFileSize(item.size)}</span>
              {item.status === "uploading" ? (
                <span className="bg-yellow-600/90 py-1 px-2 text-white rounded flex gap-1 items-center">
                  <i className="fa-light fa-alarm-clock text-md"></i> Uploading
                </span>
              ) : (
                <div className="flex gap-2">
                  <span className="bg-green-600/90 py-1 px-2 text-white rounded flex gap-1 items-center">
                    <i className="fa-light fa-check text-md"></i>
                    Completed
                  </span>
                  <button
                    className="bg-white/30 flex items-center justify-center py-1 px-2 text-white rounded active:scale-95 duration-100"
                    onClick={() => handleCopy(item.path!)}
                    title="Copy"
                  >
                    <i className="fa-regular fa-copy text-lg"></i>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
    </div>
  );
};

export default UploadPending;
