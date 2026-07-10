export default function BalanceTable({ members, balances }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="font-semibold text-gray-900 mb-4">Chi tiết</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-100">
              <th className="pb-2 font-normal">Người</th>
              <th className="pb-2 font-normal text-right">Đã trả</th>
              <th className="pb-2 font-normal text-right">Phải chịu</th>
            </tr>
          </thead>
          <tbody>
            {balances.map((b) => (
              <tr key={b.memberId} className="border-b border-gray-50 last:border-0">
                <td className="py-2 font-medium text-gray-900 whitespace-nowrap">
                  {members.find((m) => m.id === b.memberId)?.name}
                </td>
                <td className="py-2 text-right text-gray-500 whitespace-nowrap">{b.paid.toLocaleString("vi-VN")} đ</td>
                <td className="py-2 text-right text-gray-900 whitespace-nowrap">{b.owed.toLocaleString("vi-VN")} đ</td>
              </tr>
            ))}
            {balances.length === 0 && (
              <tr>
                <td colSpan={3} className="py-4 text-center text-gray-400">
                  Chưa có dữ liệu.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
