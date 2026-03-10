export const getProfileImage = (path: string | null | undefined, username: string = "User") => {
  if (!path) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random&color=fff`;
  }

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const storageUrl = import.meta.env.VITE_STORAGE_URL || "http://localhost:8000/storage/";
  
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;

  return `${storageUrl}${cleanPath}`;
};