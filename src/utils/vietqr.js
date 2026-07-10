// Bỏ dấu tiếng Việt — nội dung chuyển khoản ngân hàng thường chỉ nhận ký tự không dấu.
function removeDiacritics(str) {
  return str
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

// Build URL ảnh VietQR (free, không cần API key) để quét chuyển khoản nhanh.
// Docs: https://www.vietqr.io/danh-sach-api/
export function buildVietQrUrl({ bankCode, accountNumber, amount, addInfo, accountName }) {
  if (!bankCode || !accountNumber) return null;

  const params = new URLSearchParams();
  if (amount) params.set("amount", String(amount));
  if (addInfo) params.set("addInfo", removeDiacritics(addInfo));
  if (accountName) params.set("accountName", accountName);

  return `https://img.vietqr.io/image/${bankCode}-${accountNumber}-compact2.png?${params.toString()}`;
}
