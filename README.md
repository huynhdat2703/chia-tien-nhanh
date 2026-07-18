# 💵 Share Bill Online

Công cụ chia tiền nhóm — tạo 1 lần, **gửi link cho cả nhóm**, mọi người cùng xem kết quả real-time. Không cần cài app, không cần đăng ký tài khoản.

**Demo:** https://chia-tien-nhanh.vercel.app

## Khác gì so với các app chia tiền khác?

Hầu hết app chia tiền phổ biến hiện nay chỉ chạy **offline trên máy của người tạo** — muốn cho người khác xem kết quả phải chụp màn hình hoặc gõ lại tay. Share Bill Online làm khác:

- **Chia sẻ bằng link, không phải ảnh chụp màn hình.** Người tạo bấm 1 nút, gửi link vào nhóm chat — ai cũng mở xem được ngay, số liệu luôn khớp với bản gốc.
- **Real-time.** Người tạo thêm/sửa khoản chi, mọi người đang mở link đều thấy cập nhật ngay lập tức, không cần refresh hay gửi lại ảnh mới.
- **Phân quyền rõ ràng.** Chỉ người tạo (giữ link chỉnh sửa) mới thêm/sửa/xóa được; người còn lại chỉ xem — tránh tình trạng ai cũng sửa loạn số liệu.
- **Không cần cài đặt hay đăng ký.** Mở link bằng trình duyệt là dùng được ngay, kể cả trên điện thoại.

## Tính năng

- Thêm thành viên, thêm khoản chi với **chia đều hoặc chia tùy chỉnh** theo từng người (phù hợp trường hợp người về sớm/ăn ít hơn...)
- **Nhiều người cùng ứng tiền** cho 1 khoản chi (không giới hạn 1 người trả)
- Upload **ảnh hóa đơn** kèm mỗi khoản chi (tự nén ảnh trước khi upload để tiết kiệm dung lượng)
- Tự động tính toán và **rút gọn số giao dịch cần thanh toán** (thuật toán debt simplification — thay vì mỗi người trả riêng cho từng người, chỉ cần số giao dịch tối thiểu)
- **Mã QR chuyển khoản** (VietQR) sinh tự động theo đúng ngân hàng + số tiền + nội dung, quét là chuyển được luôn
- Đánh dấu từng giao dịch **đã thanh toán**
- Sửa/xóa thành viên và khoản chi sau khi tạo (có xác nhận trước khi xóa, và tự cảnh báo nếu xóa sẽ làm sai lệch số liệu)

## Cách dùng

1. Vào trang chủ, đặt tên nhóm (VD: "Ăn trưa 20/7"), bấm **Tạo nhóm**
2. Thêm tên các thành viên tham gia
3. Thêm từng khoản chi: mô tả, số tiền, ai đã trả, chia cho những ai
4. Xem kết quả tự động ở cột bên phải — ai nợ ai bao nhiêu, quét QR để chuyển khoản
5. Bấm **Copy link xem**, gửi vào nhóm chat để mọi người theo dõi
6. Giữ **link chỉnh sửa** (có sẵn trên thanh địa chỉ) cho riêng mình — đây là link duy nhất có quyền sửa

> ⚠️ **Lưu ý quan trọng:** Ai có link chỉnh sửa đều sửa được dữ liệu — không có xác thực tài khoản. Chỉ chia sẻ link chỉnh sửa cho người bạn tin tưởng, và không đăng link đó công khai. Link xem (không có phần `?token=...`) an toàn để gửi rộng rãi.

## Công nghệ sử dụng

- **Frontend**: React 19 + Vite + Tailwind CSS
- **Lưu trữ dữ liệu**: Firebase Firestore
- **Lưu ảnh hóa đơn**: Cloudinary 
- **Hosting**: Vercel 
- **QR chuyển khoản**: VietQR 

## Phát triển local

### Yêu cầu
- Node.js 20+
- Tài khoản [Firebase](https://console.firebase.google.com) (Firestore) và [Cloudinary](https://cloudinary.com) (free tier)

### Cài đặt

```bash
npm install
cp .env.example .env
```

Điền thông tin vào `.env`:
- **Firebase**: Console → Project settings → General → phần "Your apps" (web app config)
- **Cloudinary**: Dashboard lấy Cloud name; Settings → Upload → Upload presets → tạo preset mới với **Signing Mode = Unsigned**

```bash
npm run dev
```

### Deploy Firestore rules

Copy nội dung `firestore.rules` vào Firebase Console → Firestore Database → Rules → Publish.

> Rules hiện tại cho phép đọc/ghi công khai (bảo mật ở mức UI qua `editToken` trong URL, không có xác thực server-side thật). Phù hợp cho công cụ nội bộ team, không phù hợp cho dữ liệu nhạy cảm cao. Xem chi tiết trong `firestore.rules`.

### Build production

```bash
npm run build
```

## Cấu trúc dự án

```
src/
  firebase.js              # Khởi tạo Firebase app
  App.jsx                  # Routing: "/" tạo nhóm, "/g/:groupId" xem/sửa nhóm
  pages/
    CreateGroup.jsx         # Tạo nhóm mới
    GroupPage.jsx            # Trang chính hiển thị/quản lý nhóm
  components/                # UI components (MemberList, ExpenseForm, SettlementList...)
  hooks/
    useGroup.js              # CRUD Firestore qua transaction, tính toán lại settlements
  utils/
    splitCalculator.js       # Logic chia tiền, tính balance, rút gọn giao dịch
    vietqr.js / vietnameseBanks.js  # Sinh QR chuyển khoản
    cloudinary.js / compressImage.js  # Upload & nén ảnh hóa đơn
```

## Giới hạn đã biết

- Không có tài khoản đăng nhập — phân quyền hoàn toàn dựa vào việc giữ kín link chỉnh sửa
- Chỉ hỗ trợ VND và ngân hàng/ví điện tử Việt Nam

---

Phát triển bởi Jay.

[![💵 Share Bill Online - Launched on J2TEAM Launch](https://launch.j2team.dev/badge/chia-tien-nhanh-share-bill-online/dark)](https://launch.j2team.dev/products/chia-tien-nhanh-share-bill-online?utm_source=badge-launched&utm_medium=badge&utm_campaign=badge-chia-tien-nhanh-share-bill-online)
