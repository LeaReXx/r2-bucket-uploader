export const formatFileSize = (bytes: number) => {
  if (bytes < 1048576) return (bytes / 1024).toFixed() + " KB";
  if (bytes < 1073741824) return (bytes / 1048576).toFixed(2) + " MB";
  return (bytes / 1073741824).toFixed(2) + " GB";
};
