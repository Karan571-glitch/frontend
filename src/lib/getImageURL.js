export function getImageUrl(key) {
  if (!key) return null;
  return `${process.env.NEXT_PUBLIC_API_URL || "https://api.bluegiantbackend.xyz"}/users/profile-picture/${encodeURIComponent(key)}`;
}
