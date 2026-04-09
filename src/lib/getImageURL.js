export function getImageUrl(key) {
  if (!key) return null;
  return `${process.env.NEXT_PUBLIC_API_URL || "http://3.19.222.155:3000"}/users/profile-picture/${encodeURIComponent(key)}`;
}