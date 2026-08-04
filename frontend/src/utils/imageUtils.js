export const getImageUrl = (url) => {
  if (!url) return "https://via.placeholder.com/300?text=No+Image";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("blob:") || url.startsWith("data:")) {
    return url;
  }
  const cleanPath = url.startsWith("/") ? url : `/${url}`;
  return `http://localhost:3000${cleanPath}`;
};
