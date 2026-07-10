import { useState } from "react";
import MoneyInput from "./MoneyInput";
import { withErrorAlert } from "../utils/withErrorAlert";
import { sumAmounts } from "../utils/splitCalculator";

function nameOf(members, id) {
  return members.find((m) => m.id === id)?.name ?? "?";
}

export default function ExpenseList({ expenses, members, isEditor, onUpdateExpense, onDeleteExpense }) {
  const [editingId, setEditingId] = useState(null);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState(0);
  const [payerId, setPayerId] = useState("");
  const [splitAmounts, setSplitAmounts] = useState({});

  const startEdit = (expense) => {
    setEditingId(expense.id);
    setDescription(expense.description);
    setAmount(expense.amount);
    setPayerId(expense.paidBy.length === 1 ? expense.paidBy[0].memberId : "");
    setSplitAmounts(Object.fromEntries(expense.splitAmong.map((s) => [s.memberId, s.amount])));
  };

  const saveEdit = (expense) => {
    const splitAmong = expense.splitAmong.map((s) => ({
      memberId: s.memberId,
      amount: Number(splitAmounts[s.memberId]) || 0,
    }));
    const total = sumAmounts(splitAmong);
    if (total !== amount) return;
    if (!description.trim() || amount <= 0) return;

    const changes = {
      description: description.trim(),
      amount,
      splitAmong,
    };
    // Chỉ cho sửa người trả khi khoản chi vốn chỉ có 1 người trả — nhiều người trả thì giữ nguyên,
    // vì việc chia lại tiền giữa nhiều người trả cần luồng riêng phức tạp hơn.
    if (expense.paidBy.length === 1 && payerId) {
      changes.paidBy = [{ memberId: payerId, amount }];
    }

    withErrorAlert(() => onUpdateExpense(expense.id, changes), "Không thể lưu khoản chi.");
    setEditingId(null);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900">Khoản chi</h2>
        <span className="text-xs bg-gray-100 text-gray-600 rounded-full px-2.5 py-1">
          {expenses.length} khoản
        </span>
      </div>

      <div className="space-y-3">
        {expenses.map((expense) => {
          const editTotal = sumAmounts(
            Object.entries(splitAmounts).map(([memberId, v]) => ({ memberId, amount: Number(v) || 0 }))
          );
          return (
            <div key={expense.id} className="rounded-lg border border-gray-200 p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900">{expense.description}</p>
                  <p className="text-lg font-semibold text-emerald-700">
                    {expense.amount.toLocaleString("vi-VN")} đ
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Trả bởi: {expense.paidBy.map((p) => nameOf(members, p.memberId)).join(", ")}
                  </p>
                  <p className="text-xs text-gray-500">
                    Chia: {expense.splitAmong.map((s) => nameOf(members, s.memberId)).join(", ")}
                  </p>
                  {expense.billImageUrl && (
                    <a
                      href={expense.billImageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block mt-2"
                    >
                      <img
                        src={expense.billImageUrl}
                        alt="Ảnh bill"
                        className="h-16 rounded-md border border-gray-200 object-cover"
                      />
                    </a>
                  )}
                </div>
                {isEditor && (
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => (editingId === expense.id ? setEditingId(null) : startEdit(expense))}
                      className="text-gray-400 hover:text-emerald-600"
                      title="Sửa khoản chi"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Xóa khoản chi "${expense.description}"?`)) {
                          withErrorAlert(() => onDeleteExpense(expense.id), "Không thể xóa khoản chi.");
                        }
                      }}
                      className="text-gray-400 hover:text-red-500"
                      title="Xóa"
                    >
                      🗑
                    </button>
                  </div>
                )}
              </div>

              {editingId === expense.id && (
                <div className="mt-3 border-t border-gray-100 pt-3 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Mô tả</label>
                    <input
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Số tiền (đ)</label>
                    <MoneyInput
                      value={amount}
                      onChange={setAmount}
                      className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-xs"
                    />
                  </div>
                  {expense.paidBy.length === 1 ? (
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Người trả</label>
                      <select
                        value={payerId}
                        onChange={(e) => setPayerId(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-xs"
                      >
                        {members.map((m) => (
                          <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400">
                      Khoản chi có nhiều người trả — xóa và tạo lại nếu cần đổi người trả.
                    </p>
                  )}

                  <div>
                    <p className="text-xs text-gray-500 mb-1.5">Mức chia từng người:</p>
                    <div className="space-y-2">
                      {expense.splitAmong.map((s) => (
                        <div key={s.memberId} className="flex items-center gap-2">
                          <span className="text-sm flex-1">{nameOf(members, s.memberId)}</span>
                          <MoneyInput
                            value={splitAmounts[s.memberId]}
                            onChange={(v) =>
                              setSplitAmounts({ ...splitAmounts, [s.memberId]: v })
                            }
                            className="w-28 rounded-lg border border-gray-300 px-2 py-1 text-xs"
                          />
                        </div>
                      ))}
                    </div>
                    <p className={`text-xs mt-1 ${editTotal === amount ? "text-gray-400" : "text-red-500"}`}>
                      Đã chia: {editTotal.toLocaleString("vi-VN")} đ / {amount.toLocaleString("vi-VN")} đ
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(expense)}
                      className="flex-1 bg-emerald-600 text-white text-xs font-medium rounded-lg py-1.5"
                    >
                      Lưu
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="flex-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg py-1.5"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {expenses.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">Chưa có khoản chi nào.</p>
        )}
      </div>
    </div>
  );
}
