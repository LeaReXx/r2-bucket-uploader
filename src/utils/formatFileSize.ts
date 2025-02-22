
/**
 * Formats a file size given in bytes into a human-readable string (KB, MB, or GB).
 * @param bytes - The file size in bytes.
 * @returns The formatted file size as a string.
 */
export const formatFileSize = (bytes: number) => {
  if (bytes < 1048576) return (bytes / 1024).toFixed() + " KB";
  if (bytes < 1073741824) return (bytes / 1048576).toFixed(2) + " MB";
  return (bytes / 1073741824).toFixed(2) + " GB";
};
