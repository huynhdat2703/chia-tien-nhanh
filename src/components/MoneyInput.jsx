import { formatNumber, parseNumber } from "../utils/formatNumber";

// Input số tiền có format dấu chấm ngăn cách hàng nghìn (VD: 300.000), value/onChange dùng số thuần.
export default function MoneyInput({ value, onChange, placeholder, className }) {
  return (
    <input
      type="text"
      inputMode="numeric"
      value={formatNumber(value)}
      onChange={(e) => onChange(parseNumber(e.target.value))}
      placeholder={placeholder}
      className={className}
    />
  );
}
