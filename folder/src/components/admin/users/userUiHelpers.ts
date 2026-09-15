export function labelRole(role: string) {
  return role === "data_entry" ? "Data Entry" : role.charAt(0).toUpperCase() + role.slice(1);
}
