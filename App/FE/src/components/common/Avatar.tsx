import { getProfileImage } from "../../utils/imageHelper";

interface AvatarProps {
  src?: string | null;
  username?: string;
  className?: string;
}

export default function Avatar({ src, username, className = "size-10" }: AvatarProps) {
  const imageUrl = getProfileImage(src, username);

  return (
    <div className={`relative inline-block overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800 ${className}`}>
      <img
        src={imageUrl}
        alt={username || "User Avatar"}
        className="h-full w-full object-cover"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(username || "U")}&background=random`;
        }}
      />
    </div>
  );
}