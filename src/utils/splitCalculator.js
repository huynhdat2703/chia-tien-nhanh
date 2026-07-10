// Chia đều số tiền cho danh sách memberIds, xử lý làm tròn để tổng khớp chính xác amount.
export function splitEqually(amount, memberIds) {
  const n = memberIds.length;
  if (n === 0) return [];
  const base = Math.floor(amount / n);
  const remainder = amount - base * n;
  return memberIds.map((memberId, i) => ({
    memberId,
    amount: base + (i < remainder ? 1 : 0),
  }));
}

// Tính balance (đã trả - phải chịu) cho mỗi member dựa trên toàn bộ expenses.
export function calculateBalances(members, expenses) {
  const paid = Object.fromEntries(members.map((m) => [m.id, 0]));
  const owed = Object.fromEntries(members.map((m) => [m.id, 0]));

  for (const expense of expenses) {
    for (const p of expense.paidBy) {
      if (paid[p.memberId] === undefined) continue;
      paid[p.memberId] += p.amount;
    }
    for (const s of expense.splitAmong) {
      if (owed[s.memberId] === undefined) continue;
      owed[s.memberId] += s.amount;
    }
  }

  return members.map((m) => ({
    memberId: m.id,
    paid: paid[m.id],
    owed: owed[m.id],
    net: paid[m.id] - owed[m.id], // dương = được nhận lại, âm = còn nợ
  }));
}

// Thuật toán rút gọn giao dịch (debt simplification) kiểu greedy:
// ghép người nợ nhiều nhất với người được nợ nhiều nhất cho tới khi cân bằng.
export function simplifyDebts(balances) {
  const creditors = balances
    .filter((b) => b.net > 0)
    .map((b) => ({ memberId: b.memberId, amount: b.net }))
    .sort((a, b) => b.amount - a.amount);
  const debtors = balances
    .filter((b) => b.net < 0)
    .map((b) => ({ memberId: b.memberId, amount: -b.net }))
    .sort((a, b) => b.amount - a.amount);

  const settlements = [];
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const amount = Math.min(debtor.amount, creditor.amount);

    if (amount > 0) {
      settlements.push({
        fromMemberId: debtor.memberId,
        toMemberId: creditor.memberId,
        amount,
      });
    }

    debtor.amount -= amount;
    creditor.amount -= amount;

    if (debtor.amount === 0) i++;
    if (creditor.amount === 0) j++;
  }

  return settlements;
}

// Giữ trạng thái "paid" của settlement cũ nếu khớp from/to/amount, tránh mất tick khi expenses đổi.
export function mergeSettlementPaidState(newSettlements, oldSettlements) {
  return newSettlements.map((s) => {
    const match = oldSettlements.find(
      (old) =>
        old.fromMemberId === s.fromMemberId &&
        old.toMemberId === s.toMemberId &&
        old.amount === s.amount
    );
    return {
      ...s,
      id: match?.id ?? `${s.fromMemberId}_${s.toMemberId}_${s.amount}_${Date.now()}`,
      paid: match?.paid ?? false,
    };
  });
}
