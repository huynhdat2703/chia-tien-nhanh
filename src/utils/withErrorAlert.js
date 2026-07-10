// Bọc 1 async action, hiện alert nếu lỗi thay vì để lỗi bị nuốt âm thầm (mất dữ liệu không rõ nguyên nhân).
export async function withErrorAlert(action, message = "Thao tác thất bại, vui lòng thử lại.") {
  try {
    await action();
  } catch (err) {
    alert(`${message}\n${err.message}`);
  }
}
