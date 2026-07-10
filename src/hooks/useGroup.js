import { useEffect, useState, useCallback } from "react";
import {
  doc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { db } from "../firebase";
import { uploadToCloudinary } from "../utils/cloudinary";
import {
  calculateBalances,
  simplifyDebts,
  mergeSettlementPaidState,
} from "../utils/splitCalculator";

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

  const groupRef = groupId ? doc(db, "groups", groupId) : null;

  const updateGroupName = useCallback(
    async (name) => {
      await updateDoc(groupRef, { name });
    },
    [groupRef]
  );

  const addMember = useCallback(
    async (name) => {
      const newMember = { id: uuidv4(), name, bank: null };
      const members = [...(group?.members ?? []), newMember];
      await updateDoc(groupRef, { members });
    },
    [group, groupRef]
  );

  const removeMember = useCallback(
    async (memberId) => {
      const members = (group?.members ?? []).filter((m) => m.id !== memberId);
      // Xóa luôn khoản chi liên quan tới member này khỏi paidBy/splitAmong để tránh dữ liệu mồ côi.
      const expenses = (group?.expenses ?? []).map((e) => ({
        ...e,
        paidBy: e.paidBy.filter((p) => p.memberId !== memberId),
        splitAmong: e.splitAmong.filter((s) => s.memberId !== memberId),
      }));
      const settlements = recomputeSettlements(members, expenses, group?.settlements);
      await updateDoc(groupRef, { members, expenses, settlements });
    },
    [group, groupRef]
  );

  const updateMemberBank = useCallback(
    async (memberId, bank) => {
      const members = (group?.members ?? []).map((m) =>
        m.id === memberId ? { ...m, bank } : m
      );
      await updateDoc(groupRef, { members });
    },
    [group, groupRef]
  );

  const uploadBillImage = useCallback(
    async (file) => {
      return uploadToCloudinary(file);
    },
    []
  );

  const addExpense = useCallback(
    async (expenseInput) => {
      const newExpense = {
        id: uuidv4(),
        createdAt: Date.now(),
        billImageUrl: null,
        ...expenseInput,
      };
      const expenses = [...(group?.expenses ?? []), newExpense];
      const settlements = recomputeSettlements(group?.members ?? [], expenses, group?.settlements);
      await updateDoc(groupRef, { expenses, settlements });
    },
    [group, groupRef]
  );

  const updateExpense = useCallback(
    async (expenseId, changes) => {
      const expenses = (group?.expenses ?? []).map((e) =>
        e.id === expenseId ? { ...e, ...changes } : e
      );
      const settlements = recomputeSettlements(group?.members ?? [], expenses, group?.settlements);
      await updateDoc(groupRef, { expenses, settlements });
    },
    [group, groupRef]
  );

  const deleteExpense = useCallback(
    async (expenseId) => {
      const expenses = (group?.expenses ?? []).filter((e) => e.id !== expenseId);
      const settlements = recomputeSettlements(group?.members ?? [], expenses, group?.settlements);
      await updateDoc(groupRef, { expenses, settlements });
    },
    [group, groupRef]
  );

  const toggleSettlementPaid = useCallback(
    async (settlementId) => {
      const settlements = (group?.settlements ?? []).map((s) =>
        s.id === settlementId ? { ...s, paid: !s.paid } : s
      );
      await updateDoc(groupRef, { settlements });
    },
    [group, groupRef]
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
