import { useEffect, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useGroup } from "../hooks/useGroup";
import { withErrorAlert } from "../utils/withErrorAlert";
import MemberList from "../components/MemberList";
import ExpenseForm from "../components/ExpenseForm";
import ExpenseList from "../components/ExpenseList";
import ResultSummary from "../components/ResultSummary";
import BalanceTable from "../components/BalanceTable";
import SettlementList from "../components/SettlementList";
import ShareLinkBox from "../components/ShareLinkBox";
import Footer from "../components/Footer";
import { calculateBalances } from "../utils/splitCalculator";

export default function GroupPage() {
  const { groupId } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const {
    group,
    loading,
    error,
    updateGroupName,
    addMember,
    removeMember,
    updateMemberBank,
    uploadBillImage,
    addExpense,
    updateExpense,
    deleteExpense,
    toggleSettlementPaid,
  } = useGroup(groupId);

  const [nameDraft, setNameDraft] = useState(null);
  const debounceRef = useRef(null);

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  const handleNameChange = (value) => {
    setNameDraft(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      withErrorAlert(() => updateGroupName(value), "Không thể lưu tên nhóm.");
    }, 500);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Đang tải...</div>;
  }

  if (error || !group) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        {error ?? "Không tìm thấy nhóm này."}
      </div>
    );
  }

  const isEditor = Boolean(token) && token === group.editToken;
  const totalExpense = group.expenses.reduce((sum, e) => sum + e.amount, 0);
  const balances = calculateBalances(group.members, group.expenses);
  const pendingSettlements = group.settlements.filter((s) => !s.paid).length;
  const payerMemberIds = new Set(
    group.expenses.flatMap((e) => e.paidBy.map((p) => p.memberId))
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white text-xl shrink-0">
              💵
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Chia tiền nhanh</p>
              {isEditor ? (
                <input
                  value={nameDraft ?? group.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="text-xl font-semibold text-gray-900 border-none outline-none bg-transparent -ml-1 px-1 rounded focus:bg-gray-100"
                />
              ) : (
                <h1 className="text-xl font-semibold text-gray-900">{group.name}</h1>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm">
              <p className="text-gray-500">Tổng chi</p>
              <p className="font-semibold text-gray-900">{totalExpense.toLocaleString("vi-VN")} đ</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm">
              <p className="text-gray-500">Thành viên</p>
              <p className="font-semibold text-gray-900">{group.members.length}</p>
            </div>
            <Link
              to="/"
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg px-4 py-2.5 shrink-0"
            >
              + Tạo nhóm mới
            </Link>
          </div>
        </div>
      </header>

      {isEditor && (
        <div className="max-w-6xl mx-auto px-4 pt-4">
          <ShareLinkBox groupId={group.id} />
        </div>
      )}
      {!isEditor && (
        <div className="max-w-6xl mx-auto px-4 pt-4">
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg px-4 py-2">
            Bạn đang xem ở chế độ chỉ đọc. Chỉ người tạo nhóm mới có thể chỉnh sửa.
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 w-full">
        <div className="space-y-6">
          <MemberList
            members={group.members}
            isEditor={isEditor}
            payerMemberIds={payerMemberIds}
            onAddMember={addMember}
            onRemoveMember={removeMember}
            onUpdateBank={updateMemberBank}
          />

          {isEditor && (
            <ExpenseForm
              members={group.members}
              onAddExpense={addExpense}
              onUploadBillImage={uploadBillImage}
            />
          )}

          <ExpenseList
            expenses={group.expenses}
            members={group.members}
            isEditor={isEditor}
            onUpdateExpense={updateExpense}
            onDeleteExpense={deleteExpense}
          />
        </div>

        <div className="space-y-6">
          <ResultSummary
            totalExpense={totalExpense}
            memberCount={group.members.length}
            transactionCount={group.settlements.length}
            pendingCount={pendingSettlements}
          />
          <BalanceTable members={group.members} balances={balances} />
          <SettlementList
            groupName={group.name}
            members={group.members}
            settlements={group.settlements}
            isEditor={isEditor}
            onTogglePaid={toggleSettlementPaid}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
