const BLOCKED_DOMAINS = new Set([
  "example.com",
  "example.org",
  "example.net",
  "test.com",
  "invalid",
]);

export function isDeliverableEmail(email: string) {
  const value = String(email || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return false;
  const domain = value.split("@")[1] || "";
  return !BLOCKED_DOMAINS.has(domain);
}

export function explainMailFailure(message: string) {
  const text = message || "Email failed";
  if (/550|mailbox does not exist|recipients were rejected/i.test(text)) {
    return "That mailbox does not exist. Enter a live customer email (Gmail, Outlook, etc.). Addresses like @example.com cannot receive mail.";
  }
  return text;
}
