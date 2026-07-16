import { Avatar } from "@mui/material";
import { getInitials, getColorFromName } from "@/utils/avatarUtils";

interface ProfileAvatarProps {
  name: string;
  imageUrl?: string;
  size?: number | string;
  variant?: "circular" | "rounded" | "square";
  sx?: any;
}

export default function ProfileAvatar({
  name,
  imageUrl,
  size = 40,
  variant = "rounded",
  sx,
}: ProfileAvatarProps) {
  const initials = getInitials(name);
  const bgColor = getColorFromName(name);

  // Construct image source if it's from server (relative path)
  const src =
    imageUrl && !imageUrl.startsWith("blob:") && !imageUrl.startsWith("http")
      ? `${import.meta.env.VITE_BASE_URL_IMAGE}/${imageUrl}`
      : imageUrl;

  return (
    <Avatar
      src={src}
      variant={variant}
      sx={{
        width: size,
        height: size,
        bgcolor: src ? "#ffffff" : bgColor,
        color: "var(--primary-color)", // Using primary color for text on light background
        fontSize: typeof size === "number" ? size * 0.4 : "inherit",
        fontWeight: 600,
        border: "1px solid #f0f0f0",
        borderRadius: variant === "circular" ? "50%" : "10px",
        ...sx,
      }}
    >
      {initials}
    </Avatar>
  );
}
