// Upload ảnh bill lên Cloudinary (free tier, unsigned upload preset, không cần thẻ tín dụng).
// Setup: tạo tài khoản tại cloudinary.com -> Settings -> Upload -> Add unsigned upload preset.
export async function uploadToCloudinary(file) {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error("Chưa cấu hình Cloudinary (VITE_CLOUDINARY_CLOUD_NAME / VITE_CLOUDINARY_UPLOAD_PRESET)");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", "chia-tien-nhanh/bills");

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Upload ảnh thất bại. Kiểm tra lại cấu hình Cloudinary.");
  }

  const data = await res.json();
  return data.secure_url;
}
