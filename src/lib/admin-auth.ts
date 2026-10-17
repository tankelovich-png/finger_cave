export function isAdminAuthorized(request: Request): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const provided = request.headers.get("x-admin-password");
  return provided === expected;
}
