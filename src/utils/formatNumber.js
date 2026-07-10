export function formatNumber(value) {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("vi-VN");
}

export function parseNumber(formatted) {
  const digits = String(formatted ?? "").replace(/\D/g, "");
  return digits ? Number(digits) : 0;
}
