export default function ResultSummary({ totalExpense, memberCount, transactionCount, pendingCount }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="font-semibold text-gray-900 mb-4">Kết quả</h2>
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <p className="text-xs text-gray-500">Tổng chi</p>
          <p className="font-semibold text-gray-900 text-sm mt-1">
            {totalExpense.toLocaleString("vi-VN")} đ
          </p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <p className="text-xs text-gray-500">Số người</p>
          <p className="font-semibold text-gray-900 text-sm mt-1">{memberCount}</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <p className="text-xs text-gray-500">Giao dịch</p>
          <p className="font-semibold text-gray-900 text-sm mt-1">
            {transactionCount} <span className="text-gray-400 font-normal">({pendingCount} chưa trả)</span>
          </p>
        </div>
      </div>
    </div>
  );
}
