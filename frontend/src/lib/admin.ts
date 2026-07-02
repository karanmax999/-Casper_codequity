export function isAdmin(email: string | undefined | null): boolean {
  if (!email) return false;
  const emailLower = email.toLowerCase();
  return (
    emailLower.includes("admin") ||
    emailLower === "karanmax999@gmail.com" ||
    emailLower === "anzzuel@gmail.com" ||
    emailLower === "karan123456789098765@gmail.com"
  );
}
