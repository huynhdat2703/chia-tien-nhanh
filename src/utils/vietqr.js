// Build URL ảnh VietQR (free, không cần API key) để quét chuyển khoản nhanh.
// Docs: https://www.vietqr.io/danh-sach-api/
export function buildVietQrUrl({ bankCode, accountNumber, amount, addInfo, accountName }) {
  if (!bankCode || !accountNumber) return null;

  const params = new URLSearchParams();
  if (amount) params.set("amount", String(amount));
  if (addInfo) params.set("addInfo", addInfo);
  if (accountName) params.set("accountName", accountName);

  return `https://img.vietqr.io/image/${bankCode}-${accountNumber}-compact2.png?${params.toString()}`;
}
