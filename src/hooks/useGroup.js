import { useEffect, useState, useCallback } from "react";
import {
  doc,
  onSnapshot,
  runTransaction,
  Timestamp,
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { db } from "../firebase";
import { uploadToCloudinary } from "../utils/cloudinary";
import {
  calculateBalances,
  simplifyDebts,
  mergeSettlementPaidState,
  redistributeAfterRemoval,
} from "../utils/splitCalculator";

export const TTL_DAYS = 3;

function nextExpiresAt() {
  return Timestamp.fromMillis(Date.now() + TTL_DAYS * 24 * 60 * 60 * 1000);
}

// Tính lại settlements từ members + expenses hiện tại, giữ trạng thái "đã trả" cũ nếu còn khớp.
function recomputeSettlements(members, expenses, oldSettlements) {
  const balances = calculateBalances(members, expenses);
  const newSettlements = simplifyDebts(balances);
  return mergeSettlementPaidState(newSettlements, oldSettlements ?? []);
}

export function useGroup(groupId) {
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!groupId) return;
    const groupRef = doc(db, "groups", groupId);
    const unsubscribe = onSnapshot(
      groupRef,
      (snap) => {
        if (snap.exists()) {
          setGroup({ id: snap.id, ...snap.data() });
        } else {
          setGroup(null);
          setError("Không tìm thấy nhóm này.");
        }
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [groupId]);

  // Đọc dữ liệu mới nhất trong transaction (không dùng state `group` cũ trong closure) để tránh
  // 2 người sửa gần như đồng thời ghi đè mất thay đổi của nhau.
  const mutate = useCallback(
    async (updater) => {
      const groupRef = doc(db, "groups", groupId);
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(groupRef);
        if (!snap.exists()) throw new Error("Nhóm không còn tồn tại.");
        const current = snap.data();
        const changes = updater(current);
        tx.update(groupRef, { ...changes, expiresAt: nextExpiresAt() });
      });
    },
    [groupId]
  );

  const updateGroupName = useCallback(
    (name) => mutate(() => ({ name })),
    [mutate]
  );

  const addMember = useCallback(
    (name) =>
      mutate((current) => ({
        members: [...(current.members ?? []), { id: uuidv4(), name, bank: null }],
      })),
    [mutate]
  );

  const removeMember = useCallback(
    (memberId) =>
      mutate((current) => {
        const members = (current.members ?? []).filter((m) => m.id !== memberId);

        // Dồn phần tiền của member bị xóa cho người còn lại trong từng khoản chi, giữ đúng
        // tổng paidBy/splitAmong == amount. Nếu họ là người trả/chia DUY NHẤT của 1 khoản chi,
        // chặn lại thay vì âm thầm làm sai lệch số liệu — yêu cầu xóa/sửa khoản chi đó trước.
        const blocked = [];
        const expenses = (current.expenses ?? []).map((e) => {
          const paidBy = redistributeAfterRemoval(e.paidBy, memberId);
          const splitAmong = redistributeAfterRemoval(e.splitAmong, memberId);
          if (paidBy === null || splitAmong === null) {
            blocked.push(e.description);
            return e;
          }
          return { ...e, paidBy, splitAmong };
        });

        if (blocked.length > 0) {
          throw new Error(
            `Không thể xóa: đây là người trả/chia duy nhất của khoản chi "${blocked.join('", "')}". Hãy xóa hoặc sửa khoản chi đó trước.`
          );
        }

        const settlements = recomputeSettlements(members, expenses, current.settlements);
        return { members, expenses, settlements };
      }),
    [mutate]
  );

  const updateMemberBank = useCallback(
    (memberId, bank) =>
      mutate((current) => ({
        members: (current.members ?? []).map((m) => (m.id === memberId ? { ...m, bank } : m)),
      })),
    [mutate]
  );

  const uploadBillImage = useCallback((file) => uploadToCloudinary(file), []);

  const addExpense = useCallback(
    (expenseInput) =>
      mutate((current) => {
        const newExpense = {
          id: uuidv4(),
          createdAt: Date.now(),
          billImageUrl: null,
          ...expenseInput,
        };
        const expenses = [...(current.expenses ?? []), newExpense];
        const settlements = recomputeSettlements(current.members ?? [], expenses, current.settlements);
        return { expenses, settlements };
      }),
    [mutate]
  );

  const updateExpense = useCallback(
    (expenseId, changes) =>
      mutate((current) => {
        const expenses = (current.expenses ?? []).map((e) =>
          e.id === expenseId ? { ...e, ...changes } : e
        );
        const settlements = recomputeSettlements(current.members ?? [], expenses, current.settlements);
        return { expenses, settlements };
      }),
    [mutate]
  );

  const deleteExpense = useCallback(
    (expenseId) =>
      mutate((current) => {
        const expenses = (current.expenses ?? []).filter((e) => e.id !== expenseId);
        const settlements = recomputeSettlements(current.members ?? [], expenses, current.settlements);
        return { expenses, settlements };
      }),
    [mutate]
  );

  const toggleSettlementPaid = useCallback(
    (settlementId) =>
      mutate((current) => ({
        settlements: (current.settlements ?? []).map((s) =>
          s.id === settlementId ? { ...s, paid: !s.paid } : s
        ),
      })),
    [mutate]
  );

  return {
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
  };
}
