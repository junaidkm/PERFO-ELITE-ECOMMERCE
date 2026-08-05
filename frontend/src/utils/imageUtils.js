export const getImageUrl = (url) => {
  if (!url) return "https://via.placeholder.com/300?text=No+Image";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("blob:") || url.startsWith("data:")) {
    return url;
  }
  const serverUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";
  const cleanPath = url.startsWith("/") ? url : `/${url}`;
  return `${serverUrl}${cleanPath}`;
};
