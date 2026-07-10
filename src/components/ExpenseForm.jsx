import { useState, useMemo, useEffect } from "react";
import { splitEqually } from "../utils/splitCalculator";
import { compressImage } from "../utils/compressImage";
import MoneyInput from "./MoneyInput";

const emptyForm = () => ({
  description: "",
  amount: "",
  payerIds: [],
  splitIds: [],
  customSplit: false,
  customAmounts: {},
  multiPayer: false,
  payerAmounts: {},
});

export default function ExpenseForm({ members, onAddExpense, onUploadBillImage }) {
  const [form, setForm] = useState(emptyForm());
  const [billFile, setBillFile] = useState(null);
  const [billPreviewUrl, setBillPreviewUrl] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!billFile) {
      setBillPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(billFile);
    setBillPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [billFile]);

  const amountNum = Number(form.amount) || 0;

  const splitPreview = useMemo(() => {
    if (form.customSplit) {
      return form.splitIds.map((id) => ({ memberId: id, amount: Number(form.customAmounts[id]) || 0 }));
    }
    return splitEqually(amountNum, form.splitIds);
  }, [form.customSplit, form.splitIds, form.customAmounts, amountNum]);

  const splitTotal = splitPreview.reduce((sum, s) => sum + s.amount, 0);

  const payerPreview = useMemo(() => {
    if (form.multiPayer) {
      return form.payerIds.map((id) => ({ memberId: id, amount: Number(form.payerAmounts[id]) || 0 }));
    }
    return form.payerIds[0] ? [{ memberId: form.payerIds[0], amount: amountNum }] : [];
  }, [form.multiPayer, form.payerIds, form.payerAmounts, amountNum]);

  const payerTotal = payerPreview.reduce((sum, p) => sum + p.amount, 0);

  const toggleSplitMember = (id) => {
    setForm((f) => ({
      ...f,
      splitIds: f.splitIds.includes(id) ? f.splitIds.filter((x) => x !== id) : [...f.splitIds, id],
    }));
  };

  const toggleAllSplit = (checked) => {
    setForm((f) => ({ ...f, splitIds: checked ? members.map((m) => m.id) : [] }));
  };

  const togglePayer = (id) => {
    setForm((f) => ({
      ...f,
      payerIds: f.payerIds.includes(id) ? f.payerIds.filter((x) => x !== id) : [...f.payerIds, id],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.description.trim() || amountNum <= 0 || payerPreview.length === 0 || splitPreview.length === 0) return;
    if (form.customSplit && splitTotal !== amountNum) return;
    if (form.multiPayer && payerTotal !== amountNum) return;

    setSubmitting(true);
    let billImageUrl = null;
    if (billFile) {
      const compressed = await compressImage(billFile);
      billImageUrl = await onUploadBillImage(compressed);
    }

    await onAddExpense({
      description: form.description.trim(),
      amount: amountNum,
      paidBy: payerPreview,
      splitAmong: splitPreview,
      billImageUrl,
    });

    setForm(emptyForm());
    setBillFile(null);
    setSubmitting(false);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="font-semibold text-gray-900 mb-4">Thêm khoản chi</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
          <input
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Ví dụ: Ăn tối"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền (đ)</label>
          <MoneyInput
            value={form.amount}
            onChange={(v) => setForm({ ...form, amount: v })}
            placeholder="Ví dụ: 450.000"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700">Người đã trả</label>
            <label className="flex items-center gap-1.5 text-xs text-gray-500">
              <input
                type="checkbox"
                checked={form.multiPayer}
                onChange={(e) => setForm({ ...form, multiPayer: e.target.checked, payerIds: [] })}
              />
              Nhiều người trả
            </label>
          </div>

          {!form.multiPayer ? (
            <select
              value={form.payerIds[0] ?? ""}
              onChange={(e) => setForm({ ...form, payerIds: e.target.value ? [e.target.value] : [] })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">-- Chọn người trả --</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          ) : (
            <div className="space-y-2 border border-gray-200 rounded-lg p-3">
              {members.map((m) => (
                <div key={m.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.payerIds.includes(m.id)}
                    onChange={() => togglePayer(m.id)}
                  />
                  <span className="text-sm flex-1">{m.name}</span>
                  {form.payerIds.includes(m.id) && (
                    <MoneyInput
                      value={form.payerAmounts[m.id]}
                      onChange={(v) =>
                        setForm({ ...form, payerAmounts: { ...form.payerAmounts, [m.id]: v } })
                      }
                      placeholder="Số tiền"
                      className="w-28 rounded-lg border border-gray-300 px-2 py-1 text-xs"
                    />
                  )}
                </div>
              ))}
              <p className={`text-xs ${payerTotal === amountNum ? "text-gray-400" : "text-red-500"}`}>
                Đã nhập: {payerTotal.toLocaleString("vi-VN")} đ / {amountNum.toLocaleString("vi-VN")} đ
              </p>
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700">Người cùng chia</label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-xs text-gray-500">
                <input
                  type="checkbox"
                  checked={form.customSplit}
                  onChange={(e) => setForm({ ...form, customSplit: e.target.checked })}
                />
                Chia tùy chỉnh
              </label>
              <button type="button" onClick={() => toggleAllSplit(true)} className="text-xs text-emerald-600 font-medium">
                Tất cả
              </button>
              <button type="button" onClick={() => toggleAllSplit(false)} className="text-xs text-gray-500">
                Bỏ chọn
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 border border-gray-200 rounded-lg p-3">
            {members.map((m) => (
              <div key={m.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.splitIds.includes(m.id)}
                  onChange={() => toggleSplitMember(m.id)}
                />
                <span className="text-sm flex-1">{m.name}</span>
                {form.customSplit && form.splitIds.includes(m.id) && (
                  <MoneyInput
                    value={form.customAmounts[m.id]}
                    onChange={(v) =>
                      setForm({ ...form, customAmounts: { ...form.customAmounts, [m.id]: v } })
                    }
                    className="w-24 rounded-lg border border-gray-300 px-2 py-1 text-xs"
                  />
                )}
              </div>
            ))}
          </div>
          {form.customSplit && (
            <p className={`text-xs mt-1 ${splitTotal === amountNum ? "text-gray-400" : "text-red-500"}`}>
              Đã chia: {splitTotal.toLocaleString("vi-VN")} đ / {amountNum.toLocaleString("vi-VN")} đ
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh bill (tùy chọn)</label>

          {!billFile || !billPreviewUrl ? (
            <label
              htmlFor="bill-upload"
              className="flex flex-col items-center justify-center gap-1.5 border-2 border-dashed border-gray-300 rounded-lg py-6 cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/40 transition text-gray-500"
            >
              <span className="text-2xl">📷</span>
              <span className="text-sm font-medium text-gray-600">Bấm để chọn ảnh bill</span>
              <span className="text-xs text-gray-400">PNG, JPG...</span>
              <input
                id="bill-upload"
                type="file"
                accept="image/*"
                onChange={(e) => setBillFile(e.target.files?.[0] ?? null)}
                className="hidden"
              />
            </label>
          ) : (
            <div className="flex items-center gap-3 border border-gray-200 rounded-lg p-2">
              <img src={billPreviewUrl} alt="Xem trước ảnh bill" className="w-16 h-16 rounded-md object-cover shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-700 truncate">{billFile.name}</p>
                <p className="text-xs text-gray-400">{(billFile.size / 1024).toFixed(0)} KB</p>
              </div>
              <button
                type="button"
                onClick={() => setBillFile(null)}
                className="text-gray-400 hover:text-red-500 text-sm shrink-0 px-2"
              >
                Xóa
              </button>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium rounded-lg py-2.5 text-sm"
        >
          {submitting ? "Đang lưu..." : "+ Thêm khoản chi"}
        </button>
      </form>
    </div>
  );
}
