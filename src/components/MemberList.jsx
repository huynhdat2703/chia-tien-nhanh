import { useState } from "react";
import { VIETNAMESE_BANKS } from "../utils/vietnameseBanks";
import { withErrorAlert } from "../utils/withErrorAlert";

export default function MemberList({ members, isEditor, payerMemberIds, onAddMember, onRemoveMember, onUpdateBank }) {
  const [name, setName] = useState("");
  const [editingBankId, setEditingBankId] = useState(null);
  const [bankForm, setBankForm] = useState({ bankCode: "", accountNumber: "", accountName: "" });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    withErrorAlert(() => onAddMember(name.trim()), "Không thể thêm thành viên.");
    setName("");
  };

  const startEditBank = (member) => {
    setEditingBankId(member.id);
    setBankForm(member.bank ?? { bankCode: "", accountNumber: "", accountName: "" });
  };

  const saveBank = (memberId) => {
    withErrorAlert(
      () => onUpdateBank(memberId, bankForm.bankCode && bankForm.accountNumber ? bankForm : null),
      "Không thể lưu thông tin ngân hàng."
    );
    setEditingBankId(null);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900">Người tham gia</h2>
        <span className="text-xs bg-gray-100 text-gray-600 rounded-full px-2.5 py-1">
          {members.length} người
        </span>
      </div>

      {isEditor && (
        <form onSubmit={handleAdd} className="flex gap-2 mb-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ví dụ: An"
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg px-4 py-2 shrink-0"
          >
            + Thêm
          </button>
        </form>
      )}

      <div className="space-y-2">
        {members.map((member) => (
          <div key={member.id} className="rounded-lg border border-gray-200 px-3 py-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{member.name}</p>
                {member.bank && (
                  <p className="text-xs text-gray-500">
                    {VIETNAMESE_BANKS.find((b) => b.code === member.bank.bankCode)?.name ?? member.bank.bankCode} · {member.bank.accountNumber}
                  </p>
                )}
              </div>
              {isEditor && (
                <div className="flex items-center gap-2">
                  {payerMemberIds.has(member.id) && (
                    <button
                      onClick={() => startEditBank(member)}
                      title="Thông tin ngân hàng (người đã ứng tiền)"
                      className="text-gray-400 hover:text-emerald-600 text-lg"
                    >
                      🏦
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (window.confirm(`Xóa "${member.name}" khỏi nhóm? Các khoản chi liên quan sẽ được cập nhật lại.`)) {
                        withErrorAlert(() => onRemoveMember(member.id), "Không thể xóa thành viên.");
                      }
                    }}
                    title="Xóa"
                    className="text-gray-400 hover:text-red-500 text-lg"
                  >
                    🗑
                  </button>
                </div>
              )}
            </div>

            {editingBankId === member.id && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                <select
                  value={bankForm.bankCode}
                  onChange={(e) => setBankForm({ ...bankForm, bankCode: e.target.value })}
                  className="col-span-2 rounded-lg border border-gray-300 px-2 py-1.5 text-xs"
                >
                  <option value="">-- Chọn ngân hàng --</option>
                  {VIETNAMESE_BANKS.map((b) => (
                    <option key={b.code} value={b.code}>{b.name}</option>
                  ))}
                </select>
                <input
                  value={bankForm.accountNumber}
                  onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                  placeholder="Số tài khoản"
                  className="col-span-2 rounded-lg border border-gray-300 px-2 py-1.5 text-xs"
                />
                <input
                  value={bankForm.accountName}
                  onChange={(e) => setBankForm({ ...bankForm, accountName: e.target.value })}
                  placeholder="Tên chủ TK"
                  className="col-span-2 rounded-lg border border-gray-300 px-2 py-1.5 text-xs"
                />
                <div className="col-span-2 flex gap-2">
                  <button
                    onClick={() => saveBank(member.id)}
                    className="flex-1 bg-emerald-600 text-white text-xs font-medium rounded-lg py-1.5"
                  >
                    Lưu
                  </button>
                  <button
                    onClick={() => setEditingBankId(null)}
                    className="flex-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg py-1.5"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {members.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">Chưa có thành viên nào.</p>
        )}
      </div>
    </div>
  );
}
