import { useState } from "react";
import { buildVietQrUrl } from "../utils/vietqr";
import { VIETNAMESE_BANKS } from "../utils/vietnameseBanks";
import { withErrorAlert } from "../utils/withErrorAlert";

function nameOf(members, id) {
  return members.find((m) => m.id === id)?.name ?? "?";
}

export default function SettlementList({ groupName, members, settlements, isEditor, onTogglePaid }) {
  const [qrForId, setQrForId] = useState(null);
  const paidCount = settlements.filter((s) => s.paid).length;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900">Đề xuất thanh toán</h2>
        <span className="text-xs bg-gray-100 text-gray-600 rounded-full px-2.5 py-1">
          {paidCount}/{settlements.length} đã trả
        </span>
      </div>

      <div className="space-y-2">
        {settlements.map((s) => {
          const toMember = members.find((m) => m.id === s.toMemberId);
          const fromMember = members.find((m) => m.id === s.fromMemberId);
          const isWallet = VIETNAMESE_BANKS.find((b) => b.code === toMember?.bank?.bankCode)?.isWallet;
          const qrUrl = toMember?.bank
            ? buildVietQrUrl({
                bankCode: toMember.bank.bankCode,
                accountNumber: toMember.bank.accountNumber,
                accountName: toMember.bank.accountName,
                amount: s.amount,
                addInfo: `${fromMember?.name} chuyen ${toMember.name} tien ${groupName}`,
              })
            : null;

          return (
            <div key={s.id} className="rounded-lg border border-gray-200 px-3 py-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm">
                  <span className="font-medium text-gray-900">{fromMember?.name}</span>
                  <span className="text-gray-400 mx-1">→</span>
                  <span className="font-medium text-gray-900">{toMember?.name}</span>
                </p>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-semibold text-emerald-700">
                    {s.amount.toLocaleString("vi-VN")} đ
                  </span>
                  {isEditor && (
                    <button
                      onClick={() => withErrorAlert(() => onTogglePaid(s.id), "Không thể cập nhật trạng thái.")}
                      className={`text-xs font-medium rounded-lg px-2.5 py-1 border ${
                        s.paid
                          ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                          : "bg-gray-50 border-gray-200 text-gray-600"
                      }`}
                    >
                      {s.paid ? "✓ Đã trả" : "Đánh dấu đã trả"}
                    </button>
                  )}
                  {!isEditor && s.paid && (
                    <span className="text-xs font-medium text-emerald-700">✓ Đã trả</span>
                  )}
                  {qrUrl && (
                    <button
                      onClick={() => setQrForId(qrForId === s.id ? null : s.id)}
                      title="Hiện QR chuyển khoản"
                      className={`flex items-center gap-1 text-xs font-medium rounded-lg px-2.5 py-1 border ${
                        qrForId === s.id
                          ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                          : "bg-white border-gray-200 text-gray-600 hover:border-emerald-300 hover:text-emerald-700"
                      }`}
                    >
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="7" height="7" rx="1" />
                        <rect x="14" y="3" width="7" height="7" rx="1" />
                        <rect x="3" y="14" width="7" height="7" rx="1" />
                        <path d="M14 14h3v3h-3zM20 14v3M14 20h3M20 20v0.01" />
                      </svg>
                      QR
                    </button>
                  )}
                </div>
              </div>
              {qrForId === s.id && qrUrl && (
                <div className="mt-3 flex flex-col items-center gap-2">
                  <img src={qrUrl} alt={`QR chuyển khoản cho ${toMember?.name}`} className="w-48 rounded-lg border border-gray-200" />
                  {isWallet && (
                    <p className="text-xs text-amber-600 text-center max-w-xs">
                      Đây là QR chuyển khoản liên ngân hàng tới ví điện tử — quét bằng <b>app ngân hàng</b>, không dùng app ví để quét.
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {settlements.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">Chưa có giao dịch cần thanh toán.</p>
        )}
      </div>
    </div>
  );
}
